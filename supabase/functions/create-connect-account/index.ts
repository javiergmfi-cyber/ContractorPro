/**
 * Edge Function: create-connect-account
 * Creates Stripe Connect onboarding link for contractors
 * Per architecture-spec.md Section 4.2
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.4.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY");
if (!STRIPE_KEY) {
  console.error("STRIPE_SECRET_KEY is not set!");
}

const stripe = new Stripe(STRIPE_KEY || "");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header present:", !!authHeader);

    if (!authHeader) {
      return new Response(
        JSON.stringify({ code: 401, message: "Missing authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const jwt = authHeader.replace("Bearer ", "");
    console.log("JWT token length:", jwt.length);
    console.log("JWT token preview:", jwt.substring(0, 50));

    // Create service role client and verify the JWT
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log("Supabase client created");

    const { data, error: userError } = await supabase.auth.getUser(jwt);
    console.log("getUser called, error:", userError, "user:", data?.user?.id);

    if (userError) {
      console.error("JWT verification error details:", JSON.stringify(userError));
      return new Response(
        JSON.stringify({
          code: 401,
          message: "Invalid JWT",
          error: userError.message,
          details: JSON.stringify(userError)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    if (!data.user) {
      console.error("No user in response");
      return new Response(
        JSON.stringify({ code: 401, message: "Invalid JWT - no user found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const user = data.user;
    console.log("Authenticated user:", user.id);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile error:", profileError);
      return new Response(
        JSON.stringify({ code: 404, message: "Profile not found", error: profileError?.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    let stripeAccountId = profile.stripe_account_id;
    console.log("Current Stripe account ID:", stripeAccountId);

    // Create Stripe Connect account if doesn't exist
    if (!stripeAccountId) {
      console.log("Creating new Stripe Connect account...");
      const account = await stripe.accounts.create({
        type: "standard",
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeAccountId = account.id;
      console.log("Created Stripe account:", stripeAccountId);

      // Save account ID to profile with service role client
      const { data: updateData, error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", user.id)
        .select();

      if (updateError) {
        console.error("Error saving Stripe account ID:", updateError);
        return new Response(
          JSON.stringify({ code: 500, message: "Failed to save Stripe account", error: updateError.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      console.log("Successfully saved Stripe account ID to profile:", JSON.stringify(updateData));
    }

    // Fetch current account status and update profile
    try {
      console.log("Fetching Stripe account status for:", stripeAccountId);
      const account = await stripe.accounts.retrieve(stripeAccountId);
      console.log("Stripe account status:", {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      });

      // Update charges_enabled and payouts_enabled in profile
      const { error: statusUpdateError } = await supabase
        .from("profiles")
        .update({
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
        })
        .eq("id", user.id);

      if (statusUpdateError) {
        console.error("Error updating account status:", statusUpdateError);
      } else {
        console.log("Successfully updated account status in profile");
      }
    } catch (accountError) {
      console.error("Error fetching Stripe account status:", accountError);
      // Don't fail the request - account might not be fully set up yet
    }

    // Parse request body for return URLs
    const { return_url, refresh_url } = await req.json();

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refresh_url || "contractorpro://stripe/refresh",
      return_url: return_url || "contractorpro://stripe/return",
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({
        url: accountLink.url,
        account_id: stripeAccountId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating connect account:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error",
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
