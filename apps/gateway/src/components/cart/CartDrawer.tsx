"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  ArrowRight,
} from "lucide-react";

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    tax,
    total,
    removeItem,
    updateQuantity,
    clearCart,
    isOpen,
    setIsOpen,
  } = useCart();

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Sepetim
            {itemCount > 0 && (
              <span className="text-sm font-normal text-slate-500">
                ({itemCount} ürün)
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Sepetiniz boş
              </p>
              <Link
                href="/store"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/store/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.variantName}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        €{item.price.toFixed(2)}
                        {item.billingPeriod === "MONTHLY" && (
                          <span className="text-sm font-normal text-slate-400">/ay</span>
                        )}
                        {item.billingPeriod === "YEARLY" && (
                          <span className="text-sm font-normal text-slate-400">/yıl</span>
                        )}
                      </p>

                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-slate-500" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors self-start"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full text-sm text-slate-500 hover:text-red-500 transition-colors py-2"
              >
                Sepeti Temizle
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 space-y-4">
            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Ara Toplam</span>
                <span className="text-slate-900 dark:text-white">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">KDV (%20)</span>
                <span className="text-slate-900 dark:text-white">€{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-900 dark:text-white">Toplam</span>
                <span className="text-blue-600 dark:text-blue-400">€{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <a
              href="https://id.hyble.co/auth/login?redirect=/dashboard/checkout"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Ödemeye Geç
              <ArrowRight className="w-4 h-4" />
            </a>

            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Ödeme için giriş yapmanız gerekmektedir
            </p>
          </div>
        )}
      </div>
    </Fragment>
  );
}
