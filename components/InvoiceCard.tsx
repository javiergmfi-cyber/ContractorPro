import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Invoice } from "../types";
import { formatCurrency, formatDate } from "../lib/utils";
import { COLORS } from "../lib/constants";

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
}

export function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const statusColors = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-600",
    paid: "bg-green-100 text-green-600",
    overdue: "bg-orange-100 text-orange-600",
  };

  const statusLabels = {
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    overdue: "Overdue",
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white rounded-2xl p-5 mb-3 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-lg font-semibold">{invoice.clientName}</Text>
          <View className={`ml-2 px-2 py-0.5 rounded-full ${statusColors[invoice.status]}`}>
            <Text className={`text-xs font-medium ${statusColors[invoice.status].split(" ")[1]}`}>
              {statusLabels[invoice.status]}
            </Text>
          </View>
        </View>
        <Text className="text-gray-500 text-sm">
          {invoice.invoiceNumber} • {formatDate(invoice.createdAt)}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-xl font-bold mr-2">
          {formatCurrency(invoice.total)}
        </Text>
        <ChevronRight size={20} color={COLORS.text.light} />
      </View>
    </Pressable>
  );
}
