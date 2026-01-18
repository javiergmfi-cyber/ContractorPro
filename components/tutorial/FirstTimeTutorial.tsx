/**
 * FirstTimeTutorial
 * Main shell component with swipe gestures and skip confirmation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
  Alert,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { TutorialStep } from './TutorialStep';
import { TutorialPagination } from './TutorialPagination';
import { TUTORIAL_STEPS } from './config/tutorialSteps';
import { StepAhaVoice } from './steps/StepAhaVoice';
import { StepSendPaid } from './steps/StepSendPaid';
import { StepBadCop } from './steps/StepBadCop';
import { StepReady } from './steps/StepReady';
import { useTutorialStore, CURRENT_TUTORIAL_VERSION } from '@/store/useTutorialStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FirstTimeTutorialProps {
  userId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function FirstTimeTutorial({
  userId,
  onComplete,
  onSkip,
}: FirstTimeTutorialProps) {
  const router = useRouter();
  const { setTutorialVersionSeen } = useTutorialStore();

  // Component state (NOT persisted)
  const [currentStep, setCurrentStep] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Animation
  const translateX = useSharedValue(0);

  // Check reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => subscription.remove();
  }, []);

  const goToNextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    const step = TUTORIAL_STEPS[currentStep];

    // Screen 1: Show confirmation
    if (step.confirmSkip) {
      Alert.alert(
        'Skip tutorial?',
        'You can replay this anytime in Settings.',
        [
          { text: 'Keep going', style: 'cancel' },
          {
            text: 'Skip',
            onPress: () => {
              setTutorialVersionSeen(userId, CURRENT_TUTORIAL_VERSION);
              onSkip();
            },
          },
        ]
      );
    } else {
      // Screens 2-4: Skip instantly
      setTutorialVersionSeen(userId, CURRENT_TUTORIAL_VERSION);
      onSkip();
    }
  };

  const handleComplete = () => {
    setTutorialVersionSeen(userId, CURRENT_TUTORIAL_VERSION);
    onComplete();
  };

  const handleCreateInvoice = async () => {
    setTutorialVersionSeen(userId, CURRENT_TUTORIAL_VERSION);
    // Navigate to create invoice flow
    router.replace('/(tabs)');
    // In a real implementation, you'd create a draft invoice here
  };

  const handleSendToSelf = async () => {
    setTutorialVersionSeen(userId, CURRENT_TUTORIAL_VERSION);
    // Navigate to dashboard
    router.replace('/(tabs)');
    // In a real implementation, you'd create a test invoice here
  };

  // Swipe gesture with velocity check
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;

      // Next step: swipe left OR fast flick left
      if (
        (translationX < -50 || velocityX < -500) &&
        currentStep < TUTORIAL_STEPS.length - 1
      ) {
        runOnJS(goToNextStep)();
      }
      // Previous step: swipe right OR fast flick right
      else if ((translationX > 50 || velocityX > 500) && currentStep > 0) {
        runOnJS(goToPrevStep)();
      }

      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 0.3 }], // Subtle parallax
  }));

  const currentStepConfig = TUTORIAL_STEPS[currentStep];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepAhaVoice
            onContinue={goToNextStep}
            reduceMotion={reduceMotion}
          />
        );
      case 1:
        return (
          <StepSendPaid
            onContinue={goToNextStep}
            reduceMotion={reduceMotion}
          />
        );
      case 2:
        return (
          <StepBadCop
            onContinue={goToNextStep}
            reduceMotion={reduceMotion}
          />
        );
      case 3:
        return (
          <StepReady
            onCreateInvoice={handleCreateInvoice}
            onSendToSelf={handleSendToSelf}
            onSkip={handleSkip}
            reduceMotion={reduceMotion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#000000', '#0A0A0A', '#050505']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, !reduceMotion && animatedStyle]}>
          <TutorialStep
            headline={currentStepConfig.headline}
            subhead={currentStepConfig.subhead}
            showBackButton={currentStepConfig.showBackButton}
            onBack={goToPrevStep}
            onSkip={handleSkip}
          >
            {renderStepContent()}
          </TutorialStep>

          {/* Pagination */}
          <View style={styles.pagination}>
            <TutorialPagination
              totalSteps={TUTORIAL_STEPS.length}
              currentStep={currentStep}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
  },
  content: {
    flex: 1,
  },
  pagination: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
