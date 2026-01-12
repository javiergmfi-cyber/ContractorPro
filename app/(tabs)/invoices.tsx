import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useTheme } from "@/lib/theme";
import { Invoice, InvoiceStatus } from "@/types";
import { InvoiceCard } from "@/components/InvoiceCard";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/SkeletonCard";

type FilterType = "all" | InvoiceStatus;

export default function InvoicesScreen() {
  const router = useRouter();
  const { colors, typography, spacing, radius } = useTheme();
  const { invoices, isLoading, fetchInvoices, updateInvoice } = useInvoiceStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchInvoices();
    setRefreshing(false);
  }, [fetchInvoices]);

  // Filter by status
  const statusFilteredInvoices = invoices.filter((inv) => {
    if (activeFilter === "all") return true;
    return inv.status === activeFilter;
  });

  // Filter by search query
  const filteredInvoices = statusFilteredInvoices.filter((inv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      inv.client_name.toLowerCase().includes(query) ||
      inv.invoice_number.toLowerCase().includes(query)
    );
  });

  // Sort by date (newest first)
  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleInvoicePress = (invoice: Invoice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/invoice/${invoice.id}`);
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: "paid", paid_at: new Date().toISOString() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleRemind = (invoice: Invoice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Open native SMS/WhatsApp with pre-filled reminder
    Alert.alert(
      "Send Reminder",
      `Send a payment reminder to ${invoice.client_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            // TODO: Implement native share with reminder template
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleVoid = (invoice: Invoice) => {
    Alert.alert(
      "Void Invoice",
      `Are you sure you want to void invoice ${invoice.invoice_number}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Void Invoice",
          style: "destructive",
          onPress: async () => {
            try {
              await updateInvoice(invoice.id, { status: "void" });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error("Error voiding invoice:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const handleMore = (invoice: Invoice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/invoice/${invoice.id}`);
  };

  const handleFilterPress = (filter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  };

  const filters: FilterType[] = ["all", "draft", "sent", "paid", "overdue"];

  const getFilterCount = (filter: FilterType): number => {
    if (filter === "all") return invoices.length;
    return invoices.filter((i) => i.status === filter).length;
  };

  const ListHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.backgroundSecondary,
              borderRadius: radius.md,
            },
          ]}
        >
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, typography.body, { color: colors.text }]}
            placeholder="Search invoices..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          const count = getFilterCount(filter);

          // Hide empty status filters (except "all")
          if (filter !== "all" && count === 0) return null;

          return (
            <Pressable
              key={filter}
              onPress={() => handleFilterPress(filter)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? colors.text : colors.backgroundSecondary,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Text
                style={[
                  typography.footnote,
                  {
                    color: isActive ? colors.background : colors.textSecondary,
                    fontWeight: "500",
                  },
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {count > 0 && ` (${count})`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderInvoiceItem = ({ item }: { item: Invoice }) => (
    <InvoiceCard
      invoice={item}
      onPress={() => handleInvoicePress(item)}
      onMarkPaid={() => handleMarkPaid(item)}
      onRemind={() => handleRemind(item)}
      onVoid={() => handleVoid(item)}
      onMore={() => handleMore(item)}
    />
  );

  // Loading state
  if (isLoading && invoices.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[typography.largeTitle, { color: colors.text }]}>Invoices</Text>
        </View>
        <SkeletonCard count={5} />
      </SafeAreaView>
    );
  }

  // Empty state - no invoices at all
  if (invoices.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[typography.largeTitle, { color: colors.text }]}>Invoices</Text>
        </View>
        <EmptyState
          type="firstRun"
          onAction={() => router.push("/(tabs)")}
          actionLabel="Create First Invoice"
        />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.largeTitle, { color: colors.text }]}>Invoices</Text>
          <Text style={[typography.subhead, { color: colors.textTertiary, marginTop: 2 }]}>
            {invoices.length} total
          </Text>
        </View>

        <FlatList
          data={sortedInvoices}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoiceItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            searchQuery ? (
              <EmptyState
                type="noResults"
                searchQuery={searchQuery}
                onAction={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                actionLabel="Clear Search"
              />
            ) : activeFilter !== "all" ? (
              <EmptyState
                type="allCaughtUp"
              />
            ) : null
          }
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
    flexWrap: "wrap",
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  listContent: {
    paddingBottom: 120,
  },
});
