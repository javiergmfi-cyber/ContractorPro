# ContractorPro - Complete Codebase Export
# Generated: Tue Jan 13 21:47:21 EST 2026

## Project Structure
```
./.claude/settings.local.json
./app.json
./app/_layout.tsx
./app/(auth)/_layout.tsx
./app/(auth)/forgot-password.tsx
./app/(auth)/login.tsx
./app/(auth)/signup.tsx
./app/(auth)/welcome.tsx
./app/(tabs)/_layout.tsx
./app/(tabs)/clients.tsx
./app/(tabs)/index.tsx
./app/(tabs)/invoices.tsx
./app/(tabs)/profile.tsx
./app/+not-found.tsx
./app/export.tsx
./app/index.tsx
./app/invoice/[id].tsx
./app/invoice/create.tsx
./app/invoice/preview.tsx
./app/paywall.tsx
./app/stripe/onboarding.tsx
./babel.config.js
./components/AnimatedNumber.tsx
./components/EmptyState.tsx
./components/InvoiceCard.tsx
./components/LogoUploader.tsx
./components/MonogramAvatar.tsx
./components/OfflineIndicator.tsx
./components/RecordingOverlay.tsx
./components/SkeletonCard.tsx
./components/SuccessOverlay.tsx
./components/ui/AutoResizingInput.tsx
./components/ui/Button.tsx
./components/ui/Card.tsx
./components/ui/Input.tsx
./components/VoiceButton.tsx
./contexts/AuthContext.tsx
./global.css
./lib/constants.ts
./lib/supabase.ts
./lib/theme.tsx
./lib/utils.ts
./metro.config.js
./nativewind-env.d.ts
./package.json
./services/ai.ts
./services/audio.ts
./services/database.ts
./services/export.ts
./services/invoice.ts
./services/offline.ts
./services/stripe.ts
./services/supabase.ts
./services/twilio.ts
./store/useClientStore.ts
./store/useDashboardStore.ts
./store/useInvoiceStore.ts
./store/useOfflineStore.ts
./store/useProfileStore.ts
./store/useReminderStore.ts
./supabase/functions/create-connect-account/index.ts
./supabase/functions/export-quickbooks/index.ts
./supabase/functions/generate-invoice-pdf/index.ts
./supabase/functions/generate-payment-link/index.ts
./supabase/functions/send-reminders/index.ts
./supabase/functions/stripe-webhook/index.ts
./supabase/functions/transcribe-and-parse/index.ts
./tailwind.config.js
./tsconfig.json
./types/database.ts
./types/index.ts
```

---

## ./.claude/settings.local.json

```json
{
  "permissions": {
    "allow": [
      "Bash(npx create-expo-app@latest . --template blank-typescript --yes)",
      "Bash(echo:*)",
      "Skill(ralph-loop:ralph-loop)",
      "Bash(node --version:*)",
      "Bash(npm --version:*)",
      "Bash(curl:*)",
      "Bash(bash -s -- --skip-shell)",
      "Bash(~/.fnm/fnm install --lts)",
      "Bash(export PATH=\"$HOME/.fnm:$PATH\")",
      "Bash(npx expo install expo-router expo-linking expo-constants expo-status-bar)",
      "Bash(npm install:*)",
      "Bash(npx tailwindcss init)",
      "Bash(npm ls:*)",
      "Bash(npm uninstall:*)",
      "Bash(npx expo install:*)",
      "Bash(npx tsc:*)",
      "Bash(timeout 30 npx expo start:*)",
      "Bash(npx expo export:*)",
      "Bash(npx expo start)",
      "Bash(pkill:*)",
      "Bash(npx expo start:*)",
      "Bash(open:*)",
      "Bash(xcrun simctl boot:*)",
      "Bash(xcrun simctl list:*)",
      "Bash(gh auth status:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(dd:*)",
      "Bash(unzip:*)",
      "Bash(chmod:*)",
      "Bash(~/.local/bin/gh --version)",
      "Bash(~/.local/bin/gh auth status)",
      "Bash(~/.local/bin/gh repo create:*)",
      "Bash(xcode-select:*)",
      "Bash(xcodebuild:*)",
      "Bash(pod:*)",
      "Bash(sudo gem install:*)",
      "Bash(gem install:*)",
      "Bash(export PATH=\"$HOME/.gem/ruby/2.6.0/bin:$PATH\")",
      "Bash(git push:*)",
      "Bash(git revert:*)",
      "WebSearch",
      "WebFetch(domain:github.com)",
      "Bash(claude mcp add gemini -s user -- env GEMINI_API_KEY=AIzaSyBav1Q48t_6d5UMEWPh3OirWtmoxab5z9I npx -y @rlabs-inc/gemini-mcp)",
      "Bash(git -C /Users/javier/ContractorPro log --oneline -15)",
      "Bash(brew install:*)",
      "Bash(sh:*)",
      "Bash(/usr/local/bin/npx --version)",
      "Bash(/opt/homebrew/bin/npx --version)",
      "Bash(/Users/javier/.local/bin/supabase init:*)",
      "Bash(/Users/javier/.local/bin/supabase projects list:*)",
      "Bash(export SUPABASE_ACCESS_TOKEN=sbp_ad8ddffbe609cb5d059bcf4585896afaf0e33884)",
      "Bash(/Users/javier/.local/bin/supabase link --project-ref wijyqeogfpkjpszrowzg)",
      "Bash(/Users/javier/.local/bin/supabase db push:*)",
      "Bash(/Users/javier/.local/bin/supabase db execute:*)",
      "Bash(/Users/javier/.local/bin/supabase --help)",
      "Bash(/Users/javier/.local/bin/supabase storage:*)",
      "Bash(/Users/javier/.local/bin/supabase db dump:*)",
      "Bash(export PATH=\"/Users/javier/.fnm/node-versions/v24.12.0/installation/bin:$PATH\":*)",
      "Bash(xcrun simctl openurl:*)",
      "Bash(ls:*)",
      "Bash(xcrun simctl io booted screenshot:*)",
      "Bash(xcrun simctl io:*)",
      "Bash(osascript:*)",
      "Bash(xcrun simctl:*)",
      "Bash(/usr/local/bin/npx tsc --noEmit)",
      "Bash(PATH=\"/opt/homebrew/bin:/usr/local/bin:$PATH\" npx tsc:*)",
      "Bash(./node_modules/.bin/tsc:*)",
      "Bash(/opt/homebrew/bin/npx tsc --noEmit)",
      "Bash(/usr/local/bin/npx expo start --ios)",
      "Bash(/opt/homebrew/bin/npx expo start --ios)",
      "Bash(~/.nvm/versions/node/*/bin/npx)",
      "Bash(expo start --ios)",
      "Bash(source ~/.zshrc)",
      "Bash(source ~/.bashrc)"
    ]
  }
}

```

---

## ./app.json

```json
{
  "expo": {
    "name": "ContractorPro",
    "slug": "ContractorPro",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-font"
    ]
  }
}

```

---

## ./app/_layout.tsx

```typescript
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { ThemeProvider, useTheme } from "../lib/theme";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import "../global.css";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth screens
      router.replace("/(tabs)");
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayoutContent() {
  const { isDark, colors } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AuthGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="invoice/preview"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen name="invoice/[id]" />
          <Stack.Screen
            name="stripe/onboarding"
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="paywall"
            options={{
              presentation: "fullScreenModal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </AuthGuard>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

```

---

## ./app/(auth)/_layout.tsx

```typescript
import { Stack } from "expo-router";
import { useTheme } from "@/lib/theme";

/**
 * Auth Layout - Cinematic Onboarding Flow
 *
 * Flow: Welcome → Login/Signup → Forgot Password
 * Welcome is the initial route for first-time users
 */

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "fade",
      }}
      initialRouteName="welcome"
    >
      <Stack.Screen
        name="welcome"
        options={{
          animation: "none",
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

```

---

## ./app/(auth)/forgot-password.tsx

```typescript
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

```

---

## ./app/(auth)/login.tsx

```typescript
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

```

---

## ./app/(auth)/signup.tsx

```typescript
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

```

---

## ./app/(auth)/welcome.tsx

```typescript
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Mic, Send, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Welcome Screen - Cinematic Onboarding
 *
 * A premium first impression with:
 * - Animated shifting gradient background
 * - Three dramatic slides: Speak. Send. Paid.
 * - Tap to advance with heavy haptics
 * - Final CTA buttons
 */

interface Slide {
  text: string;
  icon: React.ReactNode;
  color: string;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  // Slides configuration
  const slides: Slide[] = [
    {
      text: "Speak.",
      icon: <Mic size={64} color={colors.text} strokeWidth={1.5} />,
      color: colors.primary,
    },
    {
      text: "Send.",
      icon: <Send size={64} color={colors.text} strokeWidth={1.5} />,
      color: colors.statusSent,
    },
    {
      text: "Paid.",
      icon: <Check size={64} color={colors.statusPaid} strokeWidth={2} />,
      color: colors.statusPaid,
    },
  ];

  const isLastSlide = currentSlide === slides.length - 1;

  // Animate gradient continuously
  useEffect(() => {
    const animateGradient = Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    );
    animateGradient.start();
    return () => animateGradient.stop();
  }, []);

  // Show buttons on last slide
  useEffect(() => {
    if (isLastSlide) {
      Animated.spring(buttonAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 150,
        delay: 400,
        useNativeDriver: true,
      }).start();
    } else {
      buttonAnim.setValue(0);
    }
  }, [isLastSlide]);

  const handleTap = () => {
    if (isLastSlide) return;

    // Heavy haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change slide
      setCurrentSlide((prev) => prev + 1);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 12,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/signup");
  };

  const handleLogin = () => {
    Haptics.selectionAsync();
    router.replace("/login");
  };

  // Interpolate gradient colors
  const gradientStart = gradientAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      isDark ? "#0A0A0A" : "#FFFFFF",
      isDark ? "#0D1F0D" : "#E8F5E8",
      isDark ? "#0A0A0A" : "#FFFFFF",
    ],
  });

  const gradientEnd = gradientAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      isDark ? "#0D1A0D" : "#F0FFF0",
      isDark ? "#001A00" : "#D0F0D0",
      isDark ? "#0D1A0D" : "#F0FFF0",
    ],
  });

  const currentSlideData = slides[currentSlide];

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <Animated.View style={StyleSheet.absoluteFill}>
        <AnimatedGradient
          gradientStart={gradientStart}
          gradientEnd={gradientEnd}
          accentColor={currentSlideData.color}
        />
      </Animated.View>

      {/* Tap Area */}
      <Pressable
        style={styles.tapArea}
        onPress={handleTap}
        disabled={isLastSlide}
      >
        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>{currentSlideData.icon}</View>

          {/* Text */}
          <Text
            style={[
              styles.heroText,
              {
                color: isLastSlide ? colors.statusPaid : colors.text,
              },
            ]}
          >
            {currentSlideData.text}
          </Text>

          {/* Tap hint (not on last slide) */}
          {!isLastSlide && (
            <Animated.Text
              style={[styles.tapHint, { color: colors.textTertiary }]}
            >
              Tap to continue
            </Animated.Text>
          )}
        </Animated.View>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentSlide
                      ? colors.primary
                      : colors.textTertiary,
                  width: index === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </Pressable>

      {/* Bottom Buttons (Last Slide Only) */}
      {isLastSlide && (
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Primary CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGetStarted}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>

          {/* Secondary CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleLogin}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              I have an account
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

// Animated Gradient Component
interface AnimatedGradientProps {
  gradientStart: Animated.AnimatedInterpolation<string>;
  gradientEnd: Animated.AnimatedInterpolation<string>;
  accentColor: string;
}

function AnimatedGradient({
  gradientStart,
  gradientEnd,
  accentColor,
}: AnimatedGradientProps) {
  const { isDark } = useTheme();

  // For now, use static gradient since LinearGradient doesn't support animated colors directly
  // The animated value changes will trigger re-renders with new interpolated colors
  return (
    <LinearGradient
      colors={[
        isDark ? "#0A0A0A" : "#FFFFFF",
        isDark ? "#0D1A0D" : "#F5FFF5",
        isDark ? "#001A00" : "#E8FFE8",
      ]}
      locations={[0, 0.5, 1]}
      style={StyleSheet.absoluteFill}
    >
      {/* Accent Glow */}
      <View
        style={[
          styles.accentGlow,
          {
            backgroundColor: accentColor,
            shadowColor: accentColor,
          },
        ]}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tapArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    // Glass effect
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroText: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
    textAlign: "center",
  },
  tapHint: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 24,
    letterSpacing: -0.3,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    position: "absolute",
    bottom: 200,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: "width 0.3s",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 60,
    left: 24,
    right: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  primaryButtonText: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  accentGlow: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.3,
    left: SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    opacity: 0.15,
    // Blur effect via shadow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
  },
});

```

---

## ./app/(tabs)/_layout.tsx

```typescript
import { Tabs } from "expo-router";
import { Home, FileText, Users, User } from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import { View, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

/**
 * Tab Layout - Glass Effect Navigation
 *
 * Features:
 * - Frosted glass tab bar (position: absolute)
 * - SF Symbols style icons (thicker stroke when active)
 * - Haptic feedback on tab switch
 * - Safe Area handling for Home Indicator
 */

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  // Haptic feedback on tab press
  const handleTabPress = () => {
    Haptics.selectionAsync();
  };

  // Tab press listener for haptics
  const tabListeners = () => ({
    tabPress: () => {
      handleTabPress();
    },
  });

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isDark
            ? "rgba(0, 0, 0, 0.85)"
            : "rgba(255, 255, 255, 0.9)",
          borderTopWidth: 0.5,
          borderTopColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
          elevation: 0,
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 12,
          // Subtle shadow for depth
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.2 : 0.05,
          shadowRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: -0.2,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerShown: false,
        // Background blur effect (iOS only, Android falls back to solid)
        tabBarBackground: () => (
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : styles.iconContainer}>
              <Home
                size={24}
                color={color}
                strokeWidth={focused ? 2.5 : 1.5}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
        listeners={tabListeners}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : styles.iconContainer}>
              <FileText
                size={24}
                color={color}
                strokeWidth={focused ? 2.5 : 1.5}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
        listeners={tabListeners}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: "Clients",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : styles.iconContainer}>
              <Users
                size={24}
                color={color}
                strokeWidth={focused ? 2.5 : 1.5}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
        listeners={tabListeners}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : styles.iconContainer}>
              <User
                size={24}
                color={color}
                strokeWidth={focused ? 2.5 : 1.5}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
        listeners={tabListeners}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    // Subtle glow effect for active icon
    shadowColor: "#00D632",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

```

---

## ./app/(tabs)/clients.tsx

```typescript
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  Plus,
  Phone,
  Mail,
  X,
  UserPlus,
  Trophy,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useClientStore } from "@/store/useClientStore";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useTheme } from "@/lib/theme";
import { Client } from "@/types/database";
import { Button } from "@/components/ui/Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Clients Tab - Relationship Leaderboard
 * Gamified client list showing lifetime value
 */

export default function ClientsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, radius, isDark } = useTheme();
  const {
    clients,
    isLoading,
    isSaving,
    fetchClients,
    createClient,
  } = useClientStore();
  const { invoices, fetchInvoices } = useInvoiceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animations
  const searchWidthAnim = useRef(new Animated.Value(1)).current;
  const fabGlowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchClients();
    fetchInvoices();
  }, []);

  // FAB breathing animation
  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlowAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabGlowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, []);

  // Calculate lifetime value for each client
  const clientsWithLTV = useMemo(() => {
    return clients.map((client) => {
      const clientInvoices = invoices.filter(
        (inv) =>
          inv.client_name.toLowerCase() === client.name.toLowerCase() &&
          inv.status === "paid"
      );
      const totalSpent = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
      return { ...client, totalSpent };
    });
  }, [clients, invoices]);

  // Sort by LTV (highest first)
  const sortedClients = useMemo(() => {
    return [...clientsWithLTV].sort((a, b) => b.totalSpent - a.totalSpent);
  }, [clientsWithLTV]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([fetchClients(), fetchInvoices()]);
    setRefreshing(false);
  }, [fetchClients, fetchInvoices]);

  const filteredClients = sortedClients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientPress = (client: Client) => {
    Haptics.selectionAsync();
    // TODO: Navigate to client detail
  };

  const handleAddClient = async () => {
    if (!newClientName.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await createClient({
        name: newClientName.trim(),
        email: newClientEmail.trim() || null,
        phone: newClientPhone.trim() || null,
      });
      setShowAddModal(false);
      setNewClientName("");
      setNewClientEmail("");
      setNewClientPhone("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.spring(searchWidthAnim, {
      toValue: 1.02,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.spring(searchWidthAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  };

  // Pastel color palette for avatars
  const getPastelColor = (name: string) => {
    const pastelColors = [
      "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9",
      "#BAE1FF", "#E8BAFF", "#FFB3E6", "#C9BAFF",
      "#BAFFEA", "#FFD9BA", "#D4BAFF", "#BAFFCE",
    ];
    const index = name.charCodeAt(0) % pastelColors.length;
    return pastelColors[index];
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const renderClientCard = ({ item, index }: { item: typeof clientsWithLTV[0]; index: number }) => {
    const isTopClient = index === 0 && item.totalSpent > 0;

    return (
      <Pressable
        onPress={() => handleClientPress(item)}
        style={({ pressed }) => [
          styles.clientCard,
          {
            backgroundColor: colors.card,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 12,
          },
        ]}
      >
        {/* Trophy badge for top client */}
        {isTopClient && (
          <View style={[styles.topBadge, { backgroundColor: colors.systemOrange }]}>
            <Trophy size={10} color="#FFFFFF" />
          </View>
        )}

        {/* Monogram Avatar */}
        <View style={[styles.avatar, { backgroundColor: getPastelColor(item.name) }]}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <Text
            style={[styles.clientName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {(item.email || item.phone) && (
            <View style={styles.contactRow}>
              {item.phone && (
                <View style={styles.contactItem}>
                  <Phone size={11} color={colors.textTertiary} />
                  <Text style={[styles.contactText, { color: colors.textTertiary }]}>
                    {item.phone}
                  </Text>
                </View>
              )}
              {item.email && !item.phone && (
                <View style={styles.contactItem}>
                  <Mail size={11} color={colors.textTertiary} />
                  <Text
                    style={[styles.contactText, { color: colors.textTertiary }]}
                    numberOfLines={1}
                  >
                    {item.email}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Lifetime Value */}
        {item.totalSpent > 0 && (
          <Text style={[styles.ltvText, { color: colors.primary }]}>
            {formatCurrency(item.totalSpent)}
          </Text>
        )}
      </Pressable>
    );
  };

  // Empty State
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIllustration, { backgroundColor: colors.backgroundSecondary }]}>
        <UserPlus size={48} color={colors.textTertiary} strokeWidth={1.5} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Clients Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
        Add your first client to start tracking
      </Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowAddModal(true);
        }}
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
      >
        <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.emptyButtonText}>Add Client</Text>
      </Pressable>
    </View>
  );

  // Add Modal
  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <SafeAreaView style={styles.modalContent}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowAddModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.primary }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Client</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                NAME
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderRadius: radius.md,
                  },
                ]}
                placeholder="Client name"
                placeholderTextColor={colors.textTertiary}
                value={newClientName}
                onChangeText={setNewClientName}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                EMAIL
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderRadius: radius.md,
                  },
                ]}
                placeholder="client@email.com"
                placeholderTextColor={colors.textTertiary}
                value={newClientEmail}
                onChangeText={setNewClientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                PHONE
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderRadius: radius.md,
                  },
                ]}
                placeholder="(555) 123-4567"
                placeholderTextColor={colors.textTertiary}
                value={newClientPhone}
                onChangeText={setNewClientPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.modalButtonContainer}>
            <Button
              title={isSaving ? "Saving..." : "Add Client"}
              onPress={handleAddClient}
              disabled={!newClientName.trim() || isSaving}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.largeTitle, { color: colors.text }]}>Clients</Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
          {clients.length} total • Sorted by value
        </Text>
      </View>

      {/* iOS-style Search Bar */}
      <View style={styles.searchContainer}>
        <Animated.View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.backgroundSecondary,
              borderRadius: radius.lg,
              transform: [{ scale: searchWidthAnim }],
              borderWidth: isSearchFocused ? 1 : 0,
              borderColor: colors.primary + "50",
            },
          ]}
        >
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search clients..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setSearchQuery("");
              }}
              style={[styles.clearButton, { backgroundColor: colors.textTertiary + "30" }]}
            >
              <X size={14} color={colors.textTertiary} strokeWidth={2.5} />
            </Pressable>
          )}
        </Animated.View>
      </View>

      {/* Client List */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          searchQuery ? (
            <View style={styles.noResults}>
              <Text style={[styles.noResultsText, { color: colors.textTertiary }]}>
                No clients found for "{searchQuery}"
              </Text>
            </View>
          ) : clients.length === 0 ? (
            <EmptyState />
          ) : null
        }
      />

      {/* Floating Action Button - Siri Orb Style */}
      <View style={styles.fabContainer}>
        {/* Glow layer */}
        <Animated.View
          style={[
            styles.fabGlow,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: fabGlowAnim }],
            },
          ]}
        />
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            setShowAddModal(true);
          }}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.primary },
            pressed && styles.fabPressed,
          ]}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>

      {renderAddModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: -0.2,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "400",
    padding: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },

  // Client Card
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 6,
    position: "relative",
  },
  topBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  clientInfo: {
    flex: 1,
    marginRight: 8,
  },
  clientName: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contactText: {
    fontSize: 13,
    fontWeight: "400",
  },
  ltvText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"],
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  // No Results
  noResults: {
    alignItems: "center",
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 15,
    fontWeight: "500",
  },

  // FAB
  fabContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fabGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },

  // Modal
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalCancel: {
    fontSize: 17,
    fontWeight: "400",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  form: {
    padding: 24,
    gap: 24,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalButtonContainer: {
    padding: 24,
    marginTop: "auto",
  },
});

```

---

## ./app/(tabs)/index.tsx

```typescript
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Pressable,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { VoiceButton } from "@/components/VoiceButton";
import { RecordingOverlay } from "@/components/RecordingOverlay";
import { AnimatedCurrency } from "@/components/AnimatedNumber";
import { MonogramAvatar } from "@/components/MonogramAvatar";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useTheme } from "@/lib/theme";
import { startRecording, stopRecording } from "@/services/audio";
import { processVoiceToInvoice } from "@/services/ai";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_MARGIN = 20;
const RECENT_CARD_SIZE = 100;

/**
 * Dashboard Screen - iOS Control Center Style
 * Apple Design Award Foundation
 */

export default function Dashboard() {
  const router = useRouter();
  const { isDark, colors, glass, typography, spacing, radius } = useTheme();

  const { stats, isLoading, fetchDashboardStats } = useDashboardStore();
  const { profile, fetchProfile } = useProfileStore();
  const { invoices, fetchInvoices, setPendingInvoice } = useInvoiceStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const recentScrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDashboardStats();
    fetchProfile();
    fetchInvoices();

    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([fetchDashboardStats(), fetchProfile(), fetchInvoices()]);
    setRefreshing(false);
  }, [fetchDashboardStats, fetchProfile, fetchInvoices]);

  // Voice Button Interaction Logic
  const handlePressIn = () => {
    setIsLongPress(false);

    // Start a timer - if held for 300ms, it's a long press
    const timeout = setTimeout(() => {
      setIsLongPress(true);
      startVoiceRecording();
    }, 300);

    setTapTimeout(timeout);
  };

  const handlePressOut = async () => {
    if (tapTimeout) {
      clearTimeout(tapTimeout);
      setTapTimeout(null);
    }

    if (isLongPress && isRecording) {
      // Long press release - stop recording
      await stopVoiceRecording();
    } else if (!isLongPress) {
      // Quick tap - navigate to manual entry
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push("/invoice/create");
    }
  };

  const startVoiceRecording = async () => {
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await startRecording();
  };

  const stopVoiceRecording = async () => {
    setIsRecording(false);
    setIsLongPress(false);
    const audioUri = await stopRecording();

    if (audioUri) {
      try {
        const result = await processVoiceToInvoice(audioUri);
        setPendingInvoice(result.parsedInvoice);
        router.push("/invoice/preview");
      } catch (error) {
        console.error("Error processing voice:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  // Recent invoices (last 5)
  const recentInvoices = invoices.slice(0, 5);
  const overdueCount = stats?.overdueInvoicesCount || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* ═══════════════════════════════════════════════════════════
            REVENUE CARD - Apple Cash Style Hero
        ═══════════════════════════════════════════════════════════ */}
        <Animated.View
          style={[
            styles.revenueCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={isDark
              ? ["#1C1C1E", "#2C2C2E"]
              : ["#FFFFFF", "#F8F9FA"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.revenueCardGradient,
              {
                borderRadius: radius.xxl,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.4 : 0.15,
                shadowRadius: 16,
              },
            ]}
          >
            {/* Card Header */}
            <View style={styles.revenueHeader}>
              <View style={[styles.revenueIconContainer, { backgroundColor: colors.primary + "15" }]}>
                <TrendingUp size={18} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={[styles.revenueLabel, { color: colors.textTertiary }]}>
                Total Revenue
              </Text>
            </View>

            {/* Main Amount - Massive 48pt */}
            <AnimatedCurrency
              cents={stats?.totalRevenue || 0}
              currency={profile?.default_currency || "USD"}
              style={[styles.revenueAmount, { color: colors.text }]}
              duration={1200}
            />

            {/* Status Pills Row */}
            <View style={styles.statusPillsRow}>
              {/* Paid Count */}
              <View style={[styles.statusPill, { backgroundColor: colors.statusPaid + "15" }]}>
                <Text style={[styles.statusPillText, { color: colors.statusPaid }]}>
                  {stats?.paidInvoicesCount || 0} Paid
                </Text>
              </View>

              {/* Overdue Pill - Only show if > 0 */}
              {overdueCount > 0 && (
                <View style={[styles.statusPill, styles.statusPillOverdue, { backgroundColor: colors.statusOverdue + "15" }]}>
                  <AlertCircle size={12} color={colors.statusOverdue} />
                  <Text style={[styles.statusPillText, { color: colors.statusOverdue, marginLeft: 4 }]}>
                    {overdueCount} Overdue
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════
            RECENT ACTIVITY - Horizontal Glass Cards
        ═══════════════════════════════════════════════════════════ */}
        {recentInvoices.length > 0 && (
          <Animated.View style={[styles.recentSection, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Activity
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/invoices")}
                style={styles.seeAllButton}
              >
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </Text>
                <ChevronRight size={16} color={colors.primary} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScrollContent}
              decelerationRate="fast"
              snapToInterval={RECENT_CARD_SIZE + 12}
            >
              {recentInvoices.map((invoice, index) => (
                <Pressable
                  key={invoice.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/invoice/${invoice.id}`);
                  }}
                >
                  <Animated.View
                    style={[
                      styles.recentCard,
                      {
                        backgroundColor: glass.background,
                        borderColor: glass.border,
                        borderRadius: radius.lg,
                      },
                    ]}
                  >
                    {/* Client Avatar */}
                    <MonogramAvatar
                      name={invoice.client_name}
                      size={40}
                      style={{ marginBottom: 8 }}
                    />

                    {/* Amount */}
                    <Text
                      style={[styles.recentAmount, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {formatCurrency(invoice.total, profile?.default_currency)}
                    </Text>

                    {/* Client Name */}
                    <Text
                      style={[styles.recentClient, { color: colors.textTertiary }]}
                      numberOfLines={1}
                    >
                      {invoice.client_name.split(" ")[0]}
                    </Text>

                    {/* Status Indicator */}
                    <View
                      style={[
                        styles.recentStatusDot,
                        {
                          backgroundColor:
                            invoice.status === "paid"
                              ? colors.statusPaid
                              : invoice.status === "overdue"
                              ? colors.statusOverdue
                              : invoice.status === "sent"
                              ? colors.statusSent
                              : colors.statusDraft,
                        },
                      ]}
                    />
                  </Animated.View>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Quick Stats Row */}
        <Animated.View
          style={[
            styles.quickStatsRow,
            { opacity: fadeAnim }
          ]}
        >
          <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {stats?.totalInvoicesCount || 0}
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>
              Invoices
            </Text>
          </View>

          <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {stats?.totalClientsCount || 0}
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>
              Clients
            </Text>
          </View>

          <View style={[styles.quickStatCard, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
            <Text style={[styles.quickStatValue, { color: colors.primary }]}>
              {formatCurrency(stats?.pendingAmount || 0, profile?.default_currency, true)}
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>
              Pending
            </Text>
          </View>
        </Animated.View>

        {/* Bottom spacer for voice button */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════
          INPUT ACTIONS - Siri Orb at Bottom Center
      ═══════════════════════════════════════════════════════════ */}
      <View style={styles.inputActionsContainer}>
        <View style={styles.voiceButtonWrapper}>
          <VoiceButton
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            isRecording={isRecording}
          />
        </View>

        {/* Hint Label */}
        <Text style={[styles.inputHint, { color: colors.textTertiary }]}>
          Hold to Speak  •  Tap to Type
        </Text>
      </View>

      <RecordingOverlay visible={isRecording} duration={recordingDuration} />
    </SafeAreaView>
  );
}

// Helper function
function formatCurrency(cents: number, currency: string = "USD", short: boolean = false): string {
  const value = cents / 100;
  if (short && value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },

  // ═══════════════════════════════════════════════════════════
  // REVENUE CARD
  // ═══════════════════════════════════════════════════════════
  revenueCard: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: 24,
  },
  revenueCardGradient: {
    padding: 24,
    elevation: 12,
  },
  revenueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  revenueIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  revenueLabel: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  revenueAmount: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 56,
    marginBottom: 16,
    fontVariant: ["tabular-nums"],
  },
  statusPillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusPillOverdue: {
    // Additional styling for overdue pill
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.1,
  },

  // ═══════════════════════════════════════════════════════════
  // RECENT ACTIVITY
  // ═══════════════════════════════════════════════════════════
  recentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: CARD_MARGIN,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: "500",
  },
  recentScrollContent: {
    paddingHorizontal: CARD_MARGIN,
    gap: 12,
  },
  recentCard: {
    width: RECENT_CARD_SIZE,
    height: RECENT_CARD_SIZE + 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"],
  },
  recentClient: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  recentStatusDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ═══════════════════════════════════════════════════════════
  // QUICK STATS
  // ═══════════════════════════════════════════════════════════
  quickStatsRow: {
    flexDirection: "row",
    paddingHorizontal: CARD_MARGIN,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 4,
    fontVariant: ["tabular-nums"],
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ═══════════════════════════════════════════════════════════
  // INPUT ACTIONS
  // ═══════════════════════════════════════════════════════════
  inputActionsContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  voiceButtonWrapper: {
    marginBottom: 12,
  },
  inputHint: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
});

