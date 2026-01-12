import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "@/lib/theme";

/**
 * SkeletonCard Component
 * Per design-system.md Section 3.3
 * Shimmering placeholder matching invoice card layout
 */

interface SkeletonCardProps {
  count?: number;
}

function SkeletonItem() {
  const { colors, radius, shadows } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonColor = colors.textTertiary + "30";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          ...shadows.default,
        },
      ]}
    >
      {/* Top Row: Name + Badge skeleton */}
      <View style={styles.topRow}>
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.nameSkeleton,
            { backgroundColor: skeletonColor, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.badgeSkeleton,
            { backgroundColor: skeletonColor, opacity },
          ]}
        />
      </View>

      {/* Bottom Row: Metadata + Amount skeleton */}
      <View style={styles.bottomRow}>
        <View style={styles.metadataRow}>
          <Animated.View
            style={[
              styles.skeletonLine,
              styles.idSkeleton,
              { backgroundColor: skeletonColor, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.skeletonLine,
              styles.dateSkeleton,
              { backgroundColor: skeletonColor, opacity },
            ]}
          />
        </View>
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.amountSkeleton,
            { backgroundColor: skeletonColor, opacity },
          ]}
        />
      </View>
    </View>
  );
}

export function SkeletonCard({ count = 3 }: SkeletonCardProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skeletonLine: {
    borderRadius: 4,
  },
  nameSkeleton: {
    width: 140,
    height: 20,
  },
  badgeSkeleton: {
    width: 60,
    height: 24,
    borderRadius: 12,
  },
  idSkeleton: {
    width: 70,
    height: 14,
  },
  dateSkeleton: {
    width: 50,
    height: 14,
  },
  amountSkeleton: {
    width: 80,
    height: 24,
  },
});
