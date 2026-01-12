import { createContext, useContext, useState, ReactNode } from "react";
import { useColorScheme } from "react-native";

/**
 * Theme Configuration
 * Per design-system.md Section 4.2
 */

export const colors = {
  light: {
    primary: "#00D632",
    primaryDark: "#00B82B",

    // Status colors per design-system.md
    statusPaid: "#248A3D",      // Forest Green (Light Mode)
    statusOverdue: "#D93600",   // Burnt Orange (Light Mode)
    statusSent: "#007AFF",      // System Blue
    statusDraft: "#8E8E93",     // System Gray

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
    primary: "#00D632",
    primaryDark: "#00FF41",

    // Status colors per design-system.md (Electric/Neon for Dark Mode)
    statusPaid: "#39FF14",      // Neon Green (Dark Mode)
    statusOverdue: "#FF3503",   // Electric Orange (Dark Mode)
    statusSent: "#0A84FF",      // System Blue
    statusDraft: "#98989D",     // System Gray 2

    alert: "#FF9F0A",
    error: "#FF453A",
    success: "#32D74B",

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
 * Typography per design-system.md Section 4.1
 * SF Pro Rounded styles
 */
export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: "700" as const,
    letterSpacing: 0.37,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: 0.36,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: 0.35,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: "600" as const,
    letterSpacing: 0.38,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: "600" as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: "400" as const,
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  subhead: {
    fontSize: 15,
    fontWeight: "400" as const,
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: "400" as const,
    letterSpacing: -0.08,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: "400" as const,
    letterSpacing: 0,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: "400" as const,
    letterSpacing: 0.07,
    lineHeight: 13,
  },
  // Invoice Amount - Primary Field per design-system.md
  invoiceAmount: {
    fontSize: 22,
    fontWeight: "800" as const,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  // Dashboard Amount
  amount: {
    fontSize: 44,
    fontWeight: "700" as const,
    letterSpacing: -1,
    lineHeight: 52,
  },
  amountSmall: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
    lineHeight: 34,
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
 * Border Radius per design-system.md Section 4.3
 * Squircle geometry with 12pt default
 */
export const radius = {
  sm: 8,
  md: 12,   // Default for cards per design-system.md
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

/**
 * Shadows per design-system.md Section 4.3
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
  },
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof colors.light;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  const toggleTheme = () => setIsDark((prev) => !prev);

  const themeColors = isDark ? colors.dark : colors.light;
  const themeShadows = isDark ? shadows.dark : shadows.light;

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        colors: themeColors,
        typography,
        spacing,
        radius,
        shadows: themeShadows,
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
 * Per design-system.md Section 6.2
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
