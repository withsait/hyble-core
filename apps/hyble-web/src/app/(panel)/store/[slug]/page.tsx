// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Check,
  Star,
  Loader2,
  ChevronRight,
  Info,
  Zap,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // tRPC queries
  const { data: product, isLoading } = trpc.pim.getProductBySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Ürün bulunamadı</p>
        <Link href="/store">
          <Button>Mağazaya Dön</Button>
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const currentVariant = selectedVariant
    ? variants.find((v: any) => v.id === selectedVariant)
    : variants.find((v: any) => v.isDefault) || variants[0];

  const handleAddToCart = () => {
    if (!currentVariant) return;
    // TODO: Add to cart via tRPC
    alert(`"${currentVariant.name}" sepete eklendi!`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/store" className="hover:text-foreground">
          Mağaza
        </Link>
        <ChevronRight className="h-4 w-4" />
        {product.category && (
          <>
            <Link href={`/store?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.nameTr}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground">{product.nameTr}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-2">
          {/* Main Image */}
          <Card className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
            {product.media?.length > 0 ? (
              <img
                src={product.media.find((m: any) => m.isPrimary)?.url || product.media[0]?.url}
                alt={product.nameTr}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-20 w-20 text-primary/30" />
            )}
          </Card>

          {/* Thumbnails */}
          {product.media?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.media.map((media: any, i: number) => (
                <div
                  key={media.id}
                  className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer"
                >
                  <img src={media.url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <Card className="p-6 mt-6">
            <h2 className="font-semibold mb-4">Ürün Açıklaması</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {product.descriptionTr ? (
                <p className="whitespace-pre-wrap">{product.descriptionTr}</p>
              ) : (
                <p className="text-muted-foreground">Açıklama mevcut değil.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Purchase */}
        <div className="space-y-4">
          {/* Title & Price */}
          <Card className="p-6">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h1 className="text-xl font-bold">{product.nameTr}</h1>
                {product.shortDescTr && (
                  <p className="text-sm text-muted-foreground mt-1">{product.shortDescTr}</p>
                )}
              </div>
              {product.isFeatured && (
                <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Öne Çıkan
                </span>
              )}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Plan Seçin</label>
                <div className="space-y-2">
                  {variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        currentVariant?.id === variant.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{variant.name}</p>
                          {variant.billingPeriod && (
                            <p className="text-xs text-muted-foreground">
                              {variant.billingPeriod === "monthly" && "Aylık"}
                              {variant.billingPeriod === "quarterly" && "3 Aylık"}
                              {variant.billingPeriod === "annually" && "Yıllık"}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            €{Number(variant.price).toFixed(2)}
                          </p>
                          {variant.billingPeriod && (
                            <p className="text-xs text-muted-foreground">
                              /{variant.billingPeriod === "monthly" ? "ay" : variant.billingPeriod === "quarterly" ? "3 ay" : "yıl"}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Summary */}
            {currentVariant && (
              <div className="border-t pt-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Seçilen plan:</span>
                  <span className="font-medium">{currentVariant.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Toplam:</span>
                  <span className="text-2xl font-bold text-primary">
                    €{Number(currentVariant.price).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToCart}
              disabled={!currentVariant}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Sepete Ekle
            </Button>
          </Card>

          {/* Features */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Özellikler
            </h3>
            <ul className="space-y-2">
              {[
                "7/24 Teknik Destek",
                "99.9% Uptime Garantisi",
                "Anında Aktivasyon",
                "Para İade Garantisi",
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </Card>

          {/* Support */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Yardıma mı ihtiyacınız var?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Destek ekibimiz size yardımcı olmaktan mutluluk duyar.
                </p>
                <Link href="/support/new">
                  <Button variant="link" size="sm" className="px-0 mt-1">
                    Destek Talebi Oluştur
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
