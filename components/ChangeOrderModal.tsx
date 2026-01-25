import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { X, AlertTriangle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/types";

interface ChangeOrderModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (description: string, amount: number) => void;
  currentTotal: number;
  currency: string;
}

export function ChangeOrderModal({
  visible,
  onDismiss,
  onSubmit,
  currentTotal,
  currency,
}: ChangeOrderModalProps) {
  const { colors, typography, spacing, radius } = useTheme();

  const [description, setDescription] = useState("");
  const [amountText, setAmountText] = useState("");

  const amountCents = Math.round((parseFloat(amountText) || 0) * 100);
  const newTotal = currentTotal + amountCents;
  const isValid = description.trim().length > 0 && amountCents !== 0;

  const handleSubmit = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(description.trim(), amountCents);
    // Reset form
    setDescription("");
    setAmountText("");
  };

  const handleDismiss = () => {
    setDescription("");
    setAmountText("");
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={handleDismiss} style={styles.headerButton}>
            <X size={24} color={colors.text} />
          </Pressable>
          <Text style={[typography.headline, { color: colors.text }]}>
            Change Order
          </Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={[typography.footnote, { color: colors.textTertiary, marginBottom: 8 }]}>
              Amount
            </Text>
            <View
              style={[
                styles.amountInputContainer,
                { backgroundColor: colors.backgroundSecondary, borderRadius: radius.md },
              ]}
            >
              <Text style={[typography.title2, { color: colors.textTertiary }]}>$</Text>
              <TextInput
                style={[
                  typography.title2,
                  styles.amountInput,
                  { color: colors.text },
                ]}
                value={amountText}
                onChangeText={setAmountText}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
            <Text style={[typography.caption1, { color: colors.textTertiary, marginTop: 4 }]}>
              Use negative amounts for credits/deductions
            </Text>
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={[typography.footnote, { color: colors.textTertiary, marginBottom: 8 }]}>
              Description
            </Text>
            <TextInput
              style={[
                typography.body,
                styles.descriptionInput,
                {
                  color: colors.text,
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: radius.md,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g. Additional drywall repair"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Warning Banner */}
          <View
            style={[
              styles.warningBanner,
              { backgroundColor: colors.alert + "15", borderRadius: radius.md },
            ]}
          >
            <AlertTriangle size={16} color={colors.alert} />
            <Text style={[typography.caption1, { color: colors.alert, marginLeft: 8, flex: 1 }]}>
              This will update the invoice and notify the client
            </Text>
          </View>

          {/* New Total Preview */}
          <View
            style={[
              styles.totalPreview,
              { backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg },
            ]}
          >
            <View style={styles.totalRow}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Current Total
              </Text>
              <Text style={[typography.body, { color: colors.text }]}>
                {formatCurrency(currentTotal, currency)}
              </Text>
            </View>
            {amountCents !== 0 && (
              <View style={styles.totalRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  Change Order
                </Text>
                <Text
                  style={[
                    typography.body,
                    { color: amountCents > 0 ? colors.statusOverdue : colors.statusPaid, fontWeight: "600" },
                  ]}
                >
                  {amountCents > 0 ? "+" : ""}
                  {formatCurrency(amountCents, currency)}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotal, { borderTopColor: colors.border }]}>
              <Text style={[typography.headline, { color: colors.text }]}>
                New Total
              </Text>
              <Text style={[typography.title2, { color: colors.primary }]}>
                {formatCurrency(newTotal, currency)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={[styles.bottomAction, { borderTopColor: colors.border }]}>
          <Button
            title="Add & Notify Client"
            onPress={handleSubmit}
            disabled={!isValid}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    marginHorizontal: -8,
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  amountInput: {
    flex: 1,
    marginLeft: 4,
    padding: 0,
  },
  descriptionInput: {
    padding: 16,
    minHeight: 80,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 24,
  },
  totalPreview: {
    padding: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  grandTotal: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 16,
  },
  bottomAction: {
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
});
