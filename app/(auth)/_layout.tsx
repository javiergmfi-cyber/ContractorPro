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
