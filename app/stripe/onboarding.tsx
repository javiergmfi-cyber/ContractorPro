import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ExternalLink, CheckCircle, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import * as stripeService from "@/services/stripe";
import { StripeAccountStatus } from "@/types";

export default function StripeOnboardingScreen() {
  const { colors, typography, spacing, radius } = useTheme();

  const [status, setStatus] = useState<StripeAccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const accountStatus = await stripeService.getStripeAccountStatus();
      setStatus(accountStatus);
    } catch (err) {
      console.error("Error loading status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const result = await stripeService.getConnectOnboardingUrl();

      if (result?.url) {
        // Open Stripe onboarding in browser
        await WebBrowser.openBrowserAsync(result.url);

        // Refresh status after returning
        await loadStatus();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      setError(err.message || "Failed to start Stripe onboarding");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsConnecting(false);
    }
  };

  const renderStatus = () => {
    if (!status) return null;

    if (status.chargesEnabled && status.payoutsEnabled) {
      return (
        <View
          style={[
            styles.statusCard,
            { backgroundColor: colors.success + "15", borderRadius: radius.lg },
          ]}
        >
          <CheckCircle size={24} color={colors.success} />
          <View style={styles.statusContent}>
            <Text style={[typography.headline, { color: colors.text }]}>
              Payments Enabled
            </Text>
            <Text style={[typography.footnote, { color: colors.textSecondary }]}>
              You can accept payments and receive payouts
            </Text>
          </View>
        </View>
      );
    }

    if (status.isConnected) {
      return (
        <View
          style={[
            styles.statusCard,
            { backgroundColor: colors.alert + "15", borderRadius: radius.lg },
          ]}
        >
          <AlertCircle size={24} color={colors.alert} />
          <View style={styles.statusContent}>
            <Text style={[typography.headline, { color: colors.text }]}>
              Setup Incomplete
            </Text>
            <Text style={[typography.footnote, { color: colors.textSecondary }]}>
              Complete your Stripe setup to accept payments
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[typography.title2, { color: colors.text }]}>
          Payment Setup
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Status Card */}
        {renderStatus()}

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={[typography.title3, { color: colors.text, marginBottom: spacing.sm }]}>
            Accept Payments with Stripe
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 24 }]}>
            Connect your Stripe account to accept credit card payments directly from your invoices.
            Funds are deposited directly into your bank account.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            "Accept all major credit cards",
            "Funds deposited in 2 business days",
            "Secure payment processing",
            "Automatic tax documentation",
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <CheckCircle size={20} color={colors.primary} />
              <Text style={[typography.body, { color: colors.text, marginLeft: spacing.sm }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Error */}
        {error && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: colors.error + "15", borderRadius: radius.md },
            ]}
          >
            <Text style={[typography.footnote, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Connect Button */}
        <View style={styles.buttonContainer}>
          {status?.chargesEnabled && status?.payoutsEnabled ? (
            <Button
              title="View Stripe Dashboard"
              onPress={() => Linking.openURL("https://dashboard.stripe.com")}
              variant="secondary"
            />
          ) : (
            <Button
              title={
                isConnecting
                  ? "Opening Stripe..."
                  : status?.isConnected
                  ? "Complete Setup"
                  : "Connect Stripe Account"
              }
              onPress={handleConnectStripe}
              disabled={isConnecting}
            />
          )}
        </View>

        {/* Stripe branding */}
        <View style={styles.stripeInfo}>
          <Text style={[typography.caption1, { color: colors.textTertiary, textAlign: "center" }]}>
            Powered by Stripe. By connecting, you agree to Stripe's Terms of Service.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 24,
  },
  statusContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoSection: {
    marginBottom: 24,
  },
  features: {
    marginBottom: 24,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorContainer: {
    padding: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: "auto",
  },
  stripeInfo: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
});
