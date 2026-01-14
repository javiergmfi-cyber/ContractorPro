import React from "react";
import { View, ScrollView, StyleSheet, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { BlackCardInvoice } from "@/components/BlackCardInvoice";

/**
 * Demo Route - Preview the Black Card Invoice
 * Access via: /demo
 */
export default function Demo() {
  const router = useRouter();

  // Sample invoice data
  const sampleInvoice = {
    total: 287500, // $2,875.00
    businessName: "Martinez Custom Tile",
    invoiceNumber: "INV-2024-0847",
    clientName: "Sarah Johnson",
    clientEmail: "sarah.johnson@email.com",
    items: [
      {
        description: "Master bathroom tile installation",
        quantity: 1,
        unitPrice: 185000,
        total: 185000,
      },
      {
        description: "Waterproofing membrane",
        quantity: 1,
        unitPrice: 45000,
        total: 45000,
      },
      {
        description: "Premium grout and sealant",
        quantity: 1,
        unitPrice: 32500,
        total: 32500,
      },
    ],
    subtotal: 262500,
    taxAmount: 25000,
    taxRate: 9.5,
    currency: "USD",
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Black Card Invoice Demo</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        This is what your customer will receive
      </Text>

      {/* Black Card Invoice */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BlackCardInvoice
          total={sampleInvoice.total}
          businessName={sampleInvoice.businessName}
          invoiceNumber={sampleInvoice.invoiceNumber}
          clientName={sampleInvoice.clientName}
          clientEmail={sampleInvoice.clientEmail}
          items={sampleInvoice.items}
          subtotal={sampleInvoice.subtotal}
          taxAmount={sampleInvoice.taxAmount}
          taxRate={sampleInvoice.taxRate}
          currency={sampleInvoice.currency}
          createdAt={sampleInvoice.createdAt}
          dueDate={sampleInvoice.dueDate}
        />

        <Text style={styles.footer}>
          The QR code and Pay button will link to Stripe
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  footer: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 18,
  },
});
