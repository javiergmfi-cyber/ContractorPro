import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DollarSign,
  Percent,
  Check,
  ChevronRight,
  Crown,
  Lock,
  Sparkles,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useRouter } from "expo-router";
import { DepositType } from "@/types/database";

interface DepositSelectorProps {
  totalAmount: number; // in cents
  clientName: string;
  depositEnabled: boolean;
  depositType: DepositType | null;
  depositValue: number | null;
  onDepositChange: (settings: {
    depositEnabled: boolean;
    depositType: DepositType | null;
    depositValue: number | null;
    depositAmount: number;
  }) => void;
}

const PRESET_OPTIONS = [
  { label: "No deposit", value: null, percent: 0 },
  { label: "30%", value: 30, percent: 30 },
  { label: "50%", value: 50, percent: 50 },
];

export function DepositSelector({
  totalAmount,
  clientName,
  depositEnabled,
  depositType,
  depositValue,
  onDepositChange,
}: DepositSelectorProps) {
  const { colors, typography, spacing, radius } = useTheme();
  const { isPro } = useSubscriptionStore();
  const router = useRouter();

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customType, setCustomType] = useState<DepositType>("percent");
  const [customValue, setCustomValue] = useState("");

  // Calculate deposit amount based on settings
  const calculateDepositAmount = (
    type: DepositType | null,
    value: number | null
  ): number => {
    if (!type || !value) return 0;
    if (type === "percent") {
      return Math.round((totalAmount * value) / 100);
    }
    return value; // fixed amount in cents
  };

  const currentDepositAmount = calculateDepositAmount(depositType, depositValue);

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleOptionSelect = (option: typeof PRESET_OPTIONS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // PRO gate - check if trying to enable deposits
    if (option.value !== null && !isPro) {
      router.push("/paywall?trigger=deposits");
      return;
    }

    if (option.value === null) {
      onDepositChange({
        depositEnabled: false,
        depositType: null,
        depositValue: null,
        depositAmount: 0,
      });
    } else {
      onDepositChange({
        depositEnabled: true,
        depositType: "percent",
        depositValue: option.value,
        depositAmount: calculateDepositAmount("percent", option.value),
      });
    }
  };

  const handleCustomPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // PRO gate
    if (!isPro) {
      router.push("/paywall?trigger=deposits");
      return;
    }

    setShowCustomModal(true);
  };

  const handleCustomSave = () => {
    const value = parseFloat(customValue);
    if (isNaN(value) || value <= 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const actualValue = customType === "fixed" ? Math.round(value * 100) : value;

    onDepositChange({
      depositEnabled: true,
      depositType: customType,
      depositValue: actualValue,
      depositAmount: calculateDepositAmount(customType, actualValue),
    });

    setShowCustomModal(false);
    setCustomValue("");
  };

  const isCustomSelected =
    depositEnabled &&
    depositType !== null &&
    !PRESET_OPTIONS.some(
      (opt) => opt.value === depositValue && depositType === "percent"
    );

  // Get first name for personalization
  const firstName = clientName.split(" ")[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
      {/* Header with value proposition */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
            <DollarSign size={20} color={colors.primary} />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]}>
                Collect deposit upfront
              </Text>
              {!isPro && (
                <View style={[styles.proBadge, { backgroundColor: colors.systemOrange + "15" }]}>
                  <Crown size={10} color={colors.systemOrange} />
                  <Text style={[styles.proBadgeText, { color: colors.systemOrange }]}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
              {firstName} can approve & pay deposit directly from the link you send.
            </Text>
          </View>
        </View>
      </View>

      {/* Value message */}
      <View style={[styles.valueBanner, { backgroundColor: colors.primary + "08" }]}>
        <Sparkles size={14} color={colors.primary} />
        <Text style={[styles.valueText, { color: colors.primary }]}>
          No extra steps for you. Send once, get your deposit.
        </Text>
      </View>

      {/* Deposit options */}
      <View style={styles.optionsContainer}>
        {PRESET_OPTIONS.map((option, index) => {
          const isSelected =
            option.value === null
              ? !depositEnabled
              : depositEnabled &&
                depositType === "percent" &&
                depositValue === option.value;

          const depositAmt =
            option.value !== null
              ? calculateDepositAmount("percent", option.value)
              : 0;

          return (
            <Pressable
              key={index}
              onPress={() => handleOptionSelect(option)}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected
                    ? colors.primary + "15"
                    : colors.backgroundSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    { color: isSelected ? colors.primary : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
                {option.value !== null && (
                  <Text
                    style={[
                      styles.optionAmount,
                      { color: isSelected ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {formatCurrency(depositAmt)}
                  </Text>
                )}
              </View>
              {isSelected && (
                <Check size={18} color={colors.primary} strokeWidth={3} />
              )}
            </Pressable>
          );
        })}

        {/* Custom option */}
        <Pressable
          onPress={handleCustomPress}
          style={[
            styles.optionButton,
            {
              backgroundColor: isCustomSelected
                ? colors.primary + "15"
                : colors.backgroundSecondary,
              borderColor: isCustomSelected ? colors.primary : colors.border,
              borderWidth: isCustomSelected ? 2 : 1,
            },
          ]}
        >
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionLabel,
                { color: isCustomSelected ? colors.primary : colors.text },
              ]}
            >
              Custom amount
            </Text>
            {isCustomSelected && (
              <Text
                style={[
                  styles.optionAmount,
                  { color: colors.primary },
                ]}
              >
                {formatCurrency(currentDepositAmount)}
              </Text>
            )}
          </View>
          {isCustomSelected ? (
            <Check size={18} color={colors.primary} strokeWidth={3} />
          ) : (
            <ChevronRight size={18} color={colors.textTertiary} />
          )}
        </Pressable>
      </View>

      {/* Summary when deposit is enabled */}
      {depositEnabled && currentDepositAmount > 0 && (
        <View style={[styles.summaryContainer, { borderTopColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Deposit
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(currentDepositAmount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Balance (after job)
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(totalAmount - currentDepositAmount)}
            </Text>
          </View>
        </View>
      )}

      {/* Custom Amount Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
        >
          <SafeAreaView style={styles.modalContent}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Pressable onPress={() => setShowCustomModal(false)}>
                <Text style={[styles.modalCancel, { color: colors.primary }]}>Cancel</Text>
              </Pressable>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Custom Deposit</Text>
              <Pressable onPress={handleCustomSave}>
                <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
              </Pressable>
            </View>

            {/* Type Toggle */}
            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                DEPOSIT TYPE
              </Text>
              <View style={styles.typeToggle}>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCustomType("percent");
                  }}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor:
                        customType === "percent"
                          ? colors.primary
                          : colors.backgroundSecondary,
                      borderTopLeftRadius: radius.md,
                      borderBottomLeftRadius: radius.md,
                    },
                  ]}
                >
                  <Percent
                    size={18}
                    color={customType === "percent" ? "#FFFFFF" : colors.text}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: customType === "percent" ? "#FFFFFF" : colors.text },
                    ]}
                  >
                    Percentage
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCustomType("fixed");
                  }}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor:
                        customType === "fixed"
                          ? colors.primary
                          : colors.backgroundSecondary,
                      borderTopRightRadius: radius.md,
                      borderBottomRightRadius: radius.md,
                    },
                  ]}
                >
                  <DollarSign
                    size={18}
                    color={customType === "fixed" ? "#FFFFFF" : colors.text}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: customType === "fixed" ? "#FFFFFF" : colors.text },
                    ]}
                  >
                    Fixed Amount
                  </Text>
                </Pressable>
              </View>

              {/* Value Input */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 24 }]}>
                {customType === "percent" ? "PERCENTAGE" : "AMOUNT"}
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
                ]}
              >
                {customType === "fixed" && (
                  <Text style={[styles.inputPrefix, { color: colors.textSecondary }]}>$</Text>
                )}
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={customValue}
                  onChangeText={setCustomValue}
                  placeholder={customType === "percent" ? "e.g., 25" : "e.g., 500"}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                {customType === "percent" && (
                  <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>%</Text>
                )}
              </View>

              {/* Preview */}
              {customValue && (
                <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    Deposit amount
                  </Text>
                  <Text style={[styles.previewValue, { color: colors.text }]}>
                    {formatCurrency(
                      calculateDepositAmount(
                        customType,
                        customType === "fixed"
                          ? Math.round(parseFloat(customValue || "0") * 100)
                          : parseFloat(customValue || "0")
                      )
                    )}
                  </Text>
                </View>
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 280,
  },
  valueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  valueText: {
    fontSize: 13,
    fontWeight: "500",
  },
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  optionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  summaryContainer: {
    marginTop: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalCancel: {
    fontSize: 17,
    fontWeight: "400",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  modalSave: {
    fontSize: 17,
    fontWeight: "600",
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  typeToggle: {
    flexDirection: "row",
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputPrefix: {
    fontSize: 20,
    fontWeight: "500",
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
  },
  inputSuffix: {
    fontSize: 20,
    fontWeight: "500",
    marginLeft: 4,
  },
  previewCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 28,
    fontWeight: "700",
  },
});

export default DepositSelector;
