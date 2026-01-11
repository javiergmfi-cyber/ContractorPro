import { create } from "zustand";
import { Invoice, ParsedInvoice } from "../types";

interface InvoiceState {
  invoices: Invoice[];
  pendingInvoice: ParsedInvoice | null;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  setPendingInvoice: (invoice: ParsedInvoice | null) => void;
  clearPendingInvoice: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  pendingInvoice: null,

  addInvoice: (invoice) =>
    set((state) => ({
      invoices: [...state.invoices, invoice],
    })),

  updateInvoice: (id, updates) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...updates } : inv
      ),
    })),

  deleteInvoice: (id) =>
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id),
    })),

  setPendingInvoice: (invoice) =>
    set(() => ({
      pendingInvoice: invoice,
    })),

  clearPendingInvoice: () =>
    set(() => ({
      pendingInvoice: null,
    })),
}));
