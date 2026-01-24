/**
 * Stripe Service
 * Handles Stripe Connect operations
 * Per architecture-spec.md Section 4
 */

import { supabase } from "./supabase";
import { StripeAccountStatus } from "@/types";

/**
 * Get Stripe Connect onboarding URL
 */
export async function getConnectOnboardingUrl(): Promise<{
  url: string;
  accountId: string;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke<{
      url: string;
      account_id: string;
    }>("create-connect-account", {
      body: {
        return_url: "contractorpro://stripe/return",
        refresh_url: "contractorpro://stripe/refresh",
      },
    });

    if (error) {
      console.error("Edge Function error:", error);

      // Provide helpful error message
      if (error.message?.includes("non-2xx")) {
        throw new Error(
          "Stripe setup incomplete. Please ensure:\n" +
          "1. Edge Function is deployed\n" +
          "2. STRIPE_SECRET_KEY is set in Supabase secrets\n" +
          "3. Supabase project is properly configured"
        );
      }

      throw error;
    }

    return data
      ? { url: data.url, accountId: data.account_id }
      : null;
  } catch (error: any) {
    console.error("Error getting onboarding URL:", error);
    throw new Error(error.message || "Failed to connect to Stripe");
  }
}

/**
 * Check Stripe account status
 */
export async function getStripeAccountStatus(): Promise<StripeAccountStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        isConnected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        accountId: null,
      };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_account_id, charges_enabled, payouts_enabled")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return {
        isConnected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        accountId: null,
      };
    }

    return {
      isConnected: !!profile.stripe_account_id,
      chargesEnabled: profile.charges_enabled || false,
      payoutsEnabled: profile.payouts_enabled || false,
      accountId: profile.stripe_account_id,
    };
  } catch (error) {
    console.error("Error getting Stripe status:", error);
    return {
      isConnected: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      accountId: null,
    };
  }
}

/**
 * Generate payment link for an invoice (creates new Stripe session)
 */
export async function generatePaymentLink(invoiceId: string): Promise<{
  paymentLinkUrl: string;
  paymentIntentId: string;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke<{
      payment_link_url: string;
      payment_intent_id: string;
    }>("generate-payment-link", {
      body: { invoice_id: invoiceId },
    });

    if (error) throw error;

    return data
      ? {
          paymentLinkUrl: data.payment_link_url,
          paymentIntentId: data.payment_intent_id,
        }
      : null;
  } catch (error) {
    console.error("Error generating payment link:", error);
    throw error;
  }
}

/**
 * Get existing payment URL for an invoice (uses tracking URL)
 * This reuses the same link for all states (deposit, balance, full)
 * The customer page handles showing the right payment button
 *
 * IMPORTANT: This always returns the SAME link for an invoice.
 * "One Job → One Thread → One Link" principle.
 */
export async function getPaymentLink(invoiceId: string): Promise<{ url: string } | null> {
  try {
    // First check if invoice already has a tracking URL
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("tracking_id")
      .eq("id", invoiceId)
      .single();

    if (error || !invoice?.tracking_id) {
      // No tracking ID yet, generate a new payment link
      const result = await generatePaymentLink(invoiceId);
      return result ? { url: result.paymentLinkUrl } : null;
    }

    // Return the tracking URL - same link for all payment states
    // @ts-ignore - EXPO_PUBLIC_SUPABASE_URL is set in .env
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      console.warn("EXPO_PUBLIC_SUPABASE_URL not set, falling back to generating new link");
      const result = await generatePaymentLink(invoiceId);
      return result ? { url: result.paymentLinkUrl } : null;
    }

    // The tracking URL points to the customer payment page
    // which shows the appropriate button based on invoice state
    const trackingUrl = `${supabaseUrl}/functions/v1/track-invoice-view?id=${invoice.tracking_id}`;

    return { url: trackingUrl };
  } catch (error) {
    console.error("Error getting payment link:", error);
    return null;
  }
}

/**
 * Refresh Stripe account status from API
 */
export async function refreshAccountStatus(): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "refresh-stripe-status",
      {}
    );

    if (error) {
      console.error("Error refreshing status:", error);
    }
  } catch (error) {
    console.error("Error refreshing Stripe status:", error);
  }
}
