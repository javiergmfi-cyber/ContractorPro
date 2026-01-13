import { create } from "zustand";
import { Profile, ProfileUpdate } from "@/types/database";
import * as db from "@/services/database";
import { supabase } from "@/lib/supabase";

// Free tier invoice limit per month
const FREE_TIER_MONTHLY_LIMIT = 3;

interface ProfileState {
  // Data
  profile: Profile | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Selectors
  isPro: () => boolean;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  uploadLogo: (uri: string) => Promise<string | null>;
  checkUsageLimit: () => Promise<boolean>;

  // Reset
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  isSaving: false,

  // Selector: Check if user is on Pro tier
  isPro: () => {
    const { profile } = get();
    return profile?.subscription_tier === "pro";
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await db.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      console.error("Error fetching profile:", error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: ProfileUpdate) => {
    set({ isSaving: true });
    try {
      const updated = await db.updateProfile(updates);
      if (updated) {
        set({ profile: updated, isSaving: false });
      } else {
        set({ isSaving: false });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      set({ isSaving: false });
      throw error;
    }
  },

  uploadLogo: async (uri: string) => {
    try {
      const fileName = `logo-${Date.now()}.jpg`;
      const logoUrl = await db.uploadLogo(uri, fileName);

      if (logoUrl) {
        // Update profile with new logo URL
        await get().updateProfile({ logo_url: logoUrl });
        return logoUrl;
      }
      return null;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  },

  // Check if user can create more invoices this month
  checkUsageLimit: async () => {
    const { isPro, profile } = get();

    // Pro users have unlimited invoices
    if (isPro()) {
      return true;
    }

    // Free tier: count invoices created this month
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfMonthISO = startOfMonth.toISOString();

      const { count, error } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile?.id)
        .gte("created_at", startOfMonthISO);

      if (error) {
        console.error("Error checking usage limit:", error);
        // Fail open - allow creation if we can't check
        return true;
      }

      return (count ?? 0) < FREE_TIER_MONTHLY_LIMIT;
    } catch (error) {
      console.error("Error checking usage limit:", error);
      // Fail open - allow creation if we can't check
      return true;
    }
  },

  reset: () =>
    set({
      profile: null,
      isLoading: false,
      isSaving: false,
    }),
}));
