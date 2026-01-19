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
  LayoutAnimation,
  UIManager,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  X,
  UserPlus,
  ArrowRight,
} from "lucide-react-native";
import * as Contacts from "expo-contacts";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme";
import { MonogramAvatar } from "@/components/MonogramAvatar";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { AutoResizingInput } from "@/components/ui/AutoResizingInput";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Quick Invoice Creation - Venmo/iMessage Style
 * Speed is the priority. Feels like sending money.
 */

interface SelectedContact {
  name: string;
  phone?: string;
  email?: string;
}

// Quick-Term Due Date Options
type DueTerm = "immediate" | "net7" | "net15" | "net30";

const DUE_TERM_OPTIONS: { key: DueTerm; label: string; days: number }[] = [
  { key: "immediate", label: "Immediate", days: 0 },
  { key: "net7", label: "Net 7", days: 7 },
  { key: "net15", label: "Net 15", days: 15 },
  { key: "net30", label: "Net 30", days: 30 },
];

const getDueDateFromTerm = (term: DueTerm): Date => {
  const option = DUE_TERM_OPTIONS.find((o) => o.key === term);
  const date = new Date();
  date.setDate(date.getDate() + (option?.days ?? 0));
  return date;
};

export default function CreateInvoiceScreen() {
  const router = useRouter();
  const { colors, glass, typography, spacing, radius } = useTheme();
  const { setPendingInvoice } = useInvoiceStore();

  // Form State
  const [selectedContact, setSelectedContact] = useState<SelectedContact | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueTerm, setDueTerm] = useState<DueTerm>("immediate");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Refs
  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  // Animations
  const fabAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0.8)).current;

  // Derived state
  const isValid = selectedContact && amount && parseFloat(amount) > 0 && description.trim().length > 0;

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardWillShow", () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardWillHide", () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // FAB Animation - slide up when valid
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (isValid) {
      Animated.parallel([
        Animated.spring(fabAnim, {
          toValue: 1,
          damping: 15,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.spring(fabScale, {
          toValue: 1,
          damping: 12,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fabAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isValid]);

  // Handle contact selection
  const handlePickContact = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      // Fallback: just focus the amount input for manual entry
      amountInputRef.current?.focus();
      return;
    }

    // Open native contact picker
    const contact = await Contacts.presentContactPickerAsync();

    if (contact) {
      const phone = contact.phoneNumbers?.[0]?.number;
      const email = contact.emails?.[0]?.email;

      // Construct name from firstName/lastName if name is not available
      const name = contact.name
        || [contact.firstName, contact.lastName].filter(Boolean).join(" ")
        || "Unknown";

      setSelectedContact({
        name,
        phone,
        email,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Auto-focus amount input after selection
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 300);
    }
  };

  // Handle amount change - format as currency
  const handleAmountChange = (text: string) => {
    // Remove non-numeric characters except decimal
    const cleaned = text.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = cleaned.split(".");
    if (parts.length > 2) return;

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) return;

    setAmount(cleaned);
  };

  // Handle send
  const handleSend = () => {
    if (!isValid || !selectedContact) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const dueDate = getDueDateFromTerm(dueTerm);

    setPendingInvoice({
      clientName: selectedContact.name,
      clientPhone: selectedContact.phone,
      clientEmail: selectedContact.email,
      items: [
        {
          description: description.trim(),
          price: Math.round(parseFloat(amount) * 100), // Convert to cents
          quantity: 1,
          originalTranscriptSegment: "Manual Entry",
        },
      ],
      detectedLanguage: "en",
      confidence: 1.0,
      notes: "Quick Invoice",
      dueDate: dueDate.toISOString(),
    });

    router.push("/invoice/preview");
  };

  // Close screen
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Dismiss keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
          {/* ═══════════════════════════════════════════════════════════
              HEADER
          ═══════════════════════════════════════════════════════════ */}
          <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={12}>
            <X size={24} color={colors.text} strokeWidth={2} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>New Invoice</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ═══════════════════════════════════════════════════════════
            THE "WHO" - Contact Selection
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.whoSection}>
          {!selectedContact ? (
            <Pressable onPress={handlePickContact} style={styles.addClientButton}>
              <View
                style={[
                  styles.addClientCircle,
                  {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + "08",
                  },
                ]}
              >
                <UserPlus size={32} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={[styles.addClientText, { color: colors.primary }]}>
                Add Client
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={handlePickContact} style={styles.selectedClientContainer}>
              <MonogramAvatar name={selectedContact.name} size={72} />
              <Text style={[styles.selectedClientName, { color: colors.text }]}>
                {selectedContact.name}
              </Text>
              <View style={[styles.changeClientBadge, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.changeClientText, { color: colors.primary }]}>
                  Change
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* ═══════════════════════════════════════════════════════════
            THE "HOW MUCH" - Premium Calculator Amount Input
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.amountSection}>
          <AutoResizingInput
            ref={amountInputRef}
            value={amount}
            onChangeText={handleAmountChange}
            currencySymbol="$"
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            returnKeyType="next"
            onSubmitEditing={() => descriptionInputRef.current?.focus()}
            maxLength={10}
          />

          {/* Subtle underline */}
          <View style={[styles.amountUnderline, { backgroundColor: colors.border }]} />
        </View>

        {/* ═══════════════════════════════════════════════════════════
            THE "WHAT" - Description Input
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.whatSection}>
          <TextInput
            ref={descriptionInputRef}
            style={[styles.descriptionInput, { color: colors.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="What is this for?"
            placeholderTextColor={colors.textTertiary}
            returnKeyType="done"
            onSubmitEditing={() => {
              Keyboard.dismiss();
              if (isValid) handleSend();
            }}
            maxLength={100}
            selectionColor={colors.primary}
          />
        </View>

        {/* ═══════════════════════════════════════════════════════════
            THE "WHEN" - Quick-Term Due Date Selector
        ═══════════════════════════════════════════════════════════ */}
        <View style={styles.dueDateSection}>
          <Text style={[styles.dueDateLabel, { color: colors.textTertiary }]}>
            Due Date
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dueTermScrollContent}
          >
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
                    styles.dueTermChip,
                    isActive
                      ? [
                          styles.dueTermChipActive,
                          { backgroundColor: colors.primary },
                        ]
                      : { backgroundColor: colors.backgroundSecondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.dueTermText,
                      isActive
                        ? styles.dueTermTextActive
                        : { color: colors.textSecondary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* ═══════════════════════════════════════════════════════════
            QUICK SUGGESTIONS (Optional UX Enhancement)
        ═══════════════════════════════════════════════════════════ */}
        {!description && selectedContact && (
          <View style={styles.suggestionsRow}>
            {["Repair Work", "Installation", "Consultation", "Materials"].map((suggestion) => (
              <Pressable
                key={suggestion}
                onPress={() => {
                  Haptics.selectionAsync();
                  setDescription(suggestion);
                }}
                style={[styles.suggestionChip, { backgroundColor: colors.backgroundSecondary }]}
              >
                <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                  {suggestion}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* ═══════════════════════════════════════════════════════════
          THE "SEND" FAB - Slides up when valid
      ═══════════════════════════════════════════════════════════ */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            opacity: fabAnim,
            transform: [
              {
                translateY: fabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
              { scale: fabScale },
            ],
            bottom: isKeyboardVisible ? 20 : 40,
          },
        ]}
        pointerEvents={isValid ? "auto" : "none"}
      >
        <Pressable
          onPress={handleSend}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.primary },
            pressed && styles.fabPressed,
          ]}
        >
          <ArrowRight size={28} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>

        <Text style={[styles.fabLabel, { color: colors.textTertiary }]}>
          Preview Invoice
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
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

  // Who Section - Contact Selection
  whoSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  addClientButton: {
    alignItems: "center",
  },
  addClientCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  addClientText: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  selectedClientContainer: {
    alignItems: "center",
  },
  selectedClientName: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginTop: 12,
    marginBottom: 8,
  },
  changeClientBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  changeClientText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Amount Section
  amountSection: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  amountUnderline: {
    width: 120,
    height: 2,
    marginTop: 8,
    borderRadius: 1,
    opacity: 0.3,
  },

  // What Section - Description
  whatSection: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  descriptionInput: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: -0.4,
    paddingVertical: 12,
  },

  // Due Date Section - Quick-Term Selector
  dueDateSection: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  dueDateLabel: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.08,
  },
  dueTermScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  dueTermChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
  },
  dueTermChipActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dueTermText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.24,
  },
  dueTermTextActive: {
    color: "#FFFFFF",
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Suggestions
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: "500",
  },

  // FAB
  fabContainer: {
    position: "absolute",
    right: 24,
    alignItems: "center",
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  fabLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
});
