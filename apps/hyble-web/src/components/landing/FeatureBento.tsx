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
  ArrowRight,
  Check,
} from "lucide-react";

const products = [
  {
    icon: Shield,
    title: "Hyble ID",
    description: "OAuth 2.0, MFA, SSO ile merkezi kimlik yönetimi",
    features: ["2FA & MFA", "SSO Entegrasyonu", "Sosyal Giriş"],
    href: "/products/id",
  },
  {
    icon: CreditCard,
    title: "Hyble Wallet",
    description: "Stripe entegrasyonlu global ödeme altyapısı",
    features: ["Çoklu Para Birimi", "Otomatik Faturalama", "Bakiye Yönetimi"],
    href: "/products/wallet",
  },
  {
    icon: Key,
    title: "Hyble License",
    description: "Yazılım lisanslama ve doğrulama API'si",
    features: ["Lisans Oluşturma", "API Doğrulama", "Kullanım Takibi"],
    href: "/products/license",
  },
  {
    icon: Activity,
    title: "Hyble Status",
    description: "Gerçek zamanlı servis izleme ve bildirimler",
    features: ["Durum Sayfaları", "Anlık Bildirimler", "Uptime Takibi"],
    href: "/products/status",
  },
  {
    icon: Cloud,
    title: "Hyble Cloud",
    description: "VPS, game server ve web hosting tek panelden",
    features: ["VPS Yönetimi", "Game Server", "Web Hosting"],
    href: "/products/cloud",
    badge: "Yakında",
  },
  {
    icon: Wrench,
    title: "Hyble Tools",
    description: "Ücretsiz geliştirici araçları koleksiyonu",
    features: ["JSON Formatter", "Base64 Encoder", "UUID Generator"],
    href: "/tools",
  },
];

export function FeatureBento() {
  return (
    <section id="products" className="relative py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Tek Platformda Tüm Araçlar
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            İşletmeniz için ihtiyacınız olan her şey, entegre ve kullanıma hazır.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                href={product.href}
                className="group block h-full p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                    <product.icon className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  {"badge" in product && product.badge && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  {product.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {product.description}
                </p>

                {/* Features */}
                <ul className="space-y-1 mb-3">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Check className="w-3 h-3 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                  <span>Detaylar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
