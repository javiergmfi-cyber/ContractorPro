import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import type { ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * AnimatedSplash - Apple-Level Launch Experience
 *
 * Design Philosophy:
 * - Restraint: One focal element, no clutter
 * - Purpose: Every animation tells the story
 * - Speed: 2.2 seconds total, feels instant
 * - Transition: Morphs seamlessly into app
 *
 * Sequence:
 * 1. Breathing dot pulses (voice input ready)
 * 2. Dot expands into waveform bars (speaking)
 * 3. Waveform collapses into wordmark (transformation complete)
 * 4. Wordmark glows and fades out (transition to app)
 */

interface AnimatedSplashProps {
  onComplete: () => void;
}

export function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const [phase, setPhase] = useState<"dot" | "wave" | "logo" | "exit">("dot");

  // Core animations
  const dotScale = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const dotGlow = useRef(new Animated.Value(0.3)).current;

  // Waveform bars (5 bars)
  const waveHeights = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const waveOpacity = useRef(new Animated.Value(0)).current;

  // Logo/Wordmark
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;

  // Tagline
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(10)).current;

  // Exit
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    runSplashSequence();
  }, []);

  const runSplashSequence = async () => {
    // ══════════════════════════════════════════════
    // PHASE 1: BREATHING DOT (400ms)
    // A single point of light, like a thought forming
    // ══════════════════════════════════════════════
    setPhase("dot");

    // Dot appears with spring
    Animated.parallel([
      Animated.spring(dotScale, {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse while visible
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotGlow, {
          toValue: 0.8,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotGlow, {
          toValue: 0.3,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    await delay(500);
    pulseAnimation.stop();

    // Haptic: something is happening
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // ══════════════════════════════════════════════
    // PHASE 2: WAVEFORM EXPANSION (600ms)
    // Dot explodes into voice waveform - the core feature
    // ══════════════════════════════════════════════
    setPhase("wave");

    // Dot shrinks as wave expands
    Animated.parallel([
      Animated.timing(dotScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(waveOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered wave animation - each bar rises and falls
    const waveSequence = waveHeights.map((height, index) => {
      const peakHeight = index === 2 ? 1 : index === 1 || index === 3 ? 0.7 : 0.4;
      const staggerDelay = index * 50;

      return Animated.sequence([
        Animated.delay(staggerDelay),
        Animated.timing(height, {
          toValue: peakHeight,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(height, {
          toValue: peakHeight * 0.6,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(height, {
          toValue: peakHeight * 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(waveSequence).start();

    await delay(600);

    // Haptic: transformation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // ══════════════════════════════════════════════
    // PHASE 3: LOGO REVEAL (600ms)
    // Waveform collapses into wordmark - voice becomes invoice
    // ══════════════════════════════════════════════
    setPhase("logo");

    // Wave collapses
    Animated.parallel([
      Animated.timing(waveOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      ...waveHeights.map((height) =>
        Animated.timing(height, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Logo appears with subtle spring
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Glow builds
      Animated.timing(logoGlow, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    await delay(200);

    // Tagline fades in below
    Animated.parallel([
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(taglineTranslate, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    await delay(500);

    // ══════════════════════════════════════════════
    // PHASE 4: EXIT (300ms)
    // Fade and scale out, revealing the app beneath
    // ══════════════════════════════════════════════
    setPhase("exit");

    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(exitScale, {
        toValue: 1.1,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  // Waveform bar scale interpolation (using scaleY for native driver support)
  const getBarStyle = (index: number) => {
    return {
      transform: [
        {
          scaleY: waveHeights[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 1],
          }),
        },
      ],
      opacity: waveOpacity,
    };
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exitOpacity,
          transform: [{ scale: exitScale }],
        },
      ]}
      pointerEvents="none"
    >
      {/* Deep black gradient background */}
      <LinearGradient
        colors={["#000000", "#0A0A0A", "#050505"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow behind content */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            opacity: logoGlow.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.15],
            }),
          },
        ]}
      />

      {/* Content container */}
      <View style={styles.content}>
        {/* Phase 1: Breathing Dot */}
        <Animated.View
          style={[
            styles.dot,
            {
              opacity: dotOpacity,
              transform: [{ scale: dotScale }],
              shadowOpacity: dotGlow,
            },
          ]}
        />

        {/* Phase 2: Waveform */}
        <Animated.View style={[styles.waveContainer, { opacity: waveOpacity }]}>
          {[0, 1, 2, 3, 4].map((index) => (
            <View key={index} style={styles.waveBar}>
              <Animated.View
                style={[
                  styles.waveBarInner,
                  getBarStyle(index),
                ]}
              />
            </View>
          ))}
        </Animated.View>

        {/* Phase 3: Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Glow behind text */}
          <Animated.View
            style={[
              styles.logoGlow,
              {
                opacity: logoGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6],
                }),
              },
            ]}
          />

          {/* Wordmark */}
          <Text style={styles.logoText}>
            <Text style={styles.logoTextBold}>Contractor</Text>
            <Text style={styles.logoTextLight}>Pro</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslate }],
            },
          ]}
        >
          <Text style={styles.tagline}>Speak. Send. Paid.</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// Utility
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  ambientGlow: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    backgroundColor: "#00D632",
    top: SCREEN_HEIGHT * 0.3,
    alignSelf: "center",
    // Blur effect via shadow
    shadowColor: "#00D632",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 150,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },

  // Breathing Dot
  dot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00D632",
    // Glow
    shadowColor: "#00D632",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },

  // Waveform
  waveContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 60,
  },
  waveBar: {
    width: 4,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  waveBarInner: {
    width: 4,
    height: 60,
    borderRadius: 2,
    backgroundColor: "#00D632",
    // Glow
    shadowColor: "#00D632",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },

  // Logo
  logoContainer: {
    alignItems: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 200,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#00D632",
    // Blur
    shadowColor: "#00D632",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  logoText: {
    fontSize: 32,
    letterSpacing: -1,
  },
  logoTextBold: {
    fontWeight: "800",
    color: "#FFFFFF",
  },
  logoTextLight: {
    fontWeight: "400",
    color: "#00D632",
  },

  // Tagline
  taglineContainer: {
    position: "absolute",
    top: 50,
  },
  tagline: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.5)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
