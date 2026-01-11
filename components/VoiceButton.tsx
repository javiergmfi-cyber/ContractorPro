import { Pressable, Animated } from "react-native";
import { Mic } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRef } from "react";
import { COLORS } from "../lib/constants";

interface VoiceButtonProps {
  onPressIn: () => void;
  onPressOut: () => void;
  isRecording: boolean;
}

export function VoiceButton({
  onPressIn,
  onPressOut,
  isRecording,
}: VoiceButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
    onPressIn();
  };

  const handlePressOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onPressOut();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`w-20 h-20 rounded-full items-center justify-center shadow-lg ${
          isRecording ? "bg-red-500" : "bg-primary"
        }`}
        style={{
          shadowColor: isRecording ? "#FF0000" : COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Mic size={32} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>
    </Animated.View>
  );
}
