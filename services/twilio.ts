/**
 * Twilio Service
 * SMS sending for automated reminders ("Bad Cop" system)
 * Per product-strategy.md Section 3.3
 */

const TWILIO_ACCOUNT_SID = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER;

interface SendSMSParams {
  to: string;
  body: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS via Twilio
 * Note: In production, this should be called from an Edge Function
 * to keep credentials secure
 */
export async function sendSMS(params: SendSMSParams): Promise<SMSResult> {
  const { to, body } = params;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn("Twilio credentials not configured");
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formatPhoneNumber(to),
        From: TWILIO_PHONE_NUMBER,
        Body: body,
      }).toString(),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.sid };
    } else {
      return { success: false, error: data.message || "Failed to send SMS" };
    }
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // If it doesn't start with country code, assume US (+1)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // If it already has country code
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }

  return phone;
}

/**
 * Generate reminder message from template
 */
export function generateReminderMessage(
  template: string,
  variables: {
    invoice_number: string;
    business_name: string;
    total: string;
    due_date?: string;
    days_overdue?: number;
    payment_link?: string;
  }
): string {
  let message = template;

  // Replace template variables
  message = message.replace(/\{\{invoice_number\}\}/g, variables.invoice_number);
  message = message.replace(/\{\{business_name\}\}/g, variables.business_name);
  message = message.replace(/\{\{total\}\}/g, variables.total);

  if (variables.due_date) {
    message = message.replace(/\{\{due_date\}\}/g, variables.due_date);
  }

  if (variables.days_overdue !== undefined) {
    message = message.replace(/\{\{days_overdue\}\}/g, String(variables.days_overdue));
  }

  if (variables.payment_link) {
    message = message.replace(/\{\{payment_link\}\}/g, variables.payment_link);
  }

  return message;
}

/**
 * Default reminder message templates
 */
export const DEFAULT_REMINDER_TEMPLATES = {
  friendly: `Hi! This is a friendly reminder about invoice {{invoice_number}} from {{business_name}}. Amount due: {{total}}. Thank you for your business!`,

  standard: `Reminder: Invoice {{invoice_number}} from {{business_name}} for {{total}} is now {{days_overdue}} days overdue. Please arrange payment at your earliest convenience.`,

  urgent: `URGENT: Invoice {{invoice_number}} from {{business_name}} for {{total}} is {{days_overdue}} days past due. Immediate payment is required. Pay now: {{payment_link}}`,

  final: `FINAL NOTICE: Invoice {{invoice_number}} ({{total}}) is seriously overdue. Please contact {{business_name}} immediately to arrange payment and avoid further action.`,
};

/**
 * Get appropriate template based on days overdue
 */
export function getTemplateForDaysOverdue(daysOverdue: number): string {
  if (daysOverdue <= 3) {
    return DEFAULT_REMINDER_TEMPLATES.friendly;
  } else if (daysOverdue <= 7) {
    return DEFAULT_REMINDER_TEMPLATES.standard;
  } else if (daysOverdue <= 14) {
    return DEFAULT_REMINDER_TEMPLATES.urgent;
  } else {
    return DEFAULT_REMINDER_TEMPLATES.final;
  }
}
