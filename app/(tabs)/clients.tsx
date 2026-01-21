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
  Zap,
  Clock,
  AlertTriangle,
  Users,
  Edit3,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Contacts from "expo-contacts";
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
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animations
  const searchWidthAnim = useRef(new Animated.Value(1)).current;
  const fabGlowAnim = useRef(new Animated.Value(1)).current;
  const emptyButtonGlowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchClients();
    fetchInvoices();
  }, []);

  // FAB and empty button breathing animation
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
    const emptyButtonBreathe = Animated.loop(
      Animated.sequence([
        Animated.timing(emptyButtonGlowAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(emptyButtonGlowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();
    emptyButtonBreathe.start();
    return () => {
      breathe.stop();
      emptyButtonBreathe.stop();
    };
  }, []);

  // Calculate outstanding balance, LTV, Trust Score, and last invoice date for each client
  const clientsWithStats = useMemo(() => {
    return clients.map((client) => {
      // All invoices for this client
      const allClientInvoices = invoices.filter(
        (inv) => inv.client_name.toLowerCase() === client.name.toLowerCase()
      );

      // Paid invoices (for LTV)
      const paidInvoices = allClientInvoices.filter((inv) => inv.status === "paid");
      const totalSpent = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

      // Unpaid invoices (for Outstanding Balance)
      const unpaidInvoices = allClientInvoices.filter(
        (inv) => inv.status === "sent" || inv.status === "overdue"
      );
      const outstandingBalance = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

      // Last invoice date (most recent invoice created)
      const lastInvoice = allClientInvoices.length > 0
        ? allClientInvoices.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
        : null;
      const lastInvoiceDate = lastInvoice?.created_at || null;

      // Calculate average payment days (Trust Score)
      const invoicesWithPaymentData = paidInvoices.filter(
        (inv) => inv.sent_at && inv.paid_at
      );

      let avgPaymentDays: number | null = null;
      if (invoicesWithPaymentData.length > 0) {
        const totalDays = invoicesWithPaymentData.reduce((sum, inv) => {
          const sentDate = new Date(inv.sent_at!);
          const paidDate = new Date(inv.paid_at!);
          const daysDiff = Math.max(0, Math.floor((paidDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24)));
          return sum + daysDiff;
        }, 0);
        avgPaymentDays = Math.round(totalDays / invoicesWithPaymentData.length);
      }

      return { ...client, totalSpent, outstandingBalance, lastInvoiceDate, avgPaymentDays };
    });
  }, [clients, invoices]);

  // Sort by Outstanding Balance first (who owes money), then by LTV
  const sortedClients = useMemo(() => {
    return [...clientsWithStats].sort((a, b) => {
      // First sort by outstanding balance (highest first)
      if (a.outstandingBalance !== b.outstandingBalance) {
        return b.outstandingBalance - a.outstandingBalance;
      }
      // Then by LTV
      return b.totalSpent - a.totalSpent;
    });
  }, [clientsWithStats]);

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

  const handleImportFromContacts = async () => {
    setShowOptionsModal(false);

    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const contact = await Contacts.presentContactPickerAsync();
    if (contact) {
      // Extract contact info
      const name = contact.name || "";
      const email = contact.emails?.[0]?.email || "";
      const phone = contact.phoneNumbers?.[0]?.number || "";

      // Populate the form
      setNewClientName(name);
      setNewClientEmail(email);
      setNewClientPhone(phone);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setShowAddModal(true);
    }
  };

  const handleAddManually = () => {
    setShowOptionsModal(false);
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    setShowAddModal(true);
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

  // Format date for last invoice display
  const formatLastInvoiceDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Trust Score helpers
  const getTrustScoreColor = (avgDays: number | null) => {
    if (avgDays === null) return colors.textTertiary;
    if (avgDays <= 3) return colors.statusPaid; // Green - Fast Payer
    if (avgDays <= 14) return colors.systemOrange; // Yellow/Orange - Average
    return colors.statusOverdue; // Red - Slow Payer
  };

  const getTrustScoreLabel = (avgDays: number | null) => {
    if (avgDays === null) return null;
    if (avgDays <= 3) return "Fast Payer";
    if (avgDays <= 14) return "Average";
    return "Slow Payer";
  };

  const getTrustScoreIcon = (avgDays: number | null) => {
    if (avgDays === null) return null;
    if (avgDays <= 3) return Zap; // Lightning bolt for fast payers
    if (avgDays <= 14) return Clock; // Clock for average
    return AlertTriangle; // Warning for slow payers
  };

  const renderClientCard = ({ item, index }: { item: typeof clientsWithStats[0]; index: number }) => {
    const isTopClient = index === 0 && item.totalSpent > 0;
    const TrustIcon = getTrustScoreIcon(item.avgPaymentDays);
    const trustColor = getTrustScoreColor(item.avgPaymentDays);
    const lastInvoiceFormatted = formatLastInvoiceDate(item.lastInvoiceDate);

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

          {/* Secondary info line: LTV + Last Invoice Date */}
          <View style={styles.secondaryInfoRow}>
            {item.totalSpent > 0 && (
              <Text style={[styles.secondaryInfoText, { color: colors.textTertiary }]}>
                LTV: {formatCurrency(item.totalSpent)}
              </Text>
            )}
            {item.totalSpent > 0 && lastInvoiceFormatted && (
              <Text style={[styles.secondaryInfoText, { color: colors.textTertiary }]}> • </Text>
            )}
            {lastInvoiceFormatted && (
              <Text style={[styles.secondaryInfoText, { color: colors.textTertiary }]}>
                Last: {lastInvoiceFormatted}
              </Text>
            )}
          </View>

          {/* Trust Score Badge (if has payment history) */}
          {item.avgPaymentDays !== null && TrustIcon && (
            <View style={styles.trustScoreRow}>
              <View
                style={[
                  styles.trustScoreBadge,
                  { backgroundColor: trustColor + "18" },
                ]}
              >
                <TrustIcon size={10} color={trustColor} strokeWidth={2.5} />
                <Text style={[styles.trustScoreText, { color: trustColor }]}>
                  {item.avgPaymentDays === 0 ? "Same day" : `${item.avgPaymentDays}d avg`}
                </Text>
              </View>
            </View>
          )}

          {/* Contact info (shown only if no invoices yet) */}
          {item.totalSpent === 0 && item.outstandingBalance === 0 && (item.email || item.phone) && (
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

        {/* Outstanding Balance (PRIMARY) - What they OWE NOW */}
        {item.outstandingBalance > 0 ? (
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel, { color: colors.textTertiary }]}>
              Outstanding
            </Text>
            <Text style={[styles.balanceAmount, { color: colors.statusOverdue }]}>
              {formatCurrency(item.outstandingBalance)}
            </Text>
          </View>
        ) : item.totalSpent > 0 ? (
          <Text style={[styles.paidLabel, { color: colors.statusPaid }]}>
            Paid
          </Text>
        ) : null}
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
      <View style={styles.emptyButtonContainer}>
        {/* Glow layer */}
        <Animated.View
          style={[
            styles.emptyButtonGlow,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: emptyButtonGlowAnim }],
            },
          ]}
        />
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            setShowOptionsModal(true);
          }}
          style={({ pressed }) => [
            styles.emptyButton,
            { backgroundColor: colors.primary },
            pressed && { transform: [{ scale: 0.95 }], opacity: 0.9 },
          ]}
        >
          <View style={styles.emptyButtonContent}>
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.emptyButtonText}>Add Client</Text>
          </View>
        </Pressable>
      </View>
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

  // Options Modal - Choose between contacts or manual entry
  const renderOptionsModal = () => (
    <Modal
      visible={showOptionsModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowOptionsModal(false)}
    >
      <Pressable
        style={styles.optionsOverlay}
        onPress={() => setShowOptionsModal(false)}
      >
        <View style={[styles.optionsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.optionsTitle, { color: colors.text }]}>
            Add Client
          </Text>

          <Pressable
            onPress={handleImportFromContacts}
            style={({ pressed }) => [
              styles.optionButton,
              { backgroundColor: pressed ? colors.backgroundSecondary : "transparent" },
            ]}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: colors.primary + "15" }]}>
              <Users size={22} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Import from Contacts
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textTertiary }]}>
                Select from your phone contacts
              </Text>
            </View>
          </Pressable>

          <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />

          <Pressable
            onPress={handleAddManually}
            style={({ pressed }) => [
              styles.optionButton,
              { backgroundColor: pressed ? colors.backgroundSecondary : "transparent" },
            ]}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: colors.systemOrange + "15" }]}>
              <Edit3 size={22} color={colors.systemOrange} strokeWidth={2} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionLabel, { color: colors.text }]}>
                Add Manually
              </Text>
              <Text style={[styles.optionDescription, { color: colors.textTertiary }]}>
                Enter client details yourself
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setShowOptionsModal(false);
            }}
            style={[styles.cancelButton, { backgroundColor: colors.backgroundSecondary }]}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </Pressable>
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

      {/* Floating Action Button - Only show when there are clients */}
      {clients.length > 0 && (
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
              setShowOptionsModal(true);
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
      )}

      {renderOptionsModal()}
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
  trustScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  trustScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  trustScoreText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  secondaryInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  secondaryInfoText: {
    fontSize: 12,
    fontWeight: "500",
  },
  balanceContainer: {
    alignItems: "flex-end",
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"],
  },
  paidLabel: {
    fontSize: 14,
    fontWeight: "600",
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
  emptyButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButtonGlow: {
    position: "absolute",
    width: 200,
    height: 56,
    borderRadius: 100,
    opacity: 0.3,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  emptyButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
    top: 93,
    right: 36,
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

  // Options Modal
  optionsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  optionsContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 16,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 2,
  },
  optionDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
