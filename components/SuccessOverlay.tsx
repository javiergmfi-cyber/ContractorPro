import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * SuccessOverlay Component
 *
 * A cinematic full-screen success confirmation with:
 * - Frosted glass blur background
 * - Animated checkmark with spring overshoot
 * - Expanding ripple shockwave
 * - Auto-dismiss after 1.5s
 */

interface SuccessOverlayProps {
  type: "sent" | "paid";
  visible: boolean;
  onDismiss: () => void;
}

export function SuccessOverlay({ type, visible, onDismiss }: SuccessOverlayProps) {
  const { colors, isDark } = useTheme();

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      overlayOpacity.setValue(0);
      checkmarkScale.setValue(0);
      textOpacity.setValue(0);
      rippleScale.setValue(0);
      rippleOpacity.setValue(1);

      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in sequence
      Animated.sequence([
        // 1. Fade in overlay
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),

        // 2. Checkmark springs in with overshoot
        Animated.parallel([
          Animated.spring(checkmarkScale, {
            toValue: 1,
            damping: 8,
            stiffness: 180,
            mass: 0.8,
            useNativeDriver: true,
          }),
          // Ripple expands
          Animated.timing(rippleScale, {
            toValue: 3,
            duration: 600,
            useNativeDriver: true,
          }),
          // Ripple fades
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          // Text fades in
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 300,
            delay: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Auto-dismiss after 1.5s
      const dismissTimer = setTimeout(() => {
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onDismiss();
        });
      }, 1500);

      return () => clearTimeout(dismissTimer);
    }
  }, [visible]);

  if (!visible) return null;

  const displayText = type === "sent" ? "Sent" : "Paid";
  const accentColor = type === "sent" ? colors.statusSent : colors.statusPaid;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: overlayOpacity },
      ]}
      pointerEvents="auto"
    >
      {/* Blur Background */}
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={100}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(0, 0, 0, 0.9)"
                : "rgba(255, 255, 255, 0.95)",
            },
          ]}
        />
      )}

      {/* Content Container */}
      <View style={styles.content}>
        {/* Ripple Effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              borderColor: accentColor,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
            },
          ]}
        />

        {/* Checkmark Circle */}
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              backgroundColor: accentColor,
              transform: [{ scale: checkmarkScale }],
              shadowColor: accentColor,
            },
          ]}
        >
          <Check size={64} color="#FFFFFF" strokeWidth={3} />
        </Animated.View>

        {/* Success Text */}
        <Animated.Text
          style={[
            styles.successText,
            {
              color: colors.text,
              opacity: textOpacity,
            },
          ]}
        >
          {displayText}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  checkmarkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    // Glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  successText: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.7,
    marginTop: 24,
  },
});
