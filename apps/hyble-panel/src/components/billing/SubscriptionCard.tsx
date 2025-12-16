"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, Button } from "@hyble/ui";
import {
  CreditCard,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Pause,
  Play
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface SubscriptionCardProps {
  subscription: {
    id: string;
    planName: string;
    status: "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELLED" | "TRIALING";
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    amount: number;
    currency: string;
    interval: "MONTHLY" | "YEARLY";
  };
  onManage?: () => void;
}

const statusConfig = {
  ACTIVE: { icon: <CheckCircle className="h-4 w-4" />, label: "Aktif", color: "text-green-600 bg-green-100" },
  TRIALING: { icon: <Calendar className="h-4 w-4" />, label: "Deneme", color: "text-blue-600 bg-blue-100" },
  PAST_DUE: { icon: <AlertCircle className="h-4 w-4" />, label: "Ödeme Gecikmiş", color: "text-yellow-600 bg-yellow-100" },
  SUSPENDED: { icon: <Pause className="h-4 w-4" />, label: "Askıya Alındı", color: "text-orange-600 bg-orange-100" },
  CANCELLED: { icon: <XCircle className="h-4 w-4" />, label: "İptal Edildi", color: "text-red-600 bg-red-100" },
};

const intervalLabels = {
  MONTHLY: "Aylık",
  YEARLY: "Yıllık",
};

export function SubscriptionCard({ subscription, onManage }: SubscriptionCardProps) {
  const utils = trpc.useUtils();

  const cancelSubscription = trpc.subscription.cancel.useMutation({
    onSuccess: () => {
      utils.subscription.list.invalidate();
    },
    onError: (error) => {
      alert(`Hata: ${error.message}`);
    },
  });

  const resumeSubscription = trpc.subscription.resume.useMutation({
    onSuccess: () => {
      utils.subscription.list.invalidate();
    },
    onError: (error) => {
      alert(`Hata: ${error.message}`);
    },
  });

  const config = statusConfig[subscription.status];
  const currencySymbol = subscription.currency === "EUR" ? "€" : subscription.currency === "USD" ? "$" : "₺";
  const isActive = subscription.status === "ACTIVE" || subscription.status === "TRIALING";
  const isPending = cancelSubscription.isPending || resumeSubscription.isPending;

  const handleCancel = () => {
    if (window.confirm("Bu aboneliği dönem sonunda iptal etmek istediğinize emin misiniz?")) {
      cancelSubscription.mutate({ id: subscription.id });
    }
  };

  const handleResume = () => {
    resumeSubscription.mutate({ id: subscription.id });
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{subscription.planName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
              {config.icon}
              {config.label}
            </span>
            <span className="text-sm text-muted-foreground">
              {intervalLabels[subscription.interval]}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">
            {currencySymbol}{subscription.amount.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            /{subscription.interval === "MONTHLY" ? "ay" : "yıl"}
          </p>
        </div>
      </div>

      {/* Renewal Info */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted mb-4">
        <RefreshCw className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          {subscription.cancelAtPeriodEnd ? (
            <p className="text-sm">
              <span className="text-yellow-600 font-medium">İptal edilecek: </span>
              {format(new Date(subscription.currentPeriodEnd), "d MMMM yyyy", { locale: tr })}
            </p>
          ) : isActive ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Yenilenme: </span>
              {format(new Date(subscription.currentPeriodEnd), "d MMMM yyyy", { locale: tr })}
              <span className="text-muted-foreground ml-1">
                ({formatDistanceToNow(new Date(subscription.currentPeriodEnd), { addSuffix: true, locale: tr })})
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sona erdi: {format(new Date(subscription.currentPeriodEnd), "d MMMM yyyy", { locale: tr })}
            </p>
          )}
        </div>
      </div>

      {/* Past Due Warning */}
      {subscription.status === "PAST_DUE" && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Ödeme Gecikmiş</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Lütfen ödeme yönteminizi güncelleyin
            </p>
          </div>
          <Button size="sm" variant="outline">
            Güncelle
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onManage && (
          <Button variant="outline" className="flex-1" onClick={onManage}>
            Yönet
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}

        {isActive && !subscription.cancelAtPeriodEnd && (
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleCancel}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "İptal Et"}
          </Button>
        )}

        {subscription.cancelAtPeriodEnd && (
          <Button
            variant="outline"
            onClick={handleResume}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Devam Ettir
          </Button>
        )}
      </div>
    </Card>
  );
}
