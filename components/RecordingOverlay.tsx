import { View, Text, Modal, StyleSheet, Animated, Pressable } from "react-native";
import { Mic } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTheme, typography, spacing, radius } from "../lib/theme";

interface RecordingOverlayProps {
  visible: boolean;
  duration: number;
  onStop?: () => void;
}

export function RecordingOverlay({ visible, duration, onStop }: RecordingOverlayProps) {
  const { colors, isDark } = useTheme();
  const [dots, setDots] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      // Dots animation
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 500);

      return () => {
        pulse.stop();
        clearInterval(interval);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.9);
        pulseAnim.setValue(1);
      };
    }
  }, [visible]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const styles = createStyles(colors, isDark);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable onPress={onStop}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.iconInner}>
                <Mic size={36} color="#FFFFFF" strokeWidth={2} />
              </View>
            </Animated.View>
          </Pressable>

          <Text style={styles.duration}>{formatDuration(duration)}</Text>
          <Text style={styles.status}>Recording{dots}</Text>

          <View style={styles.waveContainer}>
            {[...Array(5)].map((_, i) => (
              <WaveBar key={i} delay={i * 100} colors={colors} />
            ))}
          </View>

          <Text style={styles.hint}>Tap mic to finish</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function WaveBar({ delay, colors }: { delay: number; colors: any }) {
  const heightAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(heightAnim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(heightAnim, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{
        width: 4,
        height: 24,
        backgroundColor: colors.primary,
        borderRadius: 2,
        marginHorizontal: 3,
        transform: [{ scaleY: heightAnim }],
      }}
    />
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.8)",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      backgroundColor: colors.card,
      borderRadius: radius.xxl,
      padding: spacing.xl,
      alignItems: "center",
      marginHorizontal: spacing.xl,
      minWidth: 280,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.3,
      shadowRadius: 30,
      elevation: 20,
    },
    iconContainer: {
      marginBottom: spacing.lg,
    },
    iconInner: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#FF3B30",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#FF3B30",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    duration: {
      ...typography.amount,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    status: {
      ...typography.headline,
      color: colors.textTertiary,
      marginBottom: spacing.lg,
    },
    waveContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: 32,
      marginBottom: spacing.lg,
    },
    hint: {
      ...typography.footnote,
      color: colors.textTertiary,
    },
  });
