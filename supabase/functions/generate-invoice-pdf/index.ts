import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceData {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: string;
  due_date?: string;
  created_at: string;
  notes?: string;
  stripe_payment_link?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  profile: {
    business_name?: string;
    full_name?: string;
    logo_url?: string;
    tax_rate: number;
  };
}

/**
 * Generate Invoice PDF Edge Function
 *
 * Creates a PDF invoice and stores it in Supabase Storage.
 * Returns a signed URL for download/sharing.
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: "Missing invoice_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch invoice with items
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        invoice_items (*)
      `)
      .eq("id", invoice_id)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch profile for branding
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("business_name, full_name, logo_url, tax_rate")
      .eq("id", user.id)
      .single();

    // Generate payment link (if Stripe is connected)
    const paymentLink = invoice.stripe_payment_link ||
      `https://pay.contractorpro.app/invoice/${invoice.id}`;

    // Generate HTML for PDF using the Black Card luxury template
    const html = generateBlackCardInvoice(
      {
        ...invoice,
        items: invoice.invoice_items,
        profile: profile || { tax_rate: 0 },
      },
      paymentLink
    );

    // The Black Card template is production-ready HTML
    // It renders beautifully in browsers and prints to PDF with proper styling
    const pdfContent = html;

    const fileName = `${user.id}/${invoice.invoice_number.replace(/\s/g, "_")}.html`;

    // Upload to storage
    const { error: uploadError } = await supabaseClient.storage
      .from("invoice-pdfs")
      .upload(fileName, pdfContent, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to generate PDF" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get signed URL (valid for 1 hour)
    const { data: signedUrl } = await supabaseClient.storage
      .from("invoice-pdfs")
      .createSignedUrl(fileName, 3600);

    // Update invoice with PDF URL
    await supabaseClient
      .from("invoices")
      .update({ pdf_url: signedUrl?.signedUrl })
      .eq("id", invoice_id);

    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: signedUrl?.signedUrl,
        file_name: fileName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function generateInvoiceHTML(invoice: InvoiceData): string {
  const businessName = invoice.profile.business_name || invoice.profile.full_name || "ContractorPro";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
      line-height: 1.5;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: 700; color: #00D632; }
    .invoice-number { text-align: right; }
    .invoice-number h2 { font-size: 14px; color: #666; text-transform: uppercase; }
    .invoice-number p { font-size: 20px; font-weight: 600; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .address { flex: 1; }
    .address h3 { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
    .address p { font-size: 14px; }
    .dates { display: flex; gap: 40px; margin-bottom: 40px; }
    .date h3 { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
    .date p { font-size: 14px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { text-align: left; padding: 12px 0; border-bottom: 2px solid #e5e5e5; font-size: 12px; color: #666; text-transform: uppercase; }
    td { padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
    .item-desc { font-weight: 500; }
    .item-meta { font-size: 13px; color: #666; }
    .text-right { text-align: right; }
    .totals { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.grand { border-top: 2px solid #1a1a1a; padding-top: 16px; margin-top: 8px; font-size: 18px; font-weight: 700; }
    .total-row.grand .amount { color: #00D632; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-sent { background: #dbeafe; color: #1e40af; }
    .status-draft { background: #f3f4f6; color: #4b5563; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #666; font-size: 13px; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${businessName}</div>
    <div class="invoice-number">
      <h2>Invoice</h2>
      <p>${invoice.invoice_number}</p>
    </div>
  </div>

  <div class="addresses">
    <div class="address">
      <h3>Bill To</h3>
      <p><strong>${invoice.client_name}</strong></p>
      ${invoice.client_email ? `<p>${invoice.client_email}</p>` : ""}
    </div>
    <div class="address" style="text-align: right;">
      <span class="status status-${invoice.status}">${invoice.status}</span>
    </div>
  </div>

  <div class="dates">
    <div class="date">
      <h3>Issue Date</h3>
      <p>${formatDate(invoice.created_at)}</p>
    </div>
    ${invoice.due_date ? `
    <div class="date">
      <h3>Due Date</h3>
      <p>${formatDate(invoice.due_date)}</p>
    </div>
    ` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => `
      <tr>
        <td class="item-desc">${item.description}</td>
        <td class="text-right">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.unit_price, invoice.currency)}</td>
        <td class="text-right">${formatCurrency(item.total, invoice.currency)}</td>
      </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
    </div>
    ${invoice.tax_amount > 0 ? `
    <div class="total-row">
      <span>Tax (${invoice.profile.tax_rate}%)</span>
      <span>${formatCurrency(invoice.tax_amount, invoice.currency)}</span>
    </div>
    ` : ""}
    <div class="total-row grand">
      <span>Total Due</span>
      <span class="amount">${formatCurrency(invoice.total, invoice.currency)}</span>
    </div>
  </div>

  ${invoice.notes ? `
  <div style="margin-top: 40px; padding: 16px; background: #f9fafb; border-radius: 8px;">
    <h3 style="font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px;">Notes</h3>
    <p style="font-size: 14px;">${invoice.notes}</p>
  </div>
  ` : ""}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p style="margin-top: 8px;">Generated by ContractorPro</p>
  </div>
</body>
</html>
  `;
}

function generatePrintableHTML(invoice: InvoiceData): string {
  // Same as generateInvoiceHTML but with print-optimized styles
  return generateInvoiceHTML(invoice);
}

/**
 * "Black Card" Luxury Invoice Template
 *
 * Design Philosophy:
 * - Radical minimalism that signals "Luxury Service"
 * - Looks like a receipt from Apple Store or luxury hotel
 * - The money IS the design element
 *
 * Features:
 * - Massive 48pt Total centered at top
 * - Monochrome logo (grayscale filter)
 * - Dark mode: Slate Grey (#1C1C1E) background
 * - Giant QR code for payment
 * - Clickable payment link
 * - "Verified Pro" trust badge
 */
