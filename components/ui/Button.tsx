import { Pressable, Text, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: ButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const baseClasses = "py-4 px-6 rounded-full items-center justify-center";
  const variantClasses = {
    primary: "bg-primary",
    secondary: "bg-gray-100",
    outline: "bg-transparent border border-gray-200",
  };
  const textClasses = {
    primary: "text-white font-semibold text-lg",
    secondary: "text-black font-semibold text-lg",
    outline: "text-black font-semibold text-lg",
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#000000"} />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </Pressable>
  );
}
