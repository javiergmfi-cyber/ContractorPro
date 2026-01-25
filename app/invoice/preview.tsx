import React, { useState, Fragment } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  X,
  Check,
  AlertTriangle,
  Mic,
  Edit3,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
  FileText,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { SuccessOverlay } from "@/components/SuccessOverlay";
import { BlackCardInvoice } from "@/components/BlackCardInvoice";
import { DepositSelector } from "@/components/DepositSelector";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useProfileStore } from "@/store/useProfileStore";
import { formatCurrency, toDollars } from "@/types";
import { DepositType } from "@/types/database";
import * as db from "@/services/database";

/**
 * Invoice Preview Screen
 * Per design-system.md Section 3
 *
 * Features:
 * - AI confidence score display
 * - Highlight original transcript segments
 * - Editable fields before confirmation
 * - "Looks Wrong? Re-record" option
 */

export default function InvoicePreview() {
  const router = useRouter();
  const { colors, typography, spacing, radius } = useTheme();
  const { pendingInvoice, clearPendingInvoice } = useInvoiceStore();
  const { profile } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCustomerView, setShowCustomerView] = useState(false);

  // Editable fields
  const [clientName, setClientName] = useState(pendingInvoice?.clientName || "");
  const [items, setItems] = useState(pendingInvoice?.items || []);

  // Deposit settings - initialize from pending invoice if available
  const [depositEnabled, setDepositEnabled] = useState(
    pendingInvoice?.deposit_enabled ?? false
  );
  const [depositType, setDepositType] = useState<DepositType | null>(
    pendingInvoice?.deposit_type ?? null
  );
  const [depositValue, setDepositValue] = useState<number | null>(
    pendingInvoice?.deposit_value ?? null
  );
  // Calculate initial deposit amount
  const initialDepositAmount = (() => {
    if (!pendingInvoice?.deposit_enabled || !pendingInvoice?.deposit_type || !pendingInvoice?.deposit_value) {
      return 0;
    }
    const itemsTotal = (pendingInvoice.items || []).reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    if (pendingInvoice.deposit_type === "percent") {
      return Math.round((itemsTotal * pendingInvoice.deposit_value) / 100);
    }
    return pendingInvoice.deposit_value;
  })();
  const [depositAmount, setDepositAmount] = useState(initialDepositAmount);

  if (!pendingInvoice) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            No invoice data
          </Text>
          <Button
            title="Go Back"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const confidence = pendingInvoice.confidence || 0.85;
  const confidencePercent = Math.round(confidence * 100);
  const isLowConfidence = confidence < 0.7;

  // Calculate totals (amounts in cents)
  const subtotal = items.reduce(
    (sum, item) => sum + (item.unitPrice || item.price * 100) * (item.quantity || 1),
    0
  );
  const taxRate = profile?.tax_rate || 0;
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + taxAmount;

  const handleDepositChange = (settings: {
    depositEnabled: boolean;
    depositType: DepositType | null;
    depositValue: number | null;
    depositAmount: number;
  }) => {
    setDepositEnabled(settings.depositEnabled);
    setDepositType(settings.depositType);
    setDepositValue(settings.depositValue);
    setDepositAmount(settings.depositAmount);
  };

  const handleConfirm = async () => {
    setIsSaving(true);

    try {
      // Create invoice in database with deposit settings
      const invoiceData = {
        client_name: clientName,
        subtotal,
        tax_amount: taxAmount,
        total,
        currency: profile?.default_currency || "USD",
        status: "draft" as const,
        notes: pendingInvoice.notes,
        // Deposit settings
        deposit_enabled: depositEnabled,
        deposit_type: depositType,
        deposit_value: depositValue,
        deposit_amount: depositAmount,
        amount_paid: 0,
      };

      const newInvoice = await db.createInvoice(invoiceData);

      if (newInvoice) {
        // Create invoice items
        for (const item of items) {
          await db.createInvoiceItem({
            invoice_id: newInvoice.id,
            description: item.description,
            quantity: item.quantity || 1,
            unit_price: item.unitPrice || item.price * 100,
            total: (item.unitPrice || item.price * 100) * (item.quantity || 1),
            original_transcript_segment: item.originalTranscript,
          });
        }

        clearPendingInvoice();
        setIsSaving(false);

        // Show cinematic success overlay
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      setIsSaving(false);
      Alert.alert("Error", "Failed to create invoice. Please try again.");
    }
  };

  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    router.replace("/(tabs)/invoices");
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearPendingInvoice();
    router.back();
  };

  const handleReRecord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearPendingInvoice();
    router.replace("/(tabs)");
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], quantity: Math.max(1, quantity) };
    setItems(newItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], unitPrice: price, price: price / 100 };
    setItems(newItems);
  };

  const updateItemDescription = (index: number, description: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], description };
    setItems(newItems);
  };

  const getConfidenceColor = () => {
    if (confidence >= 0.9) return colors.statusPaid;
    if (confidence >= 0.7) return colors.alert;
    return colors.statusOverdue;
  };

  // Dismiss keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={handleCancel} style={styles.headerButton}>
            <X size={24} color={colors.text} />
          </Pressable>
          <Text style={[typography.headline, { color: colors.text }]}>
            {showCustomerView ? "Customer View" : "Invoice Preview"}
          </Text>
          <Pressable
            onPress={() => {
              if (showCustomerView) {
                setShowCustomerView(false);
              } else {
                setIsEditing(!isEditing);
              }
            }}
            style={styles.headerButton}
          >
            {showCustomerView ? (
              <FileText size={22} color={colors.primary} />
            ) : (
              <Edit3 size={22} color={isEditing ? colors.primary : colors.text} />
            )}
          </Pressable>
        </View>

        {/* View Toggle - Edit vs Customer Preview */}
        <View style={[styles.viewToggle, { backgroundColor: colors.backgroundSecondary }]}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCustomerView(false);
            }}
            style={[
              styles.toggleButton,
              !showCustomerView && { backgroundColor: colors.card },
              { borderRadius: radius.sm }
            ]}
          >
            <FileText size={16} color={!showCustomerView ? colors.primary : colors.textTertiary} />
            <Text style={[
              typography.footnote,
              {
                color: !showCustomerView ? colors.text : colors.textTertiary,
                fontWeight: !showCustomerView ? "600" : "400",
                marginLeft: 6
              }
            ]}>
              Edit
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCustomerView(true);
            }}
            style={[
              styles.toggleButton,
              showCustomerView && { backgroundColor: colors.card },
              { borderRadius: radius.sm }
            ]}
          >
            <Eye size={16} color={showCustomerView ? colors.primary : colors.textTertiary} />
            <Text style={[
              typography.footnote,
              {
                color: showCustomerView ? colors.text : colors.textTertiary,
                fontWeight: showCustomerView ? "600" : "400",
                marginLeft: 6
              }
            ]}>
              Customer View
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            showCustomerView && { backgroundColor: '#000000', padding: 16 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={dismissKeyboard}
        >
          {/* Customer View - Black Card Invoice */}
          {showCustomerView ? (
            <View style={styles.customerViewContainer}>
              <Text style={[typography.caption1, {
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }]}>
                This is what your customer will see
              </Text>
              <BlackCardInvoice
                total={total}
                businessName={profile?.business_name || profile?.full_name || "Your Business"}
                logoUrl={profile?.logo_url}
                invoiceNumber={`INV-${Date.now().toString().slice(-6)}`}
                clientName={clientName}
                clientEmail={pendingInvoice.clientEmail}
                items={items.map(item => ({
                  description: item.description,
                  quantity: item.quantity || 1,
                  unitPrice: item.unitPrice || item.price * 100,
                  total: (item.unitPrice || item.price * 100) * (item.quantity || 1),
                }))}
                subtotal={subtotal}
                taxAmount={taxAmount}
                taxRate={taxRate}
                currency={profile?.default_currency || "USD"}
                createdAt={new Date().toISOString()}
              />
              <Text style={[typography.caption2, {
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
                marginTop: 24,
                lineHeight: 18,
              }]}>
                The QR code and Pay button will link to{'\n'}your Stripe payment page
              </Text>
            </View>
          ) : (
            <Fragment>
              {/* AI Confidence Banner */}
          <View
            style={[
              styles.confidenceBanner,
              {
                backgroundColor: getConfidenceColor() + "15",
                borderRadius: radius.md,
              },
            ]}
          >
            <View style={styles.confidenceHeader}>
              <Sparkles size={18} color={getConfidenceColor()} />
              <Text
                style={[
                  typography.footnote,
                  { color: getConfidenceColor(), fontWeight: "600", marginLeft: spacing.xs },
                ]}
              >
                AI Confidence: {confidencePercent}%
              </Text>
            </View>
            {isLowConfidence && (
              <View style={styles.warningRow}>
                <AlertTriangle size={14} color={colors.statusOverdue} />
                <Text
                  style={[
                    typography.caption1,
                    { color: colors.statusOverdue, marginLeft: spacing.xs },
                  ]}
                >
                  Low confidence - please review carefully
                </Text>
              </View>
            )}
          </View>

          {/* Original Transcript Toggle */}
          {pendingInvoice.originalTranscript && (
            <Pressable
              onPress={() => setShowTranscript(!showTranscript)}
              style={[
                styles.transcriptToggle,
                { backgroundColor: colors.backgroundSecondary, borderRadius: radius.md },
              ]}
            >
              <Mic size={16} color={colors.textTertiary} />
              <Text
                style={[
                  typography.footnote,
                  { color: colors.textSecondary, marginLeft: spacing.xs, flex: 1 },
                ]}
              >
                Original voice recording
              </Text>
              {showTranscript ? (
                <ChevronUp size={18} color={colors.textTertiary} />
              ) : (
                <ChevronDown size={18} color={colors.textTertiary} />
              )}
            </Pressable>
          )}

          {showTranscript && pendingInvoice.originalTranscript && (
            <View
              style={[
                styles.transcriptBox,
                { backgroundColor: colors.backgroundTertiary, borderRadius: radius.md },
              ]}
            >
              <Text
                style={[
                  typography.footnote,
                  { color: colors.textSecondary, fontStyle: "italic", lineHeight: 20 },
                ]}
              >
                "{pendingInvoice.originalTranscript}"
              </Text>
              <Text
                style={[
                  typography.caption2,
                  { color: colors.textTertiary, marginTop: spacing.sm },
                ]}
              >
                Detected: {pendingInvoice.detectedLanguage || "English"}
              </Text>
            </View>
          )}

          {/* Bill To */}
          <View style={styles.section}>
            <Text style={[typography.footnote, { color: colors.textTertiary }]}>
              Bill To
            </Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.editableInput,
                  typography.title2,
                  {
                    color: colors.text,
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius: radius.sm,
                  },
                ]}
                value={clientName}
                onChangeText={setClientName}
                placeholder="Client name"
                placeholderTextColor={colors.textTertiary}
              />
            ) : (
              <Text style={[typography.title2, { color: colors.text }]}>
                {clientName}
              </Text>
            )}
          </View>

          {/* Line Items */}
          <View
            style={[
              styles.itemsCard,
              { backgroundColor: colors.card, borderRadius: radius.lg },
            ]}
          >
            <Text
              style={[
                typography.footnote,
                { color: colors.textTertiary, fontWeight: "500", marginBottom: spacing.md },
              ]}
            >
              Items
            </Text>
            {items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.itemRow,
                  index < items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.itemContent}>
                  {isEditing ? (
                    <TextInput
                      style={[
                        typography.body,
                        { color: colors.text, fontWeight: "500", padding: 0 },
                      ]}
                      value={item.description}
                      onChangeText={(text) => updateItemDescription(index, text)}
                      multiline
                    />
                  ) : (
                    <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                      {item.description}
                    </Text>
                  )}

                  {/* Original transcript segment highlight */}
                  {item.originalTranscript && (
                    <Text
                      style={[
                        typography.caption2,
                        {
                          color: colors.textTertiary,
                          fontStyle: "italic",
                          marginTop: 2,
                          backgroundColor: colors.primary + "10",
                          paddingHorizontal: 4,
                          borderRadius: 2,
                        },
                      ]}
                    >
                      "{item.originalTranscript}"
                    </Text>
                  )}

                  <View style={styles.itemMeta}>
                    {isEditing ? (
                      <View style={styles.editableRow}>
                        <Text style={[typography.caption1, { color: colors.textTertiary }]}>
                          Qty:{" "}
                        </Text>
                        <TextInput
                          style={[
                            typography.caption1,
                            styles.smallInput,
                            {
                              color: colors.text,
                              backgroundColor: colors.backgroundSecondary,
                              borderRadius: 4,
                            },
                          ]}
                          value={String(item.quantity || 1)}
                          onChangeText={(text) =>
                            updateItemQuantity(index, parseInt(text) || 1)
                          }
                          keyboardType="numeric"
                        />
                        <Text
                          style={[
                            typography.caption1,
                            { color: colors.textTertiary, marginLeft: spacing.sm },
                          ]}
                        >
                          @ $
                        </Text>
                        <TextInput
                          style={[
                            typography.caption1,
                            styles.smallInput,
                            {
                              color: colors.text,
                              backgroundColor: colors.backgroundSecondary,
                              borderRadius: 4,
                            },
                          ]}
                          value={String((item.unitPrice || item.price * 100) / 100)}
                          onChangeText={(text) =>
                            updateItemPrice(index, parseFloat(text) * 100 || 0)
                          }
                          keyboardType="decimal-pad"
                        />
                      </View>
                    ) : (
                      <Text style={[typography.caption1, { color: colors.textTertiary }]}>
                        Qty: {item.quantity || 1}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>
                  {formatCurrency(
                    (item.unitPrice || item.price * 100) * (item.quantity || 1),
                    profile?.default_currency || "USD"
                  )}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View
            style={[
              styles.totalsCard,
              { backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg },
            ]}
          >
            <View style={styles.totalRow}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                {formatCurrency(subtotal, profile?.default_currency || "USD")}
              </Text>
            </View>
            {taxRate > 0 && (
              <View style={styles.totalRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  Tax ({taxRate}%)
                </Text>
                <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                  {formatCurrency(taxAmount, profile?.default_currency || "USD")}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.totalRow,
                styles.grandTotal,
                { borderTopColor: colors.border },
              ]}
            >
              <Text style={[typography.headline, { color: colors.text }]}>Total</Text>
              <Text style={[typography.title2, { color: colors.primary }]}>
                {formatCurrency(total, profile?.default_currency || "USD")}
              </Text>
            </View>
          </View>

          {/* Re-record Option */}
          <Pressable onPress={handleReRecord} style={styles.reRecordButton}>
            <AlertTriangle size={16} color={colors.textTertiary} />
            <Text
              style={[
                typography.footnote,
                { color: colors.textTertiary, marginLeft: spacing.xs },
              ]}
            >
              Looks wrong? Re-record
            </Text>
          </Pressable>

          {/* Deposit Selector */}
          <View style={{ marginTop: 16, marginBottom: 16 }}>
            <DepositSelector
              totalAmount={total}
              clientName={clientName}
              depositEnabled={depositEnabled}
              depositType={depositType}
              depositValue={depositValue}
              onDepositChange={handleDepositChange}
            />
          </View>

          {/* Collection Settings - iOS Settings Group Style */}
          <View style={{ marginTop: 32, marginBottom: 16 }}>
            {/* Section Header */}
            <Text style={[typography.caption1, {
              color: colors.textTertiary,
              marginBottom: 8,
              marginLeft: 16,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }]}>
              Collection Settings
            </Text>

            {/* Settings Card */}
            <View style={{
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              overflow: 'hidden',
            }}>
              {/* Toggle Row */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    backgroundColor: colors.primary,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sparkles size={18} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={[typography.body, { color: colors.text, fontWeight: '500' }]}>
                      Auto-Collect
                    </Text>
                    <Text style={[typography.caption2, { color: colors.textTertiary }]}>
                      Bad Cop Mode
                    </Text>
                  </View>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Description Row */}
              <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={[typography.footnote, { color: colors.textSecondary, lineHeight: 18 }]}>
                  We will send polite reminders on{' '}
                  <Text style={{ fontWeight: '600', color: colors.text }}>Day 3</Text>,{' '}
                  <Text style={{ fontWeight: '600', color: colors.text }}>Day 7</Text>, and{' '}
                  <Text style={{ fontWeight: '600', color: colors.text }}>Day 14</Text>{' '}
                  if unpaid.
                </Text>
              </View>
            </View>

            {/* Footer Note */}
            <Text style={[typography.caption2, {
              color: colors.textTertiary,
              marginTop: 8,
              marginLeft: 16,
              lineHeight: 16,
            }]}>
              You can disable this anytime from invoice settings.
            </Text>
          </View>
            </Fragment>
          )}
        </ScrollView>

        {/* Bottom Action */}
        <View style={[styles.bottomAction, { borderTopColor: colors.border }]}>
          <Button
            title={isSaving ? "Creating..." : "Create Invoice"}
            onPress={handleConfirm}
            disabled={isSaving || !clientName.trim() || items.length === 0}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Success Overlay */}
      <SuccessOverlay
        type="sent"
        visible={showSuccess}
        onDismiss={handleSuccessDismiss}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  confidenceBanner: {
    padding: 12,
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  transcriptToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
  },
  transcriptBox: {
    padding: 12,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  editableInput: {
    padding: 8,
    marginTop: 4,
  },
  itemsCard: {
    padding: 16,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemMeta: {
    marginTop: 4,
  },
  editableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallInput: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
    textAlign: "center",
  },
  totalsCard: {
    padding: 16,
    marginBottom: 24,
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
  reRecordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  bottomAction: {
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  viewToggle: {
    flexDirection: "row",
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  customerViewContainer: {
    paddingTop: 8,
    paddingBottom: 40,
  },
});
