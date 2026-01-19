// @ts-nocheck
/**
 * Offline Service
 * Handles offline data sync, queued uploads, and local draft storage
 * Per product-strategy.md - contractors often work in areas with poor connectivity
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "@/lib/supabase";
import { Invoice, InvoiceItem } from "@/types";

// Storage keys
const STORAGE_KEYS = {
  PENDING_UPLOADS: "offline:pending_uploads",
  DRAFT_INVOICES: "offline:draft_invoices",
  PENDING_VOICE_NOTES: "offline:pending_voice_notes",
  SYNC_QUEUE: "offline:sync_queue",
  LAST_SYNC: "offline:last_sync",
};

// Types
interface PendingUpload {
  id: string;
  type: "voice_note" | "logo" | "invoice_pdf";
  localUri: string;
  storagePath: string;
  metadata?: Record<string, any>;
  createdAt: string;
  retryCount: number;
}

export interface DraftInvoice {
  id: string;
  clientName?: string;
  clientId?: string;
  items: Partial<InvoiceItem>[];
  notes?: string;
  transcript?: string;
  voiceNoteUri?: string;
  createdAt: string;
  updatedAt: string;
}

interface SyncQueueItem {
  id: string;
  action: "create" | "update" | "delete";
  table: string;
  data: Record<string, any>;
  createdAt: string;
  retryCount: number;
}

// Connection state
let isOnline = true;
let connectionListeners: ((online: boolean) => void)[] = [];

/**
 * Initialize offline service and start monitoring connectivity
 */
export async function initOfflineService(): Promise<void> {
  // Get initial connection state
  const state = await NetInfo.fetch();
  isOnline = state.isConnected ?? true;

  // Subscribe to connection changes
  NetInfo.addEventListener(handleConnectionChange);

  // If online, try to sync any pending items
  if (isOnline) {
    syncPendingItems();
  }
}

/**
 * Handle connection state changes
 */
function handleConnectionChange(state: NetInfoState): void {
  const wasOnline = isOnline;
  isOnline = state.isConnected ?? true;

  // Notify listeners
  connectionListeners.forEach((listener) => listener(isOnline));

  // If we just came online, sync pending items
  if (!wasOnline && isOnline) {
    console.log("Connection restored, syncing pending items...");
    syncPendingItems();
  }
}

/**
 * Subscribe to connection changes
 */
export function subscribeToConnectionChanges(
  callback: (online: boolean) => void
): () => void {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter((cb) => cb !== callback);
  };
}

/**
 * Check if currently online
 */
export function checkIsOnline(): boolean {
  return isOnline;
}

// =============================================================================
// PENDING UPLOADS (Voice Notes, Logos, PDFs)
// =============================================================================

/**
 * Queue a file for upload when online
 */
export async function queueUpload(upload: Omit<PendingUpload, "id" | "createdAt" | "retryCount">): Promise<string> {
  const pending = await getPendingUploads();

  const newUpload: PendingUpload = {
    ...upload,
    id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  pending.push(newUpload);
  await AsyncStorage.setItem(STORAGE_KEYS.PENDING_UPLOADS, JSON.stringify(pending));

  // Try to upload immediately if online
  if (isOnline) {
    processUploadQueue();
  }

  return newUpload.id;
}

/**
 * Get all pending uploads
 */
export async function getPendingUploads(): Promise<PendingUpload[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_UPLOADS);
  return data ? JSON.parse(data) : [];
}

/**
 * Process the upload queue
 */
