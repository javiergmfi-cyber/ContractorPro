import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  X,
  Shield,
  Check,
  Zap,
  Mic,
  RefreshCw,
  Eye,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { PurchasesPackage } from "react-native-purchases";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Premium Paywall Screen
 * "Midnight" aesthetic - Dark mode only, high-end visuals
 *
 * This is the sales screen for Pro tier upgrade
 */

// Midnight color palette (forced dark)
const MIDNIGHT = {
  background: "#000000",
  backgroundGradientStart: "#0A0A0F",
  backgroundGradientEnd: "#000000",
  accent: "#00D632", // Electric Green
  accentGlow: "#00FF41",
  gold: "#FFD700",
  goldGlow: "#FFA500",
  text: "#FFFFFF",
  textSecondary: "#A0A0A0",
  textMuted: "#666666",
  glass: "rgba(255, 255, 255, 0.08)",
  glassBorder: "rgba(255, 255, 255, 0.12)",
};

const VALUE_PROPS = [
  {
    icon: Zap,
    title: "Bad Cop Auto-Collections",
    description: "AI that chases payments so you don't have to",
  },
  {
    icon: Eye,
    title: "Read Receipts",
    description: "Know when clients view your invoices",
  },
  {
    icon: RefreshCw,
    title: "Next-Day Payouts",
    description: "Get your money faster with instant payouts",
  },
];

