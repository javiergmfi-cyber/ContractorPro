import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { FileText, ChevronRight } from "lucide-react-native";
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

  const handleInvoicePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/invoice/${id}`);
  };

  const handleFilterPress = (filter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  };

  const styles = createStyles(colors, isDark);

  const filters: FilterType[] = ["all", "draft", "sent", "paid", "overdue"];

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid": return colors.success;
      case "sent": return "#007AFF";
      case "overdue": return colors.alert;
      default: return colors.textTertiary;
    }
  };

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <Pressable
      onPress={() => handleInvoicePress(item.id)}
      style={({ pressed }) => [
        styles.invoiceCard,
        pressed && styles.invoiceCardPressed,
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />

      <View style={styles.invoiceInfo}>
        <Text style={styles.clientName} numberOfLines={1}>{item.clientName}</Text>
        <Text style={styles.invoiceMeta}>
          {item.invoiceNumber} · {formatDate(item.createdAt)}
        </Text>
      </View>

      <Text style={styles.amount}>{formatCurrency(item.total)}</Text>
      <ChevronRight size={18} color={colors.textTertiary} />
    </Pressable>
  );

  if (invoices.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Invoices</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <FileText size={32} color={colors.textTertiary} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No invoices yet</Text>
          <Text style={styles.emptySubtitle}>
            Use voice commands on the Dashboard to create your first invoice
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
      </View>

      {/* Simple filter pills */}
      <View style={styles.filtersRow}>
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
      </View>

      <FlatList
        data={sortedInvoices}
        keyExtractor={(item) => item.id}
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
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.largeTitle,
      color: colors.text,
    },
    // Filters
    filtersRow: {
      flexDirection: "row",
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
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
    // List
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 120,
    },
    invoiceCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
    },
    invoiceCardPressed: {
      opacity: 0.7,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: spacing.md,
    },
    invoiceInfo: {
      flex: 1,
    },
    clientName: {
      ...typography.body,
      color: colors.text,
      fontWeight: "500",
      marginBottom: 2,
    },
    invoiceMeta: {
      ...typography.caption1,
      color: colors.textTertiary,
    },
    amount: {
      ...typography.body,
      color: colors.text,
      fontWeight: "600",
      marginRight: spacing.sm,
    },
    // Empty state
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
    },
    emptyIcon: {
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
    },
    // No results
    noResults: {
      alignItems: "center",
      paddingVertical: spacing.xl,
    },
    noResultsText: {
      ...typography.footnote,
      color: colors.textTertiary,
    },
  });
