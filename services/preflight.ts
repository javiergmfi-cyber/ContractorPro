/**
 * Pre-Flight Check Service
 * Manages the daily "Bad Cop" review before auto-reminders are sent
 *
 * Per Gemini Strategy Doc: "Users will be terrified that the bot will send a text
 * to a client who already paid (via cash/check) but wasn't marked in the app."
 *
 * Solution: Every morning, show the contractor which reminders are about to go out,
 * giving them a "kill switch" to cancel specific reminders.
 */

import { supabase } from "@/lib/supabase";
import { Invoice } from "@/types";

export interface PendingReminder {
  invoice: Invoice;
  daysOverdue: number;
  reminderType: "pre_due" | "due_date" | "overdue";
  scheduledMessage: string;
}

/**
 * Get invoices that need reminders today based on the dunning schedule
 *
 * T-3 Days: Pre-Due Nudge (Email)
 * Due Date: The Alert (SMS)
 * T+3 Days: The Question (Email)
 * T+7 Days: The Firmness (SMS + Email)
 * T+14 Days: The Warning (SMS + Email)
 * T+30 Days: Final Notice (Formal Email)
 */
export async function getPendingReminders(): Promise<PendingReminder[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get reminder settings
    const { data: settings } = await supabase
      .from("reminder_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!settings?.enabled) return [];

    // Get all unpaid invoices
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["sent", "overdue"])
      .not("due_date", "is", null);

    if (error || !invoices) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingReminders: PendingReminder[] = [];
    const dayIntervals = settings.day_intervals || [3, 7, 14, 30];

    for (const invoice of invoices) {
      const dueDate = new Date(invoice.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const daysFromDue = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if today matches any reminder interval
      let shouldRemind = false;
      let reminderType: PendingReminder["reminderType"] = "overdue";

      // T-3: Pre-due reminder
      if (daysFromDue === -3) {
        shouldRemind = true;
        reminderType = "pre_due";
      }
      // Due date reminder
      else if (daysFromDue === 0) {
        shouldRemind = true;
        reminderType = "due_date";
      }
      // Overdue reminders based on intervals
      else if (daysFromDue > 0 && dayIntervals.includes(daysFromDue)) {
        shouldRemind = true;
        reminderType = "overdue";
      }

      if (shouldRemind) {
        const message = generateReminderMessage(
          invoice,
          daysFromDue,
          settings.message_template
        );

        pendingReminders.push({
          invoice: invoice as Invoice,
          daysOverdue: daysFromDue,
          reminderType,
          scheduledMessage: message,
        });
      }
    }

    return pendingReminders;
  } catch (error) {
    console.error("[PreFlight] Error getting pending reminders:", error);
    return [];
  }
}

/**
 * Generate the reminder message for an invoice
 */
function generateReminderMessage(
  invoice: Invoice,
  daysFromDue: number,
  template?: string
): string {
  // Default messages based on timing
  if (daysFromDue === -3) {
    return `Hi, friendly reminder that Invoice ${invoice.invoice_number} is due in 3 days.`;
  }

  if (daysFromDue === 0) {
    return `Hi, Invoice ${invoice.invoice_number} is due today. Pay here: [link]`;
  }

  if (daysFromDue === 3) {
    return `Hi, we haven't received payment for Invoice ${invoice.invoice_number} yet. Did you receive our previous message?`;
  }

  if (daysFromDue === 7) {
    return `Invoice ${invoice.invoice_number} is now one week overdue. Please settle immediately.`;
  }

  if (daysFromDue >= 14 && daysFromDue < 30) {
    return `Your account is significantly past due. Please remit payment for Invoice ${invoice.invoice_number} to avoid escalation.`;
  }

  if (daysFromDue >= 30) {
    return `FINAL NOTICE: Invoice ${invoice.invoice_number} is ${daysFromDue} days past due. Account flagged for collections.`;
  }

  // Use template if available
  if (template) {
    return template
      .replace(/\{\{invoice_number\}\}/g, invoice.invoice_number || "")
      .replace(/\{\{total\}\}/g, formatCurrency(invoice.total))
      .replace(/\{\{days_overdue\}\}/g, String(daysFromDue));
  }

  return `Reminder: Invoice ${invoice.invoice_number} is ${daysFromDue} days overdue.`;
}

/**
 * Cancel a specific reminder (won't send today)
 */
export async function cancelReminder(invoiceId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Store cancelled reminders for today
    const { error } = await supabase
      .from("cancelled_reminders")
      .upsert({
        user_id: user.id,
        invoice_id: invoiceId,
        cancelled_date: new Date().toISOString().split("T")[0],
      });

    return !error;
  } catch (error) {
    console.error("[PreFlight] Error cancelling reminder:", error);
    return false;
  }
}

/**
 * Send all approved reminders
 */
export async function sendApprovedReminders(
  reminders: PendingReminder[]
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const reminder of reminders) {
    try {
      // This would integrate with your actual reminder sending service
      // For now, we'll mark it as processed
      console.log(
        `[PreFlight] Would send reminder for ${reminder.invoice.invoice_number}`
      );
      sent++;
    } catch (error) {
      console.error(
        `[PreFlight] Failed to send reminder for ${reminder.invoice.id}:`,
        error
      );
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Helper to format currency
 */
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Get the pre-flight check time (default 9 AM, user-configurable)
 */
export function getPreflightTime(): { hour: number; minute: number } {
  // TODO: Make this user-configurable in settings
  return { hour: 9, minute: 0 };
}