// Contextual messages based on paywall trigger
const CONTEXTUAL_MESSAGES: Record<string, { headline: string; subheadline: string }> = {
  default: {
    headline: "Never Chase a\nPayment Again.",
    subheadline: "Let the Bad Cop Bot do the dirty work.",
  },
  unpaid_invoice: {
    headline: "Tired of\nChecking?",
    subheadline: "Let Bad Cop chase this invoice automatically.",
  },
  reminder_fatigue: {
    headline: "Stop Sending\nReminders.",
    subheadline: "Bad Cop handles the awkward follow-ups.",
  },
  branding: {
    headline: "Look More\nProfessional.",
    subheadline: "Custom branding for premium invoices.",
  },
  read_receipts: {
    headline: "Did They\nSee It?",
    subheadline: "Know exactly when clients view your invoice.",
  },
};

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ trigger?: string }>();
  const trigger = params.trigger || "default";

  // Subscription state
  const {
    offerings,
    isLoading,
    purchasePackage,
    restorePurchases,
    fetchOfferings,
  } = useSubscriptionStore();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  // Get monthly package from offerings
  const monthlyPackage = offerings?.monthly || null;
  const annualPackage = offerings?.annual || null;

  // Get contextual message
  const contextMessage = CONTEXTUAL_MESSAGES[trigger] || CONTEXTUAL_MESSAGES.default;

  // Animations
  const shieldGlow = useRef(new Animated.Value(0.5)).current;
  const shieldScale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const cardSlide = useRef(new Animated.Value(100)).current;
  const shimmerPosition = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    // Fetch offerings if not loaded
    if (!offerings) {
      fetchOfferings();
    }
  }, []);

  useEffect(() => {
    // Shield breathing glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shieldGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shieldGlow, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shield subtle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(shieldScale, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shieldScale, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // CTA Button shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerPosition, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerPosition, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Content fade in
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        damping: 20,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        damping: 18,
        stiffness: 80,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleStartTrial = async () => {
    const packageToPurchase = selectedPackage || monthlyPackage;
    if (!packageToPurchase) {
      Alert.alert("Error", "Unable to load subscription options. Please try again.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPurchasing(true);

    const result = await purchasePackage(packageToPurchase);

    setIsPurchasing(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else if (result.error !== "cancelled") {
      Alert.alert("Purchase Failed", result.error || "Something went wrong. Please try again.");
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsPurchasing(true);

    const result = await restorePurchases();

    setIsPurchasing(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Restored", "Your purchases have been restored.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Restore Failed", result.error || "No purchases found to restore.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={[MIDNIGHT.backgroundGradientStart, MIDNIGHT.backgroundGradientEnd]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow behind shield */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            opacity: shieldGlow.interpolate({
              inputRange: [0.5, 1],
              outputRange: [0.3, 0.6],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={[MIDNIGHT.accentGlow + "40", "transparent"]}
          style={styles.ambientGlowGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {/* Close Button */}
        <Pressable
          onPress={handleClose}
          style={styles.closeButton}
          hitSlop={12}
        >
          <View style={styles.closeButtonInner}>
            <X size={20} color={MIDNIGHT.textSecondary} strokeWidth={2} />
          </View>
        </Pressable>

        {/* Hero Section */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            },
          ]}
        >
          {/* 3D Shield Icon with Glow */}
          <Animated.View
            style={[
              styles.shieldContainer,
              {
                transform: [{ scale: shieldScale }],
              },
            ]}
          >
            {/* Outer glow ring */}
            <Animated.View
              style={[
                styles.shieldGlowOuter,
                {
                  opacity: shieldGlow,
                },
              ]}
            />
            {/* Inner glow */}
            <Animated.View
              style={[
                styles.shieldGlowInner,
                {
                  opacity: shieldGlow.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ]}
            />
            {/* Shield icon */}
            <View style={styles.shieldIconWrapper}>
              <Shield
                size={64}
                color={MIDNIGHT.accent}
                strokeWidth={1.5}
                fill={MIDNIGHT.accent + "30"}
              />
            </View>
          </Animated.View>

          {/* Headline - Contextual */}
          <Text style={styles.headline}>
            {contextMessage.headline}
          </Text>

          {/* Subheadline - Contextual */}
          <Text style={styles.subheadline}>
            {contextMessage.subheadline}
          </Text>
        </Animated.View>

        {/* Value Propositions */}
        <Animated.View
          style={[
            styles.valuePropsContainer,
            {
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            },
          ]}
        >
          {VALUE_PROPS.map((prop, index) => (
            <View key={index} style={styles.valuePropRow}>
              <View style={styles.checkCircle}>
                <Check size={16} color={MIDNIGHT.accent} strokeWidth={3} />
              </View>
              <View style={styles.valuePropTextContainer}>
                <Text style={styles.valuePropTitle}>{prop.title}</Text>
                <Text style={styles.valuePropDescription}>
                  {prop.description}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Price Card - Glassmorphism */}
        <Animated.View
          style={[
            styles.priceCardContainer,
            {
              transform: [{ translateY: cardSlide }],
              opacity: fadeIn,
            },
          ]}
        >
          {Platform.OS === "ios" ? (
            <BlurView intensity={20} tint="dark" style={styles.priceCardBlur}>
              <PriceCardContent
                onStartTrial={handleStartTrial}
                onRestore={handleRestore}
                shimmerPosition={shimmerPosition}
                monthlyPackage={monthlyPackage}
                isPurchasing={isPurchasing}
              />
            </BlurView>
          ) : (
            <View style={[styles.priceCardBlur, styles.priceCardAndroid]}>
              <PriceCardContent
                onStartTrial={handleStartTrial}
                onRestore={handleRestore}
                shimmerPosition={shimmerPosition}
                monthlyPackage={monthlyPackage}
                isPurchasing={isPurchasing}
              />
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// Price Card Inner Content
function PriceCardContent({
  onStartTrial,
  onRestore,
  shimmerPosition,
  monthlyPackage,
  isPurchasing,
}: {
  onStartTrial: () => void;
  onRestore: () => void;
  shimmerPosition: Animated.Value;
  monthlyPackage: PurchasesPackage | null;
  isPurchasing: boolean;
}) {
  // Extract price from package or use fallback
  const priceString = monthlyPackage?.product?.priceString || "$19.99";
  // Parse price number from string (e.g., "$19.99" -> "19.99")
  const priceNumber = priceString.replace(/[^0-9.]/g, "");
  const priceParts = priceNumber.split(".");
  const priceWhole = priceParts[0] || "19";

  return (
    <View style={styles.priceCardContent}>
      {/* Pro Badge */}
      <View style={styles.proBadge}>
        <Shield size={14} color={MIDNIGHT.accent} strokeWidth={2} />
        <Text style={styles.proBadgeText}>PRO</Text>
      </View>

      {/* Price */}
      <View style={styles.priceRow}>
        <Text style={styles.priceCurrency}>$</Text>
        <Text style={styles.priceAmount}>{priceWhole}</Text>
        <Text style={styles.pricePeriod}>/ month</Text>
      </View>

      {/* Subtext */}
      <Text style={styles.priceSubtext}>
        Cancel anytime. Billed monthly.
      </Text>

      {/* CTA Button with Shimmer */}
      <Pressable
        onPress={onStartTrial}
        disabled={isPurchasing}
        style={({ pressed }) => [
          styles.ctaButton,
          pressed && styles.ctaButtonPressed,
          isPurchasing && styles.ctaButtonDisabled,
        ]}
      >
        {/* Shimmer overlay */}
        {!isPurchasing && (
          <Animated.View
            style={[
              styles.shimmerOverlay,
              {
                transform: [
                  {
                    translateX: shimmerPosition.interpolate({
                      inputRange: [-1, 1],
                      outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[
                "transparent",
                "rgba(255, 255, 255, 0.3)",
                "transparent",
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        )}
        {isPurchasing ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.ctaButtonText}>Start 7-Day Free Trial</Text>
        )}
      </Pressable>

      {/* Terms */}
      <Text style={styles.termsText}>
        No charge until trial ends
      </Text>

      {/* Restore Purchases */}
      <Pressable onPress={onRestore} style={styles.restoreButton}>
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MIDNIGHT.background,
  },
  safeArea: {
    flex: 1,
  },

  // Ambient Glow
  ambientGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    zIndex: 0,
  },
  ambientGlowGradient: {
    flex: 1,
  },

  // Close Button
  closeButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 100,
  },
  closeButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MIDNIGHT.glass,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: MIDNIGHT.glassBorder,
  },

  // Hero Section
  heroSection: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
  },

  // Shield with Glow
  shieldContainer: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  shieldGlowOuter: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: MIDNIGHT.accentGlow,
    shadowColor: MIDNIGHT.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
  },
  shieldGlowInner: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MIDNIGHT.accent + "20",
    shadowColor: MIDNIGHT.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  shieldIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MIDNIGHT.glass,
    borderWidth: 1,
    borderColor: MIDNIGHT.accent + "40",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: MIDNIGHT.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  // Typography
  headline: {
    fontSize: 34,
    fontWeight: "900",
    color: MIDNIGHT.text,
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 40,
    fontFamily: Platform.select({
      ios: "SF Pro Rounded",
      default: "System",
    }),
  },
  subheadline: {
    fontSize: 17,
    fontWeight: "500",
    color: MIDNIGHT.textSecondary,
    textAlign: "center",
    marginTop: 12,
    letterSpacing: -0.4,
  },

  // Value Propositions
  valuePropsContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    gap: 20,
  },
  valuePropRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MIDNIGHT.accent + "20",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  valuePropTextContainer: {
    flex: 1,
  },
  valuePropTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: MIDNIGHT.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  valuePropDescription: {
    fontSize: 14,
    fontWeight: "400",
    color: MIDNIGHT.textMuted,
    letterSpacing: -0.2,
  },

  // Spacer
  spacer: {
    flex: 1,
    minHeight: 20,
  },

  // Price Card
  priceCardContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  priceCardBlur: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: MIDNIGHT.glassBorder,
  },
  priceCardAndroid: {
    backgroundColor: MIDNIGHT.glass,
  },
  priceCardContent: {
    padding: 24,
    alignItems: "center",
  },

  // Pro Badge
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: MIDNIGHT.accent + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 16,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: MIDNIGHT.accent,
    letterSpacing: 1,
  },

  // Price
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  priceCurrency: {
    fontSize: 24,
    fontWeight: "600",
    color: MIDNIGHT.text,
    marginRight: 2,
  },
  priceAmount: {
    fontSize: 56,
    fontWeight: "900",
    color: MIDNIGHT.text,
    letterSpacing: -2,
    fontVariant: ["tabular-nums"],
  },
  pricePeriod: {
    fontSize: 17,
    fontWeight: "500",
    color: MIDNIGHT.textSecondary,
    marginLeft: 4,
  },
  priceSubtext: {
    fontSize: 14,
    fontWeight: "400",
    color: MIDNIGHT.textMuted,
    marginBottom: 24,
  },

  // CTA Button
  ctaButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: MIDNIGHT.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: MIDNIGHT.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: -0.4,
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
  },
  shimmerGradient: {
    flex: 1,
    width: 100,
  },

  // Terms
  termsText: {
    fontSize: 12,
    fontWeight: "400",
    color: MIDNIGHT.textMuted,
    marginTop: 12,
  },

  // Restore Purchases
  restoreButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: "500",
    color: MIDNIGHT.textMuted,
  },
});
