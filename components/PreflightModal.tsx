/**
 * Pre-Flight Check Modal
 * "Bad Cop is about to chase X clients. Tap to review or cancel."
 *
 * This modal appears before auto-reminders are sent, giving the contractor
 * a chance to review and cancel specific reminders (the "kill switch").
 */

import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Shield,
  X,
  Send,
  Clock,
  AlertTriangle,
  Check,
  Ban,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { usePreflightStore } from "@/store/usePreflightStore";
import { PendingReminder } from "@/services/preflight";

export function PreflightModal() {
  const { colors, typography, spacing, radius } = useTheme();
  const {
    isVisible,
    isLoading,
    pendingReminders,
    cancelledIds,
    hidePreflightModal,
    toggleCancelReminder,
    sendAllReminders,
    cancelAllReminders,
  } = usePreflightStore();

  const activeReminders = pendingReminders.filter(
    (r) => !cancelledIds.has(r.invoice.id)
  );
  const totalAmount = activeReminders.reduce(
    (sum, r) => sum + r.invoice.total,
    0
  );

  const handleSendAll = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result = await sendAllReminders();
    if (result.sent > 0) {
      // Success feedback handled by store
    }
  };

  const handleCancelAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    cancelAllReminders();
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    hidePreflightModal();
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getReminderTypeLabel = (type: PendingReminder["reminderType"]) => {
    switch (type) {
      case "pre_due":
        return "Due in 3 days";
      case "due_date":
        return "Due today";
      case "overdue":
        return "Overdue";
    }
  };

  const getReminderTypeColor = (type: PendingReminder["reminderType"]) => {
    switch (type) {
      case "pre_due":
        return colors.systemBlue;
      case "due_date":
        return colors.systemOrange;
      case "overdue":
        return colors.statusOverdue;
    }
  };

  const renderReminder = ({ item }: { item: PendingReminder }) => {
    const isCancelled = cancelledIds.has(item.invoice.id);
    const typeColor = getReminderTypeColor(item.reminderType);

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          toggleCancelReminder(item.invoice.id);
        }}
        style={[
          styles.reminderCard,
          {
            backgroundColor: isCancelled
              ? colors.backgroundSecondary
              : colors.card,
            borderColor: isCancelled ? colors.border : typeColor + "30",
            opacity: isCancelled ? 0.6 : 1,
          },
        ]}
      >
        {/* Client Avatar */}
        <View
          style={[
            styles.avatar,
            { backgroundColor: isCancelled ? colors.border : colors.primary + "20" },
          ]}
        >
          <Text
            style={[
              typography.headline,
              { color: isCancelled ? colors.textTertiary : colors.primary },
            ]}
          >
            {item.invoice.client_name?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.reminderContent}>
          <Text
            style={[
              typography.body,
              {
                color: isCancelled ? colors.textTertiary : colors.text,
                fontWeight: "600",
                textDecorationLine: isCancelled ? "line-through" : "none",
              },
            ]}
          >
            {item.invoice.client_name}
          </Text>

          <View style={styles.reminderMeta}>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: isCancelled ? colors.border : typeColor + "15" },
              ]}
            >
              <Text
                style={[
                  typography.caption2,
                  {
                    color: isCancelled ? colors.textTertiary : typeColor,
                    fontWeight: "600",
                  },
                ]}
              >
                {getReminderTypeLabel(item.reminderType)}
              </Text>
            </View>

            <Text style={[typography.caption1, { color: colors.textTertiary }]}>
              {item.invoice.invoice_number}
            </Text>
          </View>
        </View>

        {/* Amount & Action */}
        <View style={styles.reminderRight}>
          <Text
            style={[
              typography.headline,
              {
                color: isCancelled ? colors.textTertiary : colors.text,
                textDecorationLine: isCancelled ? "line-through" : "none",
              },
            ]}
          >
            {formatCurrency(item.invoice.total)}
          </Text>

          <View
            style={[
              styles.actionIcon,
              {
                backgroundColor: isCancelled
                  ? colors.statusOverdue + "20"
                  : colors.statusPaid + "20",
              },
            ]}
          >
            {isCancelled ? (
              <Ban size={16} color={colors.statusOverdue} />
            ) : (
              <Check size={16} color={colors.statusPaid} />
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (pendingReminders.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDismiss}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleDismiss} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + "15" }]}>
              <Shield size={24} color={colors.primary} />
            </View>
            <Text style={[typography.title2, { color: colors.text, marginTop: spacing.sm }]}>
              Pre-Flight Check
            </Text>
            <Text style={[typography.footnote, { color: colors.textSecondary }]}>
              Review reminders before sending
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        {/* Summary */}
        <View style={[styles.summary, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.summaryItem}>
            <Text style={[typography.caption1, { color: colors.textTertiary }]}>
              Clients
            </Text>
            <Text style={[typography.title2, { color: colors.text }]}>
              {activeReminders.length}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[typography.caption1, { color: colors.textTertiary }]}>
              Total at Risk
            </Text>
            <Text style={[typography.title2, { color: colors.primary }]}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <AlertTriangle size={16} color={colors.systemOrange} />
          <Text style={[typography.caption1, { color: colors.textSecondary, marginLeft: 8, flex: 1 }]}>
            Tap a client to cancel their reminder. Cancelled reminders won't be sent today.
          </Text>
        </View>

        {/* Reminder List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={pendingReminders}
            keyExtractor={(item) => item.invoice.id}
            renderItem={renderReminder}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Action Buttons */}
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={handleCancelAll}
            style={[styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
          >
            <Clock size={18} color={colors.textSecondary} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 8 }]}>
              Snooze All
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSendAll}
            disabled={activeReminders.length === 0 || isLoading}
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  activeReminders.length === 0 ? colors.border : colors.primary,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Send size={18} color="#FFFFFF" />
                <Text style={[typography.headline, { color: "#FFFFFF", marginLeft: 8 }]}>
                  Send {activeReminders.length > 0 ? `(${activeReminders.length})` : ""}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: "100%",
  },
  instructions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderContent: {
    flex: 1,
    marginLeft: 12,
  },
  reminderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reminderRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  sendButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
});
