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
  TouchableOpacity,
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
  Eye,
  Banknote,
  RotateCcw,
  Home,
  DoorOpen,
  Layers,
  TreePine,
  Square,
  CircleDot,
  Scan,
  Package,
  Sparkles,
  Waves,
  Box,
  LayoutGrid,
  Wind,
  KeyRound,
  Sun,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { useProfileStore } from "@/store/useProfileStore";
import { useReminderStore } from "@/store/useReminderStore";
import { useOfflineStore } from "@/store/useOfflineStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useTutorialStore } from "@/store/useTutorialStore";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/Button";

// Trade options - Painter first (highest volume solo operators, tight community)
const TRADE_CATEGORIES = [
  {
    title: "General",
    trades: [
      { id: "carpenter", name: "Carpenter", icon: Hammer, color: "#A2845E" },
      { id: "general", name: "General Contractor", icon: HardHat, color: "#8E8E93" },
      { id: "handyman", name: "Handyman", icon: Wrench, color: "#34C759" },
    ],
  },
  {
    title: "Interior",
    trades: [
      { id: "appliance_repair", name: "Appliance Repair", icon: Settings, color: "#6C7A89" },
      { id: "cabinet_kitchen_bath", name: "Cabinet / Kitchen & Bath", icon: Package, color: "#D35400" },
      { id: "drywall", name: "Drywall", icon: Square, color: "#BDC3C7" },
      { id: "flooring", name: "Flooring", icon: Layers, color: "#8E44AD" },
      { id: "insulation", name: "Insulation", icon: Wind, color: "#E91E63" },
      { id: "painter", name: "Painter", icon: Paintbrush, color: "#AF52DE" },
      { id: "tile_stone", name: "Tile / Stone", icon: Grid3x3, color: "#5AC8FA" },
    ],
  },
  {
    title: "Exterior",
    trades: [
      { id: "concrete", name: "Concrete", icon: CircleDot, color: "#7F8C8D" },
      { id: "deck_builder", name: "Deck Builder", icon: LayoutGrid, color: "#A2845E" },
      { id: "fencing", name: "Fencing", icon: Scan, color: "#27AE60" },
      { id: "garage_door", name: "Garage Door", icon: Package, color: "#34495E" },
      { id: "gutters", name: "Gutters", icon: Box, color: "#1ABC9C" },
      { id: "landscaper", name: "Landscaper", icon: TreePine, color: "#2ECC71" },
      { id: "masonry", name: "Masonry", icon: Box, color: "#C0392B" },
      { id: "paver", name: "Paver", icon: Grid3x3, color: "#95A5A6" },
      { id: "pool_service", name: "Pool Service", icon: Waves, color: "#3498DB" },
      { id: "pressure_washing", name: "Pressure Washing", icon: Sparkles, color: "#00BCD4" },
      { id: "roofer", name: "Roofer", icon: Home, color: "#E74C3C" },
      { id: "siding", name: "Siding", icon: LayoutGrid, color: "#607D8B" },
      { id: "stucco", name: "Stucco", icon: CircleDot, color: "#F39C12" },
      { id: "windows_doors", name: "Windows / Doors", icon: DoorOpen, color: "#9B59B6" },
    ],
  },
  {
    title: "Mechanical & Specialty",
    trades: [
      { id: "electrician", name: "Electrician", icon: Zap, color: "#FF9500" },
      { id: "glass_glazier", name: "Glass / Glazier", icon: Square, color: "#00BCD4" },
      { id: "hvac", name: "HVAC", icon: Thermometer, color: "#FF3B30" },
      { id: "locksmith", name: "Locksmith", icon: KeyRound, color: "#FFD700" },
      { id: "plumber", name: "Plumber", icon: Droplet, color: "#007AFF" },
    ],
  },
  {
    title: "Other",
    trades: [
      { id: "other", name: "Other", icon: Wrench, color: "#636366" },
    ],
  },
];

// Flat list for lookups
const ALL_TRADES = TRADE_CATEGORIES.flatMap(cat => cat.trades);

