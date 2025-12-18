"use client";

import { useWishlist, WishlistProduct } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { X, Heart, Package, ShoppingCart, Trash2, ExternalLink } from "lucide-react";

export function WishlistDrawer() {
  const { items, itemCount, removeItem, clearAll, isOpen, setIsOpen } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleAddToCart = (product: WishlistProduct) => {
    addToCart({
      id: `${product.id}-base`,
      productId: product.id,
      variantId: null,
      slug: product.slug,
      name: product.nameTr,
      variantName: null,
      price: product.lowestPrice || 0,
      image: product.primaryImage,
      billingPeriod: product.type === "SUBSCRIPTION" ? "monthly" : null,
    });
    removeItem(product.id);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Favorilerim ({itemCount})
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Heart className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Favori listeniz boş
              </p>
              <Link
                href="/store"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mağazaya Git
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link
                      href={`/store/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex-shrink-0 w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden"
                    >
                      {item.primaryImage ? (
                        <img
                          src={item.primaryImage}
                          alt={item.nameTr}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/store/${item.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                      >
                        {item.nameTr}
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.category?.nameTr || "Genel"}
                      </p>
                      {item.lowestPrice !== null && (
                        <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          €{item.lowestPrice.toFixed(2)}
                          {item.type === "SUBSCRIPTION" && (
                            <span className="text-sm font-normal text-slate-400">/ay</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Sepete Ekle
                    </button>
                    <Link
                      href={`/store/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800 transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={clearAll}
                className="text-sm text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Listeyi Temizle
              </button>
              <p className="text-sm text-slate-500">
                {itemCount} ürün
              </p>
            </div>
            <Link
              href="/store/wishlist"
              onClick={() => setIsOpen(false)}
              className="block w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg text-center hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Favori Sayfasına Git
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
