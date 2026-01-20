import { Tabs } from "expo-router";
import { Home, FileText, Users, User } from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import { View, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";

/**
 * Tab Layout - Cash Flow Engine Navigation
 *
 * Per HYBRID_SPEC.md:
 * - Tab 1: "Home" (Cash Flow overview)
 * - Tab 2: "Invoices" (Workbench)
 * - Tab 3: "Clients" (CRM)
 * - Tab 4: "Business" (Settings/Branding)
 *
 * Features:
 * - Frosted glass tab bar (Glassmorphism)
 * - Active color: Green (#00D632)
 * - SF Symbols style icons (thicker stroke when active)
 * - Haptic feedback on tab switch
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
          title: "Home",
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
          title: "Business",
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
