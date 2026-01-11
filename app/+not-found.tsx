import { View, Text } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFound() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-6xl mb-4">🔍</Text>
      <Text className="text-2xl font-bold mb-2">Page Not Found</Text>
      <Text className="text-gray-500 text-center mb-6">
        The page you're looking for doesn't exist.
      </Text>
      <Link href="/" className="text-primary font-semibold text-lg">
        Go to Dashboard
      </Link>
    </SafeAreaView>
  );
}
