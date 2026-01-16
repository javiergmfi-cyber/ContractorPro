/**
 * Subscription Store
 * Manages subscription state, entitlements, and feature gating
 */

import { create } from "zustand";
import { CustomerInfo, PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import * as purchases from "@/services/purchases";

// Free tier limits
const FREE_MONTHLY_SEND_LIMIT = 10;

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
  canUseReadReceipts: () => boolean;
  canUseCustomBranding: () => boolean;
  canUseInstantPayouts: () => boolean;
  canExport: () => boolean;

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

  initialize: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });
      await purchases.initializePurchases(userId);

      // Get current customer info
      const customerInfo = await purchases.getCustomerInfo();
      const isPro = await purchases.checkProStatus();

      // Fetch offerings
      const offerings = await purchases.getOfferings();

      set({
        isInitialized: true,
        isLoading: false,
        customerInfo,
        isPro,
        offerings,
      });

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
  canUseReadReceipts: () => get().isPro,
  canUseCustomBranding: () => get().isPro,
  canUseInstantPayouts: () => get().isPro,
  canExport: () => get().isPro,

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
    }),
}));

// Export the free tier limit for use elsewhere
export const FREE_SENDS_PER_MONTH = FREE_MONTHLY_SEND_LIMIT;

/**
 * Hook for checking feature availability with contextual paywall trigger
 */
export function useFeatureGate(feature: "badCop" | "readReceipts" | "branding" | "payouts") {
  const { isPro, canUseBadCopAutopilot, canUseReadReceipts, canUseCustomBranding, canUseInstantPayouts } =
    useSubscriptionStore();

  const checkFeature = () => {
    switch (feature) {
      case "badCop":
        return canUseBadCopAutopilot();
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
