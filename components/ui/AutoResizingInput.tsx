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
