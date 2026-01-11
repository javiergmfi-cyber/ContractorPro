import { View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = "" }: CardProps) {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const baseClasses = "bg-white rounded-2xl p-5";

  if (onPress) {
    return (
      <Pressable onPress={handlePress} className={`${baseClasses} ${className}`}>
        {children}
      </Pressable>
    );
  }

  return <View className={`${baseClasses} ${className}`}>{children}</View>;
}
