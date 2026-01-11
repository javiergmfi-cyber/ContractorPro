import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { LogoUploader } from "../../components/LogoUploader";
import { useProfileStore } from "../../store/useProfileStore";
import * as Haptics from "expo-haptics";

export default function Profile() {
  const { profile, updateProfile } = useProfileStore();

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Your profile has been updated.");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 pt-4 mb-6">
          <Text className="text-3xl font-bold">Profile</Text>
          <Text className="text-gray-500 mt-1">Business information</Text>
        </View>

        <View className="px-6">
          <LogoUploader
            logoUrl={profile.logoUrl}
            onLogoChange={(uri) => updateProfile({ logoUrl: uri })}
          />

          <Input
            label="Business Name"
            value={profile.businessName}
            onChangeText={(text) => updateProfile({ businessName: text })}
            placeholder="Your Business Name"
          />

          <Input
            label="Owner Name"
            value={profile.ownerName}
            onChangeText={(text) => updateProfile({ ownerName: text })}
            placeholder="Your Name"
          />

          <Input
            label="Email"
            value={profile.email}
            onChangeText={(text) => updateProfile({ email: text })}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone"
            value={profile.phone}
            onChangeText={(text) => updateProfile({ phone: text })}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
          />

          <Input
            label="Business Address"
            value={profile.address}
            onChangeText={(text) => updateProfile({ address: text })}
            placeholder="123 Main St, City, State"
            multiline
            numberOfLines={2}
          />

          <Input
            label="Tax Rate (%)"
            value={profile.taxRate?.toString() || "0"}
            onChangeText={(text) =>
              updateProfile({ taxRate: parseFloat(text) || 0 })
            }
            placeholder="0"
            keyboardType="decimal-pad"
          />

          <View className="mt-4">
            <Button title="Save Profile" onPress={handleSave} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