async function processUploadQueue(): Promise<void> {
  const pending = await getPendingUploads();
  if (pending.length === 0) return;

  const remaining: PendingUpload[] = [];

  for (const upload of pending) {
    try {
      // Check if file still exists
      const fileInfo = await FileSystem.getInfoAsync(upload.localUri);
      if (!fileInfo.exists) {
        console.log(`File no longer exists: ${upload.localUri}`);
        continue;
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(upload.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Determine content type
      const contentType = getContentType(upload.localUri);

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(getBucketName(upload.type))
        .upload(upload.storagePath, decode(base64), {
          contentType,
          upsert: true,
        });

      if (error) {
        throw error;
      }

      console.log(`Successfully uploaded: ${upload.storagePath}`);

      // Delete local file after successful upload
      await FileSystem.deleteAsync(upload.localUri, { idempotent: true });
    } catch (error) {
      console.error(`Failed to upload ${upload.id}:`, error);

      // Increment retry count
      upload.retryCount++;

      // Keep in queue if under max retries
      if (upload.retryCount < 5) {
        remaining.push(upload);
      } else {
        console.error(`Max retries exceeded for upload: ${upload.id}`);
      }
    }
  }

  await AsyncStorage.setItem(STORAGE_KEYS.PENDING_UPLOADS, JSON.stringify(remaining));
}

// =============================================================================
// DRAFT INVOICES
// =============================================================================

/**
 * Save a draft invoice locally
 */
export async function saveDraftInvoice(draft: Omit<DraftInvoice, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const drafts = await getDraftInvoices();

  const newDraft: DraftInvoice = {
    ...draft,
    id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  drafts.push(newDraft);
  await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_INVOICES, JSON.stringify(drafts));

  return newDraft.id;
}

/**
 * Update an existing draft invoice
 */
export async function updateDraftInvoice(id: string, updates: Partial<DraftInvoice>): Promise<void> {
  const drafts = await getDraftInvoices();
  const index = drafts.findIndex((d) => d.id === id);

  if (index !== -1) {
    drafts[index] = {
      ...drafts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_INVOICES, JSON.stringify(drafts));
  }
}

/**
 * Get all draft invoices
 */
export async function getDraftInvoices(): Promise<DraftInvoice[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT_INVOICES);
  return data ? JSON.parse(data) : [];
}

/**
 * Get a specific draft invoice
 */
export async function getDraftInvoice(id: string): Promise<DraftInvoice | null> {
  const drafts = await getDraftInvoices();
  return drafts.find((d) => d.id === id) || null;
}

/**
 * Delete a draft invoice
 */
export async function deleteDraftInvoice(id: string): Promise<void> {
  const drafts = await getDraftInvoices();
  const filtered = drafts.filter((d) => d.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_INVOICES, JSON.stringify(filtered));
}

// =============================================================================
// SYNC QUEUE (Database Operations)
// =============================================================================

/**
 * Queue a database operation for when online
 */
export async function queueDatabaseOperation(
  action: "create" | "update" | "delete",
  table: string,
  data: Record<string, any>
): Promise<string> {
  const queue = await getSyncQueue();

  const item: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action,
    table,
    data,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  queue.push(item);
  await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));

  // Try to sync immediately if online
  if (isOnline) {
    processSyncQueue();
  }

  return item.id;
}

/**
 * Get all items in sync queue
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
  return data ? JSON.parse(data) : [];
}

/**
 * Process the sync queue
 */
async function processSyncQueue(): Promise<void> {
  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      let error;

      switch (item.action) {
        case "create":
          ({ error } = await supabase.from(item.table).insert(item.data));
          break;
        case "update":
          const { id, ...updateData } = item.data;
          ({ error } = await supabase.from(item.table).update(updateData).eq("id", id));
          break;
        case "delete":
          ({ error } = await supabase.from(item.table).delete().eq("id", item.data.id));
          break;
      }

      if (error) {
        throw error;
      }

      console.log(`Successfully synced: ${item.action} on ${item.table}`);
    } catch (error) {
      console.error(`Failed to sync ${item.id}:`, error);

      item.retryCount++;

      if (item.retryCount < 5) {
        remaining.push(item);
      } else {
        console.error(`Max retries exceeded for sync: ${item.id}`);
      }
    }
  }

  await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remaining));
}

// =============================================================================
// MAIN SYNC FUNCTION
// =============================================================================

/**
 * Sync all pending items (uploads + database operations)
 */
export async function syncPendingItems(): Promise<{
  uploads: number;
  operations: number;
  errors: number;
}> {
  if (!isOnline) {
    return { uploads: 0, operations: 0, errors: 0 };
  }

  const uploadsBefore = (await getPendingUploads()).length;
  const queueBefore = (await getSyncQueue()).length;

  await Promise.all([processUploadQueue(), processSyncQueue()]);

  const uploadsAfter = (await getPendingUploads()).length;
  const queueAfter = (await getSyncQueue()).length;

  const result = {
    uploads: uploadsBefore - uploadsAfter,
    operations: queueBefore - queueAfter,
    errors: uploadsAfter + queueAfter,
  };

  // Update last sync time
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

  return result;
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
}

/**
 * Get pending item counts
 */
export async function getPendingCounts(): Promise<{
  uploads: number;
  operations: number;
  drafts: number;
}> {
  const [uploads, operations, drafts] = await Promise.all([
    getPendingUploads(),
    getSyncQueue(),
    getDraftInvoices(),
  ]);

  return {
    uploads: uploads.length,
    operations: operations.length,
    drafts: drafts.length,
  };
}

/**
 * Clear all offline data (use with caution)
 */
export async function clearOfflineData(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.PENDING_UPLOADS),
    AsyncStorage.removeItem(STORAGE_KEYS.DRAFT_INVOICES),
    AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE),
    AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC),
  ]);
}

// =============================================================================
// HELPERS
// =============================================================================

function getBucketName(type: PendingUpload["type"]): string {
  switch (type) {
    case "voice_note":
      return "voice-evidence";
    case "logo":
      return "logos";
    case "invoice_pdf":
      return "invoice-pdfs";
    default:
      return "voice-evidence";
  }
}

function getContentType(uri: string): string {
  const extension = uri.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "m4a":
      return "audio/mp4";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

// Base64 decode helper
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
