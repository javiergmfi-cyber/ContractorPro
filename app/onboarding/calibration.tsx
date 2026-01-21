import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useOnboardingStore } from "@/store/useOnboardingStore";

const { width, height } = Dimensions.get("window");

/**
 * Calibration Screen - Endel-Style Value Anchoring
 *
 * A cinematic system calibration sequence that anchors
 * the app's value proposition before dropping users
 * into the dashboard.
 *
 * Visual: Deep blue/black premium financial feel
 * Behavior: Auto-advance every 2.5s, ~10s total
 */

interface CalibrationPhase {
  headline: string;
  subtext: string;
}

const PHASES: CalibrationPhase[] = [
  {
    headline: "Building your payment engine…",
    subtext: "Private. Protected. Encrypted.",
  },
  {
    headline: "Calibrating instant invoices…",
    subtext: "Quote → invoice → paid.",
  },
  {
    headline: "Activating auto-chase…",
    subtext: "We chase late payments. You don't.",
  },
  {
    headline: "Engine online.",
    subtext: "You're ready to get paid.",
  },
];

const PHASE_DURATION = 3750; // 3.75 seconds per phase (15s total)

export default function CalibrationScreen() {
  const router = useRouter();
  const { completeCalibration } = useOnboardingStore();
  const [currentPhase, setCurrentPhase] = useState(0);

  // Pulsing circle animation
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.3);

  // Text animations
  const headlineOpacity = useSharedValue(0);
  const headlineTranslateY = useSharedValue(20);
  const subtextOpacity = useSharedValue(0);
  const subtextTranslateY = useSharedValue(15);

  // Progress bar
  const progressWidth = useSharedValue(0);

  // Start breathing animation for the orb
  useEffect(() => {
    // Main pulse - breathing effect
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Outer ring - slower, larger pulse
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Animate text when phase changes
  useEffect(() => {
    // Reset animations
    headlineOpacity.value = 0;
    headlineTranslateY.value = 20;
    subtextOpacity.value = 0;
    subtextTranslateY.value = 15;

    // Add extra delay before final phase to create "processing" effect
    const isFinalPhase = currentPhase === PHASES.length - 1;
    const textDelay = isFinalPhase ? 1200 : 0; // 1.2s pause before "Engine online"

    // Fade in headline
    headlineOpacity.value = withDelay(textDelay, withTiming(1, { duration: 400 }));
    headlineTranslateY.value = withDelay(
      textDelay,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    // Fade in subtext with delay
    subtextOpacity.value = withDelay(textDelay + 200, withTiming(1, { duration: 400 }));
    subtextTranslateY.value = withDelay(
      textDelay + 200,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    // Trigger haptic on phase change
    if (currentPhase > 0 && !isFinalPhase) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Special haptic for final phase - delayed to match text
    if (isFinalPhase) {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, textDelay);
    }
  }, [currentPhase]);

  // Progress bar animation
  useEffect(() => {
    const targetProgress = ((currentPhase + 1) / PHASES.length) * 100;
    progressWidth.value = withTiming(targetProgress, {
      duration: PHASE_DURATION,
      easing: Easing.linear,
    });
  }, [currentPhase]);

  // Auto-advance phases
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhase((prev) => {
        if (prev < PHASES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, PHASE_DURATION);

    return () => clearInterval(timer);
  }, []);

  // Navigate after final phase
  useEffect(() => {
    if (currentPhase === PHASES.length - 1) {
      const navigationTimer = setTimeout(() => {
        completeCalibration();
        router.replace("/(tabs)");
      }, PHASE_DURATION);

      return () => clearTimeout(navigationTimer);
    }
  }, [currentPhase]);

  // Animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: headlineTranslateY.value }],
  }));

  const subtextStyle = useAnimatedStyle(() => ({
    opacity: subtextOpacity.value,
    transform: [{ translateY: subtextTranslateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const phase = PHASES[currentPhase];

  return (
    <View style={styles.container}>
      {/* Deep gradient background */}
      <LinearGradient
        colors={["#000000", "#0A1628", "#0D2137", "#0A1628", "#000000"]}
        locations={[0, 0.3, 0.5, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle radial glow behind orb */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={["rgba(0, 122, 255, 0.15)", "transparent"]}
          style={styles.radialGlow}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* Pulsing Orb */}
      <View style={styles.orbContainer}>
        {/* Outer ring */}
        <Animated.View style={[styles.outerRing, ringStyle]} />

        {/* Main orb */}
        <Animated.View style={[styles.orb, pulseStyle]}>
          <LinearGradient
            colors={["#0A84FF", "#007AFF", "#0066CC"]}
            style={styles.orbGradient}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
          />
          {/* Inner glow */}
          <View style={styles.orbInnerGlow} />
        </Animated.View>
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.headline, headlineStyle]}>
          {phase.headline}
        </Animated.Text>
        <Animated.Text style={[styles.subtext, subtextStyle]}>
          {phase.subtext}
        </Animated.Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>

      {/* Phase indicators */}
      <View style={styles.phaseIndicators}>
        {PHASES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.phaseIndicator,
              index === currentPhase && styles.phaseIndicatorActive,
              index < currentPhase && styles.phaseIndicatorComplete,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  // Glow effect
  glowContainer: {
    position: "absolute",
    top: height * 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  radialGlow: {
    width: 400,
    height: 400,
    borderRadius: 200,
  },

  // Orb
  orbContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 60,
  },
  outerRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(10, 132, 255, 0.3)",
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    shadowColor: "#0A84FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  orbGradient: {
    width: "100%",
    height: "100%",
  },
  orbInnerGlow: {
    position: "absolute",
    top: 15,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  // Text
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
    minHeight: 100,
  },
  headline: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtext: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    letterSpacing: -0.2,
  },

  // Progress
  progressContainer: {
    position: "absolute",
    bottom: 120,
    left: 40,
    right: 40,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0A84FF",
    borderRadius: 1.5,
  },

  // Phase indicators
  phaseIndicators: {
    position: "absolute",
    bottom: 80,
    flexDirection: "row",
    gap: 8,
  },
  phaseIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  phaseIndicatorActive: {
    backgroundColor: "#0A84FF",
    transform: [{ scale: 1.2 }],
  },
  phaseIndicatorComplete: {
    backgroundColor: "rgba(10, 132, 255, 0.5)",
  },
});
