"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button, Input, Card } from "@hyble/ui";
import {
  X,
  Loader2,
  CreditCard,
  Plus,
  Gift,
  Check,
  Sparkles
} from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const presetAmounts = [10, 25, 50, 100, 250, 500];

const bonusTiers = [
  { min: 50, bonus: 5, label: "€50+ yükle, €5 bonus kazan!" },
  { min: 100, bonus: 15, label: "€100+ yükle, €15 bonus kazan!" },
  { min: 250, bonus: 50, label: "€250+ yükle, €50 bonus kazan!" },
  { min: 500, bonus: 125, label: "€500+ yükle, €125 bonus kazan!" },
];

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");

  const createDepositSession = trpc.wallet.createDepositSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      alert(`Hata: ${error.message}`);
    },
  });

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const getBonus = (depositAmount: number) => {
    const tier = [...bonusTiers].reverse().find(t => depositAmount >= t.min);
    return tier?.bonus || 0;
  };

  const currentBonus = getBonus(amount);
  const nextTier = bonusTiers.find(t => amount < t.min);

  const handleDeposit = () => {
    if (amount < 5) {
      alert("Minimum yükleme tutarı €5'dir");
      return;
    }
    createDepositSession.mutate({ amount });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Bakiye Yükle</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Preset Amounts */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tutar Seçin</label>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => {
                const bonus = getBonus(preset);
                return (
                  <button
                    key={preset}
                    onClick={() => handleAmountSelect(preset)}
                    className={`relative p-3 rounded-lg border text-center transition-all ${
                      amount === preset && !customAmount
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-semibold">€{preset}</span>
                    {bonus > 0 && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        +€{bonus}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="text-sm font-medium mb-2 block">Veya Özel Tutar</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              <Input
                type="number"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-7"
                min="5"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Minimum: €5</p>
          </div>

          {/* Bonus Info */}
          {currentBonus > 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="p-2 bg-green-500/20 rounded-full">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-600">+€{currentBonus} Bonus!</p>
                <p className="text-sm text-muted-foreground">Bu yükleme ile kazanacaksınız</p>
              </div>
            </div>
          )}

          {/* Next Tier Hint */}
          {nextTier && !currentBonus && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{nextTier.label}</p>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Yükleme Tutarı</span>
              <span>€{amount.toFixed(2)}</span>
            </div>
            {currentBonus > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Bonus</span>
                <span>+€{currentBonus.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Toplam Bakiye Artışı</span>
              <span>€{(amount + currentBonus).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            İptal
          </Button>
          <Button
            className="flex-1"
            onClick={handleDeposit}
            disabled={amount < 5 || createDepositSession.isPending}
          >
            {createDepositSession.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            Ödemeye Geç
          </Button>
        </div>
      </Card>
    </div>
  );
}
