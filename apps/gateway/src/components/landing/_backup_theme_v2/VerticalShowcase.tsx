"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Briefcase,
  Gamepad2,
  ArrowRight,
  Globe,
  Palette,
  ShoppingCart,
  Server,
  Puzzle,
  Package,
  Check,
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
    description: "Profesyonel, modern ve mobil uyumlu kurumsal web siteleri",
    icon: Globe,
    features: ["Responsive Tasarim", "SEO Optimize", "Hizli Yukleme"],
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    href: "https://digital.hyble.co/templates",
  },
  {
    id: 2,
    title: "E-ticaret Cozumleri",
    description: "Odeme entegrasyonlu, stok takipli online magaza sistemleri",
    icon: ShoppingCart,
    features: ["Odeme Entegrasyonu", "Stok Yonetimi", "Kargo Takibi"],
    gradient: "from-orange-500 to-red-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    href: "https://digital.hyble.co/ecommerce",
  },
  {
    id: 3,
    title: "Ozel Tasarim & AI",
    description: "Markaniza ozel tasarimlar ve AI destekli web deneyimleri",
    icon: Sparkles,
    features: ["Marka Kimligi", "AI Araclar", "Animasyonlar"],
    gradient: "from-yellow-500 to-amber-500",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    href: "https://digital.hyble.co/custom",
  },
];

const studiosProducts = [
  {
    id: 1,
    title: "Minecraft Hosting",
    description: "Yuksek performansli, DDoS korumali Minecraft sunuculari",
    icon: Server,
    features: ["Aninda Kurulum", "DDoS Koruma", "Mod Destegi"],
    gradient: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    href: "https://studios.hyble.co/servers",
  },
  {
    id: 2,
    title: "Premium Pluginler",
    description: "Sunucunuzu guclendirecek profesyonel Minecraft pluginleri",
    icon: Puzzle,
    features: ["Turkce Destek", "Surekli Guncelleme", "API Erisimi"],
    gradient: "from-teal-500 to-cyan-500",
    iconBg: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600 dark:text-teal-400",
    href: "https://studios.hyble.co/plugins",
  },
  {
    id: 3,
    title: "Sunucu Paketleri",
    description: "Hazir yapilandirilmis, tema ve plugin iceren sunucu paketleri",
    icon: Package,
    features: ["Hazir Yapilandirma", "Tema Dahil", "Plugin Seti"],
    gradient: "from-green-500 to-emerald-500",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    href: "https://studios.hyble.co/packs",
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
    <section className="relative py-16 lg:py-20 overflow-hidden bg-white dark:bg-[#05050a]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#05050a] dark:via-[#05050a] dark:to-[#08080f]" />
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
            <span className="bg-gradient-to-r from-amber-500 to-emerald-500 bg-clip-text text-transparent">
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

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {products.map((product, index) => (
              <motion.a
                key={product.id}
                href={product.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 bg-white/80 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 backdrop-blur-sm"
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${product.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}
                >
                  <product.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className={`text-xl font-semibold text-slate-900 dark:text-white mb-2 group-hover:${product.iconColor} transition-colors`}>
                  {product.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm leading-relaxed">
                  {product.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {product.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
                    >
                      <Check className={`w-4 h-4 ${product.iconColor} flex-shrink-0`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Arrow */}
                <div className={`flex items-center gap-1 text-sm font-medium text-slate-400 group-hover:${product.iconColor} transition-colors`}>
                  <span>Incele</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.a>
            ))}
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
