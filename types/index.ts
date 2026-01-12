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
  pendingAmount: number; // in cents
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
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
