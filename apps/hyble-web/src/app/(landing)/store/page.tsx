"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Layout, ShoppingCart, Rocket, Package, ChevronRight,
  Search, Star, Eye, Download, Code, Palette, Zap,
  Shield, ArrowRight, Filter, Grid3X3, List, Loader2,
  Monitor
} from "lucide-react";

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.hyble.co";

// Kategori ikonları
const categoryIcons: Record<string, typeof Layout> = {
  "website-templates": Layout,
  "ecommerce": ShoppingCart,
  "landing-pages": Rocket,
  "saas-templates": Code,
  "vps": Package,
  "web-hosting": Package,
  "game-servers": Package,
};

interface Product {
  id: string;
  slug: string;
  type: string;
  nameTr: string;
  nameEn: string;
  shortDescTr: string | null;
  shortDescEn: string | null;
  tags: string[];
  isFeatured: boolean;
  demoUrl: string | null;
  category: {
    id: string;
    nameTr: string;
    nameEn: string;
    slug: string;
  } | null;
  primaryImage: string | null;
  lowestPrice: number | null;
  basePrice: number | null;
  variantCount: number;
}

interface Category {
  id: string;
  nameTr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  productCount: number;
}

export default function StorePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products and categories
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/public/products?limit=50`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Ürünler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter products by search
  const filteredProducts = products.filter((p) =>
    searchQuery
      ? p.nameTr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  // Featured products (isFeatured = true or first 6)
  const featuredProducts = filteredProducts.filter((p) => p.isFeatured).length > 0
    ? filteredProducts.filter((p) => p.isFeatured)
    : filteredProducts.slice(0, 6);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Premium Şablonlar
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Profesyonel tasarımcılar tarafından hazırlanmış, production-ready şablonlar.
              Tek seferlik ödeme, ömür boyu erişim.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Şablon ara... (örn: e-ticaret, landing page, blog)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Kategoriler</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-slate-500 py-4">Henüz kategori bulunmuyor</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.slug] || Package;
                return (
                  <Link
                    key={category.id}
                    href={`/store/category/${category.slug}`}
                    className="group"
                  >
                    <Card className="p-4 h-full border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                          <IconComponent className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {category.nameTr}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {category.productCount} ürün
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Templates */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {searchQuery ? "Arama Sonuçları" : "Öne Çıkan Ürünler"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {searchQuery
                  ? `"${searchQuery}" için ${filteredProducts.length} sonuç`
                  : "En popüler ve çok satan ürünler"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-800">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid" ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-400"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded ${viewMode === "list" ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-400"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tekrar Dene
              </button>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {searchQuery ? "Arama kriterlerine uygun ürün bulunamadı" : "Henüz ürün bulunmuyor"}
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {(searchQuery ? filteredProducts : featuredProducts).map((product) => (
                <Link
                  key={product.id}
                  href={`/store/${product.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden h-full border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all">
                    {/* Preview Image */}
                    <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
                      {product.primaryImage ? (
                        <img
                          src={product.primaryImage}
                          alt={product.nameTr}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                          <Package className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                        </>
                      )}

                      {/* Badge */}
                      {product.isFeatured && (
                        <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                          Öne Çıkan
                        </span>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <span className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium text-sm flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          İncele
                        </span>
                        {product.demoUrl && (
                          <Link
                            href={`/demo/${product.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-emerald-600 transition-colors"
                          >
                            <Monitor className="w-4 h-4" />
                            Demo
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {product.category?.nameTr || "Genel"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {product.type === "SUBSCRIPTION" ? "Abonelik" :
                           product.type === "DIGITAL" ? "Dijital" :
                           product.type === "BUNDLE" ? "Paket" : "Hizmet"}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.nameTr}
                      </h3>

                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {product.shortDescTr || product.shortDescEn || ""}
                      </p>

                      {/* Tags */}
                      {product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {product.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                          {product.tags.length > 3 && (
                            <span className="text-xs px-2 py-0.5 text-slate-400">
                              +{product.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-baseline gap-2">
                          {product.lowestPrice !== null ? (
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                              €{product.lowestPrice.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500">Fiyat için tıklayın</span>
                          )}
                          {product.type === "SUBSCRIPTION" && (
                            <span className="text-sm text-slate-400">/ay</span>
                          )}
                        </div>
                        {product.variantCount > 1 && (
                          <span className="text-xs text-slate-500">
                            {product.variantCount} seçenek
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!searchQuery && filteredProducts.length > featuredProducts.length && (
            <div className="text-center mt-8">
              <Link
                href="/store?all=true"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
              >
                Tüm Ürünleri Gör ({filteredProducts.length})
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Our Templates */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-8">
            Neden Hyble?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: Code,
                title: "Clean Code",
                desc: "TypeScript, best practices ve modern standartlarla yazılmış temiz kod.",
              },
              {
                icon: Palette,
                title: "Özelleştirilebilir",
                desc: "Tailwind CSS ile kolay özelleştirme. Renkler, fontlar, layout.",
              },
              {
                icon: Zap,
                title: "Yüksek Performans",
                desc: "Lighthouse 95+ skor. Hızlı yükleme, optimize edilmiş assets.",
              },
              {
                icon: Shield,
                title: "Ömür Boyu Güncelleme",
                desc: "Tek seferlik ödeme, ömür boyu güncelleme ve destek.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Cloud hosting mi arıyorsunuz?
          </h2>
          <p className="text-slate-400 mb-6">
            VPS sunucular, web hosting ve managed database çözümleri için Cloud sayfamızı ziyaret edin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cloud"
              className="px-6 py-2.5 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cloud Çözümleri
            </Link>
            <Link
              href="/contact"
              className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Özel Proje Teklifi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
