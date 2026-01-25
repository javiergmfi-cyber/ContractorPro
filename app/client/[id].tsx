import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
  ChevronLeft,
  Phone,
  MessageSquare,
  Mail,
  FileText,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle,
  Send,
  ChevronRight,
  Zap,
  Crown,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { useClientStore } from "@/store/useClientStore";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { Client, Invoice } from "@/types/database";
import { formatCurrency } from "@/lib/utils";

// Format phone number as (XXX) XXX-XXXX
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === "1") {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Get status color and icon
const getStatusInfo = (status: string, colors: any) => {
  switch (status) {
    case "paid":
      return { color: colors.systemGreen, icon: CheckCircle, label: "Paid" };
    case "sent":
      return { color: colors.systemBlue, icon: Send, label: "Sent" };
    case "viewed":
      return { color: colors.systemPurple, icon: Eye, label: "Viewed" };
    case "overdue":
      return { color: colors.systemRed, icon: AlertCircle, label: "Overdue" };
    case "draft":
      return { color: colors.textTertiary, icon: FileText, label: "Draft" };
    default:
      return { color: colors.textTertiary, icon: FileText, label: status };
  }
};

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, spacing, radius } = useTheme();
  const { clients, deleteClient } = useClientStore();
  const { invoices } = useInvoiceStore();
  const { isPro } = useSubscriptionStore();

  const [client, setClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const found = clients.find((c) => c.id === id);
    setClient(found || null);
  }, [id, clients]);

  // Get all invoices for this client
  const clientInvoices = invoices.filter((inv) => inv.client_id === id);

  // Calculate stats
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());

  const paidInvoices = clientInvoices.filter((inv) => inv.status === "paid");
  const unpaidInvoices = clientInvoices.filter(
    (inv) => inv.status === "sent" || inv.status === "overdue" || inv.status === "viewed"
  );
  const overdueInvoices = clientInvoices.filter((inv) => inv.status === "overdue");

  // Lifetime value (all paid)
  const lifetimeValue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Last 12 months value
  const last12MonthsValue = paidInvoices
    .filter((inv) => inv.paid_at && new Date(inv.paid_at) >= twelveMonthsAgo)
    .reduce((sum, inv) => sum + inv.total, 0);

  // Outstanding balance
  const outstandingBalance = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Average payment time (days from sent to paid)
  let avgPaymentDays = 0;
  const invoicesWithPaymentData = paidInvoices.filter((inv) => inv.sent_at && inv.paid_at);
  if (invoicesWithPaymentData.length > 0) {
    const totalDays = invoicesWithPaymentData.reduce((sum, inv) => {
      const sentDate = new Date(inv.sent_at!);
      const paidDate = new Date(inv.paid_at!);
      const daysDiff = Math.max(0, Math.floor((paidDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24)));
      return sum + daysDiff;
    }, 0);
    avgPaymentDays = Math.round(totalDays / invoicesWithPaymentData.length);
  }

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Client",
      `Are you sure you want to delete ${client?.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteClient(id!);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error) {
              console.error("Error deleting client:", error);
              Alert.alert("Error", "Failed to delete client");
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCall = () => {
    if (client?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleText = () => {
    if (client?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`sms:${client.phone}`);
    }
  };

  const handleEmail = () => {
    if (client?.email) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`mailto:${client.email}`);
    }
  };

  const handleInvoicePress = (invoice: Invoice) => {
    Haptics.selectionAsync();
    router.push(`/invoice/${invoice.id}`);
  };

  if (!client) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[typography.headline, { color: colors.text }]}>Client</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centered}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Client not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[typography.headline, { color: colors.text }]}>Client Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Client Name & Avatar */}
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {client.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={[typography.title2, { color: colors.text, marginTop: 12 }]}>
            {client.name}
          </Text>
        </View>

        {/* Customer Stats */}
        <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
          <Text style={[typography.footnote, { color: colors.textTertiary, marginBottom: 16 }]}>
            CUSTOMER VALUE
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.systemGreen + "15" }]}>
                <DollarSign size={18} color={colors.systemGreen} />
              </View>
              <Text style={[typography.caption1, { color: colors.textTertiary }]}>Lifetime</Text>
              <Text style={[typography.headline, { color: colors.text }]}>
                {formatCurrency(lifetimeValue)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: colors.systemBlue + "15" }]}>
                <TrendingUp size={18} color={colors.systemBlue} />
              </View>
              <Text style={[typography.caption1, { color: colors.textTertiary }]}>Last 12 Mo</Text>
              <Text style={[typography.headline, { color: colors.text }]}>
                {formatCurrency(last12MonthsValue)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: outstandingBalance > 0 ? colors.systemOrange + "15" : colors.textTertiary + "15" }]}>
                <Clock size={18} color={outstandingBalance > 0 ? colors.systemOrange : colors.textTertiary} />
              </View>
              <Text style={[typography.caption1, { color: colors.textTertiary }]}>Outstanding</Text>
              <Text style={[typography.headline, { color: outstandingBalance > 0 ? colors.systemOrange : colors.text }]}>
                {formatCurrency(outstandingBalance)}
              </Text>
            </View>
          </View>

          {/* Payment behavior */}
          {paidInvoices.length > 0 && (
            <View style={[styles.paymentBehavior, { backgroundColor: colors.background, borderRadius: radius.md }]}>
              <Text style={[typography.footnote, { color: colors.textTertiary }]}>
                Avg. Payment Time
              </Text>
              <Text style={[typography.headline, { color: avgPaymentDays <= 7 ? colors.systemGreen : avgPaymentDays <= 14 ? colors.systemOrange : colors.systemRed }]}>
                {avgPaymentDays === 0 ? "Same day" : `${avgPaymentDays} days`}
              </Text>
            </View>
          )}
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
          <Text style={[typography.footnote, { color: colors.textTertiary, marginBottom: 12 }]}>
            CONTACT INFO
          </Text>

          {client.phone && (
            <View style={styles.infoRow}>
              <Phone size={18} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.text, flex: 1, marginLeft: 12 }]}>
                {formatPhoneNumber(client.phone)}
              </Text>
            </View>
          )}

          {client.email && (
            <View style={styles.infoRow}>
              <Mail size={18} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.text, flex: 1, marginLeft: 12 }]} numberOfLines={1}>
                {client.email}
              </Text>
            </View>
          )}

          {!client.phone && !client.email && (
            <Text style={[typography.body, { color: colors.textTertiary }]}>
              No contact info added
            </Text>
          )}

          {/* Action Buttons */}
          {(client.phone || client.email) && (
            <View style={styles.contactActions}>
              {client.phone && (
                <Pressable
                  onPress={handleCall}
                  style={({ pressed }) => [
                    styles.contactButton,
                    { backgroundColor: colors.systemGreen + "15" },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Phone size={18} color={colors.systemGreen} />
                  <Text style={[typography.subhead, { color: colors.systemGreen, fontWeight: "600" }]}>
                    Call
                  </Text>
                </Pressable>
              )}

              {client.phone && (
                <Pressable
                  onPress={handleText}
                  style={({ pressed }) => [
                    styles.contactButton,
                    { backgroundColor: colors.systemPurple + "15" },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <MessageSquare size={18} color={colors.systemPurple} />
                  <Text style={[typography.subhead, { color: colors.systemPurple, fontWeight: "600" }]}>
                    Text
                  </Text>
                </Pressable>
              )}

              {client.email && (
                <Pressable
                  onPress={handleEmail}
                  style={({ pressed }) => [
                    styles.contactButton,
                    { backgroundColor: colors.systemBlue + "15" },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Mail size={18} color={colors.systemBlue} />
                  <Text style={[typography.subhead, { color: colors.systemBlue, fontWeight: "600" }]}>
                    Email
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* Unpaid Invoices with Auto-Chase Upsell */}
        {unpaidInvoices.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={[typography.footnote, { color: colors.textTertiary }]}>
                UNPAID INVOICES ({unpaidInvoices.length})
              </Text>
              {outstandingBalance > 0 && (
                <Text style={[typography.footnote, { color: colors.systemOrange, fontWeight: "600" }]}>
                  {formatCurrency(outstandingBalance)}
                </Text>
              )}
            </View>

            {unpaidInvoices.slice(0, 3).map((invoice) => {
              const statusInfo = getStatusInfo(invoice.status, colors);
              const StatusIcon = statusInfo.icon;
              return (
                <Pressable
                  key={invoice.id}
                  onPress={() => handleInvoicePress(invoice)}
                  style={({ pressed }) => [
                    styles.invoiceRow,
                    { backgroundColor: pressed ? colors.background : "transparent" },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: statusInfo.color + "20" }]}>
                    <StatusIcon size={14} color={statusInfo.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[typography.body, { color: colors.text }]}>
                      {invoice.invoice_number || "Invoice"}
                    </Text>
                    <Text style={[typography.caption1, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                  <Text style={[typography.headline, { color: colors.text }]}>
                    {formatCurrency(invoice.total)}
                  </Text>
                  <ChevronRight size={16} color={colors.textTertiary} style={{ marginLeft: 8 }} />
                </Pressable>
              );
            })}

            {unpaidInvoices.length > 3 && (
              <Pressable
                onPress={() => router.push("/(tabs)/invoices")}
                style={styles.viewAllRow}
              >
                <Text style={[typography.subhead, { color: colors.primary }]}>
                  View all {unpaidInvoices.length} unpaid invoices
                </Text>
              </Pressable>
            )}

            {/* Auto-Chase Upsell */}
            {!isPro && overdueInvoices.length > 0 && (
              <Pressable
                onPress={() => router.push("/paywall")}
                style={[styles.autoChaseUpsell, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}
              >
                <View style={[styles.upsellIcon, { backgroundColor: colors.primary + "20" }]}>
                  <Zap size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[typography.headline, { color: colors.text }]}>
                      Auto-Chase Reminders
                    </Text>
                    <View style={[styles.proBadge, { backgroundColor: colors.systemOrange }]}>
                      <Crown size={10} color="#FFF" />
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  </View>
                  <Text style={[typography.caption1, { color: colors.textSecondary, marginTop: 2 }]}>
                    Get paid 2x faster with automatic follow-ups
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.primary} />
              </Pressable>
            )}
          </View>
        )}

        {/* All Invoices Summary */}
        <View style={[styles.section, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
          <Text style={[typography.footnote, { color: colors.textTertiary, marginBottom: 12 }]}>
            INVOICE HISTORY
          </Text>

          <View style={styles.invoiceSummary}>
            <View style={styles.summaryItem}>
              <Text style={[typography.title3, { color: colors.text }]}>{clientInvoices.length}</Text>
              <Text style={[typography.caption1, { color: colors.textTertiary }]}>Total</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[typography.title3, { color: colors.systemGreen }]}>{paidInvoices.length}</Text>
              <Text style={[typography.caption1, { color: colors.textTertiary }]}>Paid</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[typography.title3, { color: colors.systemOrange }]}>{unpaidInvoices.length}</Text>
              <Text style={[typography.caption1, { color: colors.textTertiary }]}>Unpaid</Text>
            </View>
            {overdueInvoices.length > 0 && (
              <>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[typography.title3, { color: colors.systemRed }]}>{overdueInvoices.length}</Text>
                  <Text style={[typography.caption1, { color: colors.textTertiary }]}>Overdue</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Delete Button */}
        <View style={{ marginTop: 20, marginHorizontal: -4 }}>
          <TouchableOpacity
            onPress={handleDelete}
            disabled={isDeleting}
            activeOpacity={0.7}
            style={{
              backgroundColor: "#E5E5EA",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#FF3B30" }}>
              {isDeleting ? "Deleting..." : "Delete Client"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  paymentBehavior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  contactActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  invoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllRow: {
    paddingVertical: 12,
    alignItems: "center",
  },
  autoChaseUpsell: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  upsellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },
  invoiceSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryDivider: {
    width: 1,
    height: 32,
  },
});
