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
import { Plus, FileText, Mic, Edit3, Send, DollarSign, ArrowRight } from "lucide-react-native";
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
const HEADER_MAX_HEIGHT = 120;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

type FilterType = "all" | "outstanding" | "paid";

/**
 * Invoices Screen - The Workbench
 * Per Living Document Model
 *
 * Features:
 * - Segmented Control: All | Outstanding | Paid
 * - Living Document lifecycle: Draft → Estimate → Invoice → Receipt
 * - Wallet Pass style cards
 */

export default function InvoicesScreen() {
  const router = useRouter();
  const { colors, isDark, typography, radius } = useTheme();
  const { invoices, isLoading, fetchInvoices, updateInvoice, setPendingInvoice } = useInvoiceStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>("outstanding");
  const [refreshing, setRefreshing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // Scroll animation for collapsing header
  const scrollY = useRef(new Animated.Value(0)).current;

  // FAB pulsating animation
  const fabPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchInvoices();
  }, []);

  // FAB pulsating animation
  useEffect(() => {
    const fabPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    fabPulse.start();
    return () => fabPulse.stop();
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

  // Voice recording handlers with safety timeout
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleStartVoiceRecording = async () => {
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      await startRecording();

      // Safety timeout: auto-stop after 60 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        console.log("Recording auto-stopped after 60 seconds");
        handleStopVoiceRecording();
      }, 60000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
      Alert.alert("Recording Error", "Failed to start voice recording. Please try again.");
    }
  };

  const handleStopVoiceRecording = async () => {
    // Clear timeout if it exists
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }

    if (!isRecording) return; // Prevent double-stop

    setIsRecording(false);

    try {
      const audioUri = await stopRecording();

      if (audioUri) {
        const result = await processVoiceToInvoice(audioUri);
        setPendingInvoice(result.parsedInvoice);
        router.push("/invoice/preview");
      }
    } catch (error) {
      console.error("Error processing voice:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Processing Error", "Failed to process voice recording. Please try again.");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchInvoices();
    setRefreshing(false);
  }, [fetchInvoices]);

  // Filter invoices per Living Document: All | Outstanding | Paid
  // Outstanding = anything not fully paid (drafts, estimates, invoices with deposit)
  // Paid = receipts (fully paid)
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

  // Sort logic varies by filter
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (activeFilter === "outstanding") {
      // For outstanding filter: drafts first, then overdue, then by due date
      const now = new Date().getTime();
      const aDueDate = a.due_date ? new Date(a.due_date).getTime() : now;
      const bDueDate = b.due_date ? new Date(b.due_date).getTime() : now;

      // Drafts first (need action)
      if (a.status === "draft" && b.status !== "draft") return -1;
      if (b.status === "draft" && a.status !== "draft") return 1;

      // Then overdue (most urgent)
      const aOverdueDays = a.status === "overdue" ? (now - aDueDate) : 0;
      const bOverdueDays = b.status === "overdue" ? (now - bDueDate) : 0;

      if (aOverdueDays > 0 && bOverdueDays > 0) {
        return bOverdueDays - aOverdueDays; // Most overdue first
      }
      if (aOverdueDays > 0) return -1;
      if (bOverdueDays > 0) return 1;

      // Non-overdue: sort by due date (closest first)
      if (a.due_date && b.due_date) {
        return aDueDate - bDueDate;
      }

      // Fallback to created date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }

    // Default: sort by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Counts for segmented control per Living Document model
  const allCount = invoices.filter((i) => i.status !== "void").length;
  const outstandingCount = invoices.filter(
    (i) => i.status === "draft" || i.status === "sent" || i.status === "overdue" || i.status === "deposit_paid"
  ).length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;

  // Calculate total outstanding amount for stats
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
      console.error("Error marking invoice as paid:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleRemind = (invoice: Invoice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Send Reminder",
      `Send a payment reminder to ${invoice.client_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleVoid = (invoice: Invoice) => {
    Alert.alert(
      "Void Invoice",
      `Are you sure you want to void this invoice? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Void Invoice",
          style: "destructive",
          onPress: async () => {
            try {
              await updateInvoice(invoice.id, { status: "void" });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error("Error voiding invoice:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const handleFilterChange = (filter: FilterType) => {
    Haptics.selectionAsync();
    setActiveFilter(filter);
  };

  // Header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.7],
    extrapolate: "clamp",
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -8],
    extrapolate: "clamp",
  });

  const titleTranslateX = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -24],
    extrapolate: "clamp",
  });

  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <InvoiceCard
      invoice={item}
      onPress={() => handleInvoicePress(item)}
      onMarkPaid={() => handleMarkPaid(item)}
      onRemind={() => handleRemind(item)}
      onVoid={() => handleVoid(item)}
    />
  );

  // Format currency helper
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  // Empty State Component - Living Document Journey
  const EmptyState = () => (
    <View style={styles.emptyState}>
      {/* Journey Visualization */}
      <View style={styles.journeyContainer}>
        <View style={[styles.journeyStep, { backgroundColor: colors.primary + "15" }]}>
          <FileText size={24} color={colors.primary} strokeWidth={1.5} />
        </View>
        <ArrowRight size={20} color={colors.textTertiary} style={{ marginHorizontal: 8 }} />
        <View style={[styles.journeyStep, { backgroundColor: colors.systemBlue + "15" }]}>
          <Send size={24} color={colors.systemBlue} strokeWidth={1.5} />
        </View>
        <ArrowRight size={20} color={colors.textTertiary} style={{ marginHorizontal: 8 }} />
        <View style={[styles.journeyStep, { backgroundColor: colors.statusPaid + "15" }]}>
          <DollarSign size={24} color={colors.statusPaid} strokeWidth={1.5} />
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Create. Send. Get Paid.
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
        Your invoices live here. They transform from{'\n'}estimates to receipts as your clients pay.
      </Text>

      {/* Create Invoice CTA */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowOptionsModal(true);
        }}
        style={({ pressed }) => [
          styles.createInvoiceCTA,
          {
            backgroundColor: colors.primary,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.createInvoiceCTAText}>
          Create Invoice
        </Text>
      </Pressable>

      {/* Voice hint */}
      <View style={styles.voiceHintContainer}>
        <Mic size={16} color={colors.textTertiary} />
        <Text style={[styles.voiceHint, { color: colors.textTertiary }]}>
          or tap{' '}
          <Text style={{ color: colors.primary, fontWeight: "600" }}>+ </Text>
          and speak it
        </Text>
      </View>

      {/* Living Document Explainer */}
      <View style={[styles.explainerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.explainerRow}>
          <View style={[styles.explainerBadge, { backgroundColor: colors.textTertiary + "20" }]}>
            <Text style={[styles.explainerBadgeText, { color: colors.textSecondary }]}>DRAFT</Text>
          </View>
          <Text style={[styles.explainerText, { color: colors.textSecondary }]}>Not yet sent</Text>
        </View>
        <View style={styles.explainerRow}>
          <View style={[styles.explainerBadge, { backgroundColor: colors.systemBlue + "20" }]}>
            <Text style={[styles.explainerBadgeText, { color: colors.systemBlue }]}>ESTIMATE</Text>
          </View>
          <Text style={[styles.explainerText, { color: colors.textSecondary }]}>Awaiting payment</Text>
        </View>
        <View style={styles.explainerRow}>
          <View style={[styles.explainerBadge, { backgroundColor: colors.alert + "20" }]}>
            <Text style={[styles.explainerBadgeText, { color: colors.alert }]}>INVOICE</Text>
          </View>
          <Text style={[styles.explainerText, { color: colors.textSecondary }]}>Deposit paid, balance due</Text>
        </View>
        <View style={styles.explainerRow}>
          <View style={[styles.explainerBadge, { backgroundColor: colors.statusPaid + "20" }]}>
            <Text style={[styles.explainerBadgeText, { color: colors.statusPaid }]}>RECEIPT</Text>
          </View>
          <Text style={[styles.explainerText, { color: colors.textSecondary }]}>Fully paid</Text>
        </View>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        {/* Header - matches Clients tab */}
        <View style={styles.header}>
          <Text style={[styles.largeTitle, { color: colors.text }]}>
            Invoices
          </Text>
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
            {outstandingAmount > 0
              ? `${formatCurrency(outstandingAmount)} outstanding`
              : allCount > 0
                ? `${allCount} invoice${allCount !== 1 ? 's' : ''}`
                : 'Create your first invoice'
            }
          </Text>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            SEGMENTED CONTROL - Living Document Filters
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.segmentedControlContainer}>
          <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundSecondary }]}>
            {(["all", "outstanding", "paid"] as FilterType[]).map((filter) => {
              const isActive = activeFilter === filter;
              const count = filter === "all" ? allCount : filter === "outstanding" ? outstandingCount : paidCount;
              const label = filter === "outstanding" ? "Outstanding" : filter.charAt(0).toUpperCase() + filter.slice(1);

              return (
                <Pressable
                  key={filter}
                  onPress={() => handleFilterChange(filter)}
                  style={[
                    styles.segment,
                    isActive && [styles.segmentActive, { backgroundColor: colors.card }],
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: isActive ? colors.text : colors.textTertiary },
                    ]}
                  >
                    {label}
                    {count > 0 && (
                      <Text style={{ color: colors.textTertiary }}> {count}</Text>
                    )}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            INVOICE LIST (with Skeleton Loading)
        ═══════════════════════════════════════════════════════════ */}
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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={EmptyState}
          />
        )}

        {/* Floating Action Button - matches Clients tab */}
        <Animated.View style={{
          position: "absolute",
          top: 82,
          right: 20,
          transform: [{ scale: fabPulseAnim }],
        }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#22C55E",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#22C55E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
                setShowOptionsModal(true);
              }}
              style={{
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Recording Overlay */}
        <RecordingOverlay visible={isRecording} duration={recordingDuration} onStop={handleStopVoiceRecording} />

        {/* Options Modal - Voice or Manual */}
        <Modal
          visible={showOptionsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowOptionsModal(false)}
        >
          <Pressable
            style={styles.optionsOverlay}
            onPress={() => setShowOptionsModal(false)}
          >
            <View
              style={[styles.optionsContainer, { backgroundColor: colors.card }]}
              onStartShouldSetResponder={() => true}
            >
              {/* Handle bar */}
              <View style={styles.handleBar} />

              <Text style={[styles.optionsTitle, { color: colors.text }]}>
                New Invoice
              </Text>

              <Pressable
                onPress={() => {
                  setShowOptionsModal(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleStartVoiceRecording();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 16,
                  backgroundColor: colors.backgroundSecondary,
                }}
              >
                <View style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: colors.primary + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Mic size={24} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text }}>
                    Voice
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2 }}>
                    Describe the job, we'll create it
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowOptionsModal(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/invoice/create");
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 16,
                  backgroundColor: colors.backgroundSecondary,
                }}
              >
                <View style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: colors.systemBlue + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Edit3 size={24} color={colors.systemBlue} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text }}>
                    Manual
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2 }}>
                    Enter invoice details yourself
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowOptionsModal(false);
                }}
                style={[styles.cancelButton, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.primary }]}>
                  Cancel
                </Text>
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

  // Header - matches Clients tab exactly
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
    paddingBottom: 120,
  },

  // Empty State - Living Document Journey
  emptyState: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  journeyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  journeyStep: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  createInvoiceCTA: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createInvoiceCTAText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  voiceHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 6,
  },
  voiceHint: {
    fontSize: 14,
    fontWeight: "500",
  },
  explainerCard: {
    width: "100%",
    marginTop: 40,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  explainerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  explainerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  explainerBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  explainerText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Options Modal - matches Clients tab
  optionsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  optionsContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 36,
    height: 5,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