```

---

## ./app/(tabs)/invoices.tsx

```typescript
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, FileText, Mic } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useTheme } from "@/lib/theme";
import { Invoice } from "@/types";
import { InvoiceCard } from "@/components/InvoiceCard";
import { RecordingOverlay } from "@/components/RecordingOverlay";
import { startRecording, stopRecording } from "@/services/audio";
import { processVoiceToInvoice } from "@/services/ai";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 120;
const HEADER_MIN_HEIGHT = 60;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

type FilterType = "all" | "unpaid" | "paid";

/**
 * Invoices Screen - Apple Wallet Aesthetic
 * Features:
 * - Collapsing Large Title (iOS Messages style)
 * - Segmented Control filter
 * - Physical ticket card design
 */

export default function InvoicesScreen() {
  const router = useRouter();
  const { colors, isDark, typography, radius } = useTheme();
  const { invoices, isLoading, fetchInvoices, updateInvoice, setPendingInvoice } = useInvoiceStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Scroll animation for collapsing header
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Voice recording handlers
  const handleStartVoiceRecording = async () => {
    setIsRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await startRecording();
  };

  const handleStopVoiceRecording = async () => {
    setIsRecording(false);
    const audioUri = await stopRecording();

    if (audioUri) {
      try {
        const result = await processVoiceToInvoice(audioUri);
        setPendingInvoice(result.parsedInvoice);
        router.push("/invoice/preview");
      } catch (error) {
        console.error("Error processing voice:", error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchInvoices();
    setRefreshing(false);
  }, [fetchInvoices]);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    switch (activeFilter) {
      case "unpaid":
        return inv.status === "draft" || inv.status === "sent" || inv.status === "overdue";
      case "paid":
        return inv.status === "paid";
      default:
        return inv.status !== "void";
    }
  });

  // Sort by date (newest first)
  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Counts for segmented control
  const allCount = invoices.filter((i) => i.status !== "void").length;
  const unpaidCount = invoices.filter(
    (i) => i.status === "draft" || i.status === "sent" || i.status === "overdue"
  ).length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;

  const handleInvoicePress = (invoice: Invoice) => {
    router.push(`/invoice/${invoice.id}`);
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: "paid", paid_at: new Date().toISOString() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleRemind = (invoice: Invoice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Send Reminder",
      `Send a payment reminder to ${invoice.client_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleVoid = (invoice: Invoice) => {
    Alert.alert(
      "Void Invoice",
      `Are you sure you want to void this invoice? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Void Invoice",
          style: "destructive",
          onPress: async () => {
            try {
              await updateInvoice(invoice.id, { status: "void" });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error("Error voiding invoice:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const handleFilterChange = (filter: FilterType) => {
    Haptics.selectionAsync();
    setActiveFilter(filter);
  };

  // Header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.7],
    extrapolate: "clamp",
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -8],
    extrapolate: "clamp",
  });

  const titleTranslateX = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -24],
    extrapolate: "clamp",
  });

  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <InvoiceCard
      invoice={item}
      onPress={() => handleInvoicePress(item)}
      onMarkPaid={() => handleMarkPaid(item)}
      onRemind={() => handleRemind(item)}
      onVoid={() => handleVoid(item)}
    />
  );

  // Empty State Component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      {/* Illustration placeholder - subtle icon */}
      <View style={[styles.emptyIllustration, { backgroundColor: colors.backgroundSecondary }]}>
        <FileText size={48} color={colors.textTertiary} strokeWidth={1.5} />
      </View>

      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Invoices
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
        Tap + to get paid
      </Text>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/invoice/create");
        }}
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
      >
        <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.emptyButtonText}>Create Invoice</Text>
      </Pressable>

      {/* Divider */}
      <View style={styles.emptyDividerContainer}>
        <View style={[styles.emptyDividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.emptyDividerText, { color: colors.textTertiary }]}>or</Text>
        <View style={[styles.emptyDividerLine, { backgroundColor: colors.border }]} />
      </View>

      {/* Speak to Create Button */}
      <Pressable
        onPressIn={handleStartVoiceRecording}
        onPressOut={handleStopVoiceRecording}
        style={({ pressed }) => [
          styles.speakButton,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
          pressed && { backgroundColor: colors.backgroundTertiary },
        ]}
      >
        <View style={[styles.speakButtonIcon, { backgroundColor: colors.primary + "15" }]}>
          <Mic size={20} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.speakButtonTextContainer}>
          <Text style={[styles.speakButtonTitle, { color: colors.text }]}>
            Speak to Create
          </Text>
          <Text style={[styles.speakButtonSubtitle, { color: colors.textTertiary }]}>
            Hold and describe your work
          </Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        {/* ═══════════════════════════════════════════════════════════
            COLLAPSING HEADER
        ═══════════════════════════════════════════════════════════ */}
        <Animated.View style={[styles.header, { height: headerHeight }]}>
          <Animated.View
            style={{
              transform: [
                { scale: titleScale },
                { translateY: titleTranslateY },
                { translateX: titleTranslateX },
              ],
            }}
          >
            <Text style={[styles.largeTitle, { color: colors.text }]}>
              Invoices
            </Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.subtitle,
              { color: colors.textTertiary, opacity: subtitleOpacity },
            ]}
          >
            {allCount} total • {unpaidCount} unpaid
          </Animated.Text>
        </Animated.View>

        {/* ═══════════════════════════════════════════════════════════
            SEGMENTED CONTROL
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.segmentedControlContainer}>
          <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundSecondary }]}>
            {(["all", "unpaid", "paid"] as FilterType[]).map((filter) => {
              const isActive = activeFilter === filter;
              const count = filter === "all" ? allCount : filter === "unpaid" ? unpaidCount : paidCount;

              return (
                <Pressable
                  key={filter}
                  onPress={() => handleFilterChange(filter)}
                  style={[
                    styles.segment,
                    isActive && [styles.segmentActive, { backgroundColor: colors.card }],
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: isActive ? colors.text : colors.textTertiary },
                    ]}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {count > 0 && (
                      <Text style={{ color: colors.textTertiary }}> {count}</Text>
                    )}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════
            INVOICE LIST
        ═══════════════════════════════════════════════════════════ */}
        <FlatList
          data={sortedInvoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoiceItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={EmptyState}
        />

        {/* ═══════════════════════════════════════════════════════════
            FLOATING ACTION BUTTON
        ═══════════════════════════════════════════════════════════ */}
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.primary },
            pressed && styles.fabPressed,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/invoice/create");
          }}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>

        {/* Recording Overlay */}
        <RecordingOverlay visible={isRecording} duration={recordingDuration} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: -0.2,
  },

  // Segmented Control
  segmentedControlContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  segmentActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  emptyDividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  emptyDividerLine: {
    flex: 1,
    height: 1,
  },
  emptyDividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  speakButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    width: "100%",
    maxWidth: 280,
  },
  speakButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  speakButtonTextContainer: {
    flex: 1,
  },
  speakButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  speakButtonSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: -0.1,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
});

```

---

## ./app/(tabs)/profile.tsx

```typescript
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  Alert,
  Switch,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Camera,
  Check,
  Building2,
  Bell,
  Mail,
  MessageSquare,
  CreditCard,
  ChevronRight,
  Settings,
  Clock,
  Edit3,
  Download,
  Cloud,
  CloudOff,
  RefreshCw,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { useProfileStore } from "@/store/useProfileStore";
import { useReminderStore } from "@/store/useReminderStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";

/**
 * Profile Screen
 * Per design-system.md - includes Stripe status and reminder settings
 */

