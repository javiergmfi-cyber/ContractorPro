import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Check, Bell, MoreHorizontal, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme, getStatusColor } from "@/lib/theme";
import { Invoice, InvoiceStatus, formatCurrency, formatRelativeDate, toDollars } from "@/types";

/**
 * InvoiceCard Component
 * Per design-system.md "Wallet Pass" paradigm
 *
 * Layout:
 * - Top-left: Client Name (Secondary Field)
 * - Top-right: Status Badge (Capsule)
 * - Bottom-left: Invoice ID + Relative Date (Auxiliary)
 * - Bottom-right: Amount (Primary Field)
 */

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
  onMarkPaid?: () => void;
  onRemind?: () => void;
  onMore?: () => void;
  onVoid?: () => void;
}

export function InvoiceCard({
  invoice,
  onPress,
  onMarkPaid,
  onRemind,
  onMore,
  onVoid,
}: InvoiceCardProps) {
  const { colors, typography, spacing, radius, shadows } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const statusColors = getStatusColor(invoice.status, colors);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Right swipe action - Mark as Paid (per design-system.md Section 1.4)
  const renderRightAction = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (invoice.status === "paid" || !onMarkPaid) return null;

    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          swipeableRef.current?.close();
          onMarkPaid();
        }}
        style={[
          styles.swipeAction,
          styles.swipeActionRight,
          { backgroundColor: colors.statusPaid },
        ]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Check size={24} color="#FFFFFF" strokeWidth={3} />
        </Animated.View>
        <Text style={styles.swipeActionText}>Paid</Text>
      </Pressable>
    );
  };

  // Left swipe actions - More, Remind, Void (per design-system.md Section 1.4)
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.leftActionsContainer}>
        {onMore && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              swipeableRef.current?.close();
              onMore();
            }}
            style={[styles.swipeAction, { backgroundColor: colors.textTertiary }]}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <MoreHorizontal size={20} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.swipeActionText}>More</Text>
          </Pressable>
        )}
        {onRemind && invoice.status !== "paid" && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              swipeableRef.current?.close();
              onRemind();
            }}
            style={[styles.swipeAction, { backgroundColor: colors.statusOverdue }]}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Bell size={20} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.swipeActionText}>Remind</Text>
          </Pressable>
        )}
        {onVoid && invoice.status !== "paid" && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              swipeableRef.current?.close();
              onVoid();
            }}
            style={[styles.swipeAction, { backgroundColor: colors.error }]}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <Trash2 size={20} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.swipeActionText}>Void</Text>
          </Pressable>
        )}
      </View>
    );
  };

  // Format amount for display
  const formattedAmount = formatCurrency(invoice.total, invoice.currency);

  // Format relative date
  const relativeDate = invoice.due_date
    ? formatRelativeDate(invoice.due_date)
    : formatRelativeDate(invoice.created_at);

  const statusLabels: Record<InvoiceStatus, string> = {
    draft: "DRAFT",
    sent: "SENT",
    paid: "PAID",
    overdue: "OVERDUE",
    void: "VOID",
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightAction}
      renderLeftActions={renderLeftActions}
      friction={2}
      overshootRight={false}
      overshootLeft={false}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            borderRadius: radius.md, // 12pt per design-system.md
            ...shadows.default,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        {/* Top Row: Client Name + Status Badge */}
        <View style={styles.topRow}>
          {/* Secondary Field: Client Name (top-left) */}
          <Text
            style={[
              typography.headline,
              { color: colors.text, flex: 1 },
            ]}
            numberOfLines={1}
          >
            {invoice.client_name}
          </Text>

          {/* Status Badge (top-right, capsule shape) */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors.background },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusColors.text },
              ]}
            >
              {statusLabels[invoice.status]}
            </Text>
          </View>
        </View>

        {/* Bottom Row: Metadata + Amount */}
        <View style={styles.bottomRow}>
          {/* Auxiliary Fields: Invoice ID + Date (bottom-left) */}
          <View style={styles.metadata}>
            <Text style={[typography.footnote, { color: colors.textTertiary }]}>
              {invoice.invoice_number}
            </Text>
            <Text style={[typography.footnote, { color: colors.textTertiary }]}>
              {" "}•{" "}
            </Text>
            <Text style={[typography.footnote, { color: colors.textTertiary }]}>
              {relativeDate}
            </Text>
          </View>

          {/* Primary Field: Amount (bottom-right) */}
          <Text
            style={[
              typography.invoiceAmount,
              { color: colors.text },
            ]}
          >
            {formattedAmount}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
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
  metadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // Capsule/Lozenge shape
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  leftActionsContainer: {
    flexDirection: "row",
  },
  swipeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    paddingVertical: 8,
  },
  swipeActionRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  swipeActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
