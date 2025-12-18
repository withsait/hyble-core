"use client";

import { useWishlist, WishlistProduct } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Heart, Package, ArrowLeft, ShoppingCart, Trash2,
  Eye, Monitor, Clock, Share2
} from "lucide-react";

const typeLabels: Record<string, string> = {
  DIGITAL: "Dijital Ürün",
  SUBSCRIPTION: "Abonelik",
  BUNDLE: "Paket",
  SERVICE: "Hizmet",
};

export default function WishlistPage() {
  const { items, itemCount, removeItem, clearAll } = useWishlist();
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

  const handleAddAllToCart = () => {
    items.forEach((item) => {
      addToCart({
        id: `${item.id}-base`,
        productId: item.id,
        variantId: null,
        slug: item.slug,
        name: item.nameTr,
        variantName: null,
        price: item.lowestPrice || 0,
        image: item.primaryImage,
        billingPeriod: item.type === "SUBSCRIPTION" ? "monthly" : null,
      });
    });
    clearAll();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Favorilerim - Hyble",
          url,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Favori Listeniz Boş
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca ulaşabilirsiniz.
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Mağazaya Git
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total value
  const totalValue = items.reduce((sum, item) => sum + (item.lowestPrice || 0), 0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/store"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                  Favorilerim
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {itemCount} ürün • Toplam değer: €{totalValue.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Paylaş
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Temizle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group"
            >
              {/* Preview Image */}
              <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
                {product.primaryImage ? (
                  <img
                    src={product.primaryImage}
                    alt={product.nameTr}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:bg-red-500 hover:text-white transition-all group/btn"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500 group-hover/btn:text-white group-hover/btn:fill-white" />
                </button>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link
                    href={`/store/${product.slug}`}
                    className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium text-sm flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    İncele
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {product.category?.nameTr || "Genel"}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(product.addedAt)}
                  </span>
                </div>

                <Link
                  href={`/store/${product.slug}`}
                  className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                >
                  {product.nameTr}
                </Link>

                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {product.shortDescTr || ""}
                </p>

                {/* Price & Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    {product.lowestPrice !== null ? (
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        €{product.lowestPrice.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">Fiyat için tıklayın</span>
                    )}
                    {product.type === "SUBSCRIPTION" && (
                      <span className="text-sm text-slate-400 ml-1">/ay</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Sepete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Toplam {itemCount} ürün
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tahmini toplam: €{totalValue.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/store"
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Alışverişe Devam Et
              </Link>
              <button
                onClick={handleAddAllToCart}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Tümünü Sepete Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
