import { createContext, useContext, useState, ReactNode } from "react";
import { useColorScheme } from "react-native";

export const colors = {
  light: {
    primary: "#00D632",
    primaryDark: "#00B82B",
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
  // Special styles
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

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof colors.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  const toggleTheme = () => setIsDark((prev) => !prev);

  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: themeColors }}>
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
