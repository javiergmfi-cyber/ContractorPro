import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Export QuickBooks Edge Function
 * Exports invoices in QuickBooks-compatible CSV/IIF format
 * Per product-strategy.md Section 3.4
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const {
      format = "csv", // "csv" or "iif"
      startDate,
      endDate,
      status, // Optional filter by status
      includeItems = true,
    } = body;

    // Build query
    let query = supabase
      .from("invoices")
      .select(`
        *,
        clients (
          name,
          email,
          address
        ),
        invoice_items (
          description,
          quantity,
          unit_price,
          total
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply date filters
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data: invoices, error: invoicesError } = await query;

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
      throw invoicesError;
    }

    if (!invoices || invoices.length === 0) {
      return new Response(
        JSON.stringify({ error: "No invoices found for the specified criteria" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile for business info
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, full_name")
      .eq("id", user.id)
      .single();

    const businessName = profile?.business_name || profile?.full_name || "My Business";

    let exportContent: string;
    let contentType: string;
    let filename: string;

    if (format === "iif") {
      // QuickBooks IIF format
      exportContent = generateIIF(invoices, businessName, includeItems);
      contentType = "application/x-iif";
      filename = `invoices_export_${formatDateForFilename(new Date())}.iif`;
    } else {
      // CSV format (default)
      exportContent = generateCSV(invoices, includeItems);
      contentType = "text/csv";
      filename = `invoices_export_${formatDateForFilename(new Date())}.csv`;
    }

    return new Response(exportContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error in export-quickbooks function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Generate CSV export
 */
function generateCSV(invoices: any[], includeItems: boolean): string {
  const rows: string[] = [];

  if (includeItems) {
    // Header for detailed export with line items
    rows.push([
      "Invoice Number",
      "Date",
      "Due Date",
      "Client Name",
      "Client Email",
      "Status",
      "Item Description",
      "Quantity",
      "Unit Price",
      "Item Total",
      "Invoice Subtotal",
      "Tax Amount",
      "Invoice Total",
      "Currency",
      "Paid Date",
      "Notes",
    ].map(escapeCSV).join(","));

    // Data rows
    for (const invoice of invoices) {
      const baseRow = {
        invoiceNumber: invoice.invoice_number,
        date: formatDate(invoice.created_at),
        dueDate: formatDate(invoice.due_date),
        clientName: invoice.clients?.name || "",
        clientEmail: invoice.clients?.email || "",
        status: invoice.status,
        subtotal: formatCurrency(invoice.subtotal, invoice.currency),
        taxAmount: formatCurrency(invoice.tax_amount, invoice.currency),
        total: formatCurrency(invoice.total, invoice.currency),
        currency: invoice.currency || "USD",
        paidDate: invoice.paid_at ? formatDate(invoice.paid_at) : "",
        notes: invoice.notes || "",
      };

      const items = invoice.invoice_items || [];

      if (items.length > 0) {
        // One row per line item
        for (const item of items) {
          rows.push([
            baseRow.invoiceNumber,
            baseRow.date,
            baseRow.dueDate,
            baseRow.clientName,
            baseRow.clientEmail,
            baseRow.status,
            item.description || "",
            String(item.quantity || 1),
            formatCurrency(item.unit_price, invoice.currency),
            formatCurrency(item.total, invoice.currency),
            baseRow.subtotal,
            baseRow.taxAmount,
            baseRow.total,
            baseRow.currency,
            baseRow.paidDate,
            baseRow.notes,
          ].map(escapeCSV).join(","));
        }
      } else {
        // Invoice with no items
        rows.push([
          baseRow.invoiceNumber,
          baseRow.date,
          baseRow.dueDate,
          baseRow.clientName,
          baseRow.clientEmail,
          baseRow.status,
          "",
          "",
          "",
          "",
          baseRow.subtotal,
          baseRow.taxAmount,
          baseRow.total,
          baseRow.currency,
          baseRow.paidDate,
          baseRow.notes,
        ].map(escapeCSV).join(","));
      }
    }
  } else {
    // Header for summary export
    rows.push([
      "Invoice Number",
      "Date",
      "Due Date",
      "Client Name",
      "Client Email",
      "Status",
      "Subtotal",
      "Tax Amount",
      "Total",
      "Currency",
      "Paid Date",
      "Notes",
    ].map(escapeCSV).join(","));

    // Data rows
    for (const invoice of invoices) {
      rows.push([
        invoice.invoice_number,
        formatDate(invoice.created_at),
        formatDate(invoice.due_date),
        invoice.clients?.name || "",
        invoice.clients?.email || "",
        invoice.status,
        formatCurrency(invoice.subtotal, invoice.currency),
        formatCurrency(invoice.tax_amount, invoice.currency),
        formatCurrency(invoice.total, invoice.currency),
        invoice.currency || "USD",
        invoice.paid_at ? formatDate(invoice.paid_at) : "",
        invoice.notes || "",
      ].map(escapeCSV).join(","));
    }
  }

  return rows.join("\n");
}

/**
 * Generate QuickBooks IIF (Intuit Interchange Format) export
 * Reference: https://quickbooks.intuit.com/learn-support/en-us/import-export-data-files/iif-files-overview/00/186368
 */
function generateIIF(invoices: any[], businessName: string, includeItems: boolean): string {
  const lines: string[] = [];

  // IIF Header for invoices
  lines.push("!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO");
  lines.push("!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO\tQNTY\tPRICE");
  lines.push("!ENDTRNS");

  for (const invoice of invoices) {
    const clientName = invoice.clients?.name || "Customer";
    const invoiceDate = formatDateIIF(invoice.created_at);
    const total = invoice.total / 100; // Convert from cents
    const items = invoice.invoice_items || [];

    // Transaction header (debit to Accounts Receivable)
    lines.push(
      `TRNS\tINVOICE\t${invoiceDate}\tAccounts Receivable\t${escapeIIF(clientName)}\t\t${total.toFixed(2)}\t${invoice.invoice_number}\t${escapeIIF(invoice.notes || "")}`
    );

    if (includeItems && items.length > 0) {
      // Split lines for each item (credit to Income)
      for (const item of items) {
        const itemTotal = (item.total || 0) / 100;
        const quantity = item.quantity || 1;
        const price = (item.unit_price || 0) / 100;

        lines.push(
          `SPL\tINVOICE\t${invoiceDate}\tSales Income\t${escapeIIF(clientName)}\t\t-${itemTotal.toFixed(2)}\t${invoice.invoice_number}\t${escapeIIF(item.description || "")}\t${quantity}\t${price.toFixed(2)}`
        );
      }
    } else {
      // Single split line for total
      lines.push(
        `SPL\tINVOICE\t${invoiceDate}\tSales Income\t${escapeIIF(clientName)}\t\t-${total.toFixed(2)}\t${invoice.invoice_number}\t\t1\t${total.toFixed(2)}`
      );
    }

    // Tax line if applicable
    if (invoice.tax_amount && invoice.tax_amount > 0) {
      const taxAmount = invoice.tax_amount / 100;
      lines.push(
        `SPL\tINVOICE\t${invoiceDate}\tSales Tax Payable\t${escapeIIF(clientName)}\t\t-${taxAmount.toFixed(2)}\t${invoice.invoice_number}\tSales Tax\t\t`
      );
    }

    lines.push("ENDTRNS");
  }

  return lines.join("\n");
}

/**
 * Helper functions
 */
function escapeCSV(value: string): string {
  if (value == null) return "";
  const str = String(value);
  // Escape quotes and wrap in quotes if contains special characters
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeIIF(value: string): string {
  if (value == null) return "";
  // IIF uses tabs as delimiters, remove them from values
  return String(value).replace(/\t/g, " ").replace(/\n/g, " ");
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function formatDateIIF(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  // IIF uses MM/DD/YYYY format
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split("T")[0].replace(/-/g, "");
}

function formatCurrency(cents: number | null, currency: string = "USD"): string {
  if (cents == null) return "0.00";
  return (cents / 100).toFixed(2);
}
