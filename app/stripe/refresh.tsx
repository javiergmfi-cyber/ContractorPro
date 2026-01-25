import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme";

/**
 * Stripe Connect Refresh Page
 * Handles the redirect when user needs to refresh/retry Stripe onboarding
 */
export default function StripeRefreshPage() {
  const { colors, typography } = useTheme();

  useEffect(() => {
    // Redirect back to onboarding page to retry
    setTimeout(() => {
      router.replace("/stripe/onboarding");
    }, 1000);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[typography.headline, { color: colors.text, marginTop: 16 }]}>
        Redirecting...
      </Text>
    </View>
  );
}