export default function Profile() {
  const router = useRouter();
  const { colors, typography, spacing, radius, isDark } = useTheme();
  const { profile, updateProfile, fetchProfile, isSaving } = useProfileStore();
  const {
    settings: reminderSettings,
    fetchSettings: fetchReminderSettings,
    toggleEnabled,
    toggleSMS,
    toggleEmail,
    setDayIntervals,
    setMessageTemplate,
    isSaving: isSavingReminders,
  } = useReminderStore();
  const {
    isOnline,
    isSyncing,
    pendingUploads,
    pendingOperations,
    syncNow,
    initialize: initOffline,
  } = useOfflineStore();

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [templateText, setTemplateText] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchProfile();
    fetchReminderSettings();
    initOffline();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (reminderSettings?.message_template) {
      setTemplateText(reminderSettings.message_template);
    }
  }, [reminderSettings]);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateProfile({ logo_url: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Your profile has been updated.");
  };

  const handleToggleReminders = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await toggleEnabled();
    } catch (error) {
      Alert.alert("Error", "Failed to update reminder settings");
    }
  };

  const handleToggleSMS = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await toggleSMS();
    } catch (error) {
      Alert.alert("Error", "Failed to update SMS settings");
    }
  };

  const handleToggleEmail = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await toggleEmail();
    } catch (error) {
      Alert.alert("Error", "Failed to update email settings");
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await setMessageTemplate(templateText);
      setEditingTemplate(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to save template");
    }
  };

  const handleDayIntervalToggle = async (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentIntervals = reminderSettings?.day_intervals || [3, 7, 14];
    let newIntervals: number[];

    if (currentIntervals.includes(day)) {
      newIntervals = currentIntervals.filter((d) => d !== day);
    } else {
      newIntervals = [...currentIntervals, day].sort((a, b) => a - b);
    }

    if (newIntervals.length === 0) {
      Alert.alert("Error", "You must have at least one reminder interval");
      return;
    }

    try {
      await setDayIntervals(newIntervals);
    } catch (error) {
      Alert.alert("Error", "Failed to update intervals");
    }
  };

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await syncNow();
      if (result.uploads > 0 || result.operations > 0) {
        Alert.alert(
          "Sync Complete",
          `Synced ${result.uploads} uploads and ${result.operations} operations`
        );
      } else if (result.errors > 0) {
        Alert.alert("Sync Issue", `${result.errors} items failed to sync`);
      } else {
        Alert.alert("All Synced", "Everything is up to date");
      }
    } catch (error) {
      Alert.alert("Sync Failed", "Failed to sync data");
    }
  };

  const stripeConnected = profile?.charges_enabled && profile?.payouts_enabled;
  const totalPending = pendingUploads + pendingOperations;

  const styles = createStyles(colors, isDark, spacing, radius, typography);

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    multiline = false,
    autoCapitalize = "sentences",
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: "default" | "email-address" | "phone-pad" | "decimal-pad";
    multiline?: boolean;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );

  const SettingRow = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Pressable
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[typography.body, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[typography.caption1, { color: colors.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Business information</Text>
        </Animated.View>

        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable onPress={pickImage} style={styles.logoContainer}>
            {profile?.logo_url ? (
              <Image source={{ uri: profile.logo_url }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Building2 size={32} color={colors.textTertiary} />
              </View>
            )}
            <View style={styles.cameraButton}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text style={styles.logoHint}>Tap to add logo</Text>
        </Animated.View>

        {/* Business Info Form */}
        <Animated.View
          style={[
            styles.formSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <InputField
            label="Business Name"
            value={profile?.business_name || ""}
            onChangeText={(text) => updateProfile({ business_name: text })}
            placeholder="Your Business Name"
            autoCapitalize="words"
          />

          <InputField
            label="Owner Name"
            value={profile?.full_name || ""}
            onChangeText={(text) => updateProfile({ full_name: text })}
            placeholder="Your Full Name"
            autoCapitalize="words"
          />

          <InputField
            label="Tax Rate (%)"
            value={profile?.tax_rate?.toString() || "0"}
            onChangeText={(text) => updateProfile({ tax_rate: parseFloat(text) || 0 })}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </Animated.View>

        {/* Stripe Connect Section */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Payments</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon={<CreditCard size={20} color={colors.primary} />}
              title="Stripe Connect"
              subtitle={
                stripeConnected
                  ? "Connected - accepting payments"
                  : "Connect to accept card payments"
              }
              rightElement={
                stripeConnected ? (
                  <View style={[styles.badge, { backgroundColor: colors.statusPaid + "20" }]}>
                    <Text style={[typography.caption2, { color: colors.statusPaid, fontWeight: "600" }]}>
                      Active
                    </Text>
                  </View>
                ) : (
                  <ChevronRight size={20} color={colors.textTertiary} />
                )
              }
              onPress={() => router.push("/stripe/onboarding")}
            />
          </View>
        </Animated.View>

        {/* Auto-Reminders Section ("Bad Cop") */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Auto-Reminders</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon={<Bell size={20} color={colors.primary} />}
              title="Enable Auto-Reminders"
              subtitle="Automatically remind clients about overdue invoices"
              rightElement={
                <Switch
                  value={reminderSettings?.enabled || false}
                  onValueChange={handleToggleReminders}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              }
            />

            {reminderSettings?.enabled && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <SettingRow
                  icon={<MessageSquare size={20} color={colors.primary} />}
                  title="SMS Reminders"
                  subtitle="Send text message reminders"
                  rightElement={
                    <Switch
                      value={reminderSettings?.sms_enabled || false}
                      onValueChange={handleToggleSMS}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  }
                />

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <SettingRow
                  icon={<Mail size={20} color={colors.primary} />}
                  title="Email Reminders"
                  subtitle="Send email reminders"
                  rightElement={
                    <Switch
                      value={reminderSettings?.email_enabled || false}
                      onValueChange={handleToggleEmail}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  }
                />

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <SettingRow
                  icon={<Clock size={20} color={colors.primary} />}
                  title="Reminder Schedule"
                  subtitle="Configure when reminders are sent"
                  rightElement={<ChevronRight size={20} color={colors.textTertiary} />}
                  onPress={() => setShowReminderModal(true)}
                />

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <SettingRow
                  icon={<Edit3 size={20} color={colors.primary} />}
                  title="Message Template"
                  subtitle="Customize reminder message"
                  rightElement={<ChevronRight size={20} color={colors.textTertiary} />}
                  onPress={() => setEditingTemplate(true)}
                />
              </>
            )}
          </View>
        </Animated.View>

        {/* Data & Sync Section */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Data & Sync</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon={
                isOnline ? (
                  <Cloud size={20} color={colors.primary} />
                ) : (
                  <CloudOff size={20} color={colors.statusOverdue} />
                )
              }
              title={isOnline ? "Online" : "Offline"}
              subtitle={
                totalPending > 0
                  ? `${totalPending} item${totalPending !== 1 ? "s" : ""} pending sync`
                  : "All data synced"
              }
              rightElement={
                isOnline && totalPending > 0 ? (
                  <Pressable
                    style={[styles.syncButton, { backgroundColor: colors.primary }]}
                    onPress={handleSync}
                    disabled={isSyncing}
                  >
                    <RefreshCw
                      size={14}
                      color="#FFFFFF"
                      style={isSyncing ? { opacity: 0.5 } : undefined}
                    />
                    <Text style={styles.syncButtonText}>
                      {isSyncing ? "Syncing" : "Sync"}
                    </Text>
                  </Pressable>
                ) : (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isOnline
                          ? colors.statusPaid + "20"
                          : colors.statusOverdue + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption2,
                        {
                          color: isOnline ? colors.statusPaid : colors.statusOverdue,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {isOnline ? "Synced" : "Offline"}
                    </Text>
                  </View>
                )
              }
            />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <SettingRow
              icon={<Download size={20} color={colors.primary} />}
              title="Export Data"
              subtitle="Export invoices for QuickBooks"
              rightElement={<ChevronRight size={20} color={colors.textTertiary} />}
              onPress={() => router.push("/export")}
            />
          </View>
        </Animated.View>

        {/* Save Button */}
        <Animated.View style={[styles.saveButtonContainer, { opacity: fadeAnim }]}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
          >
            <Check size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save Profile"}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Reminder Schedule Modal */}
      <Modal
        visible={showReminderModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReminderModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowReminderModal(false)}>
              <Text style={[typography.body, { color: colors.primary }]}>Close</Text>
            </Pressable>
            <Text style={[typography.headline, { color: colors.text }]}>Reminder Schedule</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.modalContent}>
            <Text style={[typography.footnote, { color: colors.textSecondary, marginBottom: spacing.md }]}>
              Send reminders on these days after the due date:
            </Text>

            {[3, 7, 14, 21, 30].map((day) => (
              <Pressable
                key={day}
                style={[
                  styles.dayOption,
                  {
                    backgroundColor: (reminderSettings?.day_intervals || []).includes(day)
                      ? colors.primary + "15"
                      : colors.backgroundSecondary,
                    borderRadius: radius.md,
                  },
                ]}
                onPress={() => handleDayIntervalToggle(day)}
              >
                <Text style={[typography.body, { color: colors.text }]}>
                  {day} days overdue
                </Text>
                {(reminderSettings?.day_intervals || []).includes(day) && (
                  <Check size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}

            <Text style={[typography.caption1, { color: colors.textTertiary, marginTop: spacing.lg }]}>
              Reminders are sent automatically at 9 AM in your timezone
            </Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Message Template Modal */}
      <Modal
        visible={editingTemplate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingTemplate(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setEditingTemplate(false)}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Text style={[typography.headline, { color: colors.text }]}>Message Template</Text>
            <Pressable onPress={handleSaveTemplate}>
              <Text style={[typography.body, { color: colors.primary, fontWeight: "600" }]}>
                Save
              </Text>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Text style={[typography.footnote, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              Available variables:
            </Text>
            <Text style={[typography.caption1, { color: colors.textTertiary, marginBottom: spacing.md }]}>
              {"{{invoice_number}}, {{business_name}}, {{total}}, {{days_overdue}}, {{payment_link}}"}
            </Text>

            <TextInput
              style={[
                styles.templateInput,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderRadius: radius.md,
                },
              ]}
              value={templateText}
              onChangeText={setTemplateText}
              multiline
              numberOfLines={6}
              placeholder="Enter your reminder message template..."
              placeholderTextColor={colors.textTertiary}
            />

            <View style={[styles.previewCard, { backgroundColor: colors.card, borderRadius: radius.md }]}>
              <Text style={[typography.caption1, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Preview:
              </Text>
              <Text style={[typography.footnote, { color: colors.text, lineHeight: 20 }]}>
                {templateText
                  .replace(/\{\{invoice_number\}\}/g, "INV-0042")
                  .replace(/\{\{business_name\}\}/g, profile?.business_name || "Your Business")
                  .replace(/\{\{total\}\}/g, "$1,250")
                  .replace(/\{\{days_overdue\}\}/g, "7")
                  .replace(/\{\{payment_link\}\}/g, "https://pay.stripe.com/...")}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean, spacing: any, radius: any, typography: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 120,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.largeTitle,
      color: colors.text,
    },
    subtitle: {
      ...typography.subhead,
      color: colors.textTertiary,
      marginTop: spacing.xs,
    },
    logoSection: {
      alignItems: "center",
      paddingVertical: spacing.lg,
    },
    logoContainer: {
      position: "relative",
    },
    logoImage: {
      width: 100,
      height: 100,
      borderRadius: radius.xl,
    },
    logoPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: radius.xl,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    cameraButton: {
      position: "absolute",
      bottom: -4,
      right: -4,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    logoHint: {
      ...typography.caption1,
      color: colors.textTertiary,
      marginTop: spacing.sm,
    },
    formSection: {
      paddingHorizontal: spacing.lg,
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    inputLabel: {
      ...typography.caption1,
      color: colors.textTertiary,
      marginBottom: spacing.sm,
      fontWeight: "500",
    },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      ...typography.body,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    section: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.lg,
    },
    sectionTitle: {
      ...typography.footnote,
      color: colors.textTertiary,
      fontWeight: "600",
      marginBottom: spacing.sm,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    settingsCard: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      overflow: "hidden",
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    settingContent: {
      flex: 1,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    syncButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 4,
    },
    syncButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "600",
    },
    divider: {
      height: 1,
      marginLeft: 56,
    },
    saveButtonContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.full,
      gap: spacing.sm,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    saveButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    saveButtonText: {
      ...typography.headline,
      color: "#FFFFFF",
    },
    // Modal Styles
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    modalContent: {
      padding: spacing.lg,
    },
    dayOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    templateInput: {
      padding: spacing.md,
      minHeight: 150,
      textAlignVertical: "top",
      ...typography.body,
    },
    previewCard: {
      padding: spacing.md,
      marginTop: spacing.md,
    },
  });

```

---

## ./app/+not-found.tsx

```typescript
import { View, Text } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFound() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-6xl mb-4">🔍</Text>
      <Text className="text-2xl font-bold mb-2">Page Not Found</Text>
      <Text className="text-gray-500 text-center mb-6">
        The page you're looking for doesn't exist.
      </Text>
      <Link href="/" className="text-primary font-semibold text-lg">
        Go to Dashboard
      </Link>
    </SafeAreaView>
  );
}

```

---

## ./app/export.tsx

```typescript
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "@/lib/theme";
import {
  exportAndShareInvoices,
  getDateRangePresets,
  getStatusOptions,
  ExportFormat,
} from "@/services/export";

export default function ExportScreen() {
  const { colors } = useTheme();
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState("all_time");
  const [status, setStatus] = useState("");
  const [includeItems, setIncludeItems] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const datePresets = getDateRangePresets();
  const statusOptions = getStatusOptions();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const preset = datePresets.find((p) => p.value === dateRange);
      const range = preset?.getRange() || { startDate: "", endDate: "" };

      const result = await exportAndShareInvoices({
        format,
        startDate: range.startDate || undefined,
        endDate: range.endDate || undefined,
        status: status as any || undefined,
        includeItems,
      });

      if (result.success) {
        Alert.alert(
          "Export Complete",
          `Your invoices have been exported to ${result.filename}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Export Failed", result.error || "Failed to export invoices");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred during export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Export Data
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Format Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Export Format
          </Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              style={[
                styles.formatOption,
                {
                  backgroundColor: format === "csv" ? colors.primary : colors.surface,
                  borderColor: format === "csv" ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFormat("csv")}
            >
              <Ionicons
                name="document-text"
                size={24}
                color={format === "csv" ? "white" : colors.text}
              />
              <Text
                style={[
                  styles.formatLabel,
                  { color: format === "csv" ? "white" : colors.text },
                ]}
              >
                CSV
              </Text>
              <Text
                style={[
                  styles.formatDescription,
                  { color: format === "csv" ? "rgba(255,255,255,0.7)" : colors.textSecondary },
                ]}
              >
                Excel, Sheets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.formatOption,
                {
                  backgroundColor: format === "iif" ? colors.primary : colors.surface,
                  borderColor: format === "iif" ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFormat("iif")}
            >
              <Ionicons
                name="calculator"
                size={24}
                color={format === "iif" ? "white" : colors.text}
              />
              <Text
                style={[
                  styles.formatLabel,
                  { color: format === "iif" ? "white" : colors.text },
                ]}
              >
                IIF
              </Text>
              <Text
                style={[
                  styles.formatDescription,
                  { color: format === "iif" ? "rgba(255,255,255,0.7)" : colors.textSecondary },
                ]}
              >
                QuickBooks
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Date Range
          </Text>
          <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {datePresets.map((preset) => (
              <TouchableOpacity
                key={preset.value}
                style={[
                  styles.pickerOption,
                  {
                    backgroundColor: dateRange === preset.value ? colors.primary + "15" : "transparent",
                    borderColor: dateRange === preset.value ? colors.primary : "transparent",
                  },
                ]}
                onPress={() => setDateRange(preset.value)}
              >
                {dateRange === preset.value && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
                <Text
                  style={[
                    styles.pickerLabel,
                    {
                      color: dateRange === preset.value ? colors.primary : colors.text,
                      fontWeight: dateRange === preset.value ? "600" : "400",
                    },
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status Filter */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Invoice Status
          </Text>
          <View style={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerOption,
                  {
                    backgroundColor: status === option.value ? colors.primary + "15" : "transparent",
                    borderColor: status === option.value ? colors.primary : "transparent",
                  },
                ]}
                onPress={() => setStatus(option.value)}
              >
                {status === option.value && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
                <Text
                  style={[
                    styles.pickerLabel,
                    {
                      color: status === option.value ? colors.primary : colors.text,
                      fontWeight: status === option.value ? "600" : "400",
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Include Line Items */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.toggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setIncludeItems(!includeItems)}
          >
            <View style={styles.toggleContent}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                Include Line Items
              </Text>
              <Text style={[styles.toggleDescription, { color: colors.textSecondary }]}>
                Export each invoice item as a separate row
              </Text>
            </View>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: includeItems ? colors.primary : "transparent",
                  borderColor: includeItems ? colors.primary : colors.border,
                },
              ]}
            >
              {includeItems && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              QuickBooks Import
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              To import into QuickBooks Desktop, use the IIF format.{"\n"}
              For QuickBooks Online, use CSV and import via the Banking menu.
            </Text>
          </View>
        </View>

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Export Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.primary }]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="download" size={20} color="white" />
              <Text style={styles.exportButtonText}>Export Invoices</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  formatOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  formatDescription: {
    fontSize: 13,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderRadius: 0,
    marginHorizontal: -1,
  },
  pickerLabel: {
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  toggleDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  exportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

```

---

## ./app/index.tsx

```typescript
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(tabs)" />;
}

```

---

## ./app/invoice/[id].tsx

```typescript
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import {
  ArrowLeft,
  Share2,
  FileText,
  MessageSquare,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useTheme, getStatusColor } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useProfileStore } from "@/store/useProfileStore";
import { Invoice, formatCurrency, formatRelativeDate } from "@/types";
import { sendInvoice, generateInvoicePDF } from "@/services/invoice";
import { getPaymentLink } from "@/services/stripe";
import * as db from "@/services/database";

/**
 * Invoice Detail Screen - Elastic Parallax
 *
 * Features:
 * - Elastic pull-down with scaling avatar/badge
 * - Collapsing header with sticky nav title
 * - Haptic snaps on pull threshold
 * - Physical rubber sheet feel
 */

// Scroll thresholds
const PULL_THRESHOLD = -60; // Pull-down distance for haptic snap
const TITLE_FADE_START = 20;
const TITLE_FADE_END = 80;

export default function InvoiceDetail() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, spacing, radius, shadows, isDark } = useTheme();
  const { invoices, fetchInvoice, updateInvoice } = useInvoiceStore();
  const { profile } = useProfileStore();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const hasTriggeredHaptic = useRef(false);

  // Update navigation title based on scroll
  useEffect(() => {
    if (invoice) {
      const listenerId = scrollY.addListener(({ value }) => {
        // Show/hide navigation title based on scroll
        if (value > TITLE_FADE_END) {
          navigation.setOptions({
            headerShown: true,
            headerTransparent: true,
            headerTitle: invoice.client_name,
            headerTitleStyle: {
              ...typography.headline,
              color: colors.text,
            },
            headerBackground: () => (
              <Animated.View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  opacity: 0.95,
                }}
              />
            ),
          });
        } else {
          navigation.setOptions({
            headerShown: false,
          });
        }
      });

      return () => {
        scrollY.removeListener(listenerId);
      };
    }
  }, [invoice, colors, typography]);

  // Handle scroll for haptic snap
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;

      // Haptic snap when pulling down past threshold
      if (y < PULL_THRESHOLD && !hasTriggeredHaptic.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        hasTriggeredHaptic.current = true;
      } else if (y > PULL_THRESHOLD) {
        hasTriggeredHaptic.current = false;
      }
    },
    []
  );

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    setIsLoading(true);
    try {
      // Try to get from store first
      let inv = invoices.find((i) => i.id === id);

      if (!inv && id) {
        // Fetch from database
        inv = await db.getInvoice(id);
      }

      if (inv) {
        setInvoice(inv);
        // Fetch invoice items
        const items = await db.getInvoiceItems(inv.id);
        setInvoiceItems(items || []);
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setIsLoading(false);
    }
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

  if (!invoice) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Invoice not found
          </Text>
          <Button title="Go Back" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColor(invoice.status, colors);

  // Elastic scaling for pull-down (y < 0)
  const elasticScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [1.4, 1],
    extrapolate: "clamp",
  });

  // Large title fade out on scroll-up
  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [TITLE_FADE_START, TITLE_FADE_END],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Header translation for parallax effect
  const headerTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [50, 0, -30],
    extrapolate: "clamp",
  });

  const handleSendInvoice = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Send via SMS", "Send via WhatsApp", "Send via Email", "Share..."],
          cancelButtonIndex: 0,
          title: "How would you like to send this invoice?",
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) return;

          const shareMethod = ["", "sms", "whatsapp", "email", "native"][buttonIndex] as any;
          await performSendInvoice(shareMethod);
        }
      );
    } else {
      // Android - show custom modal or direct share
      Alert.alert(
        "Send Invoice",
        "How would you like to send this invoice?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "SMS", onPress: () => performSendInvoice("sms") },
          { text: "WhatsApp", onPress: () => performSendInvoice("whatsapp") },
          { text: "Email", onPress: () => performSendInvoice("email") },
          { text: "Share...", onPress: () => performSendInvoice("native") },
        ]
      );
    }
  };

  const performSendInvoice = async (shareMethod: "sms" | "whatsapp" | "email" | "native") => {
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await sendInvoice(invoice, {
        includePaymentLink: true,
        shareMethod,
      });

      if (result.success) {
        // Update invoice status to 'sent' if it was draft
        if (invoice.status === "draft") {
          await updateInvoice(invoice.id, { status: "sent" });
          setInvoice({ ...invoice, status: "sent" });
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Error", result.error || "Failed to send invoice");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error: any) {
      console.error("Error sending invoice:", error);
      Alert.alert("Error", error.message || "Failed to send invoice");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsPaid = () => {
    Alert.alert(
      "Mark as Paid",
      "Are you sure you want to mark this invoice as paid?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Paid",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await updateInvoice(invoice.id, {
              status: "paid",
              paid_at: new Date().toISOString(),
            });
            setInvoice({ ...invoice, status: "paid", paid_at: new Date().toISOString() });
          },
        },
      ]
    );
  };

  const handleViewPDF = async () => {
    setIsGeneratingPDF(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await generateInvoicePDF(invoice.id);
      if (result?.pdfUrl) {
        await Linking.openURL(result.pdfUrl);
      } else {
        Alert.alert("Error", "Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleViewPaymentLink = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (invoice.stripe_hosted_invoice_url) {
        await Linking.openURL(invoice.stripe_hosted_invoice_url);
      } else {
        const result = await getPaymentLink(invoice.id);
        if (result?.url) {
          await Linking.openURL(result.url);
        }
      }
    } catch (error) {
      console.error("Error opening payment link:", error);
      Alert.alert("Error", "Failed to open payment link");
    }
  };

  const handleMoreOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "View PDF", "Copy Payment Link", "Void Invoice"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        async (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              await handleViewPDF();
              break;
            case 2:
              // Copy payment link
              break;
            case 3:
              handleVoidInvoice();
              break;
          }
        }
      );
    }
  };

  const handleVoidInvoice = () => {
    Alert.alert(
      "Void Invoice",
      "Are you sure you want to void this invoice? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Void Invoice",
          style: "destructive",
          onPress: async () => {
            await updateInvoice(invoice.id, { status: "void" });
            setInvoice({ ...invoice, status: "void" });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = () => {
    switch (invoice.status) {
      case "paid":
        return <CheckCircle size={20} color={statusColors.text} />;
      case "overdue":
        return <AlertCircle size={20} color={statusColors.text} />;
      default:
        return <Clock size={20} color={statusColors.text} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Animated.Text
          style={[
            typography.headline,
            {
              color: colors.text,
              opacity: scrollY.interpolate({
                inputRange: [TITLE_FADE_START, TITLE_FADE_END + 20],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
            },
          ]}
        >
          {invoice.invoice_number}
        </Animated.Text>
        <Pressable onPress={handleMoreOptions} style={styles.headerButton}>
          <MoreHorizontal size={24} color={colors.text} />
        </Pressable>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: handleScroll,
          }
        )}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* ═══════════════════════════════════════════════════════════
            ELASTIC HEADER - Scales on pull-down
        ═══════════════════════════════════════════════════════════ */}
        <Animated.View
          style={[
            styles.elasticHeader,
            {
              transform: [
                { scale: elasticScale },
                { translateY: headerTranslateY },
              ],
            },
          ]}
        >
          {/* Client Avatar */}
          <Animated.View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[typography.title2, { color: colors.primary }]}>
              {invoice.client_name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </Animated.View>

          {/* Client Name - Fades on scroll */}
          <Animated.Text
            style={[
              typography.title1,
              {
                color: colors.text,
                marginTop: spacing.md,
                opacity: largeTitleOpacity,
              },
            ]}
          >
            {invoice.client_name}
          </Animated.Text>

          {/* Status Badge */}
          <Animated.View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusColors.background,
                marginTop: spacing.sm,
              },
            ]}
          >
            {getStatusIcon()}
            <Text
              style={[
                typography.footnote,
                { color: statusColors.text, fontWeight: "600", marginLeft: 6 },
              ]}
            >
              {invoice.status.toUpperCase()}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Invoice Number (visible when large title fades) */}
        <Animated.Text
          style={[
            typography.caption1,
            {
              color: colors.textTertiary,
              textAlign: "center",
              marginTop: spacing.sm,
              opacity: largeTitleOpacity,
            },
          ]}
        >
          {invoice.invoice_number}
        </Animated.Text>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateItem}>
            <Text style={[typography.caption1, { color: colors.textTertiary }]}>
              Created
            </Text>
            <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
              {formatDate(invoice.created_at)}
            </Text>
          </View>
          {invoice.due_date && (
            <View style={[styles.dateItem, { alignItems: "flex-end" }]}>
              <Text style={[typography.caption1, { color: colors.textTertiary }]}>
                Due Date
              </Text>
              <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                {formatDate(invoice.due_date)}
              </Text>
            </View>
          )}
        </View>

        {/* Line Items */}
        <View
          style={[
            styles.itemsCard,
            { backgroundColor: colors.card, borderRadius: radius.lg, ...shadows.default },
          ]}
        >
          <Text
            style={[
              typography.footnote,
              { color: colors.textTertiary, fontWeight: "500", marginBottom: spacing.md },
            ]}
          >
            Items
          </Text>
          {invoiceItems.map((item, index) => (
            <View
              key={item.id || index}
              style={[
                styles.itemRow,
                index < invoiceItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.itemContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                  {item.description}
                </Text>
                <Text style={[typography.caption1, { color: colors.textTertiary }]}>
                  Qty: {item.quantity} × {formatCurrency(item.unit_price, invoice.currency)}
                </Text>
              </View>
              <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>
                {formatCurrency(item.total, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View
          style={[
            styles.totalsCard,
            { backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg },
          ]}
        >
          <View style={styles.totalRow}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
              {formatCurrency(invoice.subtotal, invoice.currency)}
            </Text>
          </View>
          {invoice.tax_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Tax ({profile?.tax_rate || 0}%)
              </Text>
              <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                {formatCurrency(invoice.tax_amount, invoice.currency)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal, { borderTopColor: colors.border }]}>
            <Text style={[typography.headline, { color: colors.text }]}>Total</Text>
            <Text style={[typography.title2, { color: colors.primary }]}>
              {formatCurrency(invoice.total, invoice.currency)}
            </Text>
          </View>
        </View>

        {/* Payment Link Card (if available) */}
        {invoice.stripe_hosted_invoice_url && invoice.status !== "paid" && (
          <Pressable
            onPress={handleViewPaymentLink}
            style={[
              styles.paymentLinkCard,
              { backgroundColor: colors.primary + "10", borderRadius: radius.md },
            ]}
          >
            <CreditCard size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[typography.footnote, { color: colors.primary, fontWeight: "600" }]}>
                Payment Link Ready
              </Text>
              <Text style={[typography.caption1, { color: colors.textSecondary }]}>
                Tap to view or share with client
              </Text>
            </View>
            <ExternalLink size={18} color={colors.primary} />
          </Pressable>
        )}

        {/* From (Business Info) */}
        {profile?.business_name && (
          <View style={[styles.fromSection, { borderTopColor: colors.border }]}>
            <Text style={[typography.caption1, { color: colors.textTertiary, marginBottom: 4 }]}>
              From
            </Text>
            <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
              {profile.business_name}
            </Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { borderTopColor: colors.border }]}>
        {invoice.status === "draft" && (
          <Button
            title={isSending ? "Sending..." : "Send Invoice"}
            onPress={handleSendInvoice}
            disabled={isSending}
          />
        )}

        {invoice.status === "sent" && (
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleSendInvoice}
              style={[styles.secondaryAction, { backgroundColor: colors.backgroundSecondary }]}
            >
              <Share2 size={20} color={colors.text} />
              <Text style={[typography.footnote, { color: colors.text, marginLeft: 6 }]}>
                Resend
              </Text>
            </Pressable>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Button title="Mark as Paid" onPress={handleMarkAsPaid} />
            </View>
          </View>
        )}

        {invoice.status === "overdue" && (
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleSendInvoice}
              style={[styles.secondaryAction, { backgroundColor: colors.statusOverdue + "20" }]}
            >
              <MessageSquare size={20} color={colors.statusOverdue} />
              <Text style={[typography.footnote, { color: colors.statusOverdue, marginLeft: 6 }]}>
                Remind
              </Text>
            </Pressable>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Button title="Mark as Paid" onPress={handleMarkAsPaid} />
            </View>
          </View>
        )}

        {invoice.status === "paid" && (
          <View style={[styles.paidBanner, { backgroundColor: colors.statusPaid + "15" }]}>
            <CheckCircle size={20} color={colors.statusPaid} />
            <Text style={[typography.body, { color: colors.statusPaid, marginLeft: spacing.sm }]}>
              Paid on {invoice.paid_at ? formatDate(invoice.paid_at) : "N/A"}
            </Text>
          </View>
        )}

        {invoice.status === "void" && (
          <View style={[styles.paidBanner, { backgroundColor: colors.textTertiary + "15" }]}>
            <Text style={[typography.body, { color: colors.textTertiary }]}>
              This invoice has been voided
            </Text>
          </View>
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0,
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
    marginHorizontal: -8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  elasticHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 24,
  },
  dateItem: {},
  itemsCard: {
    padding: 16,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  totalsCard: {
    padding: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  grandTotal: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 16,
  },
  paymentLinkCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
  },
  fromSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    marginTop: 8,
  },
  bottomActions: {
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  paidBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
});

```

---

## ./app/invoice/create.tsx

```typescript
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  X,
  UserPlus,
  ArrowRight,
} from "lucide-react-native";
import * as Contacts from "expo-contacts";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { MonogramAvatar } from "@/components/MonogramAvatar";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { AutoResizingInput } from "@/components/ui/AutoResizingInput";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Quick Invoice Creation - Venmo/iMessage Style
 * Speed is the priority. Feels like sending money.
 */

interface SelectedContact {
  name: string;
  phone?: string;
  email?: string;
}

// Quick-Term Due Date Options
type DueTerm = "immediate" | "net7" | "net15" | "net30";

const DUE_TERM_OPTIONS: { key: DueTerm; label: string; days: number }[] = [
  { key: "immediate", label: "Immediate", days: 0 },
  { key: "net7", label: "Net 7", days: 7 },
  { key: "net15", label: "Net 15", days: 15 },
  { key: "net30", label: "Net 30", days: 30 },
];

const getDueDateFromTerm = (term: DueTerm): Date => {
  const option = DUE_TERM_OPTIONS.find((o) => o.key === term);
  const date = new Date();
  date.setDate(date.getDate() + (option?.days ?? 0));
  return date;
};

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const { colors, glass, typography, spacing, radius } = useTheme();
  const { setPendingInvoice } = useInvoiceStore();

  // Form State
  const [selectedContact, setSelectedContact] = useState<SelectedContact | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueTerm, setDueTerm] = useState<DueTerm>("immediate");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Refs
  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  // Animations
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0.8)).current;

  // Derived state
  const isValid = selectedContact && amount && parseFloat(amount) > 0 && description.trim().length > 0;

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardWillHide", () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // FAB Animation - slide up when valid
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (isValid) {
      Animated.parallel([
        Animated.spring(fabAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.spring(fabScale, {
          toValue: 1,
          damping: 12,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fabAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isValid]);

  // Handle contact selection
  const handlePickContact = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      // Fallback: just focus the amount input for manual entry
      amountInputRef.current?.focus();
      return;
    }

    // Open native contact picker
    const contact = await Contacts.presentContactPickerAsync();

    if (contact) {
      const phone = contact.phoneNumbers?.[0]?.number;
      const email = contact.emails?.[0]?.email;

      setSelectedContact({
        name: contact.name || "Unknown",
        phone,
        email,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Auto-focus amount input after selection
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 300);
    }
  };

  // Handle amount change - format as currency
  const handleAmountChange = (text: string) => {
    // Remove non-numeric characters except decimal
    const cleaned = text.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = cleaned.split(".");
    if (parts.length > 2) return;

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) return;

    setAmount(cleaned);
  };

  // Handle send
  const handleSend = () => {
    if (!isValid || !selectedContact) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const dueDate = getDueDateFromTerm(dueTerm);

    setPendingInvoice({
      clientName: selectedContact.name,
      clientPhone: selectedContact.phone,
      clientEmail: selectedContact.email,
      items: [
        {
          description: description.trim(),
          price: Math.round(parseFloat(amount) * 100), // Convert to cents
          quantity: 1,
          originalTranscriptSegment: "Manual Entry",
        },
      ],
      detectedLanguage: "en",
      confidence: 1.0,
      notes: "Quick Invoice",
      dueDate: dueDate.toISOString(),
    });

    router.push("/invoice/preview");
  };

  // Close screen
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Dismiss keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
          {/* ═══════════════════════════════════════════════════════════
              HEADER
          ═══════════════════════════════════════════════════════════ */}
          <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={12}>
            <X size={24} color={colors.text} strokeWidth={2} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Invoice</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ═══════════════════════════════════════════════════════════
            THE "WHO" - Contact Selection
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.whoSection}>
          {!selectedContact ? (
            <Pressable onPress={handlePickContact} style={styles.addClientButton}>
              <View
                style={[
                  styles.addClientCircle,
                  {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + "08",
                  },
                ]}
              >
                <UserPlus size={32} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={[styles.addClientText, { color: colors.primary }]}>
                Add Client
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={handlePickContact} style={styles.selectedClientContainer}>
              <MonogramAvatar name={selectedContact.name} size={72} />
              <Text style={[styles.selectedClientName, { color: colors.text }]}>
                {selectedContact.name}
              </Text>
              <View style={[styles.changeClientBadge, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.changeClientText, { color: colors.primary }]}>
                  Change
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* ═══════════════════════════════════════════════════════════
            THE "HOW MUCH" - Premium Calculator Amount Input
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.amountSection}>
          <AutoResizingInput
            ref={amountInputRef}
            value={amount}
            onChangeText={handleAmountChange}
            currencySymbol="$"
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            returnKeyType="next"
            onSubmitEditing={() => descriptionInputRef.current?.focus()}
            maxLength={10}
          />

          {/* Subtle underline */}
          <View style={[styles.amountUnderline, { backgroundColor: colors.border }]} />
        </View>

        {/* ═══════════════════════════════════════════════════════════
            THE "WHAT" - Description Input
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.whatSection}>
          <TextInput
            ref={descriptionInputRef}
            style={[styles.descriptionInput, { color: colors.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="What is this for?"
            placeholderTextColor={colors.textTertiary}
            returnKeyType="done"
            onSubmitEditing={() => {
              Keyboard.dismiss();
              if (isValid) handleSend();
            }}
            maxLength={100}
            selectionColor={colors.primary}
          />
        </View>

        {/* ═══════════════════════════════════════════════════════════
            THE "WHEN" - Quick-Term Due Date Selector
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.dueDateSection}>
          <Text style={[styles.dueDateLabel, { color: colors.textTertiary }]}>
            Due Date
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dueTermScrollContent}
          >
            {DUE_TERM_OPTIONS.map((option) => {
              const isActive = dueTerm === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDueTerm(option.key);
                  }}
                  style={[
                    styles.dueTermChip,
                    isActive
                      ? [
                          styles.dueTermChipActive,
                          { backgroundColor: colors.primary },
                        ]
                      : { backgroundColor: colors.backgroundSecondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.dueTermText,
                      isActive
                        ? styles.dueTermTextActive
                        : { color: colors.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* ═══════════════════════════════════════════════════════════
            QUICK SUGGESTIONS (Optional UX Enhancement)
        ═══════════════════════════════════════════════════════════ */}
        {!description && selectedContact && (
          <View style={styles.suggestionsRow}>
            {["Repair Work", "Installation", "Consultation", "Materials"].map((suggestion) => (
              <Pressable
                key={suggestion}
                onPress={() => {
                  Haptics.selectionAsync();
                  setDescription(suggestion);
                }}
                style={[styles.suggestionChip, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                  {suggestion}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* ═══════════════════════════════════════════════════════════
          THE "SEND" FAB - Slides up when valid
      ═══════════════════════════════════════════════════════════ */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fabAnim,
            transform: [
              {
                translateY: fabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
              { scale: fabScale },
            ],
            bottom: isKeyboardVisible ? 20 : 40,
          },
        ]}
        pointerEvents={isValid ? "auto" : "none"}
      >
        <Pressable
          onPress={handleSend}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.primary },
            pressed && styles.fabPressed,
          ]}
        >
          <ArrowRight size={28} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>

        <Text style={[styles.fabLabel, { color: colors.textTertiary }]}>
          Preview Invoice
        </Text>
      </Animated.View>
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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },

  // Who Section - Contact Selection
  whoSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  addClientButton: {
    alignItems: "center",
  },
  addClientCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  addClientText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  selectedClientContainer: {
    alignItems: "center",
  },
  selectedClientName: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginTop: 12,
    marginBottom: 8,
  },
  changeClientBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  changeClientText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Amount Section
  amountSection: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  amountUnderline: {
    width: 120,
    height: 2,
    marginTop: 8,
    borderRadius: 1,
    opacity: 0.3,
  },

  // What Section - Description
  whatSection: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  descriptionInput: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: -0.4,
    paddingVertical: 12,
  },

  // Due Date Section - Quick-Term Selector
  dueDateSection: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  dueDateLabel: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.08,
  },
  dueTermScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  dueTermChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
  },
  dueTermChipActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dueTermText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.24,
  },
  dueTermTextActive: {
    color: "#FFFFFF",
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Suggestions
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: "500",
  },

  // FAB
  fabContainer: {
    position: "absolute",
    right: 24,
    alignItems: "center",
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  fabLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
});

```

---

## ./app/invoice/preview.tsx

```typescript
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  X,
  Check,
  AlertTriangle,
  Mic,
  Edit3,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useProfileStore } from "@/store/useProfileStore";
import { formatCurrency, toDollars } from "@/types";
import * as db from "@/services/database";

/**
 * Invoice Preview Screen
 * Per design-system.md Section 3
 *
 * Features:
 * - AI confidence score display
 * - Highlight original transcript segments
 * - Editable fields before confirmation
 * - "Looks Wrong? Re-record" option
 */

export default function InvoicePreview() {
  const router = useRouter();
  const { colors, typography, spacing, radius } = useTheme();
  const { pendingInvoice, clearPendingInvoice } = useInvoiceStore();
  const { profile } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Editable fields
  const [clientName, setClientName] = useState(pendingInvoice?.clientName || "");
  const [items, setItems] = useState(pendingInvoice?.items || []);

  if (!pendingInvoice) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            No invoice data
          </Text>
          <Button
            title="Go Back"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const confidence = pendingInvoice.confidence || 0.85;
  const confidencePercent = Math.round(confidence * 100);
  const isLowConfidence = confidence < 0.7;

  // Calculate totals (amounts in cents)
  const subtotal = items.reduce(
    (sum, item) => sum + (item.unitPrice || item.price * 100) * (item.quantity || 1),
    0
  );
  const taxRate = profile?.tax_rate || 0;
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  const handleConfirm = async () => {
    setIsSaving(true);

    try {
      // Create invoice in database
      const invoiceData = {
        client_name: clientName,
        subtotal,
        tax_amount: taxAmount,
        total,
        currency: profile?.default_currency || "USD",
        status: "draft" as const,
        notes: pendingInvoice.notes,
      };

      const newInvoice = await db.createInvoice(invoiceData);

      if (newInvoice) {
        // Create invoice items
        for (const item of items) {
          await db.createInvoiceItem({
            invoice_id: newInvoice.id,
            description: item.description,
            quantity: item.quantity || 1,
            unit_price: item.unitPrice || item.price * 100,
            total: (item.unitPrice || item.price * 100) * (item.quantity || 1),
            original_transcript_segment: item.originalTranscript,
          });
        }

        clearPendingInvoice();
        setIsSaving(false);

        // Show cinematic success overlay
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setIsSaving(false);
      Alert.alert("Error", "Failed to create invoice. Please try again.");
    }
  };

  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    router.replace("/(tabs)/invoices");
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearPendingInvoice();
    router.back();
  };

  const handleReRecord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearPendingInvoice();
    router.replace("/(tabs)");
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], quantity: Math.max(1, quantity) };
    setItems(newItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], unitPrice: price, price: price / 100 };
    setItems(newItems);
  };

  const updateItemDescription = (index: number, description: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], description };
    setItems(newItems);
  };

  const getConfidenceColor = () => {
    if (confidence >= 0.9) return colors.statusPaid;
    if (confidence >= 0.7) return colors.alert;
    return colors.statusOverdue;
  };

  // Dismiss keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={handleCancel} style={styles.headerButton}>
            <X size={24} color={colors.text} />
          </Pressable>
          <Text style={[typography.headline, { color: colors.text }]}>
            Invoice Preview
          </Text>
          <Pressable
            onPress={() => setIsEditing(!isEditing)}
            style={styles.headerButton}
          >
            <Edit3 size={22} color={isEditing ? colors.primary : colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={dismissKeyboard}
        >
          {/* AI Confidence Banner */}
          <View
            style={[
              styles.confidenceBanner,
              {
                backgroundColor: getConfidenceColor() + "15",
                borderRadius: radius.md,
              },
            ]}
          >
            <View style={styles.confidenceHeader}>
              <Sparkles size={18} color={getConfidenceColor()} />
              <Text
                style={[
                  typography.footnote,
                  { color: getConfidenceColor(), fontWeight: "600", marginLeft: spacing.xs },
                ]}
              >
                AI Confidence: {confidencePercent}%
              </Text>
            </View>
            {isLowConfidence && (
              <View style={styles.warningRow}>
                <AlertTriangle size={14} color={colors.statusOverdue} />
                <Text
                  style={[
                    typography.caption1,
                    { color: colors.statusOverdue, marginLeft: spacing.xs },
                  ]}
                >
                  Low confidence - please review carefully
                </Text>
              </View>
            )}
          </View>

          {/* Original Transcript Toggle */}
          {pendingInvoice.originalTranscript && (
            <Pressable
              onPress={() => setShowTranscript(!showTranscript)}
              style={[
                styles.transcriptToggle,
                { backgroundColor: colors.backgroundSecondary, borderRadius: radius.md },
              ]}
            >
              <Mic size={16} color={colors.textTertiary} />
              <Text
                style={[
                  typography.footnote,
                  { color: colors.textSecondary, marginLeft: spacing.xs, flex: 1 },
                ]}
              >
                Original voice recording
              </Text>
              {showTranscript ? (
                <ChevronUp size={18} color={colors.textTertiary} />
              ) : (
                <ChevronDown size={18} color={colors.textTertiary} />
              )}
            </Pressable>
          )}

          {showTranscript && pendingInvoice.originalTranscript && (
            <View
              style={[
                styles.transcriptBox,
                { backgroundColor: colors.backgroundTertiary, borderRadius: radius.md },
              ]}
            >
              <Text
                style={[
                  typography.footnote,
                  { color: colors.textSecondary, fontStyle: "italic", lineHeight: 20 },
                ]}
              >
                "{pendingInvoice.originalTranscript}"
              </Text>
              <Text
                style={[
                  typography.caption2,
                  { color: colors.textTertiary, marginTop: spacing.sm },
                ]}
              >
                Detected: {pendingInvoice.detectedLanguage || "English"}
              </Text>
            </View>
          )}

          {/* Bill To */}
          <View style={styles.section}>
            <Text style={[typography.footnote, { color: colors.textTertiary }]}>
              Bill To
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.editableInput,
                  typography.title2,
                  {
                    color: colors.text,
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius: radius.sm,
                  },
                ]}
                value={clientName}
                onChangeText={setClientName}
                placeholder="Client name"
                placeholderTextColor={colors.textTertiary}
              />
            ) : (
              <Text style={[typography.title2, { color: colors.text }]}>
                {clientName}
              </Text>
            )}
          </View>

          {/* Line Items */}
          <View
            style={[
              styles.itemsCard,
              { backgroundColor: colors.card, borderRadius: radius.lg },
            ]}
          >
            <Text
              style={[
                typography.footnote,
                { color: colors.textTertiary, fontWeight: "500", marginBottom: spacing.md },
              ]}
            >
              Items
            </Text>
            {items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.itemRow,
                  index < items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.itemContent}>
                  {isEditing ? (
                    <TextInput
                      style={[
                        typography.body,
                        { color: colors.text, fontWeight: "500", padding: 0 },
                      ]}
                      value={item.description}
                      onChangeText={(text) => updateItemDescription(index, text)}
                      multiline
                    />
                  ) : (
                    <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                      {item.description}
                    </Text>
                  )}

                  {/* Original transcript segment highlight */}
                  {item.originalTranscript && (
                    <Text
                      style={[
                        typography.caption2,
                        {
                          color: colors.textTertiary,
                          fontStyle: "italic",
                          marginTop: 2,
                          backgroundColor: colors.primary + "10",
                          paddingHorizontal: 4,
                          borderRadius: 2,
                        },
                      ]}
                    >
                      "{item.originalTranscript}"
                    </Text>
                  )}

                  <View style={styles.itemMeta}>
                    {isEditing ? (
                      <View style={styles.editableRow}>
                        <Text style={[typography.caption1, { color: colors.textTertiary }]}>
                          Qty:{" "}
                        </Text>
                        <TextInput
                          style={[
                            typography.caption1,
                            styles.smallInput,
                            {
                              color: colors.text,
                              backgroundColor: colors.backgroundSecondary,
                              borderRadius: 4,
                            },
                          ]}
                          value={String(item.quantity || 1)}
                          onChangeText={(text) =>
                            updateItemQuantity(index, parseInt(text) || 1)
                          }
                          keyboardType="numeric"
                        />
                        <Text
                          style={[
                            typography.caption1,
                            { color: colors.textTertiary, marginLeft: spacing.sm },
                          ]}
                        >
                          @ $
                        </Text>
                        <TextInput
                          style={[
                            typography.caption1,
                            styles.smallInput,
                            {
                              color: colors.text,
                              backgroundColor: colors.backgroundSecondary,
                              borderRadius: 4,
                            },
                          ]}
                          value={String((item.unitPrice || item.price * 100) / 100)}
                          onChangeText={(text) =>
                            updateItemPrice(index, parseFloat(text) * 100 || 0)
                          }
                          keyboardType="decimal-pad"
                        />
                      </View>
                    ) : (
                      <Text style={[typography.caption1, { color: colors.textTertiary }]}>
                        Qty: {item.quantity || 1}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>
                  {formatCurrency(
                    (item.unitPrice || item.price * 100) * (item.quantity || 1),
                    profile?.default_currency || "USD"
                  )}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View
            style={[
              styles.totalsCard,
              { backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg },
            ]}
          >
            <View style={styles.totalRow}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                {formatCurrency(subtotal, profile?.default_currency || "USD")}
              </Text>
            </View>
            {taxRate > 0 && (
              <View style={styles.totalRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  Tax ({taxRate}%)
                </Text>
                <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                  {formatCurrency(taxAmount, profile?.default_currency || "USD")}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.totalRow,
                styles.grandTotal,
                { borderTopColor: colors.border },
              ]}
            >
              <Text style={[typography.headline, { color: colors.text }]}>Total</Text>
              <Text style={[typography.title2, { color: colors.primary }]}>
                {formatCurrency(total, profile?.default_currency || "USD")}
              </Text>
            </View>
          </View>

          {/* Re-record Option */}
          <Pressable onPress={handleReRecord} style={styles.reRecordButton}>
            <AlertTriangle size={16} color={colors.textTertiary} />
            <Text
              style={[
                typography.footnote,
                { color: colors.textTertiary, marginLeft: spacing.xs },
              ]}
            >
              Looks wrong? Re-record
            </Text>
          </Pressable>

          {/* Collection Settings - iOS Settings Group Style */}
          <View style={{ marginTop: 32, marginBottom: 16 }}>
            {/* Section Header */}
            <Text style={[typography.caption1, {
              color: colors.textTertiary,
              marginBottom: 8,
              marginLeft: 16,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }]}>
              Collection Settings
            </Text>

            {/* Settings Card */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              overflow: 'hidden',
            }}>
              {/* Toggle Row */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    backgroundColor: colors.primary,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sparkles size={18} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={[typography.body, { color: colors.text, fontWeight: '500' }]}>
                      Auto-Collect
                    </Text>
                    <Text style={[typography.caption2, { color: colors.textTertiary }]}>
                      Bad Cop Mode
                    </Text>
                  </View>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Description Row */}
              <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={[typography.footnote, { color: colors.textSecondary, lineHeight: 18 }]}>
                  We will send polite reminders on{' '}
                  <Text style={{ fontWeight: '600', color: colors.text }}>Day 3</Text>,{' '}
                  <Text style={{ fontWeight: '600', color: colors.text }}>Day 7</Text>, and{' '}
                  <Text style={{ fontWeight: '600', color: colors.text }}>Day 14</Text>{' '}
                  if unpaid.
                </Text>
              </View>
            </View>

            {/* Footer Note */}
            <Text style={[typography.caption2, {
              color: colors.textTertiary,
              marginTop: 8,
              marginLeft: 16,
              lineHeight: 16,
            }]}>
              You can disable this anytime from invoice settings.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={[styles.bottomAction, { borderTopColor: colors.border }]}>
          <Button
            title={isSaving ? "Creating..." : "Create Invoice"}
            onPress={handleConfirm}
            disabled={isSaving || !clientName.trim() || items.length === 0}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Success Overlay */}
      <SuccessOverlay
        type="sent"
        visible={showSuccess}
        onDismiss={handleSuccessDismiss}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    marginHorizontal: -8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  confidenceBanner: {
    padding: 12,
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  transcriptToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
  },
  transcriptBox: {
    padding: 12,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  editableInput: {
    padding: 8,
    marginTop: 4,
  },
  itemsCard: {
    padding: 16,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemMeta: {
    marginTop: 4,
  },
  editableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallInput: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
    textAlign: "center",
  },
  totalsCard: {
    padding: 16,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  grandTotal: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 16,
  },
  reRecordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  bottomAction: {
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
});

```

---

## ./app/paywall.tsx

```typescript
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  X,
  Shield,
  Check,
  Zap,
  Mic,
  RefreshCw,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

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
    icon: Mic,
    title: "Unlimited Voice Invoices",
    description: "Speak invoices in any language, anytime",
  },
  {
    icon: RefreshCw,
    title: "Instant QuickBooks Sync",
    description: "Automatic two-way bookkeeping sync",
  },
];

export default function PaywallScreen() {
  const router = useRouter();

  // Animations
  const shieldGlow = useRef(new Animated.Value(0.5)).current;
  const shieldScale = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const cardSlide = useRef(new Animated.Value(100)).current;
  const shimmerPosition = useRef(new Animated.Value(-1)).current;

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

  const handleStartTrial = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // TODO: Implement Stripe subscription flow
    console.log("Start trial pressed");
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

          {/* Headline */}
          <Text style={styles.headline}>
            Never Chase a{"\n"}Payment Again.
          </Text>

          {/* Subheadline */}
          <Text style={styles.subheadline}>
            Let the Bad Cop Bot do the dirty work.
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
              <PriceCardContent onStartTrial={handleStartTrial} shimmerPosition={shimmerPosition} />
            </BlurView>
          ) : (
            <View style={[styles.priceCardBlur, styles.priceCardAndroid]}>
              <PriceCardContent onStartTrial={handleStartTrial} shimmerPosition={shimmerPosition} />
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
  shimmerPosition,
}: {
  onStartTrial: () => void;
  shimmerPosition: Animated.Value;
}) {
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
        <Text style={styles.priceAmount}>20</Text>
        <Text style={styles.pricePeriod}>/ month</Text>
      </View>

      {/* Subtext */}
      <Text style={styles.priceSubtext}>
        Cancel anytime.
      </Text>

      {/* CTA Button with Shimmer */}
      <Pressable
        onPress={onStartTrial}
        style={({ pressed }) => [
          styles.ctaButton,
          pressed && styles.ctaButtonPressed,
        ]}
      >
        {/* Shimmer overlay */}
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
        <Text style={styles.ctaButtonText}>Start 7-Day Free Trial</Text>
      </Pressable>

      {/* Terms */}
      <Text style={styles.termsText}>
        No charge until trial ends
      </Text>
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
});

```

---

## ./app/stripe/onboarding.tsx

```typescript
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

```

---

## ./babel.config.js

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
          },
        },
      ],
    ],
  };
};

```

---

## ./components/AnimatedNumber.tsx

```typescript
import React, { useEffect, useRef, useState } from "react";
import { Text, TextStyle, Animated, StyleSheet, View } from "react-native";

/**
 * AnimatedNumber Component
 * Apple Design Award Foundation - "Gas Pump / Slot Machine" rolling effect
 *
 * Numbers roll like a mechanical counter when values change
 * Uses tabular-nums for consistent digit widths (no jitter)
 */

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  style,
  duration = 800,
  formatOptions = {},
}: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const previousValue = useRef(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const startValue = previousValue.current;
    animatedValue.setValue(startValue);

    // Add listener for smooth updates
    const listener = animatedValue.addListener(({ value: currentValue }) => {
      const formatted = formatNumber(currentValue, formatOptions);
      setDisplayText(`${prefix}${formatted}${suffix}`);
    });

    // Animate with easing for slot machine feel
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
      // Custom easing for mechanical feel
    }).start();

    previousValue.current = value;

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration, prefix, suffix]);

  // Initial display
  useEffect(() => {
    const formatted = formatNumber(0, formatOptions);
    setDisplayText(`${prefix}${formatted}${suffix}`);
  }, []);

  return (
    <Text style={[styles.number, style]}>
      {displayText}
    </Text>
  );
}

/**
 * RollingDigits Component
 * Individual digits roll independently like a slot machine
 */
interface RollingDigitsProps {
  value: number;
  style?: TextStyle;
  duration?: number;
  currency?: string;
}

export function RollingDigits({
  value,
  style,
  duration = 1000,
  currency = "USD",
}: RollingDigitsProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const digitAnims = useRef<Animated.Value[]>([]).current;
  const previousValue = useRef(0);

  // Format number to string with proper formatting
  const formatValue = (val: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val / 100);
  };

  useEffect(() => {
    const formatted = formatValue(value);
    const newDigits = formatted.split("");

    // Ensure we have enough animation values
    while (digitAnims.length < newDigits.length) {
      digitAnims.push(new Animated.Value(0));
    }

    // Animate each digit with staggered timing
    const animations = newDigits.map((digit, index) => {
      const isNumeric = /\d/.test(digit);
      if (!isNumeric) return null;

      const targetValue = parseInt(digit, 10);
      const anim = digitAnims[index];

      // Reset and animate
      return Animated.sequence([
        Animated.delay(index * 50), // Stagger effect
        Animated.timing(anim, {
          toValue: targetValue,
          duration: duration - index * 30,
          useNativeDriver: false,
        }),
      ]);
    }).filter(Boolean);

    if (animations.length > 0) {
      Animated.parallel(animations as Animated.CompositeAnimation[]).start();
    }

    setDigits(newDigits);
    previousValue.current = value;
  }, [value, duration, currency]);

  return (
    <View style={styles.rollingContainer}>
      {digits.map((char, index) => {
        const isNumeric = /\d/.test(char);

        if (!isNumeric) {
          // Static character ($ , . etc)
          return (
            <Text key={`char-${index}`} style={[styles.number, style]}>
              {char}
            </Text>
          );
        }

        // Animated digit
        return (
          <RollingDigit
            key={`digit-${index}`}
            targetDigit={parseInt(char, 10)}
            style={style}
            delay={index * 50}
            duration={duration}
          />
        );
      })}
    </View>
  );
}

/**
 * Single Rolling Digit
 * Animates through 0-9 to reach target
 */
interface RollingDigitProps {
  targetDigit: number;
  style?: TextStyle;
  delay?: number;
  duration?: number;
}

function RollingDigit({ targetDigit, style, delay = 0, duration = 800 }: RollingDigitProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const [currentDigit, setCurrentDigit] = useState(0);
  const digitHeight = (style?.lineHeight || style?.fontSize || 44) as number;

  useEffect(() => {
    // Animate through digits
    const totalRolls = targetDigit + 10; // Roll at least one full cycle
    let currentStep = 0;

    translateY.setValue(0);

    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(translateY, {
        toValue: -totalRolls * digitHeight,
        duration,
        useNativeDriver: true,
      }),
    ]).start();

    // Update displayed digit during animation
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= totalRolls) {
        setCurrentDigit(currentStep % 10);
      }
    }, duration / totalRolls);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setCurrentDigit(targetDigit);
    }, duration + delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [targetDigit, duration, delay]);

  return (
    <View style={[styles.digitContainer, { height: digitHeight }]}>
      <Text style={[styles.number, style]}>
        {currentDigit}
      </Text>
    </View>
  );
}

