import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Check, Bell, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { Invoice, InvoiceStatus, formatCurrency, formatRelativeDate } from "@/types";

/**
 * InvoiceCard Component - Apple Wallet Aesthetic
 * Visual Metaphor: Physical Ticket / Pass
 *
 * Layout:
 * - Top Left: Client Name (17pt, semibold)
 * - Top Right: Status Dot (8px, glowing)
 * - Bottom Left: Relative Date (gray)
 * - Bottom Right: Amount (20pt, bold, tabular-nums)
 */

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
  onMarkPaid?: () => void;
  onRemind?: () => void;
  onVoid?: () => void;
}

export function InvoiceCard({
  invoice,
  onPress,
  onMarkPaid,
  onRemind,
  onVoid,
}: InvoiceCardProps) {
  const { colors, isDark } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Status dot colors with glow
  const getStatusDotColor = (status: InvoiceStatus): string => {
    switch (status) {
      case "paid":
        return colors.statusPaid;
      case "sent":
        return colors.statusSent;
      case "overdue":
        return colors.statusOverdue;
      case "draft":
        return colors.statusDraft;
      case "void":
        return colors.textTertiary;
      default:
        return colors.textTertiary;
    }
  };

  const statusDotColor = getStatusDotColor(invoice.status);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  // Right swipe action - Mark as Paid
  const renderRightAction = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (invoice.status === "paid" || !onMarkPaid) return null;

    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          swipeableRef.current?.close();
          onMarkPaid();
        }}
        style={[styles.swipeAction, { backgroundColor: colors.statusPaid }]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Check size={24} color="#FFFFFF" strokeWidth={2.5} />
        </Animated.View>
      </Pressable>
    );
  };

  // Left swipe actions
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.5, 1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.leftActionsContainer}>
        {onRemind && invoice.status !== "paid" && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              swipeableRef.current?.close();
              onRemind();
            }}
            style={[styles.swipeAction, { backgroundColor: colors.systemOrange }]}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Bell size={22} color="#FFFFFF" strokeWidth={2} />
            </Animated.View>
          </Pressable>
        )}
        {onVoid && invoice.status !== "paid" && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              swipeableRef.current?.close();
              onVoid();
            }}
            style={[styles.swipeAction, { backgroundColor: colors.systemRed }]}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Trash2 size={22} color="#FFFFFF" strokeWidth={2} />
            </Animated.View>
          </Pressable>
        )}
      </View>
    );
  };

  // Format amount
  const formattedAmount = formatCurrency(invoice.total, invoice.currency);

  // Format relative date
  const relativeDate = invoice.created_at
    ? formatRelativeDate(invoice.created_at)
    : "Just now";

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightAction}
      renderLeftActions={renderLeftActions}
      friction={2}
      overshootRight={false}
      overshootLeft={false}
      containerStyle={styles.swipeableContainer}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              transform: [{ scale: scaleAnim }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 12,
            },
          ]}
        >
          {/* Top Row: Client Name + Status Dot */}
          <View style={styles.topRow}>
            {/* Client Name (Top Left) */}
            <Text
              style={[styles.clientName, { color: colors.text }]}
              numberOfLines={1}
            >
              {invoice.client_name}
            </Text>

            {/* Status Dot (Top Right) - Glowing */}
            <View style={styles.statusDotContainer}>
              {/* Glow layer */}
              <View
                style={[
                  styles.statusDotGlow,
                  {
                    backgroundColor: statusDotColor,
                    shadowColor: statusDotColor,
                  },
                ]}
              />
              {/* Main dot */}
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusDotColor },
                ]}
              />
            </View>
          </View>

          {/* Bottom Row: Date + Amount */}
          <View style={styles.bottomRow}>
            {/* Relative Date (Bottom Left) */}
            <Text style={[styles.dateText, { color: colors.textTertiary }]}>
              {relativeDate}
            </Text>

            {/* Amount (Bottom Right) */}
            <Text style={[styles.amount, { color: colors.text }]}>
              {formattedAmount}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeableContainer: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    elevation: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  clientName: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
    flex: 1,
    marginRight: 12,
  },
  statusDotContainer: {
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDotGlow: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  amount: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },
  leftActionsContainer: {
    flexDirection: "row",
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: 22,
    marginRight: 8,
  },
});
