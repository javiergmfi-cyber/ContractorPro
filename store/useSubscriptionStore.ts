/**
 * Subscription Store
 * Manages subscription state, entitlements, and feature gating
 */

import { create } from "zustand";
import { CustomerInfo, PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import * as purchases from "@/services/purchases";
import { supabase } from "@/lib/supabase";

// Free tier limits - Tightened to drive conversion
// At 3 invoices/month, contractors hit the wall in week 1 and feel the pain
const FREE_MONTHLY_SEND_LIMIT = 3;

interface SubscriptionState {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  error: string | null;

  // Send limit tracking
  sendsThisMonth: number;
  sendLimitReached: boolean;

  // Trial state
  hasClaimedTrial: boolean;
  trialEndsAt: Date | null;
  isInTrial: boolean;

  // Actions
  initialize: (userId?: string) => Promise<void>;
  loginUser: (userId: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  fetchOfferings: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;

  // Send limit actions
  setSendsThisMonth: (count: number) => void;
  canSendInvoice: () => boolean;
  getRemainingInvoiceSends: () => number;

  // Feature Gating Checks
  canUseBadCopAutopilot: () => boolean;
  canUseAutoNudge: () => boolean;
  canUseReadReceipts: () => boolean;
  canUseCustomBranding: () => boolean;
  canUseInstantPayouts: () => boolean;
  canExport: () => boolean;

  // Trial Actions
  checkTrialEligibility: () => Promise<boolean>;
  startTrial: () => Promise<void>;
  getTrialDaysRemaining: () => number;
  loadTrialStatus: () => Promise<void>;

  // Reset
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isInitialized: false,
  isLoading: false,
  isPro: false,
  customerInfo: null,
  offerings: null,
  error: null,
  sendsThisMonth: 0,
  sendLimitReached: false,
  hasClaimedTrial: false,
  trialEndsAt: null,
  isInTrial: false,

  initialize: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });
      await purchases.initializePurchases(userId);

      // Get current customer info
      const customerInfo = await purchases.getCustomerInfo();
      const isPro = await purchases.checkProStatus();

      // Fetch offerings
      const offerings = await purchases.getOfferings();

      // Detect trial status from RevenueCat
      const proEntitlement = customerInfo.entitlements.active[purchases.PRO_ENTITLEMENT_ID];
      const isInTrial = proEntitlement?.periodType === "TRIAL";
      const trialEndsAt = proEntitlement?.expirationDate ? new Date(proEntitlement.expirationDate) : null;

      set({
        isInitialized: true,
        isLoading: false,
        customerInfo,
        isPro,
        offerings,
        isInTrial,
        trialEndsAt,
      });

      // Load trial claim status from Supabase
      get().loadTrialStatus();

      // Add listener for updates
      purchases.addCustomerInfoUpdateListener((info) => {
        const isPro = info.entitlements.active[purchases.PRO_ENTITLEMENT_ID] !== undefined;
        set({ customerInfo: info, isPro });

        // Sync to Supabase
        purchases.syncSubscriptionToSupabase(info);
      });
    } catch (error: any) {
      console.error("[SubscriptionStore] Initialize failed:", error);
      set({ isLoading: false, error: error.message, isInitialized: true });
    }
  },

  loginUser: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const customerInfo = await purchases.loginUser(userId);
      const isPro = customerInfo.entitlements.active[purchases.PRO_ENTITLEMENT_ID] !== undefined;
      set({ customerInfo, isPro, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  logoutUser: async () => {
    try {
      await purchases.logoutUser();
      set({ customerInfo: null, isPro: false });
    } catch (error: any) {
      console.error("[SubscriptionStore] Logout failed:", error);
    }
  },

  refreshStatus: async () => {
    try {
      set({ isLoading: true });
      const customerInfo = await purchases.getCustomerInfo();
      const isPro = customerInfo.entitlements.active[purchases.PRO_ENTITLEMENT_ID] !== undefined;
      set({ customerInfo, isPro, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
    }
  },

  fetchOfferings: async () => {
    try {
      const offerings = await purchases.getOfferings();
      set({ offerings });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  purchasePackage: async (pkg: PurchasesPackage) => {
    try {
      set({ isLoading: true, error: null });
      const result = await purchases.purchasePackage(pkg);

      if (result.success && result.customerInfo) {
        const isPro = result.customerInfo.entitlements.active[purchases.PRO_ENTITLEMENT_ID] !== undefined;
        set({ customerInfo: result.customerInfo, isPro, isLoading: false });
        return { success: true };
      }

      set({ isLoading: false, error: result.error });
      return { success: false, error: result.error };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  restorePurchases: async () => {
    try {
      set({ isLoading: true, error: null });
      const result = await purchases.restorePurchases();

      if (result.success && result.customerInfo) {
        const isPro = result.customerInfo.entitlements.active[purchases.PRO_ENTITLEMENT_ID] !== undefined;
        set({ customerInfo: result.customerInfo, isPro, isLoading: false });
        return { success: true };
      }

      set({ isLoading: false, error: result.error });
      return { success: false, error: result.error };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Send limit tracking
  setSendsThisMonth: (count: number) => {
    const { isPro } = get();
    set({
      sendsThisMonth: count,
      sendLimitReached: !isPro && count >= FREE_MONTHLY_SEND_LIMIT,
    });
  },

  canSendInvoice: () => {
    const { isPro, sendsThisMonth } = get();
    if (isPro) return true;
    return sendsThisMonth < FREE_MONTHLY_SEND_LIMIT;
  },

  getRemainingInvoiceSends: () => {
    const { isPro, sendsThisMonth } = get();
    if (isPro) return Infinity;
    return Math.max(0, FREE_MONTHLY_SEND_LIMIT - sendsThisMonth);
  },

  // Feature Gating Checks (Pro-only features)
  canUseBadCopAutopilot: () => get().isPro,
  canUseAutoNudge: () => get().isPro,
  canUseReadReceipts: () => get().isPro,
  canUseCustomBranding: () => get().isPro,
  canUseInstantPayouts: () => get().isPro,
  canExport: () => get().isPro,

  // Trial Actions
  loadTrialStatus: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("has_claimed_trial, trial_started_at, trial_ends_at")
        .eq("id", user.id)
        .single();

      if (profile) {
        set({
          hasClaimedTrial: profile.has_claimed_trial || false,
          trialEndsAt: profile.trial_ends_at ? new Date(profile.trial_ends_at) : null,
        });
      }
    } catch (error) {
      console.error("[SubscriptionStore] Failed to load trial status:", error);
    }
  },

  checkTrialEligibility: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from("profiles")
        .select("has_claimed_trial")
        .eq("id", user.id)
        .single();

      return !profile?.has_claimed_trial;
    } catch (error) {
      console.error("[SubscriptionStore] Failed to check trial eligibility:", error);
      return false;
    }
  },

  startTrial: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const trialEndsAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days

      // Mark trial as claimed in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          has_claimed_trial: true,
          trial_started_at: now.toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      set({
        hasClaimedTrial: true,
        trialEndsAt,
        isInTrial: true,
      });

      console.log("[SubscriptionStore] Trial started, ends at:", trialEndsAt);
    } catch (error) {
      console.error("[SubscriptionStore] Failed to start trial:", error);
      throw error;
    }
  },

  getTrialDaysRemaining: () => {
    const { trialEndsAt, isInTrial } = get();
    if (!isInTrial || !trialEndsAt) return 0;
    const diff = trialEndsAt.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  },

  reset: () =>
    set({
      isInitialized: false,
      isLoading: false,
      isPro: false,
      customerInfo: null,
      offerings: null,
      error: null,
      sendsThisMonth: 0,
      sendLimitReached: false,
      hasClaimedTrial: false,
      trialEndsAt: null,
      isInTrial: false,
    }),
}));

// Export the free tier limit for use elsewhere
export const FREE_SENDS_PER_MONTH = FREE_MONTHLY_SEND_LIMIT;

/**
 * Hook for checking feature availability with contextual paywall trigger
 */
export function useFeatureGate(feature: "badCop" | "autoNudge" | "readReceipts" | "branding" | "payouts") {
  const { isPro, canUseBadCopAutopilot, canUseAutoNudge, canUseReadReceipts, canUseCustomBranding, canUseInstantPayouts } =
    useSubscriptionStore();

  const checkFeature = () => {
    switch (feature) {
      case "badCop":
        return canUseBadCopAutopilot();
      case "autoNudge":
        return canUseAutoNudge();
      case "readReceipts":
        return canUseReadReceipts();
      case "branding":
        return canUseCustomBranding();
      case "payouts":
        return canUseInstantPayouts();
      default:
        return false;
    }
  };

  return {
    isAvailable: checkFeature(),
    isPro,
  };
}
