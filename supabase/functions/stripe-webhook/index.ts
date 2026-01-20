/**
 * Edge Function: stripe-webhook
 * Handles Stripe webhook events for payment reconciliation
 *
 * Phase 5 Safety Features:
 * - 5.1 Idempotency via payments table (prevents double-counting)
 * - 5.2 Atomic invoice updates via process_payment() function
 * - 5.3 Amount validation and clamping
 * - 5.5 Handles full payment even when deposit exists
 *
 * Payment Types:
 * - deposit → status=deposit_paid, amount_paid += deposit_amount
 * - balance → status=paid (if remaining = 0)
 * - full → status=paid
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
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // =========================================================================
    // 5.1 IDEMPOTENCY CHECK - Prevent duplicate processing
    // Check BOTH webhook_events (legacy) AND payments table
    // =========================================================================
    const { data: existingWebhookEvent } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("id", event.id)
      .single();

    if (existingWebhookEvent) {
      console.log(`Event ${event.id} already processed (webhook_events), skipping`);
      return new Response(JSON.stringify({ received: true, skipped: true }), { status: 200 });
    }

    // Log to webhook_events for backwards compatibility
    await supabase.from("webhook_events").insert({
      id: event.id,
      event_type: event.type,
      payload: event.data,
    });

    // Handle specific events
    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentSuccess(supabase, event, event.data.object as Stripe.PaymentIntent);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          await handleCheckoutSuccess(supabase, event, session);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        await handlePaymentFailed(supabase, event, event.data.object as Stripe.PaymentIntent);
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await supabase
          .from("profiles")
          .update({
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
          })
          .eq("stripe_account_id", account.id);
        console.log(`Account ${account.id} updated`);
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

/**
 * Handle successful payment (PaymentIntent)
 */
