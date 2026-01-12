import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/lib/theme";
import { useOfflineStore } from "@/store/useOfflineStore";

interface OfflineIndicatorProps {
  compact?: boolean;
  showSyncButton?: boolean;
}

export function OfflineIndicator({
  compact = false,
  showSyncButton = true,
}: OfflineIndicatorProps) {
  const { colors } = useTheme();
  const {
    isOnline,
    isSyncing,
    pendingUploads,
    pendingOperations,
    syncNow,
  } = useOfflineStore();

  const pulseAnim = useSharedValue(1);

  // Pulse animation when offline
  React.useEffect(() => {
    if (!isOnline) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = withSpring(1);
    }
  }, [isOnline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const totalPending = pendingUploads + pendingOperations;

  // Don't show if online and nothing pending
  if (isOnline && totalPending === 0) {
    return null;
  }

  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, animatedStyle]}>
        <View
          style={[
            styles.compactBadge,
            {
              backgroundColor: isOnline
                ? colors.primary
                : colors.statusOverdue,
            },
          ]}
        >
          <Ionicons
            name={isOnline ? "cloud-upload" : "cloud-offline"}
            size={14}
            color="white"
          />
          {totalPending > 0 && (
            <Text style={styles.compactCount}>{totalPending}</Text>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isOnline
            ? colors.background
            : colors.statusOverdue + "15",
          borderColor: isOnline ? colors.border : colors.statusOverdue,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isOnline ? "cloud-upload" : "cloud-offline"}
            size={20}
            color={isOnline ? colors.primary : colors.statusOverdue}
          />
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: isOnline ? colors.text : colors.statusOverdue },
            ]}
          >
            {isOnline ? "Syncing..." : "You're Offline"}
          </Text>

          {totalPending > 0 && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {totalPending} item{totalPending !== 1 ? "s" : ""} pending
            </Text>
          )}

          {!isOnline && totalPending === 0 && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Changes will sync when online
            </Text>
          )}
        </View>

        {showSyncButton && isOnline && totalPending > 0 && (
          <TouchableOpacity
            style={[styles.syncButton, { backgroundColor: colors.primary }]}
            onPress={syncNow}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.syncButtonText}>Sync</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

/**
 * Simple offline banner for top of screen
 */
export function OfflineBanner() {
  const { colors } = useTheme();
  const { isOnline } = useOfflineStore();

  if (isOnline) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: colors.statusOverdue }]}>
      <Ionicons name="cloud-offline" size={16} color="white" />
      <Text style={styles.bannerText}>No Internet Connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  syncButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  compactContainer: {},
  compactBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  compactCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 8,
  },
  bannerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});
