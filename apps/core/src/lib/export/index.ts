/**
 * Data Export Utilities
 * Export data to CSV and Excel formats
 */

// CSV escape helper
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);

  // If contains comma, newline, or double quote, wrap in quotes
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Convert array of objects to CSV string
 */
export function toCSV<T extends Record<string, unknown>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) {
    return "";
  }

  // Determine columns
  const firstRow = data[0];
  const cols = columns || Object.keys(firstRow as object).map((key) => ({
    key: key as keyof T,
    label: key,
  }));

  // Header row
  const header = cols.map((col) => escapeCSV(col.label)).join(",");

  // Data rows
  const rows = data.map((row) =>
    cols.map((col) => escapeCSV(row[col.key])).join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Create CSV download response
 */
export function createCSVResponse(
  csv: string,
  filename: string
): Response {
  // Add BOM for Excel compatibility
  const bom = "\uFEFF";
  const content = bom + csv;

  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/**
 * Format date for export
 */
export function formatDateForExport(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0] ?? ""; // YYYY-MM-DD
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(
  amount: number | string | null,
  currency: string = "EUR"
): string {
  if (amount === null || amount === undefined) return "";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${num.toFixed(2)} ${currency}`;
}

// ==================== EXPORT CONFIGURATIONS ====================

export interface ExportConfig<T> {
  columns: { key: keyof T; label: string }[];
  filename: string;
}

// Invoice export config
export const invoiceExportConfig: ExportConfig<{
  invoiceNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  currency: string;
  createdAt: string;
  dueDate: string;
  paidAt: string;
}> = {
  columns: [
    { key: "invoiceNumber", label: "Fatura No" },
    { key: "status", label: "Durum" },
    { key: "customerName", label: "Müşteri" },
    { key: "customerEmail", label: "Email" },
    { key: "subtotal", label: "Ara Toplam" },
    { key: "taxAmount", label: "KDV" },
    { key: "total", label: "Toplam" },
    { key: "currency", label: "Para Birimi" },
    { key: "createdAt", label: "Oluşturma Tarihi" },
    { key: "dueDate", label: "Vade Tarihi" },
    { key: "paidAt", label: "Ödeme Tarihi" },
  ],
  filename: "faturalar.csv",
};

// User export config
export const userExportConfig: ExportConfig<{
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: string;
  createdAt: string;
  lastLoginAt: string;
}> = {
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Ad Soyad" },
    { key: "email", label: "Email" },
    { key: "role", label: "Rol" },
    { key: "emailVerified", label: "Email Doğrulandı" },
    { key: "createdAt", label: "Kayıt Tarihi" },
    { key: "lastLoginAt", label: "Son Giriş" },
  ],
  filename: "kullanicilar.csv",
};

// Transaction export config
export const transactionExportConfig: ExportConfig<{
  id: string;
  type: string;
  amount: string;
  currency: string;
  description: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}> = {
  columns: [
    { key: "id", label: "İşlem ID" },
    { key: "type", label: "Tip" },
    { key: "amount", label: "Tutar" },
    { key: "currency", label: "Para Birimi" },
    { key: "description", label: "Açıklama" },
    { key: "status", label: "Durum" },
    { key: "paymentMethod", label: "Ödeme Yöntemi" },
    { key: "createdAt", label: "Tarih" },
  ],
  filename: "islemler.csv",
};

// Support ticket export config
export const ticketExportConfig: ExportConfig<{
  referenceNo: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  resolvedAt: string;
  rating: string;
}> = {
  columns: [
    { key: "referenceNo", label: "Talep No" },
    { key: "subject", label: "Konu" },
    { key: "category", label: "Kategori" },
    { key: "priority", label: "Öncelik" },
    { key: "status", label: "Durum" },
    { key: "customerName", label: "Müşteri" },
    { key: "customerEmail", label: "Email" },
    { key: "createdAt", label: "Açılış Tarihi" },
    { key: "resolvedAt", label: "Çözüm Tarihi" },
    { key: "rating", label: "Değerlendirme" },
  ],
  filename: "destek-talepleri.csv",
};
