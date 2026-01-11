import { View, Text, FlatList, StyleSheet, Animated, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  FileText,
  Plus,
  ChevronRight,
  Filter,
  Clock,
  CheckCircle2,
  Send,
  AlertCircle,
  DollarSign,
  TrendingUp
} from "lucide-react-native";
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
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
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
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter === "all") return true;
    return inv.status === activeFilter;
  });

  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate stats
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices.filter(inv => inv.status === "sent" || inv.status === "overdue").reduce((sum, inv) => sum + inv.total, 0);

  const handleInvoicePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/invoice/${id}`);
  };

  const handleFilterPress = (filter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  };

  const styles = createStyles(colors, isDark);

  const filters: { key: FilterType; label: string; icon: any; count: number }[] = [
    { key: "all", label: "All", icon: FileText, count: invoices.length },
    { key: "draft", label: "Draft", icon: Clock, count: invoices.filter(i => i.status === "draft").length },
    { key: "sent", label: "Sent", icon: Send, count: invoices.filter(i => i.status === "sent").length },
    { key: "paid", label: "Paid", icon: CheckCircle2, count: invoices.filter(i => i.status === "paid").length },
    { key: "overdue", label: "Overdue", icon: AlertCircle, count: invoices.filter(i => i.status === "overdue").length },
  ];

  const renderInvoiceItem = ({ item, index }: { item: Invoice; index: number }) => {
    const statusConfig = {
      draft: {
        bg: isDark ? "rgba(142, 142, 147, 0.2)" : "rgba(142, 142, 147, 0.15)",
        text: colors.textTertiary,
        label: "Draft",
        icon: Clock,
        accent: colors.textTertiary
      },
      sent: {
        bg: isDark ? "rgba(0, 122, 255, 0.2)" : "rgba(0, 122, 255, 0.12)",
        text: "#007AFF",
        label: "Sent",
        icon: Send,
        accent: "#007AFF"
      },
      paid: {
        bg: isDark ? "rgba(52, 199, 89, 0.2)" : "rgba(52, 199, 89, 0.12)",
        text: colors.success,
        label: "Paid",
        icon: CheckCircle2,
        accent: colors.success
      },
      overdue: {
        bg: isDark ? "rgba(255, 149, 0, 0.2)" : "rgba(255, 149, 0, 0.12)",
        text: colors.alert,
        label: "Overdue",
        icon: AlertCircle,
        accent: colors.alert
      },
    };

    const status = statusConfig[item.status];
    const StatusIcon = status.icon;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Pressable
          onPress={() => handleInvoicePress(item.id)}
          style={({ pressed }) => [
            styles.invoiceCard,
            pressed && styles.invoiceCardPressed,
          ]}
        >
          {/* Left accent bar */}
          <View style={[styles.accentBar, { backgroundColor: status.accent }]} />

          <View style={styles.invoiceCardInner}>
            {/* Top row: Client name and amount */}
            <View style={styles.invoiceCardTop}>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName} numberOfLines={1}>{item.clientName}</Text>
                <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
              </View>
              <Text style={styles.amount}>{formatCurrency(item.total)}</Text>
            </View>

            {/* Bottom row: Status and date */}
            <View style={styles.invoiceCardBottom}>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <StatusIcon size={12} color={status.text} />
                <Text style={[styles.statusText, { color: status.text }]}>
                  {status.label}
                </Text>
              </View>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>

            {/* Items preview */}
            {item.items.length > 0 && (
              <Text style={styles.itemsPreview} numberOfLines={1}>
                {item.items.map(i => i.description).join(", ")}
              </Text>
            )}
          </View>

          <ChevronRight size={18} color={colors.textTertiary} />
        </Pressable>
      </Animated.View>
    );
  };

  const ListHeader = () => (
    <>
      {/* Stats Cards */}
      {invoices.length > 0 && (
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: isDark ? "rgba(0, 214, 50, 0.15)" : "rgba(0, 214, 50, 0.1)" }]}>
              <TrendingUp size={18} color={colors.primary} />
            </View>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{formatCurrency(totalAmount)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: isDark ? "rgba(52, 199, 89, 0.15)" : "rgba(52, 199, 89, 0.1)" }]}>
              <CheckCircle2 size={18} color={colors.success} />
            </View>
            <Text style={styles.statLabel}>Collected</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>{formatCurrency(paidAmount)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: isDark ? "rgba(255, 149, 0, 0.15)" : "rgba(255, 149, 0, 0.1)" }]}>
              <Clock size={18} color={colors.alert} />
            </View>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={[styles.statValue, { color: colors.alert }]}>{formatCurrency(pendingAmount)}</Text>
          </View>
        </Animated.View>
      )}

      {/* Filter Pills */}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[
          styles.filtersContainer,
          {
            opacity: fadeAnim,
          },
        ]}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          const FilterIcon = filter.icon;
          return (
            <Pressable
              key={filter.key}
              onPress={() => handleFilterPress(filter.key)}
              style={[
                styles.filterPill,
                isActive && styles.filterPillActive,
                isActive && { backgroundColor: colors.primary },
              ]}
            >
              <FilterIcon
                size={14}
                color={isActive ? "#FFFFFF" : colors.textTertiary}
              />
              <Text
                style={[
                  styles.filterPillText,
                  isActive && styles.filterPillTextActive,
                ]}
              >
                {filter.label}
              </Text>
              {filter.count > 0 && (
                <View style={[
                  styles.filterCount,
                  isActive && styles.filterCountActive,
                ]}>
                  <Text style={[
                    styles.filterCountText,
                    isActive && styles.filterCountTextActive,
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </Animated.ScrollView>

      {/* Section header */}
      {sortedInvoices.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeFilter === "all" ? "All Invoices" : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Invoices`}
          </Text>
          <Text style={styles.sectionCount}>{sortedInvoices.length}</Text>
        </View>
      )}
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
          <Animated.View
            style={[
              styles.emptyContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }],
              },
            ]}
          >
            <View style={styles.emptyIconOuter}>
              <View style={styles.emptyIconInner}>
                <FileText size={40} color={colors.primary} strokeWidth={1.5} />
              </View>
            </View>
            <Text style={styles.emptyTitle}>No invoices yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first invoice using{"\n"}voice commands on the Dashboard
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.emptyButton,
                pressed && styles.emptyButtonPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/(tabs)");
              }}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.emptyButtonText}>Create Invoice</Text>
            </Pressable>
          </Animated.View>
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
        <View>
          <Text style={styles.title}>Invoices</Text>
          <Text style={styles.subtitle}>
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} • {formatCurrency(totalAmount)} total
          </Text>
        </View>
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
            <Filter size={32} color={colors.textTertiary} />
            <Text style={styles.noResultsText}>No {activeFilter} invoices</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/(tabs)");
        }}
      >
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>
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
      paddingBottom: spacing.sm,
    },
    title: {
      ...typography.largeTitle,
      color: colors.text,
    },
    subtitle: {
      ...typography.subhead,
      color: colors.textTertiary,
      marginTop: spacing.xs,
    },
    // Stats
    statsContainer: {
      flexDirection: "row",
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
      marginBottom: spacing.md,
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
      elevation: 2,
    },
    statIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    statLabel: {
      ...typography.caption2,
      color: colors.textTertiary,
      marginBottom: 2,
    },
    statValue: {
      ...typography.headline,
      fontWeight: "700",
    },
    // Filters
    filtersContainer: {
      marginBottom: spacing.md,
    },
    filtersContent: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    filterPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.backgroundSecondary,
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterPillActive: {
      borderColor: "transparent",
    },
    filterPillText: {
      ...typography.footnote,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    filterPillTextActive: {
      color: "#FFFFFF",
    },
    filterCount: {
      backgroundColor: colors.backgroundTertiary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 20,
      alignItems: "center",
    },
    filterCountActive: {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    filterCountText: {
      ...typography.caption2,
      color: colors.textTertiary,
      fontWeight: "600",
    },
    filterCountTextActive: {
      color: "#FFFFFF",
    },
    // Section header
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      ...typography.footnote,
      color: colors.textTertiary,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    sectionCount: {
      ...typography.footnote,
      color: colors.textTertiary,
    },
    // List
    listContent: {
      paddingBottom: 120,
    },
    invoiceCard: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      borderRadius: radius.lg,
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    invoiceCardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    accentBar: {
      width: 4,
      alignSelf: "stretch",
    },
    invoiceCardInner: {
      flex: 1,
      padding: spacing.md,
    },
    invoiceCardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: spacing.sm,
    },
    clientInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    clientName: {
      ...typography.headline,
      color: colors.text,
      marginBottom: 2,
    },
    invoiceNumber: {
      ...typography.caption1,
      color: colors.textTertiary,
    },
    amount: {
      ...typography.title3,
      color: colors.text,
    },
    invoiceCardBottom: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.sm,
      gap: 4,
    },
    statusText: {
      ...typography.caption2,
      fontWeight: "600",
    },
    dateText: {
      ...typography.caption1,
      color: colors.textTertiary,
    },
    itemsPreview: {
      ...typography.caption1,
      color: colors.textTertiary,
      marginTop: spacing.sm,
      fontStyle: "italic",
    },
    // Empty state
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
    },
    emptyContent: {
      alignItems: "center",
    },
    emptyIconOuter: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? "rgba(0, 214, 50, 0.1)" : "rgba(0, 214, 50, 0.08)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    emptyIconInner: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? "rgba(0, 214, 50, 0.15)" : "rgba(0, 214, 50, 0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      ...typography.title2,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    emptySubtitle: {
      ...typography.body,
      color: colors.textTertiary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: spacing.xl,
    },
    emptyButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.full,
      gap: spacing.sm,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    emptyButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    emptyButtonText: {
      ...typography.headline,
      color: "#FFFFFF",
    },
    // No results
    noResults: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xxl,
      gap: spacing.md,
    },
    noResultsText: {
      ...typography.body,
      color: colors.textTertiary,
    },
    // FAB
    fab: {
      position: "absolute",
      bottom: 100,
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    fabPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.95 }],
    },
  });
