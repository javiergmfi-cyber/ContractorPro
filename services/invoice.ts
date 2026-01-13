import { Share, Linking, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { supabase } from "./supabase";
import { Invoice } from "@/types";
import { getPaymentLink } from "./stripe";

/**
 * Invoice Service
 * Handles PDF generation, sharing, and sending flows
 */

interface SendInvoiceResult {
  success: boolean;
  pdfUrl?: string;
  paymentUrl?: string;
  error?: string;
}

/**
 * Generate PDF for an invoice
 */
export async function generateInvoicePDF(invoiceId: string): Promise<{ pdfUrl: string } | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await supabase.functions.invoke("generate-invoice-pdf", {
      body: { invoice_id: invoiceId },
    });

    if (response.error) {
      console.error("PDF generation error:", response.error);
      return null;
    }

    return { pdfUrl: response.data.pdf_url };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
}

/**
 * Complete send invoice flow:
 * 1. Generate PDF
 * 2. Generate payment link (if Stripe connected)
 * 3. Open native share sheet
 */
export async function sendInvoice(
  invoice: Invoice,
  options: {
    includePaymentLink?: boolean;
    shareMethod?: "native" | "sms" | "whatsapp" | "email";
  } = {}
): Promise<SendInvoiceResult> {
  const { includePaymentLink = true, shareMethod = "native" } = options;

  try {
    // 1. Generate PDF
    const pdfResult = await generateInvoicePDF(invoice.id);

    // 2. Generate payment link if requested
    let paymentUrl: string | undefined;
    if (includePaymentLink && invoice.status !== "paid") {
      const paymentResult = await getPaymentLink(invoice.id);
      paymentUrl = paymentResult?.url;
    }

    // 3. Construct message
    const message = constructInvoiceMessage(invoice, paymentUrl);

    // 4. Share via selected method
    switch (shareMethod) {
      case "sms":
        await shareViaSMS(invoice, message);
        break;
      case "whatsapp":
        await shareViaWhatsApp(invoice, message);
        break;
      case "email":
        await shareViaEmail(invoice, message, pdfResult?.pdfUrl);
        break;
      default:
        await shareNative(invoice, message, pdfResult?.pdfUrl);
    }

    return {
      success: true,
      pdfUrl: pdfResult?.pdfUrl,
      paymentUrl,
    };
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return {
      success: false,
      error: error.message || "Failed to send invoice",
    };
  }
}

/**
 * Construct the invoice message for sharing
 * Highlights ease of payment for professional appearance
 */
function constructInvoiceMessage(invoice: Invoice, paymentUrl?: string): string {
  const amount = formatCurrency(invoice.total, invoice.currency);

  let message = `Hi ${invoice.client_name.split(" ")[0]},\n\n`;
  message += `Here is your invoice for ${amount}.\n\n`;
  message += `You can pay securely via Apple Pay, Google Pay, or Card here:\n`;
  message += `${paymentUrl}\n\n`;
  message += `Thank you for your business!`;

  return message;
}

/**
 * Share via native share sheet
 */
async function shareNative(
  invoice: Invoice,
  message: string,
  pdfUrl?: string
): Promise<void> {
  const shareOptions: { message: string; url?: string; title?: string } = {
    message,
    title: `Invoice ${invoice.invoice_number}`,
  };

  // Add PDF URL if available
  if (pdfUrl) {
    shareOptions.url = pdfUrl;
  }

  await Share.share(shareOptions);
}

/**
 * Share via SMS (Native)
 * Per product-strategy.md - "trust from known number"
 */
async function shareViaSMS(invoice: Invoice, message: string): Promise<void> {
  const phoneNumber = invoice.client_phone || "";
  const encodedMessage = encodeURIComponent(message);

  // Different URL schemes for iOS and Android
  const smsUrl = Platform.select({
    ios: `sms:${phoneNumber}&body=${encodedMessage}`,
    android: `sms:${phoneNumber}?body=${encodedMessage}`,
  });

  if (smsUrl && (await Linking.canOpenURL(smsUrl))) {
    await Linking.openURL(smsUrl);
  } else {
    // Fallback to native share
    await Share.share({ message });
  }
}

