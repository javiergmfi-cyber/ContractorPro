import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  Easing,
  FadeIn,
  FadeInUp,
  FadeInDown,
} from "react-native-reanimated";
import {
  CreditCard,
  Image,
  Mic,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  Check,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useProfileStore } from "@/store/useProfileStore";

const { width, height } = Dimensions.get("window");

/**
 * ZeroState - Tesla-Style Blueprint Dashboard
 *
 * Shows the "ghost" of what the dashboard will become,
 * with an activation stack to guide users through setup.
 *
 * Design Philosophy:
 * - Users see their future wealth visualized
 * - Setup tasks feel like "activating" the engine
 * - Premium, aspirational aesthetic
 */

interface SetupTaskProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  required: boolean;
  isPrimary?: boolean;
  onPress: () => void;
  index: number;
}

const SetupTask = ({
  id,
  title,
  description,
  icon,
  completed,
  required,
  isPrimary,
  onPress,
  index,
}: SetupTaskProps) => {
  const { colors, isDark } = useTheme();

  // Vivid iOS green - matches the reference image
  const VIVID_GREEN = "#4CD964";

  const cardBackgroundColor = isPrimary
    ? VIVID_GREEN
    : isDark
    ? "rgba(255, 255, 255, 0.08)"
    : "#F2F2F7";

  const cardBorderColor = isPrimary
    ? VIVID_GREEN
    : isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "#E5E5EA";

  // Pulsing animation for primary button
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isPrimary && !completed) {
      // Gentle pulsing animation
      pulseScale.value = withRepeat(
        withTiming(1.02, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      pulseOpacity.value = withRepeat(
        withTiming(0.9, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }
  }, [isPrimary, completed]);

  const animatedStyle = useAnimatedStyle(() => {
    if (isPrimary && !completed) {
      return {
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
      };
    }
    return {};
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          backgroundColor: cardBackgroundColor,
          borderColor: cardBorderColor,
          opacity: completed ? 0.5 : 1,
          marginBottom: 10,
          shadowColor: isPrimary ? VIVID_GREEN : "transparent",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isPrimary ? 0.3 : 0,
          shadowRadius: 12,
          elevation: isPrimary ? 8 : 0,
        }}
        disabled={completed}
      >
        {/* Icon */}
        <View
          style={[
            styles.taskIcon,
            {
              backgroundColor: isPrimary
                ? "rgba(255, 255, 255, 0.2)"
                : isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.06)",
            },
          ]}
        >
          {completed ? (
            <Check size={20} color={isPrimary ? "#FFF" : colors.statusPaid} strokeWidth={3} />
          ) : (
            icon
          )}
        </View>

        {/* Content */}
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text
              style={[
                styles.taskTitle,
                { color: isPrimary ? "#FFFFFF" : colors.text },
              ]}
            >
              {title}
            </Text>
            {required && !completed && (
              <View
                style={[
                  styles.requiredBadge,
                  { backgroundColor: isPrimary ? "rgba(255,255,255,0.25)" : colors.systemRed + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.requiredText,
                    { color: isPrimary ? "#FFFFFF" : colors.systemRed },
                  ]}
                >
                  Required
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.taskDescription,
              {
                color: isPrimary ? "rgba(255, 255, 255, 0.8)" : colors.textTertiary,
              },
            ]}
          >
            {description}
          </Text>
        </View>

        {/* Arrow */}
        {!completed && (
          <ChevronRight
            size={20}
            color={isPrimary ? "rgba(255, 255, 255, 0.8)" : colors.textTertiary}
          />
        )}
      </Pressable>
    </Animated.View>
  );
};

