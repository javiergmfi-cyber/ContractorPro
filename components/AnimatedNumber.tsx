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
