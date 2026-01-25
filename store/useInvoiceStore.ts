import { create } from "zustand";
import { Invoice, InvoiceItem } from "@/types/database";
import * as db from "@/services/database";

// Parsed invoice from AI (before saving to database)
export interface ParsedInvoice {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  items: {
    description: string;
    price: number;
    quantity?: number;
    originalTranscriptSegment?: string;
  }[];
  detectedLanguage: string;
  confidence?: number;
  notes?: string;
  dueDate?: string; // ISO date string
  // Deposit settings (from create screen)
  deposit_enabled?: boolean;
  deposit_type?: "percent" | "fixed" | null;
  deposit_value?: number | null; // percent (1-100) or fixed cents
}

interface InvoiceState {
  // Data
  invoices: Invoice[];
  currentInvoice: { invoice: Invoice; items: InvoiceItem[] } | null;
  pendingInvoice: ParsedInvoice | null;

  // Review prompt tracking
  lastReviewPromptedInvoiceId: string | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;

  // Actions
  fetchInvoices: () => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  createInvoice: (
    invoice: Omit<Parameters<typeof db.createInvoice>[0], "user_id">,
    items: Parameters<typeof db.createInvoice>[1]
  ) => Promise<Invoice | null>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addChangeOrder: (invoiceId: string, description: string, unitPrice: number) => Promise<void>;

  // Pending invoice (from AI parsing)
  setPendingInvoice: (invoice: ParsedInvoice | null) => void;
  clearPendingInvoice: () => void;

  // Review prompt tracking
  setLastReviewPromptedInvoiceId: (id: string) => void;

  // Reset
  reset: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  currentInvoice: null,
  pendingInvoice: null,
  lastReviewPromptedInvoiceId: null,
  isLoading: false,
  isCreating: false,

  fetchInvoices: async () => {
    set({ isLoading: true });
    try {
      const invoices = await db.getInvoices();
      set({ invoices, isLoading: false });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      set({ isLoading: false });
    }
  },

  fetchInvoice: async (id: string) => {
    set({ isLoading: true });
    try {
      const result = await db.getInvoiceWithItems(id);
      set({ currentInvoice: result, isLoading: false });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      set({ isLoading: false });
    }
  },

  createInvoice: async (invoice, items) => {
    set({ isCreating: true });
    try {
      const result = await db.createInvoice(invoice, items);
      if (result) {
        set((state) => ({
          invoices: [result.invoice, ...state.invoices],
          isCreating: false,
        }));
        return result.invoice;
      }
      set({ isCreating: false });
      return null;
    } catch (error) {
      console.error("Error creating invoice:", error);
      set({ isCreating: false });
      throw error;
    }
  },

  updateInvoice: async (id: string, updates: Partial<Invoice>) => {
    try {
      const updated = await db.updateInvoice(id, updates);
      if (updated) {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updated } : inv
          ),
          currentInvoice:
            state.currentInvoice?.invoice.id === id
              ? { ...state.currentInvoice, invoice: updated }
              : state.currentInvoice,
        }));
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  },

  updateInvoiceStatus: async (id: string, status: Invoice["status"]) => {
    try {
      const updated = await db.updateInvoiceStatus(id, status);
      if (updated) {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updated } : inv
          ),
          currentInvoice:
            state.currentInvoice?.invoice.id === id
              ? { ...state.currentInvoice, invoice: updated }
              : state.currentInvoice,
        }));
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
      throw error;
    }
  },

  deleteInvoice: async (id: string) => {
    try {
      const success = await db.deleteInvoice(id);
      if (success) {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
          currentInvoice:
            state.currentInvoice?.invoice.id === id ? null : state.currentInvoice,
        }));
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  },

  addChangeOrder: async (invoiceId: string, description: string, unitPrice: number) => {
    try {
      // Create the change order line item
      const newItem = await db.createInvoiceItem({
        invoice_id: invoiceId,
        description,
        quantity: 1,
        unit_price: unitPrice,
        total: unitPrice,
      });

      // Fetch all items to recalculate totals
      const allItems = await db.getInvoiceItems(invoiceId);
      const newSubtotal = allItems.reduce((sum, item) => sum + item.total, 0);

      // Get current invoice to find tax rate
      const state = get();
      const currentInvoice = state.invoices.find((inv) => inv.id === invoiceId);
      const taxRate = currentInvoice?.tax_rate || 0;
      const newTaxAmount = Math.round(newSubtotal * (taxRate / 100));
      const newTotal = newSubtotal + newTaxAmount;

      // Update invoice totals
      const updated = await db.updateInvoice(invoiceId, {
        subtotal: newSubtotal,
        tax_amount: newTaxAmount,
        total: newTotal,
      });

      if (updated) {
        // Optimistically update local state
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, ...updated } : inv
          ),
          currentInvoice:
            state.currentInvoice?.invoice.id === invoiceId
              ? {
                  ...state.currentInvoice,
                  invoice: updated,
                  items: allItems,
                }
              : state.currentInvoice,
        }));
      }
    } catch (error) {
      console.error("Error adding change order:", error);
      throw error;
    }
  },

  setPendingInvoice: (invoice) => set({ pendingInvoice: invoice }),

  clearPendingInvoice: () => set({ pendingInvoice: null }),

  setLastReviewPromptedInvoiceId: (id: string) => set({ lastReviewPromptedInvoiceId: id }),

  reset: () =>
    set({
      invoices: [],
      currentInvoice: null,
      pendingInvoice: null,
      lastReviewPromptedInvoiceId: null,
      isLoading: false,
      isCreating: false,
    }),
}));
