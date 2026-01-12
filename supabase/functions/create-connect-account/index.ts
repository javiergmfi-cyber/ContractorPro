/**
 * Edge Function: create-connect-account
 * Creates Stripe Connect onboarding link for contractors
 * Per architecture-spec.md Section 4.2
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Invalid token");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    let stripeAccountId = profile.stripe_account_id;

    // Create Stripe Connect account if doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeAccountId = account.id;

      // Save account ID to profile
      await supabase
        .from("profiles")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", user.id);
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

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
