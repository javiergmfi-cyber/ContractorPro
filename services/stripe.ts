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

    if (error) throw error;

    return data
      ? { url: data.url, accountId: data.account_id }
      : null;
  } catch (error) {
    console.error("Error getting onboarding URL:", error);
    throw error;
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
 * Generate payment link for an invoice
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
