"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button } from "@hyble/ui";
import {
  FileText,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { trpc } from "@/lib/trpc/client";

type InvoiceStatus = "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED";

const statusConfig: Record<InvoiceStatus, { icon: React.ReactNode; label: string; color: string }> = {
  DRAFT: { icon: <FileText className="h-4 w-4" />, label: "Taslak", color: "bg-slate-100 text-slate-600" },
  PENDING: { icon: <Clock className="h-4 w-4" />, label: "Beklemede", color: "bg-yellow-100 text-yellow-700" },
  PAID: { icon: <CheckCircle className="h-4 w-4" />, label: "Ödendi", color: "bg-green-100 text-green-700" },
  OVERDUE: { icon: <AlertCircle className="h-4 w-4" />, label: "Gecikmiş", color: "bg-red-100 text-red-700" },
  CANCELLED: { icon: <XCircle className="h-4 w-4" />, label: "İptal", color: "bg-slate-100 text-slate-500" },
  REFUNDED: { icon: <AlertCircle className="h-4 w-4" />, label: "İade", color: "bg-orange-100 text-orange-700" },
};

function InvoiceSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-muted rounded" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-6 w-20 bg-muted rounded-full" />
        <div className="h-5 w-16 bg-muted rounded" />
      </div>
    </div>
  );
}

export function InvoiceList() {
  const [filter, setFilter] = useState<InvoiceStatus | "ALL">("ALL");

  const { data, isLoading, error } = trpc.wallet.getInvoices.useQuery({
    limit: 20,
    status: filter === "ALL" ? undefined : filter,
  });

  const invoices = data?.invoices ?? [];


  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Button
          variant={filter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ALL")}
        >
          Tümü
        </Button>
        {(Object.keys(statusConfig) as InvoiceStatus[]).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className="flex-shrink-0"
          >
            {statusConfig[status].label}
          </Button>
        ))}
      </div>

      {/* Invoice List */}
      <Card className="divide-y">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <InvoiceSkeleton key={i} />)
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Henüz fatura yok</p>
            <p className="text-sm mt-1">Faturalarınız burada görünecek</p>
          </div>
        ) : (
          invoices.map((invoice) => {
            const config = statusConfig[invoice.status as InvoiceStatus] || statusConfig.PENDING;
            const currencySymbol = invoice.currency === "EUR" ? "€" : invoice.currency === "USD" ? "$" : "₺";
            const total = parseFloat(invoice.total);

            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/billing/${invoice.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        {config.icon}
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(invoice.createdAt), "d MMMM yyyy", { locale: tr })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">
                      {currencySymbol}{total.toFixed(2)}
                    </p>
                    {invoice.status === "PENDING" && invoice.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Son ödeme: {format(new Date(invoice.dueDate), "d MMM", { locale: tr })}
                      </p>
                    )}
                    {invoice.status === "PAID" && invoice.paidAt && (
                      <p className="text-xs text-green-600">
                        Ödendi: {format(new Date(invoice.paidAt), "d MMM", { locale: tr })}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Link
                      href={`/dashboard/billing/${invoice.id}`}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Card>

      {/* Load More */}
      {data?.nextCursor && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Implement pagination with cursor
            }}
          >
            Daha Fazla Yükle
          </Button>
        </div>
      )}
    </div>
  );
}
