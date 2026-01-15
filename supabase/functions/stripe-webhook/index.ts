/**
 * Edge Function: stripe-webhook
 * Handles Stripe webhook events for payment reconciliation
 * Per architecture-spec.md Section 4.4
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.5.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check for idempotency - prevent duplicate processing
    // Per architecture-spec.md Section 4.4
    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("id", event.id)
      .single();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // Log event for idempotency
    await supabase.from("webhook_events").insert({
      id: event.id,
      event_type: event.type,
      payload: event.data,
    });

    // Handle specific events
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("PaymentIntent succeeded:", paymentIntent.id);

        // Extract invoice ID from metadata
        const invoiceId = paymentIntent.metadata?.supabase_invoice_id;

        if (invoiceId) {
          // Get invoice details for activity tracking
          const { data: invoice } = await supabase
            .from("invoices")
            .select("id, user_id, client_name, total")
            .eq("id", invoiceId)
            .single();

          // Update invoice status to paid
          const { error } = await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
            })
            .eq("id", invoiceId);

          if (error) {
            console.error("Error updating invoice:", error);
          } else {
            console.log(`Invoice ${invoiceId} marked as paid`);

            // Log payment_received activity event
            if (invoice) {
              await supabase.from("activity_events").insert({
                user_id: invoice.user_id,
                type: "payment_received",
                invoice_id: invoice.id,
                client_name: invoice.client_name,
                amount: invoice.total,
                metadata: {
                  payment_intent_id: paymentIntent.id,
                  payment_method: paymentIntent.payment_method_types?.[0] || "card",
                },
              });
              console.log(`Activity event logged for payment from ${invoice.client_name}`);
            }
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("PaymentIntent failed:", paymentIntent.id);

        const invoiceId = paymentIntent.metadata?.supabase_invoice_id;
        if (invoiceId) {
          // Could log failed payment attempt
          console.log(`Payment failed for invoice ${invoiceId}`);
        }
        break;
      }

      case "account.updated": {
        // Connected account was updated
        const account = event.data.object as Stripe.Account;
        console.log("Account updated:", account.id);

        // Update profile with account status
        const { error } = await supabase
          .from("profiles")
          .update({
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
          })
          .eq("stripe_account_id", account.id);

        if (error) {
          console.error("Error updating profile:", error);
        }
        break;
      }

      case "checkout.session.completed": {
        // Payment via Payment Link completed
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);

        const invoiceId = session.metadata?.supabase_invoice_id;

        if (invoiceId) {
          // Get invoice details for activity tracking
          const { data: invoice } = await supabase
            .from("invoices")
            .select("id, user_id, client_name, total")
            .eq("id", invoiceId)
            .single();

          const { error } = await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
            })
            .eq("id", invoiceId);

          if (error) {
            console.error("Error updating invoice:", error);
          } else {
            console.log(`Invoice ${invoiceId} marked as paid via checkout`);

            // Log payment_received activity event
            if (invoice) {
              await supabase.from("activity_events").insert({
                user_id: invoice.user_id,
                type: "payment_received",
                invoice_id: invoice.id,
                client_name: invoice.client_name,
                amount: invoice.total,
                metadata: {
                  checkout_session_id: session.id,
                  payment_status: session.payment_status,
                },
              });
              console.log(`Activity event logged for checkout payment from ${invoice.client_name}`);
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 500 });
  }
});
