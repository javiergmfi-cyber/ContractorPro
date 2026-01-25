import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme";
import { useProfileStore } from "@/store/useProfileStore";
import { useOnboardingStore } from "@/store/useOnboardingStore";

/**
 * Stripe Connect Return Page
 * Handles the redirect after successful Stripe onboarding
 */
export default function StripeReturnPage() {
  const { colors, typography } = useTheme();
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const completeTask = useOnboardingStore((state) => state.completeTask);

  useEffect(() => {
    const handleReturn = async () => {
      // Refresh profile to get updated Stripe account info
      await fetchProfile();

      // Mark Stripe setup as complete
      completeTask("stripe_connect");

      // Wait a moment then redirect to home tab
      setTimeout(() => {
        router.replace("/(tabs)/");
      }, 1500);
    };

    handleReturn();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[typography.headline, { color: colors.text, marginTop: 16 }]}>
        Completing Stripe setup...
      </Text>
    </View>
  );
}
