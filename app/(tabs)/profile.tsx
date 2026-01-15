import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  Alert,
  Switch,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Camera,
  Check,
  Building2,
  Bell,
  Mail,
  MessageSquare,
  CreditCard,
  ChevronRight,
  Settings,
  Clock,
  Edit3,
  Download,
  Cloud,
  CloudOff,
  RefreshCw,
  Lock,
  Crown,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Thermometer,
  HardHat,
  Droplet,
  Grid3x3,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { useProfileStore } from "@/store/useProfileStore";
import { useReminderStore } from "@/store/useReminderStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";

// Trade options
const TRADES = [
  { id: "plumber", name: "Plumber", icon: Droplet, color: "#007AFF" },
  { id: "electrician", name: "Electrician", icon: Zap, color: "#FF9500" },
  { id: "painter", name: "Painter", icon: Paintbrush, color: "#AF52DE" },
  { id: "handyman", name: "Handyman", icon: Wrench, color: "#34C759" },
  { id: "hvac", name: "HVAC", icon: Thermometer, color: "#FF3B30" },
  { id: "tile_stone", name: "Tile / Stone", icon: Grid3x3, color: "#5AC8FA" },
  { id: "general", name: "General Contractor", icon: HardHat, color: "#8E8E93" },
  { id: "carpenter", name: "Carpenter", icon: Hammer, color: "#A2845E" },
  { id: "other", name: "Other", icon: Wrench, color: "#636366" },
];

/**
 * Profile Screen
 * Per design-system.md - includes Stripe status and reminder settings
 */

