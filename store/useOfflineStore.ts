import { create } from "zustand";
import * as offline from "@/services/offline";

interface OfflineState {
  // Connection state
  isOnline: boolean;
  isInitialized: boolean;

  // Pending counts
  pendingUploads: number;
  pendingOperations: number;
  draftCount: number;

  // Sync state
  isSyncing: boolean;
  lastSyncTime: string | null;

  // Actions
  initialize: () => Promise<void>;
  setOnline: (online: boolean) => void;
  syncNow: () => Promise<{ uploads: number; operations: number; errors: number }>;
  refreshCounts: () => Promise<void>;

  // Draft management
  getDrafts: () => Promise<offline.DraftInvoice[]>;
  saveDraft: (draft: Omit<offline.DraftInvoice, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  updateDraft: (id: string, updates: Partial<offline.DraftInvoice>) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;

  // Reset
  reset: () => void;
}

// Re-export types for convenience
export type { DraftInvoice } from "@/services/offline";

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  isInitialized: false,
  pendingUploads: 0,
  pendingOperations: 0,
  draftCount: 0,
  isSyncing: false,
  lastSyncTime: null,

  initialize: async () => {
    // Initialize offline service
    await offline.initOfflineService();

    // Subscribe to connection changes
    offline.subscribeToConnectionChanges((online) => {
      set({ isOnline: online });

      // Auto-sync when coming online
      if (online) {
        get().syncNow();
      }
    });

    // Get initial counts
    const counts = await offline.getPendingCounts();
    const lastSync = await offline.getLastSyncTime();

    set({
      isInitialized: true,
      isOnline: offline.checkIsOnline(),
      pendingUploads: counts.uploads,
      pendingOperations: counts.operations,
      draftCount: counts.drafts,
      lastSyncTime: lastSync,
    });
  },

  setOnline: (online) => {
    set({ isOnline: online });
  },

  syncNow: async () => {
    if (get().isSyncing || !get().isOnline) {
      return { uploads: 0, operations: 0, errors: 0 };
    }

    set({ isSyncing: true });

    try {
      const result = await offline.syncPendingItems();

      // Refresh counts after sync
      await get().refreshCounts();

      const lastSync = await offline.getLastSyncTime();
      set({ lastSyncTime: lastSync });

      return result;
    } finally {
      set({ isSyncing: false });
    }
  },

  refreshCounts: async () => {
    const counts = await offline.getPendingCounts();
    set({
      pendingUploads: counts.uploads,
      pendingOperations: counts.operations,
      draftCount: counts.drafts,
    });
  },

  getDrafts: async () => {
    return offline.getDraftInvoices();
  },

  saveDraft: async (draft) => {
    const id = await offline.saveDraftInvoice(draft);
    await get().refreshCounts();
    return id;
  },

  updateDraft: async (id, updates) => {
    await offline.updateDraftInvoice(id, updates);
  },

  deleteDraft: async (id) => {
    await offline.deleteDraftInvoice(id);
    await get().refreshCounts();
  },

  reset: () => {
    set({
      isOnline: true,
      isInitialized: false,
      pendingUploads: 0,
      pendingOperations: 0,
      draftCount: 0,
      isSyncing: false,
      lastSyncTime: null,
    });
  },
}));
