export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  createdAt: string;
  dueDate?: string;
  paidAt?: string;
  notes?: string;
}

export interface ParsedInvoice {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  items: { description: string; price: number; quantity?: number }[];
  detectedLanguage: string;
}

export interface Profile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  taxRate: number;
  currency: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioUri?: string;
}
