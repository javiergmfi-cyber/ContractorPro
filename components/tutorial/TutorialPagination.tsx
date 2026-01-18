/**
 * TutorialPagination
 * Dot pagination with active dot glow effect
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface TutorialPaginationProps {
  totalSteps: number;
  currentStep: number;
}

const DOT_SIZE = 8;
const DOT_SPACING = 8;
const ACTIVE_COLOR = '#00D632';
const INACTIVE_COLOR = 'rgba(255, 255, 255, 0.3)';

function PaginationDot({ index, currentStep }: { index: number; currentStep: number }) {
  const isActive = index === currentStep;

  const animatedStyle = useAnimatedStyle(() => {
    const scale = withSpring(isActive ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    });

    return {
      transform: [{ scale }],
      backgroundColor: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
      shadowOpacity: withSpring(isActive ? 0.8 : 0, {
        damping: 15,
        stiffness: 150,
      }),
    };
  }, [isActive]);

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
        isActive && styles.activeDotShadow,
      ]}
    />
  );
}

export function TutorialPagination({ totalSteps, currentStep }: TutorialPaginationProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <PaginationDot key={index} index={index} currentStep={currentStep} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: DOT_SPACING,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  activeDotShadow: {
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
});
