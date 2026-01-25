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
import { Plus, FileText, Mic, Sparkles, ChevronRight, Edit3 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useTheme } from "@/lib/theme";
import { Invoice } from "@/types";
import { InvoiceCard } from "@/components/InvoiceCard";
import { RecordingOverlay } from "@/components/RecordingOverlay";
import { SkeletonCard } from "@/components/SkeletonCard";
import { startRecording, stopRecording } from "@/services/audio";
import { processVoiceToInvoice } from "@/services/ai";

// Trade-specific line item templates for the "magic draft"
const TRADE_TEMPLATES: Record<string, { description: string; amount: number }[]> = {
  plumber: [
    { description: "Service Call", amount: 15000 },
    { description: "Labor (per hour)", amount: 8500 },
  ],
  electrician: [
    { description: "Diagnostic Fee", amount: 7500 },
    { description: "Labor (per hour)", amount: 9500 },
  ],
  painter: [
    { description: "Room Painting", amount: 35000 },
    { description: "Materials", amount: 5000 },
  ],
  handyman: [
    { description: "Service Call", amount: 7500 },
    { description: "Hourly Rate", amount: 6500 },
  ],
  hvac: [
    { description: "System Inspection", amount: 12500 },
    { description: "Labor (per hour)", amount: 9500 },
  ],
  tile_stone: [
    { description: "Tile Installation (per sq ft)", amount: 1200 },
    { description: "Materials & Grout", amount: 25000 },
  ],
  general: [
    { description: "Project Consultation", amount: 25000 },
    { description: "Labor (per hour)", amount: 7500 },
  ],
  carpenter: [
    { description: "Custom Woodwork", amount: 45000 },
    { description: "Materials", amount: 15000 },
  ],
  other: [
    { description: "Service Fee", amount: 10000 },
    { description: "Labor", amount: 7500 },
  ],
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 120;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

type FilterType = "all" | "unpaid" | "drafts";

/**
 * Invoices Screen - The Workbench
 * Per HYBRID_SPEC.md
 *
 * Features:
 * - Segmented Control: All | Unpaid | Drafts
 * - Wallet Pass style cards
 * - Collapsing Large Title
 */

export default function InvoicesScreen() {
  const router = useRouter();
  const { colors, isDark, typography, radius } = useTheme();
  const { invoices, isLoading, fetchInvoices, updateInvoice, setPendingInvoice } = useInvoiceStore();
  const { profile } = useProfileStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>("unpaid");
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

  // Filter invoices per HYBRID_SPEC: All | Unpaid | Drafts
  const filteredInvoices = invoices.filter((inv) => {
    switch (activeFilter) {
      case "unpaid":
        return inv.status === "sent" || inv.status === "overdue";
      case "drafts":
        return inv.status === "draft";
      default:
        return inv.status !== "void";
    }
  });

  // Sort logic varies by filter
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (activeFilter === "unpaid") {
      // For unpaid filter: sort by most overdue first, then by due date
      const now = new Date().getTime();
      const aDueDate = a.due_date ? new Date(a.due_date).getTime() : now;
      const bDueDate = b.due_date ? new Date(b.due_date).getTime() : now;
      const aOverdueDays = a.status === "overdue" ? (now - aDueDate) : 0;
      const bOverdueDays = b.status === "overdue" ? (now - bDueDate) : 0;

      // Overdue invoices first, sorted by most overdue
      if (aOverdueDays > 0 && bOverdueDays > 0) {
        return bOverdueDays - aOverdueDays; // Most overdue first
      }
      if (aOverdueDays > 0) return -1; // a is overdue, b is not
      if (bOverdueDays > 0) return 1; // b is overdue, a is not

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

  // Counts for segmented control per HYBRID_SPEC
  const allCount = invoices.filter((i) => i.status !== "void").length;
  const unpaidCount = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue"
  ).length;
  const draftsCount = invoices.filter((i) => i.status === "draft").length;

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

  // Get trade template for magic draft
  const tradeTemplate = TRADE_TEMPLATES[profile?.trade || "other"] || TRADE_TEMPLATES.other;
  const draftTotal = tradeTemplate.reduce((sum, item) => sum + item.amount, 0);

  // Format currency helper
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  // Handle magic draft tap - navigate to create with pre-filled items
  const handleMagicDraftTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Set pending invoice with trade template
    setPendingInvoice({
      clientName: "",
      items: tradeTemplate.map((item) => ({
        description: item.description,
        price: item.amount / 100,
        quantity: 1,
      })),
      detectedLanguage: "en",
    });
    router.push("/invoice/preview");
  };

  // Empty State Component with Magic Draft
  const EmptyState = () => (
    <View style={styles.emptyState}>
      {/* Title */}
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Let's Get You Paid
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
        Send your first invoice in 30 seconds
      </Text>

      {/* Magic Draft Card - Pre-filled invoice based on trade */}
      <Pressable
        onPress={handleMagicDraftTap}
        style={({ pressed }) => [
          styles.magicDraftCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary + "30",
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {/* Sparkle badge */}
        <View style={[styles.magicBadge, { backgroundColor: colors.primary + "15" }]}>
          <Sparkles size={12} color={colors.primary} strokeWidth={2.5} />
          <Text style={[styles.magicBadgeText, { color: colors.primary }]}>
            Draft #1
          </Text>
        </View>

        {/* Draft content */}
        <View style={styles.magicDraftContent}>
          <View style={styles.magicDraftHeader}>
            <Text style={[styles.magicDraftLabel, { color: colors.textTertiary }]}>
              Ready to customize
            </Text>
            <ChevronRight size={18} color={colors.textTertiary} />
          </View>

          {/* Line items preview */}
          {tradeTemplate.map((item, index) => (
            <View key={index} style={styles.magicDraftItem}>
              <Text style={[styles.magicDraftItemDesc, { color: colors.text }]}>
                {item.description}
              </Text>
              <Text style={[styles.magicDraftItemPrice, { color: colors.textSecondary }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}

          {/* Total */}
          <View style={[styles.magicDraftTotal, { borderTopColor: colors.border }]}>
            <Text style={[styles.magicDraftTotalLabel, { color: colors.text }]}>
              Total
            </Text>
            <Text style={[styles.magicDraftTotalAmount, { color: colors.primary }]}>
              {formatCurrency(draftTotal)}
            </Text>
          </View>
        </View>

        {/* CTA hint */}
        <Text style={[styles.magicDraftHint, { color: colors.primary }]}>
          Tap to customize and send
        </Text>
      </Pressable>

      {/* Divider */}
      <View style={styles.emptyDividerContainer}>
        <View style={[styles.emptyDividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.emptyDividerText, { color: colors.textTertiary }]}>or</Text>
        <View style={[styles.emptyDividerLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Alternative actions */}
      <View style={styles.altActionsRow}>
        {/* Speak to Create Button */}
        <Pressable
          onPressIn={handleStartVoiceRecording}
          onPressOut={handleStopVoiceRecording}
          style={({ pressed }) => [
            styles.altActionButton,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
            pressed && { backgroundColor: colors.backgroundTertiary },
          ]}
        >
          <View style={[styles.altActionIcon, { backgroundColor: colors.primary + "15" }]}>
            <Mic size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.altActionText, { color: colors.text }]}>
            Voice
          </Text>
        </Pressable>

        {/* Manual Create Button */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/invoice/create");
          }}
          style={({ pressed }) => [
            styles.altActionButton,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
            pressed && { backgroundColor: colors.backgroundTertiary },
          ]}
        >
          <View style={[styles.altActionIcon, { backgroundColor: colors.systemBlue + "15" }]}>
            <Plus size={20} color={colors.systemBlue} strokeWidth={2} />
          </View>
          <Text style={[styles.altActionText, { color: colors.text }]}>
            Manual
          </Text>
        </Pressable>
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
            {allCount} total • {unpaidCount} unpaid
          </Text>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            SEGMENTED CONTROL
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.segmentedControlContainer}>
          <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundSecondary }]}>
            {(["all", "unpaid", "drafts"] as FilterType[]).map((filter) => {
              const isActive = activeFilter === filter;
              const count = filter === "all" ? allCount : filter === "unpaid" ? unpaidCount : draftsCount;

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
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
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
        <RecordingOverlay visible={isRecording} duration={recordingDuration} />

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

  // Empty State with Magic Draft
  emptyState: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
  },
  // Magic Draft Card
  magicDraftCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  magicBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    marginBottom: 16,
  },
  magicBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  magicDraftContent: {
    marginBottom: 16,
  },
  magicDraftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  magicDraftLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  magicDraftItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  magicDraftItemDesc: {
    fontSize: 15,
    fontWeight: "500",
  },
  magicDraftItemPrice: {
    fontSize: 15,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  magicDraftTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  magicDraftTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  magicDraftTotalAmount: {
    fontSize: 20,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  magicDraftHint: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  // Divider
  emptyDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  emptyDividerLine: {
    flex: 1,
    height: 1,
  },
  emptyDividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  // Alt Actions Row
  altActionsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  altActionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  altActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  altActionText: {
    fontSize: 14,
    fontWeight: "600",
  },

});
