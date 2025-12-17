"use client";

import { useState } from "react";
import { Card, Button, Input, Label } from "@hyble/ui";
import {
  ShoppingCart,
  CreditCard,
  Wallet,
  Check,
  ChevronRight,
  ChevronLeft,
  Lock,
  Package,
  Loader2,
} from "lucide-react";

type Step = "cart" | "payment" | "confirm";
type PaymentMethod = "card" | "wallet" | "paypal";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutWizardProps {
  items?: CartItem[];
  walletBalance?: number;
  onComplete?: (orderId: string) => void;
  onCancel?: () => void;
}

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "cart", label: "Sepet", icon: <ShoppingCart className="h-5 w-5" /> },
  { id: "payment", label: "Ödeme", icon: <CreditCard className="h-5 w-5" /> },
  { id: "confirm", label: "Onay", icon: <Check className="h-5 w-5" /> },
];

export function CheckoutWizard({
  items = [],
  walletBalance = 0,
  onComplete,
  onCancel,
}: CheckoutWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("cart");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [useWalletFirst, setUseWalletFirst] = useState(true);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.2; // 20% VAT
  const total = subtotal + tax;
  const walletDeduction = useWalletFirst ? Math.min(walletBalance, total) : 0;
  const amountToPay = total - walletDeduction;

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStep === "cart") {
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      setCurrentStep("confirm");
    }
  };

  const handleBack = () => {
    if (currentStep === "payment") {
      setCurrentStep("cart");
    } else if (currentStep === "confirm") {
      setCurrentStep("payment");
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onComplete?.("ORD-" + Math.random().toString(36).substring(7).toUpperCase());
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps Indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                index <= currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.icon}
              <span className="hidden sm:inline text-sm font-medium">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="h-5 w-5 mx-2 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Cart Step */}
      {currentStep === "cart" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Sepetiniz
          </h2>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Sepetiniz boş</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Adet: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ara Toplam</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">KDV (%20)</span>
                  <span>€{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Toplam</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={onCancel}>
              İptal
            </Button>
            <Button onClick={handleNext} disabled={items.length === 0}>
              Ödemeye Geç
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Payment Step */}
      {currentStep === "payment" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Ödeme Yöntemi
          </h2>

          {/* Wallet Option */}
          {walletBalance > 0 && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Cüzdan Bakiyesi Kullan</p>
                    <p className="text-sm text-muted-foreground">
                      Mevcut bakiye: €{walletBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useWalletFirst}
                  onChange={(e) => setUseWalletFirst(e.target.checked)}
                  className="h-5 w-5 rounded"
                />
              </label>
              {useWalletFirst && walletDeduction > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  Cüzdandan €{walletDeduction.toFixed(2)} düşülecek
                </p>
              )}
            </div>
          )}

          {/* Payment Methods */}
          {amountToPay > 0 && (
            <div className="space-y-3 mb-6">
              <p className="text-sm text-muted-foreground">
                Ödenecek tutar: <strong>€{amountToPay.toFixed(2)}</strong>
              </p>

              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "card" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="h-4 w-4"
                />
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Kredi/Banka Kartı</span>
              </label>

              <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "paypal" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "paypal"}
                  onChange={() => setPaymentMethod("paypal")}
                  className="h-4 w-4"
                />
                <span className="font-bold text-[#003087]">Pay</span>
                <span className="font-bold text-[#009CDE]">Pal</span>
              </label>
            </div>
          )}

          {/* Card Form */}
          {paymentMethod === "card" && amountToPay > 0 && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label>Kart Numarası</Label>
                <Input placeholder="4242 4242 4242 4242" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Son Kullanma</Label>
                  <Input placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label>CVC</Label>
                  <Input placeholder="123" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Kart Üzerindeki İsim</Label>
                <Input placeholder="John Doe" />
              </div>
            </div>
          )}

          {amountToPay === 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
              <Check className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="font-medium text-green-700 dark:text-green-400">
                Cüzdan bakiyeniz yeterli!
              </p>
              <p className="text-sm text-muted-foreground">
                Ödeme tamamen cüzdan bakiyenizden karşılanacak.
              </p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="ghost" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Geri
            </Button>
            <Button onClick={handleNext}>
              Devam Et
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Confirm Step */}
      {currentStep === "confirm" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Check className="h-5 w-5" />
            Sipariş Özeti
          </h2>

          <div className="space-y-4 mb-6">
            {/* Items Summary */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-3">Ürünler</h3>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.name} x{item.quantity}</span>
                  <span>€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-3">Ödeme Detayları</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>KDV (%20)</span>
                  <span>€{tax.toFixed(2)}</span>
                </div>
                {walletDeduction > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Cüzdan</span>
                    <span>-€{walletDeduction.toFixed(2)}</span>
                  </div>
                )}
                {amountToPay > 0 && (
                  <div className="flex justify-between">
                    <span>{paymentMethod === "card" ? "Kart ile" : "PayPal ile"}</span>
                    <span>€{amountToPay.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Toplam</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Lock className="h-4 w-4" />
            <span>Ödemeniz güvenli SSL şifrelemesi ile korunmaktadır.</span>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Geri
            </Button>
            <Button onClick={handleComplete} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Ödemeyi Tamamla
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
