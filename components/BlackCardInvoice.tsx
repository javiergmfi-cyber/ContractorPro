import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Shield, CreditCard } from "lucide-react-native";
import Svg, { Rect, Path } from "react-native-svg";
import { formatCurrency } from "@/types";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface BlackCardInvoiceProps {
  total: number;
  businessName: string;
  logoUrl?: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  currency?: string;
  createdAt: string;
  dueDate?: string;
}

/**
 * Black Card Invoice Component
 *
 * The "Luxury Receipt" design - radical minimalism that signals premium service.
 * Inspired by Apple Store receipts and luxury hotel bills.
 */
export function BlackCardInvoice({
  total,
  businessName,
  logoUrl,
  invoiceNumber,
  clientName,
  clientEmail,
  items,
  subtotal,
  taxAmount,
  taxRate,
  currency = "USD",
  createdAt,
  dueDate,
}: BlackCardInvoiceProps) {
  const formatLuxuryTotal = (cents: number) => {
    const dollars = Math.floor(cents / 100);
    const remainder = cents % 100;
    return {
      dollars: dollars.toLocaleString("en-US"),
      cents: remainder.toString().padStart(2, "0"),
    };
  };

  const { dollars, cents } = formatLuxuryTotal(total);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Hero Total - The Money IS the Design */}
      <View style={styles.heroTotal}>
        <Text style={styles.totalLabel}>AMOUNT DUE</Text>
        <View style={styles.totalRow}>
          <Text style={styles.currencySymbol}>$</Text>
          <Text style={styles.totalDollars}>{dollars}</Text>
          <Text style={styles.totalCents}>.{cents}</Text>
        </View>
      </View>

      {/* Contractor Header with Verified Badge */}
      <View style={styles.contractorHeader}>
        <View style={styles.logoContainer}>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.logoPlaceholder}>
              {businessName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.contractorInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.contractorName} numberOfLines={1}>
              {businessName}
            </Text>
            <View style={styles.verifiedBadge}>
              <Shield size={10} color="#34C759" strokeWidth={3} />
              <Text style={styles.verifiedText}>VERIFIED PRO</Text>
            </View>
          </View>
          <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
        </View>
      </View>

      {/* Client Section */}
      <View style={styles.clientSection}>
        <Text style={styles.clientLabel}>BILLED TO</Text>
        <Text style={styles.clientName}>{clientName}</Text>
        {clientEmail && (
          <Text style={styles.clientEmail}>{clientEmail}</Text>
        )}
      </View>

      {/* Line Items */}
      <View style={styles.lineItems}>
        {items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.lineItem,
              index < items.length - 1 && styles.lineItemBorder,
            ]}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemDescription}>{item.description}</Text>
              {item.quantity > 1 && (
                <Text style={styles.itemQty}>x {item.quantity}</Text>
              )}
            </View>
            <Text style={styles.itemAmount}>
              {formatCurrency(item.total, currency)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRowSmall}>
          <Text style={styles.totalLabelSmall}>Subtotal</Text>
          <Text style={styles.totalValueSmall}>
            {formatCurrency(subtotal, currency)}
          </Text>
        </View>
        {taxAmount > 0 && (
          <View style={styles.totalRowSmall}>
            <Text style={styles.totalLabelSmall}>Tax ({taxRate}%)</Text>
            <Text style={styles.totalValueSmall}>
              {formatCurrency(taxAmount, currency)}
            </Text>
          </View>
        )}
      </View>

      {/* Pay Button - PRIMARY ACTION */}
      <View style={styles.payButton}>
        <CreditCard size={22} color="#000000" strokeWidth={2.5} />
        <Text style={styles.payButtonText}>Pay Now</Text>
      </View>

      {/* QR Code Section - Secondary (for printed invoices) */}
      <View style={styles.qrSection}>
        <Text style={styles.qrLabel}>FOR PRINTED INVOICES</Text>
        <View style={styles.qrCode}>
          <QRCodePlaceholder size={68} />
        </View>
        <Text style={styles.qrNote}>Scan with phone camera to pay</Text>
      </View>

      {/* Dates */}
      <View style={styles.dateInfo}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>ISSUED</Text>
          <Text style={styles.dateValue}>{formatDate(createdAt)}</Text>
        </View>
        {dueDate && (
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>DUE</Text>
            <Text style={styles.dateValue}>{formatDate(dueDate)}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Powered by ContractorPro</Text>
    </View>
  );
}

function QRCodePlaceholder({ size = 120 }: { size?: number }) {
  // Simplified QR code visual for the component
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {/* Position patterns */}
      <Rect x={0} y={0} width={35} height={35} fill="#1D1D1F" />
      <Rect x={5} y={5} width={25} height={25} fill="#FFFFFF" />
      <Rect x={10} y={10} width={15} height={15} fill="#1D1D1F" />

      <Rect x={85} y={0} width={35} height={35} fill="#1D1D1F" />
      <Rect x={90} y={5} width={25} height={25} fill="#FFFFFF" />
      <Rect x={95} y={10} width={15} height={15} fill="#1D1D1F" />

      <Rect x={0} y={85} width={35} height={35} fill="#1D1D1F" />
      <Rect x={5} y={90} width={25} height={25} fill="#FFFFFF" />
      <Rect x={10} y={95} width={15} height={15} fill="#1D1D1F" />

      {/* Data modules */}
      {[45, 55, 65, 75].map((x) =>
        [45, 55, 65, 75].map((y) => (
          <Rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={8}
            height={8}
            fill={(x + y) % 20 === 0 ? "#1D1D1F" : "transparent"}
          />
        ))
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
  },

  // Hero Total
  heroTotal: {
    alignItems: "center",
    marginBottom: 32,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 2,
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "500",
    color: "#FFFFFF",
    marginTop: 8,
    marginRight: 4,
  },
  totalDollars: {
    fontSize: 64,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -2,
  },
  totalCents: {
    fontSize: 32,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 8,
  },

  // Contractor Header
  contractorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#2C2C2E",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 24,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#3A3A3C",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  logoPlaceholder: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },
  contractorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  contractorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#34C759",
    letterSpacing: 0.5,
  },
  invoiceNumber: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.4)",
    marginTop: 2,
  },

  // Client Section
  clientSection: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  clientLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: 6,
  },
  clientName: {
    fontSize: 17,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  clientEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
    marginTop: 4,
  },

  // Line Items
  lineItems: {
    width: "100%",
    marginBottom: 16,
  },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  lineItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  itemLeft: {
    flex: 1,
    marginRight: 16,
  },
  itemDescription: {
    fontSize: 15,
    color: "#FFFFFF",
  },
  itemQty: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.4)",
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },

  // Totals
  totalsSection: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 16,
    marginBottom: 32,
  },
  totalRowSmall: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalLabelSmall: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
  },
  totalValueSmall: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.4)",
  },

  // Pay Button - PRIMARY ACTION
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
  },

  // QR Code - Secondary (for print)
  qrSection: {
    alignItems: "center",
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  qrLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    color: "rgba(255, 255, 255, 0.3)",
    marginBottom: 12,
  },
  qrCode: {
    width: 100,
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  qrNote: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.25)",
    marginTop: 8,
    textAlign: "center",
  },

  // Date Info
  dateInfo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    width: "100%",
  },
  dateItem: {
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },

  // Footer
  footer: {
    marginTop: 32,
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.3)",
  },
});
