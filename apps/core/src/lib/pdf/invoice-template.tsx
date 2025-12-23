import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563EB",
  },
  invoiceInfo: {
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  invoiceDate: {
    color: "#6B7280",
  },
  status: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  statusPaid: {
    backgroundColor: "#DEF7EC",
    color: "#03543F",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  statusOverdue: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  addressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  addressBlock: {
    width: "45%",
  },
  addressTitle: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  addressText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1F2937",
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontWeight: "bold",
    color: "#374151",
    fontSize: 9,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  colDescription: {
    flex: 3,
  },
  colQuantity: {
    flex: 1,
    textAlign: "center",
  },
  colUnitPrice: {
    flex: 1,
    textAlign: "right",
  },
  colTotal: {
    flex: 1,
    textAlign: "right",
  },
  totalsSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    color: "#6B7280",
  },
  totalValue: {
    fontWeight: "bold",
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: "#2563EB",
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563EB",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 8,
    color: "#9CA3AF",
    textAlign: "center",
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#374151",
  },
  notesText: {
    fontSize: 9,
    color: "#6B7280",
    lineHeight: 1.5,
  },
});

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  createdAt: Date;
  dueDate: Date | null;
  paidAt?: Date | null;
  customerName: string;
  customerEmail: string;
  customerAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string | null;
}

const formatCurrency = (amount: number, currency: string) => {
  const symbol = currency === "EUR" ? "€" : currency === "TRY" ? "₺" : "$";
  return `${symbol}${amount.toFixed(2)}`;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "PAID":
      return styles.statusPaid;
    case "OVERDUE":
      return styles.statusOverdue;
    default:
      return styles.statusPending;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "PAID":
      return "Ödendi";
    case "PENDING":
      return "Bekliyor";
    case "OVERDUE":
      return "Gecikmiş";
    case "CANCELLED":
      return "İptal";
    case "DRAFT":
      return "Taslak";
    default:
      return status;
  }
};

export const InvoicePDF: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>HYBLE</Text>
          <Text style={{ color: "#6B7280", marginTop: 4 }}>
            Hyble Ltd.
          </Text>
          <Text style={{ color: "#6B7280" }}>
            London, United Kingdom
          </Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
          <Text style={styles.invoiceDate}>
            Tarih: {formatDate(data.createdAt)}
          </Text>
          {data.dueDate && (
            <Text style={styles.invoiceDate}>
              Vade: {formatDate(data.dueDate)}
            </Text>
          )}
          <View style={[styles.status, getStatusStyle(data.status)]}>
            <Text>{getStatusText(data.status)}</Text>
          </View>
        </View>
      </View>

      {/* Addresses */}
      <View style={styles.addressSection}>
        <View style={styles.addressBlock}>
          <Text style={styles.addressTitle}>Gönderen</Text>
          <Text style={styles.addressText}>Hyble Ltd.</Text>
          <Text style={styles.addressText}>71-75 Shelton Street</Text>
          <Text style={styles.addressText}>London, WC2H 9JQ</Text>
          <Text style={styles.addressText}>United Kingdom</Text>
          <Text style={styles.addressText}>VAT: GB123456789</Text>
        </View>
        <View style={styles.addressBlock}>
          <Text style={styles.addressTitle}>Alıcı</Text>
          <Text style={styles.addressText}>{data.customerName}</Text>
          <Text style={styles.addressText}>{data.customerEmail}</Text>
          {data.customerAddress && (
            <>
              <Text style={styles.addressText}>
                {data.customerAddress.line1}
              </Text>
              {data.customerAddress.line2 && (
                <Text style={styles.addressText}>
                  {data.customerAddress.line2}
                </Text>
              )}
              <Text style={styles.addressText}>
                {data.customerAddress.city}, {data.customerAddress.postalCode}
              </Text>
              <Text style={styles.addressText}>
                {data.customerAddress.country}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDescription]}>
            Açıklama
          </Text>
          <Text style={[styles.tableHeaderText, styles.colQuantity]}>
            Adet
          </Text>
          <Text style={[styles.tableHeaderText, styles.colUnitPrice]}>
            Birim Fiyat
          </Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>
            Toplam
          </Text>
        </View>
        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.colDescription}>
              <Text>{item.name}</Text>
              {item.description && (
                <Text style={{ color: "#6B7280", fontSize: 8, marginTop: 2 }}>
                  {item.description}
                </Text>
              )}
            </View>
            <Text style={styles.colQuantity}>{item.quantity}</Text>
            <Text style={styles.colUnitPrice}>
              {formatCurrency(item.unitPrice, data.currency)}
            </Text>
            <Text style={styles.colTotal}>
              {formatCurrency(item.total, data.currency)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Ara Toplam</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(data.subtotal, data.currency)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            KDV ({data.taxRate}%)
          </Text>
          <Text style={styles.totalValue}>
            {formatCurrency(data.taxAmount, data.currency)}
          </Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(data.total, data.currency)}
          </Text>
        </View>
      </View>

      {/* Notes */}
      {data.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Notlar</Text>
          <Text style={styles.notesText}>{data.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Bu fatura Hyble Ltd. tarafından elektronik olarak oluşturulmuştur.
        </Text>
        <Text style={styles.footerText}>
          Sorularınız için support@hyble.co adresinden bize ulaşabilirsiniz.
        </Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
