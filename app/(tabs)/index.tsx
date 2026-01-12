import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Moon, Sun, TrendingUp, Clock, AlertCircle, CheckCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { VoiceButton } from "@/components/VoiceButton";
import { RecordingOverlay } from "@/components/RecordingOverlay";
import { AnimatedCurrency, PulseNumber } from "@/components/AnimatedNumber";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useTheme } from "@/lib/theme";
import { startRecording, stopRecording } from "@/services/audio";
import { processVoiceToInvoice } from "@/services/ai";
import { useInvoiceStore } from "@/store/useInvoiceStore";

/**
 * Dashboard Screen
 * Per design-system.md "Pulse UI" with animated numbers
 */

export default function Dashboard() {
  const router = useRouter();
  const { isDark, toggleTheme, colors, typography, spacing, radius } = useTheme();

  const { stats, isLoading, fetchDashboardStats } = useDashboardStore();
  const { profile, fetchProfile } = useProfileStore();
  const { setPendingInvoice } = useInvoiceStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Initial data fetch
    fetchDashboardStats();
    fetchProfile();

    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
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
    await Promise.all([fetchDashboardStats(), fetchProfile()]);
    setRefreshing(false);
  }, [fetchDashboardStats, fetchProfile]);

  const handlePressIn = async () => {
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await startRecording();
  };

  const handlePressOut = async () => {
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

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  // Format currency for display (amounts in cents)
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: profile?.default_currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const styles = createStyles(colors, isDark, spacing, radius, typography);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.businessName}>
              {profile?.business_name || "ContractorPro"}
            </Text>
          </View>
          <Pressable onPress={handleThemeToggle} style={styles.themeButton}>
            {isDark ? (
              <Sun size={22} color={colors.text} />
            ) : (
              <Moon size={22} color={colors.text} />
            )}
          </Pressable>
        </Animated.View>

        {/* Main Revenue Card - Per design-system.md "Pulse UI" */}
        <Animated.View
          style={[
            styles.mainCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.mainCardHeader}>
            <View style={styles.iconContainer}>
              <TrendingUp size={20} color={colors.primary} />
            </View>
            <Text style={styles.mainCardLabel}>Total Revenue</Text>
          </View>

          {/* Animated Amount - The "Pulse" */}
          <AnimatedCurrency
            cents={stats?.totalRevenue || 0}
            currency={profile?.default_currency || "USD"}
            style={styles.mainCardAmount}
            duration={1000}
          />

          <Text style={styles.mainCardSubtext}>
            <PulseNumber
              value={stats?.paidInvoicesCount || 0}
              style={styles.mainCardSubtext}
            />{" "}
            paid invoices
          </Text>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Pending Card */}
          <View style={[styles.statCard, styles.statCardPending]}>
            <View style={styles.statIconContainer}>
              <Clock size={18} color={colors.alert} />
            </View>
            <Text style={styles.statLabel}>Pending</Text>
            <AnimatedCurrency
              cents={stats?.pendingAmount || 0}
              currency={profile?.default_currency || "USD"}
              style={[styles.statAmount, { color: colors.alert }]}
              duration={800}
            />
            <Text style={styles.statSubtext}>
              {stats?.pendingInvoicesCount || 0} invoices
            </Text>
          </View>

          {/* Overdue Card */}
          <View style={[styles.statCard, stats?.overdueAmount > 0 && styles.statCardOverdue]}>
            <View style={styles.statIconContainer}>
              {(stats?.overdueAmount || 0) > 0 ? (
                <AlertCircle size={18} color={colors.statusOverdue} />
              ) : (
                <CheckCircle size={18} color={colors.statusPaid} />
              )}
            </View>
            <Text style={styles.statLabel}>
              {(stats?.overdueAmount || 0) > 0 ? "Overdue" : "All Clear"}
            </Text>
            {(stats?.overdueAmount || 0) > 0 ? (
              <>
                <AnimatedCurrency
                  cents={stats?.overdueAmount || 0}
                  currency={profile?.default_currency || "USD"}
                  style={[styles.statAmount, { color: colors.statusOverdue }]}
                  duration={800}
                />
                <Text style={styles.statSubtext}>
                  {stats?.overdueInvoicesCount || 0} invoices
                </Text>
              </>
            ) : (
              <Text style={[styles.statAmount, { color: colors.statusPaid }]}>
                No overdue
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View
          style={[
            styles.quickStats,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {stats?.totalInvoicesCount || 0}
            </Text>
            <Text style={styles.quickStatLabel}>Total Invoices</Text>
          </View>
          <View style={[styles.quickStatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {stats?.totalClientsCount || 0}
            </Text>
            <Text style={styles.quickStatLabel}>Clients</Text>
          </View>
          <View style={[styles.quickStatDivider, { backgroundColor: colors.border }]} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {stats?.thisMonthInvoicesCount || 0}
            </Text>
            <Text style={styles.quickStatLabel}>This Month</Text>
          </View>
        </Animated.View>

        {/* Voice Hint */}
        <View style={styles.voiceSection}>
          <Text style={styles.voiceHint}>Hold to create invoice</Text>
        </View>
      </ScrollView>

      {/* Voice Button */}
      <View style={styles.voiceButtonContainer}>
        <VoiceButton
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          isRecording={isRecording}
        />
      </View>

      <RecordingOverlay visible={isRecording} duration={recordingDuration} />
    </SafeAreaView>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const createStyles = (
  colors: any,
  isDark: boolean,
  spacing: any,
  radius: any,
  typography: any
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 180,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingTop: spacing.md,
      marginBottom: spacing.xl,
    },
    greeting: {
      ...typography.subhead,
      color: colors.textTertiary,
      marginBottom: spacing.xs,
    },
    businessName: {
      ...typography.largeTitle,
      color: colors.text,
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    // Main Revenue Card
    mainCard: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
    mainCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(0, 214, 50, 0.15)" : "rgba(0, 214, 50, 0.1)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    mainCardLabel: {
      ...typography.subhead,
      color: colors.textTertiary,
    },
    mainCardAmount: {
      ...typography.amount,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    mainCardSubtext: {
      ...typography.footnote,
      color: colors.textTertiary,
    },
    // Stats Row
    statsRow: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    statCardPending: {
      borderLeftWidth: 3,
      borderLeftColor: colors.alert,
    },
    statCardOverdue: {
      borderLeftWidth: 3,
      borderLeftColor: colors.statusOverdue,
    },
    statIconContainer: {
      marginBottom: spacing.sm,
    },
    statLabel: {
      ...typography.caption1,
      color: colors.textTertiary,
      marginBottom: spacing.xs,
    },
    statAmount: {
      ...typography.amountSmall,
      color: colors.text,
    },
    statSubtext: {
      ...typography.caption2,
      color: colors.textTertiary,
      marginTop: spacing.xs,
    },
    // Quick Stats
    quickStats: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.xl,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    quickStatItem: {
      flex: 1,
      alignItems: "center",
    },
    quickStatDivider: {
      width: 1,
      alignSelf: "stretch",
      marginVertical: 4,
    },
    quickStatValue: {
      ...typography.title2,
      color: colors.text,
      marginBottom: 2,
    },
    quickStatLabel: {
      ...typography.caption2,
      color: colors.textTertiary,
    },
    // Voice Section
    voiceSection: {
      alignItems: "center",
      marginTop: spacing.xl,
    },
    voiceHint: {
      ...typography.footnote,
      color: colors.textTertiary,
    },
    voiceButtonContainer: {
      position: "absolute",
      bottom: 120,
      left: 0,
      right: 0,
      alignItems: "center",
    },
  });
