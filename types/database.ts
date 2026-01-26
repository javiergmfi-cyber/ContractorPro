/**
 * Database types for Supabase
 * Per architecture-spec.md schema definitions
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'void' | 'overdue' | 'deposit_paid';
export type DepositType = 'percent' | 'fixed';
export type LateFeeType = 'percent' | 'fixed';
export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
export type SubscriptionTier = 'free' | 'pro';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          business_name: string | null;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          logo_url: string | null;
          trade: string | null;
          google_place_id: string | null; // For GMB review deep linking
          stripe_account_id: string | null;
          charges_enabled: boolean;
          payouts_enabled: boolean;
          default_currency: string;
          default_language: string;
          tax_rate: number;
          subscription_status: SubscriptionStatus;
          subscription_tier: SubscriptionTier;
          stripe_customer_id: string | null;
          current_period_end: string | null;
          // Trial fields
          has_claimed_trial: boolean;
          trial_started_at: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          business_name?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          trade?: string | null;
          google_place_id?: string | null;
          stripe_account_id?: string | null;
          charges_enabled?: boolean;
          payouts_enabled?: boolean;
          default_currency?: string;
          default_language?: string;
          tax_rate?: number;
          subscription_status?: SubscriptionStatus;
          subscription_tier?: SubscriptionTier;
          stripe_customer_id?: string | null;
          current_period_end?: string | null;
          // Trial fields
          has_claimed_trial?: boolean;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          trade?: string | null;
          google_place_id?: string | null;
          stripe_account_id?: string | null;
          charges_enabled?: boolean;
          payouts_enabled?: boolean;
          default_currency?: string;
          default_language?: string;
          tax_rate?: number;
          subscription_status?: SubscriptionStatus;
          subscription_tier?: SubscriptionTier;
          stripe_customer_id?: string | null;
          current_period_end?: string | null;
          // Trial fields
          has_claimed_trial?: boolean;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: Json | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: Json | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          invoice_number: string;
          client_name: string;
          client_email: string | null;
          client_phone: string | null;
          client_address: string | null;
          stripe_payment_intent_id: string | null;
          stripe_hosted_invoice_url: string | null;
          subtotal: number; // in cents
          tax_rate: number;
          tax_amount: number; // in cents
          total: number; // in cents
          currency: string;
          status: InvoiceStatus;
          due_date: string | null;
          paid_at: string | null;
          sent_at: string | null;
          viewed_at: string | null;
          tracking_id: string | null;
          notes: string | null;
          // Deposit fields
          deposit_enabled: boolean;
          deposit_type: DepositType | null;
          deposit_value: number | null; // percent (1-100) or fixed cents
          deposit_amount: number; // computed deposit in cents
          amount_paid: number; // total paid so far in cents
          deposit_payment_intent_id: string | null;
          balance_payment_intent_id: string | null;
          approved_at: string | null;
          deposit_paid_at: string | null;
          // Per-invoice settings
          auto_chase_enabled: boolean;
          auto_nudge_enabled: boolean;
          late_fee_enabled: boolean;
          late_fee_type: LateFeeType | null;
          late_fee_value: number | null;
          // Living Document fields (per HYBRID_SPEC)
          published_at: string | null; // When contractor "sent" the estimate/invoice
          signature_url: string | null; // Client signature for deposit approval
          // Change order approval fields
          change_order_pending: boolean;
          change_order_description: string | null;
          change_order_amount: number | null; // delta in cents
          change_order_previous_total: number | null; // original total in cents
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          invoice_number: string;
          client_name: string;
          client_email?: string | null;
          client_phone?: string | null;
          client_address?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_hosted_invoice_url?: string | null;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          currency?: string;
          status?: InvoiceStatus;
          due_date?: string | null;
          paid_at?: string | null;
          sent_at?: string | null;
          viewed_at?: string | null;
          tracking_id?: string | null;
          notes?: string | null;
          // Deposit fields
          deposit_enabled?: boolean;
          deposit_type?: DepositType | null;
          deposit_value?: number | null;
          deposit_amount?: number;
          amount_paid?: number;
          deposit_payment_intent_id?: string | null;
          balance_payment_intent_id?: string | null;
          approved_at?: string | null;
          deposit_paid_at?: string | null;
          // Per-invoice settings
          auto_chase_enabled?: boolean;
          auto_nudge_enabled?: boolean;
          late_fee_enabled?: boolean;
          late_fee_type?: LateFeeType | null;
          late_fee_value?: number | null;
          // Living Document fields (per HYBRID_SPEC)
          published_at?: string | null;
          signature_url?: string | null;
          // Change order approval fields
          change_order_pending?: boolean;
          change_order_description?: string | null;
          change_order_amount?: number | null;
          change_order_previous_total?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          invoice_number?: string;
          client_name?: string;
          client_email?: string | null;
          client_phone?: string | null;
          client_address?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_hosted_invoice_url?: string | null;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          currency?: string;
          status?: InvoiceStatus;
          due_date?: string | null;
          paid_at?: string | null;
          sent_at?: string | null;
          viewed_at?: string | null;
          tracking_id?: string | null;
          notes?: string | null;
          // Deposit fields
          deposit_enabled?: boolean;
          deposit_type?: DepositType | null;
          deposit_value?: number | null;
          deposit_amount?: number;
          amount_paid?: number;
          deposit_payment_intent_id?: string | null;
          balance_payment_intent_id?: string | null;
          approved_at?: string | null;
          deposit_paid_at?: string | null;
          // Per-invoice settings
          auto_chase_enabled?: boolean;
          auto_nudge_enabled?: boolean;
          late_fee_enabled?: boolean;
          late_fee_type?: LateFeeType | null;
          late_fee_value?: number | null;
          // Living Document fields (per HYBRID_SPEC)
          published_at?: string | null;
          signature_url?: string | null;
          // Change order approval fields
          change_order_pending?: boolean;
          change_order_description?: string | null;
          change_order_amount?: number | null;
          change_order_previous_total?: number | null;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number; // in cents
          total: number; // in cents
          original_transcript_segment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          original_transcript_segment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          original_transcript_segment?: string | null;
        };
      };
      voice_notes: {
        Row: {
          id: string;
          user_id: string;
          invoice_id: string | null;
          storage_path: string;
          transcript: string | null;
          detected_language: string | null;
          confidence_score: number | null;
          processing_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          invoice_id?: string | null;
          storage_path: string;
          transcript?: string | null;
          detected_language?: string | null;
          confidence_score?: number | null;
          processing_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          invoice_id?: string | null;
          storage_path?: string;
          transcript?: string | null;
          detected_language?: string | null;
          confidence_score?: number | null;
          processing_status?: string;
        };
      };
      glossary_terms: {
        Row: {
          id: string;
          term: string;
          standard_english: string;
          category: string | null;
          language: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          term: string;
          standard_english: string;
          category?: string | null;
          language?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          term?: string;
          standard_english?: string;
          category?: string | null;
          language?: string;
        };
      };
      webhook_events: {
        Row: {
          id: string;
          event_type: string;
          processed_at: string;
          payload: Json | null;
        };
        Insert: {
          id: string;
          event_type: string;
          processed_at?: string;
          payload?: Json | null;
        };
        Update: {
          id?: string;
          event_type?: string;
          processed_at?: string;
          payload?: Json | null;
        };
      };
      reminder_settings: {
        Row: {
          id: string;
          user_id: string;
          enabled: boolean;
          day_intervals: number[];
          email_enabled: boolean;
          sms_enabled: boolean;
          message_template: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          enabled?: boolean;
          day_intervals?: number[];
          email_enabled?: boolean;
          sms_enabled?: boolean;
          message_template?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          enabled?: boolean;
          day_intervals?: number[];
          email_enabled?: boolean;
          sms_enabled?: boolean;
          message_template?: string;
          updated_at?: string;
        };
      };
      reminder_logs: {
        Row: {
          id: string;
          invoice_id: string;
          reminder_type: string;
          sent_at: string;
          status: string;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          reminder_type: string;
          sent_at?: string;
          status?: string;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          reminder_type?: string;
          sent_at?: string;
          status?: string;
          error_message?: string | null;
        };
      };
      nudge_events: {
        Row: {
          id: string;
          invoice_id: string;
          user_id: string;
          attempt_number: number;
          channel: 'sms' | 'email';
          sent_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          user_id: string;
          attempt_number: number;
          channel?: 'sms' | 'email';
          sent_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          user_id?: string;
          attempt_number?: number;
          channel?: 'sms' | 'email';
          sent_at?: string;
          metadata?: Json;
        };
      };
    };
    Enums: {
      invoice_status: InvoiceStatus;
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
export type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];
export type InvoiceItemUpdate = Database['public']['Tables']['invoice_items']['Update'];

export type VoiceNote = Database['public']['Tables']['voice_notes']['Row'];
export type VoiceNoteInsert = Database['public']['Tables']['voice_notes']['Insert'];
export type VoiceNoteUpdate = Database['public']['Tables']['voice_notes']['Update'];

export type GlossaryTerm = Database['public']['Tables']['glossary_terms']['Row'];

export type ReminderSettings = Database['public']['Tables']['reminder_settings']['Row'];
export type ReminderSettingsInsert = Database['public']['Tables']['reminder_settings']['Insert'];
export type ReminderSettingsUpdate = Database['public']['Tables']['reminder_settings']['Update'];

export type ReminderLog = Database['public']['Tables']['reminder_logs']['Row'];

export type NudgeEvent = Database['public']['Tables']['nudge_events']['Row'];
export type NudgeEventInsert = Database['public']['Tables']['nudge_events']['Insert'];
