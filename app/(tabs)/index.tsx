import { View, Text, ScrollView, StyleSheet, Animated, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Moon, Sun, TrendingUp, Clock } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { VoiceButton } from "../../components/VoiceButton";
import { RecordingOverlay } from "../../components/RecordingOverlay";
import { useInvoiceStore } from "../../store/useInvoiceStore";
import { useProfileStore } from "../../store/useProfileStore";
import { formatCurrency } from "../../lib/utils";
import { useTheme, typography, spacing, radius } from "../../lib/theme";
import { startRecording, stopRecording } from "../../services/audio";
import { transcribeAudio, parseInvoice } from "../../services/ai";

export default function Dashboard() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const { invoices, setPendingInvoice } = useInvoiceStore();
  const { profile } = useProfileStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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

  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0);

  const handlePressIn = async () => {
    setIsRecording(true);
    await startRecording();
  };

  const handlePressOut = async () => {
    setIsRecording(false);
    const audioUri = await stopRecording();

    if (audioUri) {
      const transcript = await transcribeAudio(audioUri);
      const parsedInvoice = await parseInvoice(transcript);
      setPendingInvoice(parsedInvoice);
      router.push("/invoice/preview");
    }
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.greeting}>
              {getGreeting()}
            </Text>
            <Text style={styles.businessName}>
              {profile.businessName || "ContractorPro"}
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
          <Text style={styles.mainCardAmount}>
            {formatCurrency(totalRevenue)}
          </Text>
          <Text style={styles.mainCardSubtext}>
            {invoices.filter((inv) => inv.status === "paid").length} paid invoices
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.statCard, styles.statCardPending]}>
            <View style={styles.statIconContainer}>
              <Clock size={18} color={colors.alert} />
            </View>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={[styles.statAmount, { color: colors.alert }]}>
              {formatCurrency(pendingAmount)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Invoices</Text>
            <Text style={styles.statAmount}>{invoices.length}</Text>
            <Text style={styles.statSubtext}>total created</Text>
          </View>
        </Animated.View>

        <View style={styles.voiceSection}>
          <Text style={styles.voiceHint}>Hold to create invoice</Text>
        </View>
      </ScrollView>

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

const createStyles = (colors: any, isDark: boolean) =>
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
    statsRow: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.xl,
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
