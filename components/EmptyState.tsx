import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  FileText,
  Users,
  Search,
  CheckCircle,
  Mic,
} from "lucide-react-native";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";

/**
 * EmptyState Component
 * Per design-system.md Section 3 - Empty State Psychology
 *
 * Types:
 * - firstRun: "Let's Get You Paid" with action
 * - allCaughtUp: Celebration for empty filtered list
 * - noResults: Search returned nothing
 * - noClients: No clients yet
 */

type EmptyStateType = "firstRun" | "allCaughtUp" | "noResults" | "noClients";

interface EmptyStateProps {
  type: EmptyStateType;
  searchQuery?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({
  type,
  searchQuery,
  onAction,
  actionLabel,
}: EmptyStateProps) {
  const { colors, typography, spacing } = useTheme();

  const configs: Record<
    EmptyStateType,
    {
      icon: React.ReactNode;
      title: string;
      message: string;
      showAction: boolean;
      defaultActionLabel: string;
    }
  > = {
    firstRun: {
      icon: <Mic size={64} color={colors.primary} strokeWidth={1.5} />,
      title: "Let's Get You Paid",
      message:
        "Create your first invoice in seconds. Just tap the microphone and describe the work.",
      showAction: true,
      defaultActionLabel: "Create First Invoice",
    },
    allCaughtUp: {
      icon: <CheckCircle size={64} color={colors.statusPaid} strokeWidth={1.5} />,
      title: "All Caught Up!",
      message: "No overdue invoices. Great job staying on top of your billing.",
      showAction: false,
      defaultActionLabel: "",
    },
    noResults: {
      icon: <Search size={64} color={colors.textTertiary} strokeWidth={1.5} />,
      title: "No Results Found",
      message: searchQuery
        ? `No invoices matching "${searchQuery}"`
        : "Try adjusting your search or filters.",
      showAction: !!searchQuery,
      defaultActionLabel: searchQuery ? `Create Invoice for "${searchQuery}"` : "Clear Search",
    },
    noClients: {
      icon: <Users size={64} color={colors.textTertiary} strokeWidth={1.5} />,
      title: "No Clients Yet",
      message:
        "Your clients will appear here once you create invoices for them.",
      showAction: true,
      defaultActionLabel: "Add First Client",
    },
  };

  const config = configs[type];

  return (
    <View style={styles.container}>
      {/* Illustration/Icon */}
      <View style={styles.iconContainer}>{config.icon}</View>

      {/* Title - Per design-system.md "Human" copywriting */}
      <Text
        style={[
          typography.title2,
          { color: colors.text, textAlign: "center", marginTop: spacing.lg },
        ]}
      >
        {config.title}
      </Text>

      {/* Message */}
      <Text
        style={[
          typography.body,
          {
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: spacing.sm,
            paddingHorizontal: spacing.xl,
            lineHeight: 24,
          },
        ]}
      >
        {config.message}
      </Text>

      {/* Action Button */}
      {config.showAction && onAction && (
        <View style={[styles.buttonContainer, { marginTop: spacing.xl }]}>
          <Button
            title={actionLabel || config.defaultActionLabel}
            onPress={onAction}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    opacity: 0.9,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 280,
  },
});
