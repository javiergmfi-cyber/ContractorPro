// @ts-nocheck
/**
 * Activity Service
 * Tracks system events for the activity feed
 *
 * Event types:
 * - invoice_sent: When an invoice is sent to client
 * - invoice_viewed: When client clicks payment link (read receipt)
 * - reminder_sent: When Bad Cop sends an automatic reminder
 * - payment_received: When payment is confirmed
 */

import { supabase } from "@/lib/supabase";

export type ActivityEventType =
  | "invoice_sent"
  | "invoice_viewed"
  | "reminder_sent"
  | "payment_received";

export interface ActivityEvent {
  id: string;
  user_id: string;
  type: ActivityEventType;
  invoice_id: string | null;
  client_name: string | null;
  amount: number | null; // in cents
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface CreateActivityEventInput {
  type: ActivityEventType;
  invoice_id?: string;
  client_name?: string;
  amount?: number;
  metadata?: Record<string, any>;
}

/**
 * Create a new activity event
 */
export async function createActivityEvent(
  input: CreateActivityEventInput
): Promise<ActivityEvent | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("activity_events")
      .insert({
        user_id: user.id,
        type: input.type,
        invoice_id: input.invoice_id || null,
        client_name: input.client_name || null,
        amount: input.amount || null,
        metadata: input.metadata || null,
      })
      .select()
      .single();

    if (error) {
      // Silently handle "table doesn't exist" error
      if (error.code === "PGRST116" || error.code === "42P01" ||
          error.message?.includes("does not exist")) {
        return null;
      }
      console.error("[Activity] Error creating event:", error);
      return null;
    }

    return data as ActivityEvent;
  } catch (error) {
    console.error("[Activity] Error:", error);
    return null;
  }
}

/**
 * Get recent activity events for the current user
 */
export async function getRecentActivity(limit: number = 15): Promise<ActivityEvent[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("activity_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // Silently handle "table doesn't exist" error (PGRST116 or 42P01)
      // This happens before migrations are run
      if (error.code === "PGRST116" || error.code === "42P01" ||
          error.message?.includes("does not exist")) {
        return [];
      }
      console.error("[Activity] Error fetching events:", error);
      return [];
    }

    return (data || []) as ActivityEvent[];
  } catch (error) {
    console.error("[Activity] Error:", error);
    return [];
  }
}

/**
 * Helper functions to create specific event types
 */
export async function trackInvoiceSent(
  invoiceId: string,
  clientName: string,
  amount: number
): Promise<void> {
  await createActivityEvent({
    type: "invoice_sent",
    invoice_id: invoiceId,
    client_name: clientName,
    amount,
  });
}

export async function trackInvoiceViewed(
  invoiceId: string,
  clientName: string,
  amount: number
): Promise<void> {
  await createActivityEvent({
    type: "invoice_viewed",
    invoice_id: invoiceId,
    client_name: clientName,
    amount,
    metadata: { viewed_at: new Date().toISOString() },
  });
}

export async function trackReminderSent(
  invoiceId: string,
  clientName: string,
  amount: number,
  reminderNumber: number
): Promise<void> {
  await createActivityEvent({
    type: "reminder_sent",
    invoice_id: invoiceId,
    client_name: clientName,
    amount,
    metadata: { reminder_number: reminderNumber },
  });
}

export async function trackPaymentReceived(
  invoiceId: string,
  clientName: string,
  amount: number
): Promise<void> {
  await createActivityEvent({
    type: "payment_received",
    invoice_id: invoiceId,
    client_name: clientName,
    amount,
  });
}

/**
 * Format activity event for display
 */
export function formatActivityMessage(event: ActivityEvent): string {
  switch (event.type) {
    case "invoice_sent":
      return `Invoice sent to ${event.client_name}`;
    case "invoice_viewed":
      return `Invoice viewed by ${event.client_name}`;
    case "reminder_sent":
      return `Auto-reminder sent to ${event.client_name}`;
    case "payment_received":
      return `Payment received from ${event.client_name}`;
    default:
      return "Activity event";
  }
}

/**
 * Get icon name for activity type
 */
export function getActivityIcon(type: ActivityEventType): string {
  switch (type) {
    case "invoice_sent":
      return "send";
    case "invoice_viewed":
      return "eye";
    case "reminder_sent":
      return "bell";
    case "payment_received":
      return "check-circle";
    default:
      return "activity";
  }
}

/**
 * Get color for activity type
 */
export function getActivityColor(type: ActivityEventType): string {
  switch (type) {
    case "invoice_sent":
      return "#007AFF"; // Blue
    case "invoice_viewed":
      return "#FF9500"; // Orange (Pro feature)
    case "reminder_sent":
      return "#5856D6"; // Purple
    case "payment_received":
      return "#34C759"; // Green
    default:
      return "#8E8E93"; // Gray
  }
}
