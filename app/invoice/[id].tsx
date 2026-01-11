import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Share2, Printer } from "lucide-react-native";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { MonogramAvatar } from "../../components/MonogramAvatar";
import { useInvoiceStore } from "../../store/useInvoiceStore";
import { useProfileStore } from "../../store/useProfileStore";
import { formatCurrency, formatDate } from "../../lib/utils";
import { COLORS } from "../../lib/constants";

export default function InvoiceDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, updateInvoice } = useInvoiceStore();
  const { profile } = useProfileStore();

  const invoice = invoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Invoice not found</Text>
        <Button
          title="Go Back"
          variant="secondary"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const handleMarkAsPaid = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateInvoice(invoice.id, {
      status: "paid",
      paidAt: new Date().toISOString(),
    });
    Alert.alert("Success", "Invoice marked as paid!");
  };

  const handleSendInvoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateInvoice(invoice.id, { status: "sent" });
    Alert.alert("Sent", "Invoice has been marked as sent.");
  };

  const statusColors = {
    draft: { bg: "bg-gray-100", text: "text-gray-600" },
    sent: { bg: "bg-blue-100", text: "text-blue-600" },
    paid: { bg: "bg-green-100", text: "text-green-600" },
    overdue: { bg: "bg-orange-100", text: "text-orange-600" },
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </Pressable>
        <Text className="text-lg font-semibold">{invoice.invoiceNumber}</Text>
        <View className="flex-row gap-2">
          <Pressable className="p-2">
            <Share2 size={22} color={COLORS.text.primary} />
          </Pressable>
          <Pressable className="p-2 -mr-2">
            <Printer size={22} color={COLORS.text.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 pt-6">
          <View className="items-center mb-6">
            <MonogramAvatar name={invoice.clientName} size="lg" />
            <Text className="text-2xl font-bold mt-3">{invoice.clientName}</Text>
            <View className={`px-3 py-1 rounded-full mt-2 ${statusColors[invoice.status].bg}`}>
              <Text className={`text-sm font-medium capitalize ${statusColors[invoice.status].text}`}>
                {invoice.status}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <View>
              <Text className="text-gray-500 text-sm">Created</Text>
              <Text className="font-medium">{formatDate(invoice.createdAt)}</Text>
            </View>
            {invoice.dueDate && (
              <View className="items-end">
                <Text className="text-gray-500 text-sm">Due Date</Text>
                <Text className="font-medium">{formatDate(invoice.dueDate)}</Text>
              </View>
            )}
          </View>

          <Card className="bg-gray-50 mb-6">
            <Text className="text-sm font-medium text-gray-500 mb-4">Items</Text>
            {invoice.items.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-base font-medium">{item.description}</Text>
                  <Text className="text-sm text-gray-500">
                    Qty: {item.quantity} × {formatCurrency(item.price)}
                  </Text>
                </View>
                <Text className="text-base font-semibold">
                  {formatCurrency(item.quantity * item.price)}
                </Text>
              </View>
            ))}
          </Card>

          <View className="bg-gray-50 rounded-2xl p-5">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500">Subtotal</Text>
              <Text className="font-medium">{formatCurrency(invoice.subtotal)}</Text>
            </View>
            {invoice.taxRate > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Tax ({invoice.taxRate}%)</Text>
                <Text className="font-medium">{formatCurrency(invoice.taxAmount)}</Text>
              </View>
            )}
            <View className="flex-row justify-between pt-3 border-t border-gray-200">
              <Text className="text-lg font-bold">Total</Text>
              <Text className="text-lg font-bold" style={{ color: COLORS.primary }}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
          </View>

          {profile.businessName && (
            <View className="mt-6 pt-6 border-t border-gray-100">
              <Text className="text-gray-500 text-sm mb-1">From</Text>
              <Text className="font-medium">{profile.businessName}</Text>
              {profile.email && <Text className="text-gray-500">{profile.email}</Text>}
              {profile.phone && <Text className="text-gray-500">{profile.phone}</Text>}
            </View>
          )}
        </View>
      </ScrollView>

      <View className="px-6 pb-6 gap-3">
        {invoice.status === "draft" && (
          <Button title="Send Invoice" onPress={handleSendInvoice} />
        )}
        {(invoice.status === "sent" || invoice.status === "overdue") && (
          <Button title="Mark as Paid" onPress={handleMarkAsPaid} />
        )}
        {invoice.status === "paid" && (
          <View className="py-4 items-center">
            <Text className="text-green-600 font-medium">
              Paid on {formatDate(invoice.paidAt!)}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
