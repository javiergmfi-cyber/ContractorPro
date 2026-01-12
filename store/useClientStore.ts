import { create } from "zustand";
import { Client, ClientInsert, ClientUpdate } from "@/types/database";
import * as db from "@/services/database";

interface ClientState {
  // Data
  clients: Client[];
  currentClient: Client | null;
  searchResults: Client[];

  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  isSaving: boolean;

  // Actions
  fetchClients: () => Promise<void>;
  fetchClient: (id: string) => Promise<void>;
  createClient: (client: Omit<ClientInsert, "user_id">) => Promise<Client | null>;
  updateClient: (id: string, updates: ClientUpdate) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  searchClients: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Reset
  reset: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  currentClient: null,
  searchResults: [],
  isLoading: false,
  isSearching: false,
  isSaving: false,

  fetchClients: async () => {
    set({ isLoading: true });
    try {
      const clients = await db.getClients();
      set({ clients, isLoading: false });
    } catch (error) {
      console.error("Error fetching clients:", error);
      set({ isLoading: false });
    }
  },

  fetchClient: async (id: string) => {
    set({ isLoading: true });
    try {
      const client = await db.getClient(id);
      set({ currentClient: client, isLoading: false });
    } catch (error) {
      console.error("Error fetching client:", error);
      set({ isLoading: false });
    }
  },

  createClient: async (client) => {
    set({ isSaving: true });
    try {
      const newClient = await db.createClient(client);
      if (newClient) {
        set((state) => ({
          clients: [...state.clients, newClient].sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
          isSaving: false,
        }));
        return newClient;
      }
      set({ isSaving: false });
      return null;
    } catch (error) {
      console.error("Error creating client:", error);
      set({ isSaving: false });
      throw error;
    }
  },

  updateClient: async (id: string, updates: ClientUpdate) => {
    set({ isSaving: true });
    try {
      const updated = await db.updateClient(id, updates);
      if (updated) {
        set((state) => ({
          clients: state.clients
            .map((c) => (c.id === id ? updated : c))
            .sort((a, b) => a.name.localeCompare(b.name)),
          currentClient:
            state.currentClient?.id === id ? updated : state.currentClient,
          isSaving: false,
        }));
      } else {
        set({ isSaving: false });
      }
    } catch (error) {
      console.error("Error updating client:", error);
      set({ isSaving: false });
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    try {
      const success = await db.deleteClient(id);
      if (success) {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          currentClient:
            state.currentClient?.id === id ? null : state.currentClient,
        }));
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  },

  searchClients: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearching: true });
    try {
      const results = await db.searchClients(query);
      set({ searchResults: results, isSearching: false });
    } catch (error) {
      console.error("Error searching clients:", error);
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ searchResults: [] }),

  reset: () =>
    set({
      clients: [],
      currentClient: null,
      searchResults: [],
      isLoading: false,
      isSearching: false,
      isSaving: false,
    }),
}));
