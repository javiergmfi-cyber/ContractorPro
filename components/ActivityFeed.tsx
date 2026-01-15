/**
 * Activity Feed Component
 * Displays recent system activity in a timeline format
 *
 * Shows:
 * - Invoice sent events
 * - Invoice viewed events (Pro only - read receipts)
 * - Auto-reminder sent events
 * - Payment received events
 */

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Send,
  Eye,
  Bell,
  CheckCircle,
  Lock,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { useActivityStore } from "@/store/useActivityStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import {
  ActivityEvent,
  ActivityEventType,
  formatActivityMessage,
} from "@/services/activity";

interface ActivityFeedProps {
  limit?: number;
  showViewAll?: boolean;
}

export function ActivityFeed({ limit = 10, showViewAll = true }: ActivityFeedProps) {
  const router = useRouter();
  const { colors, typography, spacing, radius } = useTheme();
  const { events, isLoading } = useActivityStore();
  const { isPro, canUseReadReceipts } = useSubscriptionStore();

  const displayEvents = events.slice(0, limit);

  const getIcon = (type: ActivityEventType) => {
    switch (type) {
      case "invoice_sent":
        return Send;
      case "invoice_viewed":
        return Eye;
      case "reminder_sent":
        return Bell;
      case "payment_received":
        return CheckCircle;
      default:
        return Send;
    }
  };

  const getIconColor = (type: ActivityEventType) => {
    switch (type) {
      case "invoice_sent":
        return colors.systemBlue;
      case "invoice_viewed":
        return colors.systemOrange;
      case "reminder_sent":
        return colors.systemPurple || "#5856D6";
      case "payment_received":
        return colors.statusPaid;
      default:
        return colors.textTertiary;
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatAmount = (cents: number | null): string => {
    if (!cents) return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleEventPress = (event: ActivityEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (event.invoice_id) {
      router.push(`/invoice/${event.invoice_id}`);
    }
  };

  const handleUpgradePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/paywall?trigger=read_receipts");
  };

  if (displayEvents.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[typography.footnote, { color: colors.textTertiary }]}>
          No recent activity
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {displayEvents.map((event, index) => {
        const Icon = getIcon(event.type);
        const iconColor = getIconColor(event.type);
        const isViewedEvent = event.type === "invoice_viewed";
        const isLocked = isViewedEvent && !canUseReadReceipts();

        return (
          <Pressable
            key={event.id}
            onPress={() => (isLocked ? handleUpgradePress() : handleEventPress(event))}
            style={({ pressed }) => [
              styles.eventRow,
              {
                backgroundColor: pressed ? colors.backgroundSecondary : "transparent",
                opacity: isLocked ? 0.6 : 1,
              },
            ]}
          >
            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: iconColor + "15" },
              ]}
            >
              {isLocked ? (
                <Lock size={16} color={colors.textTertiary} />
              ) : (
                <Icon size={16} color={iconColor} />
              )}
            </View>

            {/* Content */}
            <View style={styles.eventContent}>
              <Text
                style={[
                  styles.eventMessage,
                  { color: isLocked ? colors.textTertiary : colors.text },
                ]}
                numberOfLines={1}
              >
                {isLocked ? `Invoice viewed by ${event.client_name}` : formatActivityMessage(event)}
              </Text>
              <Text style={[styles.eventTime, { color: colors.textTertiary }]}>
                {formatRelativeTime(event.created_at)}
                {event.amount && ` • ${formatAmount(event.amount)}`}
              </Text>
            </View>

            {/* Lock icon for gated content */}
            {isLocked && (
              <View style={[styles.upgradeBadge, { backgroundColor: colors.systemOrange + "20" }]}>
                <Text style={[styles.upgradeBadgeText, { color: colors.systemOrange }]}>
                  PRO
                </Text>
              </View>
            )}

            {/* Timeline connector */}
            {index < displayEvents.length - 1 && (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: colors.border },
                ]}
              />
            )}
          </Pressable>
        );
      })}

      {/* View All Link */}
      {showViewAll && events.length > limit && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // TODO: Navigate to full activity history
          }}
          style={[styles.viewAllRow, { borderTopColor: colors.border }]}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View All Activity
          </Text>
          <ChevronRight size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    position: "relative",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  eventContent: {
    flex: 1,
    marginLeft: 12,
  },
  eventMessage: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: "400",
  },
  upgradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  upgradeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  connector: {
    position: "absolute",
    left: 19,
    top: 48,
    width: 2,
    height: 12,
    borderRadius: 1,
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
});
