"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Wrench,
  Key,
  Activity,
  CreditCard,
  Cloud,
  ArrowUpRight,
  Server,
  Globe,
} from "lucide-react";

// Ürün kategorileri - Site builder ve şablon odaklı
const productCategories = [
  {
    title: "Web Sitesi Oluşturucu",
    description: "Kod yazmadan profesyonel siteler",
    products: [
      {
        icon: Globe,
        name: "Site Builder",
        description: "Sürükle-bırak editör ile web sitesi oluşturun",
        href: "/websites/new",
        features: ["Drag & Drop", "Mobil Uyumlu", "SEO"],
        badge: "Popüler",
      },
      {
        icon: Cloud,
        name: "AI Web Creator",
        description: "Yapay zeka ile 60 saniyede site oluşturun",
        href: "/websites/new/ai",
        features: ["GPT-4", "Otomatik", "Hızlı"],
        badge: "Yeni",
      },
    ],
  },
  {
    title: "Şablon Mağazası",
    description: "Profesyonel hazır tasarımlar",
    products: [
      {
        icon: Server,
        name: "Web Şablonları",
        description: "Landing page, kurumsal, portfolyo",
        href: "/store?category=web",
        features: ["200+", "Responsive", "Modern"],
      },
      {
        icon: Activity,
        name: "E-Ticaret Şablonları",
        description: "Online mağaza için hazır tasarımlar",
        href: "/store?category=ecommerce",
        features: ["Sepet", "Ödeme", "Stok"],
      },
    ],
  },
  {
    title: "Ekosistem Hizmetleri",
    description: "Geliştiriciler için API'ler",
    products: [
      {
        icon: Shield,
        name: "Hyble ID",
        description: "OAuth 2.0, MFA, SSO ve tek tıkla giriş",
        href: "/solutions/id",
        features: ["OAuth 2.0", "MFA", "SSO"],
      },
      {
        icon: CreditCard,
        name: "Hyble Wallet",
        description: "Sanal cüzdan ve ödeme yönetimi",
        href: "/solutions/wallet",
        features: ["Bakiye", "Transfer", "Fatura"],
      },
      {
        icon: Key,
        name: "Hyble License",
        description: "Yazılım lisanslama ve aktivasyon sistemi",
        href: "/solutions/license",
        features: ["HWID", "Aktivasyon", "API"],
      },
    ],
  },
  {
    title: "Destek & Araçlar",
    description: "Yardım ve ücretsiz araçlar",
    products: [
      {
        icon: Wrench,
        name: "Hyble Tools",
        description: "Ücretsiz geliştirici araçları",
        href: "/tools",
        features: ["DNS", "SSL", "WHOIS"],
      },
    ],
  },
];

export function FeatureBento() {
  return (
    <section id="products" className="relative py-12 lg:py-16 bg-slate-50 dark:bg-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Web Sitenizi{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Oluşturun
            </span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Site builder ile kendiniz oluşturun, hazır şablonlarla başlayın veya AI&apos;a bırakın.
          </p>
        </motion.div>

        {/* Product Categories Grid - Daha kompakt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:border-blue-200 dark:hover:border-slate-600/50 hover:shadow-md transition-all"
            >
              {/* Category Header */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
                  {category.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {category.description}
                </p>
              </div>

              {/* Products in Category */}
              <div className="space-y-2">
                {category.products.map((product) => (
                  <Link
                    key={product.name}
                    href={product.href}
                    className="group flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/30 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-all"
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-300 dark:group-hover:border-blue-500/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all flex-shrink-0">
                      <product.icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h4>
                        {"badge" in product && product.badge && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            product.badge === "Popüler"
                              ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                          }`}>
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {product.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Globe className="w-4 h-4" />
            Şablon Mağazasına Git
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
