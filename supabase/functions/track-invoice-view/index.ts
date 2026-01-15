/**
 * Track Invoice View Edge Function
 * Handles payment link click tracking for read receipts
 *
 * Flow:
 * 1. Client clicks payment link: pay.yourapp.com/[tracking_id]
 * 2. This function logs the "invoice_viewed" activity event
 * 3. Redirects to the actual Stripe payment page
 *
 * URL format: /track-invoice-view?id=[tracking_id]
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceTrackingData {
  invoice_id: string;
  user_id: string;
  client_name: string;
  amount: number;
  stripe_hosted_invoice_url: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("id");

    if (!trackingId) {
      return new Response(
        JSON.stringify({ error: "Missing tracking ID" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up the invoice by tracking ID
    // The tracking_id is stored in the invoice's metadata or is the invoice ID itself
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("id, user_id, client_name, total, stripe_hosted_invoice_url, tracking_id")
      .or(`tracking_id.eq.${trackingId},id.eq.${trackingId}`)
      .single();

    if (invoiceError || !invoice) {
      console.error("Invoice not found:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if we already logged a view today (to avoid duplicate counts)
    const today = new Date().toISOString().split("T")[0];
    const { data: existingView } = await supabase
      .from("activity_events")
      .select("id")
      .eq("invoice_id", invoice.id)
      .eq("type", "invoice_viewed")
      .gte("created_at", `${today}T00:00:00Z`)
      .lt("created_at", `${today}T23:59:59Z`)
      .single();

    // Only log if not already viewed today
    if (!existingView) {
      // Log the "invoice_viewed" activity event
      const { error: activityError } = await supabase
        .from("activity_events")
        .insert({
          user_id: invoice.user_id,
          type: "invoice_viewed",
          invoice_id: invoice.id,
          client_name: invoice.client_name,
          amount: invoice.total,
          metadata: {
            viewed_at: new Date().toISOString(),
            user_agent: req.headers.get("user-agent"),
            referrer: req.headers.get("referer"),
          },
        });

      if (activityError) {
        console.error("Error logging activity:", activityError);
        // Don't fail the redirect if logging fails
      } else {
        console.log(`Invoice ${invoice.id} viewed by client`);
      }
    }

    // Redirect to Stripe payment page
    const redirectUrl = invoice.stripe_hosted_invoice_url;

    if (!redirectUrl) {
      // If no Stripe URL, show an error page or redirect to a fallback
      return new Response(
        `<html>
          <head><title>Payment Link</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1>Payment link not available</h1>
            <p>Please contact the business for payment options.</p>
          </body>
        </html>`,
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/html" },
        }
      );
    }

    // Redirect to Stripe
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: redirectUrl,
      },
    });
  } catch (error) {
    console.error("Error in track-invoice-view:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
