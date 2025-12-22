"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";
import {
  CreditCard,
  Wallet,
  Loader2,
  Check,
  Shield,
  Lock,
  ChevronRight,
  AlertCircle
} from "lucide-react";

// Mock data - will be replaced with tRPC when payment router is ready
const mockWallet = {
  mainBalance: 50.00,
  bonusBalance: 10.00,
  promoBalance: 5.00,
};

const mockSavedCards: any[] = [];

interface CheckoutFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
}

type PaymentMethod = "wallet" | "card" | "saved_card";

export function CheckoutForm({ orderId, amount, currency, onSuccess }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [useWalletPartial, setUseWalletPartial] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with tRPC queries when payment router is ready
  const wallet = mockWallet;
  const savedCards = mockSavedCards;

  const currencySymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "₺";
  const totalBalance = (wallet?.mainBalance ?? 0) + (wallet?.bonusBalance ?? 0) + (wallet?.promoBalance ?? 0);
  const canPayWithWallet = totalBalance >= amount;
  const remainingAfterWallet = Math.max(0, amount - totalBalance);

  const handlePayment = async () => {
    setIsLoading(true);
    // TODO: Replace with tRPC mutations when payment router is ready
    await new Promise(resolve => setTimeout(resolve, 500));

    if (paymentMethod === "wallet") {
      onSuccess?.();
    } else if (paymentMethod === "card") {
      // Redirect to checkout
      alert("Stripe checkout would open here");
    } else if (paymentMethod === "saved_card" && selectedCardId) {
      onSuccess?.();
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Ödenecek Tutar</span>
          <span className="text-2xl font-bold">{currencySymbol}{amount.toFixed(2)}</span>
        </div>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-3">
        <h3 className="font-medium">Ödeme Yöntemi</h3>

        {/* Wallet Option */}
        <button
          onClick={() => setPaymentMethod("wallet")}
          disabled={!canPayWithWallet}
          className={`w-full p-4 rounded-lg border text-left transition-all ${
            paymentMethod === "wallet"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/50"
          } ${!canPayWithWallet ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${paymentMethod === "wallet" ? "bg-primary/10" : "bg-muted"}`}>
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Cüzdan ile Öde</p>
                <p className="text-sm text-muted-foreground">
                  Bakiye: {currencySymbol}{totalBalance.toFixed(2)}
                </p>
              </div>
            </div>
            {paymentMethod === "wallet" && <Check className="h-5 w-5 text-primary" />}
          </div>
          {!canPayWithWallet && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Yetersiz bakiye
            </p>
          )}
        </button>

        {/* Saved Cards */}
        {savedCards && savedCards.length > 0 && (
          <div className="space-y-2">
            {savedCards.map((card: any) => (
              <button
                key={card.id}
                onClick={() => {
                  setPaymentMethod("saved_card");
                  setSelectedCardId(card.id);
                }}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  paymentMethod === "saved_card" && selectedCardId === card.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      paymentMethod === "saved_card" && selectedCardId === card.id
                        ? "bg-primary/10"
                        : "bg-muted"
                    }`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{card.brand} •••• {card.last4}</p>
                      <p className="text-sm text-muted-foreground">
                        Son kullanma: {card.expMonth}/{card.expYear}
                      </p>
                    </div>
                  </div>
                  {paymentMethod === "saved_card" && selectedCardId === card.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* New Card Option */}
        <button
          onClick={() => setPaymentMethod("card")}
          className={`w-full p-4 rounded-lg border text-left transition-all ${
            paymentMethod === "card"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${paymentMethod === "card" ? "bg-primary/10" : "bg-muted"}`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Kredi/Banka Kartı</p>
                <p className="text-sm text-muted-foreground">Stripe güvenli ödeme</p>
              </div>
            </div>
            {paymentMethod === "card" && <Check className="h-5 w-5 text-primary" />}
          </div>
        </button>

        {/* Hybrid Payment Option */}
        {(paymentMethod === "card" || paymentMethod === "saved_card") && totalBalance > 0 && (
          <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
            <input
              type="checkbox"
              checked={useWalletPartial}
              onChange={(e) => setUseWalletPartial(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <div className="flex-1">
              <p className="font-medium">Cüzdan bakiyesini kullan</p>
              <p className="text-sm text-muted-foreground">
                {currencySymbol}{Math.min(totalBalance, amount).toFixed(2)} cüzdandan, {currencySymbol}{remainingAfterWallet.toFixed(2)} karttan
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>256-bit SSL şifreleme ile güvenli ödeme</span>
      </div>

      {/* Pay Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handlePayment}
        disabled={isLoading || (paymentMethod === "saved_card" && !selectedCardId)}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Lock className="h-5 w-5 mr-2" />
        )}
        {currencySymbol}{(useWalletPartial && paymentMethod !== "wallet" ? remainingAfterWallet : amount).toFixed(2)} Öde
        <ChevronRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
}
