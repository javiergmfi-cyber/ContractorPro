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
  Switch,
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
  Crown,
  Star,
  Sparkles,
  FilePlus,
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
import { ReviewPrompt } from "@/components/ReviewPrompt";
import { ChangeOrderModal } from "@/components/ChangeOrderModal";

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
  const { invoices, fetchInvoice, updateInvoice, addChangeOrder, lastReviewPromptedInvoiceId, setLastReviewPromptedInvoiceId } = useInvoiceStore();
  const { profile } = useProfileStore();
  const { isPro, canUseBadCopAutopilot, getRemainingInvoiceSends, setSendsThisMonth } = useSubscriptionStore();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [autoChaseEnabled, setAutoChaseEnabled] = useState(false);
  const [autoNudgeEnabled, setAutoNudgeEnabled] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [showChangeOrder, setShowChangeOrder] = useState(false);

  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const hasTriggeredHaptic = useRef(false);

  // PAID stamp animation
  const paidStampAnim = useRef(new Animated.Value(0)).current;
  const hasFiredPaidStamp = useRef(false);

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
    // Load send count for free tier limit tracking
    loadSendCount();
  }, [id]);

  const loadSendCount = async () => {
    try {
      const count = await db.getSendsThisMonth();
      setSendsThisMonth(count);
    } catch (error) {
      console.error("Error loading send count:", error);
    }
  };

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
        setAutoChaseEnabled(inv.auto_chase_enabled || false);
        setAutoNudgeEnabled(inv.auto_nudge_enabled || false);
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

  // PAID stamp: trigger spring animation when status is paid
  useEffect(() => {
    if (invoice?.status === "paid" && !hasFiredPaidStamp.current) {
      hasFiredPaidStamp.current = true;
      Animated.spring(paidStampAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
      // Haptic slam after animation settles
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 450);
    }
  }, [invoice?.status]);

  // Auto-trigger review prompt when invoice becomes paid
  useEffect(() => {
    if (
      invoice?.status === "paid" &&
      invoice.id &&
      lastReviewPromptedInvoiceId !== invoice.id
    ) {
      const timer = setTimeout(() => {
        setShowReviewPrompt(true);
        setLastReviewPromptedInvoiceId(invoice.id);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [invoice?.status, invoice?.id]);

  // Status-specific background color for the elastic header area
  const getStatusBackground = () => {
    if (!invoice) return colors.background;
    switch (invoice.status) {
      case "overdue":
        return colors.statusOverdue + "08";
      case "deposit_paid":
        return colors.systemOrange + "08";
      case "paid":
        return colors.statusPaid + "06";
      default:
        return colors.background;
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
    // Determine message type based on invoice status
    // "balance" = collecting remaining after deposit (uses same link, different message)
    // "initial" = first time sending (counts against send limit)
    const isBalanceCollection = invoice.status === "deposit_paid";

    // Send limit check is handled at creation time in preview.tsx
    // This function now only handles resend/balance collection

    const actionTitle = isBalanceCollection
      ? "How would you like to collect the balance?"
      : "How would you like to send this invoice?";

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Send via SMS", "Send via WhatsApp", "Send via Email", "Share..."],
          cancelButtonIndex: 0,
          title: actionTitle,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) return;

          const shareMethod = ["", "sms", "whatsapp", "email", "native"][buttonIndex] as any;
          await performSendInvoice(shareMethod, isBalanceCollection ? "balance" : "initial");
        }
      );
    } else {
      // Android - show custom modal or direct share
      Alert.alert(
        isBalanceCollection ? "Collect Balance" : "Send Invoice",
        actionTitle,
        [
          { text: "Cancel", style: "cancel" },
          { text: "SMS", onPress: () => performSendInvoice("sms", isBalanceCollection ? "balance" : "initial") },
          { text: "WhatsApp", onPress: () => performSendInvoice("whatsapp", isBalanceCollection ? "balance" : "initial") },
          { text: "Email", onPress: () => performSendInvoice("email", isBalanceCollection ? "balance" : "initial") },
          { text: "Share...", onPress: () => performSendInvoice("native", isBalanceCollection ? "balance" : "initial") },
        ]
      );
    }
  };

  const performSendInvoice = async (
    shareMethod: "sms" | "whatsapp" | "email" | "native",
    messageType: "initial" | "balance" | "reminder" = "initial"
  ) => {
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // IMPORTANT: sendInvoice uses the SAME link for all states
      // The customer payment page shows the appropriate button
      const result = await sendInvoice(invoice, {
        includePaymentLink: true,
        shareMethod,
        messageType,
      });

      if (result.success) {
        // Invoices arrive as "sent" — no draft→sent transition needed
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

  // TODO: After change order updates total, invalidate existing Stripe payment session
  // Currently OK because the payment page reads live invoice total from DB
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

  const handleAutoChaseToggle = async (value: boolean) => {
    if (!isPro) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push("/paywall?trigger=auto_chase");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAutoChaseEnabled(value);
    await updateInvoice(invoice.id, { auto_chase_enabled: value });
    setInvoice({ ...invoice, auto_chase_enabled: value });
  };

  const handleAutoNudgeToggle = async (value: boolean) => {
    if (!isPro) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push("/paywall?trigger=auto_nudge");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAutoNudgeEnabled(value);
    await updateInvoice(invoice.id, { auto_nudge_enabled: value });
    setInvoice({ ...invoice, auto_nudge_enabled: value });
  };

  const handleChangeOrderSubmit = async (description: string, amount: number) => {
    setShowChangeOrder(false);

    try {
      await addChangeOrder(invoice.id, description, amount);

      // Reload invoice to get updated totals
      const updatedInvoice = await db.getInvoice(invoice.id);
      if (updatedInvoice) {
        setInvoice(updatedInvoice);
        // Reload items
        const items = await db.getInvoiceItems(invoice.id);
        setInvoiceItems(items || []);
      }

      // Auto-resend to notify client of updated invoice
      await performSendInvoice("native", "initial");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const newTotal = updatedInvoice?.total || invoice.total + amount;
      // For deposit invoices, show balance info
      const amountPaid = updatedInvoice?.amount_paid || invoice.amount_paid || 0;
      const balance = newTotal - amountPaid;

      Alert.alert(
        "Change Order Added",
        amountPaid > 0
          ? `Invoice updated to ${formatCurrency(newTotal, invoice.currency)}. Balance due: ${formatCurrency(balance, invoice.currency)}.`
          : `Invoice updated to ${formatCurrency(newTotal, invoice.currency)}. Client has been notified.`
      );
    } catch (error) {
      console.error("Error adding change order:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to add change order. Please try again.");
    }
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
              backgroundColor: getStatusBackground(),
              borderRadius: radius.lg,
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

          {/* PAID Stamp - Animated slam effect */}
          {invoice.status === "paid" && (
            <Animated.Text
              style={[
                styles.paidStamp,
                {
                  color: colors.statusPaid,
                  opacity: paidStampAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.8],
                  }),
                  transform: [
                    {
                      scale: paidStampAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, 1],
                      }),
                    },
                    { rotate: "-15deg" },
                  ],
                },
              ]}
            >
              PAID
            </Animated.Text>
          )}

          {/* Change order awaiting approval indicator */}
          {invoice.change_order_pending && (
            <View
              style={[
                styles.approvedIndicator,
                { backgroundColor: colors.systemOrange + "15", marginTop: spacing.xs },
              ]}
            >
              <Clock size={12} color={colors.systemOrange} />
              <Text
                style={[
                  typography.caption1,
                  { color: colors.systemOrange, fontWeight: "600", marginLeft: 4 },
                ]}
              >
                Change order sent — awaiting approval
              </Text>
            </View>
          )}

          {/* Approved but deposit not paid indicator */}
          {invoice.approved_at && !invoice.deposit_paid_at && invoice.deposit_enabled && (
            <View
              style={[
                styles.approvedIndicator,
                { backgroundColor: colors.systemOrange + "15", marginTop: spacing.xs },
              ]}
            >
              <CheckCircle size={12} color={colors.systemOrange} />
              <Text
                style={[
                  typography.caption1,
                  { color: colors.systemOrange, fontWeight: "600", marginLeft: 4 },
                ]}
              >
                Approved • Deposit not paid yet
              </Text>
            </View>
          )}
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

        {/* Auto-Chase Toggle (for sent/overdue invoices after deposit paid or no deposit) */}
        {(invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "deposit_paid") &&
          !(invoice.status === "sent" && invoice.deposit_enabled && !invoice.deposit_paid_at) && (
          <Pressable
            onPress={() => handleAutoChaseToggle(!autoChaseEnabled)}
            style={[
              styles.autoChaseCard,
              {
                backgroundColor: autoChaseEnabled ? colors.primary + "10" : colors.backgroundSecondary,
                borderRadius: radius.md,
              },
            ]}
          >
            <View style={styles.autoChaseContent}>
              <View style={styles.autoChaseHeader}>
                <Zap size={18} color={autoChaseEnabled ? colors.primary : colors.textSecondary} />
                <Text style={[typography.footnote, { color: colors.text, fontWeight: "600", marginLeft: spacing.xs }]}>
                  Auto-Chase
                </Text>
                {!isPro && (
                  <View style={[styles.proBadge, { backgroundColor: colors.systemOrange + "20" }]}>
                    <Crown size={12} color={colors.systemOrange} />
                    <Text style={[typography.caption2, { color: colors.systemOrange, fontWeight: "600", marginLeft: 2 }]}>
                      PRO
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
                {autoChaseEnabled
                  ? "Sends reminders automatically. Stops once paid."
                  : "We'll send polite reminders until they pay."}
              </Text>
            </View>
            <Switch
              value={autoChaseEnabled}
              onValueChange={handleAutoChaseToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </Pressable>
        )}

        {/* Auto-Nudge Toggle (for estimates awaiting deposit approval) */}
        {invoice.status === "sent" && invoice.deposit_enabled && !invoice.deposit_paid_at && (
          <Pressable
            onPress={() => handleAutoNudgeToggle(!autoNudgeEnabled)}
            style={[
              styles.autoChaseCard,
              {
                backgroundColor: autoNudgeEnabled ? colors.systemBlue + "10" : colors.backgroundSecondary,
                borderRadius: radius.md,
              },
            ]}
          >
            <View style={styles.autoChaseContent}>
              <View style={styles.autoChaseHeader}>
                <Sparkles size={18} color={autoNudgeEnabled ? colors.systemBlue : colors.textSecondary} />
                <Text style={[typography.footnote, { color: colors.text, fontWeight: "600", marginLeft: spacing.xs }]}>
                  Auto-Nudge
                </Text>
                {!isPro && (
                  <View style={[styles.proBadge, { backgroundColor: colors.systemOrange + "20" }]}>
                    <Crown size={12} color={colors.systemOrange} />
                    <Text style={[typography.caption2, { color: colors.systemOrange, fontWeight: "600", marginLeft: 2 }]}>
                      PRO
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
                {autoNudgeEnabled
                  ? "Sending friendly follow-ups until they approve."
                  : "Gently remind clients about your estimate."}
              </Text>
            </View>
            <Switch
              value={autoNudgeEnabled}
              onValueChange={handleAutoNudgeToggle}
              trackColor={{ false: colors.border, true: colors.systemBlue }}
              thumbColor="#fff"
            />
          </Pressable>
        )}

        {/* Pro Upsell Banner - Show when invoice is unpaid for 5+ days and user is not Pro */}
        {!isPro &&
          invoice.status !== "paid" &&
          invoice.status !== "void" &&
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
        {/* Approved but deposit not paid - special CTA (PRO) */}
        {invoice.status === "sent" && invoice.approved_at && invoice.deposit_enabled && !invoice.deposit_paid_at && (
          <View style={styles.actionRow}>
            <View style={[styles.approvedInfoBanner, { backgroundColor: colors.systemOrange + "15" }]}>
              <CheckCircle size={14} color={colors.systemOrange} />
              <Text style={[typography.caption1, { color: colors.systemOrange, marginLeft: 4 }]}>
                Approved
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Button
                title={`Request Deposit ${formatCurrency(invoice.deposit_amount || 0, invoice.currency)}`}
                onPress={handleSendInvoice}
                variant="primary"
              />
            </View>
          </View>
        )}

        {/* Regular sent state (not approved-waiting-for-deposit) */}
        {invoice.status === "sent" && !(invoice.approved_at && invoice.deposit_enabled && !invoice.deposit_paid_at) && (
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

        {invoice.status === "deposit_paid" && (
          <View style={styles.actionRow}>
            <View style={[styles.depositInfoBanner, { backgroundColor: colors.systemOrange + "15" }]}>
              <Text style={[typography.caption1, { color: colors.systemOrange }]}>
                Deposit received: {formatCurrency(invoice.amount_paid || 0, invoice.currency)}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Button
                title={`Collect Balance ${formatCurrency(invoice.total - (invoice.amount_paid || 0), invoice.currency)}`}
                onPress={handleSendInvoice}
              />
            </View>
          </View>
        )}

        {invoice.status === "paid" && (
          <View style={styles.paidSection}>
            <View style={[styles.paidBanner, { backgroundColor: colors.statusPaid + "15" }]}>
              <CheckCircle size={20} color={colors.statusPaid} />
              <Text style={[typography.body, { color: colors.statusPaid, marginLeft: spacing.sm }]}>
                Paid on {invoice.paid_at ? formatDate(invoice.paid_at) : "N/A"}
              </Text>
            </View>
            {/* Reputation Loop: Request Review Button */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowReviewPrompt(true);
              }}
              style={({ pressed }) => [
                styles.requestReviewButton,
                {
                  backgroundColor: colors.systemOrange + "15",
                  borderColor: colors.systemOrange + "30",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Star size={18} color={colors.systemOrange} fill={colors.systemOrange} />
              <Text style={[typography.footnote, { color: colors.systemOrange, fontWeight: "600", marginLeft: 8 }]}>
                Request a Review
              </Text>
            </Pressable>
          </View>
        )}

        {invoice.status === "void" && (
          <View style={[styles.paidBanner, { backgroundColor: colors.textTertiary + "15" }]}>
            <Text style={[typography.body, { color: colors.textTertiary }]}>
              This invoice has been voided
            </Text>
          </View>
        )}

        {/* Change Order Button - visible for active invoices */}
        {(invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "deposit_paid") && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowChangeOrder(true);
            }}
            style={({ pressed }) => [
              styles.changeOrderButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <FilePlus size={18} color={colors.textSecondary} />
            <Text style={[typography.footnote, { color: colors.textSecondary, fontWeight: "600", marginLeft: 8 }]}>
              Add Change Order
            </Text>
          </Pressable>
        )}
      </View>

      {/* Reputation Loop: Review Prompt */}
      <ReviewPrompt
        visible={showReviewPrompt}
        onDismiss={() => setShowReviewPrompt(false)}
        contractorName={profile?.business_name || "your contractor"}
        invoiceId={invoice.id}
        clientEmail={invoice.client_email}
        googlePlaceId={profile?.google_place_id}
      />

      {/* Change Order Modal */}
      <ChangeOrderModal
        visible={showChangeOrder}
        onDismiss={() => setShowChangeOrder(false)}
        onSubmit={handleChangeOrderSubmit}
        currentTotal={invoice.total}
        currency={invoice.currency}
      />
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
    paddingVertical: 8,
  },
  paidStamp: {
    position: "absolute",
    top: 20,
    right: -10,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 4,
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
  approvedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
  paidSection: {
    gap: 12,
  },
  paidBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  requestReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  depositInfoBanner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  approvedInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  autoChaseCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 16,
  },
  autoChaseContent: {
    flex: 1,
    marginRight: 12,
  },
  autoChaseHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  changeOrderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
});
