/**
 * Subscription Store
 * Manages subscription state, entitlements, and feature gating
 */

import { create } from "zustand";
import { CustomerInfo, PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import * as purchases from "@/services/purchases";

interface SubscriptionState {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  error: string | null;

  // Actions
  initialize: (userId?: string) => Promise<void>;
  loginUser: (userId: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  fetchOfferings: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;

  // Feature Gating Checks
  canUseBadCopAutopilot: () => boolean;
  canUseReadReceipts: () => boolean;
  canUseCustomBranding: () => boolean;
  canUseInstantPayouts: () => boolean;

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

  // Feature Gating Checks (Pro-only features)
  canUseBadCopAutopilot: () => get().isPro,
  canUseReadReceipts: () => get().isPro,
  canUseCustomBranding: () => get().isPro,
  canUseInstantPayouts: () => get().isPro,

  reset: () =>
    set({
      isInitialized: false,
      isLoading: false,
      isPro: false,
      customerInfo: null,
      offerings: null,
      error: null,
    }),
}));

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
