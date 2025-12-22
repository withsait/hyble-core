"use client";

import { useState } from "react";
import { Card, Button } from "@hyble/ui";
import {
  FileText,
  Download,
  Printer,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Building2,
  Mail,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { trpc } from "@/lib/trpc/client";

interface InvoiceDetailProps {
  invoiceId: string;
}

type InvoiceStatus = "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED";

const statusConfig: Record<InvoiceStatus, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  DRAFT: { icon: <FileText className="h-5 w-5" />, label: "Taslak", color: "text-slate-600", bg: "bg-slate-100" },
  PENDING: { icon: <Clock className="h-5 w-5" />, label: "Ödeme Bekliyor", color: "text-yellow-700", bg: "bg-yellow-100" },
  PAID: { icon: <CheckCircle className="h-5 w-5" />, label: "Ödendi", color: "text-green-700", bg: "bg-green-100" },
  OVERDUE: { icon: <AlertCircle className="h-5 w-5" />, label: "Gecikmiş", color: "text-red-700", bg: "bg-red-100" },
  CANCELLED: { icon: <XCircle className="h-5 w-5" />, label: "İptal Edildi", color: "text-slate-500", bg: "bg-slate-100" },
  REFUNDED: { icon: <AlertCircle className="h-5 w-5" />, label: "İade Edildi", color: "text-orange-700", bg: "bg-orange-100" },
};

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-32 bg-muted rounded-lg" />
        <div className="h-32 bg-muted rounded-lg" />
      </div>
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  );
}

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: invoice, isLoading, error } = trpc.wallet.getInvoice.useQuery({ id: invoiceId });

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    // TODO: Replace with tRPC mutation when invoice router is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    alert("PDF download would start here");
    setIsDownloading(false);
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }


  if (!invoice) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Fatura bulunamadı</p>
      </Card>
    );
  }

  const config = statusConfig[invoice.status as InvoiceStatus] || statusConfig.PENDING;
  const currencySymbol = invoice.currency === "EUR" ? "€" : invoice.currency === "USD" ? "$" : "₺";

  // Parse string amounts to numbers
  const subtotal = parseFloat(invoice.subtotal);
  const taxAmount = parseFloat(invoice.taxAmount);
  const taxRate = parseFloat(invoice.taxRate);
  const total = parseFloat(invoice.total);

  // Parse billing address from JSON
  const billingAddress = invoice.billingAddress as { line1?: string; line2?: string; city?: string; postalCode?: string; country?: string } | null;

  // Parse items from JSON
  const items = (invoice.items as Array<{ name: string; description?: string; quantity: number; unitPrice: number; total: number }>) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
          <p className="text-muted-foreground mt-1">
            Oluşturulma: {format(new Date(invoice.createdAt), "d MMMM yyyy", { locale: tr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.color}`}>
            {config.icon}
            <span className="font-medium">{config.label}</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* From */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Satıcı</h3>
          </div>
          <div className="text-sm space-y-1">
            <p className="font-medium">Hyble Ltd</p>
            <p className="text-muted-foreground">71-75 Shelton Street</p>
            <p className="text-muted-foreground">London, WC2H 9JQ</p>
            <p className="text-muted-foreground">United Kingdom</p>
            <p className="text-muted-foreground mt-2">VAT: GB123456789</p>
          </div>
        </Card>

        {/* To */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Fatura Adresi</h3>
          </div>
          <div className="text-sm space-y-1">
            {billingAddress && (
              <>
                {billingAddress.line1 && <p className="text-muted-foreground">{billingAddress.line1}</p>}
                {billingAddress.line2 && <p className="text-muted-foreground">{billingAddress.line2}</p>}
                {(billingAddress.city || billingAddress.postalCode) && (
                  <p className="text-muted-foreground">
                    {billingAddress.city}{billingAddress.postalCode && `, ${billingAddress.postalCode}`}
                  </p>
                )}
                {billingAddress.country && <p className="text-muted-foreground">{billingAddress.country}</p>}
              </>
            )}
            {!billingAddress && <p className="text-muted-foreground italic">Adres bilgisi yok</p>}
          </div>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium">Açıklama</th>
                <th className="text-center p-4 font-medium">Miktar</th>
                <th className="text-right p-4 font-medium">Birim Fiyat</th>
                <th className="text-right p-4 font-medium">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </td>
                  <td className="p-4 text-center">{item.quantity}</td>
                  <td className="p-4 text-right">{currencySymbol}{item.unitPrice?.toFixed(2)}</td>
                  <td className="p-4 text-right font-medium">{currencySymbol}{item.total?.toFixed(2)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    Fatura kalem bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-b">
                <td colSpan={3} className="p-4 text-right text-muted-foreground">Ara Toplam</td>
                <td className="p-4 text-right">{currencySymbol}{subtotal.toFixed(2)}</td>
              </tr>
              {taxAmount > 0 && (
                <tr className="border-b">
                  <td colSpan={3} className="p-4 text-right text-muted-foreground">
                    KDV ({taxRate}%)
                  </td>
                  <td className="p-4 text-right">{currencySymbol}{taxAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="bg-muted/50">
                <td colSpan={3} className="p-4 text-right font-semibold">Genel Toplam</td>
                <td className="p-4 text-right font-bold text-lg">{currencySymbol}{total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          PDF İndir
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Yazdır
        </Button>
        {invoice.status === "PENDING" && (
          <Button>
            <CreditCard className="h-4 w-4 mr-2" />
            Şimdi Öde
          </Button>
        )}
      </div>

      {/* Payment Info */}
      {invoice.status === "PENDING" && invoice.dueDate && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Ödeme Bekleniyor</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Son ödeme tarihi: {format(new Date(invoice.dueDate), "d MMMM yyyy", { locale: tr })}
              </p>
            </div>
          </div>
        </Card>
      )}

      {invoice.status === "PAID" && invoice.paidAt && (
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Ödeme Tamamlandı</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Ödeme tarihi: {format(new Date(invoice.paidAt), "d MMMM yyyy", { locale: tr })}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