/**
 * AnimatedCurrency Component
 * Convenience wrapper for currency values (stored in cents)
 * Gas pump style rolling animation
 */
interface AnimatedCurrencyProps {
  cents: number;
  currency?: string;
  style?: TextStyle;
  duration?: number;
}

export function AnimatedCurrency({
  cents,
  currency = "USD",
  style,
  duration = 800,
}: AnimatedCurrencyProps) {
  const dollars = cents / 100;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const previousValue = useRef(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    animatedValue.setValue(previousValue.current);

    const listener = animatedValue.addListener(({ value }) => {
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
      setDisplayText(formatted);
    });

    Animated.timing(animatedValue, {
      toValue: dollars,
      duration,
      useNativeDriver: false,
    }).start();

    previousValue.current = dollars;

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [dollars, duration, currency]);

  // Initial format
  useEffect(() => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(previousValue.current);
    setDisplayText(formatted);
  }, []);

  return (
    <Text style={[styles.number, style]}>
      {displayText}
    </Text>
  );
}

/**
 * PulseNumber Component
 * Shows a brief pulse/scale animation when value changes
 */
interface PulseNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  formatOptions?: Intl.NumberFormatOptions;
}

export function PulseNumber({
  value,
  prefix = "",
  suffix = "",
  style,
  formatOptions = {},
}: PulseNumberProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const previousValue = useRef(value);

  useEffect(() => {
    if (previousValue.current !== value) {
      // Pulse animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 12,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();

      previousValue.current = value;
    }
  }, [value]);

  const formatted = new Intl.NumberFormat("en-US", formatOptions).format(value);

  return (
    <Animated.Text style={[styles.number, style, { transform: [{ scale: scaleAnim }] }]}>
      {`${prefix}${formatted}${suffix}`}
    </Animated.Text>
  );
}

/**
 * CountUp Component
 * Counts up from 0 to target with slot machine feel
 */
interface CountUpProps {
  to: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
}

export function CountUp({
  to,
  prefix = "",
  suffix = "",
  style,
  duration = 1200,
  formatOptions = {},
}: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);

    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });

    // Easing for mechanical counter feel
    Animated.timing(animatedValue, {
      toValue: to,
      duration,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [to, duration]);

  const formatted = new Intl.NumberFormat("en-US", formatOptions).format(displayValue);

  return (
    <Text style={[styles.number, style]}>
      {`${prefix}${formatted}${suffix}`}
    </Text>
  );
}

// Helper function
function formatNumber(value: number, formatOptions: Intl.NumberFormatOptions): string {
  if (formatOptions.style === "currency") {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...formatOptions,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", formatOptions).format(Math.round(value));
}

const styles = StyleSheet.create({
  number: {
    fontVariant: ["tabular-nums"],
  },
  rollingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  digitContainer: {
    overflow: "hidden",
    justifyContent: "center",
  },
});

```

---

## ./components/EmptyState.tsx

```typescript
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  FileText,
  Users,
  Search,
  CheckCircle,
  Mic,
} from "lucide-react-native";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";

/**
 * EmptyState Component
 * Per design-system.md Section 3 - Empty State Psychology
 *
 * Types:
 * - firstRun: "Let's Get You Paid" with action
 * - allCaughtUp: Celebration for empty filtered list
 * - noResults: Search returned nothing
 * - noClients: No clients yet
 */

type EmptyStateType = "firstRun" | "allCaughtUp" | "noResults" | "noClients";

interface EmptyStateProps {
  type: EmptyStateType;
  searchQuery?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({
  type,
  searchQuery,
  onAction,
  actionLabel,
}: EmptyStateProps) {
  const { colors, typography, spacing } = useTheme();

  const configs: Record<
    EmptyStateType,
    {
      icon: React.ReactNode;
      title: string;
      message: string;
      showAction: boolean;
      defaultActionLabel: string;
    }
  > = {
    firstRun: {
      icon: <Mic size={64} color={colors.primary} strokeWidth={1.5} />,
      title: "Let's Get You Paid",
      message:
        "Create your first invoice in seconds. Just tap the microphone and describe the work.",
      showAction: true,
      defaultActionLabel: "Create First Invoice",
    },
    allCaughtUp: {
      icon: <CheckCircle size={64} color={colors.statusPaid} strokeWidth={1.5} />,
      title: "All Caught Up!",
      message: "No overdue invoices. Great job staying on top of your billing.",
      showAction: false,
      defaultActionLabel: "",
    },
    noResults: {
      icon: <Search size={64} color={colors.textTertiary} strokeWidth={1.5} />,
      title: "No Results Found",
      message: searchQuery
        ? `No invoices matching "${searchQuery}"`
        : "Try adjusting your search or filters.",
      showAction: !!searchQuery,
      defaultActionLabel: searchQuery ? `Create Invoice for "${searchQuery}"` : "Clear Search",
    },
    noClients: {
      icon: <Users size={64} color={colors.textTertiary} strokeWidth={1.5} />,
      title: "No Clients Yet",
      message:
        "Your clients will appear here once you create invoices for them.",
      showAction: true,
      defaultActionLabel: "Add First Client",
    },
  };

  const config = configs[type];

  return (
    <View style={styles.container}>
      {/* Illustration/Icon */}
      <View style={styles.iconContainer}>{config.icon}</View>

      {/* Title - Per design-system.md "Human" copywriting */}
      <Text
        style={[
          typography.title2,
          { color: colors.text, textAlign: "center", marginTop: spacing.lg },
        ]}
      >
        {config.title}
      </Text>

      {/* Message */}
      <Text
        style={[
          typography.body,
          {
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: spacing.sm,
            paddingHorizontal: spacing.xl,
            lineHeight: 24,
          },
        ]}
      >
        {config.message}
      </Text>

      {/* Action Button */}
      {config.showAction && onAction && (
        <View style={[styles.buttonContainer, { marginTop: spacing.xl }]}>
          <Button
            title={actionLabel || config.defaultActionLabel}
            onPress={onAction}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    opacity: 0.9,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 280,
  },
});

```

---

## ./components/InvoiceCard.tsx

```typescript
import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import {
  Check,
  Bell,
  Trash2,
  Copy,
  CheckCircle,
  Send,
  XCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { Invoice, InvoiceStatus, formatCurrency, formatRelativeDate } from "@/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * InvoiceCard Component - Apple Wallet Aesthetic + Haptic Touch
 *
 * Features:
 * - Physical Ticket / Pass design
 * - Long press context menu with "pop" animation
 * - Blur overlay with spring dismiss
 * - SF Symbols style icons
 */

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
  onMarkPaid?: () => void;
  onRemind?: () => void;
  onVoid?: () => void;
  onDuplicate?: () => void;
}

interface MenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
  destructive?: boolean;
}

export function InvoiceCard({
  invoice,
  onPress,
  onMarkPaid,
  onRemind,
  onVoid,
  onDuplicate,
}: InvoiceCardProps) {
  const { colors, isDark } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const menuScaleAnim = useRef(new Animated.Value(0)).current;
  const menuOpacityAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacityAnim = useRef(new Animated.Value(0)).current;

  // Context menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [cardLayout, setCardLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const cardRef = useRef<View>(null);

  // Status dot colors with glow
  const getStatusDotColor = (status: InvoiceStatus): string => {
    switch (status) {
      case "paid":
        return colors.statusPaid;
      case "sent":
        return colors.statusSent;
      case "overdue":
        return colors.statusOverdue;
      case "draft":
        return colors.statusDraft;
      case "void":
        return colors.textTertiary;
      default:
        return colors.textTertiary;
    }
  };

  const statusDotColor = getStatusDotColor(invoice.status);

  // Build menu actions based on invoice status
  const getMenuActions = useCallback((): MenuAction[] => {
    const actions: MenuAction[] = [];

    // Mark as Paid (if not already paid)
    if (invoice.status !== "paid" && invoice.status !== "void" && onMarkPaid) {
      actions.push({
        id: "mark_paid",
        label: "Mark as Paid",
        icon: <CheckCircle size={20} color={colors.statusPaid} strokeWidth={2} />,
        color: colors.statusPaid,
        onPress: () => {
          dismissMenu();
          setTimeout(() => onMarkPaid(), 200);
        },
      });
    }

    // Send Reminder (if sent or overdue)
    if ((invoice.status === "sent" || invoice.status === "overdue") && onRemind) {
      actions.push({
        id: "remind",
        label: "Send Reminder",
        icon: <Send size={20} color={colors.systemOrange} strokeWidth={2} />,
        color: colors.systemOrange,
        onPress: () => {
          dismissMenu();
          setTimeout(() => onRemind(), 200);
        },
      });
    }

    // Duplicate
    if (onDuplicate) {
      actions.push({
        id: "duplicate",
        label: "Duplicate",
        icon: <Copy size={20} color={colors.systemBlue} strokeWidth={2} />,
        color: colors.systemBlue,
        onPress: () => {
          dismissMenu();
          setTimeout(() => onDuplicate(), 200);
        },
      });
    }

    // Void / Delete (destructive)
    if (invoice.status !== "paid" && invoice.status !== "void" && onVoid) {
      actions.push({
        id: "void",
        label: "Void Invoice",
        icon: <XCircle size={20} color={colors.systemRed} strokeWidth={2} />,
        color: colors.systemRed,
        destructive: true,
        onPress: () => {
          dismissMenu();
          setTimeout(() => onVoid(), 200);
        },
      });
    }

    return actions;
  }, [invoice.status, onMarkPaid, onRemind, onDuplicate, onVoid, colors]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!menuVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  // Long press - show context menu with "pop" animation
  const handleLongPress = () => {
    // Heavy haptic for context menu
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Get card position for menu placement
    if (cardRef.current) {
      cardRef.current.measureInWindow((x, y, width, height) => {
        setCardLayout({ x, y, width, height });
      });
    }

    setMenuVisible(true);

    // Animate card scale UP to 1.05 (pop effect)
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      damping: 12,
      stiffness: 200,
      useNativeDriver: true,
    }).start();

    // Animate overlay and menu
    Animated.parallel([
      Animated.timing(overlayOpacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(menuScaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 250,
        delay: 50,
        useNativeDriver: true,
      }),
      Animated.timing(menuOpacityAnim, {
        toValue: 1,
        duration: 150,
        delay: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Dismiss menu with spring physics
  const dismissMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      // Card springs back
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }),
      // Overlay fades
      Animated.timing(overlayOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      // Menu scales down
      Animated.spring(menuScaleAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 300,
        useNativeDriver: true,
      }),
      Animated.timing(menuOpacityAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  // Right swipe action - Mark as Paid
  const renderRightAction = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (invoice.status === "paid" || !onMarkPaid) return null;

    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          swipeableRef.current?.close();
          onMarkPaid();
        }}
        style={[styles.swipeAction, { backgroundColor: colors.statusPaid }]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Check size={24} color="#FFFFFF" strokeWidth={2.5} />
        </Animated.View>
      </Pressable>
    );
  };

  // Left swipe actions
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.leftActionsContainer}>
        {onRemind && invoice.status !== "paid" && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              swipeableRef.current?.close();
              onRemind();
            }}
            style={[styles.swipeAction, { backgroundColor: colors.systemOrange }]}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Bell size={22} color="#FFFFFF" strokeWidth={2} />
            </Animated.View>
          </Pressable>
        )}
        {onVoid && invoice.status !== "paid" && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              swipeableRef.current?.close();
              onVoid();
            }}
            style={[styles.swipeAction, { backgroundColor: colors.systemRed }]}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Trash2 size={22} color="#FFFFFF" strokeWidth={2} />
            </Animated.View>
          </Pressable>
        )}
      </View>
    );
  };

  // Format amount
  const formattedAmount = formatCurrency(invoice.total, invoice.currency);

  // Format relative date
  const relativeDate = invoice.created_at
    ? formatRelativeDate(invoice.created_at)
    : "Just now";

  const menuActions = getMenuActions();

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightAction}
        renderLeftActions={renderLeftActions}
        friction={2}
        overshootRight={false}
        overshootLeft={false}
        containerStyle={styles.swipeableContainer}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={400}
        >
          <Animated.View
            ref={cardRef}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                transform: [{ scale: scaleAnim }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 12,
              },
            ]}
          >
            {/* Top Row: Client Name + Status Dot */}
            <View style={styles.topRow}>
              {/* Client Name (Top Left) */}
              <Text
                style={[styles.clientName, { color: colors.text }]}
                numberOfLines={1}
              >
                {invoice.client_name}
              </Text>

              {/* Status Dot (Top Right) - Glowing */}
              <View style={styles.statusDotContainer}>
                {/* Glow layer */}
                <View
                  style={[
                    styles.statusDotGlow,
                    {
                      backgroundColor: statusDotColor,
                      shadowColor: statusDotColor,
                    },
                  ]}
                />
                {/* Main dot */}
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusDotColor },
                  ]}
                />
              </View>
            </View>

            {/* Bottom Row: Date + Amount */}
            <View style={styles.bottomRow}>
              {/* Relative Date (Bottom Left) */}
              <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                {relativeDate}
              </Text>

              {/* Amount (Bottom Right) */}
              <Text style={[styles.amount, { color: colors.text }]}>
                {formattedAmount}
              </Text>
            </View>
          </Animated.View>
        </Pressable>
      </Swipeable>

      {/* Context Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={dismissMenu}
      >
        {/* Blur Overlay - Tap to dismiss */}
        <Pressable style={styles.modalOverlay} onPress={dismissMenu}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { opacity: overlayOpacityAnim },
            ]}
          >
            {Platform.OS === "ios" ? (
              <BlurView
                intensity={30}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)" },
                ]}
              />
            )}
          </Animated.View>
        </Pressable>

        {/* Floating Card Clone (elevated) */}
        <Animated.View
          style={[
            styles.floatingCard,
            {
              backgroundColor: colors.card,
              top: cardLayout.y - 20,
              left: cardLayout.x,
              width: cardLayout.width,
              transform: [{ scale: scaleAnim }],
              opacity: overlayOpacityAnim,
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.topRow}>
            <Text
              style={[styles.clientName, { color: colors.text }]}
              numberOfLines={1}
            >
              {invoice.client_name}
            </Text>
            <View style={styles.statusDotContainer}>
              <View
                style={[
                  styles.statusDotGlow,
                  { backgroundColor: statusDotColor, shadowColor: statusDotColor },
                ]}
              />
              <View style={[styles.statusDot, { backgroundColor: statusDotColor }]} />
            </View>
          </View>
          <View style={styles.bottomRow}>
            <Text style={[styles.dateText, { color: colors.textTertiary }]}>
              {relativeDate}
            </Text>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formattedAmount}
            </Text>
          </View>
        </Animated.View>

        {/* Context Menu */}
        <Animated.View
          style={[
            styles.contextMenu,
            {
              backgroundColor: isDark ? colors.backgroundSecondary : "#FFFFFF",
              top: cardLayout.y + cardLayout.height + 8,
              left: Math.max(16, Math.min(cardLayout.x, SCREEN_WIDTH - 200 - 16)),
              opacity: menuOpacityAnim,
              transform: [
                { scale: menuScaleAnim },
                {
                  translateY: menuScaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {menuActions.map((action, index) => (
            <Pressable
              key={action.id}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.menuItem,
                index < menuActions.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
                pressed && { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <View style={styles.menuItemIcon}>{action.icon}</View>
              <Text
                style={[
                  styles.menuItemLabel,
                  {
                    color: action.destructive ? colors.systemRed : colors.text,
                  },
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    elevation: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  clientName: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
    flex: 1,
    marginRight: 12,
  },
  statusDotContainer: {
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDotGlow: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  amount: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },
  leftActionsContainer: {
    flexDirection: "row",
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: 22,
    marginRight: 8,
  },
  // Context Menu Styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingCard: {
    position: "absolute",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },
  contextMenu: {
    position: "absolute",
    minWidth: 200,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemIcon: {
    width: 28,
    alignItems: "center",
  },
  menuItemLabel: {
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: -0.4,
    marginLeft: 12,
  },
});

```

---

## ./components/LogoUploader.tsx

```typescript
import { View, Text, Image, Pressable } from "react-native";
import { Camera, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { COLORS } from "../lib/constants";

interface LogoUploaderProps {
  logoUrl?: string;
  onLogoChange: (uri: string | undefined) => void;
}

export function LogoUploader({ logoUrl, onLogoChange }: LogoUploaderProps) {
  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onLogoChange(result.assets[0].uri);
    }
  };

  const removeLogo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLogoChange(undefined);
  };

  if (logoUrl) {
    return (
      <View className="items-center mb-6">
        <View className="relative">
          <Image
            source={{ uri: logoUrl }}
            className="w-24 h-24 rounded-2xl"
          />
          <Pressable
            onPress={removeLogo}
            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full items-center justify-center"
          >
            <X size={16} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text className="text-gray-500 text-sm mt-2">Business Logo</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={pickImage} className="items-center mb-6">
      <View className="w-24 h-24 rounded-2xl bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300">
        <Camera size={32} color={COLORS.text.light} />
      </View>
      <Text className="text-gray-500 text-sm mt-2">Add Logo</Text>
    </Pressable>
  );
}

```

---

## ./components/MonogramAvatar.tsx

```typescript
import { View, Text } from "react-native";
import { COLORS } from "../lib/constants";

interface MonogramAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function MonogramAvatar({ name, size = "md" }: MonogramAvatarProps) {
  const getInitials = (fullName: string): string => {
    const words = fullName.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <View
      className={`${sizeClasses[size]} rounded-full items-center justify-center`}
      style={{ backgroundColor: COLORS.primary }}
    >
      <Text className={`text-white font-bold ${textSizes[size]}`}>
        {getInitials(name || "?")}
      </Text>
    </View>
  );
}

```

---

## ./components/OfflineIndicator.tsx

```typescript
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/lib/theme";
import { useOfflineStore } from "@/store/useOfflineStore";

interface OfflineIndicatorProps {
  compact?: boolean;
  showSyncButton?: boolean;
}

export function OfflineIndicator({
  compact = false,
  showSyncButton = true,
}: OfflineIndicatorProps) {
  const { colors } = useTheme();
  const {
    isOnline,
    isSyncing,
    pendingUploads,
    pendingOperations,
    syncNow,
  } = useOfflineStore();

  const pulseAnim = useSharedValue(1);

  // Pulse animation when offline
  React.useEffect(() => {
    if (!isOnline) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = withSpring(1);
    }
  }, [isOnline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const totalPending = pendingUploads + pendingOperations;

  // Don't show if online and nothing pending
  if (isOnline && totalPending === 0) {
    return null;
  }

  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, animatedStyle]}>
        <View
          style={[
            styles.compactBadge,
            {
              backgroundColor: isOnline
                ? colors.primary
                : colors.statusOverdue,
            },
          ]}
        >
          <Ionicons
            name={isOnline ? "cloud-upload" : "cloud-offline"}
            size={14}
            color="white"
          />
          {totalPending > 0 && (
            <Text style={styles.compactCount}>{totalPending}</Text>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isOnline
            ? colors.background
            : colors.statusOverdue + "15",
          borderColor: isOnline ? colors.border : colors.statusOverdue,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isOnline ? "cloud-upload" : "cloud-offline"}
            size={20}
            color={isOnline ? colors.primary : colors.statusOverdue}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: isOnline ? colors.text : colors.statusOverdue },
            ]}
          >
            {isOnline ? "Syncing..." : "You're Offline"}
          </Text>

          {totalPending > 0 && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {totalPending} item{totalPending !== 1 ? "s" : ""} pending
            </Text>
          )}

          {!isOnline && totalPending === 0 && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Changes will sync when online
            </Text>
          )}
        </View>

        {showSyncButton && isOnline && totalPending > 0 && (
          <TouchableOpacity
            style={[styles.syncButton, { backgroundColor: colors.primary }]}
            onPress={syncNow}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.syncButtonText}>Sync</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Simple offline banner for top of screen
 */
export function OfflineBanner() {
  const { colors } = useTheme();
  const { isOnline } = useOfflineStore();

  if (isOnline) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: colors.statusOverdue }]}>
      <Ionicons name="cloud-offline" size={16} color="white" />
      <Text style={styles.bannerText}>No Internet Connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  syncButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  compactContainer: {},
  compactBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  compactCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 8,
  },
  bannerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});

```

---

## ./components/RecordingOverlay.tsx

```typescript
import { View, Text, Modal, StyleSheet, Animated } from "react-native";
import { Mic } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTheme, typography, spacing, radius } from "../lib/theme";

interface RecordingOverlayProps {
  visible: boolean;
  duration: number;
}

export function RecordingOverlay({ visible, duration }: RecordingOverlayProps) {
  const { colors, isDark } = useTheme();
  const [dots, setDots] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      // Dots animation
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 500);

      return () => {
        pulse.stop();
        clearInterval(interval);
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.9);
        pulseAnim.setValue(1);
      };
    }
  }, [visible]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const styles = createStyles(colors, isDark);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.iconInner}>
              <Mic size={36} color="#FFFFFF" strokeWidth={2} />
            </View>
          </Animated.View>

          <Text style={styles.duration}>{formatDuration(duration)}</Text>
          <Text style={styles.status}>Recording{dots}</Text>

          <View style={styles.waveContainer}>
            {[...Array(5)].map((_, i) => (
              <WaveBar key={i} delay={i * 100} colors={colors} />
            ))}
          </View>

          <Text style={styles.hint}>Release to finish</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function WaveBar({ delay, colors }: { delay: number; colors: any }) {
  const heightAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(heightAnim, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(heightAnim, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{
        width: 4,
        height: 24,
        backgroundColor: colors.primary,
        borderRadius: 2,
        marginHorizontal: 3,
        transform: [{ scaleY: heightAnim }],
      }}
    />
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.9)" : "rgba(0, 0, 0, 0.8)",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      backgroundColor: colors.card,
      borderRadius: radius.xxl,
      padding: spacing.xl,
      alignItems: "center",
      marginHorizontal: spacing.xl,
      minWidth: 280,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.3,
      shadowRadius: 30,
      elevation: 20,
    },
    iconContainer: {
      marginBottom: spacing.lg,
    },
    iconInner: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#FF3B30",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#FF3B30",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    duration: {
      ...typography.amount,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    status: {
      ...typography.headline,
      color: colors.textTertiary,
      marginBottom: spacing.lg,
    },
    waveContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: 32,
      marginBottom: spacing.lg,
    },
    hint: {
      ...typography.footnote,
      color: colors.textTertiary,
    },
  });

