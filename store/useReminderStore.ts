import { create } from "zustand";
import { ReminderSettings, ReminderSettingsInsert } from "@/types/database";
import * as db from "@/services/database";

interface ReminderState {
  // Data
  settings: ReminderSettings | null;
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<ReminderSettingsInsert>) => Promise<void>;
  toggleEnabled: () => Promise<void>;
  toggleSMS: () => Promise<void>;
  toggleEmail: () => Promise<void>;
  setDayIntervals: (intervals: number[]) => Promise<void>;
  setMessageTemplate: (template: string) => Promise<void>;

  // Reset
  reset: () => void;
}

const DEFAULT_SETTINGS: Omit<ReminderSettingsInsert, "user_id"> = {
  enabled: false,
  day_intervals: [3, 7, 14],
  email_enabled: true,
  sms_enabled: false,
  message_template:
    "This is an automated reminder for invoice {{invoice_number}} from {{business_name}}. Amount due: {{total}}. Please pay at your earliest convenience.",
};

export const useReminderStore = create<ReminderState>((set, get) => ({
  settings: null,
  isLoading: false,
  isSaving: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await db.getReminderSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      console.error("Error fetching reminder settings:", error);
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    set({ isSaving: true });
    try {
      const currentSettings = get().settings;
      const newSettings = {
        ...DEFAULT_SETTINGS,
        ...currentSettings,
        ...updates,
      };

      const saved = await db.upsertReminderSettings(newSettings);
      set({ settings: saved, isSaving: false });
    } catch (error) {
      console.error("Error updating reminder settings:", error);
      set({ isSaving: false });
      throw error;
    }
  },

  toggleEnabled: async () => {
    const current = get().settings;
    await get().updateSettings({ enabled: !current?.enabled });
  },

  toggleSMS: async () => {
    const current = get().settings;
    await get().updateSettings({ sms_enabled: !current?.sms_enabled });
  },

  toggleEmail: async () => {
    const current = get().settings;
    await get().updateSettings({ email_enabled: !current?.email_enabled });
  },

  setDayIntervals: async (intervals: number[]) => {
    await get().updateSettings({ day_intervals: intervals });
  },

  setMessageTemplate: async (template: string) => {
    await get().updateSettings({ message_template: template });
  },

  reset: () =>
    set({
      settings: null,
      isLoading: false,
      isSaving: false,
    }),
}));
