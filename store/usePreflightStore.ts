/**
 * Pre-Flight Check Store
 * Manages the daily reminder review workflow
 */

import { create } from "zustand";
import {
  PendingReminder,
  getPendingReminders,
  cancelReminder,
  sendApprovedReminders,
} from "@/services/preflight";

interface PreflightState {
  // State
  isLoading: boolean;
  isVisible: boolean;
  pendingReminders: PendingReminder[];
  cancelledIds: Set<string>;
  lastChecked: Date | null;

  // Actions
  fetchPendingReminders: () => Promise<void>;
  showPreflightModal: () => void;
  hidePreflightModal: () => void;
  toggleCancelReminder: (invoiceId: string) => void;
  cancelSingleReminder: (invoiceId: string) => Promise<void>;
  sendAllReminders: () => Promise<{ sent: number; failed: number }>;
  cancelAllReminders: () => void;

  // Reset
  reset: () => void;
}

export const usePreflightStore = create<PreflightState>((set, get) => ({
  isLoading: false,
  isVisible: false,
  pendingReminders: [],
  cancelledIds: new Set(),
  lastChecked: null,

  fetchPendingReminders: async () => {
    set({ isLoading: true });
    try {
      const reminders = await getPendingReminders();
      set({
        pendingReminders: reminders,
        isLoading: false,
        lastChecked: new Date(),
        cancelledIds: new Set(), // Reset cancelled on fresh fetch
      });
    } catch (error) {
      console.error("[PreflightStore] Error fetching reminders:", error);
      set({ isLoading: false });
    }
  },

  showPreflightModal: () => {
    set({ isVisible: true });
    // Fetch latest reminders when showing modal
    get().fetchPendingReminders();
  },

  hidePreflightModal: () => {
    set({ isVisible: false });
  },

  toggleCancelReminder: (invoiceId: string) => {
    const { cancelledIds } = get();
    const newCancelled = new Set(cancelledIds);

    if (newCancelled.has(invoiceId)) {
      newCancelled.delete(invoiceId);
    } else {
      newCancelled.add(invoiceId);
    }

    set({ cancelledIds: newCancelled });
  },

  cancelSingleReminder: async (invoiceId: string) => {
    const success = await cancelReminder(invoiceId);
    if (success) {
      const { cancelledIds } = get();
      const newCancelled = new Set(cancelledIds);
      newCancelled.add(invoiceId);
      set({ cancelledIds: newCancelled });
    }
  },

  sendAllReminders: async () => {
    const { pendingReminders, cancelledIds } = get();

    // Filter out cancelled reminders
    const remindersToSend = pendingReminders.filter(
      (r) => !cancelledIds.has(r.invoice.id)
    );

    set({ isLoading: true });

    try {
      const result = await sendApprovedReminders(remindersToSend);
      set({
        isLoading: false,
        isVisible: false,
        pendingReminders: [],
        cancelledIds: new Set(),
      });
      return result;
    } catch (error) {
      console.error("[PreflightStore] Error sending reminders:", error);
      set({ isLoading: false });
      return { sent: 0, failed: remindersToSend.length };
    }
  },

  cancelAllReminders: () => {
    // Cancel all for today (snooze)
    set({
      isVisible: false,
      pendingReminders: [],
      cancelledIds: new Set(),
    });
  },

  reset: () =>
    set({
      isLoading: false,
      isVisible: false,
      pendingReminders: [],
      cancelledIds: new Set(),
      lastChecked: null,
    }),
}));

/**
 * Hook to get the count of pending reminders (for badge display)
 */
export function usePendingReminderCount(): number {
  return usePreflightStore((state) => state.pendingReminders.length);
}
