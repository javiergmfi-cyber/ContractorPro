import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Check } from "lucide-react-native";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useInvoiceStore } from "../../store/useInvoiceStore";
import { useProfileStore } from "../../store/useProfileStore";
import { formatCurrency, generateInvoiceNumber, generateId } from "../../lib/utils";
import { COLORS } from "../../lib/constants";
import { Invoice } from "../../types";

export default function InvoicePreview() {
  const router = useRouter();
  const { pendingInvoice, invoices, addInvoice, clearPendingInvoice } = useInvoiceStore();
  const { profile } = useProfileStore();

  if (!pendingInvoice) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">No invoice data</Text>
        <Button
          title="Go Back"
          variant="secondary"
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const subtotal = pendingInvoice.items.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const taxAmount = subtotal * (profile.taxRate / 100);
  const total = subtotal + taxAmount;

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newInvoice: Invoice = {
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(invoices.length + 1),
      clientName: pendingInvoice.clientName,
      clientEmail: pendingInvoice.clientEmail,
      clientPhone: pendingInvoice.clientPhone,
      items: pendingInvoice.items.map((item) => ({
        id: generateId(),
        description: item.description,
        quantity: item.quantity || 1,
        price: item.price,
      })),
      subtotal,
      taxRate: profile.taxRate,
      taxAmount,
      total,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    addInvoice(newInvoice);
    clearPendingInvoice();

    Alert.alert("Invoice Created", `Invoice ${newInvoice.invoiceNumber} has been created.`, [
      { text: "OK", onPress: () => router.replace("/(tabs)/invoices") },
    ]);
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearPendingInvoice();
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <Pressable onPress={handleCancel} className="p-2 -ml-2">
          <X size={24} color={COLORS.text.primary} />
        </Pressable>
        <Text className="text-lg font-semibold">Invoice Preview</Text>
        <Pressable onPress={handleConfirm} className="p-2 -mr-2">
          <Check size={24} color={COLORS.primary} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 pt-6">
          <Text className="text-sm text-gray-500 mb-1">Bill To</Text>
          <Text className="text-2xl font-bold mb-6">
            {pendingInvoice.clientName}
          </Text>

          <Card className="bg-gray-50 mb-6">
            <Text className="text-sm font-medium text-gray-500 mb-4">Items</Text>
            {pendingInvoice.items.map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-base font-medium">{item.description}</Text>
                  <Text className="text-sm text-gray-500">
                    Qty: {item.quantity || 1}
                  </Text>
                </View>
                <Text className="text-base font-semibold">
                  {formatCurrency(item.price)}
                </Text>
              </View>
            ))}
          </Card>

          <View className="bg-gray-50 rounded-2xl p-5">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500">Subtotal</Text>
              <Text className="font-medium">{formatCurrency(subtotal)}</Text>
            </View>
            {profile.taxRate > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Tax ({profile.taxRate}%)</Text>
                <Text className="font-medium">{formatCurrency(taxAmount)}</Text>
              </View>
            )}
            <View className="flex-row justify-between pt-3 border-t border-gray-200">
              <Text className="text-lg font-bold">Total</Text>
              <Text className="text-lg font-bold" style={{ color: COLORS.primary }}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>

          <Text className="text-center text-gray-400 text-sm mt-6">
            Detected language: {pendingInvoice.detectedLanguage}
          </Text>
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <Button title="Create Invoice" onPress={handleConfirm} />
      </View>
    </SafeAreaView>
  );
}
