import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react-native";
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.businessName}>
              {profile.businessName || "ContractorPro"}
            </Text>
          </View>
          <Pressable onPress={handleThemeToggle} style={styles.themeButton}>
            {isDark ? (
              <Sun size={20} color={colors.text} />
            ) : (
              <Moon size={20} color={colors.text} />
            )}
          </Pressable>
        </View>

        {/* Revenue */}
        <View style={styles.revenueSection}>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueAmount}>{formatCurrency(totalRevenue)}</Text>
          {pendingAmount > 0 && (
            <Text style={styles.pendingText}>
              {formatCurrency(pendingAmount)} pending
            </Text>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{invoices.length}</Text>
            <Text style={styles.statLabel}>Invoices</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {invoices.filter((inv) => inv.status === "paid").length}
            </Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {invoices.filter((inv) => inv.status === "sent" || inv.status === "overdue").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
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
      paddingBottom: 200,
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
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    // Revenue
    revenueSection: {
      marginBottom: spacing.xl,
    },
    revenueLabel: {
      ...typography.footnote,
      color: colors.textTertiary,
      marginBottom: spacing.xs,
    },
    revenueAmount: {
      fontSize: 48,
      fontWeight: "700",
      color: colors.primary,
      letterSpacing: -1,
    },
    pendingText: {
      ...typography.footnote,
      color: colors.alert,
      marginTop: spacing.xs,
    },
    // Stats
    statsRow: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statValue: {
      ...typography.title2,
      color: colors.text,
      marginBottom: 2,
    },
    statLabel: {
      ...typography.caption1,
      color: colors.textTertiary,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.xs,
    },
    // Voice button
    voiceButtonContainer: {
      position: "absolute",
      bottom: 120,
      left: 0,
      right: 0,
      alignItems: "center",
    },
  });
