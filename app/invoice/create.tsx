import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  X,
  User,
  ChevronRight,
  Edit3,
  BookUser,
  DollarSign,
  FileText,
  Calendar,
  Check,
  Users,
  ChevronLeft,
  Crown,
} from "lucide-react-native";
import * as Contacts from "expo-contacts";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { MonogramAvatar } from "@/components/MonogramAvatar";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useClientStore } from "@/store/useClientStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * New Invoice - Apple/Tesla Inspired Design
 * Clean, card-based, premium feel
 */

interface SelectedContact {
  name: string;
  phone?: string;
  email?: string;
}

type DueTerm = "immediate" | "net7" | "net15" | "net30";
type DepositOption = "none" | "30" | "50" | "custom";

const DEPOSIT_OPTIONS: { key: DepositOption; label: string; percent: number | null }[] = [
  { key: "none", label: "None", percent: null },
  { key: "30", label: "30%", percent: 30 },
  { key: "50", label: "50%", percent: 50 },
];

const DUE_TERM_OPTIONS: { key: DueTerm; label: string; sublabel: string; days: number }[] = [
  { key: "immediate", label: "Due Now", sublabel: "Upon receipt", days: 0 },
  { key: "net7", label: "In 7 Days", sublabel: "1 week", days: 7 },
  { key: "net15", label: "In 15 Days", sublabel: "2 weeks", days: 15 },
  { key: "net30", label: "In 30 Days", sublabel: "1 month", days: 30 },
];

