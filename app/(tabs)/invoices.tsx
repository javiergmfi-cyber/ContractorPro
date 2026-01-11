import { View, Text, FlatList, StyleSheet, Animated, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRef, useEffect, useState, useCallback } from "react";
import { FileText, ChevronRight, Clock } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useInvoiceStore } from "../../store/useInvoiceStore";
import { useTheme, typography, spacing, radius } from "../../lib/theme";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Invoice } from "../../types";

type FilterType = "all" | "draft" | "sent" | "paid" | "overdue";

export default function Invoices() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { invoices } = useInvoiceStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter === "all") return true;
    return inv.status === activeFilter;
  });

  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Stats - matching Dashboard
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total, 0);
  const paidCount = invoices.filter((inv) => inv.status === "paid").length;

  const handleInvoicePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/invoice/${id}`);
  };

  const handleFilterPress = (filter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  };

  const styles = createStyles(colors, isDark);

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid": return colors.success;
      case "sent": return "#007AFF";
      case "overdue": return colors.alert;
      default: return colors.textTertiary;
    }
  };

  const filters: FilterType[] = ["all", "draft", "sent", "paid", "overdue"];

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <Pressable
      onPress={() => handleInvoicePress(item.id)}
      style={({ pressed }) => [
        styles.invoiceCard,
        pressed && styles.invoiceCardPressed,
      ]}
    >
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      <View style={styles.invoiceContent}>
        <View style={styles.invoiceTop}>
          <Text style={styles.clientName} numberOfLines={1}>{item.clientName}</Text>
          <Text style={styles.amount}>{formatCurrency(item.total)}</Text>
        </View>
        <View style={styles.invoiceBottom}>
          <Text style={styles.invoiceMeta}>{item.invoiceNumber}</Text>
          <Text style={styles.invoiceDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
      <ChevronRight size={18} color={colors.textTertiary} />
    </Pressable>
  );

  const ListHeader = () => (
    <>
      {/* Main Card - like Dashboard */}
      <Animated.View
        style={[
          styles.mainCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.mainCardHeader}>
          <View style={styles.iconContainer}>
            <FileText size={20} color={colors.primary} />
          </View>
          <Text style={styles.mainCardLabel}>Total Invoiced</Text>
        </View>
        <Text style={styles.mainCardAmount}>{formatCurrency(totalAmount)}</Text>
        <Text style={styles.mainCardSubtext}>
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} created
        </Text>
      </Animated.View>

      {/* Stats Row - like Dashboard */}
      <Animated.View
        style={[
          styles.statsRow,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.statCard, styles.statCardPending]}>
          <View style={styles.statIconContainer}>
            <Clock size={18} color={colors.alert} />
          </View>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statAmount, { color: colors.alert }]}>
            {formatCurrency(pendingAmount)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Paid</Text>
          <Text style={styles.statAmount}>{paidCount}</Text>
          <Text style={styles.statSubtext}>invoices</Text>
        </View>
      </Animated.View>

      {/* Simple Filter Pills */}
      <Animated.View
        style={[
          styles.filtersRow,
          { opacity: fadeAnim },
        ]}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          const count = filter === "all"
            ? invoices.length
            : invoices.filter(i => i.status === filter).length;

          if (filter !== "all" && count === 0) return null;

          return (
            <Pressable
              key={filter}
              onPress={() => handleFilterPress(filter)}
              style={[
                styles.filterPill,
                isActive && styles.filterPillActive,
              ]}
            >
              <Text style={[
                styles.filterText,
                isActive && styles.filterTextActive,
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </>
  );

  if (invoices.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Invoices</Text>
        </Animated.View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <FileText size={32} color={colors.textTertiary} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No invoices yet</Text>
          <Text style={styles.emptySubtitle}>
            Use voice commands on the Dashboard{"\n"}to create your first invoice
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Invoices</Text>
      </Animated.View>

      <FlatList
        data={sortedInvoices}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderInvoiceItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No {activeFilter} invoices</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      marginBottom: spacing.md,
    },
    title: {
      ...typography.largeTitle,
      color: colors.text,
    },
    // Main Card - matching Dashboard
    mainCard: {
      backgroundColor: colors.card,
      borderRadius: radius.xl,
      padding: spacing.lg,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
    mainCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(0, 214, 50, 0.15)" : "rgba(0, 214, 50, 0.1)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    mainCardLabel: {
      ...typography.subhead,
      color: colors.textTertiary,
    },
    mainCardAmount: {
      ...typography.amount,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    mainCardSubtext: {
      ...typography.footnote,
      color: colors.textTertiary,
    },
    // Stats Row - matching Dashboard
    statsRow: {
      flexDirection: "row",
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      padding: spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    statCardPending: {
      borderLeftWidth: 3,
      borderLeftColor: colors.alert,
    },
    statIconContainer: {
      marginBottom: spacing.sm,
    },
    statLabel: {
      ...typography.caption1,
      color: colors.textTertiary,
      marginBottom: spacing.xs,
    },
    statAmount: {
      ...typography.amountSmall,
      color: colors.text,
    },
    statSubtext: {
      ...typography.caption2,
      color: colors.textTertiary,
      marginTop: spacing.xs,
    },
    // Simple Filters
    filtersRow: {
      flexDirection: "row",
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    filterPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.backgroundSecondary,
    },
    filterPillActive: {
      backgroundColor: colors.text,
    },
    filterText: {
      ...typography.footnote,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    filterTextActive: {
      color: colors.background,
    },
    // Invoice Cards
    listContent: {
      paddingBottom: 120,
    },
    invoiceCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      borderRadius: radius.lg,
      padding: spacing.md,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    invoiceCardPressed: {
      opacity: 0.7,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: spacing.md,
    },
    invoiceContent: {
      flex: 1,
    },
    invoiceTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    clientName: {
      ...typography.body,
      color: colors.text,
      fontWeight: "500",
      flex: 1,
      marginRight: spacing.sm,
    },
    amount: {
      ...typography.body,
      color: colors.text,
      fontWeight: "600",
    },
    invoiceBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    invoiceMeta: {
      ...typography.caption1,
      color: colors.textTertiary,
    },
    invoiceDate: {
      ...typography.caption1,
      color: colors.textTertiary,
    },
    // Empty State
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
    },
    emptyIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    emptyTitle: {
      ...typography.headline,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    emptySubtitle: {
      ...typography.footnote,
      color: colors.textTertiary,
      textAlign: "center",
      lineHeight: 20,
    },
    // No Results
    noResults: {
      alignItems: "center",
      paddingVertical: spacing.xl,
    },
    noResultsText: {
      ...typography.footnote,
      color: colors.textTertiary,
    },
  });
