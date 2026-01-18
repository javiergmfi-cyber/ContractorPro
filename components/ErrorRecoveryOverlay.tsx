import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import {
  AlertTriangle,
  WifiOff,
  CreditCard,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  X,
  Zap,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * ErrorRecoveryOverlay Component
 *
 * A guided error recovery experience with:
 * - Contextual error types with specific recovery paths
 * - Animated step-by-step recovery guidance
 * - Haptic feedback for interactions
 * - Auto-retry capability
 * - Dismissible with manual action
 */

export type ErrorType =
  | "network"
  | "payment"
  | "auth"
  | "sync"
  | "voice"
  | "generic";

interface RecoveryStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  steps: RecoveryStep[];
}

interface ErrorRecoveryOverlayProps {
  visible: boolean;
  errorType: ErrorType;
  errorMessage?: string;
  onDismiss: () => void;
  onRetry?: () => void;
  onContactSupport?: () => void;
}

export function ErrorRecoveryOverlay({
  visible,
  errorType,
  errorMessage,
  onDismiss,
  onRetry,
  onContactSupport,
}: ErrorRecoveryOverlayProps) {
  const { colors, isDark, radius } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;
  const iconShake = useRef(new Animated.Value(0)).current;
  const stepAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const retryRotation = useRef(new Animated.Value(0)).current;

  // Error configurations
  const getErrorConfig = (): ErrorConfig => {
    const configs: Record<ErrorType, ErrorConfig> = {
      network: {
        icon: <WifiOff size={32} color="#FF9500" strokeWidth={2} />,
        title: "Connection Lost",
        subtitle: "Don't worry, your data is safe",
        color: "#FF9500",
        steps: [
          {
            icon: <WifiOff size={20} color={colors.textSecondary} />,
            title: "Check your connection",
            description: "Make sure Wi-Fi or cellular data is enabled",
          },
          {
            icon: <RefreshCw size={20} color={colors.textSecondary} />,
            title: "Try again",
            description: "We'll sync your data when reconnected",
            action: onRetry
              ? {
                  label: "Retry Now",
                  onPress: handleRetry,
                }
              : undefined,
          },
          {
            icon: <Zap size={20} color={colors.textSecondary} />,
            title: "Work offline",
            description: "Your invoices are saved locally and will sync later",
          },
        ],
      },
      payment: {
        icon: <CreditCard size={32} color="#FF3B30" strokeWidth={2} />,
        title: "Payment Failed",
        subtitle: "Let's fix this together",
        color: "#FF3B30",
        steps: [
          {
            icon: <CreditCard size={20} color={colors.textSecondary} />,
            title: "Check card details",
            description: "Verify your card number, expiry, and CVV are correct",
          },
          {
            icon: <RefreshCw size={20} color={colors.textSecondary} />,
            title: "Try a different card",
            description: "Sometimes banks decline for security reasons",
            action: onRetry
              ? {
                  label: "Try Again",
                  onPress: handleRetry,
                }
              : undefined,
          },
          {
            icon: <MessageSquare size={20} color={colors.textSecondary} />,
            title: "Contact your bank",
            description: "They can authorize the transaction for you",
          },
        ],
      },
      auth: {
        icon: <AlertTriangle size={32} color="#FF9500" strokeWidth={2} />,
        title: "Session Expired",
        subtitle: "Quick sign-in required",
        color: "#FF9500",
        steps: [
          {
            icon: <RefreshCw size={20} color={colors.textSecondary} />,
            title: "Sign in again",
            description: "Your data is safe, just need to verify it's you",
            action: {
              label: "Sign In",
              onPress: onDismiss,
            },
          },
        ],
      },
      sync: {
        icon: <RefreshCw size={32} color="#007AFF" strokeWidth={2} />,
        title: "Sync Issue",
        subtitle: "Some data couldn't sync",
        color: "#007AFF",
        steps: [
          {
            icon: <WifiOff size={20} color={colors.textSecondary} />,
            title: "Check connection",
            description: "Sync requires an internet connection",
          },
          {
            icon: <RefreshCw size={20} color={colors.textSecondary} />,
            title: "Try syncing again",
            description: "We'll retry uploading your pending changes",
            action: onRetry
              ? {
                  label: "Sync Now",
                  onPress: handleRetry,
                }
              : undefined,
          },
        ],
      },
      voice: {
        icon: <MessageSquare size={32} color="#AF52DE" strokeWidth={2} />,
        title: "Voice Processing Failed",
        subtitle: "Let's try that again",
        color: "#AF52DE",
        steps: [
          {
            icon: <MessageSquare size={20} color={colors.textSecondary} />,
            title: "Speak clearly",
            description: "Try speaking closer to the microphone",
          },
          {
            icon: <RefreshCw size={20} color={colors.textSecondary} />,
            title: "Record again",
            description: "Hold the button and speak your invoice details",
            action: onRetry
              ? {
                  label: "Try Again",
                  onPress: handleRetry,
                }
              : undefined,
          },
          {
            icon: <Zap size={20} color={colors.textSecondary} />,
            title: "Use manual entry",
            description: "Tap to type your invoice instead",
          },
        ],
      },
      generic: {
        icon: <AlertTriangle size={32} color="#FF3B30" strokeWidth={2} />,
        title: "Something Went Wrong",
        subtitle: "We're on it",
        color: "#FF3B30",
        steps: [
          {
            icon: <RefreshCw size={20} color={colors.textSecondary} />,
            title: "Try again",
            description: "This usually fixes temporary issues",
            action: onRetry
              ? {
                  label: "Retry",
                  onPress: handleRetry,
                }
              : undefined,
          },
          {
            icon: <MessageSquare size={20} color={colors.textSecondary} />,
            title: "Get help",
            description: "Our support team is ready to assist",
            action: onContactSupport
              ? {
                  label: "Contact Support",
                  onPress: onContactSupport,
                }
              : undefined,
          },
        ],
      },
    };

    return configs[errorType];
  };

  const config = getErrorConfig();

  // Handle retry with animation
  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Spin animation
    Animated.loop(
      Animated.timing(retryRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      { iterations: 2 }
    ).start(() => {
      retryRotation.setValue(0);
    });

    // Call retry after brief delay
    setTimeout(() => {
      onRetry?.();
      setIsRetrying(false);
    }, 2000);
  };

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);

      // Reset animations
      overlayOpacity.setValue(0);
      cardScale.setValue(0.9);
      cardTranslateY.setValue(50);
      iconShake.setValue(0);
      stepAnimations.forEach((anim) => anim.setValue(0));

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Main entrance animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          damping: 15,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          damping: 15,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Shake the icon
        Animated.sequence([
          Animated.timing(iconShake, {
            toValue: 1,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(iconShake, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(iconShake, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(iconShake, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();

        // Stagger in the recovery steps
        Animated.stagger(
          150,
          stepAnimations.slice(0, config.steps.length).map((anim) =>
            Animated.spring(anim, {
              toValue: 1,
              damping: 15,
              stiffness: 200,
              useNativeDriver: true,
            })
          )
        ).start();
      });
    }
  }, [visible, errorType]);

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handleStepPress = (index: number) => {
    Haptics.selectionAsync();
    setCurrentStep(index);
  };

  if (!visible) return null;

  const shakeInterpolation = iconShake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-10deg", "0deg", "10deg"],
  });

  const retrySpinInterpolation = retryRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[styles.container, { opacity: overlayOpacity }]}
      pointerEvents="auto"
    >
      {/* Blur Background */}
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? "rgba(0, 0, 0, 0.85)"
                : "rgba(255, 255, 255, 0.9)",
            },
          ]}
        />
      )}

      {/* Dismiss on background tap */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />

      {/* Recovery Card */}
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderRadius: radius.xxl,
            transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
          },
        ]}
      >
        {/* Close Button */}
        <Pressable
          style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={handleDismiss}
        >
          <X size={20} color={colors.textSecondary} />
        </Pressable>

        {/* Error Icon with shake */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: config.color + "15",
              borderColor: config.color + "30",
              transform: [{ rotate: shakeInterpolation }],
            },
          ]}
        >
          {config.icon}
        </Animated.View>

        {/* Error Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {config.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {config.subtitle}
        </Text>

        {/* Custom error message if provided */}
        {errorMessage && (
          <View
            style={[
              styles.errorMessageContainer,
              { backgroundColor: config.color + "10", borderColor: config.color + "20" },
            ]}
          >
            <Text style={[styles.errorMessage, { color: config.color }]}>
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Recovery Steps */}
        <View style={styles.stepsContainer}>
          <Text style={[styles.stepsLabel, { color: colors.textTertiary }]}>
            HERE'S WHAT TO DO
          </Text>

          {config.steps.map((step, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: stepAnimations[index],
                transform: [
                  {
                    translateX: stepAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              }}
            >
              <Pressable
                onPress={() => handleStepPress(index)}
                style={({ pressed }) => [
                  styles.stepCard,
                  {
                    backgroundColor:
                      currentStep === index
                        ? colors.primary + "10"
                        : colors.backgroundSecondary,
                    borderColor:
                      currentStep === index ? colors.primary + "30" : "transparent",
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={styles.stepHeader}>
                  <View
                    style={[
                      styles.stepNumber,
                      {
                        backgroundColor:
                          currentStep === index
                            ? colors.primary
                            : colors.textTertiary,
                      },
                    ]}
                  >
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, { color: colors.text }]}>
                      {step.title}
                    </Text>
                    <Text
                      style={[styles.stepDescription, { color: colors.textSecondary }]}
                    >
                      {step.description}
                    </Text>
                  </View>
                  {step.action && <ChevronRight size={18} color={colors.textTertiary} />}
                </View>

                {/* Action Button */}
                {step.action && currentStep === index && (
                  <Animated.View style={styles.actionContainer}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionButton,
                        { backgroundColor: colors.primary },
                        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                      ]}
                      onPress={step.action.onPress}
                      disabled={isRetrying}
                    >
                      {isRetrying ? (
                        <Animated.View
                          style={{ transform: [{ rotate: retrySpinInterpolation }] }}
                        >
                          <RefreshCw size={18} color="#FFFFFF" />
                        </Animated.View>
                      ) : (
                        <Text style={styles.actionButtonText}>
                          {step.action.label}
                        </Text>
                      )}
                    </Pressable>
                  </Animated.View>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Dismiss hint */}
        <Text style={[styles.dismissHint, { color: colors.textTertiary }]}>
          Tap outside to dismiss
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 25,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  errorMessageContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  errorMessage: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  stepsContainer: {
    gap: 8,
  },
  stepsLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  stepCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 12,
    marginLeft: 36,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  dismissHint: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 16,
  },
});
