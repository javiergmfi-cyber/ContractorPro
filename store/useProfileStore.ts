import { create } from "zustand";
import { Profile, ProfileUpdate } from "@/types/database";
import * as db from "@/services/database";

interface ProfileState {
  // Data
  profile: Profile | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  uploadLogo: (uri: string) => Promise<string | null>;

  // Reset
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  isSaving: false,

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

  reset: () =>
    set({
      profile: null,
      isLoading: false,
      isSaving: false,
    }),
}));