const getDueDateFromTerm = (term: DueTerm): Date => {
  const option = DUE_TERM_OPTIONS.find((o) => o.key === term);
  const date = new Date();
  date.setDate(date.getDate() + (option?.days ?? 0));
  return date;
};

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { setPendingInvoice } = useInvoiceStore();
  const { clients, fetchClients, isLoading: isLoadingClients } = useClientStore();
  const { isPro } = useSubscriptionStore();

  // Form State
  const [selectedContact, setSelectedContact] = useState<SelectedContact | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueTerm, setDueTerm] = useState<DueTerm>("immediate");

  // Deposit State
  const [depositOption, setDepositOption] = useState<DepositOption>("none");
  const [customPercent, setCustomPercent] = useState("");

  // Modal State
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showExistingClients, setShowExistingClients] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [clientSearchQuery, setClientSearchQuery] = useState("");

  // Refs
  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Button animation
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Filter existing clients by search query
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    client.phone?.includes(clientSearchQuery)
  );

  // Derived state
  const isValid = selectedContact && amount && parseFloat(amount) > 0;

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

  // Format amount for display
  const formatDisplayAmount = (value: string) => {
    if (!value) return "$0";
    const num = parseFloat(value);
    if (isNaN(num)) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Handle contact selection from contacts
  const handlePickContact = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status: existingStatus } = await Contacts.getPermissionsAsync();

    if (existingStatus !== "granted") {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setManualName("");
        setManualPhone("");
        setManualEmail("");
        setShowManualEntry(true);
        return;
      }
    }

    const contact = await Contacts.presentContactPickerAsync();

    if (contact) {
      const phone = contact.phoneNumbers?.[0]?.number;
      const email = contact.emails?.[0]?.email;
      const name = contact.name
        || [contact.firstName, contact.lastName].filter(Boolean).join(" ")
        || "Unknown";

      setSelectedContact({ name, phone, email });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Format number with commas (e.g., 1234567 -> "1,234,567")
  const formatWithCommas = (value: string): string => {
    if (!value) return "";
    const parts = value.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts.length === 2) {
      return `${integerPart}.${parts[1]}`;
    }
    return integerPart;
  };

  // Handle amount change
  const handleAmountChange = (text: string) => {
    // Remove everything except digits and decimal
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  };

  // Display amount with commas
  const displayAmount = formatWithCommas(amount);

  // Calculate deposit values
  const getDepositPercent = (): number | null => {
    if (depositOption === "none") return null;
    if (depositOption === "custom") {
      const parsed = parseInt(customPercent);
      return isNaN(parsed) || parsed <= 0 || parsed >= 100 ? null : parsed;
    }
    return parseInt(depositOption);
  };

  const depositPercent = getDepositPercent();
  const depositAmountCents = depositPercent && amount
    ? Math.round((parseFloat(amount) * 100 * depositPercent) / 100)
    : 0;

  // Handle create invoice
  const handleCreate = () => {
    if (!isValid || !selectedContact) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const dueDate = getDueDateFromTerm(dueTerm);

    const currentDepositPercent = getDepositPercent();

    setPendingInvoice({
      clientName: selectedContact.name,
      clientPhone: selectedContact.phone,
      clientEmail: selectedContact.email,
      items: [
        {
          description: description.trim() || "Services Rendered",
          price: Math.round(parseFloat(amount) * 100),
          quantity: 1,
        },
      ],
      detectedLanguage: "en",
      confidence: 1.0,
      dueDate: dueDate.toISOString(),
      // Deposit settings
      deposit_enabled: currentDepositPercent !== null && currentDepositPercent > 0,
      deposit_type: currentDepositPercent ? "percent" : null,
      deposit_value: currentDepositPercent,
    });

    router.push("/invoice/preview");
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={12}>
          <X size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Invoice</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ════════════════════════════════════════════════════════
              CLIENT CARD
          ════════════════════════════════════════════════════════ */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowContactOptions(true);
            }}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={styles.cardRow}>
              {selectedContact ? (
                <>
                  <MonogramAvatar name={selectedContact.name} size={48} />
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>Bill To</Text>
                    <Text style={[styles.cardValue, { color: colors.text }]}>{selectedContact.name}</Text>
                    {(selectedContact.phone || selectedContact.email) && (
                      <Text style={[styles.cardSubvalue, { color: colors.textSecondary }]}>
                        {selectedContact.phone ? formatPhoneNumber(selectedContact.phone) : selectedContact.email}
                      </Text>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primary + "15" }]}>
                    <User size={24} color={colors.primary} strokeWidth={1.5} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardPlaceholder, { color: colors.primary }]}>
                      Select Client
                    </Text>
                    <Text style={[styles.cardHint, { color: colors.textTertiary }]}>
                      From contacts or enter manually
                    </Text>
                  </View>
                </>
              )}
              <ChevronRight size={20} color={colors.textTertiary} />
            </View>
          </Pressable>

          {/* Spacer between client and amount */}
          <View style={{ height: 20 }} />

          {/* ════════════════════════════════════════════════════════
              AMOUNT CARD
          ════════════════════════════════════════════════════════ */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.amountHeader}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + "15" }]}>
                <DollarSign size={24} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={[styles.cardLabel, { color: colors.textTertiary, marginLeft: 12 }]}>
                Amount
              </Text>
            </View>

            <View style={styles.amountInputContainer}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
              <TextInput
                ref={amountInputRef}
                style={[styles.amountInput, { color: colors.text }]}
                value={displayAmount}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                maxLength={15}
              />
            </View>

          </View>

          {/* ════════════════════════════════════════════════════════
              DESCRIPTION CARD
          ════════════════════════════════════════════════════════ */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.cardRow, { alignItems: "flex-start" }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors.systemBlue + "15", marginTop: 2 }]}>
                <FileText size={24} color={colors.systemBlue} strokeWidth={1.5} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>Description</Text>
                <TextInput
                  ref={descriptionInputRef}
                  style={[styles.descriptionInput, { color: colors.text }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What's this for? (optional)"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  scrollEnabled={false}
                  maxLength={200}
                />
              </View>
            </View>
          </View>

          {/* ════════════════════════════════════════════════════════
              DUE DATE CARD
          ════════════════════════════════════════════════════════ */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.dueDateHeader}>
              <View style={[styles.iconCircle, { backgroundColor: colors.alert + "15" }]}>
                <Calendar size={24} color={colors.alert} strokeWidth={1.5} />
              </View>
              <Text style={[styles.cardLabel, { color: colors.textTertiary, marginLeft: 12 }]}>
                Payment Terms
              </Text>
            </View>

            <View style={styles.dueTermGrid}>
              {DUE_TERM_OPTIONS.map((option) => {
                const isActive = dueTerm === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDueTerm(option.key);
                    }}
                    style={[
                      styles.dueTermOption,
                      {
                        backgroundColor: isActive ? colors.primary : colors.backgroundSecondary,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {isActive && (
                      <View style={styles.checkIcon}>
                        <Check size={14} color="#FFF" strokeWidth={3} />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.dueTermLabel,
                        { color: isActive ? "#FFF" : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.dueTermSublabel,
                        { color: isActive ? "rgba(255,255,255,0.7)" : colors.textTertiary },
                      ]}
                    >
                      {option.sublabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ════════════════════════════════════════════════════════
              DEPOSIT CARD
          ════════════════════════════════════════════════════════ */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.depositHeader}>
              <View style={[styles.iconCircle, { backgroundColor: colors.statusPaid + "15" }]}>
                <DollarSign size={24} color={colors.statusPaid} strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.cardLabel, { color: colors.textTertiary }]}>
                    Deposit
                  </Text>
                  {!isPro && (
                    <View style={[styles.proBadge, { backgroundColor: colors.systemOrange + "15" }]}>
                      <Crown size={10} color={colors.systemOrange} />
                      <Text style={[styles.proBadgeText, { color: colors.systemOrange }]}>PRO</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.depositGrid}>
              {DEPOSIT_OPTIONS.map((option) => {
                const isActive = depositOption === option.key;
                const isDisabled = !isPro && option.key !== "none";
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => {
                      if (isDisabled) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        router.push("/paywall?trigger=deposit_feature");
                        return;
                      }
                      Haptics.selectionAsync();
                      setDepositOption(option.key);
                      if (option.key !== "custom") {
                        setCustomPercent("");
                      }
                    }}
                    style={[
                      styles.depositOption,
                      {
                        backgroundColor: isActive ? colors.primary : colors.backgroundSecondary,
                        borderColor: isActive ? colors.primary : colors.border,
                        opacity: isDisabled ? 0.5 : 1,
                      },
                    ]}
                  >
                    {isActive && (
                      <View style={styles.checkIcon}>
                        <Check size={12} color="#FFF" strokeWidth={3} />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.depositLabel,
                        { color: isActive ? "#FFF" : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}

              {/* Custom Option */}
              <Pressable
                onPress={() => {
                  if (!isPro) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    router.push("/paywall?trigger=deposit_feature");
                    return;
                  }
                  Haptics.selectionAsync();
                  setDepositOption("custom");
                }}
                style={[
                  styles.depositOption,
                  {
                    backgroundColor: depositOption === "custom" ? colors.primary : colors.backgroundSecondary,
                    borderColor: depositOption === "custom" ? colors.primary : colors.border,
                    opacity: !isPro ? 0.5 : 1,
                  },
                ]}
              >
                {depositOption === "custom" && (
                  <View style={styles.checkIcon}>
                    <Check size={12} color="#FFF" strokeWidth={3} />
                  </View>
                )}
                <Text
                  style={[
                    styles.depositLabel,
                    { color: depositOption === "custom" ? "#FFF" : colors.text },
                  ]}
                >
                  Custom
                </Text>
              </Pressable>
            </View>

            {/* Custom Input */}
            {depositOption === "custom" && (
              <View style={[styles.customInputContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                <Text style={[styles.customInputLabel, { color: colors.textSecondary }]}>Custom:</Text>
                <TextInput
                  style={[styles.customInput, { color: colors.text }]}
                  value={customPercent}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9]/g, "");
                    const num = parseInt(cleaned);
                    if (cleaned === "" || (num >= 1 && num <= 99)) {
                      setCustomPercent(cleaned);
                    }
                  }}
                  placeholder="25"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={[styles.customInputSuffix, { color: colors.textSecondary }]}>%</Text>
              </View>
            )}

            {/* Deposit Amount Preview */}
            {depositPercent !== null && amount && parseFloat(amount) > 0 && (
              <View style={[styles.depositPreview, { backgroundColor: colors.statusPaid + "10" }]}>
                <DollarSign size={14} color={colors.statusPaid} />
                <Text style={[styles.depositPreviewText, { color: colors.statusPaid }]}>
                  {formatDisplayAmount((depositAmountCents / 100).toString())} deposit of {formatDisplayAmount(amount)} total
                </Text>
              </View>
            )}
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ════════════════════════════════════════════════════════
          CREATE BUTTON
      ════════════════════════════════════════════════════════ */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
        <Animated.View style={{ transform: [{ scale: buttonScale }], width: "100%" }}>
          <Pressable
            onPress={handleCreate}
            disabled={!isValid}
            style={[
              styles.createButton,
              {
                backgroundColor: isValid ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.createButtonText, { opacity: isValid ? 1 : 0.5 }]}>
              Review Invoice
            </Text>
          </Pressable>
        </Animated.View>

        {!isValid && (
          <Text style={[styles.validationHint, { color: colors.textTertiary }]}>
            {!selectedContact ? "Select a client to continue" : "Enter an amount"}
          </Text>
        )}
      </View>

      {/* ════════════════════════════════════════════════════════
          CONTACT OPTIONS MODAL
      ════════════════════════════════════════════════════════ */}
      <Modal
        visible={showContactOptions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactOptions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowContactOptions(false)}>
          <View
            style={[styles.modalContainer, { backgroundColor: colors.card }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Client</Text>

            {/* Existing Clients Option - Only show if there are saved clients */}
            {clients.length > 0 && (
              <Pressable
                onPress={() => {
                  setShowContactOptions(false);
                  setClientSearchQuery("");
                  setShowExistingClients(true);
                }}
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
                  backgroundColor: colors.statusPaid + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Users size={24} color={colors.statusPaid} strokeWidth={2} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text }}>
                    Existing Client
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 2 }}>
                    {clients.length} saved client{clients.length !== 1 ? "s" : ""}
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} />
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                setShowContactOptions(false);
                handlePickContact();
              }}
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
                <BookUser size={24} color={colors.primary} strokeWidth={2} />
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
              onPress={() => {
                setShowContactOptions(false);
                setManualName("");
                setManualPhone("");
                setManualEmail("");
                setShowManualEntry(true);
              }}
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
                backgroundColor: colors.alert + "20",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Edit3 size={24} color={colors.alert} strokeWidth={2} />
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
                setShowContactOptions(false);
              }}
              style={{
                marginTop: 10,
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: "center",
                backgroundColor: colors.background,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "600", color: colors.primary }}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          MANUAL ENTRY MODAL
      ════════════════════════════════════════════════════════ */}
      <Modal
        visible={showManualEntry}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualEntry(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <Pressable
              onPress={() => setShowManualEntry(false)}
              style={styles.modalCloseButton}
              hitSlop={12}
            >
              <X size={22} color={colors.textTertiary} strokeWidth={2.5} />
            </Pressable>

            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Client Details</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name *</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                value={manualName}
                onChangeText={setManualName}
                placeholder="Client name"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                value={manualPhone}
                onChangeText={setManualPhone}
                placeholder="(555) 123-4567"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                value={manualEmail}
                onChangeText={setManualEmail}
                placeholder="client@email.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Pressable
              onPress={() => {
                if (!manualName.trim()) return;
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setSelectedContact({
                  name: manualName.trim(),
                  phone: manualPhone.trim() || undefined,
                  email: manualEmail.trim() || undefined,
                });
                setShowManualEntry(false);
              }}
              disabled={!manualName.trim()}
              style={[
                styles.saveButton,
                { backgroundColor: manualName.trim() ? colors.primary : colors.border },
              ]}
            >
              <Text style={styles.saveButtonText}>Save Client</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ════════════════════════════════════════════════════════
          EXISTING CLIENTS MODAL
      ════════════════════════════════════════════════════════ */}
      <Modal
        visible={showExistingClients}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExistingClients(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
          {/* Header */}
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 8,
            paddingVertical: 12,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          }}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowExistingClients(false);
                setShowContactOptions(true);
              }}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
              hitSlop={12}
            >
              <ChevronLeft size={28} color={colors.primary} strokeWidth={2} />
            </Pressable>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text, letterSpacing: -0.4 }}>
              Select Client
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowExistingClients(false);
              }}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
              hitSlop={12}
            >
              <X size={24} color={colors.textTertiary} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Search Bar - only show if more than 5 clients */}
          {clients.length > 5 && (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: 16,
              marginTop: 12,
              marginBottom: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: colors.backgroundSecondary,
              gap: 8,
            }}>
              <User size={18} color={colors.textTertiary} />
              <TextInput
                style={{ flex: 1, fontSize: 16, padding: 0, color: colors.text }}
                placeholder="Search clients..."
                placeholderTextColor={colors.textTertiary}
                value={clientSearchQuery}
                onChangeText={setClientSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {clientSearchQuery.length > 0 && (
                <Pressable onPress={() => setClientSearchQuery("")} hitSlop={8}>
                  <X size={18} color={colors.textTertiary} />
                </Pressable>
              )}
            </View>
          )}

          {/* Client List */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredClients.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ fontSize: 15, fontWeight: "500", color: colors.textTertiary }}>
                  {clientSearchQuery ? `No clients found for "${clientSearchQuery}"` : "No clients found"}
                </Text>
              </View>
            ) : (
              filteredClients.map((client) => {
                // Generate initials (same logic as clients tab)
                const words = client.name.trim().split(" ");
                const initials = words.length >= 2
                  ? `${words[0][0]}${words[1][0]}`.toUpperCase()
                  : client.name.slice(0, 2).toUpperCase();

                // Pastel color based on name (same as clients tab)
                const pastelColors = [
                  "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9",
                  "#BAE1FF", "#E8BAFF", "#FFB3E6", "#C9BAFF",
                  "#BAFFEA", "#FFD9BA", "#D4BAFF", "#BAFFCE",
                ];
                const colorIndex = client.name.charCodeAt(0) % pastelColors.length;
                const avatarColor = pastelColors[colorIndex];

                return (
                  <Pressable
                    key={client.id}
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      setSelectedContact({
                        name: client.name,
                        phone: client.phone || undefined,
                        email: client.email || undefined,
                      });
                      setShowExistingClients(false);
                    }}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 16,
                      borderRadius: 16,
                      backgroundColor: colors.card,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    {/* Avatar with pastel color */}
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: avatarColor,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}>
                      <Text style={{
                        color: "#FFFFFF",
                        fontSize: 16,
                        fontWeight: "700",
                        textShadowColor: "rgba(0,0,0,0.15)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        {initials}
                      </Text>
                    </View>

                    {/* Client Info */}
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: colors.text,
                        letterSpacing: -0.3,
                        marginBottom: 2,
                      }} numberOfLines={1}>
                        {client.name}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: "400",
                        color: colors.textTertiary,
                        letterSpacing: -0.1,
                      }} numberOfLines={1}>
                        {client.phone || client.email || "No contact info"}
                      </Text>
                    </View>

                    {/* Chevron */}
                    <ChevronRight size={20} color={colors.textTertiary} />
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Cards
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 2,
  },
  cardSubvalue: {
    fontSize: 14,
    marginTop: 2,
  },
  cardPlaceholder: {
    fontSize: 17,
    fontWeight: "600",
  },
  cardHint: {
    fontSize: 14,
    marginTop: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  // Amount
  amountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: "300",
    opacity: 0.5,
  },
  amountInput: {
    fontSize: 64,
    fontWeight: "700",
    letterSpacing: -2,
    minWidth: 60,
    textAlign: "center",
  },
  amountWords: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

  // Description
  descriptionInput: {
    fontSize: 17,
    fontWeight: "500",
    marginTop: 4,
    paddingVertical: 4,
    minHeight: 24,
  },

  // Due Date
  dueDateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dueTermGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dueTermOption: {
    width: (SCREEN_WIDTH - 40 - 16 - 30) / 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dueTermLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  dueTermSublabel: {
    fontSize: 13,
    marginTop: 2,
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  // Deposit
  depositHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  depositGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  depositOption: {
    width: (SCREEN_WIDTH - 40 - 16 - 30) / 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  depositLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  customInputLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  customInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 8,
  },
  customInputSuffix: {
    fontSize: 18,
    fontWeight: "500",
  },
  depositPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  depositPreviewText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
  createButton: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
  },
  validationHint: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  modalHandle: {
    width: 36,
    height: 5,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOptionContent: {
    flex: 1,
    marginLeft: 14,
  },
  modalOptionTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  modalOptionSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },

  // Form inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
  },
  saveButton: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
  },

});
