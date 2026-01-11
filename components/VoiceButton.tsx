import { Pressable, StyleSheet, Animated } from "react-native";
import { Mic } from "lucide-react-native";
import { useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { useTheme } from "../lib/theme";

interface VoiceButtonProps {
  onPressIn: () => void;
  onPressOut: () => void;
  isRecording: boolean;
}

export function VoiceButton({ onPressIn, onPressOut, isRecording }: VoiceButtonProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isRecording ? 0.9 : 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isRecording]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPressIn();
  };

  const handlePressOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressOut();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          { backgroundColor: isRecording ? "#FF3B30" : colors.primary },
        ]}
      >
        <Mic size={28} color="#FFFFFF" strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
