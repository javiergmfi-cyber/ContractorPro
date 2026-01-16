/**
 * Database Service
 * CRUD operations for all Supabase tables
 * Per architecture-spec.md - All queries are scoped by RLS
 */

import { supabase } from "./supabase";
import {
  Profile,
  ProfileUpdate,
  Client,
  ClientInsert,
  ClientUpdate,
  Invoice,
  InvoiceInsert,
  InvoiceUpdate,
  InvoiceItem,
  InvoiceItemInsert,
  VoiceNote,
  VoiceNoteInsert,
  ReminderSettings,
  ReminderSettingsInsert,
  ReminderSettingsUpdate,
  GlossaryTerm,
} from "@/types/database";

// ============================================================================
// PROFILES
// ============================================================================

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function updateProfile(updates: ProfileUpdate): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  return data;
}

// ============================================================================
// CLIENTS
// ============================================================================

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return data || [];
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching client:", error);
    return null;
  }

  return data;
}

export async function createClient(client: Omit<ClientInsert, "user_id">): Promise<Client | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...client, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating client:", error);
    throw error;
  }

  return data;
}

export async function updateClient(id: string, updates: ClientUpdate): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating client:", error);
    throw error;
  }

  return data;
}

export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting client:", error);
    return false;
  }

  return true;
}

export async function searchClients(query: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error searching clients:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// INVOICES
// ============================================================================

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }

  return data || [];
}

export async function getInvoicesByStatus(status: Invoice["status"]): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices by status:", error);
    return [];
  }

  return data || [];
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }

  return data;
}

export async function getInvoiceWithItems(id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (invoiceError || !invoice) {
    console.error("Error fetching invoice:", invoiceError);
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Error fetching invoice items:", itemsError);
    return null;
  }

  return { invoice, items: items || [] };
}

export async function createInvoice(
  invoice: Omit<InvoiceInsert, "user_id">,
  items?: Omit<InvoiceItemInsert, "invoice_id">[]
): Promise<Invoice | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get next invoice number if not provided
  if (!invoice.invoice_number) {
    invoice.invoice_number = await getNextInvoiceNumber();
  }

  // Create invoice
  const { data: newInvoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({ ...invoice, user_id: user.id })
    .select()
    .single();

  if (invoiceError || !newInvoice) {
    console.error("Error creating invoice:", invoiceError);
    throw invoiceError;
  }

  // Create invoice items if provided
  if (items && items.length > 0) {
    const itemsWithInvoiceId = items.map((item) => ({
      ...item,
      invoice_id: newInvoice.id,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsWithInvoiceId);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
      // Rollback invoice creation
      await supabase.from("invoices").delete().eq("id", newInvoice.id);
      throw itemsError;
    }
  }

  return newInvoice;
}

export async function createInvoiceWithItems(
  invoice: Omit<InvoiceInsert, "user_id">,
  items: Omit<InvoiceItemInsert, "invoice_id">[]
): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get next invoice number if not provided
  if (!invoice.invoice_number) {
    invoice.invoice_number = await getNextInvoiceNumber();
  }

  // Create invoice
  const { data: newInvoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({ ...invoice, user_id: user.id })
    .select()
    .single();

  if (invoiceError || !newInvoice) {
    console.error("Error creating invoice:", invoiceError);
    throw invoiceError;
  }

  // Create invoice items
  const itemsWithInvoiceId = items.map((item) => ({
    ...item,
    invoice_id: newInvoice.id,
  }));

  const { data: newItems, error: itemsError } = await supabase
    .from("invoice_items")
    .insert(itemsWithInvoiceId)
    .select();

  if (itemsError) {
    console.error("Error creating invoice items:", itemsError);
    // Rollback invoice creation
    await supabase.from("invoices").delete().eq("id", newInvoice.id);
    throw itemsError;
  }

  return { invoice: newInvoice, items: newItems || [] };
}

export async function updateInvoice(id: string, updates: InvoiceUpdate): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }

  return data;
}

export async function updateInvoiceStatus(
  id: string,
  status: Invoice["status"],
  additionalUpdates?: Partial<InvoiceUpdate>
): Promise<Invoice | null> {
  const updates: InvoiceUpdate = { status, ...additionalUpdates };

  if (status === "paid") {
    updates.paid_at = new Date().toISOString();
  } else if (status === "sent") {
    updates.sent_at = new Date().toISOString();
  }

  return updateInvoice(id, updates);
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting invoice:", error);
    return false;
  }

  return true;
}

export async function getNextInvoiceNumber(): Promise<string> {
  const { count, error } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error getting invoice count:", error);
    return "INV-0001";
  }

  const nextNumber = (count || 0) + 1;
  return `INV-${nextNumber.toString().padStart(4, "0")}`;
}

// ============================================================================
// INVOICE ITEMS
// ============================================================================

export async function getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
  const { data, error } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching invoice items:", error);
    return [];
  }

  return data || [];
}

export async function createInvoiceItem(item: InvoiceItemInsert): Promise<InvoiceItem | null> {
  const { data, error } = await supabase
    .from("invoice_items")
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice item:", error);
    throw error;
  }

  return data;
}

