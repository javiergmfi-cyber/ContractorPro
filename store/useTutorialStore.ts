/**
 * Tutorial Store
 * Manages first-time user tutorial state with:
 * - Hydration gate (prevents flicker on app load)
 * - Per-user versioning (multi-account safe)
 * - Version bumping for future tutorial updates
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TutorialState {
  // Hydration gate (prevents flicker)
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  // Per-user versioning (multi-account safe)
  tutorialVersionSeenByUserId: Record<string, number>;
  getTutorialVersionSeen: (userId: string) => number;
  setTutorialVersionSeen: (userId: string, version: number) => void;

  // Reset for testing / replay
  resetTutorial: (userId: string) => void;
}

// Bump this when you ship tutorial improvements
// Users who saw v1 will automatically see v2
export const CURRENT_TUTORIAL_VERSION = 1;

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      tutorialVersionSeenByUserId: {},

      getTutorialVersionSeen: (userId) => {
        return get().tutorialVersionSeenByUserId[userId] ?? 0;
      },

      setTutorialVersionSeen: (userId, version) => {
        set((state) => ({
          tutorialVersionSeenByUserId: {
            ...state.tutorialVersionSeenByUserId,
            [userId]: version,
          },
        }));
      },

      resetTutorial: (userId) => {
        set((state) => ({
          tutorialVersionSeenByUserId: {
            ...state.tutorialVersionSeenByUserId,
            [userId]: 0,
          },
        }));
      },
    }),
    {
      name: 'tutorial-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        // ALWAYS set hydrated, even if rehydration fails
        // This prevents "stuck invisible tutorial" bugs
        // Only call setState once (avoid double updates on edge devices)
        if (state?.setHasHydrated) {
          state.setHasHydrated(true);
        } else {
          // Fallback: manually set via store if state methods unavailable
          useTutorialStore.setState({ hasHydrated: true });
        }
      },
    }
  )
);

// NOTE: currentStep is NOT persisted - kept in component state
// Reason: If user force-closes mid-tutorial, restart from Screen 1 is better UX
