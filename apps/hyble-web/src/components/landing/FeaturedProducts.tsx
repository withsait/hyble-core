// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package,
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  Server,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const typeIcons: Record<string, typeof Package> = {
  DIGITAL: Package,
  SUBSCRIPTION: Zap,
  BUNDLE: ShoppingBag,
  SERVICE: Server,
};

const typeLabels: Record<string, string> = {
  DIGITAL: "Dijital",
  SUBSCRIPTION: "Abonelik",
  BUNDLE: "Paket",
  SERVICE: "Hizmet",
};

export function FeaturedProducts() {
  const { data: productsData, isLoading } = trpc.pim.listProducts.useQuery({
    status: "ACTIVE",
    isFeatured: true,
    limit: 6,
  });

  const products = productsData?.products || [];

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse"
              >
                <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no featured products
  }

  return (
    <section className="relative py-16 lg:py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-gradient-to-r from-amber-400 to-orange-400 dark:opacity-10" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-gradient-to-r from-blue-400 to-cyan-400 dark:opacity-10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-6"
          >
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>Öne Çıkan Ürünler</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            En Popüler Hizmetlerimiz
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Binlerce müşterimizin tercih ettiği hosting ve cloud çözümlerimizi keşfedin.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product: any, index: number) => {
            const Icon = typeIcons[product.type] || Package;
            const lowestPrice = product.lowestPrice || product.basePrice;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/store/${product.slug}`}>
                  <div className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5">
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        <Star className="w-3 h-3 fill-white" />
                        Öne Çıkan
                      </span>
                    </div>

                    {/* Image/Icon Area */}
                    <div className="aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center relative overflow-hidden">
                      {product.primaryImage ? (
                        <img
                          src={product.primaryImage}
                          alt={product.nameTr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
                          <Icon className="w-16 h-16 text-primary/60 relative z-10" />
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Type Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full">
                          <Icon className="w-3.5 h-3.5" />
                          {typeLabels[product.type] || product.type}
                        </span>
                        {product.category && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {product.category.nameTr}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                        {product.nameTr}
                      </h3>
                      {product.shortDescTr && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                          {product.shortDescTr}
                        </p>
                      )}

                      {/* Tags */}
                      {product.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {product.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div>
                          {lowestPrice ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-primary">
                                €{Number(lowestPrice).toFixed(2)}
                              </span>
                              {product.type === "SUBSCRIPTION" && (
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  /ay
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              Fiyat için iletişim
                            </span>
                          )}
                          {product.variantCount > 1 && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {product.variantCount} plan mevcut
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                          İncele
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors group"
          >
            <ShoppingBag className="w-5 h-5" />
            Tüm Ürünleri Gör
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
