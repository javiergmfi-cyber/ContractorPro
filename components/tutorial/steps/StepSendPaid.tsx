/**
 * StepSendPaid - Screen 2
 * Send → Paid animation with realistic timing jitter
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Send, MessageCircle, DollarSign, CreditCard } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface StepSendPaidProps {
  onContinue: () => void;
  reduceMotion: boolean;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function StepSendPaid({ onContinue, reduceMotion }: StepSendPaidProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [showPaid, setShowPaid] = useState(false);

  // Animations
  const sentOpacity = useSharedValue(0);
  const sentScale = useSharedValue(0.8);
  const paidOpacity = useSharedValue(0);
  const paidScale = useSharedValue(0.8);

  const playPaymentAnimation = async () => {
    if (hasStarted) return;
    setHasStarted(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // "Invoice sent" appears after ~300ms
    await delay(300);
    setShowSent(true);
    sentOpacity.value = withTiming(1, { duration: 200 });
    sentScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // "Payment received" appears with random delay (feels real)
    const randomDelay = 600 + Math.random() * 500; // 600-1100ms
    await delay(randomDelay);
    setShowPaid(true);
    paidOpacity.value = withTiming(1, { duration: 200 });
    paidScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Auto-start animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      playPaymentAnimation();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const sentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sentOpacity.value,
    transform: [{ scale: sentScale.value }],
  }));

  const paidAnimatedStyle = useAnimatedStyle(() => ({
    opacity: paidOpacity.value,
    transform: [{ scale: paidScale.value }],
  }));

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onContinue();
  };

  return (
    <View style={styles.container}>
      {/* Invoice Card */}
      <View style={styles.invoiceCard}>
        <View style={styles.invoiceContent}>
          <Text style={styles.invoiceTitle}>Invoice for John</Text>
          <Text style={styles.invoiceAmount}>$500</Text>
        </View>
        <Pressable
          onPress={playPaymentAnimation}
          style={[styles.sendButton, hasStarted && styles.sendButtonDisabled]}
          disabled={hasStarted}
        >
          <Send size={18} color={hasStarted ? 'rgba(0,0,0,0.5)' : '#000'} />
          <Text style={[styles.sendButtonText, hasStarted && styles.sendButtonTextDisabled]}>
            {hasStarted ? 'Sent' : 'Send Invoice'}
          </Text>
        </Pressable>
      </View>

      {/* Status Messages */}
      <View style={styles.statusContainer}>
        {showSent && (
          <Animated.View style={[styles.statusRow, sentAnimatedStyle]}>
            <MessageCircle size={20} color="#00D632" />
            <Text style={styles.statusText}>Invoice sent</Text>
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>
        )}

        {showPaid && (
          <Animated.View style={[styles.statusRow, paidAnimatedStyle]}>
            <DollarSign size={20} color="#00D632" />
            <Text style={styles.statusText}>Payment received</Text>
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>
        )}

        {showPaid && (
          <Text style={styles.exampleText}>(Example flow)</Text>
        )}
      </View>

      {/* Payment Methods */}
      <View style={styles.paymentMethods}>
        <View style={styles.paymentCard}>
          <CreditCard size={20} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.paymentText}>Apple Pay</Text>
          <Text style={styles.paymentText}>Google Pay</Text>
        </View>
        <Text style={styles.paymentHint}>Pay in 1 tap</Text>
      </View>

      {/* Continue Button */}
      {showPaid && (
        <Pressable onPress={handleContinue} style={styles.continueButton}>
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  invoiceCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  invoiceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  invoiceTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  invoiceAmount: {
    fontSize: 20,
    color: '#00D632',
    fontWeight: '700',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D632',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(0, 214, 50, 0.5)',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  sendButtonTextDisabled: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  statusContainer: {
    marginTop: 24,
    alignItems: 'center',
    minHeight: 100,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: '#00D632',
    fontWeight: '700',
  },
  exampleText: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic',
  },
  paymentMethods: {
    marginTop: 24,
    alignItems: 'center',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
  },
  paymentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  paymentHint: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  continueButton: {
    marginTop: 32,
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
