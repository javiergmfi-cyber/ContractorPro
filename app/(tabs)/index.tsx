import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Pressable,
  RefreshControl,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Thermometer,
  HardHat,
  Droplet,
  Check,
  Shield,
  Grid3x3,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { VoiceButton } from "@/components/VoiceButton";
import { RecordingOverlay } from "@/components/RecordingOverlay";
import { AnimatedCurrency } from "@/components/AnimatedNumber";
import { MonogramAvatar } from "@/components/MonogramAvatar";
import { ActivityFeed } from "@/components/ActivityFeed";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useTheme } from "@/lib/theme";
import { usePreflightStore } from "@/store/usePreflightStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useActivityStore } from "@/store/useActivityStore";
import { startRecording, stopRecording } from "@/services/audio";
import { processVoiceToInvoice } from "@/services/ai";

// Trade options for first-run experience
const TRADES = [
  { id: "plumber", name: "Plumber", icon: Droplet, color: "#007AFF" },
  { id: "electrician", name: "Electrician", icon: Zap, color: "#FF9500" },
  { id: "painter", name: "Painter", icon: Paintbrush, color: "#AF52DE" },
  { id: "handyman", name: "Handyman", icon: Wrench, color: "#34C759" },
  { id: "hvac", name: "HVAC", icon: Thermometer, color: "#FF3B30" },
  { id: "tile_stone", name: "Tile / Stone", icon: Grid3x3, color: "#5AC8FA" },
  { id: "general", name: "General Contractor", icon: HardHat, color: "#8E8E93" },
  { id: "carpenter", name: "Carpenter", icon: Hammer, color: "#A2845E" },
  { id: "other", name: "Other", icon: Wrench, color: "#636366" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 20;
const RECENT_CARD_SIZE = 100;

/**
 * Dashboard Screen - iOS Control Center Style
 * Apple Design Award Foundation
 */

export default function Dashboard() {
  const router = useRouter();
  const { isDark, colors, glass, typography, spacing, radius } = useTheme();

  const { stats, isLoading, fetchDashboardStats } = useDashboardStore();
  const { profile, fetchProfile, updateProfile } = useProfileStore();
  const { invoices, fetchInvoices, setPendingInvoice } = useInvoiceStore();
  const { pendingReminders, fetchPendingReminders, showPreflightModal } = usePreflightStore();
  const { isPro } = useSubscriptionStore();
  const { events: activityEvents, fetchRecentActivity } = useActivityStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  // Check if this is first run (no invoices and no trade selected)
  const isFirstRun = invoices.length === 0;
  const needsTradeSelection = isFirstRun && !profile?.trade;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const recentScrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDashboardStats();
    fetchProfile();
    fetchInvoices();
    // Fetch pending reminders for Pro users
    if (isPro) {
      fetchPendingReminders();
    }

    // Fetch recent activity
    fetchRecentActivity();

    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([fetchDashboardStats(), fetchProfile(), fetchInvoices()]);
    setRefreshing(false);
  }, [fetchDashboardStats, fetchProfile, fetchInvoices]);

  // Voice Button Interaction Logic
  const handlePressIn = () => {
    setIsLongPress(false);

    // Start a timer - if held for 300ms, it's a long press
    const timeout = setTimeout(() => {
      setIsLongPress(true);
      startVoiceRecording();
    }, 300);

    setTapTimeout(timeout);
  };

  const handlePressOut = async () => {
    if (tapTimeout) {
      clearTimeout(tapTimeout);
      setTapTimeout(null);
    }

    if (isLongPress && isRecording) {
      // Long press release - stop recording
      await stopVoiceRecording();
    } else if (!isLongPress) {
      // Quick tap - navigate to manual entry
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push("/invoice/create");
    }
  };

  const startVoiceRecording = async () => {
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await startRecording();
  };

  const stopVoiceRecording = async () => {
    setIsRecording(false);
    setIsLongPress(false);
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

  // Handle trade selection
  const handleTradeSelect = async (tradeId: string) => {
    setSelectedTrade(tradeId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Save to profile
    try {
      await updateProfile({ trade: tradeId });
      setShowTradeModal(false);
    } catch (error) {
      console.error("Error saving trade:", error);
    }
  };

  // Recent invoices (last 5)
  const recentInvoices = invoices.slice(0, 5);
  const overdueCount = stats?.overdueInvoicesCount || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ═══════════════════════════════════════════════════════════
            FIRST RUN EMPTY STATE - "Let's Get You Paid"
        ═══════════════════════════════════════════════════════════ */}
        {isFirstRun && (
          <Animated.View
            style={[
              styles.emptyStateContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Illustration Circle */}
            <View style={[styles.emptyIllustration, { backgroundColor: colors.primary + "12" }]}>
              <TrendingUp size={56} color={colors.primary} strokeWidth={1.5} />
            </View>

            {/* Title */}
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Let's Get You Paid
            </Text>

            {/* Subtitle */}
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Create your first invoice in seconds.{"\n"}We'll track the payment for you.
            </Text>

            {/* Trade Selection CTA */}
            {!profile?.trade && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowTradeModal(true);
                }}
                style={[styles.tradeSelectButton, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Wrench size={18} color={colors.textTertiary} />
                <Text style={[styles.tradeSelectText, { color: colors.text }]}>
                  Select your trade
                </Text>
                <ChevronRight size={16} color={colors.textTertiary} />
              </Pressable>
            )}

            {/* Arrow pointing to voice button */}
            <View style={styles.emptyArrowHint}>
              <Text style={[styles.emptyHintText, { color: colors.textTertiary }]}>
                ↓ Tap the button below to start
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            REVENUE CARD - Apple Cash Style Hero (Hidden on first run)
        ═══════════════════════════════════════════════════════════ */}
        {!isFirstRun && (
        <Animated.View
          style={[
            styles.revenueCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={isDark
              ? ["#1C1C1E", "#2C2C2E"]
              : ["#FFFFFF", "#F8F9FA"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.revenueCardGradient,
              {
                borderRadius: radius.xxl,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.4 : 0.15,
                shadowRadius: 16,
              },
            ]}
          >
            {/* Card Header */}
            <View style={styles.revenueHeader}>
              <View style={[styles.revenueIconContainer, { backgroundColor: colors.primary + "15" }]}>
                <TrendingUp size={18} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={[styles.revenueLabel, { color: colors.textTertiary }]}>
                Total Revenue
              </Text>
            </View>

            {/* Main Amount - Massive 48pt */}
            <AnimatedCurrency
              cents={stats?.totalRevenue || 0}
              currency={profile?.default_currency || "USD"}
              style={[styles.revenueAmount, { color: colors.text }]}
              duration={1200}
            />

            {/* Status Pills Row */}
            <View style={styles.statusPillsRow}>
              {/* Paid Count */}
              <View style={[styles.statusPill, { backgroundColor: colors.statusPaid + "15" }]}>
                <Text style={[styles.statusPillText, { color: colors.statusPaid }]}>
                  {stats?.paidInvoicesCount || 0} Paid
                </Text>
              </View>

              {/* Overdue Pill - Only show if > 0 */}
              {overdueCount > 0 && (
                <View style={[styles.statusPill, styles.statusPillOverdue, { backgroundColor: colors.statusOverdue + "15" }]}>
                  <AlertCircle size={12} color={colors.statusOverdue} />
                  <Text style={[styles.statusPillText, { color: colors.statusOverdue, marginLeft: 4 }]}>
                    {overdueCount} Overdue
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            PRE-FLIGHT CHECK BANNER - Bad Cop reminders pending
        ═══════════════════════════════════════════════════════════ */}
        {isPro && pendingReminders.length > 0 && (
          <Animated.View style={[styles.preflightBanner, { opacity: fadeAnim }]}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                showPreflightModal();
              }}
              style={({ pressed }) => [
                styles.preflightCard,
                {
                  backgroundColor: colors.primary + "12",
                  borderColor: colors.primary + "25",
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View style={[styles.preflightIcon, { backgroundColor: colors.primary + "20" }]}>
                <Shield size={22} color={colors.primary} />
              </View>
              <View style={styles.preflightContent}>
                <Text style={[styles.preflightTitle, { color: colors.text }]}>
                  Bad Cop Ready
                </Text>
                <Text style={[styles.preflightSubtitle, { color: colors.textSecondary }]}>
                  {pendingReminders.length} reminder{pendingReminders.length !== 1 ? "s" : ""} pending • Tap to review
                </Text>
              </View>
              <ChevronRight size={20} color={colors.primary} />
            </Pressable>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            RECENT ACTIVITY - Horizontal Glass Cards
        ═══════════════════════════════════════════════════════════ */}
        {recentInvoices.length > 0 && (
          <Animated.View style={[styles.recentSection, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Activity
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/invoices")}
                style={styles.seeAllButton}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </Text>
                <ChevronRight size={16} color={colors.primary} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScrollContent}
              decelerationRate="fast"
              snapToInterval={RECENT_CARD_SIZE + 12}
            >
              {recentInvoices.map((invoice, index) => (
                <Pressable
                  key={invoice.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/invoice/${invoice.id}`);
                  }}
                >
                  <Animated.View
                    style={[
                      styles.recentCard,
                      {
                        backgroundColor: glass.background,
                        borderColor: glass.border,
                        borderRadius: radius.lg,
                      },
                    ]}
                  >
                    {/* Client Avatar */}
                    <MonogramAvatar
                      name={invoice.client_name}
                      size={40}
                      style={{ marginBottom: 8 }}
                    />

                    {/* Amount */}
                    <Text
                      style={[styles.recentAmount, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {formatCurrency(invoice.total, profile?.default_currency)}
                    </Text>

                    {/* Client Name */}
                    <Text
                      style={[styles.recentClient, { color: colors.textTertiary }]}
                      numberOfLines={1}
                    >
                      {invoice.client_name.split(" ")[0]}
                    </Text>

                    {/* Status Indicator */}
                    <View
                      style={[
                        styles.recentStatusDot,
                        {
                          backgroundColor:
                            invoice.status === "paid"
                              ? colors.statusPaid
                              : invoice.status === "overdue"
                              ? colors.statusOverdue
                              : invoice.status === "sent"
                              ? colors.statusSent
                              : colors.statusDraft,
                        },
                      ]}
                    />
                  </Animated.View>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Quick Stats Row - Hidden on first run */}
        {!isFirstRun && (
          <Animated.View
            style={[
              styles.quickStatsRow,
              { opacity: fadeAnim }
            ]}
          >
            <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                {stats?.totalInvoicesCount || 0}
              </Text>
              <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>
                Invoices
              </Text>
            </View>

            <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                {stats?.totalClientsCount || 0}
              </Text>
              <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>
                Clients
              </Text>
            </View>

            <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
              <Text style={[styles.quickStatValue, { color: colors.primary }]}>
                {formatCurrency(stats?.pendingAmount || 0, profile?.default_currency, true)}
              </Text>
              <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>
                Pending
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ACTIVITY FEED - Recent System Events
        ═══════════════════════════════════════════════════════════ */}
        {!isFirstRun && activityEvents.length > 0 && (
          <Animated.View style={[styles.activitySection, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Activity
              </Text>
            </View>
            <View style={[styles.activityCard, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
              <ActivityFeed limit={5} showViewAll={true} />
            </View>
          </Animated.View>
        )}

        {/* Bottom spacer for voice button */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════
          INPUT ACTIONS - Siri Orb at Bottom Center
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.inputActionsContainer}>
        <View style={styles.voiceButtonWrapper}>
          <VoiceButton
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            isRecording={isRecording}
          />
        </View>

        {/* Hint Label */}
        <Text style={[styles.inputHint, { color: colors.textTertiary }]}>
          Hold to Speak  •  Tap to Type
        </Text>
      </View>

      <RecordingOverlay visible={isRecording} duration={recordingDuration} />

      {/* ═══════════════════════════════════════════════════════════
          TRADE SELECTION MODAL - First Run Experience
      ═══════════════════════════════════════════════════════════ */}
      <Modal
        visible={showTradeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTradeModal(false)}
      >
        <View style={[styles.tradeModalContainer, { backgroundColor: colors.background }]}>
          <SafeAreaView style={styles.tradeModalContent}>
            {/* Header */}
            <View style={styles.tradeModalHeader}>
              <Text style={[styles.tradeModalTitle, { color: colors.text }]}>
                What's your trade?
              </Text>
              <Text style={[styles.tradeModalSubtitle, { color: colors.textTertiary }]}>
                We'll customize your experience
              </Text>
            </View>

            {/* Trade Grid */}
            <FlatList
              data={TRADES}
              numColumns={2}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.tradeGrid}
              columnWrapperStyle={styles.tradeRow}
              renderItem={({ item }) => {
                const TradeIcon = item.icon;
                const isSelected = selectedTrade === item.id || profile?.trade === item.id;

                return (
                  <Pressable
                    onPress={() => handleTradeSelect(item.id)}
                    style={({ pressed }) => [
                      styles.tradeCard,
                      {
                        backgroundColor: isSelected
                          ? item.color + "20"
                          : colors.card,
                        borderColor: isSelected ? item.color : colors.border,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      },
                    ]}
                  >
                    {isSelected && (
                      <View style={[styles.tradeCheckmark, { backgroundColor: item.color }]}>
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                    <View style={[styles.tradeIconContainer, { backgroundColor: item.color + "15" }]}>
                      <TradeIcon size={28} color={item.color} strokeWidth={2} />
                    </View>
                    <Text
                      style={[
                        styles.tradeName,
                        { color: isSelected ? item.color : colors.text },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </Pressable>
                );
              }}
            />

            {/* Skip Button */}
            <Pressable
              onPress={() => setShowTradeModal(false)}
              style={styles.tradeSkipButton}
            >
              <Text style={[styles.tradeSkipText, { color: colors.textTertiary }]}>
                Skip for now
              </Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper function
function formatCurrency(cents: number, currency: string = "USD", short: boolean = false): string {
  const value = cents / 100;
  if (short && value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },

  // ═══════════════════════════════════════════════════════════
  // REVENUE CARD
  // ═══════════════════════════════════════════════════════════
  revenueCard: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: 24,
  },
  revenueCardGradient: {
    padding: 24,
    elevation: 12,
  },
  revenueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  revenueIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  revenueLabel: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  revenueAmount: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 56,
    marginBottom: 16,
    fontVariant: ["tabular-nums"],
  },
  statusPillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusPillOverdue: {
    // Additional styling for overdue pill
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.1,
  },

  // ═══════════════════════════════════════════════════════════
  // PRE-FLIGHT BANNER
  // ═══════════════════════════════════════════════════════════
  preflightBanner: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: 16,
  },
  preflightCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  preflightIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  preflightContent: {
    flex: 1,
    marginLeft: 12,
  },
  preflightTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  preflightSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },

  // ═══════════════════════════════════════════════════════════
  // RECENT ACTIVITY
  // ═══════════════════════════════════════════════════════════
  recentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: CARD_MARGIN,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: "500",
  },
  recentScrollContent: {
    paddingHorizontal: CARD_MARGIN,
    gap: 12,
  },
  recentCard: {
    width: RECENT_CARD_SIZE,
    height: RECENT_CARD_SIZE + 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"],
  },
  recentClient: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  recentStatusDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ═══════════════════════════════════════════════════════════
  // QUICK STATS
  // ═══════════════════════════════════════════════════════════
  quickStatsRow: {
    flexDirection: "row",
    paddingHorizontal: CARD_MARGIN,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 4,
    fontVariant: ["tabular-nums"],
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ═══════════════════════════════════════════════════════════
  // ACTIVITY FEED
  // ═══════════════════════════════════════════════════════════
  activitySection: {
    marginTop: 24,
    marginHorizontal: CARD_MARGIN,
  },
  activityCard: {
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // ═══════════════════════════════════════════════════════════
  // INPUT ACTIONS
  // ═══════════════════════════════════════════════════════════
  inputActionsContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  voiceButtonWrapper: {
    marginBottom: 12,
  },
  inputHint: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
  },

  // ═══════════════════════════════════════════════════════════
  // FIRST RUN EMPTY STATE
  // ═══════════════════════════════════════════════════════════
  emptyStateContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 24,
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
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
    marginBottom: 24,
  },
  tradeSelectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 12,
    marginBottom: 32,
  },
  tradeSelectText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  emptyArrowHint: {
    marginTop: 24,
  },
  emptyHintText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // ═══════════════════════════════════════════════════════════
  // TRADE SELECTION MODAL
  // ═══════════════════════════════════════════════════════════
  tradeModalContainer: {
    flex: 1,
  },
  tradeModalContent: {
    flex: 1,
  },
  tradeModalHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  tradeModalTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  tradeModalSubtitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  tradeGrid: {
    padding: 16,
    gap: 12,
  },
  tradeRow: {
    gap: 12,
  },
  tradeCard: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 2,
    padding: 16,
    position: "relative",
  },
  tradeCheckmark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  tradeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tradeName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  tradeSkipButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 24,
  },
  tradeSkipText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
