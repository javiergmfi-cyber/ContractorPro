import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { ThemeProvider, useTheme } from "../lib/theme";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { PreflightModal } from "../components/PreflightModal";
import { ErrorRecoveryOverlay } from "../components/ErrorRecoveryOverlay";
import { useErrorStore } from "../store/useErrorStore";
import { useNotifications } from "../hooks/useNotifications";
import "../global.css";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inDemoRoute = segments[0] === "demo";

    if (!session && !inAuthGroup && !inDemoRoute) {
      // Redirect to login if not authenticated (except demo route)
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
  const { isVisible, errorType, errorMessage, retryCallback, hideError } = useErrorStore();

  // Initialize push notifications
  useNotifications();

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
          <Stack.Screen
            name="demo"
            options={{
              presentation: "fullScreenModal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack>
      </AuthGuard>

      {/* Pre-Flight Check Modal - Global overlay */}
      <PreflightModal />

      {/* Error Recovery Overlay - Global guided error handling */}
      <ErrorRecoveryOverlay
        visible={isVisible}
        errorType={errorType}
        errorMessage={errorMessage || undefined}
        onDismiss={hideError}
        onRetry={retryCallback || undefined}
      />
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
