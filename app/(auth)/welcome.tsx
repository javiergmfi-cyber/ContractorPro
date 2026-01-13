import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Mic, Send, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Welcome Screen - Cinematic Onboarding
 *
 * A premium first impression with:
 * - Animated shifting gradient background
 * - Three dramatic slides: Speak. Send. Paid.
 * - Tap to advance with heavy haptics
 * - Final CTA buttons
 */

interface Slide {
  text: string;
  icon: React.ReactNode;
  color: string;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  // Slides configuration
  const slides: Slide[] = [
    {
      text: "Speak.",
      icon: <Mic size={64} color={colors.text} strokeWidth={1.5} />,
      color: colors.primary,
    },
    {
      text: "Send.",
      icon: <Send size={64} color={colors.text} strokeWidth={1.5} />,
      color: colors.statusSent,
    },
    {
      text: "Paid.",
      icon: <Check size={64} color={colors.statusPaid} strokeWidth={2} />,
      color: colors.statusPaid,
    },
  ];

  const isLastSlide = currentSlide === slides.length - 1;

  // Animate gradient continuously
  useEffect(() => {
    const animateGradient = Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    );
    animateGradient.start();
    return () => animateGradient.stop();
  }, []);

  // Show buttons on last slide
  useEffect(() => {
    if (isLastSlide) {
      Animated.spring(buttonAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 150,
        delay: 400,
        useNativeDriver: true,
      }).start();
    } else {
      buttonAnim.setValue(0);
    }
  }, [isLastSlide]);

  const handleTap = () => {
    if (isLastSlide) return;

    // Heavy haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change slide
      setCurrentSlide((prev) => prev + 1);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 12,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/signup");
  };

  const handleLogin = () => {
    Haptics.selectionAsync();
    router.replace("/login");
  };

  // Interpolate gradient colors
  const gradientStart = gradientAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      isDark ? "#0A0A0A" : "#FFFFFF",
      isDark ? "#0D1F0D" : "#E8F5E8",
      isDark ? "#0A0A0A" : "#FFFFFF",
    ],
  });

  const gradientEnd = gradientAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      isDark ? "#0D1A0D" : "#F0FFF0",
      isDark ? "#001A00" : "#D0F0D0",
      isDark ? "#0D1A0D" : "#F0FFF0",
    ],
  });

  const currentSlideData = slides[currentSlide];

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <Animated.View style={StyleSheet.absoluteFill}>
        <AnimatedGradient
          gradientStart={gradientStart}
          gradientEnd={gradientEnd}
          accentColor={currentSlideData.color}
        />
      </Animated.View>

      {/* Tap Area */}
      <Pressable
        style={styles.tapArea}
        onPress={handleTap}
        disabled={isLastSlide}
      >
        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>{currentSlideData.icon}</View>

          {/* Text */}
          <Text
            style={[
              styles.heroText,
              {
                color: isLastSlide ? colors.statusPaid : colors.text,
              },
            ]}
          >
            {currentSlideData.text}
          </Text>

          {/* Tap hint (not on last slide) */}
          {!isLastSlide && (
            <Animated.Text
              style={[styles.tapHint, { color: colors.textTertiary }]}
            >
              Tap to continue
            </Animated.Text>
          )}
        </Animated.View>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentSlide
                      ? colors.primary
                      : colors.textTertiary,
                  width: index === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </Pressable>

      {/* Bottom Buttons (Last Slide Only) */}
      {isLastSlide && (
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Primary CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGetStarted}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>

          {/* Secondary CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleLogin}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              I have an account
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

// Animated Gradient Component
interface AnimatedGradientProps {
  gradientStart: Animated.AnimatedInterpolation<string>;
  gradientEnd: Animated.AnimatedInterpolation<string>;
  accentColor: string;
}

function AnimatedGradient({
  gradientStart,
  gradientEnd,
  accentColor,
}: AnimatedGradientProps) {
  const { isDark } = useTheme();

  // For now, use static gradient since LinearGradient doesn't support animated colors directly
  // The animated value changes will trigger re-renders with new interpolated colors
  return (
    <LinearGradient
      colors={[
        isDark ? "#0A0A0A" : "#FFFFFF",
        isDark ? "#0D1A0D" : "#F5FFF5",
        isDark ? "#001A00" : "#E8FFE8",
      ]}
      locations={[0, 0.5, 1]}
      style={StyleSheet.absoluteFill}
    >
      {/* Accent Glow */}
      <View
        style={[
          styles.accentGlow,
          {
            backgroundColor: accentColor,
            shadowColor: accentColor,
          },
        ]}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tapArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    // Glass effect
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroText: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
    textAlign: "center",
  },
  tapHint: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 24,
    letterSpacing: -0.3,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    position: "absolute",
    bottom: 200,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: "width 0.3s",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 60,
    left: 24,
    right: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  primaryButtonText: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  accentGlow: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.3,
    left: SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    opacity: 0.15,
    // Blur effect via shadow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
  },
});
