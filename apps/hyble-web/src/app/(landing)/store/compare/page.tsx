"use client";

import { useCompare } from "@/lib/compare-context";
import Link from "next/link";
import {
  GitCompare, Package, ArrowLeft, X, Check, Minus,
  ShoppingCart, Eye, Monitor, Star, Tag, Layers
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

const typeLabels: Record<string, string> = {
  DIGITAL: "Dijital Ürün",
  SUBSCRIPTION: "Abonelik",
  BUNDLE: "Paket",
  SERVICE: "Hizmet",
};

export default function ComparePage() {
  const { items, removeItem, clearAll, itemCount } = useCompare();
  const { addItem: addToCart } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <GitCompare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Karşılaştırma Listesi Boş
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Ürünleri karşılaştırmak için mağazadan ürün seçin.
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

  if (itemCount === 1) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <GitCompare className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            En Az 2 Ürün Gerekli
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Karşılaştırma yapmak için en az 2 ürün seçmeniz gerekiyor.
          </p>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Daha Fazla Ürün Seç
          </Link>
        </div>
      </div>
    );
  }

  // Get all unique tags from all products
  const allTags = [...new Set(items.flatMap((p) => p.tags))];

  // Check if a product has a specific tag
  const hasTag = (product: typeof items[0], tag: string) => product.tags.includes(tag);

  // Handle add to cart
  const handleAddToCart = (product: typeof items[0]) => {
    addToCart({
      id: `${product.id}-base`,
      productId: product.id,
      variantId: null,
      slug: product.slug,
      name: product.nameTr,
      variantName: null,
      price: product.lowestPrice || product.basePrice || 0,
      image: product.primaryImage,
      billingPeriod: product.type === "SUBSCRIPTION" ? "monthly" : null,
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/store"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitCompare className="w-6 h-6 text-blue-600" />
                  Ürün Karşılaştırma
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {itemCount} ürün karşılaştırılıyor
                </p>
              </div>
            </div>
            <button
              onClick={clearAll}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              Listeyi Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            {/* Product Headers */}
            <thead>
              <tr>
                <th className="w-48 p-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-tl-lg">
                  Özellik
                </th>
                {items.map((product) => (
                  <th
                    key={product.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 last:rounded-tr-lg"
                  >
                    <div className="relative">
                      <button
                        onClick={() => removeItem(product.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {product.primaryImage ? (
                          <img
                            src={product.primaryImage}
                            alt={product.nameTr}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-slate-400" />
                        )}
                      </div>

                      <Link
                        href={`/store/${product.slug}`}
                        className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {product.nameTr}
                      </Link>

                      {/* Quick Actions */}
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <Link
                          href={`/store/${product.slug}`}
                          className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          title="İncele"
                        >
                          <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </Link>
                        {product.demoUrl && (
                          <Link
                            href={`/demo/${product.slug}`}
                            className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                            title="Demo"
                          >
                            <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          title="Sepete Ekle"
                        >
                          <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {/* Price Row */}
              <tr>
                <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
                  Fiyat
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.lowestPrice !== null ? (
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        €{product.lowestPrice.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                    {product.type === "SUBSCRIPTION" && (
                      <span className="text-sm text-slate-400 ml-1">/ay</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Type Row */}
              <tr>
                <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
                  Ürün Tipi
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-400">
                      <Layers className="w-3.5 h-3.5" />
                      {typeLabels[product.type] || product.type}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Category Row */}
              <tr>
                <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
                  Kategori
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center text-sm text-slate-600 dark:text-slate-400">
                    {product.category?.nameTr || "-"}
                  </td>
                ))}
              </tr>

              {/* Featured Row */}
              <tr>
                <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
                  Öne Çıkan
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.isFeatured ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        Evet
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Variant Count Row */}
              <tr>
                <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
                  Varyant Sayısı
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center text-sm text-slate-600 dark:text-slate-400">
                    {product.variantCount > 0 ? `${product.variantCount} seçenek` : "-"}
                  </td>
                ))}
              </tr>

              {/* Demo Row */}
              <tr>
                <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
                  Demo Mevcut
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.demoUrl ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        <Check className="w-5 h-5 mx-auto" />
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">
                        <Minus className="w-5 h-5 mx-auto" />
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Description Row */}
              <tr>
                <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
                  Açıklama
                </td>
                {items.map((product) => (
                  <td key={product.id} className="p-4 text-center text-sm text-slate-600 dark:text-slate-400">
                    {product.shortDescTr || product.shortDescEn || "-"}
                  </td>
                ))}
              </tr>

              {/* Tags Section Header */}
              {allTags.length > 0 && (
                <tr>
                  <td
                    colSpan={items.length + 1}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                      <Tag className="w-4 h-4" />
                      Etiketler & Özellikler
                    </div>
                  </td>
                </tr>
              )}

              {/* Tag Rows */}
              {allTags.map((tag) => (
                <tr key={tag}>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 capitalize">
                    {tag}
                  </td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {hasTag(product, tag) ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          <Check className="w-5 h-5 mx-auto" />
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">
                          <Minus className="w-5 h-5 mx-auto" />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 dark:text-slate-400">
              Karşılaştırmayı tamamladınız mı? Ürün detaylarına göz atın veya sepete ekleyin.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/store"
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Daha Fazla Ürün Ekle
              </Link>
              <Link
                href="/store"
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