```

---

## ./components/SkeletonCard.tsx

```typescript
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "@/lib/theme";

/**
 * SkeletonCard Component
 * Per design-system.md Section 3.3
 * Shimmering placeholder matching invoice card layout
 */

interface SkeletonCardProps {
  count?: number;
}

function SkeletonItem() {
  const { colors, radius, shadows } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonColor = colors.textTertiary + "30";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          ...shadows.default,
        },
      ]}
    >
      {/* Top Row: Name + Badge skeleton */}
      <View style={styles.topRow}>
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.nameSkeleton,
            { backgroundColor: skeletonColor, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.badgeSkeleton,
            { backgroundColor: skeletonColor, opacity },
          ]}
        />
      </View>

      {/* Bottom Row: Metadata + Amount skeleton */}
      <View style={styles.bottomRow}>
        <View style={styles.metadataRow}>
          <Animated.View
            style={[
              styles.skeletonLine,
              styles.idSkeleton,
              { backgroundColor: skeletonColor, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonLine,
              styles.dateSkeleton,
              { backgroundColor: skeletonColor, opacity },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.amountSkeleton,
            { backgroundColor: skeletonColor, opacity },
          ]}
        />
      </View>
    </View>
  );
}

export function SkeletonCard({ count = 3 }: SkeletonCardProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skeletonLine: {
    borderRadius: 4,
  },
  nameSkeleton: {
    width: 140,
    height: 20,
  },
  badgeSkeleton: {
    width: 60,
    height: 24,
    borderRadius: 12,
  },
  idSkeleton: {
    width: 70,
    height: 14,
  },
  dateSkeleton: {
    width: 50,
    height: 14,
  },
  amountSkeleton: {
    width: 80,
    height: 24,
  },
});

```

---

## ./components/SuccessOverlay.tsx

```typescript
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * SuccessOverlay Component
 *
 * A cinematic full-screen success confirmation with:
 * - Frosted glass blur background
 * - Animated checkmark with spring overshoot
 * - Expanding ripple shockwave
 * - Auto-dismiss after 1.5s
 */

interface SuccessOverlayProps {
  type: "sent" | "paid";
  visible: boolean;
  onDismiss: () => void;
}

export function SuccessOverlay({ type, visible, onDismiss }: SuccessOverlayProps) {
  const { colors, isDark } = useTheme();

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      overlayOpacity.setValue(0);
      checkmarkScale.setValue(0);
      textOpacity.setValue(0);
      rippleScale.setValue(0);
      rippleOpacity.setValue(1);

      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in sequence
      Animated.sequence([
        // 1. Fade in overlay
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),

        // 2. Checkmark springs in with overshoot
        Animated.parallel([
          Animated.spring(checkmarkScale, {
            toValue: 1,
            damping: 8,
            stiffness: 180,
            mass: 0.8,
            useNativeDriver: true,
          }),
          // Ripple expands
          Animated.timing(rippleScale, {
            toValue: 3,
            duration: 600,
            useNativeDriver: true,
          }),
          // Ripple fades
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          // Text fades in
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 300,
            delay: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Auto-dismiss after 1.5s
      const dismissTimer = setTimeout(() => {
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onDismiss();
        });
      }, 1500);

      return () => clearTimeout(dismissTimer);
    }
  }, [visible]);

  if (!visible) return null;

  const displayText = type === "sent" ? "Sent" : "Paid";
  const accentColor = type === "sent" ? colors.statusSent : colors.statusPaid;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: overlayOpacity },
      ]}
      pointerEvents="auto"
    >
      {/* Blur Background */}
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={100}
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

      {/* Content Container */}
      <View style={styles.content}>
        {/* Ripple Effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              borderColor: accentColor,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
            },
          ]}
        />

        {/* Checkmark Circle */}
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              backgroundColor: accentColor,
              transform: [{ scale: checkmarkScale }],
              shadowColor: accentColor,
            },
          ]}
        >
          <Check size={64} color="#FFFFFF" strokeWidth={3} />
        </Animated.View>

        {/* Success Text */}
        <Animated.Text
          style={[
            styles.successText,
            {
              color: colors.text,
              opacity: textOpacity,
            },
          ]}
        >
          {displayText}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  checkmarkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    // Glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  successText: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.7,
    marginTop: 24,
  },
});

```

---

## ./components/ui/AutoResizingInput.tsx

```typescript
import React, { useEffect, useRef, useState, forwardRef } from "react";
import {
  TextInput,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInputProps,
  View,
} from "react-native";
import { useTheme } from "@/lib/theme";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Premium Calculator-Style Auto-Resizing Input
 *
 * Dynamic font sizing based on content length:
 * - < 6 characters: 64pt (large)
 * - < 9 characters: 48pt (medium)
 * - >= 9 characters: 32pt (small)
 *
 * Smooth LayoutAnimation transitions between size classes.
 * SF Pro Rounded, Heavy Weight, Centered.
 */

type SizeClass = "large" | "medium" | "small";

interface AutoResizingInputProps extends Omit<TextInputProps, "style"> {
  value: string;
  onChangeText: (text: string) => void;
  currencySymbol?: string;
}

const getSizeClass = (length: number): SizeClass => {
  if (length < 6) return "large";
  if (length < 9) return "medium";
  return "small";
};

const fontSizes: Record<SizeClass, number> = {
  large: 64,
  medium: 48,
  small: 32,
};

const currencyFontSizes: Record<SizeClass, number> = {
  large: 48,
  medium: 36,
  small: 24,
};

export const AutoResizingInput = forwardRef<TextInput, AutoResizingInputProps>(
  ({ value, onChangeText, currencySymbol = "$", ...props }, ref) => {
    const { colors } = useTheme();
    const [sizeClass, setSizeClass] = useState<SizeClass>(() => getSizeClass(value.length));
    const prevSizeClass = useRef<SizeClass>(sizeClass);

    // Update size class when value changes
    useEffect(() => {
      const newSizeClass = getSizeClass(value.length);

      if (newSizeClass !== prevSizeClass.current) {
        // Trigger smooth animation when size class changes
        LayoutAnimation.configureNext({
          duration: 200,
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
        });

        setSizeClass(newSizeClass);
        prevSizeClass.current = newSizeClass;
      }
    }, [value]);

    const fontSize = fontSizes[sizeClass];
    const currencyFontSize = currencyFontSizes[sizeClass];

    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.currencySymbol,
            {
              color: colors.text,
              fontSize: currencyFontSize,
              lineHeight: fontSize * 1.1,
            },
          ]}
        >
          {currencySymbol}
        </Text>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize,
              lineHeight: fontSize * 1.1,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          selectionColor={colors.primary}
          {...props}
        />
      </View>
    );
  }
);

AutoResizingInput.displayName = "AutoResizingInput";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  currencySymbol: {
    fontWeight: "400",
    fontFamily: Platform.select({
      ios: "SF Pro Rounded",
      android: "System",
      default: "System",
    }),
    opacity: 0.5,
    marginRight: 4,
  },
  input: {
    fontWeight: "900", // Heavy
    fontFamily: Platform.select({
      ios: "SF Pro Rounded",
      android: "System",
      default: "System",
    }),
    letterSpacing: -2,
    textAlign: "center",
    minWidth: 80,
    fontVariant: ["tabular-nums"],
  },
});

export default AutoResizingInput;

```

---

## ./components/ui/Button.tsx

```typescript
import { Pressable, Text, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: ButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const baseClasses = "py-4 px-6 rounded-full items-center justify-center";
  const variantClasses = {
    primary: "bg-primary",
    secondary: "bg-gray-100",
    outline: "bg-transparent border border-gray-200",
  };
  const textClasses = {
    primary: "text-white font-semibold text-lg",
    secondary: "text-black font-semibold text-lg",
    outline: "text-black font-semibold text-lg",
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#000000"} />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </Pressable>
  );
}

```

---

## ./components/ui/Card.tsx

```typescript
import { View, Pressable, StyleSheet, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { ReactNode, useRef } from "react";

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined" | "gradient";
  className?: string;
}

export function Card({ children, onPress, variant = "default", className = "" }: CardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return styles.elevated;
      case "outlined":
        return styles.outlined;
      case "gradient":
        return styles.gradient;
      default:
        return styles.default;
    }
  };

  const content = (
    <View style={styles.innerHighlight}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.base, getVariantStyles()]}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.base, getVariantStyles()]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  default: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  outlined: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  gradient: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  innerHighlight: {
    // This adds subtle depth
  },
});

```

---

## ./components/ui/Input.tsx

```typescript
import { View, Text, TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm text-gray-500 mb-2 font-medium">{label}</Text>
      )}
      <TextInput
        className={`bg-gray-50 rounded-xl px-4 py-4 text-lg ${
          error ? "border border-red-500" : ""
        }`}
        placeholderTextColor="#999999"
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}

```

---

## ./components/VoiceButton.tsx

```typescript
import { View, Pressable, Animated, StyleSheet } from "react-native";
import { Mic } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRef, useEffect } from "react";
import { useTheme } from "@/lib/theme";

/**
 * Siri Orb - The Intelligence Center
 * Apple Design Award Foundation
 *
 * Idle: Floating translucent 80px circle with breathing animation
 * Active: Morphs to 200px pill with waveform visualization
 */

interface VoiceButtonProps {
  onPressIn: () => void;
  onPressOut: () => void;
  isRecording: boolean;
}

export function VoiceButton({
  onPressIn,
  onPressOut,
  isRecording,
}: VoiceButtonProps) {
  const { colors, glass } = useTheme();

  // Animation values
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const widthAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Waveform bars animation
  const waveBar1 = useRef(new Animated.Value(0.3)).current;
  const waveBar2 = useRef(new Animated.Value(0.5)).current;
  const waveBar3 = useRef(new Animated.Value(0.7)).current;
  const waveBar4 = useRef(new Animated.Value(0.4)).current;
  const waveBar5 = useRef(new Animated.Value(0.6)).current;

  // Breathing animation (idle state)
  useEffect(() => {
    if (!isRecording) {
      const breathe = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1.0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      breathe.start();
      return () => breathe.stop();
    } else {
      breatheAnim.setValue(1);
    }
  }, [isRecording]);

  // Morph to pill animation (active state)
  useEffect(() => {
    if (isRecording) {
      // Morph to pill
      Animated.parallel([
        Animated.spring(widthAnim, {
          toValue: 200,
          damping: 15,
          stiffness: 200,
          useNativeDriver: false,
        }),
      ]).start();

      // Start waveform animation
      const createWaveAnimation = (anim: Animated.Value, minVal: number, maxVal: number, duration: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: maxVal,
              duration: duration,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: minVal,
              duration: duration,
              useNativeDriver: false,
            }),
          ])
        );
      };

      const wave1 = createWaveAnimation(waveBar1, 0.2, 0.9, 300);
      const wave2 = createWaveAnimation(waveBar2, 0.3, 1.0, 250);
      const wave3 = createWaveAnimation(waveBar3, 0.4, 0.8, 350);
      const wave4 = createWaveAnimation(waveBar4, 0.2, 0.95, 280);
      const wave5 = createWaveAnimation(waveBar5, 0.3, 0.85, 320);

      wave1.start();
      wave2.start();
      wave3.start();
      wave4.start();
      wave5.start();

      return () => {
        wave1.stop();
        wave2.stop();
        wave3.stop();
        wave4.stop();
        wave5.stop();
      };
    } else {
      // Return to orb
      Animated.spring(widthAnim, {
        toValue: 80,
        damping: 15,
        stiffness: 200,
        useNativeDriver: false,
      }).start();

      // Reset waveform
      waveBar1.setValue(0.3);
      waveBar2.setValue(0.5);
      waveBar3.setValue(0.7);
      waveBar4.setValue(0.4);
      waveBar5.setValue(0.6);
    }
  }, [isRecording]);

  const handlePressIn = () => {
    // Rigid haptic for premium feel
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

    Animated.spring(scaleAnim, {
      toValue: 0.95,
      damping: 20,
      stiffness: 300,
      useNativeDriver: true,
    }).start();

    onPressIn();
  };

  const handlePressOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start();

    onPressOut();
  };

  const orbColor = isRecording ? colors.systemRed : colors.primary;
  const waveBarHeight = 32;

  return (
    <View style={styles.container}>
      {/* Ambient glow */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            backgroundColor: orbColor,
            opacity: isRecording ? 0.3 : 0.15,
            transform: [{ scale: breatheAnim }],
          },
        ]}
      />

      {/* Main orb/pill */}
      <Animated.View
        style={[
          {
            transform: [
              { scale: isRecording ? 1 : breatheAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <Animated.View
            style={[
              styles.orb,
              {
                width: widthAnim,
                backgroundColor: glass.background,
                borderColor: glass.border,
                shadowColor: orbColor,
                shadowOpacity: isRecording ? 0.5 : 0.3,
                shadowRadius: isRecording ? 20 : 12,
              },
            ]}
          >
            {/* Glass highlight */}
            <View style={styles.glassHighlight} />

            {/* Content: Mic icon or Waveform */}
            {!isRecording ? (
              <View style={styles.iconContainer}>
                <Mic size={28} color={colors.primary} strokeWidth={2.5} />
              </View>
            ) : (
              <View style={styles.waveformContainer}>
                {/* Mic icon (smaller) */}
                <Mic size={20} color={colors.systemRed} strokeWidth={2.5} style={{ marginRight: 12 }} />

                {/* Waveform bars */}
                <View style={styles.waveform}>
                  <Animated.View
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.systemRed,
                        height: waveBar1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, waveBarHeight],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.systemRed,
                        height: waveBar2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, waveBarHeight],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.systemRed,
                        height: waveBar3.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, waveBarHeight],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.systemRed,
                        height: waveBar4.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, waveBarHeight],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: colors.systemRed,
                        height: waveBar5.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, waveBarHeight],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  ambientGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  orb: {
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    overflow: "hidden",
  },
  glassHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    height: 40,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
});

```

---

## ./contexts/AuthContext.tsx

```typescript
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";
import { Profile } from "@/types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }

      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

```

---

## ./global.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

```

---

## ./lib/constants.ts

```typescript
export const COLORS = {
  primary: "#00D632", // Electric Green - Action/Money
  alert: "#FF9500", // Orange - Unpaid/Warning
  background: {
    light: "#FFFFFF",
    dark: "#000000",
  },
  text: {
    primary: "#000000",
    secondary: "#666666",
    light: "#999999",
    inverse: "#FFFFFF",
  },
  border: "#E5E5E5",
  success: "#00D632",
  error: "#FF3B30",
};

export const INVOICE_PREFIX = "INV-";

export const DEFAULT_TAX_RATE = 0;

export const CURRENCY = "USD";

export const CURRENCY_SYMBOL = "$";

```

---

## ./lib/supabase.ts

```typescript
// Re-export supabase client from services
// This allows imports from both @/lib/supabase and @/services/supabase
export { supabase, type Database } from "@/services/supabase";

```

---

## ./lib/theme.tsx

```typescript
import { createContext, useContext, useState, ReactNode } from "react";
import { useColorScheme, Platform } from "react-native";

/**
 * Theme Configuration
 * Apple Design Award Foundation - "Apple Physics"
 */

export const colors = {
  light: {
    // Brand Green for main actions
    primary: "#00D632",
    primaryDark: "#00B82B",

    // iOS Electric Status Colors
    statusPaid: "#34C759",      // iOS Green
    statusOverdue: "#FF3B30",   // iOS Red
    statusSent: "#007AFF",      // iOS Blue
    statusDraft: "#8E8E93",     // System Gray

    // System Colors
    systemBlue: "#007AFF",
    systemGreen: "#34C759",
    systemRed: "#FF3B30",
    systemOrange: "#FF9500",
    systemYellow: "#FFCC00",
    systemPurple: "#AF52DE",

    alert: "#FF9500",
    error: "#FF3B30",
    success: "#34C759",

    background: "#F2F2F7",
    backgroundSecondary: "#FFFFFF",
    backgroundTertiary: "#F8F9FA",

    text: "#000000",
    textSecondary: "#3C3C43",
    textTertiary: "#8E8E93",
    textInverse: "#FFFFFF",

    border: "rgba(0, 0, 0, 0.08)",
    borderLight: "rgba(0, 0, 0, 0.04)",

    card: "#FFFFFF",
    cardElevated: "#FFFFFF",

    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  dark: {
    // Brand Green for main actions
    primary: "#00D632",
    primaryDark: "#00FF41",

    // iOS Electric Status Colors (Dark Mode variants)
    statusPaid: "#30D158",      // iOS Green Dark
    statusOverdue: "#FF453A",   // iOS Red Dark
    statusSent: "#0A84FF",      // iOS Blue Dark
    statusDraft: "#98989D",     // System Gray 2

    // System Colors (Dark)
    systemBlue: "#0A84FF",
    systemGreen: "#30D158",
    systemRed: "#FF453A",
    systemOrange: "#FF9F0A",
    systemYellow: "#FFD60A",
    systemPurple: "#BF5AF2",

    alert: "#FF9F0A",
    error: "#FF453A",
    success: "#30D158",

    background: "#000000",
    backgroundSecondary: "#1C1C1E",
    backgroundTertiary: "#2C2C2E",

    text: "#FFFFFF",
    textSecondary: "#EBEBF5",
    textTertiary: "#8E8E93",
    textInverse: "#000000",

    border: "rgba(255, 255, 255, 0.1)",
    borderLight: "rgba(255, 255, 255, 0.05)",

    card: "#1C1C1E",
    cardElevated: "#2C2C2E",

    shadow: "#000000",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

/**
 * Glass Morphism Configuration
 * For translucent UI elements with blur
 */
export const glass = {
  light: {
    background: "rgba(255, 255, 255, 0.85)",
    backgroundThin: "rgba(255, 255, 255, 0.7)",
    backgroundUltraThin: "rgba(255, 255, 255, 0.5)",
    blur: 20,
    border: "rgba(255, 255, 255, 0.5)",
    borderSubtle: "rgba(255, 255, 255, 0.3)",
  },
  dark: {
    background: "rgba(30, 30, 30, 0.85)",
    backgroundThin: "rgba(30, 30, 30, 0.7)",
    backgroundUltraThin: "rgba(30, 30, 30, 0.5)",
    blur: 20,
    border: "rgba(255, 255, 255, 0.1)",
    borderSubtle: "rgba(255, 255, 255, 0.05)",
  },
};

/**
 * Typography - SF Pro Rounded
 * Apple Design Award Foundation
 * Weights: Heavy (900), Semibold (600), Medium (500)
 */
const fontFamily = Platform.select({
  ios: "SF Pro Rounded",
  android: "System",
  default: "System",
});

export const typography = {
  // Display - Heavy weight for impact
  // All styles include tabular-nums for consistent number widths (Financial Typography)
  largeTitle: {
    fontSize: 34,
    fontWeight: "900" as const, // Heavy
    fontFamily,
    letterSpacing: 0.37,
    lineHeight: 41,
    fontVariant: ["tabular-nums"] as const,
  },
  title1: {
    fontSize: 28,
    fontWeight: "900" as const, // Heavy
    fontFamily,
    letterSpacing: 0.36,
    lineHeight: 34,
    fontVariant: ["tabular-nums"] as const,
  },
  title2: {
    fontSize: 22,
    fontWeight: "900" as const, // Heavy
    fontFamily,
    letterSpacing: 0.35,
    lineHeight: 28,
    fontVariant: ["tabular-nums"] as const,
  },
  title3: {
    fontSize: 20,
    fontWeight: "600" as const, // Semibold
    fontFamily,
    letterSpacing: 0.38,
    lineHeight: 25,
    fontVariant: ["tabular-nums"] as const,
  },
  // Headlines - Semibold
  headline: {
    fontSize: 17,
    fontWeight: "600" as const, // Semibold
    fontFamily,
    letterSpacing: -0.41,
    lineHeight: 22,
    fontVariant: ["tabular-nums"] as const,
  },
  // Body - Medium
  body: {
    fontSize: 17,
    fontWeight: "500" as const, // Medium
    fontFamily,
    letterSpacing: -0.41,
    lineHeight: 22,
    fontVariant: ["tabular-nums"] as const,
  },
  callout: {
    fontSize: 16,
    fontWeight: "500" as const, // Medium
    fontFamily,
    letterSpacing: -0.32,
    lineHeight: 21,
    fontVariant: ["tabular-nums"] as const,
  },
  subhead: {
    fontSize: 15,
    fontWeight: "500" as const, // Medium
    fontFamily,
    letterSpacing: -0.24,
    lineHeight: 20,
    fontVariant: ["tabular-nums"] as const,
  },
  footnote: {
    fontSize: 13,
    fontWeight: "500" as const, // Medium
    fontFamily,
    letterSpacing: -0.08,
    lineHeight: 18,
    fontVariant: ["tabular-nums"] as const,
  },
  caption1: {
    fontSize: 12,
    fontWeight: "500" as const, // Medium
    fontFamily,
    letterSpacing: 0,
    lineHeight: 16,
    fontVariant: ["tabular-nums"] as const,
  },
  caption2: {
    fontSize: 11,
    fontWeight: "500" as const, // Medium
    fontFamily,
    letterSpacing: 0.07,
    lineHeight: 13,
    fontVariant: ["tabular-nums"] as const,
  },
  // Numbers - Heavy with tabular figures
  invoiceAmount: {
    fontSize: 22,
    fontWeight: "900" as const, // Heavy
    fontFamily,
    letterSpacing: -0.5,
    lineHeight: 28,
    fontVariant: ["tabular-nums"] as const,
  },
  amount: {
    fontSize: 44,
    fontWeight: "900" as const, // Heavy
    fontFamily,
    letterSpacing: -1,
    lineHeight: 52,
    fontVariant: ["tabular-nums"] as const,
  },
  amountSmall: {
    fontSize: 28,
    fontWeight: "900" as const, // Heavy
    fontFamily,
    letterSpacing: -0.5,
    lineHeight: 34,
    fontVariant: ["tabular-nums"] as const,
  },
  // Monospace numbers for counters/timers
  mono: {
    fontSize: 17,
    fontWeight: "600" as const,
    fontFamily: Platform.select({ ios: "SF Mono", default: "monospace" }),
    letterSpacing: 0,
    lineHeight: 22,
    fontVariant: ["tabular-nums"] as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border Radius - Squircle geometry
 * Apple's continuous corner radius
 */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

/**
 * Shadows - Soft, diffused Apple-style
 */
export const shadows = {
  light: {
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    elevated: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
    float: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.18,
      shadowRadius: 32,
      elevation: 12,
    },
  },
  dark: {
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 3,
    },
    elevated: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 8,
    },
    float: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.5,
      shadowRadius: 32,
      elevation: 12,
    },
  },
};

/**
 * Animation Physics - Apple-style spring configs
 */
export const physics = {
  // Quick, snappy interactions
  spring: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },
  // Smooth, gentle transitions
  gentle: {
    damping: 25,
    stiffness: 200,
    mass: 1,
  },
  // Bouncy, playful feel
  bouncy: {
    damping: 12,
    stiffness: 180,
    mass: 0.8,
  },
  // Breathing animation timing
  breathing: {
    duration: 2000,
    easing: "ease-in-out",
  },
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof colors.light;
  glass: typeof glass.light;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows.light;
  physics: typeof physics;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  const toggleTheme = () => setIsDark((prev) => !prev);

  const themeColors = isDark ? colors.dark : colors.light;
  const themeGlass = isDark ? glass.dark : glass.light;
  const themeShadows = isDark ? shadows.dark : shadows.light;

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        colors: themeColors,
        glass: themeGlass,
        typography,
        spacing,
        radius,
        shadows: themeShadows,
        physics,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Get status color based on invoice status
 * iOS Electric Status Colors
 */
export function getStatusColor(
  status: "draft" | "sent" | "paid" | "overdue" | "void",
  themeColors: typeof colors.light
): { background: string; text: string } {
  switch (status) {
    case "paid":
      return {
        background: themeColors.statusPaid + "20",
        text: themeColors.statusPaid,
      };
    case "overdue":
      return {
        background: themeColors.statusOverdue + "20",
        text: themeColors.statusOverdue,
      };
    case "sent":
      return {
        background: themeColors.statusSent + "20",
        text: themeColors.statusSent,
      };
    case "void":
      return {
        background: themeColors.textTertiary + "20",
        text: themeColors.textTertiary,
      };
    case "draft":
    default:
      return {
        background: themeColors.statusDraft + "20",
        text: themeColors.statusDraft,
      };
  }
}

```

---

## ./lib/utils.ts

```typescript
import { CURRENCY_SYMBOL } from "./constants";

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateInvoiceNumber(count: number): string {
  return `INV-${String(count).padStart(4, "0")}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

```

---

## ./metro.config.js

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });

```

---

## ./nativewind-env.d.ts

```typescript
/// <reference types="nativewind/types" />

// NOTE: This file should not be edited and should be committed with your source code. It is generated by NativeWind.
```

---

## ./package.json

```json
{
  "name": "contractorpro",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-native-community/netinfo": "^11.4.1",
    "@supabase/supabase-js": "^2.90.1",
    "babel-preset-expo": "^54.0.9",
    "expo": "~54.0.31",
    "expo-av": "~16.0.8",
    "expo-blur": "~15.0.8",
    "expo-constants": "~18.0.13",
    "expo-contacts": "~15.0.11",
    "expo-file-system": "^19.0.21",
    "expo-font": "~14.0.10",
    "expo-haptics": "~15.0.8",
    "expo-image-picker": "~17.0.10",
    "expo-linear-gradient": "~15.0.8",
    "expo-linking": "~8.0.11",
    "expo-location": "~19.0.8",
    "expo-print": "~15.0.8",
    "expo-router": "~6.0.21",
    "expo-sharing": "~14.0.8",
    "expo-status-bar": "~3.0.9",
    "expo-web-browser": "^15.0.10",
    "lucide-react-native": "^0.562.0",
    "nativewind": "^4.2.1",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "^4.2.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",
    "react-native-web": "^0.21.0",
    "react-native-worklets": "0.5.1",
    "tailwindcss": "^3.4.19",
    "zustand": "^5.0.9"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "babel-plugin-module-resolver": "^5.0.2",
    "typescript": "~5.9.2"
  },
  "private": true
}

```

---

## ./services/ai.ts

```typescript
/**
 * AI Service
 * Handles voice transcription and invoice parsing
 * Per architecture-spec.md - Uses Supabase Edge Functions
 */

import { supabase } from "./supabase";
import { ParsedInvoice } from "@/store/useInvoiceStore";
import { AIParseResult } from "@/types";
import * as db from "./database";

// Environment check for development mode
const isDevelopment = __DEV__;

/**
 * Process voice recording through AI pipeline
 * 1. Upload audio to Supabase Storage
 * 2. Call Edge Function for transcription + parsing
 * 3. Return structured invoice data
 */
export async function processVoiceToInvoice(
  audioUri: string
): Promise<{
  parsedInvoice: ParsedInvoice;
  voiceNoteId: string;
  confidence: number;
}> {
  try {
    // 1. Upload audio file to storage
    const fileName = `recording-${Date.now()}.m4a`;
    const storagePath = await db.uploadVoiceNote(audioUri, fileName);

    if (!storagePath) {
      throw new Error("Failed to upload audio file");
    }

    // 2. Create voice note record
    const voiceNote = await db.createVoiceNote({
      storage_path: storagePath,
      processing_status: "processing",
    });

    if (!voiceNote) {
      throw new Error("Failed to create voice note record");
    }

    // 3. Call Edge Function for AI processing
    const { data, error } = await supabase.functions.invoke<AIParseResult>(
      "transcribe-and-parse",
      {
        body: {
          voice_note_id: voiceNote.id,
          storage_path: storagePath,
        },
      }
    );

    if (error) {
      // Update voice note status to failed
      await db.updateVoiceNote(voiceNote.id, {
        processing_status: "failed",
      });
      throw error;
    }

    if (!data) {
      throw new Error("No data returned from AI processing");
    }

    // 4. Update voice note with results
    await db.updateVoiceNote(voiceNote.id, {
      transcript: data.notes || "",
      detected_language: data.meta.language_detected,
      confidence_score: data.meta.confidence,
      processing_status: "completed",
    });

    // 5. Convert AI result to ParsedInvoice format
    const parsedInvoice: ParsedInvoice = {
      clientName: data.client.name || "Unknown Client",
      clientEmail: undefined,
      clientPhone: data.client.contact_inferred || undefined,
      items: data.line_items.map((item) => ({
        description: item.description,
        price: item.unit_price / 100, // Convert from cents to dollars for display
        quantity: item.quantity,
        originalTranscriptSegment: item.original_transcript_segment,
      })),
      detectedLanguage: data.meta.language_detected,
      confidence: data.meta.confidence,
      notes: data.notes || undefined,
    };

    return {
      parsedInvoice,
      voiceNoteId: voiceNote.id,
      confidence: data.meta.confidence,
    };
  } catch (error) {
    console.error("Error processing voice to invoice:", error);

    // In development, fall back to mock data
    if (isDevelopment) {
      console.warn("Using mock data in development mode");
      return getMockParseResult();
    }

    throw error;
  }
}

/**
 * Transcribe audio only (without parsing)
 * Useful for manual review workflows
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  if (isDevelopment) {
    // Mock transcription for development
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "Invoice for John Smith. Lawn mowing service, one hundred fifty dollars.";
  }

  // Upload and get transcription via Edge Function
  const fileName = `recording-${Date.now()}.m4a`;
  const storagePath = await db.uploadVoiceNote(audioUri, fileName);

  if (!storagePath) {
    throw new Error("Failed to upload audio file");
  }

  const { data, error } = await supabase.functions.invoke<{ transcript: string }>(
    "transcribe-only",
    {
      body: { storage_path: storagePath },
    }
  );

  if (error) throw error;
  return data?.transcript || "";
}

/**
 * Parse transcript into invoice (without transcription step)
 * Useful when editing or re-processing text
 */
export async function parseTranscript(
  transcript: string,
  language?: string
): Promise<ParsedInvoice> {
  if (isDevelopment) {
    // Mock parsing for development
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      clientName: "John Smith",
      items: [{ description: "Lawn mowing service", price: 150, quantity: 1 }],
      detectedLanguage: language || "en",
    };
  }

  const { data, error } = await supabase.functions.invoke<AIParseResult>(
    "parse-transcript",
    {
      body: { transcript, language },
    }
  );

  if (error) throw error;

  if (!data) {
    throw new Error("No data returned from parsing");
  }

  return {
    clientName: data.client.name || "Unknown Client",
    items: data.line_items.map((item) => ({
      description: item.description,
      price: item.unit_price / 100,
      quantity: item.quantity,
      originalTranscriptSegment: item.original_transcript_segment,
    })),
    detectedLanguage: data.meta.language_detected,
    confidence: data.meta.confidence,
    notes: data.notes || undefined,
  };
}

/**
 * Mock data for development/testing
 */
function getMockParseResult(): {
  parsedInvoice: ParsedInvoice;
  voiceNoteId: string;
  confidence: number;
} {
  return {
    parsedInvoice: {
      clientName: "John Smith",
      clientEmail: "john@example.com",
      items: [
        {
          description: "Lawn mowing service",
          price: 150,
          quantity: 1,
          originalTranscriptSegment: "Lawn mowing service, one hundred fifty dollars",
        },
      ],
      detectedLanguage: "en",
      confidence: 0.95,
    },
    voiceNoteId: "mock-voice-note-id",
    confidence: 0.95,
  };
}

/**
 * Generate invoice PDF via Edge Function
 */
export async function generateInvoicePDF(invoiceId: string): Promise<string> {
  if (isDevelopment) {
    // Mock PDF generation for development
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `https://example.com/invoice-${invoiceId}.pdf`;
  }

  const { data, error } = await supabase.functions.invoke<{ pdf_url: string }>(
    "generate-invoice-pdf",
    {
      body: { invoice_id: invoiceId },
    }
  );

  if (error) throw error;
  return data?.pdf_url || "";
}

