/**
 * Export Service
 * Client-side service for exporting data (QuickBooks CSV/IIF)
 * Per product-strategy.md Section 3.4
 */

import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export type ExportFormat = "csv" | "iif";

export interface ExportOptions {
  format?: ExportFormat;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  status?: "draft" | "sent" | "paid" | "void" | "overdue";
  includeItems?: boolean;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  localUri?: string;
  error?: string;
}

/**
 * Export invoices to QuickBooks-compatible format
 */
export async function exportInvoices(options: ExportOptions = {}): Promise<ExportResult> {
  try {
    // Get current session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return { success: false, error: "Not authenticated" };
    }

    // Call Edge Function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/export-quickbooks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: options.format || "csv",
          startDate: options.startDate,
          endDate: options.endDate,
          status: options.status,
          includeItems: options.includeItems ?? true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Export failed: ${response.status}`,
      };
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch?.[1] || `invoices_export.${options.format || "csv"}`;

    // Get the file content
    const content = await response.text();

    // Save to local file
    const localUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(localUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return {
      success: true,
      filename,
      localUri,
    };
  } catch (error: any) {
    console.error("Error exporting invoices:", error);
    return {
      success: false,
      error: error.message || "Failed to export invoices",
    };
  }
}

/**
 * Export and share invoices
 */
export async function exportAndShareInvoices(
  options: ExportOptions = {}
): Promise<ExportResult> {
  // First export to local file
  const result = await exportInvoices(options);

  if (!result.success || !result.localUri) {
    return result;
  }

  // Check if sharing is available
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    return {
      ...result,
      error: "Sharing is not available on this device",
    };
  }

  try {
    // Share the file
    await Sharing.shareAsync(result.localUri, {
      mimeType: options.format === "iif" ? "application/x-iif" : "text/csv",
      dialogTitle: "Export Invoices",
      UTI: options.format === "iif" ? "public.data" : "public.comma-separated-values-text",
    });

    return result;
  } catch (error: any) {
    // User may have cancelled sharing - still return success since file was created
    if (error.message?.includes("cancel")) {
      return result;
    }
    return {
      ...result,
      error: error.message,
    };
  }
}

/**
 * Get date range presets for export
 */
export function getDateRangePresets(): {
  label: string;
  value: string;
  getRange: () => { startDate: string; endDate: string };
}[] {
  return [
    {
      label: "This Month",
      value: "this_month",
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "Last Month",
      value: "last_month",
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "This Quarter",
      value: "this_quarter",
      getRange: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), quarter * 3, 1);
        const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "Last Quarter",
      value: "last_quarter",
      getRange: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3) - 1;
        const year = quarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const adjustedQuarter = quarter < 0 ? 3 : quarter;
        const start = new Date(year, adjustedQuarter * 3, 1);
        const end = new Date(year, adjustedQuarter * 3 + 3, 0);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "This Year",
      value: "this_year",
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "Last Year",
      value: "last_year",
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear() - 1, 0, 1);
        const end = new Date(now.getFullYear() - 1, 11, 31);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "All Time",
      value: "all_time",
      getRange: () => ({
        startDate: "",
        endDate: "",
      }),
    },
  ];
}

/**
 * Format export status for display
 */
export function getStatusOptions(): { label: string; value: string }[] {
  return [
    { label: "All Statuses", value: "" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Paid", value: "paid" },
    { label: "Overdue", value: "overdue" },
    { label: "Void", value: "void" },
  ];
}
