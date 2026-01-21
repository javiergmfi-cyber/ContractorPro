import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "../lib/theme";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { PreflightModal } from "../components/PreflightModal";
import { ErrorRecoveryOverlay } from "../components/ErrorRecoveryOverlay";
import { AnimatedSplash } from "../components/AnimatedSplash";
import { FirstTimeTutorial } from "../components/tutorial/FirstTimeTutorial";
import { useErrorStore } from "../store/useErrorStore";
import { useTutorialStore, CURRENT_TUTORIAL_VERSION } from "../store/useTutorialStore";
import { useOnboardingStore } from "../store/useOnboardingStore";
import { useNotifications } from "../hooks/useNotifications";
import "../global.css";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { hasCalibrated } = useOnboardingStore();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inDemoRoute = segments[0] === "demo";
    const inOnboardingGroup = segments[0] === "onboarding";

    if (!session && !inAuthGroup && !inDemoRoute) {
      // Redirect to login if not authenticated (except demo route)
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      // Redirect to calibration or home if authenticated and trying to access auth screens
      if (!hasCalibrated) {
        router.replace("/onboarding/calibration");
      } else {
        router.replace("/(tabs)");
      }
    } else if (session && !hasCalibrated && !inOnboardingGroup && !inAuthGroup) {
      // Redirect to calibration if authenticated but hasn't calibrated
      router.replace("/onboarding/calibration");
    }
  }, [session, isLoading, segments, hasCalibrated]);

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
  const { session, user } = useAuth();
  const { isVisible, errorType, errorMessage, retryCallback, hideError } = useErrorStore();
  const { hasHydrated, getTutorialVersionSeen } = useTutorialStore();
  const [showSplash, setShowSplash] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  // Initialize push notifications
  useNotifications();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Determine if tutorial should show
  // Only show when: hydrated + logged in + hasn't seen current version + splash done
  useEffect(() => {
    if (
      hasHydrated &&
      session &&
      user &&
      !showSplash &&
      getTutorialVersionSeen(user.id) < CURRENT_TUTORIAL_VERSION
    ) {
      setShowTutorial(true);
    }
  }, [hasHydrated, session, user, showSplash]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    // Toast would be shown from within the tutorial component
  };

  return (
    <>
      <StatusBar style={showSplash || showTutorial ? "light" : isDark ? "light" : "dark"} />
      <AuthGuard>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen
            name="onboarding"
            options={{
              animation: "fade",
            }}
          />
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

      {/* First-Time User Tutorial - Benefits-first onboarding */}
      {showTutorial && user && (
        <FirstTimeTutorial
          userId={user.id}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
      )}

      {/* Animated Splash Screen - Apple-level launch experience */}
      {showSplash && <AnimatedSplash onComplete={handleSplashComplete} />}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootLayoutContent />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