export default function Profile() {
  const router = useRouter();
  const { colors, typography, spacing, radius, isDark } = useTheme();
  const { profile, updateProfile, fetchProfile, isSaving } = useProfileStore();
  const {
    settings: reminderSettings,
    fetchSettings: fetchReminderSettings,
    toggleEnabled,
    toggleSMS,
    toggleEmail,
    setDayIntervals,
    setMessageTemplate,
    isSaving: isSavingReminders,
  } = useReminderStore();
  const {
    isOnline,
    isSyncing,
    pendingUploads,
    pendingOperations,
    syncNow,
    initialize: initOffline,
  } = useOfflineStore();
  const { isPro, canUseBadCopAutopilot } = useSubscriptionStore();

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [templateText, setTemplateText] = useState("");
  const [showTradeModal, setShowTradeModal] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchProfile();
    fetchReminderSettings();
    initOffline();

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

  useEffect(() => {
    if (reminderSettings?.message_template) {
      setTemplateText(reminderSettings.message_template);
    }
  }, [reminderSettings]);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if user has Pro for custom branding
    if (!isPro) {
      router.push("/paywall?trigger=branding");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateProfile({ logo_url: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Your profile has been updated.");
  };

  const handleTradeSelect = async (tradeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await updateProfile({ trade: tradeId });
      setShowTradeModal(false);
    } catch (error) {
      console.error("Error saving trade:", error);
      Alert.alert("Error", "Failed to save trade selection");
    }
  };

  const currentTrade = TRADES.find((t) => t.id === profile?.trade);
  const TradeIcon = currentTrade?.icon || Wrench;

  const handleToggleReminders = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check if trying to enable without Pro subscription
    if (!reminderSettings?.enabled && !canUseBadCopAutopilot()) {
      // Navigate to paywall with context
      router.push("/paywall?trigger=reminder_fatigue");
      return;
    }

    try {
      await toggleEnabled();
    } catch (error) {
      Alert.alert("Error", "Failed to update reminder settings");
    }
  };

  const handleToggleSMS = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await toggleSMS();
    } catch (error) {
      Alert.alert("Error", "Failed to update SMS settings");
    }
  };

  const handleToggleEmail = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await toggleEmail();
    } catch (error) {
      Alert.alert("Error", "Failed to update email settings");
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await setMessageTemplate(templateText);
      setEditingTemplate(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to save template");
    }
  };

  const handleDayIntervalToggle = async (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentIntervals = reminderSettings?.day_intervals || [3, 7, 14];
    let newIntervals: number[];

    if (currentIntervals.includes(day)) {
      newIntervals = currentIntervals.filter((d) => d !== day);
    } else {
      newIntervals = [...currentIntervals, day].sort((a, b) => a - b);
    }

    if (newIntervals.length === 0) {
      Alert.alert("Error", "You must have at least one reminder interval");
      return;
    }

    try {
      await setDayIntervals(newIntervals);
    } catch (error) {
      Alert.alert("Error", "Failed to update intervals");
    }
  };

  const handleSync = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await syncNow();
      if (result.uploads > 0 || result.operations > 0) {
        Alert.alert(
          "Sync Complete",
          `Synced ${result.uploads} uploads and ${result.operations} operations`
        );
      } else if (result.errors > 0) {
        Alert.alert("Sync Issue", `${result.errors} items failed to sync`);
      } else {
        Alert.alert("All Synced", "Everything is up to date");
      }
    } catch (error) {
      Alert.alert("Sync Failed", "Failed to sync data");
    }
  };

  const stripeConnected = profile?.charges_enabled && profile?.payouts_enabled;
  const totalPending = pendingUploads + pendingOperations;

  const styles = createStyles(colors, isDark, spacing, radius, typography);

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    multiline = false,
    autoCapitalize = "sentences",
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: "default" | "email-address" | "phone-pad" | "decimal-pad";
    multiline?: boolean;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );

  const SettingRow = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Pressable
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[typography.body, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[typography.caption1, { color: colors.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Business information</Text>
        </Animated.View>

        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable onPress={pickImage} style={styles.logoContainer}>
            {profile?.logo_url ? (
              <Image source={{ uri: profile.logo_url }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Building2 size={32} color={colors.textTertiary} />
              </View>
            )}
            <View style={[styles.cameraButton, { backgroundColor: isPro ? colors.primary : colors.systemOrange }]}>
              {isPro ? (
                <Camera size={16} color="#FFFFFF" />
              ) : (
                <Lock size={14} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
          <Text style={styles.logoHint}>
            {isPro ? "Tap to add logo" : "Pro feature • Tap to upgrade"}
          </Text>
        </Animated.View>

        {/* Business Info Form */}
        <Animated.View
          style={[
            styles.formSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <InputField
            label="Business Name"
            value={profile?.business_name || ""}
            onChangeText={(text) => updateProfile({ business_name: text })}
            placeholder="Your Business Name"
            autoCapitalize="words"
          />

          <InputField
            label="Owner Name"
            value={profile?.full_name || ""}
            onChangeText={(text) => updateProfile({ full_name: text })}
            placeholder="Your Full Name"
            autoCapitalize="words"
          />

          <InputField
            label="Tax Rate (%)"
            value={profile?.tax_rate?.toString() || "0"}
            onChangeText={(text) => updateProfile({ tax_rate: parseFloat(text) || 0 })}
            placeholder="0"
            keyboardType="decimal-pad"
          />

          {/* Trade Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Trade</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowTradeModal(true);
              }}
              style={[
                styles.tradeSelectRow,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.tradeIconSmall,
                  { backgroundColor: (currentTrade?.color || colors.primary) + "15" },
                ]}
              >
                <TradeIcon size={18} color={currentTrade?.color || colors.primary} />
              </View>
              <Text style={[styles.tradeSelectText, { color: colors.text }]}>
                {currentTrade?.name || "Select your trade"}
              </Text>
              <ChevronRight size={18} color={colors.textTertiary} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Stripe Connect Section */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Payments</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon={<CreditCard size={20} color={colors.primary} />}
              title="Stripe Connect"
              subtitle={
                stripeConnected
                  ? "Connected - accepting payments"
                  : "Connect to accept card payments"
              }
              rightElement={
                stripeConnected ? (
                  <View style={[styles.badge, { backgroundColor: colors.statusPaid + "20" }]}>
                    <Text style={[typography.caption2, { color: colors.statusPaid, fontWeight: "600" }]}>
                      Active
                    </Text>
                  </View>
                ) : (
                  <ChevronRight size={20} color={colors.textTertiary} />
                )
              }
              onPress={() => router.push("/stripe/onboarding")}
            />
          </View>
        </Animated.View>

        {/* Auto-Reminders Section ("Bad Cop") */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Payment Collection</Text>

          {/* Payment Collection Card */}
          <View style={styles.settingsCard}>
            <Pressable
              onPress={() => !isPro && router.push("/paywall?trigger=reminder_fatigue")}
              style={styles.settingRow}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
                <Bell size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <View style={styles.settingTitleRow}>
                  <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>
                    Auto-Chase Unpaid Invoices
                  </Text>
                  {!isPro && (
                    <View style={[styles.proPillSmall, { backgroundColor: colors.systemOrange + "15" }]}>
                      <Crown size={10} color={colors.systemOrange} />
                      <Text style={[styles.proPillText, { color: colors.systemOrange }]}>PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={[typography.caption1, { color: colors.textTertiary, marginTop: 2 }]}>
                  {isPro ? "We text & email clients who haven't paid" : "We chase payments so you don't have to"}
                </Text>
              </View>
              {isPro ? (
                <Switch
                  value={reminderSettings?.enabled || false}
                  onValueChange={handleToggleReminders}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              ) : (
                <ChevronRight size={20} color={colors.textTertiary} />
              )}
            </Pressable>
          {isPro && reminderSettings?.enabled && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <SettingRow
                  icon={<MessageSquare size={20} color={colors.primary} />}
                  title="SMS Reminders"
                  subtitle="Send text message reminders"
                  rightElement={
                    <Switch
                      value={reminderSettings?.sms_enabled || false}
                      onValueChange={handleToggleSMS}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  }
                />

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <SettingRow
                  icon={<Mail size={20} color={colors.primary} />}
                  title="Email Reminders"
                  subtitle="Send email reminders"
                  rightElement={
                    <Switch
                      value={reminderSettings?.email_enabled || false}
                      onValueChange={handleToggleEmail}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  }
                />

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <SettingRow
                  icon={<Clock size={20} color={colors.primary} />}
                  title="Reminder Schedule"
                  subtitle="Configure when reminders are sent"
                  rightElement={<ChevronRight size={20} color={colors.textTertiary} />}
                  onPress={() => setShowReminderModal(true)}
                />

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <SettingRow
                  icon={<Edit3 size={20} color={colors.primary} />}
                  title="Message Template"
                  subtitle="Customize reminder message"
                  rightElement={<ChevronRight size={20} color={colors.textTertiary} />}
                  onPress={() => setEditingTemplate(true)}
                />
              </>
            )}
          </View>
        </Animated.View>

        {/* Data & Sync Section */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Data & Sync</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon={
                isOnline ? (
                  <Cloud size={20} color={colors.primary} />
                ) : (
                  <CloudOff size={20} color={colors.statusOverdue} />
                )
              }
              title={isOnline ? "Online" : "Offline"}
              subtitle={
                totalPending > 0
                  ? `${totalPending} item${totalPending !== 1 ? "s" : ""} pending sync`
                  : "All data synced"
              }
              rightElement={
                isOnline && totalPending > 0 ? (
                  <Pressable
                    style={[styles.syncButton, { backgroundColor: colors.primary }]}
                    onPress={handleSync}
                    disabled={isSyncing}
                  >
                    <RefreshCw
                      size={14}
                      color="#FFFFFF"
                      style={isSyncing ? { opacity: 0.5 } : undefined}
                    />
                    <Text style={styles.syncButtonText}>
                      {isSyncing ? "Syncing" : "Sync"}
                    </Text>
                  </Pressable>
                ) : (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isOnline
                          ? colors.statusPaid + "20"
                          : colors.statusOverdue + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption2,
                        {
                          color: isOnline ? colors.statusPaid : colors.statusOverdue,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {isOnline ? "Synced" : "Offline"}
                    </Text>
                  </View>
                )
              }
            />

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <SettingRow
              icon={<Download size={20} color={colors.primary} />}
              title="Export Data"
              subtitle="Export invoices for QuickBooks"
              rightElement={<ChevronRight size={20} color={colors.textTertiary} />}
              onPress={() => router.push("/export")}
            />
          </View>
        </Animated.View>

        {/* Save Button */}
        <Animated.View style={[styles.saveButtonContainer, { opacity: fadeAnim }]}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
          >
            <Check size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isSaving ? "Saving..." : "Save Profile"}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Reminder Schedule Modal */}
      <Modal
        visible={showReminderModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReminderModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowReminderModal(false)}>
              <Text style={[typography.body, { color: colors.primary }]}>Close</Text>
            </Pressable>
            <Text style={[typography.headline, { color: colors.text }]}>Reminder Schedule</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.modalContent}>
            <Text style={[typography.footnote, { color: colors.textSecondary, marginBottom: spacing.md }]}>
              Send reminders on these days after the due date:
            </Text>

            {[3, 7, 14, 21, 30].map((day) => (
              <Pressable
                key={day}
                style={[
                  styles.dayOption,
                  {
                    backgroundColor: (reminderSettings?.day_intervals || []).includes(day)
                      ? colors.primary + "15"
                      : colors.backgroundSecondary,
                    borderRadius: radius.md,
                  },
                ]}
                onPress={() => handleDayIntervalToggle(day)}
              >
                <Text style={[typography.body, { color: colors.text }]}>
                  {day} days overdue
                </Text>
                {(reminderSettings?.day_intervals || []).includes(day) && (
                  <Check size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}

            <Text style={[typography.caption1, { color: colors.textTertiary, marginTop: spacing.lg }]}>
              Reminders are sent automatically at 9 AM in your timezone
            </Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Message Template Modal */}
      <Modal
        visible={editingTemplate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingTemplate(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setEditingTemplate(false)}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Text style={[typography.headline, { color: colors.text }]}>Message Template</Text>
            <Pressable onPress={handleSaveTemplate}>
              <Text style={[typography.body, { color: colors.primary, fontWeight: "600" }]}>
                Save
              </Text>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Text style={[typography.footnote, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              Available variables:
            </Text>
            <Text style={[typography.caption1, { color: colors.textTertiary, marginBottom: spacing.md }]}>
              {"{{invoice_number}}, {{business_name}}, {{total}}, {{days_overdue}}, {{payment_link}}"}
            </Text>

            <TextInput
              style={[
                styles.templateInput,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderRadius: radius.md,
                },
              ]}
              value={templateText}
              onChangeText={setTemplateText}
              multiline
              numberOfLines={6}
              placeholder="Enter your reminder message template..."
              placeholderTextColor={colors.textTertiary}
            />

            <View style={[styles.previewCard, { backgroundColor: colors.card, borderRadius: radius.md }]}>
              <Text style={[typography.caption1, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                Preview:
              </Text>
              <Text style={[typography.footnote, { color: colors.text, lineHeight: 20 }]}>
                {templateText
                  .replace(/\{\{invoice_number\}\}/g, "INV-0042")
                  .replace(/\{\{business_name\}\}/g, profile?.business_name || "Your Business")
                  .replace(/\{\{total\}\}/g, "$1,250")
                  .replace(/\{\{days_overdue\}\}/g, "7")
                  .replace(/\{\{payment_link\}\}/g, "https://pay.stripe.com/...")}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Trade Selection Modal */}
      <Modal
        visible={showTradeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTradeModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowTradeModal(false)}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Text style={[typography.headline, { color: colors.text }]}>Your Trade</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={styles.modalContent}>
            <Text style={[typography.footnote, { color: colors.textSecondary, marginBottom: spacing.md }]}>
              Select your profession to personalize your experience
            </Text>

            {TRADES.map((trade) => {
              const TradeIconComponent = trade.icon;
              const isSelected = profile?.trade === trade.id;

              return (
                <Pressable
                  key={trade.id}
                  style={[
                    styles.tradeOption,
                    {
                      backgroundColor: isSelected ? trade.color + "15" : colors.backgroundSecondary,
                      borderRadius: radius.md,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? trade.color : colors.border,
                    },
                  ]}
                  onPress={() => handleTradeSelect(trade.id)}
                >
                  <View style={[styles.tradeOptionIcon, { backgroundColor: trade.color + "20" }]}>
                    <TradeIconComponent size={22} color={trade.color} />
                  </View>
                  <Text
                    style={[
                      typography.body,
                      { color: isSelected ? trade.color : colors.text, flex: 1 },
                    ]}
                  >
                    {trade.name}
                  </Text>
                  {isSelected && <Check size={20} color={trade.color} />}
                </Pressable>
              );
            })}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean, spacing: any, radius: any, typography: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 120,
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
    subtitle: {
      ...typography.subhead,
      color: colors.textTertiary,
      marginTop: spacing.xs,
    },
    logoSection: {
      alignItems: "center",
      paddingVertical: spacing.lg,
    },
    logoContainer: {
      position: "relative",
    },
    logoImage: {
      width: 100,
      height: 100,
      borderRadius: radius.xl,
    },
    logoPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: radius.xl,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    cameraButton: {
      position: "absolute",
      bottom: -4,
      right: -4,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    logoHint: {
      ...typography.caption1,
      color: colors.textTertiary,
      marginTop: spacing.sm,
    },
    formSection: {
      paddingHorizontal: spacing.lg,
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    inputLabel: {
      ...typography.caption1,
      color: colors.textTertiary,
      marginBottom: spacing.sm,
      fontWeight: "500",
    },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      ...typography.body,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    section: {
      paddingHorizontal: spacing.lg,
      marginTop: spacing.lg,
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      ...typography.footnote,
      color: colors.textTertiary,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    proBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    unlockButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 4,
    },
    unlockButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "600",
    },
    settingsCard: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      overflow: "hidden",
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    settingContent: {
      flex: 1,
    },
    settingTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    proPillSmall: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      gap: 3,
    },
    proPillText: {
      fontSize: 10,
      fontWeight: "700",
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    syncButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 4,
    },
    syncButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "600",
    },
    divider: {
      height: 1,
      marginLeft: 56,
    },
    saveButtonContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.full,
      gap: spacing.sm,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    saveButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    saveButtonText: {
      ...typography.headline,
      color: "#FFFFFF",
    },
    // Modal Styles
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    modalContent: {
      padding: spacing.lg,
    },
    dayOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    templateInput: {
      padding: spacing.md,
      minHeight: 150,
      textAlignVertical: "top",
      ...typography.body,
    },
    previewCard: {
      padding: spacing.md,
      marginTop: spacing.md,
    },
    // Trade Selection Styles
    tradeSelectRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    tradeIconSmall: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    tradeSelectText: {
      flex: 1,
      ...typography.body,
    },
    tradeOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    tradeOptionIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    // Pro Upsell Card Styles
    proUpsellCard: {
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    proUpsellHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    proUpsellIconLarge: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    proUpsellBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    proUpsellContent: {
      padding: spacing.md,
      paddingTop: spacing.xs,
    },
    proUpsellTitle: {
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    proUpsellDescription: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      marginBottom: spacing.md,
    },
    proUpsellButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      gap: 4,
    },
    proUpsellButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
    },
  });
