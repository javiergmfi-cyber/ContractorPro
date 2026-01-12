import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  Plus,
  Phone,
  Mail,
  ChevronRight,
  X,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useClientStore } from "@/store/useClientStore";
import { useTheme } from "@/lib/theme";
import { Client } from "@/types/database";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Button } from "@/components/ui/Button";

/**
 * Clients Tab
 * Per design-system.md - Client list with MonogramAvatar
 */

export default function ClientsScreen() {
  const router = useRouter();
  const { colors, typography, spacing, radius, shadows, isDark } = useTheme();
  const {
    clients,
    isLoading,
    isSaving,
    fetchClients,
    createClient,
  } = useClientStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchClients();
    setRefreshing(false);
  }, [fetchClients]);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientPress = (client: Client) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to client detail/edit screen (to be implemented)
    // router.push(`/client/${client.id}`);
  };

  const handleAddClient = async () => {
    if (!newClientName.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colorPalette = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
      "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
      "#BB8FCE", "#85C1E9", "#F8B500", "#00CED1",
    ];
    const index = name.charCodeAt(0) % colorPalette.length;
    return colorPalette[index];
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <Pressable
      onPress={() => handleClientPress(item)}
      style={({ pressed }) => [
        styles.clientCard,
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          ...shadows.default,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* MonogramAvatar */}
      <View
        style={[
          styles.avatar,
          { backgroundColor: getAvatarColor(item.name) },
        ]}
      >
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>

      {/* Client Info */}
      <View style={styles.clientInfo}>
        <Text
          style={[typography.headline, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        {(item.email || item.phone) && (
          <View style={styles.contactRow}>
            {item.email && (
              <View style={styles.contactItem}>
                <Mail size={12} color={colors.textTertiary} />
                <Text
                  style={[typography.caption1, { color: colors.textTertiary, marginLeft: 4 }]}
                  numberOfLines={1}
                >
                  {item.email}
                </Text>
              </View>
            )}
            {item.phone && (
              <View style={styles.contactItem}>
                <Phone size={12} color={colors.textTertiary} />
                <Text
                  style={[typography.caption1, { color: colors.textTertiary, marginLeft: 4 }]}
                >
                  {item.phone}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <ChevronRight size={20} color={colors.textTertiary} />
    </Pressable>
  );

  const ListHeader = () => (
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
          style={[
            styles.searchInput,
            typography.body,
            { color: colors.text },
          ]}
          placeholder="Search clients..."
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
  );

  if (isLoading && clients.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[typography.largeTitle, { color: colors.text }]}>Clients</Text>
        </View>
        <SkeletonCard count={5} />
      </SafeAreaView>
    );
  }

  if (clients.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <Text style={[typography.largeTitle, { color: colors.text }]}>Clients</Text>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAddModal(true);
            }}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        </View>
        <EmptyState
          type="noClients"
          onAction={() => setShowAddModal(true)}
          actionLabel="Add First Client"
        />
        {renderAddModal()}
      </SafeAreaView>
    );
  }

  function renderAddModal() {
    return (
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
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Text style={[typography.body, { color: colors.primary }]}>Cancel</Text>
              </Pressable>
              <Text style={[typography.headline, { color: colors.text }]}>Add Client</Text>
              <View style={{ width: 50 }} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[typography.footnote, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                  Name *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    typography.body,
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
                <Text style={[typography.footnote, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                  Email
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    typography.body,
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
                <Text style={[typography.footnote, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                  Phone
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    typography.body,
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
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[typography.largeTitle, { color: colors.text }]}>Clients</Text>
          <Text style={[typography.subhead, { color: colors.textTertiary, marginTop: 2 }]}>
            {clients.length} total
          </Text>
        </View>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddModal(true);
          }}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientItem}
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
              onAction={() => setSearchQuery("")}
              actionLabel="Clear Search"
            />
          ) : null
        }
      />

      {renderAddModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
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
  listContent: {
    paddingBottom: 120,
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  clientInfo: {
    flex: 1,
    marginRight: 8,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Modal Styles
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  form: {
    padding: 24,
    gap: 20,
  },
  inputGroup: {},
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalButtonContainer: {
    padding: 24,
    marginTop: "auto",
  },
});
