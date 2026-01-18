import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Mic, Send, Check, DollarSign, Zap } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Welcome Screen - Cinematic Onboarding (Enhanced)
 *
 * A premium first impression with:
 * - Particle system background
 * - Letter-by-letter text reveal
 * - Morphing icon transitions
 * - Pulsing glow effects
 * - Staggered button animations
 * - Haptic choreography
 */

interface Slide {
  text: string;
  subtext: string;
  icon: React.ComponentType<any>;
  color: string;
}

// Floating particle component
function FloatingParticle({
  delay,
  startX,
  startY,
  colors,
}: {
  delay: number;
  startX: number;
  startY: number;
  colors: any;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      // Reset
      translateY.setValue(0);
      translateX.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.5);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Float up
          Animated.timing(translateY, {
            toValue: -SCREEN_HEIGHT * 0.4,
            duration: 4000 + Math.random() * 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          // Drift sideways
          Animated.timing(translateX, {
            toValue: (Math.random() - 0.5) * 100,
            duration: 4000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          // Fade in then out
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          // Scale up slightly
          Animated.timing(scale, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          top: startY,
          backgroundColor: colors.primary,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
    />
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const subtextOpacity = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  // Letter animations for text reveal
  const letterAnimations = useRef<Animated.Value[]>([]).current;

  // Slides configuration
  const slides: Slide[] = [
    {
      text: "Speak.",
      subtext: "Just say what you did",
      icon: Mic,
      color: colors.primary,
    },
    {
      text: "Send.",
      subtext: "Professional invoice, instantly",
      icon: Send,
      color: colors.statusSent,
    },
    {
      text: "Paid.",
      subtext: "Get paid faster than ever",
      icon: DollarSign,
      color: colors.statusPaid,
    },
  ];

  const isLastSlide = currentSlide === slides.length - 1;
  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  // Initialize letter animations for current text
  useEffect(() => {
    const text = currentSlideData.text;
    letterAnimations.length = 0;
    for (let i = 0; i < text.length; i++) {
      letterAnimations.push(new Animated.Value(0));
    }
  }, [currentSlide]);

  // Animate text letter by letter
  const animateTextReveal = useCallback(() => {
    const text = currentSlideData.text;
    setDisplayedText("");

    // Reset letter animations
    letterAnimations.forEach((anim) => anim.setValue(0));

    // Stagger letter reveals
    const letterDelay = 80;
    text.split("").forEach((letter, index) => {
      setTimeout(() => {
        setDisplayedText((prev) => prev + letter);
        if (letterAnimations[index]) {
          Animated.spring(letterAnimations[index], {
            toValue: 1,
            damping: 12,
            stiffness: 200,
            useNativeDriver: true,
          }).start();
        }
        // Haptic on each letter
        if (index < text.length - 1) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          // Heavy haptic on last letter (the period)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      }, index * letterDelay);
    });

    // Show subtext after text is revealed
    setTimeout(() => {
      Animated.spring(subtextOpacity, {
        toValue: 1,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }).start();
    }, text.length * letterDelay + 200);
  }, [currentSlide, currentSlideData.text]);

  // Animate icon entrance
  const animateIconEntrance = useCallback(() => {
    iconScale.setValue(0);
    iconRotate.setValue(0);

    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        damping: 10,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pulsing glow effect
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 0.6,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  // Floating logo animation
  useEffect(() => {
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();
    return () => floatAnimation.stop();
  }, []);

  // Initial animation on mount
  useEffect(() => {
    animateIconEntrance();
    animateTextReveal();
  }, []);

  // Show buttons on last slide
  useEffect(() => {
    if (isLastSlide) {
      Animated.spring(buttonAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 120,
        delay: 600,
        useNativeDriver: true,
      }).start();
    } else {
      buttonAnim.setValue(0);
    }
  }, [isLastSlide]);

  const handleTap = () => {
    if (isLastSlide) return;

    // Heavy haptic for transition
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Reset subtext
    subtextOpacity.setValue(0);

    // Animate out with morph effect
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change slide
      setCurrentSlide((prev) => prev + 1);
      setDisplayedText("");

      // Reset animations
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);

      // Animate new content in
      animateIconEntrance();
      animateTextReveal();
    });
  };

  const handleGetStarted = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/signup");
  };

  const handleLogin = () => {
    Haptics.selectionAsync();
    router.replace("/login");
  };

  // Generate particles
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      startX: Math.random() * SCREEN_WIDTH,
      startY: SCREEN_HEIGHT * 0.6 + Math.random() * SCREEN_HEIGHT * 0.3,
      delay: i * 400,
    }))
  ).current;

  const iconRotation = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-15deg", "0deg"],
  });

  const floatTranslate = logoFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={
          isDark
            ? ["#0A0A0A", "#0D1A0D", "#001A00"]
            : ["#FFFFFF", "#F5FFF5", "#E8FFE8"]
        }
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Particle System */}
      {particles.map((particle) => (
        <FloatingParticle
          key={particle.id}
          delay={particle.delay}
          startX={particle.startX}
          startY={particle.startY}
          colors={colors}
        />
      ))}

      {/* Accent Glow */}
      <Animated.View
        style={[
          styles.accentGlow,
          {
            backgroundColor: currentSlideData.color,
            shadowColor: currentSlideData.color,
            opacity: glowPulse,
          },
        ]}
      />

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
          {/* Animated Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                backgroundColor: currentSlideData.color + "15",
                borderColor: currentSlideData.color + "30",
                transform: [
                  { scale: iconScale },
                  { rotate: iconRotation },
                  { translateY: floatTranslate },
                ],
              },
            ]}
          >
            {/* Icon Glow Ring */}
            <Animated.View
              style={[
                styles.iconGlowRing,
                {
                  borderColor: currentSlideData.color,
                  opacity: glowPulse,
                  transform: [{ scale: glowPulse.interpolate({
                    inputRange: [0.3, 0.6],
                    outputRange: [1, 1.2],
                  }) }],
                },
              ]}
            />
            <IconComponent
              size={64}
              color={isLastSlide ? colors.statusPaid : colors.text}
              strokeWidth={1.5}
            />
          </Animated.View>

          {/* Letter-by-letter Text */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.heroText,
                { color: isLastSlide ? colors.statusPaid : colors.text },
              ]}
            >
              {displayedText.split("").map((letter, index) => (
                <Animated.Text
                  key={index}
                  style={{
                    opacity: letterAnimations[index] || 1,
                    transform: [
                      {
                        translateY: letterAnimations[index]
                          ? letterAnimations[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0],
                            })
                          : 0,
                      },
                    ],
                  }}
                >
                  {letter}
                </Animated.Text>
              ))}
            </Text>
          </View>

          {/* Subtext */}
          <Animated.Text
            style={[
              styles.subtext,
              {
                color: colors.textSecondary,
                opacity: subtextOpacity,
                transform: [
                  {
                    translateY: subtextOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {currentSlideData.subtext}
          </Animated.Text>

          {/* Tap hint (not on last slide) */}
          {!isLastSlide && (
            <Animated.View style={styles.tapHintContainer}>
              <View style={[styles.tapHintPill, { backgroundColor: colors.backgroundSecondary }]}>
                <Zap size={14} color={colors.primary} />
                <Text style={[styles.tapHint, { color: colors.textTertiary }]}>
                  Tap to continue
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((slide, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentSlide ? slide.color : colors.textTertiary + "40",
                  width: index === currentSlide ? 28 : 8,
                  shadowColor: index === currentSlide ? slide.color : "transparent",
                  shadowOpacity: index === currentSlide ? 0.5 : 0,
                  shadowRadius: 8,
                  elevation: index === currentSlide ? 5 : 0,
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
                    outputRange: [60, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Primary CTA with gradient */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGetStarted}
          >
            <LinearGradient
              colors={["#00D632", "#00B82B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Get Started Free</Text>
            </LinearGradient>
          </Pressable>

          {/* Secondary CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.border },
              pressed && styles.buttonPressed,
            ]}
            onPress={handleLogin}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              I have an account
            </Text>
          </Pressable>

          {/* Trust badges */}
          <View style={styles.trustBadges}>
            <Text style={[styles.trustText, { color: colors.textTertiary }]}>
              Free to start • No credit card required
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
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
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    borderWidth: 2,
  },
  iconGlowRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  heroText: {
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: -2,
    textAlign: "center",
  },
  subtext: {
    fontSize: 17,
    fontWeight: "500",
    marginTop: 12,
    letterSpacing: -0.3,
  },
  tapHintContainer: {
    marginTop: 48,
  },
  tapHintPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    gap: 8,
  },
  tapHint: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    position: "absolute",
    bottom: 220,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    left: 24,
    right: 24,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#00D632",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
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
    borderWidth: 1,
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
  trustBadges: {
    alignItems: "center",
    marginTop: 8,
  },
  trustText: {
    fontSize: 13,
    fontWeight: "500",
  },
  accentGlow: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.25,
    left: SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 120,
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
