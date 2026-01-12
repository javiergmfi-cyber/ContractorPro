import React, { useEffect, useRef } from "react";
import { Text, TextStyle, Animated, StyleSheet, View } from "react-native";

/**
 * AnimatedNumber Component
 * Per design-system.md "Pulse UI"
 * Rolling number animation with smooth transitions
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

  useEffect(() => {
    // Animate from previous value to new value
    animatedValue.setValue(previousValue.current);

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false, // Can't use native driver for text value changes
    }).start();

    previousValue.current = value;
  }, [value, duration]);

  const displayValue = animatedValue.interpolate({
    inputRange: [0, value || 1],
    outputRange: [0, value || 0],
  });

  return (
    <AnimatedText
      animatedValue={displayValue}
      prefix={prefix}
      suffix={suffix}
      style={style}
      formatOptions={formatOptions}
    />
  );
}

// Separate component to handle the animated value rendering
interface AnimatedTextProps {
  animatedValue: Animated.AnimatedInterpolation<number>;
  prefix: string;
  suffix: string;
  style?: TextStyle;
  formatOptions: Intl.NumberFormatOptions;
}

class AnimatedText extends React.Component<AnimatedTextProps> {
  private listener: string | null = null;
  private textRef = React.createRef<Text>();
  private currentValue: number = 0;

  componentDidMount() {
    this.listener = this.props.animatedValue.addListener(({ value }) => {
      this.currentValue = value;
      if (this.textRef.current) {
        const formatted = this.formatNumber(value);
        this.textRef.current.setNativeProps({
          text: `${this.props.prefix}${formatted}${this.props.suffix}`,
        });
      }
    });
  }

  componentWillUnmount() {
    if (this.listener) {
      this.props.animatedValue.removeListener(this.listener);
    }
  }

  formatNumber(value: number): string {
    const { formatOptions } = this.props;

    // Default formatting for currency-like display
    if (formatOptions.style === "currency") {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...formatOptions,
      }).format(value);
    }

    return new Intl.NumberFormat("en-US", formatOptions).format(Math.round(value));
  }

  render() {
    const { prefix, suffix, style } = this.props;
    const formatted = this.formatNumber(this.currentValue);

    return (
      <Text ref={this.textRef} style={style}>
        {`${prefix}${formatted}${suffix}`}
      </Text>
    );
  }
}

/**
 * AnimatedCurrency Component
 * Convenience wrapper for currency values (stored in cents)
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
  const [displayText, setDisplayText] = React.useState("");

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

  return <Text style={style}>{displayText}</Text>;
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
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      previousValue.current = value;
    }
  }, [value]);

  const formatted = new Intl.NumberFormat("en-US", formatOptions).format(value);

  return (
    <Animated.Text style={[style, { transform: [{ scale: scaleAnim }] }]}>
      {`${prefix}${formatted}${suffix}`}
    </Animated.Text>
  );
}