/**
 * Share via WhatsApp
 */
async function shareViaWhatsApp(invoice: Invoice, message: string): Promise<void> {
  const phoneNumber = invoice.client_phone?.replace(/\D/g, "") || "";
  const encodedMessage = encodeURIComponent(message);

  // WhatsApp URL scheme
  const whatsappUrl = phoneNumber
    ? `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`
    : `whatsapp://send?text=${encodedMessage}`;

  if (await Linking.canOpenURL(whatsappUrl)) {
    await Linking.openURL(whatsappUrl);
  } else {
    // WhatsApp not installed, try web version
    const webUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    await Linking.openURL(webUrl);
  }
}

/**
 * Share via Email
 */
async function shareViaEmail(
  invoice: Invoice,
  message: string,
  pdfUrl?: string
): Promise<void> {
  const email = invoice.client_email || "";
  const subject = encodeURIComponent(`Invoice ${invoice.invoice_number}`);
  const body = encodeURIComponent(message);

  const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

  if (await Linking.canOpenURL(mailtoUrl)) {
    await Linking.openURL(mailtoUrl);
  } else {
    // Fallback to native share
    await Share.share({ message, title: `Invoice ${invoice.invoice_number}` });
  }
}

/**
 * Format currency for display
 */
function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Download PDF to device
 */
export async function downloadInvoicePDF(
  invoiceId: string,
  invoiceNumber: string
): Promise<string | null> {
  try {
    const pdfResult = await generateInvoicePDF(invoiceId);
    if (!pdfResult?.pdfUrl) return null;

    const fileName = `Invoice_${invoiceNumber.replace(/\s/g, "_")}.html`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    const downloadResult = await FileSystem.downloadAsync(
      pdfResult.pdfUrl,
      fileUri
    );

    if (downloadResult.status === 200) {
      return downloadResult.uri;
    }

    return null;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    return null;
  }
}

/**
 * Share downloaded file
 */
export async function shareFile(fileUri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
}

/**
 * Generate reminder message for overdue invoices
 * Per product-strategy.md "Bad Cop" system
 */
export function generateReminderMessage(
  invoice: Invoice,
  reminderNumber: number = 1,
  paymentUrl?: string
): string {
  const amount = formatCurrency(invoice.total, invoice.currency);
  const daysPastDue = invoice.due_date
    ? Math.floor(
        (Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  let message = "";

  if (reminderNumber === 1) {
    // Friendly first reminder
    message = `Hi ${invoice.client_name.split(" ")[0]},\n\n`;
    message += `This is a friendly reminder about invoice ${invoice.invoice_number} for ${amount}.\n`;
    if (daysPastDue > 0) {
      message += `The payment was due ${daysPastDue} day${daysPastDue > 1 ? "s" : ""} ago.\n`;
    }
  } else if (reminderNumber === 2) {
    // Second reminder - more direct
    message = `Hi ${invoice.client_name.split(" ")[0]},\n\n`;
    message += `We haven't received payment for invoice ${invoice.invoice_number} (${amount}).\n`;
    message += `This invoice is now ${daysPastDue} days overdue.\n`;
    message += `Please arrange payment at your earliest convenience.\n`;
  } else {
    // Final notice
    message = `PAYMENT REMINDER\n\n`;
    message += `Invoice: ${invoice.invoice_number}\n`;
    message += `Amount: ${amount}\n`;
    message += `Days Overdue: ${daysPastDue}\n\n`;
    message += `Please make payment immediately to avoid further action.\n`;
  }

  if (paymentUrl) {
    message += `\nPay now: ${paymentUrl}\n`;
  }

  return message;
}

/**
 * Check if sharing is available
 */
export async function canShare(): Promise<boolean> {
  return Sharing.isAvailableAsync();
}
