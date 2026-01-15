import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import {
  ArrowLeft,
  Share2,
  FileText,
  MessageSquare,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  ExternalLink,
  MoreHorizontal,
  Zap,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useTheme, getStatusColor } from "@/lib/theme";
import { Button } from "@/components/ui/Button";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { Invoice, formatCurrency, formatRelativeDate } from "@/types";
import { sendInvoice, generateInvoicePDF } from "@/services/invoice";
import { getPaymentLink } from "@/services/stripe";
import * as db from "@/services/database";

/**
 * Invoice Detail Screen - Elastic Parallax
 *
 * Features:
 * - Elastic pull-down with scaling avatar/badge
 * - Collapsing header with sticky nav title
 * - Haptic snaps on pull threshold
 * - Physical rubber sheet feel
 */

// Scroll thresholds
const PULL_THRESHOLD = -60; // Pull-down distance for haptic snap
const TITLE_FADE_START = 20;
const TITLE_FADE_END = 80;

export default function InvoiceDetail() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, spacing, radius, shadows, isDark } = useTheme();
  const { invoices, fetchInvoice, updateInvoice } = useInvoiceStore();
  const { profile } = useProfileStore();
  const { isPro, canUseBadCopAutopilot } = useSubscriptionStore();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const hasTriggeredHaptic = useRef(false);

  // Update navigation title based on scroll
  useEffect(() => {
    if (invoice) {
      const listenerId = scrollY.addListener(({ value }) => {
        // Show/hide navigation title based on scroll
        if (value > TITLE_FADE_END) {
          navigation.setOptions({
            headerShown: true,
            headerTransparent: true,
            headerTitle: invoice.client_name,
            headerTitleStyle: {
              ...typography.headline,
              color: colors.text,
            },
            headerBackground: () => (
              <Animated.View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  opacity: 0.95,
                }}
              />
            ),
          });
        } else {
          navigation.setOptions({
            headerShown: false,
          });
        }
      });

      return () => {
        scrollY.removeListener(listenerId);
      };
    }
  }, [invoice, colors, typography]);

  // Handle scroll for haptic snap
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;

      // Haptic snap when pulling down past threshold
      if (y < PULL_THRESHOLD && !hasTriggeredHaptic.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        hasTriggeredHaptic.current = true;
      } else if (y > PULL_THRESHOLD) {
        hasTriggeredHaptic.current = false;
      }
    },
    []
  );

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    setIsLoading(true);
    try {
      // Try to get from store first
      let inv = invoices.find((i) => i.id === id);

      if (!inv && id) {
        // Fetch from database
        inv = await db.getInvoice(id);
      }

      if (inv) {
        setInvoice(inv);
        // Fetch invoice items
        const items = await db.getInvoiceItems(inv.id);
        setInvoiceItems(items || []);
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Invoice not found
          </Text>
          <Button title="Go Back" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColor(invoice.status, colors);

  // Elastic scaling for pull-down (y < 0)
  const elasticScale = scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [1.4, 1],
    extrapolate: "clamp",
  });

  // Large title fade out on scroll-up
  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [TITLE_FADE_START, TITLE_FADE_END],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Header translation for parallax effect
  const headerTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [50, 0, -30],
    extrapolate: "clamp",
  });

  const handleSendInvoice = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Send via SMS", "Send via WhatsApp", "Send via Email", "Share..."],
          cancelButtonIndex: 0,
          title: "How would you like to send this invoice?",
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) return;

          const shareMethod = ["", "sms", "whatsapp", "email", "native"][buttonIndex] as any;
          await performSendInvoice(shareMethod);
        }
      );
    } else {
      // Android - show custom modal or direct share
      Alert.alert(
        "Send Invoice",
        "How would you like to send this invoice?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "SMS", onPress: () => performSendInvoice("sms") },
          { text: "WhatsApp", onPress: () => performSendInvoice("whatsapp") },
          { text: "Email", onPress: () => performSendInvoice("email") },
          { text: "Share...", onPress: () => performSendInvoice("native") },
        ]
      );
    }
  };

  const performSendInvoice = async (shareMethod: "sms" | "whatsapp" | "email" | "native") => {
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await sendInvoice(invoice, {
        includePaymentLink: true,
        shareMethod,
      });

      if (result.success) {
        // Update invoice status to 'sent' if it was draft
        if (invoice.status === "draft") {
          await updateInvoice(invoice.id, { status: "sent" });
          setInvoice({ ...invoice, status: "sent" });
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Error", result.error || "Failed to send invoice");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error: any) {
      console.error("Error sending invoice:", error);
      Alert.alert("Error", error.message || "Failed to send invoice");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsPaid = () => {
    Alert.alert(
      "Mark as Paid",
      "Are you sure you want to mark this invoice as paid?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Paid",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await updateInvoice(invoice.id, {
              status: "paid",
              paid_at: new Date().toISOString(),
            });
            setInvoice({ ...invoice, status: "paid", paid_at: new Date().toISOString() });
          },
        },
      ]
    );
  };

  const handleViewPDF = async () => {
    setIsGeneratingPDF(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await generateInvoicePDF(invoice.id);
      if (result?.pdfUrl) {
        await Linking.openURL(result.pdfUrl);
      } else {
        Alert.alert("Error", "Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleViewPaymentLink = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (invoice.stripe_hosted_invoice_url) {
        await Linking.openURL(invoice.stripe_hosted_invoice_url);
      } else {
        const result = await getPaymentLink(invoice.id);
        if (result?.url) {
          await Linking.openURL(result.url);
        }
      }
    } catch (error) {
      console.error("Error opening payment link:", error);
      Alert.alert("Error", "Failed to open payment link");
    }
  };

  const handleMoreOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "View PDF", "Copy Payment Link", "Void Invoice"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        async (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              await handleViewPDF();
              break;
            case 2:
              // Copy payment link
              break;
            case 3:
              handleVoidInvoice();
              break;
          }
        }
      );
    }
  };

  const handleVoidInvoice = () => {
    Alert.alert(
      "Void Invoice",
      "Are you sure you want to void this invoice? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Void Invoice",
          style: "destructive",
          onPress: async () => {
            await updateInvoice(invoice.id, { status: "void" });
            setInvoice({ ...invoice, status: "void" });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = () => {
    switch (invoice.status) {
      case "paid":
        return <CheckCircle size={20} color={statusColors.text} />;
      case "overdue":
        return <AlertCircle size={20} color={statusColors.text} />;
      default:
        return <Clock size={20} color={statusColors.text} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Animated.Text
          style={[
            typography.headline,
            {
              color: colors.text,
              opacity: scrollY.interpolate({
                inputRange: [TITLE_FADE_START, TITLE_FADE_END + 20],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
            },
          ]}
        >
          {invoice.invoice_number}
        </Animated.Text>
        <Pressable onPress={handleMoreOptions} style={styles.headerButton}>
          <MoreHorizontal size={24} color={colors.text} />
        </Pressable>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: handleScroll,
          }
        )}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* ═══════════════════════════════════════════════════════════
            ELASTIC HEADER - Scales on pull-down
        ═══════════════════════════════════════════════════════════ */}
        <Animated.View
          style={[
            styles.elasticHeader,
            {
              transform: [
                { scale: elasticScale },
                { translateY: headerTranslateY },
              ],
            },
          ]}
        >
          {/* Client Avatar */}
          <Animated.View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Text style={[typography.title2, { color: colors.primary }]}>
              {invoice.client_name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </Animated.View>

          {/* Client Name - Fades on scroll */}
          <Animated.Text
            style={[
              typography.title1,
              {
                color: colors.text,
                marginTop: spacing.md,
                opacity: largeTitleOpacity,
              },
            ]}
          >
            {invoice.client_name}
          </Animated.Text>

          {/* Status Badge */}
          <Animated.View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusColors.background,
                marginTop: spacing.sm,
              },
            ]}
          >
            {getStatusIcon()}
            <Text
              style={[
                typography.footnote,
                { color: statusColors.text, fontWeight: "600", marginLeft: 6 },
              ]}
            >
              {invoice.status.toUpperCase()}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Invoice Number (visible when large title fades) */}
        <Animated.Text
          style={[
            typography.caption1,
            {
              color: colors.textTertiary,
              textAlign: "center",
              marginTop: spacing.sm,
              opacity: largeTitleOpacity,
            },
          ]}
        >
          {invoice.invoice_number}
        </Animated.Text>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateItem}>
            <Text style={[typography.caption1, { color: colors.textTertiary }]}>
              Created
            </Text>
            <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
              {formatDate(invoice.created_at)}
            </Text>
          </View>
          {invoice.due_date && (
            <View style={[styles.dateItem, { alignItems: "flex-end" }]}>
              <Text style={[typography.caption1, { color: colors.textTertiary }]}>
                Due Date
              </Text>
              <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                {formatDate(invoice.due_date)}
              </Text>
            </View>
          )}
        </View>

        {/* Line Items */}
        <View
          style={[
            styles.itemsCard,
            { backgroundColor: colors.card, borderRadius: radius.lg, ...shadows.default },
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
          {invoiceItems.map((item, index) => (
            <View
              key={item.id || index}
              style={[
                styles.itemRow,
                index < invoiceItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.itemContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                  {item.description}
                </Text>
                <Text style={[typography.caption1, { color: colors.textTertiary }]}>
                  Qty: {item.quantity} × {formatCurrency(item.unit_price, invoice.currency)}
                </Text>
              </View>
              <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>
                {formatCurrency(item.total, invoice.currency)}
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
            <Text style={[typography.body, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
              {formatCurrency(invoice.subtotal, invoice.currency)}
            </Text>
          </View>
          {invoice.tax_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Tax ({profile?.tax_rate || 0}%)
              </Text>
              <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
                {formatCurrency(invoice.tax_amount, invoice.currency)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal, { borderTopColor: colors.border }]}>
            <Text style={[typography.headline, { color: colors.text }]}>Total</Text>
            <Text style={[typography.title2, { color: colors.primary }]}>
              {formatCurrency(invoice.total, invoice.currency)}
            </Text>
          </View>
        </View>

        {/* Payment Link Card (if available) */}
        {invoice.stripe_hosted_invoice_url && invoice.status !== "paid" && (
          <Pressable
            onPress={handleViewPaymentLink}
            style={[
              styles.paymentLinkCard,
              { backgroundColor: colors.primary + "10", borderRadius: radius.md },
            ]}
          >
            <CreditCard size={20} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[typography.footnote, { color: colors.primary, fontWeight: "600" }]}>
                Payment Link Ready
              </Text>
              <Text style={[typography.caption1, { color: colors.textSecondary }]}>
                Tap to view or share with client
              </Text>
            </View>
            <ExternalLink size={18} color={colors.primary} />
          </Pressable>
        )}

        {/* Pro Upsell Banner - Show when invoice is unpaid for 5+ days and user is not Pro */}
        {!isPro &&
          invoice.status !== "paid" &&
          invoice.status !== "void" &&
          invoice.status !== "draft" &&
          (() => {
            const daysSinceSent = Math.floor(
              (new Date().getTime() - new Date(invoice.created_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            return daysSinceSent >= 5;
          })() && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/paywall?trigger=unpaid_invoice");
            }}
            style={[
              styles.proUpsellBanner,
              { backgroundColor: colors.systemOrange + "15", borderRadius: radius.md },
            ]}
          >
            <View style={[styles.proUpsellIcon, { backgroundColor: colors.systemOrange + "20" }]}>
              <Zap size={18} color={colors.systemOrange} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[typography.footnote, { color: colors.text, fontWeight: "600" }]}>
                Tired of Checking?
              </Text>
              <Text style={[typography.caption1, { color: colors.textSecondary }]}>
                Let Bad Cop chase this invoice automatically
              </Text>
            </View>
            <ChevronRight size={18} color={colors.systemOrange} />
          </Pressable>
        )}

        {/* From (Business Info) */}
        {profile?.business_name && (
          <View style={[styles.fromSection, { borderTopColor: colors.border }]}>
            <Text style={[typography.caption1, { color: colors.textTertiary, marginBottom: 4 }]}>
              From
            </Text>
            <Text style={[typography.body, { color: colors.text, fontWeight: "500" }]}>
              {profile.business_name}
            </Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { borderTopColor: colors.border }]}>
        {invoice.status === "draft" && (
          <Button
            title={isSending ? "Sending..." : "Send Invoice"}
            onPress={handleSendInvoice}
            disabled={isSending}
          />
        )}

        {invoice.status === "sent" && (
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleSendInvoice}
              style={[styles.secondaryAction, { backgroundColor: colors.backgroundSecondary }]}
            >
              <Share2 size={20} color={colors.text} />
              <Text style={[typography.footnote, { color: colors.text, marginLeft: 6 }]}>
                Resend
              </Text>
            </Pressable>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Button title="Mark as Paid" onPress={handleMarkAsPaid} />
            </View>
          </View>
        )}

        {invoice.status === "overdue" && (
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleSendInvoice}
              style={[styles.secondaryAction, { backgroundColor: colors.statusOverdue + "20" }]}
            >
              <MessageSquare size={20} color={colors.statusOverdue} />
              <Text style={[typography.footnote, { color: colors.statusOverdue, marginLeft: 6 }]}>
                Remind
              </Text>
            </Pressable>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Button title="Mark as Paid" onPress={handleMarkAsPaid} />
            </View>
          </View>
        )}

        {invoice.status === "paid" && (
          <View style={[styles.paidBanner, { backgroundColor: colors.statusPaid + "15" }]}>
            <CheckCircle size={20} color={colors.statusPaid} />
            <Text style={[typography.body, { color: colors.statusPaid, marginLeft: spacing.sm }]}>
              Paid on {invoice.paid_at ? formatDate(invoice.paid_at) : "N/A"}
            </Text>
          </View>
        )}

        {invoice.status === "void" && (
          <View style={[styles.paidBanner, { backgroundColor: colors.textTertiary + "15" }]}>
            <Text style={[typography.body, { color: colors.textTertiary }]}>
              This invoice has been voided
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    borderBottomWidth: 0,
    zIndex: 10,
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
    paddingTop: 8,
    paddingBottom: 40,
  },
  elasticHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 24,
  },
  dateItem: {},
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
  totalsCard: {
    padding: 16,
    marginBottom: 16,
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
  paymentLinkCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
  },
  proUpsellBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
  },
  proUpsellIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fromSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    marginTop: 8,
  },
  bottomActions: {
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  paidBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
});
