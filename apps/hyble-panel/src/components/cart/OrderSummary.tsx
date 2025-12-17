"use client";

import { Card } from "@hyble/ui";
import { Loader2, Package, Tag, Percent, CreditCard } from "lucide-react";

// Mock data - will be replaced with tRPC when cart/wallet routers are ready
const mockCart = {
  items: [],
  subtotal: 0,
  discount: 0,
  tax: 0,
  taxRate: 20,
  total: 0,
  currency: "EUR",
  coupon: null,
};

const mockWallet = {
  mainBalance: 125.50,
  bonusBalance: 15.00,
  promoBalance: 5.00,
};

interface OrderSummaryProps {
  showWalletBalance?: boolean;
}

export function OrderSummary({ showWalletBalance = true }: OrderSummaryProps) {
  // TODO: Replace with tRPC queries when cart/wallet routers are ready
  const cart = mockCart;
  const wallet = mockWallet;
  const cartLoading = false;

  if (cartLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (!cart || !cart.items?.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Sepetiniz boş
      </Card>
    );
  }

  const currencySymbol = cart.currency === "EUR" ? "€" : cart.currency === "USD" ? "$" : "₺";
  const totalBalance = wallet ? (wallet.mainBalance ?? 0) + (wallet.bonusBalance ?? 0) + (wallet.promoBalance ?? 0) : 0;
  const canPayWithWallet = totalBalance >= cart.total;

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Package className="h-5 w-5" />
        Sipariş Özeti
      </h3>

      {/* Items */}
      <div className="space-y-3">
        {cart.items.map((item: any) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="font-medium line-clamp-1">{item.name}</p>
              {item.variant && (
                <p className="text-xs text-muted-foreground">{item.variant}</p>
              )}
              {item.quantity > 1 && (
                <p className="text-xs text-muted-foreground">x{item.quantity}</p>
              )}
            </div>
            <span className="ml-4">
              {currencySymbol}{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Ara Toplam</span>
          <span>{currencySymbol}{cart.subtotal?.toFixed(2)}</span>
        </div>

        {/* Discount */}
        {cart.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              İndirim
              {cart.coupon && (
                <span className="text-xs bg-green-100 dark:bg-green-900 px-1.5 py-0.5 rounded">
                  {cart.coupon}
                </span>
              )}
            </span>
            <span>-{currencySymbol}{cart.discount?.toFixed(2)}</span>
          </div>
        )}

        {/* Tax */}
        {cart.tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">KDV (%{cart.taxRate || 20})</span>
            <span>{currencySymbol}{cart.tax?.toFixed(2)}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Toplam</span>
          <span>{currencySymbol}{cart.total?.toFixed(2)}</span>
        </div>
      </div>

      {/* Wallet Balance */}
      {showWalletBalance && wallet && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Cüzdan Bakiyesi
            </span>
            <span className={canPayWithWallet ? "text-green-600 font-medium" : ""}>
              {currencySymbol}{totalBalance.toFixed(2)}
            </span>
          </div>
          {canPayWithWallet && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Cüzdan ile ödeyebilirsiniz
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
