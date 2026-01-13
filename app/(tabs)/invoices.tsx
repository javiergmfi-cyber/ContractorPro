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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, FileText, Mic } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useTheme } from "@/lib/theme";
import { Invoice } from "@/types";
import { InvoiceCard } from "@/components/InvoiceCard";
import { RecordingOverlay } from "@/components/RecordingOverlay";
import { startRecording, stopRecording } from "@/services/audio";
import { processVoiceToInvoice } from "@/services/ai";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 120;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

type FilterType = "all" | "unpaid" | "paid";

/**
 * Invoices Screen - Apple Wallet Aesthetic
 * Features:
 * - Collapsing Large Title (iOS Messages style)
 * - Segmented Control filter
 * - Physical ticket card design
 */

export default function InvoicesScreen() {
  const router = useRouter();
  const { colors, isDark, typography, radius } = useTheme();
  const { invoices, isLoading, fetchInvoices, updateInvoice, setPendingInvoice } = useInvoiceStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Scroll animation for collapsing header
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
  const handleStartVoiceRecording = async () => {
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await startRecording();
  };

  const handleStopVoiceRecording = async () => {
    setIsRecording(false);
    const audioUri = await stopRecording();

    if (audioUri) {
      try {
        const result = await processVoiceToInvoice(audioUri);
        setPendingInvoice(result.parsedInvoice);
        router.push("/invoice/preview");
      } catch (error) {
        console.error("Error processing voice:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
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
      case "unpaid":
        return inv.status === "draft" || inv.status === "sent" || inv.status === "overdue";
      case "paid":
        return inv.status === "paid";
      default:
        return inv.status !== "void";
    }
  });

  // Sort by date (newest first)
  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Counts for segmented control
  const allCount = invoices.filter((i) => i.status !== "void").length;
  const unpaidCount = invoices.filter(
    (i) => i.status === "draft" || i.status === "sent" || i.status === "overdue"
  ).length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;

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

  // Empty State Component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      {/* Illustration placeholder - subtle icon */}
      <View style={[styles.emptyIllustration, { backgroundColor: colors.backgroundSecondary }]}>
        <FileText size={48} color={colors.textTertiary} strokeWidth={1.5} />
      </View>

      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Invoices
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
        Tap + to get paid
      </Text>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/invoice/create");
        }}
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
      >
        <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.emptyButtonText}>Create Invoice</Text>
      </Pressable>

      {/* Divider */}
      <View style={styles.emptyDividerContainer}>
        <View style={[styles.emptyDividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.emptyDividerText, { color: colors.textTertiary }]}>or</Text>
        <View style={[styles.emptyDividerLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Speak to Create Button */}
      <Pressable
        onPressIn={handleStartVoiceRecording}
        onPressOut={handleStopVoiceRecording}
        style={({ pressed }) => [
          styles.speakButton,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
          pressed && { backgroundColor: colors.backgroundTertiary },
        ]}
      >
        <View style={[styles.speakButtonIcon, { backgroundColor: colors.primary + "15" }]}>
          <Mic size={20} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.speakButtonTextContainer}>
          <Text style={[styles.speakButtonTitle, { color: colors.text }]}>
            Speak to Create
          </Text>
          <Text style={[styles.speakButtonSubtitle, { color: colors.textTertiary }]}>
            Hold and describe your work
          </Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        {/* ═══════════════════════════════════════════════════════════
            COLLAPSING HEADER
        ═══════════════════════════════════════════════════════════ */}
        <Animated.View style={[styles.header, { height: headerHeight }]}>
          <Animated.View
            style={{
              transform: [
                { scale: titleScale },
                { translateY: titleTranslateY },
                { translateX: titleTranslateX },
              ],
            }}
          >
            <Text style={[styles.largeTitle, { color: colors.text }]}>
              Invoices
            </Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.subtitle,
              { color: colors.textTertiary, opacity: subtitleOpacity },
            ]}
          >
            {allCount} total • {unpaidCount} unpaid
          </Animated.Text>
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════
            SEGMENTED CONTROL
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.segmentedControlContainer}>
          <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundSecondary }]}>
            {(["all", "unpaid", "paid"] as FilterType[]).map((filter) => {
              const isActive = activeFilter === filter;
              const count = filter === "all" ? allCount : filter === "unpaid" ? unpaidCount : paidCount;

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
            INVOICE LIST
        ═══════════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════════
            FLOATING ACTION BUTTON
        ═══════════════════════════════════════════════════════════ */}
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.primary },
            pressed && styles.fabPressed,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/invoice/create");
          }}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>

        {/* Recording Overlay */}
        <RecordingOverlay visible={isRecording} duration={recordingDuration} />
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
    justifyContent: "flex-end",
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

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  emptyDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 20,
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
  speakButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    width: "100%",
    maxWidth: 280,
  },
  speakButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  speakButtonTextContainer: {
    flex: 1,
  },
  speakButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  speakButtonSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: -0.1,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
});
