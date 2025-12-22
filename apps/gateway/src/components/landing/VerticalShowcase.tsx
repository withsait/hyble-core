"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Briefcase,
  Gamepad2,
  ArrowRight,
  Globe,
  ShoppingCart,
  Server,
  Puzzle,
  Package,
  Sparkles,
} from "lucide-react";

const tabs = [
  {
    id: "digital",
    label: "Kurumsal",
    icon: Briefcase,
    gradient: "from-amber-500 to-orange-500",
    activeGradient: "from-amber-500 to-orange-500",
  },
  {
    id: "studios",
    label: "Gaming",
    icon: Gamepad2,
    gradient: "from-emerald-500 to-teal-500",
    activeGradient: "from-emerald-500 to-teal-500",
  },
];

const digitalProducts = [
  {
    id: 1,
    title: "Kurumsal Web Sitesi",
    description: "Profesyonel, modern ve mobil uyumlu web siteleri",
    icon: Globe,
    features: ["Responsive", "SEO", "SSL"],
    price: "₺499",
    priceLabel: "'dan",
    href: "https://digital.hyble.co/templates",
    badge: "Populer",
  },
  {
    id: 2,
    title: "E-ticaret Cozumleri",
    description: "Odeme entegrasyonlu online magaza sistemleri",
    icon: ShoppingCart,
    features: ["Odeme", "Stok", "Kargo"],
    price: "₺999",
    priceLabel: "'dan",
    href: "https://digital.hyble.co/ecommerce",
    badge: null,
  },
  {
    id: 3,
    title: "Ozel Tasarim & AI",
    description: "Markaniza ozel AI destekli web deneyimleri",
    icon: Sparkles,
    features: ["AI", "Animasyon", "Marka"],
    price: "₺1,499",
    priceLabel: "'dan",
    href: "https://digital.hyble.co/custom",
    badge: "Yeni",
  },
];

const studiosProducts = [
  {
    id: 1,
    title: "Minecraft Hosting",
    description: "Yuksek performansli, DDoS korumali sunucular",
    icon: Server,
    features: ["DDoS", "Mod", "7/24"],
    price: "₺49",
    priceLabel: "/ay",
    href: "https://studios.hyble.co/servers",
    badge: "Populer",
  },
  {
    id: 2,
    title: "Premium Pluginler",
    description: "Sunucunuzu guclendirecek profesyonel pluginler",
    icon: Puzzle,
    features: ["Turkce", "API", "Update"],
    price: "₺29",
    priceLabel: "'dan",
    href: "https://studios.hyble.co/plugins",
    badge: null,
  },
  {
    id: 3,
    title: "Sunucu Paketleri",
    description: "Hazir yapilandirilmis tema ve plugin paketleri",
    icon: Package,
    features: ["Hazir", "Tema", "Plugin"],
    price: "₺199",
    priceLabel: "'dan",
    href: "https://studios.hyble.co/packs",
    badge: "Yeni",
  },
];

export function VerticalShowcase() {
  const [activeTab, setActiveTab] = useState<"digital" | "studios">("digital");

  const products = activeTab === "digital" ? digitalProducts : studiosProducts;
  const verticalLink =
    activeTab === "digital"
      ? "https://digital.hyble.co"
      : "https://studios.hyble.co";
  const verticalName = activeTab === "digital" ? "Hyble Digital" : "Hyble Studios";

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-white dark:bg-slate-900">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute inset-0 grid-pattern" />
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            One Cikan{" "}
            <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
              Urunler & Hizmetler
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Digital ve Gaming dunyasinda ihtiyaciniz olan her sey tek catida
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex p-1.5 bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "digital" | "studios")}
                className={`relative flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? "text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.activeGradient} rounded-xl`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="relative w-5 h-5" />
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Clean 3-Column Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {products.map((product, index) => {
              const isDigital = activeTab === "digital";
              const accentColor = isDigital ? "amber" : "emerald";

              return (
                <motion.a
                  key={product.id}
                  href={product.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`group relative bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/10 hover:border-${accentColor}-300 dark:hover:border-${accentColor}-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden`}
                >
                  {/* Subtle top accent on hover only */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${isDigital ? "from-amber-500 to-orange-500" : "from-emerald-500 to-teal-500"} opacity-0 group-hover:opacity-100 transition-opacity`} />

                  {/* Badge - minimal */}
                  {product.badge && (
                    <div className={`absolute top-4 right-4 ${product.badge === "Populer" ? (isDigital ? "bg-amber-500" : "bg-emerald-500") : "bg-slate-500"} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                      {product.badge}
                    </div>
                  )}

                  <div className="p-6">
                    {/* Icon - clean, outlined style */}
                    <div className={`w-12 h-12 rounded-xl ${isDigital ? "bg-amber-50 dark:bg-amber-500/10" : "bg-emerald-50 dark:bg-emerald-500/10"} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <product.icon className={`w-6 h-6 ${isDigital ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`} />
                    </div>

                    {/* Title */}
                    <h3 className={`text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:${isDigital ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"} transition-colors`}>
                      {product.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Features - simple tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {product.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-baseline gap-0.5">
                        <span className={`text-xl font-bold ${isDigital ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {product.price}
                        </span>
                        <span className="text-slate-400 text-sm">{product.priceLabel}</span>
                      </div>
                      <div className={`w-9 h-9 rounded-full ${isDigital ? "bg-amber-100 dark:bg-amber-500/20 group-hover:bg-amber-500" : "bg-emerald-100 dark:bg-emerald-500/20 group-hover:bg-emerald-500"} flex items-center justify-center transition-colors`}>
                        <ArrowRight className={`w-4 h-4 ${isDigital ? "text-amber-600 dark:text-amber-400 group-hover:text-white" : "text-emerald-600 dark:text-emerald-400 group-hover:text-white"} transition-colors`} />
                      </div>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <a
            href={verticalLink}
            className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${
              activeTab === "digital"
                ? "from-amber-500 to-orange-500 shadow-amber-500/25 hover:shadow-amber-500/40"
                : "from-emerald-500 to-teal-500 shadow-emerald-500/25 hover:shadow-emerald-500/40"
            } text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5`}
          >
            <span>Tum {verticalName} Urunlerini Gor</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
