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
  Crown,
  Bell,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Contacts from "expo-contacts";
import { useClientStore } from "@/store/useClientStore";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useTheme } from "@/lib/theme";
import { Client } from "@/types/database";
import { Button } from "@/components/ui/Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

// Format phone number as user types - (XXX) XXX-XXXX
const formatPhoneAsYouType = (text: string): string => {
  // Remove all non-digits
  const digits = text.replace(/\D/g, "").slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

// Get raw digits from formatted phone
const getPhoneDigits = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

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
  const { isPro } = useSubscriptionStore();

  const [activeTab, setActiveTab] = useState<"all" | "unpaid" | "paid">("all");
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
  const fabPulseAnim = useRef(new Animated.Value(1)).current;

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
          toValue: 1.03,
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
    const fabPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();
    emptyButtonBreathe.start();
    fabPulse.start();
    return () => {
      breathe.stop();
      emptyButtonBreathe.stop();
      fabPulse.stop();
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

  // Set default tab based on whether there are unpaid invoices (only on initial load)
  const [hasSetInitialTab, setHasSetInitialTab] = useState(false);
  useEffect(() => {
    if (!hasSetInitialTab && clientsWithStats.length > 0) {
      const clientsWithUnpaid = clientsWithStats.filter((c) => c.outstandingBalance > 0);
      if (clientsWithUnpaid.length > 0) {
        setActiveTab("unpaid");
      } else {
        setActiveTab("all");
      }
      setHasSetInitialTab(true);
    }
  }, [clientsWithStats, hasSetInitialTab]);

  // Filter and sort clients based on active tab
  const filteredAndSortedClients = useMemo(() => {
    let filtered = [...clientsWithStats];

    // Filter by tab
    if (activeTab === "unpaid") {
      filtered = filtered.filter((c) => c.outstandingBalance > 0);
      // Sort by amount owed (highest first)
      filtered.sort((a, b) => b.outstandingBalance - a.outstandingBalance);
    } else if (activeTab === "paid") {
      filtered = filtered.filter((c) => c.outstandingBalance === 0 && c.totalSpent > 0);
      // Sort by LTV (highest first)
      filtered.sort((a, b) => b.totalSpent - a.totalSpent);
    } else {
      // "all" tab - sort alphabetically
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [clientsWithStats, activeTab, searchQuery]);

  // Stats for tabs
  const unpaidClientsCount = clientsWithStats.filter((c) => c.outstandingBalance > 0).length;
  const paidClientsCount = clientsWithStats.filter((c) => c.outstandingBalance === 0 && c.totalSpent > 0).length;
  const totalOutstanding = clientsWithStats.reduce((sum, c) => sum + c.outstandingBalance, 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([fetchClients(), fetchInvoices()]);
    setRefreshing(false);
  }, [fetchClients, fetchInvoices]);

  const handleClientPress = (client: Client) => {
    Haptics.selectionAsync();
    router.push(`/client/${client.id}`);
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
    const hasInvoiceHistory = item.totalSpent > 0 || item.outstandingBalance > 0;

    return (
      <Pressable
        onPress={() => handleClientPress(item)}
        style={({ pressed }) => ({
          padding: 16,
          borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Left: Avatar */}
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            backgroundColor: getPastelColor(item.name),
          }}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
            {/* Trophy badge for top client */}
            {isTopClient && (
              <View style={[styles.topBadge, { backgroundColor: colors.systemOrange }]}>
                <Trophy size={10} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Middle: Client Info */}
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={[styles.clientName, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            {/* Subtitle line based on context */}
            {item.outstandingBalance > 0 ? (
              <Text style={[styles.clientSubtitle, { color: colors.systemRed }]}>
                {formatCurrency(item.outstandingBalance)} owed
              </Text>
            ) : hasInvoiceHistory ? (
              <Text style={[styles.clientSubtitle, { color: colors.textTertiary }]}>
                {formatCurrency(item.totalSpent)} lifetime
                {lastInvoiceFormatted ? ` • ${lastInvoiceFormatted}` : ""}
              </Text>
            ) : item.phone ? (
              <Text style={[styles.clientSubtitle, { color: colors.textTertiary }]}>
                {formatPhoneNumber(item.phone)}
              </Text>
            ) : item.email ? (
              <Text style={[styles.clientSubtitle, { color: colors.textTertiary }]} numberOfLines={1}>
                {item.email}
              </Text>
            ) : (
              <Text style={[styles.clientSubtitle, { color: colors.textTertiary }]}>
                No contact info
              </Text>
            )}
          </View>

          {/* Right: Action area */}
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            {item.outstandingBalance > 0 ? (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/paywall?trigger=auto_chase");
                }}
                style={({ pressed }) => [
                  styles.chaseButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Bell size={14} color="#FFFFFF" />
                <Text style={styles.chaseButtonText}>Chase</Text>
                {!isPro && (
                  <View style={[styles.proBadgeSmall, { backgroundColor: colors.systemOrange }]}>
                    <Crown size={8} color="#FFF" />
                  </View>
                )}
              </Pressable>
            ) : (
              <ChevronRight size={20} color={colors.textTertiary} />
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  // Divider between contacts
  const ItemSeparator = () => (
    <View style={{ paddingVertical: 10, paddingHorizontal: 16 }}>
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />
    </View>
  );

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
        <Animated.View
          style={{
            transform: [{ scale: emptyButtonGlowAnim }],
          }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
              setShowOptionsModal(true);
            }}
            style={({ pressed }) => [
              {
                backgroundColor: "#22C55E",
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 9999,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#22C55E",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 12,
              },
              pressed && { transform: [{ scale: 0.95 }], opacity: 0.9 },
            ]}
          >
            <View style={styles.emptyButtonContent}>
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 18 }}>Add Client</Text>
            </View>
          </Pressable>
        </Animated.View>
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
                CELL PHONE
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
                onChangeText={(text) => setNewClientPhone(formatPhoneAsYouType(text))}
                keyboardType="phone-pad"
                maxLength={14}
              />
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.modalButtonContainer}>
            <Button
              title={isSaving ? "Saving..." : "Add Client"}
              onPress={handleAddClient}
              disabled={!newClientName.trim() || getPhoneDigits(newClientPhone).length !== 10 || isSaving}
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
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowOptionsModal(false)}
    >
      <Pressable
        style={styles.optionsOverlay}
        onPress={() => setShowOptionsModal(false)}
      >
        <View
          style={[styles.optionsContainer, { backgroundColor: colors.card }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          <Text style={[styles.optionsTitle, { color: colors.text }]}>
            Add Client
          </Text>

          <Pressable
            onPress={handleImportFromContacts}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              marginBottom: 12,
              borderRadius: 16,
              backgroundColor: colors.backgroundSecondary,
            }}
          >
            <View style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: colors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Users size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text }}>
                Import from Contacts
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2 }}>
                Select from your phone contacts
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleAddManually}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              marginBottom: 12,
              borderRadius: 16,
              backgroundColor: colors.backgroundSecondary,
            }}
          >
            <View style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: colors.systemOrange + "20",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Edit3 size={24} color={colors.systemOrange} strokeWidth={2} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text }}>
                Enter Manually
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2 }}>
                Type in client details
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setShowOptionsModal(false);
            }}
            style={[styles.cancelButton, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.cancelButtonText, { color: colors.primary }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );

  // Handle tab change
  const handleTabChange = (tab: "all" | "unpaid" | "paid") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.largeTitle, { color: colors.text }]}>Clients</Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
          {clients.length} total{totalOutstanding > 0 ? ` • ${formatCurrency(totalOutstanding)} outstanding` : ""}
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

      {/* Segmented Control */}
      <View style={styles.segmentedControlContainer}>
        <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundSecondary }]}>
          <Pressable
            onPress={() => handleTabChange("all")}
            style={[
              styles.segmentButton,
              activeTab === "all" && [styles.segmentButtonActive, { backgroundColor: colors.card }],
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === "all" ? colors.text : colors.textTertiary },
                activeTab === "all" && styles.segmentTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleTabChange("unpaid")}
            style={[
              styles.segmentButton,
              activeTab === "unpaid" && [styles.segmentButtonActive, { backgroundColor: colors.card }],
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === "unpaid" ? colors.text : colors.textTertiary },
                activeTab === "unpaid" && styles.segmentTextActive,
              ]}
            >
              Unpaid
            </Text>
            {unpaidClientsCount > 0 && (
              <View style={[styles.segmentBadge, { backgroundColor: colors.systemRed }]}>
                <Text style={styles.segmentBadgeText}>{unpaidClientsCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={() => handleTabChange("paid")}
            style={[
              styles.segmentButton,
              activeTab === "paid" && [styles.segmentButtonActive, { backgroundColor: colors.card }],
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === "paid" ? colors.text : colors.textTertiary },
                activeTab === "paid" && styles.segmentTextActive,
              ]}
            >
              Paid
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Client List */}
      <FlatList
        data={filteredAndSortedClients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientCard}
        ItemSeparatorComponent={ItemSeparator}
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
          ) : activeTab === "unpaid" ? (
            <View style={styles.tabEmptyState}>
              <View style={[styles.tabEmptyIcon, { backgroundColor: colors.statusPaid + "15" }]}>
                <Zap size={32} color={colors.statusPaid} />
              </View>
              <Text style={[styles.tabEmptyTitle, { color: colors.text }]}>All Caught Up!</Text>
              <Text style={[styles.tabEmptySubtitle, { color: colors.textTertiary }]}>
                No outstanding invoices
              </Text>
            </View>
          ) : activeTab === "paid" ? (
            <View style={styles.tabEmptyState}>
              <View style={[styles.tabEmptyIcon, { backgroundColor: colors.textTertiary + "15" }]}>
                <Clock size={32} color={colors.textTertiary} />
              </View>
              <Text style={[styles.tabEmptyTitle, { color: colors.text }]}>No Paid Clients Yet</Text>
              <Text style={[styles.tabEmptySubtitle, { color: colors.textTertiary }]}>
                Clients will appear here once they pay
              </Text>
            </View>
          ) : null
        }
      />

      {/* Floating Action Button - Only show when there are clients */}
      {clients.length > 0 && (
        <Animated.View style={{
          position: "absolute",
          top: 82,
          right: 20,
          transform: [{ scale: fabPulseAnim }],
        }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#22C55E",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#22C55E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
                setShowOptionsModal(true);
              }}
              style={{
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>
        </Animated.View>
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

  // Segmented Control
  segmentedControlContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  segmentButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "500",
  },
  segmentTextActive: {
    fontWeight: "600",
  },
  segmentBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  segmentBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
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
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  topBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  clientInfo: {
    flex: 1,
    marginRight: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  clientSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: -0.1,
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
    marginTop: 6,
  },
  trustScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  trustScoreText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  cardRightSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  chaseButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  chaseButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  proBadgeSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
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
    width: 180,
    height: 52,
    borderRadius: 100,
    opacity: 0.12,
    backgroundColor: "#00D632",
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 100,
    backgroundColor: "#00D632",
    shadowColor: "#00D632",
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
    top: 100,
    right: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  fabGlow: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.3,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#22C55E",
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  optionsContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 36,
    height: 5,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 14,
    marginBottom: 10,
  },
  optionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
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
    marginTop: 3,
  },
  optionDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: "600",
  },

  // Tab Empty States
  tabEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  tabEmptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  tabEmptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  tabEmptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
});