```

---

## ./services/audio.ts

```typescript
import { Audio } from "expo-av";

let recording: Audio.Recording | null = null;

export async function startRecording(): Promise<void> {
  try {
    // Request permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Audio recording permission not granted");
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create and start recording
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recording = newRecording;
  } catch (error) {
    console.error("Failed to start recording:", error);
    throw error;
  }
}

export async function stopRecording(): Promise<string | null> {
  try {
    if (!recording) {
      return null;
    }

    await recording.stopAndUnloadAsync();

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    recording = null;

    return uri;
  } catch (error) {
    console.error("Failed to stop recording:", error);
    recording = null;
    throw error;
  }
}

export async function playAudio(uri: string): Promise<void> {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  } catch (error) {
    console.error("Failed to play audio:", error);
    throw error;
  }
}

```

---

## ./services/database.ts

```typescript
/**
 * Database Service
 * CRUD operations for all Supabase tables
 * Per architecture-spec.md - All queries are scoped by RLS
 */

import { supabase } from "./supabase";
import {
  Profile,
  ProfileUpdate,
  Client,
  ClientInsert,
  ClientUpdate,
  Invoice,
  InvoiceInsert,
  InvoiceUpdate,
  InvoiceItem,
  InvoiceItemInsert,
  VoiceNote,
  VoiceNoteInsert,
  ReminderSettings,
  ReminderSettingsInsert,
  ReminderSettingsUpdate,
  GlossaryTerm,
} from "@/types/database";

// ============================================================================
// PROFILES
// ============================================================================

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function updateProfile(updates: ProfileUpdate): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  return data;
}

// ============================================================================
// CLIENTS
// ============================================================================

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return data || [];
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching client:", error);
    return null;
  }

  return data;
}

export async function createClient(client: Omit<ClientInsert, "user_id">): Promise<Client | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("clients")
    .insert({ ...client, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating client:", error);
    throw error;
  }

  return data;
}

export async function updateClient(id: string, updates: ClientUpdate): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating client:", error);
    throw error;
  }

  return data;
}

export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting client:", error);
    return false;
  }

  return true;
}

export async function searchClients(query: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error searching clients:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// INVOICES
// ============================================================================

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }

  return data || [];
}

export async function getInvoicesByStatus(status: Invoice["status"]): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices by status:", error);
    return [];
  }

  return data || [];
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }

  return data;
}

export async function getInvoiceWithItems(id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (invoiceError || !invoice) {
    console.error("Error fetching invoice:", invoiceError);
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Error fetching invoice items:", itemsError);
    return null;
  }

  return { invoice, items: items || [] };
}

export async function createInvoice(
  invoice: Omit<InvoiceInsert, "user_id">,
  items?: Omit<InvoiceItemInsert, "invoice_id">[]
): Promise<Invoice | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get next invoice number if not provided
  if (!invoice.invoice_number) {
    invoice.invoice_number = await getNextInvoiceNumber();
  }

  // Create invoice
  const { data: newInvoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({ ...invoice, user_id: user.id })
    .select()
    .single();

  if (invoiceError || !newInvoice) {
    console.error("Error creating invoice:", invoiceError);
    throw invoiceError;
  }

  // Create invoice items if provided
  if (items && items.length > 0) {
    const itemsWithInvoiceId = items.map((item) => ({
      ...item,
      invoice_id: newInvoice.id,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsWithInvoiceId);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
      // Rollback invoice creation
      await supabase.from("invoices").delete().eq("id", newInvoice.id);
      throw itemsError;
    }
  }

  return newInvoice;
}

export async function createInvoiceWithItems(
  invoice: Omit<InvoiceInsert, "user_id">,
  items: Omit<InvoiceItemInsert, "invoice_id">[]
): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get next invoice number if not provided
  if (!invoice.invoice_number) {
    invoice.invoice_number = await getNextInvoiceNumber();
  }

  // Create invoice
  const { data: newInvoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({ ...invoice, user_id: user.id })
    .select()
    .single();

  if (invoiceError || !newInvoice) {
    console.error("Error creating invoice:", invoiceError);
    throw invoiceError;
  }

  // Create invoice items
  const itemsWithInvoiceId = items.map((item) => ({
    ...item,
    invoice_id: newInvoice.id,
  }));

  const { data: newItems, error: itemsError } = await supabase
    .from("invoice_items")
    .insert(itemsWithInvoiceId)
    .select();

  if (itemsError) {
    console.error("Error creating invoice items:", itemsError);
    // Rollback invoice creation
    await supabase.from("invoices").delete().eq("id", newInvoice.id);
    throw itemsError;
  }

  return { invoice: newInvoice, items: newItems || [] };
}

export async function updateInvoice(id: string, updates: InvoiceUpdate): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }

  return data;
}

export async function updateInvoiceStatus(
  id: string,
  status: Invoice["status"],
  additionalUpdates?: Partial<InvoiceUpdate>
): Promise<Invoice | null> {
  const updates: InvoiceUpdate = { status, ...additionalUpdates };

  if (status === "paid") {
    updates.paid_at = new Date().toISOString();
  } else if (status === "sent") {
    updates.sent_at = new Date().toISOString();
  }

  return updateInvoice(id, updates);
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting invoice:", error);
    return false;
  }

  return true;
}

export async function getNextInvoiceNumber(): Promise<string> {
  const { count, error } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error getting invoice count:", error);
    return "INV-0001";
  }

  const nextNumber = (count || 0) + 1;
  return `INV-${nextNumber.toString().padStart(4, "0")}`;
}

// ============================================================================
// INVOICE ITEMS
// ============================================================================

export async function getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
  const { data, error } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching invoice items:", error);
    return [];
  }

  return data || [];
}

export async function createInvoiceItem(item: InvoiceItemInsert): Promise<InvoiceItem | null> {
  const { data, error } = await supabase
    .from("invoice_items")
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error("Error creating invoice item:", error);
    throw error;
  }

  return data;
}

export async function addInvoiceItem(item: InvoiceItemInsert): Promise<InvoiceItem | null> {
  // Alias for createInvoiceItem for backwards compatibility
  return createInvoiceItem(item);
}

export async function updateInvoiceItem(
  id: string,
  updates: Partial<InvoiceItem>
): Promise<InvoiceItem | null> {
  const { data, error } = await supabase
    .from("invoice_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating invoice item:", error);
    throw error;
  }

  return data;
}

export async function deleteInvoiceItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("invoice_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting invoice item:", error);
    return false;
  }

  return true;
}

// ============================================================================
// VOICE NOTES
// ============================================================================

export async function createVoiceNote(
  voiceNote: Omit<VoiceNoteInsert, "user_id">
): Promise<VoiceNote | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("voice_notes")
    .insert({ ...voiceNote, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating voice note:", error);
    throw error;
  }

  return data;
}

export async function updateVoiceNote(
  id: string,
  updates: Partial<VoiceNote>
): Promise<VoiceNote | null> {
  const { data, error } = await supabase
    .from("voice_notes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating voice note:", error);
    throw error;
  }

  return data;
}

// ============================================================================
// GLOSSARY (Read-only)
// ============================================================================

export async function getGlossaryTerms(language?: string): Promise<GlossaryTerm[]> {
  let query = supabase.from("glossary_terms").select("*");

  if (language) {
    query = query.eq("language", language);
  }

  const { data, error } = await query.order("term", { ascending: true });

  if (error) {
    console.error("Error fetching glossary terms:", error);
    return [];
  }

  return data || [];
}

// ============================================================================
// REMINDER SETTINGS
// ============================================================================

export async function getReminderSettings(): Promise<ReminderSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("reminder_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("Error fetching reminder settings:", error);
    return null;
  }

  return data;
}

export async function upsertReminderSettings(
  settings: Omit<ReminderSettingsInsert, "user_id">
): Promise<ReminderSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("reminder_settings")
    .upsert({ ...settings, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error upserting reminder settings:", error);
    throw error;
  }

  return data;
}

// ============================================================================
// DASHBOARD AGGREGATIONS
// ============================================================================

export async function getDashboardStats(): Promise<{
  totalRevenue: number;
  pendingAmount: number;
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
}> {
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("total, status");

  if (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalRevenue: 0,
      pendingAmount: 0,
      invoiceCount: 0,
      paidCount: 0,
      overdueCount: 0,
    };
  }

  const stats = (invoices || []).reduce(
    (acc, invoice) => {
      acc.invoiceCount++;

      if (invoice.status === "paid") {
        acc.totalRevenue += invoice.total;
        acc.paidCount++;
      } else if (invoice.status === "sent" || invoice.status === "overdue") {
        acc.pendingAmount += invoice.total;
        if (invoice.status === "overdue") {
          acc.overdueCount++;
        }
      }

      return acc;
    },
    {
      totalRevenue: 0,
      pendingAmount: 0,
      invoiceCount: 0,
      paidCount: 0,
      overdueCount: 0,
    }
  );

  return stats;
}

// ============================================================================
// FILE STORAGE
// ============================================================================

export async function uploadVoiceNote(
  uri: string,
  fileName: string
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const filePath = `${user.id}/${fileName}`;

  // Read file as blob
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from("voice-evidence")
    .upload(filePath, blob, {
      contentType: "audio/m4a",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading voice note:", error);
    throw error;
  }

  return data.path;
}

export async function uploadLogo(uri: string, fileName: string): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const filePath = `${user.id}/${fileName}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from("logos")
    .upload(filePath, blob, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading logo:", error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("logos")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 60
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Error getting signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

```

---

## ./services/export.ts

```typescript
/**
 * Export Service
 * Client-side service for exporting data (QuickBooks CSV/IIF)
 * Per product-strategy.md Section 3.4
 */

import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

export type ExportFormat = "csv" | "iif";

export interface ExportOptions {
  format?: ExportFormat;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  status?: "draft" | "sent" | "paid" | "void" | "overdue";
  includeItems?: boolean;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  localUri?: string;
  error?: string;
}

/**
 * Export invoices to QuickBooks-compatible format
 */
export async function exportInvoices(options: ExportOptions = {}): Promise<ExportResult> {
  try {
    // Get current session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return { success: false, error: "Not authenticated" };
    }

    // Call Edge Function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/export-quickbooks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          format: options.format || "csv",
          startDate: options.startDate,
          endDate: options.endDate,
          status: options.status,
          includeItems: options.includeItems ?? true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Export failed: ${response.status}`,
      };
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch?.[1] || `invoices_export.${options.format || "csv"}`;

    // Get the file content
    const content = await response.text();

    // Save to local file
    const localUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(localUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return {
      success: true,
      filename,
      localUri,
    };
  } catch (error: any) {
    console.error("Error exporting invoices:", error);
    return {
      success: false,
      error: error.message || "Failed to export invoices",
    };
  }
}

/**
 * Export and share invoices
 */
export async function exportAndShareInvoices(
  options: ExportOptions = {}
): Promise<ExportResult> {
  // First export to local file
  const result = await exportInvoices(options);

  if (!result.success || !result.localUri) {
    return result;
  }

  // Check if sharing is available
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    return {
      ...result,
      error: "Sharing is not available on this device",
    };
  }

  try {
    // Share the file
    await Sharing.shareAsync(result.localUri, {
      mimeType: options.format === "iif" ? "application/x-iif" : "text/csv",
      dialogTitle: "Export Invoices",
      UTI: options.format === "iif" ? "public.data" : "public.comma-separated-values-text",
    });

    return result;
  } catch (error: any) {
    // User may have cancelled sharing - still return success since file was created
    if (error.message?.includes("cancel")) {
      return result;
    }
    return {
      ...result,
      error: error.message,
    };
  }
}

/**
 * Get date range presets for export
 */
export function getDateRangePresets(): {
  label: string;
  value: string;
  getRange: () => { startDate: string; endDate: string };
}[] {
  return [
    {
      label: "This Month",
      value: "this_month",
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "Last Month",
      value: "last_month",
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "This Quarter",
      value: "this_quarter",
      getRange: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), quarter * 3, 1);
        const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "Last Quarter",
      value: "last_quarter",
      getRange: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3) - 1;
        const year = quarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const adjustedQuarter = quarter < 0 ? 3 : quarter;
        const start = new Date(year, adjustedQuarter * 3, 1);
        const end = new Date(year, adjustedQuarter * 3 + 3, 0);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "This Year",
      value: "this_year",
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "Last Year",
      value: "last_year",
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear() - 1, 0, 1);
        const end = new Date(now.getFullYear() - 1, 11, 31);
        return {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      },
    },
    {
      label: "All Time",
      value: "all_time",
      getRange: () => ({
        startDate: "",
        endDate: "",
      }),
    },
  ];
}

/**
 * Format export status for display
 */
export function getStatusOptions(): { label: string; value: string }[] {
  return [
    { label: "All Statuses", value: "" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Paid", value: "paid" },
    { label: "Overdue", value: "overdue" },
    { label: "Void", value: "void" },
  ];
}

```

---

## ./services/invoice.ts

```typescript
import { Share, Linking, Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { supabase } from "./supabase";
import { Invoice } from "@/types";
import { getPaymentLink } from "./stripe";

/**
 * Invoice Service
 * Handles PDF generation, sharing, and sending flows
 */

interface SendInvoiceResult {
  success: boolean;
  pdfUrl?: string;
  paymentUrl?: string;
  error?: string;
}

/**
 * Generate PDF for an invoice
 */
export async function generateInvoicePDF(invoiceId: string): Promise<{ pdfUrl: string } | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await supabase.functions.invoke("generate-invoice-pdf", {
      body: { invoice_id: invoiceId },
    });

    if (response.error) {
      console.error("PDF generation error:", response.error);
      return null;
    }

    return { pdfUrl: response.data.pdf_url };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return null;
  }
}

/**
 * Complete send invoice flow:
 * 1. Generate PDF
 * 2. Generate payment link (if Stripe connected)
 * 3. Open native share sheet
 */
export async function sendInvoice(
  invoice: Invoice,
  options: {
    includePaymentLink?: boolean;
    shareMethod?: "native" | "sms" | "whatsapp" | "email";
  } = {}
): Promise<SendInvoiceResult> {
  const { includePaymentLink = true, shareMethod = "native" } = options;

  try {
    // 1. Generate PDF
    const pdfResult = await generateInvoicePDF(invoice.id);

    // 2. Generate payment link if requested
    let paymentUrl: string | undefined;
    if (includePaymentLink && invoice.status !== "paid") {
      const paymentResult = await getPaymentLink(invoice.id);
      paymentUrl = paymentResult?.url;
    }

    // 3. Construct message
    const message = constructInvoiceMessage(invoice, paymentUrl);

    // 4. Share via selected method
    switch (shareMethod) {
      case "sms":
        await shareViaSMS(invoice, message);
        break;
      case "whatsapp":
        await shareViaWhatsApp(invoice, message);
        break;
      case "email":
        await shareViaEmail(invoice, message, pdfResult?.pdfUrl);
        break;
      default:
        await shareNative(invoice, message, pdfResult?.pdfUrl);
    }

    return {
      success: true,
      pdfUrl: pdfResult?.pdfUrl,
      paymentUrl,
    };
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return {
      success: false,
      error: error.message || "Failed to send invoice",
    };
  }
}

/**
 * Construct the invoice message for sharing
 * Highlights ease of payment for professional appearance
 */
function constructInvoiceMessage(invoice: Invoice, paymentUrl?: string): string {
  const amount = formatCurrency(invoice.total, invoice.currency);

  let message = `Hi ${invoice.client_name.split(" ")[0]},\n\n`;
  message += `Here is your invoice for ${amount}.\n\n`;
  message += `You can pay securely via Apple Pay, Google Pay, or Card here:\n`;
  message += `${paymentUrl}\n\n`;
  message += `Thank you for your business!`;

  return message;
}

/**
 * Share via native share sheet
 */
async function shareNative(
  invoice: Invoice,
  message: string,
  pdfUrl?: string
): Promise<void> {
  const shareOptions: { message: string; url?: string; title?: string } = {
    message,
    title: `Invoice ${invoice.invoice_number}`,
  };

  // Add PDF URL if available
  if (pdfUrl) {
    shareOptions.url = pdfUrl;
  }

  await Share.share(shareOptions);
}

/**
 * Share via SMS (Native)
 * Per product-strategy.md - "trust from known number"
 */
async function shareViaSMS(invoice: Invoice, message: string): Promise<void> {
  const phoneNumber = invoice.client_phone || "";
  const encodedMessage = encodeURIComponent(message);

  // Different URL schemes for iOS and Android
  const smsUrl = Platform.select({
    ios: `sms:${phoneNumber}&body=${encodedMessage}`,
    android: `sms:${phoneNumber}?body=${encodedMessage}`,
  });

  if (smsUrl && (await Linking.canOpenURL(smsUrl))) {
    await Linking.openURL(smsUrl);
  } else {
    // Fallback to native share
    await Share.share({ message });
  }
}

/**
 * Share via WhatsApp
 */
async function shareViaWhatsApp(invoice: Invoice, message: string): Promise<void> {
  const phoneNumber = invoice.client_phone?.replace(/\D/g, "") || "";
  const encodedMessage = encodeURIComponent(message);

  // WhatsApp URL scheme
  const whatsappUrl = phoneNumber
    ? `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`
    : `whatsapp://send?text=${encodedMessage}`;

  if (await Linking.canOpenURL(whatsappUrl)) {
    await Linking.openURL(whatsappUrl);
  } else {
    // WhatsApp not installed, try web version
    const webUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    await Linking.openURL(webUrl);
  }
}

/**
 * Share via Email
 */
async function shareViaEmail(
  invoice: Invoice,
  message: string,
  pdfUrl?: string
): Promise<void> {
  const email = invoice.client_email || "";
  const subject = encodeURIComponent(`Invoice ${invoice.invoice_number}`);
  const body = encodeURIComponent(message);

  const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

  if (await Linking.canOpenURL(mailtoUrl)) {
    await Linking.openURL(mailtoUrl);
  } else {
    // Fallback to native share
    await Share.share({ message, title: `Invoice ${invoice.invoice_number}` });
  }
}

/**
 * Format currency for display
 */
function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Download PDF to device
 */
export async function downloadInvoicePDF(
  invoiceId: string,
  invoiceNumber: string
): Promise<string | null> {
  try {
    const pdfResult = await generateInvoicePDF(invoiceId);
    if (!pdfResult?.pdfUrl) return null;

    const fileName = `Invoice_${invoiceNumber.replace(/\s/g, "_")}.html`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    const downloadResult = await FileSystem.downloadAsync(
      pdfResult.pdfUrl,
      fileUri
    );

    if (downloadResult.status === 200) {
      return downloadResult.uri;
    }

    return null;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    return null;
  }
}

/**
 * Share downloaded file
 */
export async function shareFile(fileUri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
}

/**
 * Generate reminder message for overdue invoices
 * Per product-strategy.md "Bad Cop" system
 */
export function generateReminderMessage(
  invoice: Invoice,
  reminderNumber: number = 1,
  paymentUrl?: string
): string {
  const amount = formatCurrency(invoice.total, invoice.currency);
  const daysPastDue = invoice.due_date
    ? Math.floor(
        (Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  let message = "";

  if (reminderNumber === 1) {
    // Friendly first reminder
    message = `Hi ${invoice.client_name.split(" ")[0]},\n\n`;
    message += `This is a friendly reminder about invoice ${invoice.invoice_number} for ${amount}.\n`;
    if (daysPastDue > 0) {
      message += `The payment was due ${daysPastDue} day${daysPastDue > 1 ? "s" : ""} ago.\n`;
    }
  } else if (reminderNumber === 2) {
    // Second reminder - more direct
    message = `Hi ${invoice.client_name.split(" ")[0]},\n\n`;
    message += `We haven't received payment for invoice ${invoice.invoice_number} (${amount}).\n`;
    message += `This invoice is now ${daysPastDue} days overdue.\n`;
    message += `Please arrange payment at your earliest convenience.\n`;
  } else {
    // Final notice
    message = `PAYMENT REMINDER\n\n`;
    message += `Invoice: ${invoice.invoice_number}\n`;
    message += `Amount: ${amount}\n`;
    message += `Days Overdue: ${daysPastDue}\n\n`;
    message += `Please make payment immediately to avoid further action.\n`;
  }

  if (paymentUrl) {
    message += `\nPay now: ${paymentUrl}\n`;
  }

  return message;
}

/**
 * Check if sharing is available
 */
export async function canShare(): Promise<boolean> {
  return Sharing.isAvailableAsync();
}

```

---

## ./services/offline.ts

```typescript
/**
 * Offline Service
 * Handles offline data sync, queued uploads, and local draft storage
 * Per product-strategy.md - contractors often work in areas with poor connectivity
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import * as FileSystem from "expo-file-system";
import { supabase } from "@/lib/supabase";
import { Invoice, InvoiceItem } from "@/types";

// Storage keys
const STORAGE_KEYS = {
  PENDING_UPLOADS: "offline:pending_uploads",
  DRAFT_INVOICES: "offline:draft_invoices",
  PENDING_VOICE_NOTES: "offline:pending_voice_notes",
  SYNC_QUEUE: "offline:sync_queue",
  LAST_SYNC: "offline:last_sync",
};

// Types
interface PendingUpload {
  id: string;
  type: "voice_note" | "logo" | "invoice_pdf";
  localUri: string;
  storagePath: string;
  metadata?: Record<string, any>;
  createdAt: string;
  retryCount: number;
}

interface DraftInvoice {
  id: string;
  clientName?: string;
  clientId?: string;
  items: Partial<InvoiceItem>[];
  notes?: string;
  transcript?: string;
  voiceNoteUri?: string;
  createdAt: string;
  updatedAt: string;
}

interface SyncQueueItem {
  id: string;
  action: "create" | "update" | "delete";
  table: string;
  data: Record<string, any>;
  createdAt: string;
  retryCount: number;
}

// Connection state
let isOnline = true;
let connectionListeners: ((online: boolean) => void)[] = [];

/**
 * Initialize offline service and start monitoring connectivity
 */
export async function initOfflineService(): Promise<void> {
  // Get initial connection state
  const state = await NetInfo.fetch();
  isOnline = state.isConnected ?? true;

  // Subscribe to connection changes
  NetInfo.addEventListener(handleConnectionChange);

  // If online, try to sync any pending items
  if (isOnline) {
    syncPendingItems();
  }
}

/**
 * Handle connection state changes
 */
function handleConnectionChange(state: NetInfoState): void {
  const wasOnline = isOnline;
  isOnline = state.isConnected ?? true;

  // Notify listeners
  connectionListeners.forEach((listener) => listener(isOnline));

  // If we just came online, sync pending items
  if (!wasOnline && isOnline) {
    console.log("Connection restored, syncing pending items...");
    syncPendingItems();
  }
}

/**
 * Subscribe to connection changes
 */
export function subscribeToConnectionChanges(
  callback: (online: boolean) => void
): () => void {
  connectionListeners.push(callback);
  return () => {
    connectionListeners = connectionListeners.filter((cb) => cb !== callback);
  };
}

/**
 * Check if currently online
 */
export function checkIsOnline(): boolean {
  return isOnline;
}

// =============================================================================
// PENDING UPLOADS (Voice Notes, Logos, PDFs)
// =============================================================================

/**
 * Queue a file for upload when online
 */
export async function queueUpload(upload: Omit<PendingUpload, "id" | "createdAt" | "retryCount">): Promise<string> {
  const pending = await getPendingUploads();

  const newUpload: PendingUpload = {
    ...upload,
    id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  pending.push(newUpload);
  await AsyncStorage.setItem(STORAGE_KEYS.PENDING_UPLOADS, JSON.stringify(pending));

  // Try to upload immediately if online
  if (isOnline) {
    processUploadQueue();
  }

  return newUpload.id;
}

/**
 * Get all pending uploads
 */
export async function getPendingUploads(): Promise<PendingUpload[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_UPLOADS);
  return data ? JSON.parse(data) : [];
}

/**
 * Process the upload queue
 */
async function processUploadQueue(): Promise<void> {
  const pending = await getPendingUploads();
  if (pending.length === 0) return;

  const remaining: PendingUpload[] = [];

  for (const upload of pending) {
    try {
      // Check if file still exists
      const fileInfo = await FileSystem.getInfoAsync(upload.localUri);
      if (!fileInfo.exists) {
        console.log(`File no longer exists: ${upload.localUri}`);
        continue;
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(upload.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Determine content type
      const contentType = getContentType(upload.localUri);

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(getBucketName(upload.type))
        .upload(upload.storagePath, decode(base64), {
          contentType,
          upsert: true,
        });

      if (error) {
        throw error;
      }

      console.log(`Successfully uploaded: ${upload.storagePath}`);

      // Delete local file after successful upload
      await FileSystem.deleteAsync(upload.localUri, { idempotent: true });
    } catch (error) {
      console.error(`Failed to upload ${upload.id}:`, error);

      // Increment retry count
      upload.retryCount++;

      // Keep in queue if under max retries
      if (upload.retryCount < 5) {
        remaining.push(upload);
      } else {
        console.error(`Max retries exceeded for upload: ${upload.id}`);
      }
    }
  }

  await AsyncStorage.setItem(STORAGE_KEYS.PENDING_UPLOADS, JSON.stringify(remaining));
}

// =============================================================================
// DRAFT INVOICES
// =============================================================================

/**
 * Save a draft invoice locally
 */
export async function saveDraftInvoice(draft: Omit<DraftInvoice, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const drafts = await getDraftInvoices();

  const newDraft: DraftInvoice = {
    ...draft,
    id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  drafts.push(newDraft);
  await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_INVOICES, JSON.stringify(drafts));

  return newDraft.id;
}

/**
 * Update an existing draft invoice
 */
export async function updateDraftInvoice(id: string, updates: Partial<DraftInvoice>): Promise<void> {
  const drafts = await getDraftInvoices();
  const index = drafts.findIndex((d) => d.id === id);

  if (index !== -1) {
    drafts[index] = {
      ...drafts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_INVOICES, JSON.stringify(drafts));
  }
}

/**
 * Get all draft invoices
 */
export async function getDraftInvoices(): Promise<DraftInvoice[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT_INVOICES);
  return data ? JSON.parse(data) : [];
}

/**
 * Get a specific draft invoice
 */
export async function getDraftInvoice(id: string): Promise<DraftInvoice | null> {
  const drafts = await getDraftInvoices();
  return drafts.find((d) => d.id === id) || null;
}

/**
 * Delete a draft invoice
 */
export async function deleteDraftInvoice(id: string): Promise<void> {
  const drafts = await getDraftInvoices();
  const filtered = drafts.filter((d) => d.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_INVOICES, JSON.stringify(filtered));
}

// =============================================================================
// SYNC QUEUE (Database Operations)
// =============================================================================

/**
 * Queue a database operation for when online
 */
export async function queueDatabaseOperation(
  action: "create" | "update" | "delete",
  table: string,
  data: Record<string, any>
): Promise<string> {
  const queue = await getSyncQueue();

  const item: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action,
    table,
    data,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  queue.push(item);
  await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));

  // Try to sync immediately if online
  if (isOnline) {
    processSyncQueue();
  }

  return item.id;
}

/**
 * Get all items in sync queue
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
  return data ? JSON.parse(data) : [];
}

/**
 * Process the sync queue
 */
async function processSyncQueue(): Promise<void> {
  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      let error;

      switch (item.action) {
        case "create":
          ({ error } = await supabase.from(item.table).insert(item.data));
          break;
        case "update":
          const { id, ...updateData } = item.data;
          ({ error } = await supabase.from(item.table).update(updateData).eq("id", id));
          break;
        case "delete":
          ({ error } = await supabase.from(item.table).delete().eq("id", item.data.id));
          break;
      }

      if (error) {
        throw error;
      }

      console.log(`Successfully synced: ${item.action} on ${item.table}`);
    } catch (error) {
      console.error(`Failed to sync ${item.id}:`, error);

      item.retryCount++;

      if (item.retryCount < 5) {
        remaining.push(item);
      } else {
        console.error(`Max retries exceeded for sync: ${item.id}`);
      }
    }
  }

  await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remaining));
}

