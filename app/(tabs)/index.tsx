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
  FileEdit,
  Send,
  Languages,
  FileText,
  BellRing,
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
import { getSampleInvoiceForTrade } from "@/services/tradeSamples";

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
  const { invoices, fetchInvoices, setPendingInvoice, createInvoice } = useInvoiceStore();
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

    // Save to profile and create sample invoice
    try {
      await updateProfile({ trade: tradeId });

      // Create a sample draft invoice for this trade
      const sample = getSampleInvoiceForTrade(tradeId);
      if (sample) {
        const subtotal = sample.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const taxRate = profile?.tax_rate || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        await createInvoice(
          {
            client_name: sample.clientName,
            status: "draft",
            subtotal: subtotal * 100, // Convert to cents
            tax_rate: taxRate,
            tax_amount: taxAmount * 100,
            total: total * 100,
            notes: sample.notes,
          },
          sample.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.price * 100, // Convert to cents
            amount: item.price * item.quantity * 100,
          }))
        );

        // Refresh invoices to show the new draft
        await fetchInvoices();
      }

      setShowTradeModal(false);
    } catch (error) {
      console.error("Error saving trade:", error);
    }
  };

  // Recent invoices (last 5)
  const recentInvoices = invoices.slice(0, 5);

  // Draft invoices - show up to 3
  const draftInvoices = invoices.filter((inv) => inv.status === "draft").slice(0, 3);

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
                paddingTop: 20,
              },
            ]}
          >
            {/* Title */}
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Let's Get You Paid
            </Text>

            {/* Subtitle */}
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Speak your invoice. We handle the rest.
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
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            MONEY STATUS HERO - "Who owes me money?" (Hidden on first run)
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
            {/* Overdue Amount - LARGEST, RED emphasis */}
            {(stats?.overdueAmount || 0) > 0 && (
              <Pressable
                onPress={() => router.push("/(tabs)/invoices")}
                style={styles.moneyStatusRow}
              >
                <View style={styles.moneyStatusLeft}>
                  <View style={[styles.moneyStatusDot, { backgroundColor: colors.statusOverdue }]} />
                  <Text style={[styles.moneyStatusLabel, { color: colors.statusOverdue }]}>
                    Overdue
                  </Text>
                </View>
                <AnimatedCurrency
                  cents={stats?.overdueAmount || 0}
                  currency={profile?.default_currency || "USD"}
                  style={[styles.moneyStatusAmountLarge, { color: colors.statusOverdue }]}
                  duration={1200}
                />
              </Pressable>
            )}

            {/* Unpaid Amount - Primary focus */}
            <Pressable
              onPress={() => router.push("/(tabs)/invoices")}
              style={styles.moneyStatusRow}
            >
              <View style={styles.moneyStatusLeft}>
                <View style={[styles.moneyStatusDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.moneyStatusLabel, { color: colors.textSecondary }]}>
                  Unpaid
                </Text>
              </View>
              <AnimatedCurrency
                cents={stats?.pendingAmount || 0}
                currency={profile?.default_currency || "USD"}
                style={[
                  (stats?.overdueAmount || 0) > 0 ? styles.moneyStatusAmount : styles.moneyStatusAmountLarge,
                  { color: colors.text }
                ]}
                duration={1200}
              />
            </Pressable>

            {/* Divider */}
            <View style={[styles.moneyStatusDivider, { backgroundColor: colors.border }]} />

            {/* Paid This Week - Positive reinforcement (smaller) */}
            <View style={styles.moneyStatusRow}>
              <View style={styles.moneyStatusLeft}>
                <View style={[styles.moneyStatusDot, { backgroundColor: colors.statusPaid }]} />
                <Text style={[styles.moneyStatusLabel, { color: colors.textTertiary }]}>
                  Paid this week
                </Text>
              </View>
              <AnimatedCurrency
                cents={stats?.paidThisWeek || 0}
                currency={profile?.default_currency || "USD"}
                style={[styles.moneyStatusAmountSmall, { color: colors.statusPaid }]}
                duration={1200}
              />
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
            BAD COP FOMO BANNER - Show FREE users what they're missing
        ═══════════════════════════════════════════════════════════ */}
        {!isFirstRun && !isPro && (stats?.overdueAmount || 0) > 0 && (
          <Animated.View style={[styles.badCopFomoBanner, { opacity: fadeAnim }]}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/paywall?trigger=bad_cop_fomo");
              }}
              style={({ pressed }) => [
                styles.badCopFomoCard,
                {
                  backgroundColor: colors.statusOverdue + "08",
                  borderColor: colors.statusOverdue + "20",
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              {/* Ghost Icon */}
              <View style={[styles.badCopFomoIcon, { backgroundColor: colors.statusOverdue + "15" }]}>
                <AlertCircle size={24} color={colors.statusOverdue} />
              </View>

              {/* FOMO Content */}
              <View style={styles.badCopFomoContent}>
                <Text style={[styles.badCopFomoTitle, { color: colors.statusOverdue }]}>
                  You're losing money
                </Text>
                <Text style={[styles.badCopFomoSubtitle, { color: colors.textSecondary }]}>
                  Bad Cop would have sent {Math.ceil((stats?.overdueCount || 1) * 2.5)} reminders and likely collected{" "}
                  <Text style={{ color: colors.statusPaid, fontWeight: "700" }}>
                    {formatCurrency(Math.round((stats?.overdueAmount || 0) * 0.73), profile?.default_currency)}
                  </Text>{" "}
                  by now.
                </Text>
              </View>

              {/* CTA */}
              <View style={[styles.badCopFomoCTA, { backgroundColor: colors.statusOverdue }]}>
                <Text style={styles.badCopFomoCTAText}>Fix This</Text>
              </View>
            </Pressable>

            {/* Ghost notification preview */}
            <View style={[styles.ghostNotification, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.ghostNotificationDot} />
              <Text style={[styles.ghostNotificationText, { color: colors.textTertiary }]}>
                <Text style={{ fontStyle: "italic" }}>
                  "Bad Cop would have reminded {invoices.find(i => i.status === "overdue")?.client_name?.split(" ")[0] || "your client"} about their ${Math.round((invoices.find(i => i.status === "overdue")?.total || 80000) / 100)} invoice today"
                </Text>
              </Text>
              <Text style={[styles.ghostNotificationMissed, { color: colors.statusOverdue }]}>
                MISSED
              </Text>
            </View>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            DRAFTS SECTION - Unfinished invoices
        ═══════════════════════════════════════════════════════════ */}
        {!isFirstRun && draftInvoices.length > 0 && (
          <Animated.View style={[styles.draftsSection, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <FileEdit size={18} color={colors.statusDraft} style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Drafts
                </Text>
              </View>
            </View>

            <View style={[styles.draftsCard, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
              {draftInvoices.map((draft, index) => (
                <Pressable
                  key={draft.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/invoice/${draft.id}`);
                  }}
                  style={({ pressed }) => [
                    styles.draftRow,
                    index < draftInvoices.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={styles.draftInfo}>
                    <Text style={[styles.draftClient, { color: colors.text }]} numberOfLines={1}>
                      {draft.client_name || "Unnamed Client"}
                    </Text>
                    <Text style={[styles.draftAmount, { color: colors.textSecondary }]}>
                      {formatCurrency(draft.total, profile?.default_currency)}
                    </Text>
                  </View>
                  <View style={[styles.draftCTA, { backgroundColor: colors.primary }]}>
                    <Send size={14} color="#FFFFFF" />
                    <Text style={styles.draftCTAText}>Finish & Send</Text>
                  </View>
                </Pressable>
              ))}
            </View>
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
            PRO ROI PROOF - "Collected by Auto-Chase" (PRO users only)
        ═══════════════════════════════════════════════════════════ */}
        {!isFirstRun && isPro && (stats?.collectedByAutoChase || 0) > 0 && (
          <Animated.View style={[styles.proRoiSection, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={isDark
                ? ["#1C3D1F", "#1C2D1E"]
                : ["#E8F5E9", "#F1F8E9"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.proRoiCard, { borderRadius: radius.lg }]}
            >
              <View style={styles.proRoiLeft}>
                <View style={[styles.proRoiBadge, { backgroundColor: colors.statusPaid + "30" }]}>
                  <Zap size={14} color={colors.statusPaid} />
                  <Text style={[styles.proRoiBadgeText, { color: colors.statusPaid }]}>PRO</Text>
                </View>
                <Text style={[styles.proRoiLabel, { color: colors.statusPaid }]}>
                  Collected by Auto-Chase
                </Text>
                <Text style={[styles.proRoiSubtext, { color: colors.textSecondary }]}>
                  Payments recovered by reminders
                </Text>
              </View>
              <Text style={[styles.proRoiAmount, { color: colors.statusPaid }]}>
                {formatCurrency(stats?.collectedByAutoChase || 0, profile?.default_currency)}
              </Text>
            </LinearGradient>
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
      <View style={[styles.inputActionsContainer, isFirstRun && styles.inputActionsContainerFirstRun]}>
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

        {/* Benefits - Show on first run */}
        {isFirstRun && (
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primary + "15" }]}>
                <Languages size={18} color={colors.primary} />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>
                  Speak Any Language
                </Text>
                <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                  English, Spanish, or Portuguese — we'll translate to professional English automatically
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primary + "15" }]}>
                <FileText size={18} color={colors.primary} />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>
                  Invoices & Estimates
                </Text>
                <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                  Customers can approve estimates and pay deposits instantly
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primary + "15" }]}>
                <BellRing size={18} color={colors.primary} />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>
                  Auto Payment Reminders
                </Text>
                <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                  We follow up automatically until you're paid — no more chasing customers
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primary + "15" }]}>
                <Shield size={18} color={colors.primary} />
              </View>
              <View style={styles.benefitTextContainer}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>
                  Professional Branding
                </Text>
                <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
                  Send polished invoices with your logo that make you look like a pro
                </Text>
              </View>
            </View>
          </View>
        )}
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
  // Money Status Hero Styles
  moneyStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  moneyStatusLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  moneyStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  moneyStatusLabel: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  moneyStatusAmountLarge: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  moneyStatusAmount: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
    fontVariant: ["tabular-nums"],
  },
  moneyStatusAmountSmall: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.4,
    fontVariant: ["tabular-nums"],
  },
  moneyStatusDivider: {
    height: 1,
    marginVertical: 8,
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
  // DRAFTS SECTION
  // ═══════════════════════════════════════════════════════════
  draftsSection: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: 24,
  },
  draftsCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  draftRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  draftInfo: {
    flex: 1,
    marginRight: 12,
  },
  draftClient: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  draftAmount: {
    fontSize: 14,
    fontWeight: "500",
  },
  draftCTA: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  draftCTAText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
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
  // PRO ROI PROOF
  // ═══════════════════════════════════════════════════════════
  proRoiSection: {
    marginTop: 16,
    marginHorizontal: CARD_MARGIN,
  },
  proRoiCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  proRoiLeft: {
    flex: 1,
  },
  proRoiBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    marginBottom: 6,
  },
  proRoiBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  proRoiLabel: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  proRoiSubtext: {
    fontSize: 12,
    fontWeight: "500",
  },
  proRoiAmount: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"],
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
  inputActionsContainerFirstRun: {
    bottom: "auto",
    top: 180,
  },
  voiceButtonWrapper: {
    marginBottom: 12,
  },
  inputHint: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  benefitsContainer: {
    marginTop: 48,
    paddingHorizontal: 24,
    width: "100%",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 18,
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

  // ═══════════════════════════════════════════════════════════
  // BAD COP FOMO BANNER (Free Users)
  // ═══════════════════════════════════════════════════════════
  badCopFomoBanner: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: 20,
  },
  badCopFomoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  badCopFomoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  badCopFomoContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  badCopFomoTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  badCopFomoSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  badCopFomoCTA: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  badCopFomoCTAText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  ghostNotification: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  ghostNotificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF9500",
    marginRight: 10,
    opacity: 0.6,
  },
  ghostNotificationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  ghostNotificationMissed: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
