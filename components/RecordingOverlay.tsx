import { View, Text, Modal, StyleSheet, Animated } from "react-native";
import { Mic } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { useTheme, typography, spacing, radius } from "../lib/theme";

interface RecordingOverlayProps {
  visible: boolean;
  duration: number;
}

export function RecordingOverlay({ visible, duration }: RecordingOverlayProps) {
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.95);
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
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.iconContainer}>
            <Mic size={28} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.duration}>{formatDuration(duration)}</Text>
          <Text style={styles.hint}>Release to finish</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      alignItems: "center",
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#FF3B30",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    duration: {
      fontSize: 48,
      fontWeight: "300",
      color: "#FFFFFF",
      marginBottom: spacing.xs,
      fontVariant: ["tabular-nums"],
    },
    hint: {
      ...typography.footnote,
      color: "rgba(255, 255, 255, 0.6)",
    },
  });