// =============================================================================
// MAIN SYNC FUNCTION
// =============================================================================

/**
 * Sync all pending items (uploads + database operations)
 */
export async function syncPendingItems(): Promise<{
  uploads: number;
  operations: number;
  errors: number;
}> {
  if (!isOnline) {
    return { uploads: 0, operations: 0, errors: 0 };
  }

  const uploadsBefore = (await getPendingUploads()).length;
  const queueBefore = (await getSyncQueue()).length;

  await Promise.all([processUploadQueue(), processSyncQueue()]);

  const uploadsAfter = (await getPendingUploads()).length;
  const queueAfter = (await getSyncQueue()).length;

  const result = {
    uploads: uploadsBefore - uploadsAfter,
    operations: queueBefore - queueAfter,
    errors: uploadsAfter + queueAfter,
  };

  // Update last sync time
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

  return result;
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
}

/**
 * Get pending item counts
 */
export async function getPendingCounts(): Promise<{
  uploads: number;
  operations: number;
  drafts: number;
}> {
  const [uploads, operations, drafts] = await Promise.all([
    getPendingUploads(),
    getSyncQueue(),
    getDraftInvoices(),
  ]);

  return {
    uploads: uploads.length,
    operations: operations.length,
    drafts: drafts.length,
  };
}

/**
 * Clear all offline data (use with caution)
 */
export async function clearOfflineData(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.PENDING_UPLOADS),
    AsyncStorage.removeItem(STORAGE_KEYS.DRAFT_INVOICES),
    AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE),
    AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC),
  ]);
}

// =============================================================================
// HELPERS
// =============================================================================

function getBucketName(type: PendingUpload["type"]): string {
  switch (type) {
    case "voice_note":
      return "voice-evidence";
    case "logo":
      return "logos";
    case "invoice_pdf":
      return "invoice-pdfs";
    default:
      return "voice-evidence";
  }
}

function getContentType(uri: string): string {
  const extension = uri.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "m4a":
      return "audio/mp4";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

// Base64 decode helper
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

```

---

## ./services/stripe.ts

```typescript
/**
 * Stripe Service
 * Handles Stripe Connect operations
 * Per architecture-spec.md Section 4
 */

import { supabase } from "./supabase";
import { StripeAccountStatus } from "@/types";

/**
 * Get Stripe Connect onboarding URL
 */
export async function getConnectOnboardingUrl(): Promise<{
  url: string;
  accountId: string;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke<{
      url: string;
      account_id: string;
    }>("create-connect-account", {
      body: {
        return_url: "contractorpro://stripe/return",
        refresh_url: "contractorpro://stripe/refresh",
      },
    });

    if (error) throw error;

    return data
      ? { url: data.url, accountId: data.account_id }
      : null;
  } catch (error) {
    console.error("Error getting onboarding URL:", error);
    throw error;
  }
}

/**
 * Check Stripe account status
 */
export async function getStripeAccountStatus(): Promise<StripeAccountStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        isConnected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        accountId: null,
      };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("stripe_account_id, charges_enabled, payouts_enabled")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return {
        isConnected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        accountId: null,
      };
    }

    return {
      isConnected: !!profile.stripe_account_id,
      chargesEnabled: profile.charges_enabled || false,
      payoutsEnabled: profile.payouts_enabled || false,
      accountId: profile.stripe_account_id,
    };
  } catch (error) {
    console.error("Error getting Stripe status:", error);
    return {
      isConnected: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      accountId: null,
    };
  }
}

/**
 * Generate payment link for an invoice
 */
export async function generatePaymentLink(invoiceId: string): Promise<{
  paymentLinkUrl: string;
  paymentIntentId: string;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke<{
      payment_link_url: string;
      payment_intent_id: string;
    }>("generate-payment-link", {
      body: { invoice_id: invoiceId },
    });

    if (error) throw error;

    return data
      ? {
          paymentLinkUrl: data.payment_link_url,
          paymentIntentId: data.payment_intent_id,
        }
      : null;
  } catch (error) {
    console.error("Error generating payment link:", error);
    throw error;
  }
}

/**
 * Refresh Stripe account status from API
 */
export async function refreshAccountStatus(): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "refresh-stripe-status",
      {}
    );

    if (error) {
      console.error("Error refreshing status:", error);
    }
  } catch (error) {
    console.error("Error refreshing Stripe status:", error);
  }
}

```

---

## ./services/supabase.ts

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// Typed Supabase client per architecture-spec.md
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Re-export types for convenience
export type { Database } from "@/types/database";

```

---

## ./services/twilio.ts

```typescript
/**
 * Twilio Service
 * SMS sending for automated reminders ("Bad Cop" system)
 * Per product-strategy.md Section 3.3
 */

const TWILIO_ACCOUNT_SID = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER;

interface SendSMSParams {
  to: string;
  body: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS via Twilio
 * Note: In production, this should be called from an Edge Function
 * to keep credentials secure
 */
export async function sendSMS(params: SendSMSParams): Promise<SMSResult> {
  const { to, body } = params;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn("Twilio credentials not configured");
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formatPhoneNumber(to),
        From: TWILIO_PHONE_NUMBER,
        Body: body,
      }).toString(),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.sid };
    } else {
      return { success: false, error: data.message || "Failed to send SMS" };
    }
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // If it doesn't start with country code, assume US (+1)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // If it already has country code
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }

  return phone;
}

/**
 * Generate reminder message from template
 */
export function generateReminderMessage(
  template: string,
  variables: {
    invoice_number: string;
    business_name: string;
    total: string;
    due_date?: string;
    days_overdue?: number;
    payment_link?: string;
  }
): string {
  let message = template;

  // Replace template variables
  message = message.replace(/\{\{invoice_number\}\}/g, variables.invoice_number);
  message = message.replace(/\{\{business_name\}\}/g, variables.business_name);
  message = message.replace(/\{\{total\}\}/g, variables.total);

  if (variables.due_date) {
    message = message.replace(/\{\{due_date\}\}/g, variables.due_date);
  }

  if (variables.days_overdue !== undefined) {
    message = message.replace(/\{\{days_overdue\}\}/g, String(variables.days_overdue));
  }

  if (variables.payment_link) {
    message = message.replace(/\{\{payment_link\}\}/g, variables.payment_link);
  }

  return message;
}

/**
 * Default reminder message templates
 */
export const DEFAULT_REMINDER_TEMPLATES = {
  friendly: `Hi! This is a friendly reminder about invoice {{invoice_number}} from {{business_name}}. Amount due: {{total}}. Thank you for your business!`,

  standard: `Reminder: Invoice {{invoice_number}} from {{business_name}} for {{total}} is now {{days_overdue}} days overdue. Please arrange payment at your earliest convenience.`,

  urgent: `URGENT: Invoice {{invoice_number}} from {{business_name}} for {{total}} is {{days_overdue}} days past due. Immediate payment is required. Pay now: {{payment_link}}`,

  final: `FINAL NOTICE: Invoice {{invoice_number}} ({{total}}) is seriously overdue. Please contact {{business_name}} immediately to arrange payment and avoid further action.`,
};

/**
 * Get appropriate template based on days overdue
 */
export function getTemplateForDaysOverdue(daysOverdue: number): string {
  if (daysOverdue <= 3) {
    return DEFAULT_REMINDER_TEMPLATES.friendly;
  } else if (daysOverdue <= 7) {
    return DEFAULT_REMINDER_TEMPLATES.standard;
  } else if (daysOverdue <= 14) {
    return DEFAULT_REMINDER_TEMPLATES.urgent;
  } else {
    return DEFAULT_REMINDER_TEMPLATES.final;
  }
}

```

---

## ./store/useClientStore.ts

```typescript
import { create } from "zustand";
import { Client, ClientInsert, ClientUpdate } from "@/types/database";
import * as db from "@/services/database";

interface ClientState {
  // Data
  clients: Client[];
  currentClient: Client | null;
  searchResults: Client[];

  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  isSaving: boolean;

  // Actions
  fetchClients: () => Promise<void>;
  fetchClient: (id: string) => Promise<void>;
  createClient: (client: Omit<ClientInsert, "user_id">) => Promise<Client | null>;
  updateClient: (id: string, updates: ClientUpdate) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  searchClients: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Reset
  reset: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  currentClient: null,
  searchResults: [],
  isLoading: false,
  isSearching: false,
  isSaving: false,

  fetchClients: async () => {
    set({ isLoading: true });
    try {
      const clients = await db.getClients();
      set({ clients, isLoading: false });
    } catch (error) {
      console.error("Error fetching clients:", error);
      set({ isLoading: false });
    }
  },

  fetchClient: async (id: string) => {
    set({ isLoading: true });
    try {
      const client = await db.getClient(id);
      set({ currentClient: client, isLoading: false });
    } catch (error) {
      console.error("Error fetching client:", error);
      set({ isLoading: false });
    }
  },

  createClient: async (client) => {
    set({ isSaving: true });
    try {
      const newClient = await db.createClient(client);
      if (newClient) {
        set((state) => ({
          clients: [...state.clients, newClient].sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
          isSaving: false,
        }));
        return newClient;
      }
      set({ isSaving: false });
      return null;
    } catch (error) {
      console.error("Error creating client:", error);
      set({ isSaving: false });
      throw error;
    }
  },

  updateClient: async (id: string, updates: ClientUpdate) => {
    set({ isSaving: true });
    try {
      const updated = await db.updateClient(id, updates);
      if (updated) {
        set((state) => ({
          clients: state.clients
            .map((c) => (c.id === id ? updated : c))
            .sort((a, b) => a.name.localeCompare(b.name)),
          currentClient:
            state.currentClient?.id === id ? updated : state.currentClient,
          isSaving: false,
        }));
      } else {
        set({ isSaving: false });
      }
    } catch (error) {
      console.error("Error updating client:", error);
      set({ isSaving: false });
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    try {
      const success = await db.deleteClient(id);
      if (success) {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
          currentClient:
            state.currentClient?.id === id ? null : state.currentClient,
        }));
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  },

  searchClients: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearching: true });
    try {
      const results = await db.searchClients(query);
      set({ searchResults: results, isSearching: false });
    } catch (error) {
      console.error("Error searching clients:", error);
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ searchResults: [] }),

  reset: () =>
    set({
      clients: [],
      currentClient: null,
      searchResults: [],
      isLoading: false,
      isSearching: false,
      isSaving: false,
    }),
}));

```

---

## ./store/useDashboardStore.ts

```typescript
import { create } from "zustand";
import { DashboardStats } from "@/types";
import * as db from "@/services/database";

interface DashboardState {
  // Data
  stats: DashboardStats;

  // Loading state
  isLoading: boolean;

  // Actions
  fetchDashboardStats: () => Promise<void>;

  // Reset
  reset: () => void;
}

const defaultStats: DashboardStats = {
  totalRevenue: 0,
  pendingAmount: 0,
  invoiceCount: 0,
  paidCount: 0,
  overdueCount: 0,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: defaultStats,
  isLoading: false,

  fetchDashboardStats: async () => {
    set({ isLoading: true });
    try {
      const stats = await db.getDashboardStats();
      set({ stats, isLoading: false });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      set({ isLoading: false });
    }
  },

  reset: () =>
    set({
      stats: defaultStats,
      isLoading: false,
    }),
}));

```

---

## ./store/useInvoiceStore.ts

```typescript
import { create } from "zustand";
import { Invoice, InvoiceItem } from "@/types/database";
import * as db from "@/services/database";

// Parsed invoice from AI (before saving to database)
export interface ParsedInvoice {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  items: {
    description: string;
    price: number;
    quantity?: number;
    originalTranscriptSegment?: string;
  }[];
  detectedLanguage: string;
  confidence?: number;
  notes?: string;
  dueDate?: string; // ISO date string
}

interface InvoiceState {
  // Data
  invoices: Invoice[];
  currentInvoice: { invoice: Invoice; items: InvoiceItem[] } | null;
  pendingInvoice: ParsedInvoice | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;

  // Actions
  fetchInvoices: () => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  createInvoice: (
    invoice: Omit<Parameters<typeof db.createInvoice>[0], "user_id">,
    items: Parameters<typeof db.createInvoice>[1]
  ) => Promise<Invoice | null>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  // Pending invoice (from AI parsing)
  setPendingInvoice: (invoice: ParsedInvoice | null) => void;
  clearPendingInvoice: () => void;

  // Reset
  reset: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  currentInvoice: null,
  pendingInvoice: null,
  isLoading: false,
  isCreating: false,

  fetchInvoices: async () => {
    set({ isLoading: true });
    try {
      const invoices = await db.getInvoices();
      set({ invoices, isLoading: false });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      set({ isLoading: false });
    }
  },

  fetchInvoice: async (id: string) => {
    set({ isLoading: true });
    try {
      const result = await db.getInvoiceWithItems(id);
      set({ currentInvoice: result, isLoading: false });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      set({ isLoading: false });
    }
  },

  createInvoice: async (invoice, items) => {
    set({ isCreating: true });
    try {
      const result = await db.createInvoice(invoice, items);
      if (result) {
        set((state) => ({
          invoices: [result.invoice, ...state.invoices],
          isCreating: false,
        }));
        return result.invoice;
      }
      set({ isCreating: false });
      return null;
    } catch (error) {
      console.error("Error creating invoice:", error);
      set({ isCreating: false });
      throw error;
    }
  },

  updateInvoice: async (id: string, updates: Partial<Invoice>) => {
    try {
      const updated = await db.updateInvoice(id, updates);
      if (updated) {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updated } : inv
          ),
          currentInvoice:
            state.currentInvoice?.invoice.id === id
              ? { ...state.currentInvoice, invoice: updated }
              : state.currentInvoice,
        }));
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  },

  updateInvoiceStatus: async (id: string, status: Invoice["status"]) => {
    try {
      const updated = await db.updateInvoiceStatus(id, status);
      if (updated) {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updated } : inv
          ),
          currentInvoice:
            state.currentInvoice?.invoice.id === id
              ? { ...state.currentInvoice, invoice: updated }
              : state.currentInvoice,
        }));
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
      throw error;
    }
  },

  deleteInvoice: async (id: string) => {
    try {
      const success = await db.deleteInvoice(id);
      if (success) {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
          currentInvoice:
            state.currentInvoice?.invoice.id === id ? null : state.currentInvoice,
        }));
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  },

  setPendingInvoice: (invoice) => set({ pendingInvoice: invoice }),

  clearPendingInvoice: () => set({ pendingInvoice: null }),

  reset: () =>
    set({
      invoices: [],
      currentInvoice: null,
      pendingInvoice: null,
      isLoading: false,
      isCreating: false,
    }),
}));

```

---

## ./store/useOfflineStore.ts

```typescript
import { create } from "zustand";
import * as offline from "@/services/offline";

interface OfflineState {
  // Connection state
  isOnline: boolean;
  isInitialized: boolean;

  // Pending counts
  pendingUploads: number;
  pendingOperations: number;
  draftCount: number;

  // Sync state
  isSyncing: boolean;
  lastSyncTime: string | null;

  // Actions
  initialize: () => Promise<void>;
  setOnline: (online: boolean) => void;
  syncNow: () => Promise<{ uploads: number; operations: number; errors: number }>;
  refreshCounts: () => Promise<void>;

  // Draft management
  getDrafts: () => Promise<offline.DraftInvoice[]>;
  saveDraft: (draft: Omit<offline.DraftInvoice, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  updateDraft: (id: string, updates: Partial<offline.DraftInvoice>) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;

  // Reset
  reset: () => void;
}

// Re-export types for convenience
export type { DraftInvoice } from "@/services/offline";

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: true,
  isInitialized: false,
  pendingUploads: 0,
  pendingOperations: 0,
  draftCount: 0,
  isSyncing: false,
  lastSyncTime: null,

  initialize: async () => {
    // Initialize offline service
    await offline.initOfflineService();

    // Subscribe to connection changes
    offline.subscribeToConnectionChanges((online) => {
      set({ isOnline: online });

      // Auto-sync when coming online
      if (online) {
        get().syncNow();
      }
    });

    // Get initial counts
    const counts = await offline.getPendingCounts();
    const lastSync = await offline.getLastSyncTime();

    set({
      isInitialized: true,
      isOnline: offline.checkIsOnline(),
      pendingUploads: counts.uploads,
      pendingOperations: counts.operations,
      draftCount: counts.drafts,
      lastSyncTime: lastSync,
    });
  },

  setOnline: (online) => {
    set({ isOnline: online });
  },

  syncNow: async () => {
    if (get().isSyncing || !get().isOnline) {
      return { uploads: 0, operations: 0, errors: 0 };
    }

    set({ isSyncing: true });

    try {
      const result = await offline.syncPendingItems();

      // Refresh counts after sync
      await get().refreshCounts();

      const lastSync = await offline.getLastSyncTime();
      set({ lastSyncTime: lastSync });

      return result;
    } finally {
      set({ isSyncing: false });
    }
  },

  refreshCounts: async () => {
    const counts = await offline.getPendingCounts();
    set({
      pendingUploads: counts.uploads,
      pendingOperations: counts.operations,
      draftCount: counts.drafts,
    });
  },

  getDrafts: async () => {
    return offline.getDraftInvoices();
  },

  saveDraft: async (draft) => {
    const id = await offline.saveDraftInvoice(draft);
    await get().refreshCounts();
    return id;
  },

  updateDraft: async (id, updates) => {
    await offline.updateDraftInvoice(id, updates);
  },

  deleteDraft: async (id) => {
    await offline.deleteDraftInvoice(id);
    await get().refreshCounts();
  },

  reset: () => {
    set({
      isOnline: true,
      isInitialized: false,
      pendingUploads: 0,
      pendingOperations: 0,
      draftCount: 0,
      isSyncing: false,
      lastSyncTime: null,
    });
  },
}));

```

---

## ./store/useProfileStore.ts

```typescript
import { create } from "zustand";
import { Profile, ProfileUpdate } from "@/types/database";
import * as db from "@/services/database";
import { supabase } from "@/lib/supabase";

// Free tier invoice limit per month
const FREE_TIER_MONTHLY_LIMIT = 3;

interface ProfileState {
  // Data
  profile: Profile | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Selectors
  isPro: () => boolean;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  uploadLogo: (uri: string) => Promise<string | null>;
  checkUsageLimit: () => Promise<boolean>;

  // Reset
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  isSaving: false,

  // Selector: Check if user is on Pro tier
  isPro: () => {
    const { profile } = get();
    return profile?.subscription_tier === "pro";
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await db.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      console.error("Error fetching profile:", error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: ProfileUpdate) => {
    set({ isSaving: true });
    try {
      const updated = await db.updateProfile(updates);
      if (updated) {
        set({ profile: updated, isSaving: false });
      } else {
        set({ isSaving: false });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      set({ isSaving: false });
      throw error;
    }
  },

  uploadLogo: async (uri: string) => {
    try {
      const fileName = `logo-${Date.now()}.jpg`;
      const logoUrl = await db.uploadLogo(uri, fileName);

      if (logoUrl) {
        // Update profile with new logo URL
        await get().updateProfile({ logo_url: logoUrl });
        return logoUrl;
      }
      return null;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  },

  // Check if user can create more invoices this month
  checkUsageLimit: async () => {
    const { isPro, profile } = get();

    // Pro users have unlimited invoices
    if (isPro()) {
      return true;
    }

    // Free tier: count invoices created this month
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfMonthISO = startOfMonth.toISOString();

      const { count, error } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile?.id)
        .gte("created_at", startOfMonthISO);

      if (error) {
        console.error("Error checking usage limit:", error);
        // Fail open - allow creation if we can't check
        return true;
      }

      return (count ?? 0) < FREE_TIER_MONTHLY_LIMIT;
    } catch (error) {
      console.error("Error checking usage limit:", error);
      // Fail open - allow creation if we can't check
      return true;
    }
  },

  reset: () =>
    set({
      profile: null,
      isLoading: false,
      isSaving: false,
    }),
}));

```

---

## ./store/useReminderStore.ts

```typescript
import { create } from "zustand";
import { ReminderSettings, ReminderSettingsInsert } from "@/types/database";
import * as db from "@/services/database";

interface ReminderState {
  // Data
  settings: ReminderSettings | null;
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<ReminderSettingsInsert>) => Promise<void>;
  toggleEnabled: () => Promise<void>;
  toggleSMS: () => Promise<void>;
  toggleEmail: () => Promise<void>;
  setDayIntervals: (intervals: number[]) => Promise<void>;
  setMessageTemplate: (template: string) => Promise<void>;

  // Reset
  reset: () => void;
}

const DEFAULT_SETTINGS: Omit<ReminderSettingsInsert, "user_id"> = {
  enabled: false,
  day_intervals: [3, 7, 14],
  email_enabled: true,
  sms_enabled: false,
  message_template:
    "This is an automated reminder for invoice {{invoice_number}} from {{business_name}}. Amount due: {{total}}. Please pay at your earliest convenience.",
};

export const useReminderStore = create<ReminderState>((set, get) => ({
  settings: null,
  isLoading: false,
  isSaving: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await db.getReminderSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      console.error("Error fetching reminder settings:", error);
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    set({ isSaving: true });
    try {
      const currentSettings = get().settings;
      const newSettings = {
        ...DEFAULT_SETTINGS,
        ...currentSettings,
        ...updates,
      };

      const saved = await db.upsertReminderSettings(newSettings);
      set({ settings: saved, isSaving: false });
    } catch (error) {
      console.error("Error updating reminder settings:", error);
      set({ isSaving: false });
      throw error;
    }
  },

  toggleEnabled: async () => {
    const current = get().settings;
    await get().updateSettings({ enabled: !current?.enabled });
  },

  toggleSMS: async () => {
    const current = get().settings;
    await get().updateSettings({ sms_enabled: !current?.sms_enabled });
  },

  toggleEmail: async () => {
    const current = get().settings;
    await get().updateSettings({ email_enabled: !current?.email_enabled });
  },

  setDayIntervals: async (intervals: number[]) => {
    await get().updateSettings({ day_intervals: intervals });
  },

  setMessageTemplate: async (template: string) => {
    await get().updateSettings({ message_template: template });
  },

  reset: () =>
    set({
      settings: null,
      isLoading: false,
      isSaving: false,
    }),
}));

```

---

## ./supabase/functions/create-connect-account/index.ts

```typescript
/**
 * Edge Function: create-connect-account
 * Creates Stripe Connect onboarding link for contractors
 * Per architecture-spec.md Section 4.2
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Invalid token");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    let stripeAccountId = profile.stripe_account_id;

    // Create Stripe Connect account if doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeAccountId = account.id;

      // Save account ID to profile
      await supabase
        .from("profiles")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", user.id);
    }

    // Parse request body for return URLs
    const { return_url, refresh_url } = await req.json();

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refresh_url || "contractorpro://stripe/refresh",
      return_url: return_url || "contractorpro://stripe/return",
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({
        url: accountLink.url,
        account_id: stripeAccountId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating connect account:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

```

---

