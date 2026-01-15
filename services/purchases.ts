/**
 * RevenueCat Purchases Service
 * Handles subscription management, entitlements, and purchases
 */

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

// RevenueCat API Keys (replace with your actual keys)
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || "appl_your_ios_key";
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || "goog_your_android_key";

// Entitlement identifier (configured in RevenueCat dashboard)
export const PRO_ENTITLEMENT_ID = "pro";

// Product identifiers
export const PRODUCTS = {
  MONTHLY: "contractorpro_pro_monthly",
  ANNUAL: "contractorpro_pro_annual",
} as const;

/**
 * Initialize RevenueCat SDK
 * Call this at app startup
 */
export async function initializePurchases(userId?: string): Promise<void> {
  try {
    // Set log level for debugging (disable in production)
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure with appropriate API key
    const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;

    await Purchases.configure({
      apiKey,
      appUserID: userId, // Link to Supabase user ID
    });

    console.log("[Purchases] RevenueCat initialized");
  } catch (error) {
    console.error("[Purchases] Failed to initialize:", error);
    throw error;
  }
}

/**
 * Login user to RevenueCat (call after Supabase auth)
 */
export async function loginUser(userId: string): Promise<CustomerInfo> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    console.log("[Purchases] User logged in:", userId);
    return customerInfo;
  } catch (error) {
    console.error("[Purchases] Login failed:", error);
    throw error;
  }
}

/**
 * Logout user from RevenueCat
 */
export async function logoutUser(): Promise<void> {
  try {
    await Purchases.logOut();
    console.log("[Purchases] User logged out");
  } catch (error) {
    console.error("[Purchases] Logout failed:", error);
  }
}

/**
 * Get current customer info (entitlements, subscriptions)
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("[Purchases] Failed to get customer info:", error);
    throw error;
  }
}

/**
 * Check if user has Pro entitlement
 */
export async function checkProStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error("[Purchases] Failed to check pro status:", error);
    return false;
  }
}

/**
 * Get available offerings (packages to purchase)
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error("[Purchases] Failed to get offerings:", error);
    return null;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    // Sync subscription status to Supabase
    await syncSubscriptionToSupabase(customerInfo);

    return { success: true, customerInfo };
  } catch (error: any) {
    // Check for user cancellation
    if (error.userCancelled) {
      return { success: false, error: "cancelled" };
    }

    console.error("[Purchases] Purchase failed:", error);
    return { success: false, error: error.message || "Purchase failed" };
  }
}

/**
 * Restore purchases (for users who reinstall or switch devices)
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();

    // Sync subscription status to Supabase
    await syncSubscriptionToSupabase(customerInfo);

    return { success: true, customerInfo };
  } catch (error: any) {
    console.error("[Purchases] Restore failed:", error);
    return { success: false, error: error.message || "Restore failed" };
  }
}

/**
 * Sync subscription status to Supabase profile
 */
export async function syncSubscriptionToSupabase(
  customerInfo: CustomerInfo
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isPro = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
    const proEntitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];

    // Determine subscription status
    let subscriptionStatus: "free" | "active" | "canceled" | "past_due" | "trialing" = "free";
    if (proEntitlement) {
      if (proEntitlement.willRenew) {
        subscriptionStatus = "active";
      } else {
        subscriptionStatus = "canceled"; // Will expire at period end
      }
    }

    // Update Supabase profile
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_tier: isPro ? "pro" : "free",
        subscription_status: subscriptionStatus,
        current_period_end: proEntitlement?.expirationDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("[Purchases] Failed to sync to Supabase:", error);
    } else {
      console.log("[Purchases] Synced subscription to Supabase:", {
        tier: isPro ? "pro" : "free",
        status: subscriptionStatus,
      });
    }
  } catch (error) {
    console.error("[Purchases] Sync error:", error);
  }
}

/**
 * Add listener for customer info updates
 */
export function addCustomerInfoUpdateListener(
  callback: (customerInfo: CustomerInfo) => void
): () => void {
  const listener = Purchases.addCustomerInfoUpdateListener(callback);
  return () => listener.remove();
}

/**
 * Format price for display
 */
export function formatPackagePrice(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}

/**
 * Get subscription period text
 */
export function getPackagePeriod(pkg: PurchasesPackage): string {
  const identifier = pkg.packageType;
  switch (identifier) {
    case "MONTHLY":
      return "month";
    case "ANNUAL":
      return "year";
    case "WEEKLY":
      return "week";
    default:
      return "period";
  }
}
