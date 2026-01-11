import { View, Text, Image, Pressable } from "react-native";
import { Camera, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { COLORS } from "../lib/constants";

interface LogoUploaderProps {
  logoUrl?: string;
  onLogoChange: (uri: string | undefined) => void;
}

export function LogoUploader({ logoUrl, onLogoChange }: LogoUploaderProps) {
  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onLogoChange(result.assets[0].uri);
    }
  };

  const removeLogo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLogoChange(undefined);
  };

  if (logoUrl) {
    return (
      <View className="items-center mb-6">
        <View className="relative">
          <Image
            source={{ uri: logoUrl }}
            className="w-24 h-24 rounded-2xl"
          />
          <Pressable
            onPress={removeLogo}
            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full items-center justify-center"
          >
            <X size={16} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text className="text-gray-500 text-sm mt-2">Business Logo</Text>
      </View>
    );
  }

  return (
    <Pressable onPress={pickImage} className="items-center mb-6">
      <View className="w-24 h-24 rounded-2xl bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300">
        <Camera size={32} color={COLORS.text.light} />
      </View>
      <Text className="text-gray-500 text-sm mt-2">Add Logo</Text>
    </Pressable>
  );
}
