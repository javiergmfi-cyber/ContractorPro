import { View, Pressable, Animated, StyleSheet } from "react-native";
import { Mic } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRef, useEffect } from "react";
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
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseOpacity1 = useRef(new Animated.Value(0.6)).current;
  const pulseOpacity2 = useRef(new Animated.Value(0.4)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      // Start pulse animations
      const pulse1 = Animated.loop(
        Animated.parallel([
          Animated.timing(pulseAnim1, {
            toValue: 1.8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity1, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      const pulse2 = Animated.loop(
        Animated.sequence([
          Animated.delay(500),
          Animated.parallel([
            Animated.timing(pulseAnim2, {
              toValue: 1.6,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity2, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      );

      pulse1.start();
      pulse2.start();
      glow.start();

      return () => {
        pulse1.stop();
        pulse2.stop();
        glow.stop();
        pulseAnim1.setValue(1);
        pulseAnim2.setValue(1);
        pulseOpacity1.setValue(0.6);
        pulseOpacity2.setValue(0.4);
        glowAnim.setValue(0);
      };
    }
  }, [isRecording]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
    onPressIn();
  };

  const handlePressOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
    onPressOut();
  };

  const buttonColor = isRecording ? "#FF3B30" : COLORS.primary;

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 25],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Pulse rings when recording */}
      {isRecording && (
        <>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: "#FF3B30",
                transform: [{ scale: pulseAnim1 }],
                opacity: pulseOpacity1,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: "#FF3B30",
                transform: [{ scale: pulseAnim2 }],
                opacity: pulseOpacity2,
              },
            ]}
          />
        </>
      )}

      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Glow layer */}
        <Animated.View
          style={[
            styles.glowLayer,
            {
              backgroundColor: buttonColor,
              shadowColor: buttonColor,
              shadowRadius: isRecording ? shadowRadius : 12,
              shadowOpacity: isRecording ? shadowOpacity : 0.4,
            },
          ]}
        />

        {/* Main button */}
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.button,
            {
              backgroundColor: buttonColor,
            },
          ]}
        >
          {/* Inner gradient overlay */}
          <View style={styles.innerHighlight} />
          <Mic size={32} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  glowLayer: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    shadowOffset: { width: 0, height: 4 },
    elevation: 15,
  },
  button: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  innerHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
  },
});
