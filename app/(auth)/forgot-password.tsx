import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <Text style={[typography.title1, { color: colors.text, textAlign: "center" }]}>
            Check Your Email
          </Text>
          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, textAlign: "center", marginTop: spacing.md },
            ]}
          >
            We've sent a password reset link to {email}
          </Text>
          <View style={{ marginTop: spacing.xl }}>
            <Button
              title="Back to Login"
              onPress={() => router.replace("/(auth)/login")}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={colors.text} />
            <Text style={[typography.body, { color: colors.text }]}>Back</Text>
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[typography.largeTitle, { color: colors.text }]}>
              Reset Password
            </Text>
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, marginTop: spacing.sm },
              ]}
            >
              Enter your email and we'll send you a reset link
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />

            <Button
              title={isLoading ? "Sending..." : "Send Reset Link"}
              onPress={handleResetPassword}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginLeft: -8,
  },
  header: {
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    padding: 12,
    marginBottom: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
});
