import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme";
import {
  exportAndShareInvoices,
  getDateRangePresets,
  getStatusOptions,
  ExportFormat,
} from "@/services/export";

export default function ExportScreen() {
  const { colors } = useTheme();
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState("all_time");
  const [status, setStatus] = useState("");
  const [includeItems, setIncludeItems] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const datePresets = getDateRangePresets();
  const statusOptions = getStatusOptions();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const preset = datePresets.find((p) => p.value === dateRange);
      const range = preset?.getRange() || { startDate: "", endDate: "" };

      const result = await exportAndShareInvoices({
        format,
        startDate: range.startDate || undefined,
        endDate: range.endDate || undefined,
        status: status as any || undefined,
        includeItems,
      });

      if (result.success) {
        Alert.alert(
          "Export Complete",
          `Your invoices have been exported to ${result.filename}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Export Failed", result.error || "Failed to export invoices");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred during export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Export Data
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Format Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Export Format
          </Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.formatOption,
                {
                  backgroundColor: format === "csv" ? colors.primary : colors.surface,
                  borderColor: format === "csv" ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFormat("csv")}
            >
              <Ionicons
                name="document-text"
                size={24}
                color={format === "csv" ? "white" : colors.text}
              />
              <Text
                style={[
                  styles.formatLabel,
                  { color: format === "csv" ? "white" : colors.text },
                ]}
              >
                CSV
              </Text>
              <Text
                style={[
                  styles.formatDescription,
                  { color: format === "csv" ? "rgba(255,255,255,0.7)" : colors.textSecondary },
                ]}
              >
                Excel, Sheets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.formatOption,
                {
                  backgroundColor: format === "iif" ? colors.primary : colors.surface,
                  borderColor: format === "iif" ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFormat("iif")}
            >
              <Ionicons
                name="calculator"
                size={24}
                color={format === "iif" ? "white" : colors.text}
              />
              <Text
                style={[
                  styles.formatLabel,
                  { color: format === "iif" ? "white" : colors.text },
                ]}
              >
                IIF
              </Text>
              <Text
                style={[
                  styles.formatDescription,
                  { color: format === "iif" ? "rgba(255,255,255,0.7)" : colors.textSecondary },
                ]}
              >
                QuickBooks
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Date Range
          </Text>
          <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {datePresets.map((preset) => (
              <TouchableOpacity
                key={preset.value}
                style={[
                  styles.pickerOption,
                  {
                    backgroundColor: dateRange === preset.value ? colors.primary + "15" : "transparent",
                    borderColor: dateRange === preset.value ? colors.primary : "transparent",
                  },
                ]}
                onPress={() => setDateRange(preset.value)}
              >
                {dateRange === preset.value && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
                <Text
                  style={[
                    styles.pickerLabel,
                    {
                      color: dateRange === preset.value ? colors.primary : colors.text,
                      fontWeight: dateRange === preset.value ? "600" : "400",
                    },
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status Filter */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Invoice Status
          </Text>
          <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  {
                    backgroundColor: status === option.value ? colors.primary + "15" : "transparent",
                    borderColor: status === option.value ? colors.primary : "transparent",
                  },
                ]}
                onPress={() => setStatus(option.value)}
              >
                {status === option.value && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
                <Text
                  style={[
                    styles.pickerLabel,
                    {
                      color: status === option.value ? colors.primary : colors.text,
                      fontWeight: status === option.value ? "600" : "400",
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Include Line Items */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.toggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setIncludeItems(!includeItems)}
          >
            <View style={styles.toggleContent}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                Include Line Items
              </Text>
              <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                Export each invoice item as a separate row
              </Text>
            </View>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: includeItems ? colors.primary : "transparent",
                  borderColor: includeItems ? colors.primary : colors.border,
                },
              ]}
            >
              {includeItems && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              QuickBooks Import
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              To import into QuickBooks Desktop, use the IIF format.{"\n"}
              For QuickBooks Online, use CSV and import via the Banking menu.
            </Text>
          </View>
        </View>

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Export Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="download" size={20} color="white" />
              <Text style={styles.exportButtonText}>Export Invoices</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  formatOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  formatDescription: {
    fontSize: 13,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderRadius: 0,
    marginHorizontal: -1,
  },
  pickerLabel: {
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  toggleDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  exportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