export async function addInvoiceItem(item: InvoiceItemInsert): Promise<InvoiceItem | null> {
  // Alias for createInvoiceItem for backwards compatibility
  return createInvoiceItem(item);
}

export async function updateInvoiceItem(
  id: string,
  updates: Partial<InvoiceItem>
): Promise<InvoiceItem | null> {
  const { data, error } = await supabase
    .from("invoice_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating invoice item:", error);
    throw error;
  }

  return data;
}

export async function deleteInvoiceItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("invoice_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting invoice item:", error);
    return false;
  }

  return true;
}

// ============================================================================
// VOICE NOTES
// ============================================================================

export async function createVoiceNote(
  voiceNote: Omit<VoiceNoteInsert, "user_id">
): Promise<VoiceNote | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("voice_notes")
    .insert({ ...voiceNote, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating voice note:", error);
    throw error;
  }

  return data;
}

export async function updateVoiceNote(
  id: string,
  updates: Partial<VoiceNote>
): Promise<VoiceNote | null> {
  const { data, error } = await supabase
    .from("voice_notes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating voice note:", error);
    throw error;
  }

  return data;
}

// ============================================================================
// GLOSSARY (Read-only)
// ============================================================================

export async function getGlossaryTerms(language?: string): Promise<GlossaryTerm[]> {
  let query = supabase.from("glossary_terms").select("*");

  if (language) {
    query = query.eq("language", language);
  }

  const { data, error } = await query.order("term", { ascending: true });

  if (error) {
    console.error("Error fetching glossary terms:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// REMINDER SETTINGS
// ============================================================================

export async function getReminderSettings(): Promise<ReminderSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("reminder_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("Error fetching reminder settings:", error);
    return null;
  }

  return data;
}

export async function upsertReminderSettings(
  settings: Omit<ReminderSettingsInsert, "user_id">
): Promise<ReminderSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("reminder_settings")
    .upsert({ ...settings, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error upserting reminder settings:", error);
    throw error;
  }

  return data;
}

// ============================================================================
// DASHBOARD AGGREGATIONS
// ============================================================================

export async function getDashboardStats(): Promise<{
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  paidThisWeek: number;
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
  collectedByAutoChase: number;
  totalClientsCount: number;
  totalInvoicesCount: number;
}> {
  // Calculate date 7 days ago for "paid this week"
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // Fetch invoices with chase events for auto-chase ROI tracking
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, total, status, paid_at, auto_chase_enabled");

  if (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalRevenue: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      paidThisWeek: 0,
      invoiceCount: 0,
      paidCount: 0,
      overdueCount: 0,
      collectedByAutoChase: 0,
      totalClientsCount: 0,
      totalInvoicesCount: 0,
    };
  }

  // Get invoices that had chase events (auto-chase reminders sent)
  const { data: chaseEvents } = await supabase
    .from("chase_events")
    .select("invoice_id");

  const chasedInvoiceIds = new Set((chaseEvents || []).map((e) => e.invoice_id));

  // Get total clients count
  const { count: clientsCount } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true });

  const stats = (invoices || []).reduce(
    (acc, invoice) => {
      acc.invoiceCount++;

      if (invoice.status === "paid") {
        acc.totalRevenue += invoice.total;
        acc.paidCount++;
        // Check if paid within last 7 days
        if (invoice.paid_at && invoice.paid_at >= sevenDaysAgoISO) {
          acc.paidThisWeek += invoice.total;
        }
        // PRO ROI: Check if this invoice was collected via auto-chase
        if (chasedInvoiceIds.has(invoice.id)) {
          acc.collectedByAutoChase += invoice.total;
        }
      } else if (invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "deposit_paid") {
        acc.pendingAmount += invoice.total;
        if (invoice.status === "overdue") {
          acc.overdueCount++;
          acc.overdueAmount += invoice.total;
        }
      }

      return acc;
    },
    {
      totalRevenue: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      paidThisWeek: 0,
      invoiceCount: 0,
      paidCount: 0,
      overdueCount: 0,
      collectedByAutoChase: 0,
    }
  );

  return {
    ...stats,
    totalClientsCount: clientsCount || 0,
    totalInvoicesCount: invoices?.length || 0,
  };
}

/**
 * Get count of invoices sent in the current month
 * Used for free tier send limit tracking
 */
export async function getSendsThisMonth(): Promise<number> {
  // Get first day of current month at midnight
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfMonthISO = firstOfMonth.toISOString();

  const { count, error } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .not("sent_at", "is", null)
    .gte("sent_at", firstOfMonthISO);

  if (error) {
    console.error("Error fetching sends this month:", error);
    return 0;
  }

  return count || 0;
}

// ============================================================================
// FILE STORAGE
// ============================================================================

export async function uploadVoiceNote(
  uri: string,
  fileName: string
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const filePath = `${user.id}/${fileName}`;

  // Read file as blob
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from("voice-evidence")
    .upload(filePath, blob, {
      contentType: "audio/m4a",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading voice note:", error);
    throw error;
  }

  return data.path;
}

export async function uploadLogo(uri: string, fileName: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const filePath = `${user.id}/${fileName}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from("logos")
    .upload(filePath, blob, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading logo:", error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("logos")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 60
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Error getting signed URL:", error);
    return null;
  }

  return data.signedUrl;
}
