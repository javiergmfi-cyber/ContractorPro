import { View, Pressable, Animated, StyleSheet } from "react-native";
import { Mic } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRef, useEffect } from "react";
import { useTheme } from "@/lib/theme";

/**
 * Siri Orb - The Intelligence Center
 * Apple Design Award Foundation
 *
 * Idle: Floating translucent 80px circle with breathing animation
 * Active: Morphs to 200px pill with waveform visualization
 */

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
  const { colors, glass } = useTheme();

  // Animation values
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const widthAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Waveform bars animation
  const waveBar1 = useRef(new Animated.Value(0.3)).current;
  const waveBar2 = useRef(new Animated.Value(0.5)).current;
  const waveBar3 = useRef(new Animated.Value(0.7)).current;
  const waveBar4 = useRef(new Animated.Value(0.4)).current;
  const waveBar5 = useRef(new Animated.Value(0.6)).current;

  // Breathing animation (idle state)
  useEffect(() => {
    if (!isRecording) {
      const breathe = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1.0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      breathe.start();
      return () => breathe.stop();
    } else {
      breatheAnim.setValue(1);
    }
  }, [isRecording]);

  // Morph to pill animation (active state)
  useEffect(() => {
    if (isRecording) {
      // Morph to pill
      Animated.parallel([
        Animated.spring(widthAnim, {
          toValue: 200,
          damping: 15,
          stiffness: 200,
          useNativeDriver: false,
        }),
      ]).start();

      // Start waveform animation
      const createWaveAnimation = (anim: Animated.Value, minVal: number, maxVal: number, duration: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: maxVal,
              duration: duration,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: minVal,
              duration: duration,
              useNativeDriver: false,
            }),
          ])
        );
      };

      const wave1 = createWaveAnimation(waveBar1, 0.2, 0.9, 300);
      const wave2 = createWaveAnimation(waveBar2, 0.3, 1.0, 250);
      const wave3 = createWaveAnimation(waveBar3, 0.4, 0.8, 350);
      const wave4 = createWaveAnimation(waveBar4, 0.2, 0.95, 280);
      const wave5 = createWaveAnimation(waveBar5, 0.3, 0.85, 320);

      wave1.start();
      wave2.start();
      wave3.start();
      wave4.start();
      wave5.start();

      return () => {
        wave1.stop();
        wave2.stop();
        wave3.stop();
        wave4.stop();
        wave5.stop();
      };
    } else {
      // Return to orb
      Animated.spring(widthAnim, {
        toValue: 80,
        damping: 15,
        stiffness: 200,
        useNativeDriver: false,
      }).start();

      // Reset waveform
      waveBar1.setValue(0.3);
      waveBar2.setValue(0.5);
      waveBar3.setValue(0.7);
      waveBar4.setValue(0.4);
      waveBar5.setValue(0.6);
    }
  }, [isRecording]);

  const handlePressIn = () => {
    // Rigid haptic for premium feel
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

    Animated.spring(scaleAnim, {
      toValue: 0.95,
      damping: 20,
      stiffness: 300,
      useNativeDriver: true,
    }).start();

    onPressIn();
  };

  const handlePressOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start();

    onPressOut();
  };

  const orbColor = isRecording ? colors.systemRed : colors.primary;
  const waveBarHeight = 32;

  return (
    <View style={styles.container}>
      {/* Ambient glow */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            backgroundColor: orbColor,
            opacity: isRecording ? 0.3 : 0.15,
            transform: [{ scale: breatheAnim }],
          },
        ]}
      />

      {/* Main orb/pill */}
      <Animated.View
        style={[
          {
            transform: [
              { scale: isRecording ? 1 : breatheAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <Animated.View
            style={[
              styles.orb,
              {
                width: widthAnim,
                backgroundColor: glass.background,
                borderColor: glass.border,
                shadowColor: orbColor,
                shadowOpacity: isRecording ? 0.5 : 0.3,
                shadowRadius: isRecording ? 20 : 12,
              },
            ]}
          >
            {/* Glass highlight */}
            <View style={styles.glassHighlight} />

            {/* Content: Mic icon or Waveform */}
            {!isRecording ? (
              <View style={styles.iconContainer}>
                <Mic size={28} color={colors.primary} strokeWidth={2.5} />
              </View>
            ) : (
              <View style={styles.waveformContainer}>
                {/* Mic icon (smaller) */}
                <Mic size={20} color={colors.systemRed} strokeWidth={2.5} style={{ marginRight: 12 }} />

                {/* Waveform bars */}
                <View style={styles.waveform}>
                  <Animated.View
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.systemRed,
                        height: waveBar1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, waveBarHeight],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.systemRed,
                        height: waveBar2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, waveBarHeight],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.systemRed,
                        height: waveBar3.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, waveBarHeight],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.systemRed,
                        height: waveBar4.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, waveBarHeight],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.systemRed,
                        height: waveBar5.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, waveBarHeight],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  ambientGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  orb: {
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    overflow: "hidden",
  },
  glassHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 40,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
});
