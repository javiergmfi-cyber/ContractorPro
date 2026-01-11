import { create } from "zustand";
import { Profile } from "../types";

interface ProfileState {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  resetProfile: () => void;
}

const defaultProfile: Profile = {
  id: "default",
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  logoUrl: undefined,
  taxRate: 0,
  currency: "USD",
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: defaultProfile,

  updateProfile: (updates) =>
    set((state) => ({
      profile: { ...state.profile, ...updates },
    })),

  resetProfile: () =>
    set(() => ({
      profile: defaultProfile,
    })),
}));