## ./supabase/functions/export-quickbooks/index.ts

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Export QuickBooks Edge Function
 * Exports invoices in QuickBooks-compatible CSV/IIF format
 * Per product-strategy.md Section 3.4
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const {
      format = "csv", // "csv" or "iif"
      startDate,
      endDate,
      status, // Optional filter by status
      includeItems = true,
    } = body;

    // Build query
    let query = supabase
      .from("invoices")
      .select(`
        *,
        clients (
          name,
          email,
          address
        ),
        invoice_items (
          description,
          quantity,
          unit_price,
          total
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply date filters
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data: invoices, error: invoicesError } = await query;

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
      throw invoicesError;
    }

    if (!invoices || invoices.length === 0) {
      return new Response(
        JSON.stringify({ error: "No invoices found for the specified criteria" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile for business info
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, full_name")
      .eq("id", user.id)
      .single();

    const businessName = profile?.business_name || profile?.full_name || "My Business";

    let exportContent: string;
    let contentType: string;
    let filename: string;

    if (format === "iif") {
      // QuickBooks IIF format
      exportContent = generateIIF(invoices, businessName, includeItems);
      contentType = "application/x-iif";
      filename = `invoices_export_${formatDateForFilename(new Date())}.iif`;
    } else {
      // CSV format (default)
      exportContent = generateCSV(invoices, includeItems);
      contentType = "text/csv";
      filename = `invoices_export_${formatDateForFilename(new Date())}.csv`;
    }

    return new Response(exportContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error in export-quickbooks function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Generate CSV export
 */
function generateCSV(invoices: any[], includeItems: boolean): string {
  const rows: string[] = [];

  if (includeItems) {
    // Header for detailed export with line items
    rows.push([
      "Invoice Number",
      "Date",
      "Due Date",
      "Client Name",
      "Client Email",
      "Status",
      "Item Description",
      "Quantity",
      "Unit Price",
      "Item Total",
      "Invoice Subtotal",
      "Tax Amount",
      "Invoice Total",
      "Currency",
      "Paid Date",
      "Notes",
    ].map(escapeCSV).join(","));

    // Data rows
    for (const invoice of invoices) {
      const baseRow = {
        invoiceNumber: invoice.invoice_number,
        date: formatDate(invoice.created_at),
        dueDate: formatDate(invoice.due_date),
        clientName: invoice.clients?.name || "",
        clientEmail: invoice.clients?.email || "",
        status: invoice.status,
        subtotal: formatCurrency(invoice.subtotal, invoice.currency),
        taxAmount: formatCurrency(invoice.tax_amount, invoice.currency),
        total: formatCurrency(invoice.total, invoice.currency),
        currency: invoice.currency || "USD",
        paidDate: invoice.paid_at ? formatDate(invoice.paid_at) : "",
        notes: invoice.notes || "",
      };

      const items = invoice.invoice_items || [];

      if (items.length > 0) {
        // One row per line item
        for (const item of items) {
          rows.push([
            baseRow.invoiceNumber,
            baseRow.date,
            baseRow.dueDate,
            baseRow.clientName,
            baseRow.clientEmail,
            baseRow.status,
            item.description || "",
            String(item.quantity || 1),
            formatCurrency(item.unit_price, invoice.currency),
            formatCurrency(item.total, invoice.currency),
            baseRow.subtotal,
            baseRow.taxAmount,
            baseRow.total,
            baseRow.currency,
            baseRow.paidDate,
            baseRow.notes,
          ].map(escapeCSV).join(","));
        }
      } else {
        // Invoice with no items
        rows.push([
          baseRow.invoiceNumber,
          baseRow.date,
          baseRow.dueDate,
          baseRow.clientName,
          baseRow.clientEmail,
          baseRow.status,
          "",
          "",
          "",
          "",
          baseRow.subtotal,
          baseRow.taxAmount,
          baseRow.total,
          baseRow.currency,
          baseRow.paidDate,
          baseRow.notes,
        ].map(escapeCSV).join(","));
      }
    }
  } else {
    // Header for summary export
    rows.push([
      "Invoice Number",
      "Date",
      "Due Date",
      "Client Name",
      "Client Email",
      "Status",
      "Subtotal",
      "Tax Amount",
      "Total",
      "Currency",
      "Paid Date",
      "Notes",
    ].map(escapeCSV).join(","));

    // Data rows
    for (const invoice of invoices) {
      rows.push([
        invoice.invoice_number,
        formatDate(invoice.created_at),
        formatDate(invoice.due_date),
        invoice.clients?.name || "",
        invoice.clients?.email || "",
        invoice.status,
        formatCurrency(invoice.subtotal, invoice.currency),
        formatCurrency(invoice.tax_amount, invoice.currency),
        formatCurrency(invoice.total, invoice.currency),
        invoice.currency || "USD",
        invoice.paid_at ? formatDate(invoice.paid_at) : "",
        invoice.notes || "",
      ].map(escapeCSV).join(","));
    }
  }

  return rows.join("\n");
}

/**
 * Generate QuickBooks IIF (Intuit Interchange Format) export
 * Reference: https://quickbooks.intuit.com/learn-support/en-us/import-export-data-files/iif-files-overview/00/186368
 */
function generateIIF(invoices: any[], businessName: string, includeItems: boolean): string {
  const lines: string[] = [];

  // IIF Header for invoices
  lines.push("!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO");
  lines.push("!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO\tQNTY\tPRICE");
  lines.push("!ENDTRNS");

  for (const invoice of invoices) {
    const clientName = invoice.clients?.name || "Customer";
    const invoiceDate = formatDateIIF(invoice.created_at);
    const total = invoice.total / 100; // Convert from cents
    const items = invoice.invoice_items || [];

    // Transaction header (debit to Accounts Receivable)
    lines.push(
      `TRNS\tINVOICE\t${invoiceDate}\tAccounts Receivable\t${escapeIIF(clientName)}\t\t${total.toFixed(2)}\t${invoice.invoice_number}\t${escapeIIF(invoice.notes || "")}`
    );

    if (includeItems && items.length > 0) {
      // Split lines for each item (credit to Income)
      for (const item of items) {
        const itemTotal = (item.total || 0) / 100;
        const quantity = item.quantity || 1;
        const price = (item.unit_price || 0) / 100;

        lines.push(
          `SPL\tINVOICE\t${invoiceDate}\tSales Income\t${escapeIIF(clientName)}\t\t-${itemTotal.toFixed(2)}\t${invoice.invoice_number}\t${escapeIIF(item.description || "")}\t${quantity}\t${price.toFixed(2)}`
        );
      }
    } else {
      // Single split line for total
      lines.push(
        `SPL\tINVOICE\t${invoiceDate}\tSales Income\t${escapeIIF(clientName)}\t\t-${total.toFixed(2)}\t${invoice.invoice_number}\t\t1\t${total.toFixed(2)}`
      );
    }

    // Tax line if applicable
    if (invoice.tax_amount && invoice.tax_amount > 0) {
      const taxAmount = invoice.tax_amount / 100;
      lines.push(
        `SPL\tINVOICE\t${invoiceDate}\tSales Tax Payable\t${escapeIIF(clientName)}\t\t-${taxAmount.toFixed(2)}\t${invoice.invoice_number}\tSales Tax\t\t`
      );
    }

    lines.push("ENDTRNS");
  }

  return lines.join("\n");
}

/**
 * Helper functions
 */
function escapeCSV(value: string): string {
  if (value == null) return "";
  const str = String(value);
  // Escape quotes and wrap in quotes if contains special characters
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeIIF(value: string): string {
  if (value == null) return "";
  // IIF uses tabs as delimiters, remove them from values
  return String(value).replace(/\t/g, " ").replace(/\n/g, " ");
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function formatDateIIF(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  // IIF uses MM/DD/YYYY format
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split("T")[0].replace(/-/g, "");
}

function formatCurrency(cents: number | null, currency: string = "USD"): string {
  if (cents == null) return "0.00";
  return (cents / 100).toFixed(2);
}

```

---

## ./supabase/functions/generate-invoice-pdf/index.ts

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceData {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  currency: string;
  due_date?: string;
  created_at: string;
  notes?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  profile: {
    business_name?: string;
    full_name?: string;
    logo_url?: string;
    tax_rate: number;
  };
}

/**
 * Generate Invoice PDF Edge Function
 *
 * Creates a PDF invoice and stores it in Supabase Storage.
 * Returns a signed URL for download/sharing.
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(
        JSON.stringify({ error: "Missing invoice_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch invoice with items
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        invoice_items (*)
      `)
      .eq("id", invoice_id)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch profile for branding
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("business_name, full_name, logo_url, tax_rate")
      .eq("id", user.id)
      .single();

    // Generate HTML for PDF
    const html = generateInvoiceHTML({
      ...invoice,
      items: invoice.invoice_items,
      profile: profile || { tax_rate: 0 },
    });

    // For now, we'll store the HTML as a simple text file
    // In production, you'd use a PDF generation service like:
    // - Puppeteer (via Deno Deploy or separate service)
    // - pdf-lib for programmatic PDF creation
    // - External API like DocRaptor, PDFShift, etc.

    // Generate PDF using external service or library
    // For MVP, we'll create a simple HTML file that can be printed to PDF
    const pdfContent = generatePrintableHTML({
      ...invoice,
      items: invoice.invoice_items,
      profile: profile || { tax_rate: 0 },
    });

    const fileName = `${user.id}/${invoice.invoice_number.replace(/\s/g, "_")}.html`;

    // Upload to storage
    const { error: uploadError } = await supabaseClient.storage
      .from("invoice-pdfs")
      .upload(fileName, pdfContent, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to generate PDF" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get signed URL (valid for 1 hour)
    const { data: signedUrl } = await supabaseClient.storage
      .from("invoice-pdfs")
      .createSignedUrl(fileName, 3600);

    // Update invoice with PDF URL
    await supabaseClient
      .from("invoices")
      .update({ pdf_url: signedUrl?.signedUrl })
      .eq("id", invoice_id);

    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: signedUrl?.signedUrl,
        file_name: fileName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function generateInvoiceHTML(invoice: InvoiceData): string {
  const businessName = invoice.profile.business_name || invoice.profile.full_name || "ContractorPro";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a1a;
      line-height: 1.5;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: 700; color: #00D632; }
    .invoice-number { text-align: right; }
    .invoice-number h2 { font-size: 14px; color: #666; text-transform: uppercase; }
    .invoice-number p { font-size: 20px; font-weight: 600; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .address { flex: 1; }
    .address h3 { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px; }
    .address p { font-size: 14px; }
    .dates { display: flex; gap: 40px; margin-bottom: 40px; }
    .date h3 { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
    .date p { font-size: 14px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { text-align: left; padding: 12px 0; border-bottom: 2px solid #e5e5e5; font-size: 12px; color: #666; text-transform: uppercase; }
    td { padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
    .item-desc { font-weight: 500; }
    .item-meta { font-size: 13px; color: #666; }
    .text-right { text-align: right; }
    .totals { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.grand { border-top: 2px solid #1a1a1a; padding-top: 16px; margin-top: 8px; font-size: 18px; font-weight: 700; }
    .total-row.grand .amount { color: #00D632; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-sent { background: #dbeafe; color: #1e40af; }
    .status-draft { background: #f3f4f6; color: #4b5563; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; color: #666; font-size: 13px; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${businessName}</div>
    <div class="invoice-number">
      <h2>Invoice</h2>
      <p>${invoice.invoice_number}</p>
    </div>
  </div>

  <div class="addresses">
    <div class="address">
      <h3>Bill To</h3>
      <p><strong>${invoice.client_name}</strong></p>
      ${invoice.client_email ? `<p>${invoice.client_email}</p>` : ""}
    </div>
    <div class="address" style="text-align: right;">
      <span class="status status-${invoice.status}">${invoice.status}</span>
    </div>
  </div>

  <div class="dates">
    <div class="date">
      <h3>Issue Date</h3>
      <p>${formatDate(invoice.created_at)}</p>
    </div>
    ${invoice.due_date ? `
    <div class="date">
      <h3>Due Date</h3>
      <p>${formatDate(invoice.due_date)}</p>
    </div>
    ` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Rate</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => `
      <tr>
        <td class="item-desc">${item.description}</td>
        <td class="text-right">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.unit_price, invoice.currency)}</td>
        <td class="text-right">${formatCurrency(item.total, invoice.currency)}</td>
      </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal</span>
      <span>${formatCurrency(invoice.subtotal, invoice.currency)}</span>
    </div>
    ${invoice.tax_amount > 0 ? `
    <div class="total-row">
      <span>Tax (${invoice.profile.tax_rate}%)</span>
      <span>${formatCurrency(invoice.tax_amount, invoice.currency)}</span>
    </div>
    ` : ""}
    <div class="total-row grand">
      <span>Total Due</span>
      <span class="amount">${formatCurrency(invoice.total, invoice.currency)}</span>
    </div>
  </div>

  ${invoice.notes ? `
  <div style="margin-top: 40px; padding: 16px; background: #f9fafb; border-radius: 8px;">
    <h3 style="font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px;">Notes</h3>
    <p style="font-size: 14px;">${invoice.notes}</p>
  </div>
  ` : ""}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p style="margin-top: 8px;">Generated by ContractorPro</p>
  </div>
</body>
</html>
  `;
}

function generatePrintableHTML(invoice: InvoiceData): string {
  // Same as generateInvoiceHTML but with print-optimized styles
  return generateInvoiceHTML(invoice);
}

```

---

## ./supabase/functions/generate-payment-link/index.ts

```typescript
/**
 * Edge Function: generate-payment-link
 * Creates Stripe Payment Intent for invoice
 * Per architecture-spec.md Section 4.3 (Direct Charges)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Platform fee percentage (1%)
const PLATFORM_FEE_PERCENT = 0.01;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Invalid token");
    }

    // Get request body
    const { invoice_id } = await req.json();

    if (!invoice_id) {
      throw new Error("invoice_id is required");
    }

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("Invoice not found");
    }

    // Get profile with Stripe account
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_account_id, charges_enabled, business_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    if (!profile.stripe_account_id || !profile.charges_enabled) {
      throw new Error("Stripe account not connected or charges not enabled");
    }

    // Calculate platform fee
    const platformFee = Math.round(invoice.total * PLATFORM_FEE_PERCENT);

    // Create Payment Intent with Direct Charges
    // Per architecture-spec.md Section 4.3
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: invoice.total, // Already in cents
        currency: invoice.currency.toLowerCase(),
        application_fee_amount: platformFee,
        metadata: {
          supabase_invoice_id: invoice.id,
          supabase_user_id: user.id,
          invoice_number: invoice.invoice_number,
        },
        description: `Invoice ${invoice.invoice_number} from ${profile.business_name || "Contractor"}`,
      },
      {
        stripeAccount: profile.stripe_account_id, // Direct charge
      }
    );

    // Create a Payment Link for easy sharing
    // First, create a product and price
    const product = await stripe.products.create(
      {
        name: `Invoice ${invoice.invoice_number}`,
        description: `Payment for services - ${invoice.client_name}`,
      },
      { stripeAccount: profile.stripe_account_id }
    );

    const price = await stripe.prices.create(
      {
        unit_amount: invoice.total,
        currency: invoice.currency.toLowerCase(),
        product: product.id,
      },
      { stripeAccount: profile.stripe_account_id }
    );

    const paymentLink = await stripe.paymentLinks.create(
      {
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: {
          supabase_invoice_id: invoice.id,
          supabase_user_id: user.id,
        },
        application_fee_amount: platformFee,
      },
      { stripeAccount: profile.stripe_account_id }
    );

    // Update invoice with Stripe info
    await supabase
      .from("invoices")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_hosted_invoice_url: paymentLink.url,
      })
      .eq("id", invoice_id);

    return new Response(
      JSON.stringify({
        payment_intent_id: paymentIntent.id,
        payment_link_url: paymentLink.url,
        client_secret: paymentIntent.client_secret,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating payment link:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

```

---

## ./supabase/functions/send-reminders/index.ts

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Send Reminders Edge Function
 * Per product-strategy.md "Bad Cop" system
 *
 * Scheduled to run daily via Supabase cron:
 * SELECT cron.schedule('send-reminders', '0 9 * * *', $$
 *   SELECT net.http_post(
 *     url := 'https://your-project.supabase.co/functions/v1/send-reminders',
 *     headers := '{"Authorization": "Bearer your-service-role-key"}'::jsonb
 *   ) AS request_id;
 * $$);
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key for cron jobs
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all users with reminders enabled
    const { data: reminderSettings, error: settingsError } = await supabaseAdmin
      .from("reminder_settings")
      .select(`
        *,
        profiles!inner (
          id,
          business_name,
          full_name
        )
      `)
      .eq("enabled", true);

    if (settingsError) {
      console.error("Error fetching reminder settings:", settingsError);
      throw settingsError;
    }

    let remindersSent = 0;
    let remindersSkipped = 0;
    const errors: string[] = [];

    // Process each user's reminders
    for (const settings of reminderSettings || []) {
      try {
        const userId = settings.user_id;
        const dayIntervals = settings.day_intervals || [3, 7, 14];
        const businessName = settings.profiles?.business_name || settings.profiles?.full_name || "Your contractor";

        // Get overdue invoices for this user
        const { data: invoices, error: invoicesError } = await supabaseAdmin
          .from("invoices")
          .select(`
            *,
            clients!inner (
              name,
              email,
              phone
            )
          `)
          .eq("user_id", userId)
          .in("status", ["sent", "overdue"])
          .lt("due_date", today.toISOString());

        if (invoicesError) {
          console.error(`Error fetching invoices for user ${userId}:`, invoicesError);
          continue;
        }

        // Process each overdue invoice
        for (const invoice of invoices || []) {
          const dueDate = new Date(invoice.due_date);
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          // Check if this is a reminder day
          if (!dayIntervals.includes(daysOverdue)) {
            continue;
          }

          // Check if we already sent a reminder today for this invoice
          const { data: existingReminder } = await supabaseAdmin
            .from("reminder_logs")
            .select("id")
            .eq("invoice_id", invoice.id)
            .gte("sent_at", today.toISOString())
            .limit(1);

          if (existingReminder && existingReminder.length > 0) {
            remindersSkipped++;
            continue;
          }

          // Update invoice status to overdue if not already
          if (invoice.status !== "overdue") {
            await supabaseAdmin
              .from("invoices")
              .update({ status: "overdue" })
              .eq("id", invoice.id);
          }

          // Prepare reminder message
          const message = generateReminderMessage(
            settings.message_template || DEFAULT_TEMPLATE,
            {
              invoice_number: invoice.invoice_number,
              business_name: businessName,
              total: formatCurrency(invoice.total, invoice.currency),
              days_overdue: daysOverdue,
              payment_link: invoice.stripe_hosted_invoice_url || "",
            }
          );

          // Send SMS if enabled and phone available
          if (settings.sms_enabled && invoice.clients?.phone && twilioAccountSid) {
            const smsResult = await sendTwilioSMS(
              twilioAccountSid,
              twilioAuthToken!,
              twilioPhoneNumber!,
              invoice.clients.phone,
              message
            );

            // Log the reminder
            await supabaseAdmin.from("reminder_logs").insert({
              invoice_id: invoice.id,
              reminder_type: "sms",
              status: smsResult.success ? "sent" : "failed",
              error_message: smsResult.error,
            });

            if (smsResult.success) {
              remindersSent++;
            } else {
              errors.push(`SMS failed for ${invoice.invoice_number}: ${smsResult.error}`);
            }
          }

          // Send email if enabled and email available
          if (settings.email_enabled && invoice.clients?.email) {
            // For now, log as pending - email would use SendGrid or similar
            await supabaseAdmin.from("reminder_logs").insert({
              invoice_id: invoice.id,
              reminder_type: "email",
              status: "pending",
            });
            // TODO: Implement SendGrid email sending
          }
        }
      } catch (userError: any) {
        errors.push(`Error processing user ${settings.user_id}: ${userError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent,
        remindersSkipped,
        errors: errors.length > 0 ? errors : undefined,
        processedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

const DEFAULT_TEMPLATE = `This is an automated reminder for invoice {{invoice_number}} from {{business_name}}. Amount due: {{total}}. This invoice is {{days_overdue}} days overdue. Please pay at your earliest convenience.`;

function generateReminderMessage(
  template: string,
  variables: {
    invoice_number: string;
    business_name: string;
    total: string;
    days_overdue: number;
    payment_link: string;
  }
): string {
  let message = template;

  message = message.replace(/\{\{invoice_number\}\}/g, variables.invoice_number);
  message = message.replace(/\{\{business_name\}\}/g, variables.business_name);
  message = message.replace(/\{\{total\}\}/g, variables.total);
  message = message.replace(/\{\{days_overdue\}\}/g, String(variables.days_overdue));

  if (variables.payment_link) {
    message = message.replace(/\{\{payment_link\}\}/g, variables.payment_link);
    message += `\n\nPay now: ${variables.payment_link}`;
  }

  return message;
}

function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

async function sendTwilioSMS(
  accountSid: string,
  authToken: string,
  fromNumber: string,
  toNumber: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);

    // Format phone number
    const formattedTo = formatPhoneNumber(toNumber);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: fromNumber,
        Body: body,
      }).toString(),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.sid };
    } else {
      return { success: false, error: data.message || "Failed to send SMS" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length > 10 && !cleaned.startsWith("+")) {
    return `+${cleaned}`;
  }
  return phone;
}

```

---

## ./supabase/functions/stripe-webhook/index.ts

```typescript
/**
 * Edge Function: stripe-webhook
 * Handles Stripe webhook events for payment reconciliation
 * Per architecture-spec.md Section 4.4
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.5.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check for idempotency - prevent duplicate processing
    // Per architecture-spec.md Section 4.4
    const { data: existingEvent } = await supabase
      .from("webhook_events")
      .select("id")
      .eq("id", event.id)
      .single();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // Log event for idempotency
    await supabase.from("webhook_events").insert({
      id: event.id,
      event_type: event.type,
      payload: event.data,
    });

    // Handle specific events
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("PaymentIntent succeeded:", paymentIntent.id);

        // Extract invoice ID from metadata
        const invoiceId = paymentIntent.metadata?.supabase_invoice_id;

        if (invoiceId) {
          // Update invoice status to paid
          const { error } = await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
            })
            .eq("id", invoiceId);

          if (error) {
            console.error("Error updating invoice:", error);
          } else {
            console.log(`Invoice ${invoiceId} marked as paid`);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("PaymentIntent failed:", paymentIntent.id);

        const invoiceId = paymentIntent.metadata?.supabase_invoice_id;
        if (invoiceId) {
          // Could log failed payment attempt
          console.log(`Payment failed for invoice ${invoiceId}`);
        }
        break;
      }

      case "account.updated": {
        // Connected account was updated
        const account = event.data.object as Stripe.Account;
        console.log("Account updated:", account.id);

        // Update profile with account status
        const { error } = await supabase
          .from("profiles")
          .update({
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
          })
          .eq("stripe_account_id", account.id);

        if (error) {
          console.error("Error updating profile:", error);
        }
        break;
      }

      case "checkout.session.completed": {
        // Payment via Payment Link completed
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);

        const invoiceId = session.metadata?.supabase_invoice_id;

        if (invoiceId) {
          const { error } = await supabase
            .from("invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
            })
            .eq("id", invoiceId);

          if (error) {
            console.error("Error updating invoice:", error);
          } else {
            console.log(`Invoice ${invoiceId} marked as paid via checkout`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 500 });
  }
});

```

---

## ./supabase/functions/transcribe-and-parse/index.ts

```typescript
/**
 * Edge Function: transcribe-and-parse
 * Universal Translator for voice-to-invoice processing
 * Per architecture-spec.md Section 2.2
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// OpenAI API configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_URL = "https://api.openai.com/v1";

// Supabase configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Universal Translator System Prompt
 * Handles both translation (Spanglish) and cleanup (rambling English)
 */
function getSystemPrompt(glossaryTerms: string, userTrade: string, currentDate: string): string {
  return `# Role
You are "ContractorAI," an expert construction administrator. Your job is to take raw voice notes from contractors and turn them into professional, IRS-compliant invoices.

# Input Context
* Current Date: ${currentDate}
* User Trade: ${userTrade}
* Input may be in English, Spanish, Portuguese, or a mix ("Spanglish").

# Construction Glossary
${glossaryTerms}

# Processing Rules

1. **Language Detection & Handling**:
   * If input is **Spanglish/Portuñol**: Translate terms to Standard English (e.g., "Rufa" -> "Roof").
   * If input is **English**: "Professionalize" the text. Remove filler words ("um", "uh"), fix grammar, and make descriptions sound formal (e.g., change "I fixed the leak under the sink" to "Kitchen Sink Leak Repair").

2. **Intent Detection**:
   * Past tense ("I did the work") = INVOICE.
   * Future tense ("I will do") = QUOTE.

3. **Output Format**:
   Return ONLY valid JSON.

{
  "meta": {
    "intent": "INVOICE" | "QUOTE",
    "confidence": number,
    "language_detected": "string",
    "currency": "USD"
  },
  "client": {
    "name": "string | null",
    "contact_inferred": "string | null"
  },
  "line_items": [
    {
      "description": "Professional English Description",
      "quantity": number,
      "unit_price": number, // in CENTS
      "total": number, // in CENTS
      "original_transcript_segment": "string",
      "requires_review": boolean
    }
  ],
  "notes": "string"
}`;
}

/**
 * Transcribe audio using OpenAI Whisper
 */
async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.m4a");
  formData.append("model", "whisper-1");
  // Let Whisper auto-detect language for code-switching support
  formData.append("response_format", "text");

  const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${error}`);
  }

  return await response.text();
}

/**
 * Parse transcript using GPT-4o with Universal Translator prompt
 */
async function parseTranscript(
  transcript: string,
  systemPrompt: string
): Promise<any> {
  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcript },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent parsing
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GPT-4o API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from GPT-4o");
  }

  return JSON.parse(content);
}

/**
 * Fetch glossary terms from database
 */
async function getGlossaryTerms(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("glossary_terms")
    .select("term, standard_english, category")
    .limit(200);

  if (error || !data) {
    console.error("Error fetching glossary:", error);
    return "No glossary available.";
  }

  // Format glossary for prompt injection
  const grouped = data.reduce((acc: any, term: any) => {
    const category = term.category || "general";
    if (!acc[category]) acc[category] = [];
    acc[category].push(`"${term.term}" -> ${term.standard_english}`);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([category, terms]) => `## ${category}\n${(terms as string[]).join("\n")}`)
    .join("\n\n");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate OpenAI API key
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body
    const { voice_note_id, storage_path } = await req.json();

    if (!storage_path) {
      throw new Error("storage_path is required");
    }

    // 1. Fetch audio file from storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from("voice-evidence")
      .download(storage_path);

    if (downloadError || !audioData) {
      throw new Error(`Failed to download audio: ${downloadError?.message}`);
    }

    // 2. Transcribe audio with Whisper
    console.log("Transcribing audio...");
    const transcript = await transcribeAudio(audioData);
    console.log("Transcript:", transcript);

    // 3. Fetch glossary terms
    const glossaryTerms = await getGlossaryTerms(supabase);

    // 4. Get user profile for trade info (optional)
    let userTrade = "General Contractor";
    // Could fetch from profiles table if needed

    // 5. Build system prompt
    const currentDate = new Date().toISOString().split("T")[0];
    const systemPrompt = getSystemPrompt(glossaryTerms, userTrade, currentDate);

    // 6. Parse transcript with GPT-4o
    console.log("Parsing with GPT-4o...");
    const parseResult = await parseTranscript(transcript, systemPrompt);
    console.log("Parse result:", JSON.stringify(parseResult, null, 2));

    // 7. Update voice note record with transcript
    if (voice_note_id) {
      await supabase
        .from("voice_notes")
        .update({
          transcript,
          detected_language: parseResult.meta?.language_detected || "en",
          confidence_score: parseResult.meta?.confidence || 0,
          processing_status: "completed",
        })
        .eq("id", voice_note_id);
    }

    // Return parsed result
    return new Response(JSON.stringify(parseResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in transcribe-and-parse:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

```

---

## ./tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00D632",
        alert: "#FF9500",
      },
    },
  },
  plugins: [],
};

```

---

## ./tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "types": [
      "nativewind/types"
    ]
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "nativewind-env.d.ts"
  ]
}

```

---

## ./types/database.ts

```typescript
/**
 * Database types for Supabase
 * Per architecture-spec.md schema definitions
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'void' | 'overdue';
export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due' | 'trialing';
export type SubscriptionTier = 'free' | 'pro';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          business_name: string | null;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          logo_url: string | null;
          stripe_account_id: string | null;
          charges_enabled: boolean;
          payouts_enabled: boolean;
          default_currency: string;
          default_language: string;
          tax_rate: number;
          subscription_status: SubscriptionStatus;
          subscription_tier: SubscriptionTier;
          stripe_customer_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          business_name?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          stripe_account_id?: string | null;
          charges_enabled?: boolean;
          payouts_enabled?: boolean;
          default_currency?: string;
          default_language?: string;
          tax_rate?: number;
          subscription_status?: SubscriptionStatus;
          subscription_tier?: SubscriptionTier;
          stripe_customer_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string | null;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          stripe_account_id?: string | null;
          charges_enabled?: boolean;
          payouts_enabled?: boolean;
          default_currency?: string;
          default_language?: string;
          tax_rate?: number;
          subscription_status?: SubscriptionStatus;
          subscription_tier?: SubscriptionTier;
          stripe_customer_id?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: Json | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: Json | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          invoice_number: string;
          client_name: string;
          client_email: string | null;
          client_phone: string | null;
          client_address: string | null;
          stripe_payment_intent_id: string | null;
          stripe_hosted_invoice_url: string | null;
          subtotal: number; // in cents
          tax_rate: number;
          tax_amount: number; // in cents
          total: number; // in cents
          currency: string;
          status: InvoiceStatus;
          due_date: string | null;
          paid_at: string | null;
          sent_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          invoice_number: string;
          client_name: string;
          client_email?: string | null;
          client_phone?: string | null;
          client_address?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_hosted_invoice_url?: string | null;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          currency?: string;
          status?: InvoiceStatus;
          due_date?: string | null;
          paid_at?: string | null;
          sent_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          invoice_number?: string;
          client_name?: string;
          client_email?: string | null;
          client_phone?: string | null;
          client_address?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_hosted_invoice_url?: string | null;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          currency?: string;
          status?: InvoiceStatus;
          due_date?: string | null;
          paid_at?: string | null;
          sent_at?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price: number; // in cents
          total: number; // in cents
          original_transcript_segment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          original_transcript_segment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          original_transcript_segment?: string | null;
        };
      };
      voice_notes: {
        Row: {
          id: string;
          user_id: string;
          invoice_id: string | null;
          storage_path: string;
          transcript: string | null;
          detected_language: string | null;
          confidence_score: number | null;
          processing_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          invoice_id?: string | null;
          storage_path: string;
          transcript?: string | null;
          detected_language?: string | null;
          confidence_score?: number | null;
          processing_status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          invoice_id?: string | null;
          storage_path?: string;
          transcript?: string | null;
          detected_language?: string | null;
          confidence_score?: number | null;
          processing_status?: string;
        };
      };
      glossary_terms: {
        Row: {
          id: string;
          term: string;
          standard_english: string;
          category: string | null;
          language: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          term: string;
          standard_english: string;
          category?: string | null;
          language?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          term?: string;
          standard_english?: string;
          category?: string | null;
          language?: string;
        };
      };
      webhook_events: {
        Row: {
          id: string;
          event_type: string;
          processed_at: string;
          payload: Json | null;
        };
        Insert: {
          id: string;
          event_type: string;
          processed_at?: string;
          payload?: Json | null;
        };
        Update: {
          id?: string;
          event_type?: string;
          processed_at?: string;
          payload?: Json | null;
        };
      };
      reminder_settings: {
        Row: {
          id: string;
          user_id: string;
          enabled: boolean;
          day_intervals: number[];
          email_enabled: boolean;
          sms_enabled: boolean;
          message_template: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          enabled?: boolean;
          day_intervals?: number[];
          email_enabled?: boolean;
          sms_enabled?: boolean;
          message_template?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          enabled?: boolean;
          day_intervals?: number[];
          email_enabled?: boolean;
          sms_enabled?: boolean;
          message_template?: string;
          updated_at?: string;
        };
      };
      reminder_logs: {
        Row: {
          id: string;
          invoice_id: string;
          reminder_type: string;
          sent_at: string;
          status: string;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          reminder_type: string;
          sent_at?: string;
          status?: string;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          reminder_type?: string;
          sent_at?: string;
          status?: string;
          error_message?: string | null;
        };
      };
    };
    Enums: {
      invoice_status: InvoiceStatus;
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
export type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];
export type InvoiceItemUpdate = Database['public']['Tables']['invoice_items']['Update'];

export type VoiceNote = Database['public']['Tables']['voice_notes']['Row'];
export type VoiceNoteInsert = Database['public']['Tables']['voice_notes']['Insert'];
export type VoiceNoteUpdate = Database['public']['Tables']['voice_notes']['Update'];

export type GlossaryTerm = Database['public']['Tables']['glossary_terms']['Row'];

export type ReminderSettings = Database['public']['Tables']['reminder_settings']['Row'];
export type ReminderSettingsInsert = Database['public']['Tables']['reminder_settings']['Insert'];
export type ReminderSettingsUpdate = Database['public']['Tables']['reminder_settings']['Update'];

export type ReminderLog = Database['public']['Tables']['reminder_logs']['Row'];

```

---

## ./types/index.ts

```typescript
/**
 * Application Types
 * Re-exports database types and defines app-specific types
 */

// Re-export all database types
export * from "./database";

// Re-export ParsedInvoice from store (used before saving to DB)
export type { ParsedInvoice } from "@/store/useInvoiceStore";

// Recording state for voice capture
export interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioUri?: string;
}

// AI parsing result (from Edge Function)
export interface AIParseResult {
  meta: {
    intent: "INVOICE" | "QUOTE";
    confidence: number;
    language_detected: string;
    currency: "USD" | "BRL" | "MXN" | "EUR";
  };
  client: {
    name: string | null;
    contact_inferred: string | null;
  };
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    original_transcript_segment: string;
    requires_review: boolean;
  }>;
  notes: string | null;
}

// Dashboard statistics
export interface DashboardStats {
  totalRevenue: number; // in cents
  pendingAmount: number; // in cents
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
}

// Stripe account status
export interface StripeAccountStatus {
  isConnected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  accountId: string | null;
}

// Invoice with items (combined for display)
export interface InvoiceWithItems {
  invoice: import("./database").Invoice;
  items: import("./database").InvoiceItem[];
}

// Helper type for amounts (convert between cents and dollars)
export type CentsAmount = number & { readonly __brand: "cents" };
export type DollarsAmount = number & { readonly __brand: "dollars" };

// Utility functions for amount conversion
export const toCents = (dollars: number): number => Math.round(dollars * 100);
export const toDollars = (cents: number): number => cents / 100;

// Format currency for display
export const formatCurrency = (cents: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(toDollars(cents));
};

// Format relative date
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).format(date);
};

```

