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
