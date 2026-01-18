/**
 * StepReady - Screen 4
 * Final CTA: Create first invoice or send to self
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface StepReadyProps {
  onCreateInvoice: () => void;
  onSendToSelf: () => void;
  onSkip: () => void;
  reduceMotion: boolean;
}

export function StepReady({
  onCreateInvoice,
  onSendToSelf,
  onSkip,
  reduceMotion,
}: StepReadyProps) {
  // Animation values
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const burstOpacity = useSharedValue(0);
  const burstScale = useSharedValue(0.5);

  useEffect(() => {
    // Celebration animation on mount
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (reduceMotion) {
      checkScale.value = 1;
      checkOpacity.value = 1;
      return;
    }

    // Checkmark animation
    checkOpacity.value = withTiming(1, { duration: 200 });
    checkScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );

    // Burst animation
    burstOpacity.value = withDelay(
      100,
      withSequence(
        withTiming(0.6, { duration: 200 }),
        withDelay(300, withTiming(0, { duration: 400 }))
      )
    );
    burstScale.value = withDelay(
      100,
      withTiming(2, { duration: 600 })
    );
  }, [reduceMotion]);

  const handleCreateInvoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCreateInvoice();
  };

  const handleSendToSelf = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSendToSelf();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkip();
  };

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const burstAnimatedStyle = useAnimatedStyle(() => ({
    opacity: burstOpacity.value,
    transform: [{ scale: burstScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Celebration Checkmark */}
      <View style={styles.checkContainer}>
        {/* Burst effect */}
        <Animated.View style={[styles.burst, burstAnimatedStyle]} />

        {/* Checkmark */}
        <Animated.View style={[styles.checkCircle, checkAnimatedStyle]}>
          <Check size={40} color="#000" strokeWidth={3} />
        </Animated.View>
      </View>

      {/* Primary CTA */}
      <Pressable onPress={handleCreateInvoice} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Create My First Invoice</Text>
      </Pressable>

      {/* Secondary CTA */}
      <View style={styles.secondaryContainer}>
        <Text style={styles.secondaryHint}>Want to test it first?</Text>
        <Pressable onPress={handleSendToSelf} hitSlop={16}>
          <Text style={styles.secondaryLink}>Send a test invoice to yourself.</Text>
        </Pressable>
      </View>

      {/* Skip */}
      <Pressable onPress={handleSkip} style={styles.skipButton} hitSlop={16}>
        <Text style={styles.skipText}>Skip for now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  checkContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  burst: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00D632',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00D632',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D632',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#00D632',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  secondaryContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  secondaryHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  secondaryLink: {
    fontSize: 14,
    color: '#00D632',
    textDecorationLine: 'underline',
  },
  skipButton: {
    marginTop: 32,
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
