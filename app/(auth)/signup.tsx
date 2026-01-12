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
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignUpScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async () => {
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: signUpError } = await signUp(email, password, fullName);

    if (signUpError) {
      setError(signUpError.message);
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
            We've sent a confirmation link to {email}. Please verify your email to continue.
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[typography.largeTitle, { color: colors.text }]}>
              Create Account
            </Text>
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, marginTop: spacing.sm },
              ]}
            >
              Start getting paid faster
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
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Smith"
              autoCapitalize="words"
              autoComplete="name"
              editable={!isLoading}
            />

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

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isLoading}
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              editable={!isLoading}
            />

            <Button
              title={isLoading ? "Creating account..." : "Create Account"}
              onPress={handleSignUp}
              disabled={isLoading}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[typography.footnote, { color: colors.textSecondary }]}>
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={[typography.footnote, { color: colors.primary, fontWeight: "600" }]}>
                  Sign In
                </Text>
              </Pressable>
            </Link>
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
    justifyContent: "center",
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
});