async function handlePaymentSuccess(
  supabase: any,
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("PaymentIntent succeeded:", paymentIntent.id);

  const invoiceId = paymentIntent.metadata?.supabase_invoice_id;
  const userId = paymentIntent.metadata?.supabase_user_id;
  const paymentType = paymentIntent.metadata?.payment_type || "full";
  const paymentAmount = paymentIntent.amount;

  if (!invoiceId) {
    console.log("No invoice ID in metadata, skipping");
    return;
  }

  // =========================================================================
  // 5.1 IDEMPOTENCY - Check if this payment was already recorded
  // =========================================================================
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_event_id", event.id)
    .single();

  if (existingPayment) {
    console.log(`Payment for event ${event.id} already recorded, skipping`);
    return;
  }

  // =========================================================================
  // 5.3 VALIDATION - Verify payment amount is valid
  // =========================================================================
  if (paymentAmount <= 0) {
    console.error(`Invalid payment amount: ${paymentAmount}`);
    await logSuspiciousActivity(supabase, invoiceId, userId, "invalid_amount", { paymentAmount });
    return;
  }

  // Get invoice to validate
  const { data: invoice } = await supabase
    .from("invoices")
    .select("total, amount_paid, status, user_id")
    .eq("id", invoiceId)
    .single();

  if (!invoice) {
    console.error(`Invoice ${invoiceId} not found`);
    return;
  }

  const remainingBefore = invoice.total - (invoice.amount_paid || 0);

  // 5.3 Validate payment doesn't exceed remaining (with small tolerance for rounding)
  const tolerance = 100; // $1 tolerance for rounding issues
  if (paymentAmount > remainingBefore + tolerance) {
    console.warn(`Payment ${paymentAmount} exceeds remaining ${remainingBefore}, will be clamped`);
    await logSuspiciousActivity(supabase, invoiceId, userId, "overpayment_attempt", {
      paymentAmount,
      remainingBefore,
    });
  }

  // =========================================================================
  // 5.2 ATOMIC UPDATE - Use database function for race-safe update
  // =========================================================================
  const { data: updateResult, error: updateError } = await supabase.rpc("process_payment", {
    p_invoice_id: invoiceId,
    p_amount: paymentAmount,
    p_payment_type: paymentType,
    p_stripe_event_id: event.id,
  });

  if (updateError) {
    console.error("Error processing payment:", updateError);
    // Fall back to manual update if RPC fails
    await fallbackPaymentUpdate(supabase, invoiceId, paymentAmount, paymentType);
  } else {
    console.log("Payment processed:", updateResult);
  }

  // =========================================================================
  // 5.1 RECORD PAYMENT - Insert into payments table for idempotency
  // =========================================================================
  await supabase.from("payments").insert({
    stripe_event_id: event.id,
    stripe_payment_intent_id: paymentIntent.id,
    invoice_id: invoiceId,
    user_id: invoice.user_id,
    payment_type: paymentType,
    amount: paymentAmount,
    currency: paymentIntent.currency.toUpperCase(),
    status: "succeeded",
    metadata: {
      stripe_status: paymentIntent.status,
      payment_method: paymentIntent.payment_method_types?.[0],
    },
  });

  // Log activity event
  const activityType = paymentType === "deposit" ? "deposit_received" : "payment_received";
  const { data: invoiceForActivity } = await supabase
    .from("invoices")
    .select("client_name, total, amount_paid")
    .eq("id", invoiceId)
    .single();

  if (invoiceForActivity) {
    await supabase.from("activity_events").insert({
      user_id: invoice.user_id,
      type: activityType,
      invoice_id: invoiceId,
      client_name: invoiceForActivity.client_name,
      amount: paymentAmount,
      metadata: {
        payment_intent_id: paymentIntent.id,
        payment_type: paymentType,
        remaining_balance: invoiceForActivity.total - (invoiceForActivity.amount_paid || 0),
      },
    });
  }

  console.log(`Payment recorded: ${paymentType} of ${paymentAmount} for invoice ${invoiceId}`);

  // =========================================================================
  // LIVING DOCUMENT AUTO-CONVERT LOGIC (Per HYBRID_SPEC.md)
  // =========================================================================
  const { data: updatedInvoice } = await supabase
    .from("invoices")
    .select("total, amount_paid, status, client_name, client_email, user_id")
    .eq("id", invoiceId)
    .single();

  if (updatedInvoice) {
    const remainingBalance = updatedInvoice.total - (updatedInvoice.amount_paid || 0);

    if (remainingBalance > 0 && paymentType === "deposit") {
      // Deposit paid but balance remaining → "Work Starting" notification
      console.log(`Invoice ${invoiceId} deposit paid, work starting. Remaining: ${remainingBalance}`);
      await supabase.from("activity_events").insert({
        user_id: updatedInvoice.user_id,
        type: "work_starting",
        invoice_id: invoiceId,
        client_name: updatedInvoice.client_name,
        amount: paymentAmount,
        metadata: {
          remaining_balance: remainingBalance,
          client_email: updatedInvoice.client_email,
          trigger: "deposit_paid",
        },
      });
      // TODO: Send "Work Starting" email to contractor and client
    } else if (remainingBalance <= 0) {
      // Fully paid → Trigger Instant Reputation Loop
      console.log(`Invoice ${invoiceId} fully paid. Triggering reputation loop.`);
      await supabase.from("activity_events").insert({
        user_id: updatedInvoice.user_id,
        type: "reputation_loop_trigger",
        invoice_id: invoiceId,
        client_name: updatedInvoice.client_name,
        amount: updatedInvoice.total,
        metadata: {
          client_email: updatedInvoice.client_email,
          trigger: "fully_paid",
        },
      });
      // TODO: Phase 4 - Send review prompt to client
    }
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSuccess(
  supabase: any,
  event: Stripe.Event,
  session: Stripe.Checkout.Session
) {
  console.log("Checkout session completed:", session.id);

  const invoiceId = session.metadata?.supabase_invoice_id;
  const paymentType = session.metadata?.payment_type || "full";
  const paymentAmount = session.amount_total || 0;

  if (!invoiceId) {
    console.log("No invoice ID in session metadata, skipping");
    return;
  }

  // 5.1 IDEMPOTENCY - Check if already processed
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_event_id", event.id)
    .single();

  if (existingPayment) {
    console.log(`Checkout event ${event.id} already recorded, skipping`);
    return;
  }

  // Get invoice
  const { data: invoice } = await supabase
    .from("invoices")
    .select("total, amount_paid, status, user_id, client_name")
    .eq("id", invoiceId)
    .single();

  if (!invoice) {
    console.error(`Invoice ${invoiceId} not found`);
    return;
  }

  // 5.2 ATOMIC UPDATE
  const { data: updateResult, error: updateError } = await supabase.rpc("process_payment", {
    p_invoice_id: invoiceId,
    p_amount: paymentAmount,
    p_payment_type: paymentType,
    p_stripe_event_id: event.id,
  });

  if (updateError) {
    console.error("Error processing checkout payment:", updateError);
    await fallbackPaymentUpdate(supabase, invoiceId, paymentAmount, paymentType);
  } else {
    console.log("Checkout payment processed:", updateResult);
  }

  // 5.1 Record payment
  await supabase.from("payments").insert({
    stripe_event_id: event.id,
    stripe_checkout_session_id: session.id,
    invoice_id: invoiceId,
    user_id: invoice.user_id,
    payment_type: paymentType,
    amount: paymentAmount,
    currency: session.currency?.toUpperCase() || "USD",
    status: "succeeded",
    metadata: {
      checkout_session_id: session.id,
      payment_status: session.payment_status,
    },
  });

  // Log activity
  const activityType = paymentType === "deposit" ? "deposit_received" : "payment_received";
  await supabase.from("activity_events").insert({
    user_id: invoice.user_id,
    type: activityType,
    invoice_id: invoiceId,
    client_name: invoice.client_name,
    amount: paymentAmount,
    metadata: {
      checkout_session_id: session.id,
      payment_type: paymentType,
    },
  });

  console.log(`Checkout payment recorded: ${paymentType} of ${paymentAmount}`);

  // LIVING DOCUMENT AUTO-CONVERT (same as PaymentIntent)
  const { data: updatedInvoice } = await supabase
    .from("invoices")
    .select("total, amount_paid, client_name, client_email, user_id")
    .eq("id", invoiceId)
    .single();

  if (updatedInvoice) {
    const remainingBalance = updatedInvoice.total - (updatedInvoice.amount_paid || 0);

    if (remainingBalance > 0 && paymentType === "deposit") {
      await supabase.from("activity_events").insert({
        user_id: updatedInvoice.user_id,
        type: "work_starting",
        invoice_id: invoiceId,
        client_name: updatedInvoice.client_name,
        amount: paymentAmount,
        metadata: {
          remaining_balance: remainingBalance,
          client_email: updatedInvoice.client_email,
          trigger: "deposit_paid",
        },
      });
    } else if (remainingBalance <= 0) {
      await supabase.from("activity_events").insert({
        user_id: updatedInvoice.user_id,
        type: "reputation_loop_trigger",
        invoice_id: invoiceId,
        client_name: updatedInvoice.client_name,
        amount: updatedInvoice.total,
        metadata: {
          client_email: updatedInvoice.client_email,
          trigger: "fully_paid",
        },
      });
    }
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(
  supabase: any,
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("PaymentIntent failed:", paymentIntent.id);

  const invoiceId = paymentIntent.metadata?.supabase_invoice_id;
  const paymentType = paymentIntent.metadata?.payment_type;

  if (!invoiceId) return;

  const { data: invoice } = await supabase
    .from("invoices")
    .select("user_id, client_name")
    .eq("id", invoiceId)
    .single();

  if (invoice) {
    await supabase.from("activity_events").insert({
      user_id: invoice.user_id,
      type: "payment_failed",
      invoice_id: invoiceId,
      client_name: invoice.client_name,
      amount: paymentIntent.amount,
      metadata: {
        payment_intent_id: paymentIntent.id,
        payment_type: paymentType,
        failure_message: paymentIntent.last_payment_error?.message,
        failure_code: paymentIntent.last_payment_error?.code,
      },
    });
  }

  console.log(`Payment failed for invoice ${invoiceId}: ${paymentIntent.last_payment_error?.message}`);
}

/**
 * Fallback manual update if RPC fails
 */
async function fallbackPaymentUpdate(
  supabase: any,
  invoiceId: string,
  paymentAmount: number,
  paymentType: string
) {
  const { data: invoice } = await supabase
    .from("invoices")
    .select("total, amount_paid, deposit_enabled")
    .eq("id", invoiceId)
    .single();

  if (!invoice) return;

  // 5.3 Clamp to total
  const newAmountPaid = Math.min(invoice.total, (invoice.amount_paid || 0) + paymentAmount);
  const remainingBalance = invoice.total - newAmountPaid;

  let newStatus: string;
  const updateData: Record<string, unknown> = { amount_paid: newAmountPaid };

  if (remainingBalance === 0) {
    newStatus = "paid";
    updateData.status = newStatus;
    updateData.paid_at = new Date().toISOString();
  } else if (paymentType === "deposit" && invoice.deposit_enabled) {
    newStatus = "deposit_paid";
    updateData.status = newStatus;
    updateData.deposit_paid_at = new Date().toISOString();
  }

  updateData.approved_at = new Date().toISOString();

  await supabase.from("invoices").update(updateData).eq("id", invoiceId);
  console.log(`Fallback update: invoice ${invoiceId} → amount_paid=${newAmountPaid}`);
}

/**
 * Log suspicious activity for review
 */
async function logSuspiciousActivity(
  supabase: any,
  invoiceId: string,
  userId: string,
  type: string,
  metadata: Record<string, unknown>
) {
  await supabase.from("activity_events").insert({
    user_id: userId,
    type: `suspicious_${type}`,
    invoice_id: invoiceId,
    metadata: {
      ...metadata,
      flagged_at: new Date().toISOString(),
    },
  });
  console.warn(`Suspicious activity flagged: ${type}`, metadata);
}
