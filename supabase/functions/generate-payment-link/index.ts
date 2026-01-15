/**
 * Edge Function: generate-payment-link
 * Creates Stripe Payment Intent for invoice
 * Per architecture-spec.md Section 4.3 (Direct Charges)
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

// Platform fee percentage (1%)
const PLATFORM_FEE_PERCENT = 0.01;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Invalid token");
    }

    // Get request body
    const { invoice_id } = await req.json();

    if (!invoice_id) {
      throw new Error("invoice_id is required");
    }

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("Invoice not found");
    }

    // Get profile with Stripe account
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id, charges_enabled, business_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    if (!profile.stripe_account_id || !profile.charges_enabled) {
      throw new Error("Stripe account not connected or charges not enabled");
    }

    // Calculate platform fee
    const platformFee = Math.round(invoice.total * PLATFORM_FEE_PERCENT);

    // Create Payment Intent with Direct Charges
    // Per architecture-spec.md Section 4.3
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: invoice.total, // Already in cents
        currency: invoice.currency.toLowerCase(),
        application_fee_amount: platformFee,
        metadata: {
          supabase_invoice_id: invoice.id,
          supabase_user_id: user.id,
          invoice_number: invoice.invoice_number,
        },
        description: `Invoice ${invoice.invoice_number} from ${profile.business_name || "Contractor"}`,
      },
      {
        stripeAccount: profile.stripe_account_id, // Direct charge
      }
    );

    // Create a Payment Link for easy sharing
    // First, create a product and price
    const product = await stripe.products.create(
      {
        name: `Invoice ${invoice.invoice_number}`,
        description: `Payment for services - ${invoice.client_name}`,
      },
      { stripeAccount: profile.stripe_account_id }
    );

    const price = await stripe.prices.create(
      {
        unit_amount: invoice.total,
        currency: invoice.currency.toLowerCase(),
        product: product.id,
      },
      { stripeAccount: profile.stripe_account_id }
    );

    const paymentLink = await stripe.paymentLinks.create(
      {
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: {
          supabase_invoice_id: invoice.id,
          supabase_user_id: user.id,
        },
        application_fee_amount: platformFee,
      },
      { stripeAccount: profile.stripe_account_id }
    );

    // Update invoice with Stripe info
    const { data: updatedInvoice } = await supabase
      .from("invoices")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_hosted_invoice_url: paymentLink.url,
      })
      .eq("id", invoice_id)
      .select("tracking_id")
      .single();

    // Generate tracking URL for read receipts
    // This URL logs the view before redirecting to Stripe
    const trackingUrl = updatedInvoice?.tracking_id
      ? `${SUPABASE_URL}/functions/v1/track-invoice-view?id=${updatedInvoice.tracking_id}`
      : paymentLink.url;

    return new Response(
      JSON.stringify({
        payment_intent_id: paymentIntent.id,
        payment_link_url: trackingUrl, // Use tracking URL for read receipts
        direct_stripe_url: paymentLink.url, // Original Stripe URL if needed
        client_secret: paymentIntent.client_secret,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating payment link:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
