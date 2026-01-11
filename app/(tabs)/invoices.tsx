import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FileText } from "lucide-react-native";
import { InvoiceCard } from "../../components/InvoiceCard";
import { useInvoiceStore } from "../../store/useInvoiceStore";
import { COLORS } from "../../lib/constants";

export default function Invoices() {
  const router = useRouter();
  const { invoices } = useInvoiceStore();

  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleInvoicePress = (id: string) => {
    router.push(`/invoice/${id}`);
  };

  if (invoices.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="px-6 pt-4 mb-6">
          <Text className="text-3xl font-bold">Invoices</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <FileText size={40} color={COLORS.text.light} />
          </View>
          <Text className="text-xl font-semibold text-gray-700 mb-2">
            No invoices yet
          </Text>
          <Text className="text-gray-500 text-center">
            Hold the mic button on the Dashboard to create your first invoice
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-6 pt-4 mb-4">
        <Text className="text-3xl font-bold">Invoices</Text>
        <Text className="text-gray-500 mt-1">
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
        </Text>
      </View>
      <FlatList
        data={sortedInvoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <InvoiceCard
            invoice={item}
            onPress={() => handleInvoicePress(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}
