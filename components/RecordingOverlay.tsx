import { View, Text, Modal } from "react-native";
import { Mic } from "lucide-react-native";
import { useEffect, useState } from "react";

interface RecordingOverlayProps {
  visible: boolean;
  duration: number;
}

export function RecordingOverlay({ visible, duration }: RecordingOverlayProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [visible]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/80 items-center justify-center">
        <View className="bg-white rounded-3xl p-10 items-center mx-8">
          <View className="w-24 h-24 rounded-full bg-red-500 items-center justify-center mb-6">
            <Mic size={40} color="#FFFFFF" />
          </View>
          <Text className="text-3xl font-bold mb-2">
            {formatDuration(duration)}
          </Text>
          <Text className="text-gray-500 text-lg">Recording{dots}</Text>
          <Text className="text-gray-400 text-sm mt-4">
            Release to finish
          </Text>
        </View>
      </View>
    </Modal>
  );
}
