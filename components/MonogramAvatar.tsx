import { View, Text } from "react-native";
import { COLORS } from "../lib/constants";

interface MonogramAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function MonogramAvatar({ name, size = "md" }: MonogramAvatarProps) {
  const getInitials = (fullName: string): string => {
    const words = fullName.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <View
      className={`${sizeClasses[size]} rounded-full items-center justify-center`}
      style={{ backgroundColor: COLORS.primary }}
    >
      <Text className={`text-white font-bold ${textSizes[size]}`}>
        {getInitials(name || "?")}
      </Text>
    </View>
  );
}
