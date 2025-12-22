"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Card } from "@hyble/ui";
import {
  ArrowLeft, ShoppingCart, Package, Check, Star,
  ChevronRight, Zap, Shield, Clock, Loader2,
  CheckCircle2, ArrowRight, Monitor, ExternalLink, Plus,
  MessageSquare, Store
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { ProductReviews, WriteReviewForm } from "@/components/reviews";

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.hyble.co";

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  billingPeriod: string | null;
  isDefault: boolean;
  features: string[];
}

interface ProductMedia {
  id: string;
  url: string;
  type: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface Seller {
  id: string;
  displayName: string;
  slug: string;
  tier: string;
  isVerified: boolean;
  rating: number | null;
  totalSales: number;
  logo: string | null;
}

interface Product {
  id: string;
  slug: string;
  type: string;
  nameTr: string;
  nameEn: string;
  shortDescTr: string | null;
  shortDescEn: string | null;
  descriptionTr: string | null;
  descriptionEn: string | null;
  tags: string[];
  isFeatured: boolean;
  demoUrl: string | null;
  category: {
    id: string;
    nameTr: string;
    nameEn: string;
    slug: string;
  } | null;
  media: ProductMedia[];
  variants: ProductVariant[];
  lowestPrice: number | null;
  seller: Seller | null;
  averageRating: number | null;
  totalReviews: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/public/products/${slug}`);
        if (res.status === 404) {
          setError("not_found");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
        // Set default variant
        const defaultVariant = data.variants?.find((v: ProductVariant) => v.isDefault) || data.variants?.[0];
        setSelectedVariant(defaultVariant || null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Ürün yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error === "not_found" || !product) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ürün Bulunamadı</h1>
        <p className="text-slate-500 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
        <Link
          href="/store"
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Mağazaya Dön
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const primaryImage = product.media.find((m) => m.isPrimary) || product.media[0];
  const billingText = selectedVariant?.billingPeriod === "MONTHLY" ? "/ay" :
                      selectedVariant?.billingPeriod === "YEARLY" ? "/yıl" :
                      selectedVariant?.billingPeriod === "ONCE" ? "" : "";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/store" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Mağaza
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <Link href={`/store/category/${product.category.slug}`} className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                  {product.category.nameTr}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-medium">{product.nameTr}</span>
          </div>
        </div>
      </div>

      {/* Product Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Image */}
            <div>
              <Card className="aspect-video flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 relative overflow-hidden">
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={primaryImage.alt || product.nameTr}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-24 h-24 text-slate-300 dark:text-slate-600" />
                )}
                {product.isFeatured && (
                  <span className="absolute top-4 right-4 text-sm px-3 py-1 rounded-full font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                    Öne Çıkan
                  </span>
                )}
              </Card>

              {/* Gallery */}
              {product.media.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {product.media.slice(0, 4).map((media) => (
                    <div
                      key={media.id}
                      className={`aspect-video rounded-lg overflow-hidden cursor-pointer border-2 ${
                        media.id === primaryImage?.id ? "border-blue-500" : "border-transparent"
                      }`}
                    >
                      <img
                        src={media.url}
                        alt={media.alt || ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <Card className="mt-6 p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                    Etiketler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-sm rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right - Info & Purchase */}
            <div>
              {product.category && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {product.category.nameTr}
                  </span>
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {product.nameTr}
              </h1>

              {/* Rating & Reviews Count */}
              {product.totalReviews > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(product.averageRating || 0)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">
                    {product.averageRating?.toFixed(1)}
                  </span>
                  <a
                    href="#reviews"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    ({product.totalReviews} yorum)
                  </a>
                </div>
              )}

              {/* Seller Info */}
              {product.seller && (
                <Link
                  href={`/seller/${product.seller.slug}`}
                  className="flex items-center gap-3 p-3 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    {product.seller.logo ? (
                      <img src={product.seller.logo} alt={product.seller.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {product.seller.displayName}
                      </span>
                      {product.seller.isVerified && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      {product.seller.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {product.seller.rating.toFixed(1)}
                        </span>
                      )}
                      <span>{product.seller.totalSales} satış</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>
              )}

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                {product.descriptionTr || product.shortDescTr || product.descriptionEn || product.shortDescEn}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  €{selectedVariant?.price.toFixed(2) || product.lowestPrice?.toFixed(2) || "0.00"}
                </span>
                {billingText && (
                  <span className="text-lg text-slate-500 dark:text-slate-400">
                    {billingText}
                  </span>
                )}
              </div>

              {/* Variants */}
              {product.variants.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Plan Seçin
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedVariant?.id === variant.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50"
                        }`}
                      >
                        <p className="font-semibold text-slate-900 dark:text-white mb-1">
                          {variant.name}
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          €{variant.price.toFixed(2)}
                          {variant.billingPeriod === "MONTHLY" && <span className="text-sm font-normal text-slate-500">/ay</span>}
                          {variant.billingPeriod === "YEARLY" && <span className="text-sm font-normal text-slate-500">/yıl</span>}
                        </p>
                        {variant.features.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {variant.features.slice(0, 3).map((f, j) => (
                              <p key={j} className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-500" />
                                {f}
                              </p>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  onClick={() => {
                    const primaryImage = product.media.find((m) => m.isPrimary) || product.media[0];
                    addItem({
                      id: `${product.id}-${selectedVariant?.id || "base"}`,
                      productId: product.id,
                      variantId: selectedVariant?.id || null,
                      slug: product.slug,
                      name: product.nameTr,
                      variantName: selectedVariant?.name || null,
                      price: selectedVariant?.price || product.lowestPrice || 0,
                      image: primaryImage?.url || null,
                      billingPeriod: selectedVariant?.billingPeriod || null,
                    });
                    setAddedToCart(true);
                    setTimeout(() => setAddedToCart(false), 2000);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl transition-all ${
                    addedToCart
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Sepete Eklendi!
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Sepete Ekle
                    </>
                  )}
                </button>
                <Link
                  href="/contact"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
                >
                  Soru Sor
                </Link>
              </div>

              {/* Demo Button */}
              {product.demoUrl && (
                <div className="mb-8">
                  <Link
                    href={`/demo/${product.slug}`}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
                  >
                    <Monitor className="w-5 h-5" />
                    Canlı Demo
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Satın almadan önce şablonu canlı olarak inceleyin
                  </p>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, text: "Anında Aktivasyon" },
                  { icon: Shield, text: "Güvenli Ödeme" },
                  { icon: Clock, text: "7/24 Destek" },
                  { icon: Star, text: "30 Gün İade" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <badge.icon className="w-4 h-4 text-green-500" />
                    {badge.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features from variant */}
      {selectedVariant && selectedVariant.features.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
              Özellikler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedVariant.features.map((feature, i) => (
                <Card key={i} className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <div id="reviews">
        <ProductReviews productId={product.id} productSlug={product.slug} />
      </div>

      {/* Related Products CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Diğer ürünlerimizi de keşfedin
          </h2>
          <p className="text-blue-100 mb-8">
            İhtiyaçlarınıza uygun daha fazla ürün ve çözüm bulun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/store"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              Mağazaya Dön
              <ArrowRight className="w-4 h-4" />
            </Link>
            {product.category && (
              <Link
                href={`/store/category/${product.category.slug}`}
                className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
              >
                {product.category.nameTr}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
