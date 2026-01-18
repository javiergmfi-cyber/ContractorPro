/**
 * TutorialStep
 * Reusable layout wrapper for tutorial screens
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TutorialStepProps {
  headline: string;
  subhead: string;
  showBackButton: boolean;
  onBack: () => void;
  onSkip: () => void;
  children: React.ReactNode;
}

export function TutorialStep({
  headline,
  subhead,
  showBackButton,
  onBack,
  onSkip,
  children,
}: TutorialStepProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkip();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        {showBackButton ? (
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={16}>
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}

        <Pressable onPress={handleSkip} hitSlop={16}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.subhead}>{subhead}</Text>

        <View style={styles.childrenContainer}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  content: {
    flex: 1,
    paddingTop: 32,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subhead: {
    fontSize: 17,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  childrenContainer: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
  },
});
