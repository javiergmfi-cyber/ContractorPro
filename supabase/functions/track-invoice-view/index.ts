/**
 * Customer Invoice/Payment Page Edge Function
 *
 * ONE LINK / TWO PAY BUTTONS System
 * Same URL handles all 3 states:
 * - A) No deposit: "Pay $Total"
 * - B) Deposit enabled, not paid: "Approve & Pay Deposit" + "Approve Only"
 * - C) Deposit paid: "Pay Remaining $Y"
 *
 * URL format: /track-invoice-view?id=[tracking_id]
 *
 * Handles:
 * - GET: Renders payment page (logs view first time)
 * - POST action=approve_only: Sets approved_at, no payment
 * - POST action=pay_deposit: Creates Stripe session for deposit
 * - POST action=pay_balance: Creates Stripe session for remaining balance
 * - POST action=pay_full: Creates Stripe session for full amount
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Platform fee: 0.5% of each transaction goes to platform
// Implemented via Stripe Connect application_fee_amount
// - Customer sees only the total (fee not itemized)
// - Contractor receives payment minus Stripe fees minus platform fee
// - Disclosed in Terms of Service
const PLATFORM_FEE_PERCENT = 0.005;

interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  total: number;
  currency: string;
  status: string;
  deposit_enabled: boolean;
  deposit_amount: number | null;
  amount_paid: number;
  approved_at: string | null;
  deposit_paid_at: string | null;
  tracking_id: string;
  stripe_hosted_invoice_url: string | null;
}

interface Profile {
  stripe_account_id: string;
  charges_enabled: boolean;
  business_name: string | null;
  logo_url: string | null;
}

// Helper: Calculate remaining balance
function getRemainingBalance(invoice: Invoice): number {
  return Math.max(0, invoice.total - (invoice.amount_paid || 0));
}

// Helper: Format currency
function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

// Helper: Determine payment state
function getPaymentState(invoice: Invoice): "no_deposit" | "deposit_pending" | "deposit_paid" | "fully_paid" {
  if (invoice.status === "paid" || getRemainingBalance(invoice) === 0) {
    return "fully_paid";
  }

  if (!invoice.deposit_enabled || !invoice.deposit_amount) {
    return "no_deposit";
  }

  // Deposit is enabled
  if (invoice.deposit_paid_at || (invoice.amount_paid || 0) >= invoice.deposit_amount) {
    return "deposit_paid";
  }

  return "deposit_pending";
}

// Render the customer payment page HTML
function renderPaymentPage(invoice: Invoice, profile: Profile, baseUrl: string, message?: string): string {
  const state = getPaymentState(invoice);
  const remainingBalance = getRemainingBalance(invoice);
  const depositAmount = invoice.deposit_amount || 0;
  const businessName = profile.business_name || "Business";

  // Determine what to show based on state
  let heroTitle = "";
  let heroSubtitle = "";
  let primaryButton = "";
  let secondaryButton = "";
  let statusBadge = "";

  switch (state) {
    case "fully_paid":
      heroTitle = "Thank You!";
      heroSubtitle = "This invoice has been paid in full.";
      statusBadge = `<div class="status-badge paid">✓ Paid</div>`;
      break;

    case "no_deposit":
      heroTitle = formatCurrency(invoice.total, invoice.currency);
      heroSubtitle = `Invoice from ${businessName}`;
      primaryButton = `
        <form method="POST" action="${baseUrl}">
          <input type="hidden" name="id" value="${invoice.tracking_id}">
          <input type="hidden" name="action" value="pay_full">
          <button type="submit" class="btn btn-primary">
            Pay ${formatCurrency(invoice.total, invoice.currency)}
          </button>
        </form>
      `;
      break;

    case "deposit_pending":
      heroTitle = formatCurrency(depositAmount, invoice.currency);
      heroSubtitle = `Deposit requested by ${businessName}`;
      statusBadge = `<div class="status-badge pending">Awaiting Approval</div>`;
      primaryButton = `
        <form method="POST" action="${baseUrl}">
          <input type="hidden" name="id" value="${invoice.tracking_id}">
          <input type="hidden" name="action" value="pay_deposit">
          <button type="submit" class="btn btn-primary">
            Approve & Pay Deposit ${formatCurrency(depositAmount, invoice.currency)}
          </button>
        </form>
      `;
      secondaryButton = `
        <form method="POST" action="${baseUrl}" class="secondary-form">
          <input type="hidden" name="id" value="${invoice.tracking_id}">
          <input type="hidden" name="action" value="approve_only">
          <button type="submit" class="btn btn-secondary">
            Approve Only (Pay Later)
          </button>
        </form>
      `;
      break;

    case "deposit_paid":
      heroTitle = formatCurrency(remainingBalance, invoice.currency);
      heroSubtitle = `Balance due to ${businessName}`;
      statusBadge = `
        <div class="status-badge deposit-paid">
          ✓ Deposit Paid ${formatCurrency(invoice.amount_paid, invoice.currency)}
        </div>
      `;
      primaryButton = `
        <form method="POST" action="${baseUrl}">
          <input type="hidden" name="id" value="${invoice.tracking_id}">
          <input type="hidden" name="action" value="pay_balance">
          <button type="submit" class="btn btn-primary">
            Pay Remaining ${formatCurrency(remainingBalance, invoice.currency)}
          </button>
        </form>
      `;
      break;
  }

  // Build line items display (simplified - would need to fetch actual items)
  const totalRow = `
    <div class="total-row">
      <span>Total</span>
      <span class="total-amount">${formatCurrency(invoice.total, invoice.currency)}</span>
    </div>
  `;

  // Payment breakdown for deposit invoices
  let paymentBreakdown = "";
  if (invoice.deposit_enabled && invoice.deposit_amount) {
    const paid = invoice.amount_paid || 0;
    const remaining = getRemainingBalance(invoice);
    paymentBreakdown = `
      <div class="payment-breakdown">
        <div class="breakdown-row">
          <span>Deposit</span>
          <span>${formatCurrency(invoice.deposit_amount, invoice.currency)}</span>
        </div>
        ${paid > 0 ? `
          <div class="breakdown-row paid">
            <span>✓ Paid</span>
            <span>-${formatCurrency(paid, invoice.currency)}</span>
          </div>
        ` : ""}
        <div class="breakdown-row remaining">
          <span>Remaining</span>
          <span>${formatCurrency(remaining, invoice.currency)}</span>
        </div>
      </div>
    `;
  }

  // Success/error message
  const messageHtml = message ? `<div class="message">${message}</div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number} - ${businessName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(180deg, #0A0A0A 0%, #1C1C1E 100%);
      min-height: 100vh;
      color: #FFFFFF;
      padding: 24px;
    }

    .container {
      max-width: 440px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      padding: 32px 0;
    }

    .logo {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: rgba(255,255,255,0.1);
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
    }

    .logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;
    }

    .business-name {
      font-size: 15px;
      font-weight: 500;
      color: rgba(255,255,255,0.6);
      margin-bottom: 8px;
    }

    .invoice-number {
      font-size: 13px;
      color: rgba(255,255,255,0.4);
    }

    .hero {
      text-align: center;
      padding: 40px 0;
    }

    .hero-title {
      font-size: 56px;
      font-weight: 800;
      letter-spacing: -2px;
      margin-bottom: 8px;
    }

    .hero-subtitle {
      font-size: 17px;
      font-weight: 500;
      color: rgba(255,255,255,0.6);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 16px;
    }

    .status-badge.paid {
      background: rgba(52, 199, 89, 0.2);
      color: #34C759;
    }

    .status-badge.pending {
      background: rgba(255, 149, 0, 0.2);
      color: #FF9500;
    }

    .status-badge.deposit-paid {
      background: rgba(52, 199, 89, 0.15);
      color: #34C759;
    }

    .card {
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 16px;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .total-row:last-child {
      border-bottom: none;
    }

    .total-amount {
      font-size: 20px;
      font-weight: 700;
    }

    .payment-breakdown {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      color: rgba(255,255,255,0.6);
    }

    .breakdown-row.paid {
      color: #34C759;
    }

    .breakdown-row.remaining {
      font-weight: 600;
      color: #FFFFFF;
    }

    .actions {
      padding: 24px 0;
    }

    .btn {
      width: 100%;
      padding: 18px 24px;
      border-radius: 14px;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: transform 0.15s, opacity 0.15s;
    }

    .btn:active {
      transform: scale(0.98);
    }

    .btn-primary {
      background: #FFFFFF;
      color: #000000;
    }

    .btn-primary:hover {
      opacity: 0.95;
    }

    .btn-secondary {
      background: transparent;
      color: rgba(255,255,255,0.6);
      border: 1px solid rgba(255,255,255,0.2);
      margin-top: 12px;
    }

    .btn-secondary:hover {
      background: rgba(255,255,255,0.05);
    }

    .secondary-form {
      margin-top: 0;
    }

    .message {
      background: rgba(52, 199, 89, 0.15);
      color: #34C759;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 24px;
      font-weight: 500;
    }

    .footer {
      text-align: center;
      padding: 24px 0;
      color: rgba(255,255,255,0.3);
      font-size: 13px;
    }

    .footer a {
      color: rgba(255,255,255,0.5);
      text-decoration: none;
    }

    .secure-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 16px;
      font-size: 12px;
      color: rgba(255,255,255,0.4);
    }

    @media (max-width: 480px) {
      body {
        padding: 16px;
      }

      .hero-title {
        font-size: 44px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        ${profile.logo_url
          ? `<img src="${profile.logo_url}" alt="${businessName}">`
          : businessName.charAt(0).toUpperCase()
        }
      </div>
      <div class="business-name">${businessName}</div>
      <div class="invoice-number">Invoice ${invoice.invoice_number}</div>
    </div>

    ${messageHtml}

    <div class="hero">
      <div class="hero-title">${heroTitle}</div>
      <div class="hero-subtitle">${heroSubtitle}</div>
      ${statusBadge}
    </div>

    <div class="card">
      <div class="client-info" style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 4px;">Bill To</div>
        <div style="font-weight: 600;">${invoice.client_name}</div>
      </div>
      ${totalRow}
      ${paymentBreakdown}
    </div>

    <div class="actions">
      ${primaryButton}
      ${secondaryButton}
    </div>

    <div class="secure-badge">
      <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
        <path d="M6 0L0 2.5V6.5C0 10.1 2.6 13.4 6 14C9.4 13.4 12 10.1 12 6.5V2.5L6 0Z"/>
      </svg>
      Secured by Stripe
    </div>

    <div class="footer">
      <p>Questions? Contact ${businessName}</p>
      <p style="margin-top: 8px;">Powered by <a href="https://contractorpro.app">ContractorPro</a></p>
    </div>

    <!-- Referral Banner for Contractors -->
    <div class="referral-section">
      <div class="referral-card">
        <div class="referral-emoji">🔨</div>
        <div class="referral-text">
          <div class="referral-title">Are you a contractor?</div>
          <div class="referral-subtitle">Send invoices like this in 60 seconds. Get paid faster.</div>
        </div>
        <a href="https://contractorpro.app/r?ref=payment&src=${invoice.tracking_id}" class="referral-button">
          Try Free
        </a>
      </div>
    </div>
  </div>

  <style>
    .referral-section {
      padding: 0 0 24px 0;
    }
    .referral-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(0, 214, 50, 0.12) 0%, rgba(0, 214, 50, 0.04) 100%);
      border: 1px solid rgba(0, 214, 50, 0.25);
      border-radius: 16px;
    }
    .referral-emoji {
      font-size: 28px;
      flex-shrink: 0;
    }
    .referral-text {
      flex: 1;
    }
    .referral-title {
      font-size: 14px;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 2px;
    }
    .referral-subtitle {
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      line-height: 1.4;
    }
    .referral-button {
      padding: 10px 18px;
      background: #00D632;
      color: #000000;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 10px;
      white-space: nowrap;
      transition: transform 0.15s;
    }
    .referral-button:active {
      transform: scale(0.96);
    }
  </style>
</body>
</html>`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const url = new URL(req.url);
  const baseUrl = `${SUPABASE_URL}/functions/v1/track-invoice-view`;

  try {
    // Get tracking ID from either query params (GET) or form body (POST)
    let trackingId: string | null = null;
    let action: string | null = null;

    if (req.method === "POST") {
      const formData = await req.formData();
      trackingId = formData.get("id") as string;
      action = formData.get("action") as string;
    } else {
      trackingId = url.searchParams.get("id");
    }

    if (!trackingId) {
      return new Response(
        JSON.stringify({ error: "Missing tracking ID" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Look up the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        id, user_id, invoice_number, client_name, client_email,
        total, currency, status,
        deposit_enabled, deposit_amount, amount_paid,
        approved_at, deposit_paid_at, tracking_id,
        stripe_hosted_invoice_url
      `)
      .or(`tracking_id.eq.${trackingId},id.eq.${trackingId}`)
      .single();

    if (invoiceError || !invoice) {
      console.error("Invoice not found:", invoiceError);
      return new Response(
        `<html><body style="font-family: system-ui; padding: 40px; text-align: center;">
          <h1>Invoice not found</h1>
          <p>This invoice may have been deleted or the link is invalid.</p>
        </body></html>`,
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/html" },
        }
      );
    }

    // Get the profile for business info and Stripe account
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id, charges_enabled, business_name, logo_url")
      .eq("id", invoice.user_id)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return new Response(
        `<html><body style="font-family: system-ui; padding: 40px; text-align: center;">
          <h1>Error loading invoice</h1>
          <p>Please contact the business directly.</p>
        </body></html>`,
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/html" },
        }
      );
    }

    // Log view event (only for GET requests, once per day)
    if (req.method === "GET") {
      const today = new Date().toISOString().split("T")[0];
      const { data: existingView } = await supabase
        .from("activity_events")
        .select("id")
        .eq("invoice_id", invoice.id)
        .eq("type", "invoice_viewed")
        .gte("created_at", `${today}T00:00:00Z`)
        .lt("created_at", `${today}T23:59:59Z`)
        .single();

      if (!existingView) {
        await supabase.from("activity_events").insert({
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

        // Update viewed_at on invoice if not set
        await supabase
          .from("invoices")
          .update({ viewed_at: new Date().toISOString() })
          .eq("id", invoice.id)
          .is("viewed_at", null);
      }
    }

    // Handle POST actions
    if (req.method === "POST" && action) {
      // Validate Stripe is connected
      if (!profile.stripe_account_id || !profile.charges_enabled) {
        return new Response(
          renderPaymentPage(invoice as Invoice, profile as Profile, baseUrl,
            "Payment processing is not available. Please contact the business."),
          { headers: { ...corsHeaders, "Content-Type": "text/html" } }
        );
      }

      switch (action) {
        case "approve_only": {
          // Just set approved_at, no payment
          await supabase
            .from("invoices")
            .update({ approved_at: new Date().toISOString() })
            .eq("id", invoice.id);

          // Log activity
          await supabase.from("activity_events").insert({
            user_id: invoice.user_id,
            type: "invoice_approved",
            invoice_id: invoice.id,
            client_name: invoice.client_name,
            amount: invoice.total,
            metadata: { approved_without_payment: true },
          });

          // Re-fetch and render with success message
          const { data: updatedInvoice } = await supabase
            .from("invoices")
            .select("*")
            .eq("id", invoice.id)
            .single();

          return new Response(
            renderPaymentPage(updatedInvoice as Invoice, profile as Profile, baseUrl,
              "Invoice approved! You can pay the deposit anytime using this link."),
            { headers: { ...corsHeaders, "Content-Type": "text/html" } }
          );
        }

        case "pay_deposit":
        case "pay_balance":
        case "pay_full": {
          // Determine amount to charge
          let chargeAmount: number;
          let paymentType: string;
          let description: string;

          if (action === "pay_deposit") {
            chargeAmount = invoice.deposit_amount || invoice.total;
            paymentType = "deposit";
            description = `Deposit for Invoice ${invoice.invoice_number}`;
          } else if (action === "pay_balance") {
            chargeAmount = getRemainingBalance(invoice as Invoice);
            paymentType = "balance";
            description = `Balance for Invoice ${invoice.invoice_number}`;
          } else {
            chargeAmount = invoice.total;
            paymentType = "full";
            description = `Invoice ${invoice.invoice_number}`;
          }

          // 5.4 PREVENT $0 PAYMENT SESSIONS
          if (chargeAmount <= 0) {
            // Re-fetch to get latest state and show paid message
            const { data: latestInvoice } = await supabase
              .from("invoices")
              .select("*")
              .eq("id", invoice.id)
              .single();

            return new Response(
              renderPaymentPage(
                (latestInvoice || invoice) as Invoice,
                profile as Profile,
                baseUrl,
                "This invoice has already been paid in full. Thank you!"
              ),
              { headers: { ...corsHeaders, "Content-Type": "text/html" } }
            );
          }

          // Create Stripe Checkout Session
          const platformFee = Math.round(chargeAmount * PLATFORM_FEE_PERCENT);

          const session = await stripe.checkout.sessions.create(
            {
              mode: "payment",
              line_items: [
                {
                  price_data: {
                    currency: invoice.currency.toLowerCase(),
                    product_data: {
                      name: description,
                      description: `Payment to ${profile.business_name || "Contractor"}`,
                    },
                    unit_amount: chargeAmount,
                  },
                  quantity: 1,
                },
              ],
              payment_intent_data: {
                application_fee_amount: platformFee,
                metadata: {
                  supabase_invoice_id: invoice.id,
                  supabase_user_id: invoice.user_id,
                  payment_type: paymentType,
                  invoice_number: invoice.invoice_number,
                },
              },
              metadata: {
                supabase_invoice_id: invoice.id,
                supabase_user_id: invoice.user_id,
                payment_type: paymentType,
              },
              success_url: `${baseUrl}?id=${invoice.tracking_id}&success=true&type=${paymentType}`,
              cancel_url: `${baseUrl}?id=${invoice.tracking_id}&canceled=true`,
              customer_email: invoice.client_email || undefined,
            },
            { stripeAccount: profile.stripe_account_id }
          );

          // Store the appropriate payment intent ID
          const updateData: Record<string, string> = {};
          if (paymentType === "deposit") {
            updateData.deposit_payment_intent_id = session.payment_intent as string;
          } else {
            updateData.balance_payment_intent_id = session.payment_intent as string;
          }

          await supabase
            .from("invoices")
            .update(updateData)
            .eq("id", invoice.id);

          // Redirect to Stripe Checkout
          return new Response(null, {
            status: 302,
            headers: {
              ...corsHeaders,
              Location: session.url!,
            },
          });
        }
      }
    }

    // Check for success/cancel query params (returning from Stripe)
    const success = url.searchParams.get("success");
    const canceled = url.searchParams.get("canceled");
    const paymentType = url.searchParams.get("type");

    let message = "";
    if (success === "true") {
      if (paymentType === "deposit") {
        message = "Deposit paid successfully! Thank you.";
      } else {
        message = "Payment successful! Thank you.";
      }
    } else if (canceled === "true") {
      message = "Payment was canceled. You can try again below.";
    }

    // Re-fetch invoice to get latest state (after potential webhook updates)
    const { data: latestInvoice } = await supabase
      .from("invoices")
      .select(`
        id, user_id, invoice_number, client_name, client_email,
        total, currency, status,
        deposit_enabled, deposit_amount, amount_paid,
        approved_at, deposit_paid_at, tracking_id,
        stripe_hosted_invoice_url
      `)
      .eq("id", invoice.id)
      .single();

    // Render the payment page
    return new Response(
      renderPaymentPage(
        (latestInvoice || invoice) as Invoice,
        profile as Profile,
        baseUrl,
        message
      ),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/html" },
      }
    );

  } catch (error) {
    console.error("Error in customer payment page:", error);
    return new Response(
      `<html><body style="font-family: system-ui; padding: 40px; text-align: center;">
        <h1>Something went wrong</h1>
        <p>Please try again or contact the business.</p>
      </body></html>`,
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/html" },
      }
    );
  }
});
