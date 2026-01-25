import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Plus,
  FileText,
  Mic,
  Edit3,
  Send,
  DollarSign,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle,
  FileCheck,
  Receipt,
  Zap,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useTheme } from "@/lib/theme";
import { Invoice } from "@/types";
import { InvoiceCard } from "@/components/InvoiceCard";
import { RecordingOverlay } from "@/components/RecordingOverlay";
import { SkeletonCard } from "@/components/SkeletonCard";
import { startRecording, stopRecording } from "@/services/audio";
import { processVoiceToInvoice } from "@/services/ai";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type FilterType = "all" | "outstanding" | "paid";

/**
 * Invoices Screen - The Living Document Workbench
 *
 * State-Specific Experience:
 * - New User: Onboarding with Living Document explanation
 * - Has Estimates: Focus on getting deposits
 * - Has Invoices: Focus on collecting balance
 * - All Paid: Celebration + create new
 *
 * Two CTAs:
 * - Create Estimate (blue) - For new jobs, requires deposit
 * - Create Invoice (orange) - Direct invoice, no deposit
 */

export default function InvoicesScreen() {
  const router = useRouter();
  const { colors, isDark, typography, radius } = useTheme();
  const { invoices, isLoading, fetchInvoices, updateInvoice, setPendingInvoice } = useInvoiceStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>("outstanding");
  const [refreshing, setRefreshing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<"estimate" | "invoice" | null>(null);

  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Voice recording handlers
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleStartVoiceRecording = async (type: "estimate" | "invoice") => {
    setCreateType(type);
    setShowCreateModal(false);
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      await startRecording();
      recordingTimeoutRef.current = setTimeout(() => {
        handleStopVoiceRecording();
      }, 60000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      Alert.alert("Recording Error", "Failed to start voice recording.");
    }
  };

  const handleStopVoiceRecording = async () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    if (!isRecording) return;

    setIsRecording(false);

    try {
      const audioUri = await stopRecording();
      if (audioUri) {
        const result = await processVoiceToInvoice(audioUri);
        // Set deposit_enabled based on type
        const invoiceData = {
          ...result.parsedInvoice,
          deposit_enabled: createType === "estimate",
        };
        setPendingInvoice(invoiceData);
        router.push("/invoice/preview");
      }
    } catch (error) {
      console.error("Error processing voice:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Processing Error", "Failed to process voice recording.");
    }
  };

  const handleManualCreate = (type: "estimate" | "invoice") => {
    setShowCreateModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Pass type to create screen
    router.push(`/invoice/create?type=${type}`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchInvoices();
    setRefreshing(false);
  }, [fetchInvoices]);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    switch (activeFilter) {
      case "outstanding":
        return inv.status === "draft" || inv.status === "sent" || inv.status === "overdue" || inv.status === "deposit_paid";
      case "paid":
        return inv.status === "paid";
      default:
        return inv.status !== "void";
    }
  });

  // Sort: drafts first, then overdue, then by date
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (a.status === "draft" && b.status !== "draft") return -1;
    if (b.status === "draft" && a.status !== "draft") return 1;
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (b.status === "overdue" && a.status !== "overdue") return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Counts
  const allCount = invoices.filter((i) => i.status !== "void").length;
  const outstandingCount = invoices.filter(
    (i) => i.status === "draft" || i.status === "sent" || i.status === "overdue" || i.status === "deposit_paid"
  ).length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;

  // State analysis for contextual UI
  const estimates = invoices.filter((i) => i.status === "sent" && i.deposit_enabled && !i.deposit_paid_at);
  const activeInvoices = invoices.filter((i) => i.status === "deposit_paid" || (i.status === "sent" && !i.deposit_enabled));
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  const drafts = invoices.filter((i) => i.status === "draft");

  const outstandingAmount = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue" || i.status === "deposit_paid")
    .reduce((sum, inv) => sum + (inv.total - (inv.amount_paid || 0)), 0);

  const handleInvoicePress = (invoice: Invoice) => {
    router.push(`/invoice/${invoice.id}`);
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: "paid", paid_at: new Date().toISOString() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleRemind = (invoice: Invoice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Send Reminder", `Send a payment reminder to ${invoice.client_name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Send", onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) },
    ]);
  };

  const handleVoid = (invoice: Invoice) => {
    Alert.alert("Void Invoice", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Void",
        style: "destructive",
        onPress: async () => {
          await updateInvoice(invoice.id, { status: "void" });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleFilterChange = (filter: FilterType) => {
    Haptics.selectionAsync();
    setActiveFilter(filter);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <InvoiceCard
      invoice={item}
      onPress={() => handleInvoicePress(item)}
      onMarkPaid={() => handleMarkPaid(item)}
      onRemind={() => handleRemind(item)}
      onVoid={() => handleVoid(item)}
    />
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPTY STATE - State-Specific Content
  // ═══════════════════════════════════════════════════════════════════════════
  const EmptyState = () => {
    const isNewUser = allCount === 0;
    const hasOnlyDrafts = drafts.length > 0 && estimates.length === 0 && activeInvoices.length === 0;
    const hasEstimatesWaiting = estimates.length > 0;
    const allPaidUp = allCount > 0 && outstandingCount === 0;

    // New User - Full Onboarding
    if (isNewUser) {
      return (
        <View style={styles.emptyState}>
          {/* Living Document Journey */}
          <View style={styles.journeyContainer}>
            <View style={[styles.journeyStep, { backgroundColor: colors.systemBlue + "15" }]}>
              <FileCheck size={28} color={colors.systemBlue} strokeWidth={1.5} />
            </View>
            <View style={styles.journeyArrow}>
              <ArrowRight size={18} color={colors.textTertiary} />
            </View>
            <View style={[styles.journeyStep, { backgroundColor: colors.systemOrange + "15" }]}>
              <FileText size={28} color={colors.systemOrange} strokeWidth={1.5} />
            </View>
            <View style={styles.journeyArrow}>
              <ArrowRight size={18} color={colors.textTertiary} />
            </View>
            <View style={[styles.journeyStep, { backgroundColor: colors.statusPaid + "15" }]}>
              <Receipt size={28} color={colors.statusPaid} strokeWidth={1.5} />
            </View>
          </View>

          {/* Journey Labels */}
          <View style={styles.journeyLabels}>
            <Text style={[styles.journeyLabel, { color: colors.systemBlue }]}>Estimate</Text>
            <Text style={[styles.journeyLabel, { color: colors.systemOrange }]}>Invoice</Text>
            <Text style={[styles.journeyLabel, { color: colors.statusPaid }]}>Receipt</Text>
          </View>

          {/* Title */}
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            One Document.{'\n'}Three Stages.
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Send an estimate, collect a deposit, then{'\n'}invoice for the balance. We track it all.
          </Text>

          {/* Dual CTAs */}
          <View style={styles.dualCTAContainer}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCreateType("estimate");
                setShowCreateModal(true);
              }}
              style={({ pressed }) => [
                styles.primaryCTA,
                { backgroundColor: colors.systemBlue, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <FileCheck size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.primaryCTAText}>Create Estimate</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCreateType("invoice");
                setShowCreateModal(true);
              }}
              style={({ pressed }) => [
                styles.secondaryCTA,
                {
                  backgroundColor: colors.systemOrange + "15",
                  borderColor: colors.systemOrange + "40",
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <FileText size={20} color={colors.systemOrange} strokeWidth={2} />
              <Text style={[styles.secondaryCTAText, { color: colors.systemOrange }]}>
                Create Invoice
              </Text>
            </Pressable>
          </View>

          {/* Quick Explainer */}
          <View style={[styles.explainerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.explainerRow}>
              <View style={[styles.explainerIcon, { backgroundColor: colors.systemBlue + "15" }]}>
                <FileCheck size={16} color={colors.systemBlue} />
              </View>
              <View style={styles.explainerContent}>
                <Text style={[styles.explainerTitle, { color: colors.text }]}>Estimate</Text>
                <Text style={[styles.explainerDesc, { color: colors.textTertiary }]}>
                  Collect deposit upfront before starting
                </Text>
              </View>
            </View>
            <View style={styles.explainerRow}>
              <View style={[styles.explainerIcon, { backgroundColor: colors.systemOrange + "15" }]}>
                <FileText size={16} color={colors.systemOrange} />
              </View>
              <View style={styles.explainerContent}>
                <Text style={[styles.explainerTitle, { color: colors.text }]}>Invoice</Text>
                <Text style={[styles.explainerDesc, { color: colors.textTertiary }]}>
                  Bill for full amount, no deposit required
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    // Has Estimates Waiting for Deposit
    if (hasEstimatesWaiting && activeFilter === "outstanding") {
      return (
        <View style={styles.emptyState}>
          <View style={[styles.statusIcon, { backgroundColor: colors.systemBlue + "15" }]}>
            <Clock size={32} color={colors.systemBlue} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {estimates.length} Estimate{estimates.length !== 1 ? 's' : ''} Waiting
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Your estimates are out there working.{'\n'}Enable Auto-Nudge to follow up automatically.
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setCreateType("estimate");
              setShowCreateModal(true);
            }}
            style={({ pressed }) => [
              styles.primaryCTA,
              { backgroundColor: colors.systemBlue, opacity: pressed ? 0.9 : 1, marginTop: 24 },
            ]}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.primaryCTAText}>Send Another Estimate</Text>
          </Pressable>
        </View>
      );
    }

    // All Paid Up - Celebration
    if (allPaidUp) {
      return (
        <View style={styles.emptyState}>
          <View style={[styles.statusIcon, { backgroundColor: colors.statusPaid + "15" }]}>
            <CheckCircle size={32} color={colors.statusPaid} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            All Caught Up!
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Every invoice is paid. Time to land{'\n'}the next job.
          </Text>
          <View style={styles.dualCTAContainer}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCreateType("estimate");
                setShowCreateModal(true);
              }}
              style={({ pressed }) => [
                styles.primaryCTA,
                { backgroundColor: colors.systemBlue, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <FileCheck size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.primaryCTAText}>New Estimate</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCreateType("invoice");
                setShowCreateModal(true);
              }}
              style={({ pressed }) => [
                styles.secondaryCTA,
                {
                  backgroundColor: colors.systemOrange + "15",
                  borderColor: colors.systemOrange + "40",
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <FileText size={20} color={colors.systemOrange} strokeWidth={2} />
              <Text style={[styles.secondaryCTAText, { color: colors.systemOrange }]}>
                New Invoice
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // Default - No items in current filter
    return (
      <View style={styles.emptyState}>
        <View style={[styles.statusIcon, { backgroundColor: colors.backgroundSecondary }]}>
          <FileText size={32} color={colors.textTertiary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {activeFilter === "paid" ? "No Receipts Yet" : "Nothing Here"}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          {activeFilter === "paid"
            ? "Paid invoices become receipts.\nThey'll appear here."
            : "Create an estimate or invoice\nto get started."
          }
        </Text>
      </View>
    );
  };

  // Get contextual subtitle
  const getSubtitle = () => {
    if (overdueInvoices.length > 0) {
      return `${overdueInvoices.length} overdue · ${formatCurrency(outstandingAmount)} outstanding`;
    }
    if (outstandingAmount > 0) {
      return `${formatCurrency(outstandingAmount)} outstanding`;
    }
    if (allCount > 0) {
      return `${paidCount} paid · ${allCount} total`;
    }
    return "Your living documents";
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.largeTitle, { color: colors.text }]}>Invoices</Text>
          <Text style={[styles.subtitle, { color: overdueInvoices.length > 0 ? colors.statusOverdue : colors.textTertiary }]}>
            {getSubtitle()}
          </Text>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentedControlContainer}>
          <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundSecondary }]}>
            {(["all", "outstanding", "paid"] as FilterType[]).map((filter) => {
              const isActive = activeFilter === filter;
              const count = filter === "all" ? allCount : filter === "outstanding" ? outstandingCount : paidCount;
              const label = filter.charAt(0).toUpperCase() + filter.slice(1);

              return (
                <Pressable
                  key={filter}
                  onPress={() => handleFilterChange(filter)}
                  style={[
                    styles.segment,
                    isActive && [styles.segmentActive, { backgroundColor: colors.card }],
                  ]}
                >
                  <Text style={[styles.segmentText, { color: isActive ? colors.text : colors.textTertiary }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Invoice List */}
        {isLoading && invoices.length === 0 ? (
          <View style={styles.listContent}>
            <SkeletonCard count={4} />
          </View>
        ) : (
          <FlatList
            data={sortedInvoices}
            keyExtractor={(item) => item.id}
            renderItem={renderInvoiceItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            ListEmptyComponent={EmptyState}
          />
        )}

        {/* Dual FABs - Only show when there are invoices */}
        {allCount > 0 && (
          <View style={styles.fabContainer}>
            {/* Estimate FAB */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCreateType("estimate");
                setShowCreateModal(true);
              }}
              style={[styles.fab, styles.fabSecondary, { backgroundColor: colors.systemBlue }]}
            >
              <FileCheck size={22} color="#FFFFFF" strokeWidth={2} />
            </Pressable>

            {/* Invoice FAB */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCreateType("invoice");
                setShowCreateModal(true);
              }}
              style={[styles.fab, styles.fabPrimary, { backgroundColor: colors.systemOrange }]}
            >
              <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        )}

        {/* Recording Overlay */}
        <RecordingOverlay visible={isRecording} duration={recordingDuration} onStop={handleStopVoiceRecording} />

        {/* Create Modal - Voice or Manual */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowCreateModal(false)}>
            <View
              style={[styles.modalContainer, { backgroundColor: colors.card }]}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHandle} />

              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {createType === "estimate" ? "New Estimate" : "New Invoice"}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textTertiary }]}>
                {createType === "estimate"
                  ? "Collect a deposit before you start the job"
                  : "Bill for the full amount upfront"
                }
              </Text>

              {/* Voice Option */}
              <Pressable
                onPress={() => handleStartVoiceRecording(createType || "estimate")}
                style={[styles.modalOption, { backgroundColor: colors.backgroundSecondary }]}
              >
                <View style={[
                  styles.modalOptionIcon,
                  { backgroundColor: createType === "estimate" ? colors.systemBlue + "20" : colors.systemOrange + "20" }
                ]}>
                  <Mic size={24} color={createType === "estimate" ? colors.systemBlue : colors.systemOrange} />
                </View>
                <View style={styles.modalOptionContent}>
                  <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Voice</Text>
                  <Text style={[styles.modalOptionDesc, { color: colors.textTertiary }]}>
                    Describe the job, we'll create it
                  </Text>
                </View>
                <Sparkles size={18} color={colors.textTertiary} />
              </Pressable>

              {/* Manual Option */}
              <Pressable
                onPress={() => handleManualCreate(createType || "estimate")}
                style={[styles.modalOption, { backgroundColor: colors.backgroundSecondary }]}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: colors.textTertiary + "15" }]}>
                  <Edit3 size={24} color={colors.textSecondary} />
                </View>
                <View style={styles.modalOptionContent}>
                  <Text style={[styles.modalOptionTitle, { color: colors.text }]}>Manual</Text>
                  <Text style={[styles.modalOptionDesc, { color: colors.textTertiary }]}>
                    Enter details yourself
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowCreateModal(false);
                }}
                style={[styles.cancelButton, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.primary }]}>Cancel</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: -0.2,
  },

  // Segmented Control
  segmentedControlContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  segmentActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 140,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  journeyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  journeyStep: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  journeyArrow: {
    paddingHorizontal: 12,
  },
  journeyLabels: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 44,
    marginBottom: 32,
  },
  journeyLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 24,
  },

  // Dual CTAs
  dualCTAContainer: {
    width: "100%",
    marginTop: 32,
    gap: 12,
  },
  primaryCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCTAText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  secondaryCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  secondaryCTAText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },

  // Explainer Card
  explainerCard: {
    width: "100%",
    marginTop: 40,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  explainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  explainerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  explainerContent: {
    flex: 1,
  },
  explainerTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  explainerDesc: {
    fontSize: 13,
    fontWeight: "500",
  },

  // FABs
  fabContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPrimary: {},
  fabSecondary: {},

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHandle: {
    width: 36,
    height: 5,
    backgroundColor: "rgba(128, 128, 128, 0.3)",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  modalOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOptionContent: {
    flex: 1,
    marginLeft: 14,
  },
  modalOptionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  modalOptionDesc: {
    fontSize: 14,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
