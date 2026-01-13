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
}

interface InvoiceState {
  // Data
  invoices: Invoice[];
  currentInvoice: { invoice: Invoice; items: InvoiceItem[] } | null;
  pendingInvoice: ParsedInvoice | null;

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

  // Pending invoice (from AI parsing)
  setPendingInvoice: (invoice: ParsedInvoice | null) => void;
  clearPendingInvoice: () => void;

  // Reset
  reset: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  currentInvoice: null,
  pendingInvoice: null,
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

  setPendingInvoice: (invoice) => set({ pendingInvoice: invoice }),

  clearPendingInvoice: () => set({ pendingInvoice: null }),

  reset: () =>
    set({
      invoices: [],
      currentInvoice: null,
      pendingInvoice: null,
      isLoading: false,
      isCreating: false,
    }),
}));
