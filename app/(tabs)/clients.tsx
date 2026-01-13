import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  Plus,
  Phone,
  Mail,
  X,
  UserPlus,
  Trophy,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useClientStore } from "@/store/useClientStore";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useTheme } from "@/lib/theme";
import { Client } from "@/types/database";
import { Button } from "@/components/ui/Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Clients Tab - Relationship Leaderboard
 * Gamified client list showing lifetime value
 */

export default function ClientsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, radius, isDark } = useTheme();
  const {
    clients,
    isLoading,
    isSaving,
    fetchClients,
    createClient,
  } = useClientStore();
  const { invoices, fetchInvoices } = useInvoiceStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animations
  const searchWidthAnim = useRef(new Animated.Value(1)).current;
  const fabGlowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchClients();
    fetchInvoices();
  }, []);

  // FAB breathing animation
  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlowAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabGlowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, []);

  // Calculate lifetime value for each client
  const clientsWithLTV = useMemo(() => {
    return clients.map((client) => {
      const clientInvoices = invoices.filter(
        (inv) =>
          inv.client_name.toLowerCase() === client.name.toLowerCase() &&
          inv.status === "paid"
      );
      const totalSpent = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
      return { ...client, totalSpent };
    });
  }, [clients, invoices]);

  // Sort by LTV (highest first)
  const sortedClients = useMemo(() => {
    return [...clientsWithLTV].sort((a, b) => b.totalSpent - a.totalSpent);
  }, [clientsWithLTV]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([fetchClients(), fetchInvoices()]);
    setRefreshing(false);
  }, [fetchClients, fetchInvoices]);

  const filteredClients = sortedClients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientPress = (client: Client) => {
    Haptics.selectionAsync();
    // TODO: Navigate to client detail
  };

  const handleAddClient = async () => {
    if (!newClientName.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await createClient({
        name: newClientName.trim(),
        email: newClientEmail.trim() || null,
        phone: newClientPhone.trim() || null,
      });
      setShowAddModal(false);
      setNewClientName("");
      setNewClientEmail("");
      setNewClientPhone("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    Animated.spring(searchWidthAnim, {
      toValue: 1.02,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    Animated.spring(searchWidthAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  };

  // Pastel color palette for avatars
  const getPastelColor = (name: string) => {
    const pastelColors = [
      "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9",
      "#BAE1FF", "#E8BAFF", "#FFB3E6", "#C9BAFF",
      "#BAFFEA", "#FFD9BA", "#D4BAFF", "#BAFFCE",
    ];
    const index = name.charCodeAt(0) % pastelColors.length;
    return pastelColors[index];
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const renderClientCard = ({ item, index }: { item: typeof clientsWithLTV[0]; index: number }) => {
    const isTopClient = index === 0 && item.totalSpent > 0;

    return (
      <Pressable
        onPress={() => handleClientPress(item)}
        style={({ pressed }) => [
          styles.clientCard,
          {
            backgroundColor: colors.card,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 12,
          },
        ]}
      >
        {/* Trophy badge for top client */}
        {isTopClient && (
          <View style={[styles.topBadge, { backgroundColor: colors.systemOrange }]}>
            <Trophy size={10} color="#FFFFFF" />
          </View>
        )}

        {/* Monogram Avatar */}
        <View style={[styles.avatar, { backgroundColor: getPastelColor(item.name) }]}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <Text
            style={[styles.clientName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {(item.email || item.phone) && (
            <View style={styles.contactRow}>
              {item.phone && (
                <View style={styles.contactItem}>
                  <Phone size={11} color={colors.textTertiary} />
                  <Text style={[styles.contactText, { color: colors.textTertiary }]}>
                    {item.phone}
                  </Text>
                </View>
              )}
              {item.email && !item.phone && (
                <View style={styles.contactItem}>
                  <Mail size={11} color={colors.textTertiary} />
                  <Text
                    style={[styles.contactText, { color: colors.textTertiary }]}
                    numberOfLines={1}
                  >
                    {item.email}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Lifetime Value */}
        {item.totalSpent > 0 && (
          <Text style={[styles.ltvText, { color: colors.primary }]}>
            {formatCurrency(item.totalSpent)}
          </Text>
        )}
      </Pressable>
    );
  };

  // Empty State
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIllustration, { backgroundColor: colors.backgroundSecondary }]}>
        <UserPlus size={48} color={colors.textTertiary} strokeWidth={1.5} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Clients Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
        Add your first client to start tracking
      </Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowAddModal(true);
        }}
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
      >
        <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.emptyButtonText}>Add Client</Text>
      </Pressable>
    </View>
  );

  // Add Modal
  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <SafeAreaView style={styles.modalContent}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setShowAddModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.primary }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Client</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                NAME
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderRadius: radius.md,
                  },
                ]}
                placeholder="Client name"
                placeholderTextColor={colors.textTertiary}
                value={newClientName}
                onChangeText={setNewClientName}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                EMAIL
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderRadius: radius.md,
                  },
                ]}
                placeholder="client@email.com"
                placeholderTextColor={colors.textTertiary}
                value={newClientEmail}
                onChangeText={setNewClientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                PHONE
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderRadius: radius.md,
                  },
                ]}
                placeholder="(555) 123-4567"
                placeholderTextColor={colors.textTertiary}
                value={newClientPhone}
                onChangeText={setNewClientPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.modalButtonContainer}>
            <Button
              title={isSaving ? "Saving..." : "Add Client"}
              onPress={handleAddClient}
              disabled={!newClientName.trim() || isSaving}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.largeTitle, { color: colors.text }]}>Clients</Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
          {clients.length} total • Sorted by value
        </Text>
      </View>

      {/* iOS-style Search Bar */}
      <View style={styles.searchContainer}>
        <Animated.View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.backgroundSecondary,
              borderRadius: radius.lg,
              transform: [{ scale: searchWidthAnim }],
              borderWidth: isSearchFocused ? 1 : 0,
              borderColor: colors.primary + "50",
            },
          ]}
        >
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search clients..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setSearchQuery("");
              }}
              style={[styles.clearButton, { backgroundColor: colors.textTertiary + "30" }]}
            >
              <X size={14} color={colors.textTertiary} strokeWidth={2.5} />
            </Pressable>
          )}
        </Animated.View>
      </View>

      {/* Client List */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientCard}
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
            <View style={styles.noResults}>
              <Text style={[styles.noResultsText, { color: colors.textTertiary }]}>
                No clients found for "{searchQuery}"
              </Text>
            </View>
          ) : clients.length === 0 ? (
            <EmptyState />
          ) : null
        }
      />

      {/* Floating Action Button - Siri Orb Style */}
      <View style={styles.fabContainer}>
        {/* Glow layer */}
        <Animated.View
          style={[
            styles.fabGlow,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: fabGlowAnim }],
            },
          ]}
        />
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            setShowAddModal(true);
          }}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.primary },
            pressed && styles.fabPressed,
          ]}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>

      {renderAddModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: -0.2,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "400",
    padding: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },

  // Client Card
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 6,
    position: "relative",
  },
  topBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  clientInfo: {
    flex: 1,
    marginRight: 8,
  },
  clientName: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contactText: {
    fontSize: 13,
    fontWeight: "400",
  },
  ltvText: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"],
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  // No Results
  noResults: {
    alignItems: "center",
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 15,
    fontWeight: "500",
  },

  // FAB
  fabContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fabGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },

  // Modal
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
  form: {
    padding: 24,
    gap: 24,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalButtonContainer: {
    padding: 24,
    marginTop: "auto",
  },
});
