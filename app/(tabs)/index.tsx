import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Pressable,
  RefreshControl,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
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
  Send,
  Clock,
  AlertCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { VoiceButton } from "@/components/VoiceButton";
import { RecordingOverlay } from "@/components/RecordingOverlay";
import { AnimatedCurrency } from "@/components/AnimatedNumber";
import ZeroState from "@/components/dashboard/ZeroState";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useTheme } from "@/lib/theme";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { startRecording, stopRecording } from "@/services/audio";
import { processVoiceToInvoice } from "@/services/ai";
import { getSampleInvoiceForTrade } from "@/services/tradeSamples";

/**
 * Home Screen - Cash Flow Engine
 * Per HYBRID_SPEC.md
 *
 * Layout:
 * 1. Header: "Business Health" subtitle
 * 2. Scoreboard: Collected (green) + Outstanding (orange)
 * 3. Action Stream: Only drafts, overdue, deposit_pending
 * 4. Revenue Hook: Auto-Chase upsell if outstanding > 0
 * 5. Voice Orb: "Hold to Speak • Tap to Type"
 */

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

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, colors, radius } = useTheme();

  const { stats, fetchDashboardStats } = useDashboardStore();
  const { profile, fetchProfile, updateProfile } = useProfileStore();
  const { invoices, fetchInvoices, setPendingInvoice, createInvoice } = useInvoiceStore();
  const { isPro } = useSubscriptionStore();
  const { setupTasks, isSetupComplete } = useOnboardingStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  // Celebration animation for payment received
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Check if first run - show ZeroState when no invoices and setup incomplete
  const isFirstRun = invoices.length === 0;
  const showZeroState = isFirstRun && !isSetupComplete();

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

  // Trigger celebration glow
  const triggerCelebration = () => {
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Voice Button Interaction
  const handlePressIn = () => {
    setIsLongPress(false);
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
      await stopVoiceRecording();
    } else if (!isLongPress) {
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
    try {
      await updateProfile({ trade: tradeId });
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
            subtotal: subtotal * 100,
            tax_rate: taxRate,
            tax_amount: taxAmount * 100,
            total: total * 100,
            notes: sample.notes,
          },
          sample.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.price * 100,
            amount: item.price * item.quantity * 100,
          }))
        );
        await fetchInvoices();
      }
      setShowTradeModal(false);
    } catch (error) {
      console.error("Error saving trade:", error);
    }
  };

  // Action Stream: Only actionable items
  const actionItems = invoices.filter(
    (inv) => inv.status === "draft" || inv.status === "overdue" || inv.status === "sent"
  ).sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());

  // Calculate collected this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const collectedThisMonth = invoices
    .filter((inv) => inv.status === "paid" && inv.paid_at && new Date(inv.paid_at) >= startOfMonth)
    .reduce((sum, inv) => sum + inv.total, 0);

  // Calculate outstanding
  const outstanding = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0);

  // Show ZeroState (Blueprint Dashboard) for new users
  if (showZeroState) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        {/* Header */}
        <View style={styles.zeroStateHeader}>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
            Business Health
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Overview
          </Text>
        </View>

        {/* Zero State - Ghost Dashboard + Activation Stack */}
        <ZeroState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* ═══════════════════════════════════════════════════════════
            HEADER - "Business Health"
        ═══════════════════════════════════════════════════════════ */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
            Business Health
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Overview
          </Text>
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════
            FIRST RUN - Trade Selection
        ═══════════════════════════════════════════════════════════ */}
        {isFirstRun && !profile?.trade && (
          <Animated.View style={[styles.firstRunCard, { opacity: fadeAnim }]}>
            <Text style={[styles.firstRunTitle, { color: colors.text }]}>
              Let's Get You Paid
            </Text>
            <Text style={[styles.firstRunSubtitle, { color: colors.textSecondary }]}>
              Speak your invoice. We handle the rest.
            </Text>
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
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SCOREBOARD - Collected + Outstanding
        ═══════════════════════════════════════════════════════════ */}
        {!isFirstRun && (
          <Animated.View
            style={[
              styles.scoreboard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Collected This Month - Primary */}
            <Animated.View
              style={[
                styles.scoreCard,
                styles.scoreCardPrimary,
                {
                  backgroundColor: isDark ? "#0D2818" : "#E8F5E9",
                  borderColor: colors.statusPaid + "30",
                  // Celebration glow
                  shadowColor: colors.statusPaid,
                  shadowOpacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.6],
                  }),
                  shadowRadius: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 24],
                  }),
                },
              ]}
            >
              <Text style={[styles.scoreLabel, { color: colors.statusPaid }]}>
                COLLECTED THIS MONTH
              </Text>
              <AnimatedCurrency
                cents={collectedThisMonth}
                currency={profile?.default_currency || "USD"}
                style={[styles.scoreAmount, { color: colors.statusPaid }]}
                duration={1200}
              />
            </Animated.View>

            {/* Outstanding - Secondary */}
            <Pressable
              onPress={() => router.push("/(tabs)/invoices")}
              style={[
                styles.scoreCard,
                styles.scoreCardSecondary,
                {
                  backgroundColor: isDark ? "#2D1F0D" : "#FFF3E0",
                  borderColor: colors.systemOrange + "30",
                },
              ]}
            >
              <Text style={[styles.scoreLabelSmall, { color: colors.systemOrange }]}>
                OUTSTANDING
              </Text>
              <View style={styles.scoreRow}>
                <AnimatedCurrency
                  cents={outstanding}
                  currency={profile?.default_currency || "USD"}
                  style={[styles.scoreAmountSmall, { color: colors.systemOrange }]}
                  duration={1200}
                />
                <ChevronRight size={18} color={colors.systemOrange} />
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            ACTION STREAM - Only actionable items
        ═══════════════════════════════════════════════════════════ */}
        {!isFirstRun && (
          <Animated.View style={[styles.actionSection, { opacity: fadeAnim }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Action Required
            </Text>

            {actionItems.length === 0 ? (
              <View style={[styles.emptyAction, { backgroundColor: colors.card }]}>
                <Check size={32} color={colors.statusPaid} />
                <Text style={[styles.emptyActionTitle, { color: colors.text }]}>
                  All caught up!
                </Text>
                <Text style={[styles.emptyActionSubtitle, { color: colors.textTertiary }]}>
                  Go make money.
                </Text>
              </View>
            ) : (
              <View style={styles.actionList}>
                {actionItems.slice(0, 5).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/invoice/${item.id}`);
                    }}
                    style={({ pressed }) => [
                      styles.actionCard,
                      {
                        backgroundColor: colors.card,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                    ]}
                  >
                    {/* Status Icon */}
                    <View
                      style={[
                        styles.actionIcon,
                        {
                          backgroundColor:
                            item.status === "overdue"
                              ? colors.statusOverdue + "15"
                              : item.status === "draft"
                              ? colors.statusDraft + "15"
                              : colors.statusSent + "15",
                        },
                      ]}
                    >
                      {item.status === "overdue" ? (
                        <AlertCircle size={20} color={colors.statusOverdue} />
                      ) : item.status === "draft" ? (
                        <Clock size={20} color={colors.statusDraft} />
                      ) : (
                        <Send size={20} color={colors.statusSent} />
                      )}
                    </View>

                    {/* Content */}
                    <View style={styles.actionContent}>
                      <Text style={[styles.actionClient, { color: colors.text }]} numberOfLines={1}>
                        {item.client_name || "Unnamed Client"}
                      </Text>
                      <Text style={[styles.actionAmount, { color: colors.textSecondary }]}>
                        {formatCurrency(item.total, profile?.default_currency)}
                      </Text>
                    </View>

                    {/* Status Badge */}
                    <View
                      style={[
                        styles.actionBadge,
                        {
                          backgroundColor:
                            item.status === "overdue"
                              ? colors.statusOverdue
                              : item.status === "draft"
                              ? colors.statusDraft
                              : colors.statusSent,
                        },
                      ]}
                    >
                      <Text style={styles.actionBadgeText}>
                        {item.status === "overdue"
                          ? "Chase"
                          : item.status === "draft"
                          ? "Finish"
                          : "Pending"}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════════════
            REVENUE HOOK - Auto-Chase Upsell
        ═══════════════════════════════════════════════════════════ */}
        {!isFirstRun && !isPro && outstanding > 0 && (
          <Animated.View style={[styles.revenueHook, { opacity: fadeAnim }]}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/paywall?trigger=auto_chase");
              }}
              style={[styles.revenueHookCard, { backgroundColor: isDark ? "#1C1C1E" : "#1C1C1E" }]}
            >
              <View style={styles.revenueHookContent}>
                <Shield size={24} color="#00D632" />
                <View style={styles.revenueHookText}>
                  <Text style={styles.revenueHookTitle}>
                    Recover this money faster?
                  </Text>
                  <Text style={styles.revenueHookSubtitle}>
                    Enable Auto-Chase to get paid 40% faster.
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#00D632" />
            </Pressable>
          </Animated.View>
        )}

        {/* Bottom spacer for voice button */}
        <View style={{ height: 220 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════
          VOICE ORB - "Hold to Speak • Tap to Type"
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.voiceContainer}>
        <VoiceButton
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          isRecording={isRecording}
        />
        <Text style={[styles.voiceHint, { color: colors.textTertiary }]}>
          Hold to Speak  •  Tap to Type
        </Text>
      </View>

      <RecordingOverlay visible={isRecording} duration={recordingDuration} />

      {/* ═══════════════════════════════════════════════════════════
          TRADE SELECTION MODAL
      ═══════════════════════════════════════════════════════════ */}
      <Modal
        visible={showTradeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTradeModal(false)}
      >
        <View style={[styles.tradeModalContainer, { backgroundColor: colors.background }]}>
          <SafeAreaView style={styles.tradeModalContent}>
            <View style={styles.tradeModalHeader}>
              <Text style={[styles.tradeModalTitle, { color: colors.text }]}>
                What's your trade?
              </Text>
              <Text style={[styles.tradeModalSubtitle, { color: colors.textTertiary }]}>
                We'll customize your experience
              </Text>
            </View>

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
                        backgroundColor: isSelected ? item.color + "20" : colors.card,
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
                    <Text style={[styles.tradeName, { color: isSelected ? item.color : colors.text }]}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              }}
            />

            <Pressable onPress={() => setShowTradeModal(false)} style={styles.tradeSkipButton}>
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
function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Header
  header: {
    marginBottom: 24,
  },
  zeroStateHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.7,
  },

  // First Run
  firstRunCard: {
    alignItems: "center",
    paddingVertical: 40,
  },
  firstRunTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
    marginBottom: 12,
  },
  firstRunSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
  },
  tradeSelectButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 12,
  },
  tradeSelectText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },

  // Scoreboard
  scoreboard: {
    marginBottom: 24,
  },
  scoreCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  scoreCardPrimary: {
    marginBottom: 12,
  },
  scoreCardSecondary: {},
  scoreLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreLabelSmall: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scoreAmount: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
    fontVariant: ["tabular-nums"],
  },
  scoreAmountSmall: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
    fontVariant: ["tabular-nums"],
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Action Section
  actionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  emptyAction: {
    alignItems: "center",
    padding: 40,
    borderRadius: 20,
  },
  emptyActionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyActionSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  actionList: {
    gap: 10,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionClient: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  actionAmount: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // Revenue Hook
  revenueHook: {
    marginBottom: 24,
  },
  revenueHookCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
  },
  revenueHookContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  revenueHookText: {
    marginLeft: 12,
    flex: 1,
  },
  revenueHookTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  revenueHookSubtitle: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },

  // Voice Container
  voiceContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  voiceHint: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "500",
  },

  // Trade Modal
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
