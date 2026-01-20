import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Modal,
  Platform,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { Star, X, Send, ThumbsUp, ThumbsDown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { constructGMBReviewUrl, constructGMBSearchFallback } from "@/lib/utils";

/**
 * ReviewPrompt Component - Instant Reputation Loop
 * Per HYBRID_SPEC.md Phase 4
 *
 * Triggers immediately after final balance payment success.
 *
 * Flow:
 * - 5 stars → Deep link to Google My Business
 * - 4 stars → Ask "Would you recommend?" → Yes: GMB, No: Private form
 * - 1-3 stars → Private feedback form (protects from public bad review)
 */

type ReviewState = "rating" | "recommend" | "feedback" | "thanks";

interface ReviewPromptProps {
  visible: boolean;
  onDismiss: () => void;
  contractorName: string;
  invoiceId: string;
  clientEmail?: string | null;
  googlePlaceId?: string | null; // Google Place ID for direct review link
}

export function ReviewPrompt({
  visible,
  onDismiss,
  contractorName,
  invoiceId,
  clientEmail,
  googlePlaceId,
}: ReviewPromptProps) {
  const { colors, isDark } = useTheme();

  // State
  const [rating, setRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [reviewState, setReviewState] = useState<ReviewState>("rating");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.9)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const starAnimations = useRef(
    [1, 2, 3, 4, 5].map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset state
      setRating(0);
      setHoveredStar(0);
      setReviewState("rating");
      setFeedback("");

      // Animate in
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(contentScale, {
          toValue: 1,
          damping: 15,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const animateOut = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback?.();
    });
  };

  const handleStarPress = (starNumber: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate the pressed star
    Animated.sequence([
      Animated.timing(starAnimations[starNumber - 1], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(starAnimations[starNumber - 1], {
        toValue: 1,
        damping: 10,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setRating(starNumber);

    // After a brief delay, handle the rating
    setTimeout(() => {
      handleRatingSubmit(starNumber);
    }, 500);
  };

  const handleRatingSubmit = async (selectedRating: number) => {
    // Log the rating
    await logReviewActivity("rating_given", { rating: selectedRating });

    if (selectedRating === 5) {
      // 5 stars → straight to GMB
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      openGMB();
    } else if (selectedRating === 4) {
      // 4 stars → ask if they'd recommend
      setReviewState("recommend");
    } else {
      // 1-3 stars → private feedback
      setReviewState("feedback");
    }
  };

  const handleRecommendResponse = async (wouldRecommend: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await logReviewActivity("recommend_response", { would_recommend: wouldRecommend });

    if (wouldRecommend) {
      // Yes → GMB
      openGMB();
    } else {
      // No → private feedback
      setReviewState("feedback");
    }
  };

  const openGMB = () => {
    // Use Place ID for direct review link, or fallback to search
    const url = googlePlaceId
      ? constructGMBReviewUrl(googlePlaceId)
      : constructGMBSearchFallback(contractorName);

    Linking.openURL(url).catch((err) => {
      console.error("Failed to open GMB URL:", err);
    });

    // Show thanks and dismiss
    setReviewState("thanks");
    setTimeout(() => {
      animateOut(onDismiss);
    }, 2000);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await logReviewActivity("private_feedback", {
        rating,
        feedback: feedback.trim(),
        client_email: clientEmail,
      });

      setReviewState("thanks");
      setTimeout(() => {
        animateOut(onDismiss);
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logReviewActivity = async (
    type: string,
    metadata: Record<string, unknown>
  ) => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase.from("activity_events").insert({
        user_id: user.id,
        type: `review_${type}`,
        invoice_id: invoiceId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error logging review activity:", error);
    }
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    logReviewActivity("dismissed", { rating, state: reviewState });
    animateOut(onDismiss);
  };

  if (!visible) return null;

  const renderStars = () => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((starNumber) => {
        const isFilled = starNumber <= (hoveredStar || rating);
        return (
          <Pressable
            key={starNumber}
            onPress={() => handleStarPress(starNumber)}
            onPressIn={() => setHoveredStar(starNumber)}
            onPressOut={() => setHoveredStar(0)}
          >
            <Animated.View
              style={{
                transform: [{ scale: starAnimations[starNumber - 1] }],
              }}
            >
              <Star
                size={48}
                color={isFilled ? "#FFD700" : colors.textTertiary}
                fill={isFilled ? "#FFD700" : "transparent"}
                strokeWidth={1.5}
              />
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );

  const renderContent = () => {
    switch (reviewState) {
      case "rating":
        return (
          <>
            <Text style={[styles.title, { color: colors.text }]}>
              Happy with {contractorName}'s work?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your feedback helps other homeowners
            </Text>
            {renderStars()}
          </>
        );

      case "recommend":
        return (
          <>
            <Text style={[styles.title, { color: colors.text }]}>
              Would you recommend {contractorName}?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              To friends or family
            </Text>
            <View style={styles.recommendButtons}>
              <Pressable
                onPress={() => handleRecommendResponse(true)}
                style={({ pressed }) => [
                  styles.recommendButton,
                  {
                    backgroundColor: colors.statusPaid + "15",
                    borderColor: colors.statusPaid,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <ThumbsUp size={24} color={colors.statusPaid} strokeWidth={2} />
                <Text style={[styles.recommendButtonText, { color: colors.statusPaid }]}>
                  Yes!
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleRecommendResponse(false)}
                style={({ pressed }) => [
                  styles.recommendButton,
                  {
                    backgroundColor: colors.textTertiary + "15",
                    borderColor: colors.textTertiary,
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <ThumbsDown size={24} color={colors.textTertiary} strokeWidth={2} />
                <Text style={[styles.recommendButtonText, { color: colors.textTertiary }]}>
                  Not really
                </Text>
              </Pressable>
            </View>
          </>
        );

      case "feedback":
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.feedbackContainer}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              Help us improve
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your feedback is private and helps {contractorName} do better
            </Text>
            <TextInput
              style={[
                styles.feedbackInput,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="What could have been better?"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              value={feedback}
              onChangeText={setFeedback}
              textAlignVertical="top"
            />
            <Pressable
              onPress={handleFeedbackSubmit}
              disabled={!feedback.trim() || isSubmitting}
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: colors.primary,
                  opacity: !feedback.trim() || isSubmitting ? 0.5 : pressed ? 0.9 : 1,
                },
              ]}
            >
              <Send size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </Text>
            </Pressable>
          </KeyboardAvoidingView>
        );

      case "thanks":
        return (
          <>
            <Text style={[styles.thanksEmoji]}>
              {rating >= 4 ? "🙏" : "💙"}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Thank you!
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {rating >= 4
                ? "Your review helps small businesses grow"
                : "We appreciate your honest feedback"}
            </Text>
          </>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      {/* Blur Background */}
      <Animated.View
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
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
                  ? "rgba(0, 0, 0, 0.9)"
                  : "rgba(255, 255, 255, 0.95)",
              },
            ]}
          />
        )}
      </Animated.View>

      {/* Content Card */}
      <View style={styles.contentWrapper} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              opacity: contentOpacity,
              transform: [{ scale: contentScale }],
            },
          ]}
        >
          {/* Close Button */}
          {reviewState !== "thanks" && (
            <Pressable
              onPress={handleDismiss}
              style={[styles.closeButton, { backgroundColor: colors.backgroundSecondary }]}
            >
              <X size={20} color={colors.textTertiary} strokeWidth={2} />
            </Pressable>
          )}

          {renderContent()}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 20,
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
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  recommendButtons: {
    flexDirection: "row",
    gap: 16,
  },
  recommendButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  recommendButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  feedbackContainer: {
    width: "100%",
    alignItems: "center",
  },
  feedbackInput: {
    width: "100%",
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  thanksEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
});
