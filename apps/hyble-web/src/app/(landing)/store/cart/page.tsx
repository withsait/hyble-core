"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Loader2,
  ShoppingBag,
  X,
} from "lucide-react";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  thumbnail?: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  useEffect(() => {
    // Load cart from localStorage
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (err) {
        console.error("Error loading cart:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discount / 100) : 0;
  const total = subtotal - discount;

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const newItems = items.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    saveCart(newItems);
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = items.filter((item) => item.id !== itemId);
    saveCart(newItems);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(null);
    setCouponLoading(true);

    // Simulate coupon validation
    setTimeout(() => {
      if (couponCode.toUpperCase() === "HYBLE10") {
        setAppliedCoupon({ code: couponCode.toUpperCase(), discount: 10 });
        setCouponCode("");
      } else {
        setCouponError("Geçersiz kupon kodu");
      }
      setCouponLoading(false);
    }, 500);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Sepetim
        </h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/store/${item.productSlug}`}
                        className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      {item.variantName && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {item.variantName}
                        </p>
                      )}

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 dark:text-white">
                            €{(item.unitPrice * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-slate-500">€{item.unitPrice.toFixed(2)} / adet</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors self-start"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Sipariş Özeti
                </h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          {appliedCoupon.code} (-%{appliedCoupon.discount})
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-green-600 dark:text-green-400 hover:text-green-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Kupon kodu"
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors"
                        >
                          {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uygula"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-500 mt-2">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Ara Toplam</span>
                    <span className="text-slate-900 dark:text-white">€{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">İndirim</span>
                      <span className="text-green-600 dark:text-green-400">-€{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Toplam</span>
                    <span className="font-bold text-xl text-slate-900 dark:text-white">€{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/store/checkout"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Ödemeye Geç
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                  Güvenli ödeme • SSL korumalı
                </p>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="p-16 text-center">
            <ShoppingCart className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Sepetiniz Boş
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Henüz sepetinize ürün eklemediniz. Mağazamızı keşfedin!
            </p>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Mağazaya Git
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
