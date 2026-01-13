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