export default function ZeroState() {
  const router = useRouter();
  const { colors, isDark, glass } = useTheme();
  const { setupTasks, completeTask, markBlueprintSeen } = useOnboardingStore();
  const { profile } = useProfileStore();

  // Animation values
  const ghostOpacity = useSharedValue(0);
  const cardTranslate = useSharedValue(50);

  useEffect(() => {
    markBlueprintSeen();

    // Animate ghost dashboard fade in
    ghostOpacity.value = withDelay(100, withTiming(0.25, { duration: 800 }));

    // Animate activation card slide up
    cardTranslate.value = withDelay(
      400,
      withSpring(0, { damping: 20, stiffness: 150 })
    );
  }, []);

  const ghostStyle = useAnimatedStyle(() => ({
    opacity: ghostOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslate.value }],
  }));

  const handleTaskPress = (taskId: string) => {
    switch (taskId) {
      case "stripe_connect":
        router.push("/stripe/onboarding");
        break;
      case "upload_logo":
        router.push("/(tabs)/profile");
        break;
      case "test_invoice":
        router.push("/invoice/create");
        break;
      default:
        break;
    }
  };

  const getTaskIcon = (taskId: string, isPrimary: boolean) => {
    const iconColor = isPrimary ? "#FFFFFF" : colors.primary;
    switch (taskId) {
      case "stripe_connect":
        return <CreditCard size={20} color={iconColor} />;
      case "upload_logo":
        return <Image size={20} color={iconColor} />;
      case "test_invoice":
        return <Mic size={20} color={iconColor} />;
      default:
        return <Zap size={20} color={iconColor} />;
    }
  };

  const completedCount = setupTasks.filter((t) => t.completed).length;
  const totalCount = setupTasks.length;

  return (
    <View style={styles.container}>
      {/* ═══════════════════════════════════════════════════════════
          GHOST DASHBOARD - The "Tesla" Effect
          Shows potential, but dimmed/blurred
      ═══════════════════════════════════════════════════════════ */}
      <Animated.View style={[styles.ghostContainer, ghostStyle]}>
        {/* Ghost Scoreboard */}
        <View style={styles.ghostScoreboard}>
          {/* Collected Card - Ghost */}
          <View
            style={[
              styles.ghostCard,
              {
                backgroundColor: isDark ? "#0D2818" : "#E8F5E9",
                borderColor: colors.statusPaid + "20",
              },
            ]}
          >
            <Text style={[styles.ghostLabel, { color: colors.statusPaid }]}>
              COLLECTED THIS MONTH
            </Text>
            <View style={styles.ghostAmountRow}>
              <Text style={[styles.ghostAmount, { color: colors.statusPaid }]}>
                $0
              </Text>
              <Text style={[styles.ghostGoal, { color: colors.statusPaid + "80" }]}>
                {" "}/ $10k Goal
              </Text>
            </View>
          </View>

          {/* Outstanding Card - Ghost */}
          <View
            style={[
              styles.ghostCardSmall,
              {
                backgroundColor: isDark ? "#2D1F0D" : "#FFF3E0",
                borderColor: colors.systemOrange + "20",
              },
            ]}
          >
            <Text style={[styles.ghostLabelSmall, { color: colors.systemOrange }]}>
              OUTSTANDING
            </Text>
            <Text style={[styles.ghostAmountSmall, { color: colors.systemOrange }]}>
              $0
            </Text>
          </View>
        </View>

        {/* Ghost Action Section */}
        <View style={styles.ghostActions}>
          <Text style={[styles.ghostSectionTitle, { color: colors.text }]}>
            Action Required
          </Text>
          <View
            style={[
              styles.ghostActionPlaceholder,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={[styles.ghostDot, { backgroundColor: colors.textTertiary }]} />
            <View style={[styles.ghostLine, { backgroundColor: colors.textTertiary }]} />
          </View>
        </View>
      </Animated.View>

      {/* ═══════════════════════════════════════════════════════════
          ACTIVATION STACK - Setup Tasks
          Floating glass card with onboarding steps
      ═══════════════════════════════════════════════════════════ */}
      <Animated.View style={[styles.activationContainer, cardStyle]}>
        <BlurView
          intensity={isDark ? 40 : 80}
          tint={isDark ? "dark" : "light"}
          style={styles.activationBlur}
        >
          <LinearGradient
            colors={
              isDark
                ? ["rgba(30, 30, 30, 0.9)", "rgba(20, 20, 20, 0.95)"]
                : ["rgba(255, 255, 255, 0.95)", "rgba(250, 250, 250, 0.98)"]
            }
            style={styles.activationGradient}
          >
            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.activationHeader}
            >
              <View style={styles.headerTop}>
                <Sparkles size={24} color={colors.primary} />
                <Text style={[styles.activationTitle, { color: colors.text }]}>
                  Activate Your Business
                </Text>
              </View>
              <Text style={[styles.activationSubtitle, { color: colors.textTertiary }]}>
                Complete setup to unlock your payment engine
              </Text>

              {/* Progress indicator */}
              <View style={styles.progressRow}>
                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${(completedCount / totalCount) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textTertiary }]}>
                  {completedCount}/{totalCount}
                </Text>
              </View>
            </Animated.View>

            {/* Task List */}
            <View style={styles.taskList}>
              {setupTasks.map((task, index) => (
                <SetupTask
                  key={task.id}
                  {...task}
                  icon={getTaskIcon(task.id, index === 0 && !task.completed)}
                  isPrimary={index === 0 && !task.completed}
                  onPress={() => handleTaskPress(task.id)}
                  index={index}
                />
              ))}
            </View>

            {/* Skip option */}
            <Animated.View entering={FadeIn.delay(700)}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // Just dismiss - they can come back
                }}
                style={styles.skipButton}
              >
                <Text style={[styles.skipText, { color: colors.textTertiary }]}>
                  I'll do this later
                </Text>
              </Pressable>
            </Animated.View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Trust indicators */}
      <Animated.View
        entering={FadeIn.delay(800)}
        style={styles.trustIndicators}
      >
        <View style={styles.trustItem}>
          <Shield size={14} color={colors.textTertiary} />
          <Text style={[styles.trustText, { color: colors.textTertiary }]}>
            Bank-level encryption
          </Text>
        </View>
        <View style={[styles.trustDivider, { backgroundColor: colors.textTertiary }]} />
        <View style={styles.trustItem}>
          <Zap size={14} color={colors.textTertiary} />
          <Text style={[styles.trustText, { color: colors.textTertiary }]}>
            Instant payouts
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },

  // Ghost Dashboard
  ghostContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  ghostScoreboard: {
    marginBottom: 24,
  },
  ghostCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
  },
  ghostCardSmall: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  ghostLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  ghostLabelSmall: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  ghostAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  ghostAmount: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  ghostGoal: {
    fontSize: 18,
    fontWeight: "600",
  },
  ghostAmountSmall: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  ghostActions: {
    marginBottom: 24,
  },
  ghostSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  ghostActionPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  ghostDot: {
    width: 40,
    height: 40,
    borderRadius: 10,
    opacity: 0.3,
  },
  ghostLine: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    opacity: 0.2,
  },

  // Activation Stack
  activationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.65,
  },
  activationBlur: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  activationGradient: {
    padding: 24,
    paddingBottom: 40,
  },
  activationHeader: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  activationTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  activationSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Task Cards
  taskList: {
    gap: 10,
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  taskDescription: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Skip
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Trust indicators
  trustIndicators: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 4,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    fontWeight: "500",
  },
  trustDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
});
