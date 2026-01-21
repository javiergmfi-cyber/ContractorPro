import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Onboarding Store
 * Tracks FTUE calibration and setup progress
 */

interface SetupTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

interface OnboardingState {
  // Calibration sequence completed
  hasCalibrated: boolean;

  // Setup tasks for zero state
  setupTasks: SetupTask[];

  // Track if user has seen the blueprint dashboard
  hasSeenBlueprint: boolean;

  // Actions
  completeCalibration: () => void;
  completeTask: (taskId: string) => void;
  markBlueprintSeen: () => void;
  resetOnboarding: () => void;

  // Computed
  isSetupComplete: () => boolean;
  requiredTasksComplete: () => boolean;
}

const DEFAULT_SETUP_TASKS: SetupTask[] = [
  {
    id: "stripe_connect",
    title: "Link Payout Account",
    description: "Connect Stripe to enable instant deposits.",
    completed: false,
    required: true,
  },
  {
    id: "upload_logo",
    title: "Upload Business Identity",
    description: "Add logo to increase client trust by 40%.",
    completed: false,
    required: false,
  },
  {
    id: "test_invoice",
    title: "Create First Invoice",
    description: "Experience the speed of voice-to-invoice.",
    completed: false,
    required: false,
  },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      hasCalibrated: false,
      setupTasks: DEFAULT_SETUP_TASKS,
      hasSeenBlueprint: false,

      completeCalibration: () => {
        set({ hasCalibrated: true });
      },

      completeTask: (taskId: string) => {
        set((state) => ({
          setupTasks: state.setupTasks.map((task) =>
            task.id === taskId ? { ...task, completed: true } : task
          ),
        }));
      },

      markBlueprintSeen: () => {
        set({ hasSeenBlueprint: true });
      },

      resetOnboarding: () => {
        set({
          hasCalibrated: false,
          setupTasks: DEFAULT_SETUP_TASKS,
          hasSeenBlueprint: false,
        });
      },

      isSetupComplete: () => {
        return get().setupTasks.every((task) => task.completed);
      },

      requiredTasksComplete: () => {
        return get()
          .setupTasks.filter((task) => task.required)
          .every((task) => task.completed);
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
