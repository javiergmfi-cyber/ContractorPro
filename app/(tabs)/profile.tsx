import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { useProfileStore } from "../../store/useProfileStore";
import { useTheme, typography, spacing, radius } from "../../lib/theme";

export default function Profile() {
  const { colors, isDark } = useTheme();
  const { profile, updateProfile } = useProfileStore();

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateProfile({ logoUrl: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Your profile has been updated.");
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Logo */}
        <Pressable onPress={pickImage} style={styles.logoContainer}>
          {profile.logoUrl ? (
            <Image source={{ uri: profile.logoUrl }} style={styles.logoImage} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Camera size={24} color={colors.textTertiary} />
            </View>
          )}
          <Text style={styles.logoHint}>
            {profile.logoUrl ? "Change logo" : "Add logo"}
          </Text>
        </Pressable>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name</Text>
            <TextInput
              style={styles.input}
              value={profile.businessName}
              onChangeText={(text) => updateProfile({ businessName: text })}
              placeholder="Your Business Name"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              style={styles.input}
              value={profile.ownerName}
              onChangeText={(text) => updateProfile({ ownerName: text })}
              placeholder="Your Full Name"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={(text) => updateProfile({ email: text })}
              placeholder="email@example.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => updateProfile({ phone: text })}
              placeholder="(555) 123-4567"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={profile.address}
              onChangeText={(text) => updateProfile({ address: text })}
              placeholder="123 Main St, City, State 12345"
              placeholderTextColor={colors.textTertiary}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tax Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={profile.taxRate?.toString() || "0"}
              onChangeText={(text) => updateProfile({ taxRate: parseFloat(text) || 0 })}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
          onPress={handleSave}
        >
          <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 120,
    },
    header: {
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    title: {
      ...typography.largeTitle,
      color: colors.text,
    },
    // Logo
    logoContainer: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    logoImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    logoPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    logoHint: {
      ...typography.caption1,
      color: colors.textTertiary,
      marginTop: spacing.sm,
    },
    // Form
    form: {
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    inputGroup: {},
    label: {
      ...typography.caption1,
      color: colors.textTertiary,
      marginBottom: spacing.xs,
      fontWeight: "500",
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      ...typography.body,
      color: colors.text,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    // Save
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: radius.full,
      gap: spacing.sm,
    },
    saveButtonPressed: {
      opacity: 0.8,
    },
    saveButtonText: {
      ...typography.headline,
      color: "#FFFFFF",
    },
  });
