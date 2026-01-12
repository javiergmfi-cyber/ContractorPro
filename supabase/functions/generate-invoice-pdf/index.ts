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

    // Generate HTML for PDF
    const html = generateInvoiceHTML({
      ...invoice,
      items: invoice.invoice_items,
      profile: profile || { tax_rate: 0 },
    });

    // For now, we'll store the HTML as a simple text file
    // In production, you'd use a PDF generation service like:
    // - Puppeteer (via Deno Deploy or separate service)
    // - pdf-lib for programmatic PDF creation
    // - External API like DocRaptor, PDFShift, etc.

    // Generate PDF using external service or library
    // For MVP, we'll create a simple HTML file that can be printed to PDF
    const pdfContent = generatePrintableHTML({
      ...invoice,
      items: invoice.invoice_items,
      profile: profile || { tax_rate: 0 },
    });

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