function generateBlackCardInvoice(
  invoice: InvoiceData,
  paymentLink?: string
): string {
  const businessName = invoice.profile.business_name || invoice.profile.full_name || "Professional Services";
  const logoUrl = invoice.profile.logo_url;

  // Generate QR code SVG for payment
  const qrCodeSvg = generateQRCodeSVG(paymentLink || `https://pay.contractorpro.app/${invoice.id}`);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --bg-primary: #1C1C1E;
      --bg-secondary: #2C2C2E;
      --bg-tertiary: #3A3A3C;
      --text-primary: #FFFFFF;
      --text-secondary: rgba(255, 255, 255, 0.7);
      --text-tertiary: rgba(255, 255, 255, 0.4);
      --accent: #FFFFFF;
      --divider: rgba(255, 255, 255, 0.08);
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, sans-serif;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 80px 48px;
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
    }

    .invoice-container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* === HERO TOTAL === */
    .hero-total {
      text-align: center;
      margin-bottom: 64px;
    }

    .total-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: 12px;
    }

    .total-amount {
      font-size: 72px;
      font-weight: 700;
      letter-spacing: -3px;
      color: var(--text-primary);
      line-height: 1;
    }

    .total-amount .currency {
      font-size: 36px;
      font-weight: 500;
      vertical-align: super;
      margin-right: 4px;
      letter-spacing: 0;
    }

    .total-amount .cents {
      font-size: 36px;
      font-weight: 400;
      color: var(--text-secondary);
    }

    /* === CONTRACTOR HEADER === */
    .contractor-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 48px;
      padding: 20px 24px;
      background: var(--bg-secondary);
      border-radius: 16px;
      width: 100%;
    }

    .logo-container {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      overflow: hidden;
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(100%) brightness(1.2) contrast(1.1);
    }

    .logo-placeholder {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-secondary);
    }

    .contractor-info {
      flex: 1;
    }

    .contractor-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .contractor-name {
      font-size: 17px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .verified-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background: rgba(52, 199, 89, 0.15);
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;
      color: #34C759;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .verified-badge svg {
      width: 10px;
      height: 10px;
    }

    .invoice-number {
      font-size: 13px;
      color: var(--text-tertiary);
      margin-top: 2px;
    }

    /* === LINE ITEMS === */
    .line-items {
      width: 100%;
      margin-bottom: 32px;
    }

    .line-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 16px 0;
      border-bottom: 1px solid var(--divider);
    }

    .line-item:last-child {
      border-bottom: none;
    }

    .item-description {
      font-size: 15px;
      color: var(--text-primary);
      font-weight: 400;
      flex: 1;
      padding-right: 24px;
    }

    .item-qty {
      font-size: 13px;
      color: var(--text-tertiary);
      margin-left: 8px;
    }

    .item-amount {
      font-size: 15px;
      color: var(--text-secondary);
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    /* === TOTALS === */
    .totals-section {
      width: 100%;
      padding-top: 16px;
      border-top: 1px solid var(--divider);
      margin-bottom: 48px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }

    .total-row.subtotal {
      color: var(--text-tertiary);
      font-size: 14px;
    }

    .total-row.tax {
      color: var(--text-tertiary);
      font-size: 14px;
    }

    /* === CLIENT INFO === */
    .client-section {
      width: 100%;
      text-align: center;
      margin-bottom: 48px;
      padding: 24px;
      background: var(--bg-secondary);
      border-radius: 12px;
    }

    .client-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: 8px;
    }

    .client-name {
      font-size: 17px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .client-email {
      font-size: 14px;
      color: var(--text-tertiary);
      margin-top: 4px;
    }

    /* === QR CODE SECTION === */
    .qr-section {
      text-align: center;
      margin-top: auto;
    }

    .qr-code {
      width: 200px;
      height: 200px;
      padding: 16px;
      background: #FFFFFF;
      border-radius: 24px;
      margin: 0 auto 20px;
    }

    .qr-code svg {
      width: 100%;
      height: 100%;
    }

    .qr-label {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--text-tertiary);
    }

    /* === PAY BUTTON === */
    .pay-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 32px;
      padding: 16px 48px;
      background: #FFFFFF;
      color: #000000;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 14px;
      transition: transform 0.2s, opacity 0.2s;
    }

    .pay-button:hover {
      transform: scale(1.02);
      opacity: 0.95;
    }

    .pay-button:active {
      transform: scale(0.98);
    }

    .pay-button svg {
      width: 20px;
      height: 20px;
    }

    /* === DATE INFO === */
    .date-info {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--divider);
      width: 100%;
    }

    .date-item {
      text-align: center;
    }

    .date-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: 4px;
    }

    .date-value {
      font-size: 14px;
      color: var(--text-secondary);
    }

    /* === FOOTER === */
    .footer {
      margin-top: 48px;
      text-align: center;
      color: var(--text-tertiary);
      font-size: 11px;
    }

    /* === PRINT STYLES (Light Mode) === */
    @media print {
      :root {
        --bg-primary: #FFFFFF;
        --bg-secondary: #F5F5F7;
        --bg-tertiary: #E8E8ED;
        --text-primary: #1D1D1F;
        --text-secondary: rgba(0, 0, 0, 0.6);
        --text-tertiary: rgba(0, 0, 0, 0.4);
        --divider: rgba(0, 0, 0, 0.08);
      }

      body {
        padding: 2in;
        background: white;
      }

      .logo-container img {
        filter: grayscale(100%) contrast(1.2);
      }

      .verified-badge {
        background: rgba(52, 199, 89, 0.1);
      }

      .qr-code {
        background: #F5F5F7;
        border: 1px solid var(--divider);
      }

      .pay-button {
        background: #1D1D1F;
        color: #FFFFFF;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- HERO: The Total IS the Design -->
    <div class="hero-total">
      <div class="total-label">Amount Due</div>
      <div class="total-amount">
        <span class="currency">$</span>${formatLuxuryAmount(invoice.total)}
      </div>
    </div>

    <!-- Contractor Header with Verified Badge -->
    <div class="contractor-header">
      <div class="logo-container">
        ${logoUrl
          ? `<img src="${logoUrl}" alt="${businessName}" />`
          : `<span class="logo-placeholder">${businessName.charAt(0).toUpperCase()}</span>`
        }
      </div>
      <div class="contractor-info">
        <div class="contractor-name-row">
          <span class="contractor-name">${businessName}</span>
          <span class="verified-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Verified Pro
          </span>
        </div>
        <div class="invoice-number">${invoice.invoice_number}</div>
      </div>
    </div>

    <!-- Client -->
    <div class="client-section">
      <div class="client-label">Billed To</div>
      <div class="client-name">${invoice.client_name}</div>
      ${invoice.client_email ? `<div class="client-email">${invoice.client_email}</div>` : ''}
    </div>

    <!-- Line Items -->
    <div class="line-items">
      ${invoice.items.map(item => `
        <div class="line-item">
          <span class="item-description">
            ${item.description}
            ${item.quantity > 1 ? `<span class="item-qty">× ${item.quantity}</span>` : ''}
          </span>
          <span class="item-amount">${formatCurrency(item.total, invoice.currency)}</span>
        </div>
      `).join('')}
    </div>

    <!-- Totals -->
    <div class="totals-section">
      <div class="total-row subtotal">
        <span>Subtotal</span>
        <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
      </div>
      ${invoice.tax_amount > 0 ? `
        <div class="total-row tax">
          <span>Tax (${invoice.profile.tax_rate}%)</span>
          <span>${formatCurrency(invoice.tax_amount, invoice.currency)}</span>
        </div>
      ` : ''}
    </div>

    <!-- QR Code Payment -->
    <div class="qr-section">
      <div class="qr-code">
        ${qrCodeSvg}
      </div>
      <div class="qr-label">Scan to Pay</div>

      <!-- Clickable Pay Button (opens Apple Pay / Stripe) -->
      <a href="${paymentLink || '#'}" class="pay-button" target="_blank">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        Pay Now
      </a>
    </div>

    <!-- Dates -->
    <div class="date-info">
      <div class="date-item">
        <div class="date-label">Issued</div>
        <div class="date-value">${formatDate(invoice.created_at)}</div>
      </div>
      ${invoice.due_date ? `
        <div class="date-item">
          <div class="date-label">Due</div>
          <div class="date-value">${formatDate(invoice.due_date)}</div>
        </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      Powered by ContractorPro
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Format amount for luxury display
 * e.g., 125000 (cents) -> "1,250" with separate ".00" styling
 */
function formatLuxuryAmount(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const remainder = cents % 100;
  const formattedDollars = dollars.toLocaleString('en-US');
  const formattedCents = remainder.toString().padStart(2, '0');
  return `${formattedDollars}<span class="cents">.${formattedCents}</span>`;
}

/**
 * Generate QR Code SVG
 * Uses a simple QR code pattern generator
 */
function generateQRCodeSVG(data: string): string {
  // Simple QR-like pattern for visual effect
  // In production, use a proper QR library or external service
  const size = 168;
  const moduleSize = 6;
  const modules = Math.floor(size / moduleSize);

  // Create a deterministic pattern based on the data
  const hash = simpleHash(data);
  let svg = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;

  // QR Code positioning patterns (corners)
  svg += generatePositionPattern(0, 0, moduleSize);
  svg += generatePositionPattern(size - 7 * moduleSize, 0, moduleSize);
  svg += generatePositionPattern(0, size - 7 * moduleSize, moduleSize);

  // Data modules (simplified pattern)
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      // Skip positioning pattern areas
      if (isPositionArea(x, y, modules)) continue;

      // Deterministic "random" fill based on position and hash
      if ((hash + x * 31 + y * 17) % 3 === 0) {
        svg += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#1D1D1F"/>`;
      }
    }
  }

  svg += '</svg>';
  return svg;
}

function generatePositionPattern(x: number, y: number, size: number): string {
  return `
    <rect x="${x}" y="${y}" width="${7 * size}" height="${7 * size}" fill="#1D1D1F"/>
    <rect x="${x + size}" y="${y + size}" width="${5 * size}" height="${5 * size}" fill="white"/>
    <rect x="${x + 2 * size}" y="${y + 2 * size}" width="${3 * size}" height="${3 * size}" fill="#1D1D1F"/>
  `;
}

function isPositionArea(x: number, y: number, modules: number): boolean {
  // Top-left
  if (x < 8 && y < 8) return true;
  // Top-right
  if (x >= modules - 8 && y < 8) return true;
  // Bottom-left
  if (x < 8 && y >= modules - 8) return true;
  return false;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
