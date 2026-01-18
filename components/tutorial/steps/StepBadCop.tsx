/**
 * StepBadCop - Screen 3
 * Auto-Chase timeline + toggle
 * BIG selling point: "Never chase payments again"
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Bot, DollarSign } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface StepBadCopProps {
  onContinue: () => void;
  reduceMotion: boolean;
}

const TIMELINE_ITEMS = [
  { day: 'Day 1', label: 'Sent', delay: 0 },
  { day: 'Day 3', label: 'Reminder', delay: 400 },
  { day: 'Day 7', label: 'Final', delay: 800 },
];

export function StepBadCop({ onContinue, reduceMotion }: StepBadCopProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  // Animation values
  const timelineOpacities = TIMELINE_ITEMS.map(() => useSharedValue(0));
  const paymentOpacity = useSharedValue(0);
  const paymentScale = useSharedValue(0.8);
  const toggleGlow = useSharedValue(0);

  // Animate timeline on mount
  useEffect(() => {
    if (reduceMotion) {
      timelineOpacities.forEach((opacity) => {
        opacity.value = 1;
      });
      setShowPayment(true);
      paymentOpacity.value = 1;
      paymentScale.value = 1;
      return;
    }

    TIMELINE_ITEMS.forEach((item, index) => {
      timelineOpacities[index].value = withDelay(
        item.delay,
        withTiming(1, { duration: 300 })
      );
    });

    // Show payment after timeline
    setTimeout(() => {
      setShowPayment(true);
      paymentOpacity.value = withTiming(1, { duration: 300 });
      paymentScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, 1200);
  }, [reduceMotion]);

  const handleToggle = (value: boolean) => {
    setIsEnabled(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (value) {
      toggleGlow.value = withSpring(1, { damping: 10, stiffness: 200 });
    } else {
      toggleGlow.value = withTiming(0, { duration: 200 });
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onContinue();
  };

  const paymentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: paymentOpacity.value,
    transform: [{ scale: paymentScale.value }],
  }));

  const toggleCardStyle = useAnimatedStyle(() => ({
    shadowOpacity: isEnabled ? 0.4 : 0,
  }));

  return (
    <View style={styles.container}>
      {/* Timeline */}
      <View style={styles.timeline}>
        {TIMELINE_ITEMS.map((item, index) => {
          const animatedStyle = useAnimatedStyle(() => ({
            opacity: timelineOpacities[index].value,
          }));

          return (
            <Animated.View key={item.day} style={[styles.timelineItem, animatedStyle]}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineLine} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>{item.day}</Text>
                <Text style={styles.timelineLabel}>{item.label}</Text>
              </View>
            </Animated.View>
          );
        })}

        {/* Payment Received */}
        {showPayment && (
          <Animated.View style={[styles.paymentRow, paymentAnimatedStyle]}>
            <DollarSign size={20} color="#00D632" />
            <Text style={styles.paymentText}>Payment received</Text>
          </Animated.View>
        )}
      </View>

      {/* Auto-Chase Toggle Card */}
      <Animated.View style={[styles.toggleCard, toggleCardStyle]}>
        <View style={styles.toggleHeader}>
          <Bot size={24} color="#00D632" />
          <Text style={styles.toggleTitle}>Auto-Chase Mode</Text>
        </View>
        <Text style={styles.toggleDescription}>
          We do the awkward part.{'\n'}You stay the good guy.
        </Text>
        <View style={styles.toggleRow}>
          <Switch
            value={isEnabled}
            onValueChange={handleToggle}
            trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#00D632' }}
            thumbColor="#fff"
            ios_backgroundColor="rgba(255,255,255,0.2)"
          />
        </View>
      </Animated.View>

      {/* Continue Button */}
      <Pressable onPress={handleContinue} style={styles.continueButton}>
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  timeline: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00D632',
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    width: 2,
    height: 30,
    backgroundColor: 'rgba(0, 214, 50, 0.3)',
  },
  timelineContent: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineDay: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    width: 50,
  },
  timelineLabel: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    paddingLeft: 28,
  },
  paymentText: {
    fontSize: 15,
    color: '#00D632',
    fontWeight: '600',
  },
  toggleCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 214, 50, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 214, 50, 0.3)',
    shadowColor: '#00D632',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 8,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  toggleDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
    marginBottom: 16,
  },
  toggleRow: {
    alignItems: 'flex-end',
  },
  continueButton: {
    marginTop: 24,
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
});
