import { View, Text, ScrollView, StyleSheet, TextInput, Pressable, Animated, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef, useEffect } from "react";
import { Camera, Check, Building2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { useProfileStore } from "../../store/useProfileStore";
import { useTheme, typography, spacing, radius } from "../../lib/theme";

export default function Profile() {
  const { colors, isDark } = useTheme();
  const { profile, updateProfile } = useProfileStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Business information</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable onPress={pickImage} style={styles.logoContainer}>
            {profile.logoUrl ? (
              <Image source={{ uri: profile.logoUrl }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Building2 size={32} color={colors.textTertiary} />
              </View>
            )}
            <View style={styles.cameraButton}>
              <Camera size={16} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text style={styles.logoHint}>Tap to add logo</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.formSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <InputField
            label="Business Name"
            value={profile.businessName}
            onChangeText={(text) => updateProfile({ businessName: text })}
            placeholder="Your Business Name"
            autoCapitalize="words"
          />

          <InputField
            label="Owner Name"
            value={profile.ownerName}
            onChangeText={(text) => updateProfile({ ownerName: text })}
            placeholder="Your Full Name"
            autoCapitalize="words"
          />

          <InputField
            label="Email"
            value={profile.email}
            onChangeText={(text) => updateProfile({ email: text })}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="Phone"
            value={profile.phone}
            onChangeText={(text) => updateProfile({ phone: text })}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
          />

          <InputField
            label="Business Address"
            value={profile.address}
            onChangeText={(text) => updateProfile({ address: text })}
            placeholder="123 Main St, City, State 12345"
            multiline
          />

          <InputField
            label="Tax Rate (%)"
            value={profile.taxRate?.toString() || "0"}
            onChangeText={(text) => updateProfile({ taxRate: parseFloat(text) || 0 })}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.saveButtonContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
          >
            <Check size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </Pressable>
        </Animated.View>
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
    saveButtonContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
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
  });
