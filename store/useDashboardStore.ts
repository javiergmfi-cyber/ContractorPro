import { create } from "zustand";
import { DashboardStats } from "@/types";
import * as db from "@/services/database";

interface DashboardState {
  // Data
  stats: DashboardStats;

  // Loading state
  isLoading: boolean;

  // Actions
  fetchDashboardStats: () => Promise<void>;

  // Reset
  reset: () => void;
}

const defaultStats: DashboardStats = {
  totalRevenue: 0,
  pendingAmount: 0,
  invoiceCount: 0,
  paidCount: 0,
  overdueCount: 0,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: defaultStats,
  isLoading: false,

  fetchDashboardStats: async () => {
    set({ isLoading: true });
    try {
      const stats = await db.getDashboardStats();
      set({ stats, isLoading: false });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      set({ isLoading: false });
    }
  },

  reset: () =>
    set({
      stats: defaultStats,
      isLoading: false,
    }),
}));
