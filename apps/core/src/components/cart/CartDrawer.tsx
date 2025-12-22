"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@hyble/ui";
import {
  X,
  ShoppingCart,
  Trash2,
  Loader2,
  ArrowRight,
  ShoppingBag
} from "lucide-react";
import { CartItem } from "./CartItem";
import { CouponInput } from "./CouponInput";
import { trpc } from "@/lib/trpc/client";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { data: cart, isLoading } = trpc.cart.get.useQuery(undefined, { enabled: isOpen });
  const utils = trpc.useUtils();

  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  const handleClearCart = async () => {
    await clearMutation.mutateAsync();
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.subtotal || "0");
  const discount = parseFloat(cart?.discount || "0");
  const total = parseFloat(cart?.total || "0");
  const currencySymbol = cart?.currency === "EUR" ? "€" : cart?.currency === "USD" ? "$" : "₺";
  const isClearing = clearMutation.isPending;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Sepetim</h2>
            {items.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="font-medium text-lg">Sepetiniz boş</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ürünleri keşfetmeye başlayın
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Ürünlere Göz At
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              {items.map((item: any) => (
                <CartItem key={item.id} item={item} />
              ))}

              {/* Clear Cart */}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive w-full"
                onClick={handleClearCart}
                disabled={isClearing}
              >
                {isClearing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Sepeti Temizle
              </Button>

              {/* Coupon */}
              <div className="pt-4 border-t">
                <CouponInput />
              </div>
            </div>
          )}
        </div>

        {/* Footer - Summary */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4 bg-muted/30">
            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim</span>
                  <span>-{currencySymbol}{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Toplam</span>
                <span>{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full h-11 inline-flex items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ödemeye Geç
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>

            {/* Continue Shopping */}
            <Button variant="ghost" className="w-full" onClick={onClose}>
              Alışverişe Devam Et
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
