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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { VoiceButton } from "@/components/VoiceButton";
import { RecordingOverlay } from "@/components/RecordingOverlay";
import { AnimatedCurrency } from "@/components/AnimatedNumber";
import { MonogramAvatar } from "@/components/MonogramAvatar";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useTheme } from "@/lib/theme";
import { startRecording, stopRecording } from "@/services/audio";
import { processVoiceToInvoice } from "@/services/ai";

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
  const { profile, fetchProfile } = useProfileStore();
  const { invoices, fetchInvoices, setPendingInvoice } = useInvoiceStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const recentScrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDashboardStats();
    fetchProfile();
    fetchInvoices();

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
            REVENUE CARD - Apple Cash Style Hero
        ═══════════════════════════════════════════════════════════ */}
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

        {/* Quick Stats Row */}
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
});
