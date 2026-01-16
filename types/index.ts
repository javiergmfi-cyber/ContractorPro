/**
 * Application Types
 * Re-exports database types and defines app-specific types
 */

// Re-export all database types
export * from "./database";

// Re-export ParsedInvoice from store (used before saving to DB)
export type { ParsedInvoice } from "@/store/useInvoiceStore";

// Recording state for voice capture
export interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioUri?: string;
}

// AI parsing result (from Edge Function)
export interface AIParseResult {
  meta: {
    intent: "INVOICE" | "QUOTE";
    confidence: number;
    language_detected: string;
    currency: "USD" | "BRL" | "MXN" | "EUR";
  };
  client: {
    name: string | null;
    contact_inferred: string | null;
  };
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    original_transcript_segment: string;
    requires_review: boolean;
  }>;
  notes: string | null;
}

// Dashboard statistics
export interface DashboardStats {
  totalRevenue: number; // in cents
  pendingAmount: number; // in cents - all unpaid (sent + overdue)
  overdueAmount: number; // in cents - only overdue
  paidThisWeek: number; // in cents - paid in last 7 days
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
  // PRO ROI stats
  collectedByAutoChase: number; // in cents - paid invoices that had auto-chase reminders
  totalClientsCount?: number;
  totalInvoicesCount?: number;
}

// Stripe account status
export interface StripeAccountStatus {
  isConnected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  accountId: string | null;
}

// Invoice with items (combined for display)
export interface InvoiceWithItems {
  invoice: import("./database").Invoice;
  items: import("./database").InvoiceItem[];
}

// Helper type for amounts (convert between cents and dollars)
export type CentsAmount = number & { readonly __brand: "cents" };
export type DollarsAmount = number & { readonly __brand: "dollars" };

// Utility functions for amount conversion
export const toCents = (dollars: number): number => Math.round(dollars * 100);
export const toDollars = (cents: number): number => cents / 100;

// Format currency for display
export const formatCurrency = (cents: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(toDollars(cents));
};

// Format relative date
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
};

/**
 * Calculate remaining balance for an invoice
 * Single source of truth for balance calculation
 * Use this everywhere instead of calculating manually
 *
 * @param total - Total invoice amount in cents
 * @param amountPaid - Amount already paid in cents (default 0)
 * @returns Remaining balance in cents (never negative)
 */
export const getRemainingBalance = (total: number, amountPaid: number = 0): number => {
  return Math.max(0, total - (amountPaid || 0));
};

/**
 * Check if an invoice has a deposit and it's been paid
 * @param invoice - Invoice object with deposit fields
 * @returns true if deposit is enabled and has been paid
 */
export const isDepositPaid = (invoice: {
  deposit_enabled?: boolean;
  deposit_amount?: number | null;
  amount_paid?: number | null;
  deposit_paid_at?: string | null;
}): boolean => {
  if (!invoice.deposit_enabled || !invoice.deposit_amount) {
    return false;
  }
  // Deposit is paid if deposit_paid_at is set OR amount_paid >= deposit_amount
  return !!(invoice.deposit_paid_at || (invoice.amount_paid || 0) >= invoice.deposit_amount);
};

/**
 * Get the payment state for an invoice
 * Used to determine what UI/actions to show
 */
export type PaymentState = "draft" | "no_deposit" | "deposit_pending" | "deposit_paid" | "fully_paid" | "void";

export const getPaymentState = (invoice: {
  status: string;
  total: number;
  deposit_enabled?: boolean;
  deposit_amount?: number | null;
  amount_paid?: number | null;
  deposit_paid_at?: string | null;
}): PaymentState => {
  if (invoice.status === "void") return "void";
  if (invoice.status === "draft") return "draft";
  if (invoice.status === "paid" || getRemainingBalance(invoice.total, invoice.amount_paid || 0) === 0) {
    return "fully_paid";
  }

  if (!invoice.deposit_enabled || !invoice.deposit_amount) {
    return "no_deposit";
  }

  // Deposit is enabled
  if (isDepositPaid(invoice)) {
    return "deposit_paid";
  }

  return "deposit_pending";
};
