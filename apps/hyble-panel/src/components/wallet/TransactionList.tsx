"use client";

import { useState } from "react";
import { Card, Button } from "@hyble/ui";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Gift,
  RefreshCw,
  Filter,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { trpc } from "@/lib/trpc/client";

type TransactionType = "DEPOSIT" | "CHARGE" | "REFUND" | "ADJUSTMENT" | "BONUS";

const typeConfig: Record<TransactionType, { icon: React.ReactNode; label: string; color: string }> = {
  DEPOSIT: { icon: <ArrowDownLeft className="h-4 w-4" />, label: "Yükleme", color: "text-green-600" },
  CHARGE: { icon: <ArrowUpRight className="h-4 w-4" />, label: "Ödeme", color: "text-red-600" },
  REFUND: { icon: <Receipt className="h-4 w-4" />, label: "İade", color: "text-orange-600" },
  ADJUSTMENT: { icon: <RefreshCw className="h-4 w-4" />, label: "Düzeltme", color: "text-blue-600" },
  BONUS: { icon: <Gift className="h-4 w-4" />, label: "Bonus", color: "text-emerald-600" },
};

function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
      <div className="h-5 w-16 bg-muted rounded" />
    </div>
  );
}

export function TransactionList() {
  const [filter, setFilter] = useState<TransactionType | "ALL">("ALL");

  const { data, isLoading, error } = trpc.wallet.getTransactions.useQuery({
    limit: 20,
    type: filter === "ALL" ? undefined : filter,
  });

  const transactions = data?.transactions ?? [];


  if (error) {
    return (
      <Card className="p-6 border-destructive/50 bg-destructive/10">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">İşlem geçmişi yüklenemedi</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </Card>
    );
  }

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
        {Object.entries(typeConfig).map(([type, config]) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type as TransactionType)}
            className="flex-shrink-0"
          >
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </Button>
        ))}
      </div>

      {/* Transaction List */}
      <Card className="divide-y">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <TransactionSkeleton key={i} />)
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Henüz işlem yok</p>
            <p className="text-sm mt-1">İşlemleriniz burada görünecek</p>
          </div>
        ) : (
          transactions.map((tx) => {
            const config = typeConfig[tx.type as TransactionType] || typeConfig.DEPOSIT;
            const isPositive = ["DEPOSIT", "REFUND", "BONUS", "ADJUSTMENT"].includes(tx.type);
            const amount = parseFloat(tx.amount);

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-muted ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <span className="font-medium">{config.label}</span>
                    <p className="text-sm text-muted-foreground">
                      {tx.description || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: tr })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? "+" : "-"}{tx.currency === "EUR" ? "€" : tx.currency}{Math.abs(amount).toFixed(2)}
                  </span>
                  {tx.status === "PENDING" && (
                    <p className="text-xs text-yellow-600">Beklemede</p>
                  )}
                  {tx.status === "FAILED" && (
                    <p className="text-xs text-destructive">Başarısız</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
