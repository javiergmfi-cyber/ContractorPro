/**
 * Activity Store
 * Manages the activity feed state
 */

import { create } from "zustand";
import {
  ActivityEvent,
  getRecentActivity,
  createActivityEvent,
  CreateActivityEventInput,
} from "@/services/activity";

interface ActivityState {
  // State
  events: ActivityEvent[];
  isLoading: boolean;
  lastFetched: Date | null;

  // Actions
  fetchRecentActivity: (limit?: number) => Promise<void>;
  addEvent: (input: CreateActivityEventInput) => Promise<void>;
  refreshActivity: () => Promise<void>;

  // Reset
  reset: () => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  events: [],
  isLoading: false,
  lastFetched: null,

  fetchRecentActivity: async (limit = 15) => {
    set({ isLoading: true });
    try {
      const events = await getRecentActivity(limit);
      set({
        events,
        isLoading: false,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error("[ActivityStore] Error fetching activity:", error);
      set({ isLoading: false });
    }
  },

  addEvent: async (input) => {
    try {
      const event = await createActivityEvent(input);
      if (event) {
        // Add to front of events array
        const currentEvents = get().events;
        set({ events: [event, ...currentEvents].slice(0, 15) });
      }
    } catch (error) {
      console.error("[ActivityStore] Error adding event:", error);
    }
  },

  refreshActivity: async () => {
    const { fetchRecentActivity } = get();
    await fetchRecentActivity();
  },

  reset: () =>
    set({
      events: [],
      isLoading: false,
      lastFetched: null,
    }),
}));

/**
 * Hook to get unread activity count (for badge)
 */
export function useUnreadActivityCount(): number {
  const lastFetched = useActivityStore((state) => state.lastFetched);
  const events = useActivityStore((state) => state.events);

  if (!lastFetched) return 0;

  // Count events created after last fetch
  return events.filter(
    (e) => new Date(e.created_at) > lastFetched
  ).length;
}