// Standalone InputField component to prevent re-renders
const ProfileInputField = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType = "default",
  multiline = false,
  autoCapitalize = "sentences",
  labelStyle,
  inputStyle,
  containerStyle,
  placeholderTextColor,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "decimal-pad";
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  labelStyle?: any;
  inputStyle?: any;
  containerStyle?: any;
  placeholderTextColor?: string;
}) => (
  <View style={containerStyle}>
    <Text style={labelStyle}>{label}</Text>
    <TextInput
      style={inputStyle}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      keyboardType={keyboardType}
      multiline={multiline}
      autoCapitalize={autoCapitalize}
    />
  </View>
);

/**
 * Profile Screen
 * Per design-system.md - includes Stripe status and reminder settings
 */

export default function Profile() {
  const router = useRouter();
  const { colors, typography, spacing, radius, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, fetchProfile } = useProfileStore();
  const { resetTutorial } = useTutorialStore();
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
  const [taxRateFocused, setTaxRateFocused] = useState(false);

  // Local form state for smooth typing
  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [taxRate, setTaxRate] = useState("");

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

  // Sync local form state with profile data
  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || "");
      setFullName(profile.full_name || "");
      setTaxRate(profile.tax_rate?.toString() || "0");
    }
  }, [profile]);

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

  const currentTrade = ALL_TRADES.find((t) => t.id === profile?.trade);
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

  const handleReplayTutorial = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (user) {
      resetTutorial(user.id);
      // Navigate to trigger tutorial (it will show on next render)
      router.replace("/(tabs)");
    }
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const stripeConnected = profile?.charges_enabled && profile?.payouts_enabled;
  const totalPending = pendingUploads + pendingOperations;

  const styles = createStyles(colors, isDark, spacing, radius, typography);

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

        {/* Stripe Urgency Banner - Only show if not connected */}
        {!stripeConnected && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Pressable
              onPress={() => router.push("/stripe/onboarding")}
              style={[styles.stripeUrgencyBanner, { backgroundColor: colors.primary + "12" }]}
            >
              <View style={[styles.stripeUrgencyIcon, { backgroundColor: colors.primary + "20" }]}>
                <CreditCard size={24} color={colors.primary} />
              </View>
              <View style={styles.stripeUrgencyContent}>
                <Text style={[styles.stripeUrgencyTitle, { color: colors.text }]}>
                  Accept card payments
                </Text>
                <Text style={[styles.stripeUrgencySubtitle, { color: colors.textSecondary }]}>
                  Connect Stripe to get paid by Apple Pay & card.
                </Text>
              </View>
              <View style={[styles.stripeUrgencyButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.stripeUrgencyButtonText}>Connect</Text>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* ========== LOOK PROFESSIONAL ========== */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Look Professional</Text>
          <View style={styles.settingsCard}>
            <Pressable
              onPress={pickImage}
              style={[styles.settingRow, { paddingVertical: 16 }]}
            >
              <View style={styles.iconWithBadge}>
                {!isPro && (
                  <View style={[styles.proPillSmall, styles.proPillAbsolute, { backgroundColor: colors.systemOrange + "15" }]}>
                    <Crown size={10} color={colors.systemOrange} />
                    <Text style={[styles.proPillText, { color: colors.systemOrange }]}>PRO</Text>
                  </View>
                )}
                {profile?.logo_url ? (
                  <Image source={{ uri: profile.logo_url }} style={styles.brandingLogoSmall} />
                ) : (
                  <View style={[styles.settingIcon, { backgroundColor: "#AF52DE" + "15" }]}>
                    <Building2 size={20} color="#AF52DE" />
                  </View>
                )}
              </View>
              <View style={styles.settingContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>
                  Custom Logo
                </Text>
                <Text style={[typography.caption1, { color: colors.textTertiary, marginTop: 4, lineHeight: 18 }]}>
                  {isPro
                    ? "Tap to upload your business logo"
                    : "Your logo on every invoice. Look professional, win more jobs."}
                </Text>
              </View>
              {isPro ? (
                <Camera size={20} color={colors.primary} />
              ) : (
                <ChevronRight size={20} color={colors.textTertiary} />
              )}
            </Pressable>
          </View>
        </Animated.View>

        {/* Business Info Form */}
        <Animated.View
          style={[
            styles.formSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <ProfileInputField
            label="Business Name"
            value={businessName}
            onChangeText={setBusinessName}
            onBlur={() => businessName !== profile?.business_name && updateProfile({ business_name: businessName })}
            placeholder="Your Business Name"
            autoCapitalize="words"
            containerStyle={styles.inputContainer}
            labelStyle={styles.inputLabel}
            inputStyle={styles.input}
            placeholderTextColor={colors.textTertiary}
          />

          <ProfileInputField
            label="Owner Name"
            value={fullName}
            onChangeText={setFullName}
            onBlur={() => fullName !== profile?.full_name && updateProfile({ full_name: fullName })}
            placeholder="Your Full Name"
            autoCapitalize="words"
            containerStyle={styles.inputContainer}
            labelStyle={styles.inputLabel}
            inputStyle={styles.input}
            placeholderTextColor={colors.textTertiary}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tax Rate</Text>
            <View style={styles.inputWithSuffix}>
              <TextInput
                style={[styles.input, styles.inputWithSuffixField]}
                value={taxRate}
                onChangeText={setTaxRate}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                onFocus={() => setTaxRateFocused(true)}
                onBlur={() => {
                  setTaxRateFocused(false);
                  const newRate = parseFloat(taxRate) || 0;
                  if (newRate !== profile?.tax_rate) {
                    updateProfile({ tax_rate: newRate });
                  }
                }}
              />
              {!taxRateFocused && (
                <Text style={[styles.inputSuffix, { color: colors.textTertiary }]}>%</Text>
              )}
            </View>
          </View>

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

        {/* ========== GET PAID FASTER ========== */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Get Paid Faster</Text>

          {/* Payment Collection Card */}
          <View style={styles.settingsCard}>
            <Pressable
              onPress={() => !isPro && router.push("/paywall?trigger=reminder_fatigue")}
              style={[styles.settingRow, { paddingVertical: 16 }]}
            >
              <View style={styles.iconWithBadge}>
                {!isPro && (
                  <View style={[styles.proPillSmall, styles.proPillAbsolute, { backgroundColor: colors.systemOrange + "15" }]}>
                    <Crown size={10} color={colors.systemOrange} />
                    <Text style={[styles.proPillText, { color: colors.systemOrange }]}>PRO</Text>
                  </View>
                )}
                <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Bell size={20} color={colors.primary} />
                </View>
              </View>
              <View style={styles.settingContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>
                  Auto-Chase Reminders
                </Text>
                <Text style={[typography.caption1, { color: colors.textTertiary, marginTop: 4, lineHeight: 18 }]}>
                  {isPro
                    ? "Polite follow-ups until paid. Stops automatically."
                    : "Polite follow-ups until paid. You do nothing."}
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

            {/* Read Receipts Row */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => !isPro && router.push("/paywall?trigger=read_receipts")}
              style={[styles.settingRow, { paddingVertical: 16 }]}
            >
              <View style={styles.iconWithBadge}>
                {!isPro && (
                  <View style={[styles.proPillSmall, styles.proPillAbsolute, { backgroundColor: colors.systemOrange + "15" }]}>
                    <Crown size={10} color={colors.systemOrange} />
                    <Text style={[styles.proPillText, { color: colors.systemOrange }]}>PRO</Text>
                  </View>
                )}
                <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
                  <Eye size={20} color={colors.primary} />
                </View>
              </View>
              <View style={styles.settingContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>
                  Read Receipts
                </Text>
                <Text style={[typography.caption1, { color: colors.textTertiary, marginTop: 4, lineHeight: 18 }]}>
                  {isPro
                    ? "See when clients view your invoices"
                    : "Know the moment your client opens your invoice. No more guessing."}
                </Text>
              </View>
              {isPro ? (
                <Switch
                  value={true}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              ) : (
                <ChevronRight size={20} color={colors.textTertiary} />
              )}
            </Pressable>

            {/* Instant Payouts Row */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => !isPro && router.push("/paywall?trigger=instant_payouts")}
              style={[styles.settingRow, { paddingVertical: 16 }]}
            >
              <View style={styles.iconWithBadge}>
                {!isPro && (
                  <View style={[styles.proPillSmall, styles.proPillAbsolute, { backgroundColor: colors.systemOrange + "15" }]}>
                    <Crown size={10} color={colors.systemOrange} />
                    <Text style={[styles.proPillText, { color: colors.systemOrange }]}>PRO</Text>
                  </View>
                )}
                <View style={[styles.settingIcon, { backgroundColor: "#34C759" + "15" }]}>
                  <Banknote size={20} color="#34C759" />
                </View>
              </View>
              <View style={styles.settingContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>
                  Instant Payouts
                </Text>
                <Text style={[typography.caption1, { color: colors.textTertiary, marginTop: 4, lineHeight: 18 }]}>
                  {isPro
                    ? "Get paid in 24 hours"
                    : "Get your money in 24 hours, not 3 days. Stop waiting."}
                </Text>
              </View>
              {isPro ? (
                <View style={[styles.badge, { backgroundColor: "#34C759" + "20" }]}>
                  <Text style={[typography.caption2, { color: "#34C759", fontWeight: "600" }]}>
                    Active
                  </Text>
                </View>
              ) : (
                <ChevronRight size={20} color={colors.textTertiary} />
              )}
            </Pressable>
          </View>
        </Animated.View>

        {/* ========== TAXES MADE SIMPLE ========== */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>Taxes Made Simple</Text>
          <View style={styles.settingsCard}>
            <Pressable
              onPress={() => router.push("/export")}
              style={[styles.settingRow, { paddingVertical: 16 }]}
            >
              <View style={styles.iconWithBadge}>
                {!isPro && (
                  <View style={[styles.proPillSmall, styles.proPillAbsolute, { backgroundColor: colors.systemOrange + "15" }]}>
                    <Crown size={10} color={colors.systemOrange} />
                    <Text style={[styles.proPillText, { color: colors.systemOrange }]}>PRO</Text>
                  </View>
                )}
                <View style={[styles.settingIcon, { backgroundColor: "#34C759" + "15" }]}>
                  <Download size={20} color="#34C759" />
                </View>
              </View>
              <View style={styles.settingContent}>
                <Text style={[typography.body, { color: colors.text, fontWeight: "600" }]}>
                  Export for QuickBooks
                </Text>
                <Text style={[typography.caption1, { color: colors.textTertiary, marginTop: 4, lineHeight: 18 }]}>
                  {isPro
                    ? "Download CSV/IIF for your accountant"
                    : "Export invoices for tax time. QuickBooks, Wave, Excel ready."}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </Pressable>
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
          </View>
        </Animated.View>

        {/* Support Section */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              icon={<RotateCcw size={20} color={colors.primary} />}
              title="Replay Tutorial"
              subtitle="Review the app walkthrough"
              rightElement={<ChevronRight size={20} color={colors.textTertiary} />}
              onPress={handleReplayTutorial}
            />
          </View>
        </Animated.View>

        {/* Log Out Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            style={{
              backgroundColor: "#E5E5EA",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#FF3B30" }}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: spacing.xl }} />
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

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[typography.footnote, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
              Select your profession to personalize your experience
            </Text>

            {TRADE_CATEGORIES.map((category) => (
              <View key={category.title} style={{ marginBottom: spacing.lg }}>
                <Text style={[typography.caption1, { color: colors.textTertiary, marginBottom: spacing.sm, marginLeft: 4, fontWeight: "600", letterSpacing: 0.5 }]}>
                  {category.title.toUpperCase()}
                </Text>
                {category.trades.map((trade) => {
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
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
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
    // Stripe Urgency Banner
    stripeUrgencyBanner: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderRadius: radius.lg,
      gap: spacing.sm,
    },
    stripeUrgencyIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    stripeUrgencyContent: {
      flex: 1,
    },
    stripeUrgencyTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    stripeUrgencySubtitle: {
      fontSize: 13,
      fontWeight: "400",
      lineHeight: 18,
    },
    stripeUrgencyButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    stripeUrgencyButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
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
      marginTop: spacing.lg,
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
    inputWithSuffix: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputWithSuffixField: {
      flex: 1,
      borderWidth: 0,
      backgroundColor: "transparent",
    },
    inputSuffix: {
      paddingRight: spacing.md,
      fontSize: 17,
      fontWeight: "400",
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
    proPillAbsolute: {
      position: "absolute",
      top: -8,
      left: -8,
      zIndex: 1,
    },
    proPillText: {
      fontSize: 10,
      fontWeight: "700",
    },
    iconWithBadge: {
      position: "relative",
    },
    brandingLogoSmall: {
      width: 36,
      height: 36,
      borderRadius: 10,
      marginRight: spacing.sm,
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
    logoutButton: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 12,
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
