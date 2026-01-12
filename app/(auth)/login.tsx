import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    }

    setIsLoading(false);
  };

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
              Welcome Back
            </Text>
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, marginTop: spacing.sm },
              ]}
            >
              Sign in to manage your invoices
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

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!isLoading}
            />

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={styles.forgotPassword}>
                <Text
                  style={[typography.footnote, { color: colors.primary }]}
                >
                  Forgot password?
                </Text>
              </Pressable>
            </Link>

            <Button
              title={isLoading ? "Signing in..." : "Sign In"}
              onPress={handleLogin}
              disabled={isLoading}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[typography.footnote, { color: colors.textSecondary }]}>
              Don't have an account?{" "}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text style={[typography.footnote, { color: colors.primary, fontWeight: "600" }]}>
                  Sign Up
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
});
