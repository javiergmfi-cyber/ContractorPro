/**
 * StepAhaVoice - Screen 1
 * The AHA moment: Tap mic → Invoice appears
 * No mic permission requested (simulated experience)
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Mic } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface StepAhaVoiceProps {
  onContinue: () => void;
  reduceMotion: boolean;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function StepAhaVoice({ onContinue, reduceMotion }: StepAhaVoiceProps) {
  const [isListening, setIsListening] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showContinuingText, setShowContinuingText] = useState(false);
  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const micScale = useSharedValue(1);
  const micGlow = useSharedValue(0.3);
  const invoiceOpacity = useSharedValue(0);
  const invoiceScale = useSharedValue(0.8);

  // Pulsing mic animation
  useEffect(() => {
    if (!reduceMotion && !isListening && !showInvoice) {
      micGlow.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [reduceMotion, isListening, showInvoice]);

  // Clear auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, []);

  const cancelAutoAdvance = () => {
    setUserInteracted(true);
    setShowContinuingText(false);
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  };

  const handleMicPress = async () => {
    if (isListening || showInvoice) return;

    // DO NOT request mic permission here!
    // Just simulate the experience
    setIsListening(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate mic
    micScale.value = withSpring(1.2, { damping: 10, stiffness: 200 });
    micGlow.value = withTiming(1, { duration: 200 });

    // Simulate "listening" feeling
    await delay(1500);

    setIsListening(false);
    setShowInvoice(true);

    // Animate invoice appearing
    invoiceOpacity.value = withTiming(1, { duration: 300 });
    invoiceScale.value = withSpring(1, { damping: 15, stiffness: 150 });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Reset mic
    micScale.value = withSpring(0.8, { damping: 15, stiffness: 150 });
    micGlow.value = withTiming(0.3, { duration: 300 });

    // Start auto-advance countdown (only if conditions met)
    if (!reduceMotion && !userInteracted) {
      setShowContinuingText(true);
      autoAdvanceTimer.current = setTimeout(() => {
        if (!userInteracted) {
          onContinue();
        }
      }, 1200);
    }
  };

  const handleContinue = () => {
    cancelAutoAdvance();
    onContinue();
  };

  const handleFallback = async () => {
    cancelAutoAdvance();
    // Show demo invoice without mic interaction
    setShowInvoice(true);
    invoiceOpacity.value = withTiming(1, { duration: 300 });
    invoiceScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
    shadowOpacity: micGlow.value,
  }));

  const invoiceAnimatedStyle = useAnimatedStyle(() => ({
    opacity: invoiceOpacity.value,
    transform: [{ scale: invoiceScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Mic Button */}
      {!showInvoice && (
        <Pressable onPress={handleMicPress} disabled={isListening}>
          <Animated.View style={[styles.micButton, micAnimatedStyle]}>
            <Mic size={32} color="#fff" />
          </Animated.View>
        </Pressable>
      )}

      {/* Placeholder hint */}
      {!showInvoice && !isListening && (
        <Text style={styles.hint}>
          "Painted living room{'\n'}for John, $500"
        </Text>
      )}

      {/* Listening indicator */}
      {isListening && (
        <View style={styles.listeningContainer}>
          <View style={styles.waveform}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  { height: 20 + Math.random() * 20 },
                ]}
              />
            ))}
          </View>
          <Text style={styles.listeningText}>Listening...</Text>
        </View>
      )}

      {/* Invoice Preview */}
      {showInvoice && (
        <Animated.View style={[styles.invoiceCard, invoiceAnimatedStyle]}>
          <Text style={styles.invoiceHeader}>INVOICE #0001</Text>
          <View style={styles.invoiceDivider} />
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Customer</Text>
            <Text style={styles.invoiceValue}>John</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Description</Text>
            <Text style={styles.invoiceValue}>Painted living room</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Total</Text>
            <Text style={styles.invoiceTotal}>$500</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Due</Text>
            <Text style={styles.invoiceValue}>On receipt</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Notes</Text>
            <Text style={styles.invoiceValue}>Thanks John!</Text>
          </View>
          <View style={styles.payButton}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </View>
        </Animated.View>
      )}

      {/* Fallback option */}
      {!showInvoice && !isListening && (
        <Pressable onPress={handleFallback} hitSlop={16}>
          <Text style={styles.fallbackText}>
            Tap to use a demo example instead
          </Text>
        </Pressable>
      )}

      {/* Continue Button */}
      {showInvoice && (
        <View style={styles.continueContainer}>
          <Pressable onPress={handleContinue} style={styles.continueButton}>
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>
          {showContinuingText && (
            <Text style={styles.continuingText}>Continuing...</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00D632',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D632',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8,
  },
  hint: {
    marginTop: 24,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  listeningContainer: {
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 60,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#00D632',
    borderRadius: 2,
  },
  listeningText: {
    marginTop: 16,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  invoiceCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  invoiceHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  invoiceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  invoiceValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  invoiceTotal: {
    fontSize: 18,
    color: '#00D632',
    fontWeight: '700',
  },
  payButton: {
    marginTop: 8,
    backgroundColor: '#00D632',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  fallbackText: {
    marginTop: 32,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textDecorationLine: 'underline',
  },
  continueContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  continuingText: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
