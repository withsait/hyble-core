"use client";

import Link from "next/link";
import {
  Cloud,
  Server,
  Shield,
  Zap,
  Clock,
  Headphones,
  ChevronRight,
  Check,
  ArrowRight,
  Sparkles,
  Building2,
  Lock,
  Code2,
  ShoppingCart,
  BarChart3,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";

const products = [
  {
    name: "GamePanel",
    description: "Oyun sunucusu yönetimi için ultimate platform. Minecraft, Rust ve daha fazlasını tek tıkla yönetin.",
    features: ["Multi-game support", "Player management", "Real-time console", "Automated backups", "Mod/plugin installer", "White-label ready"],
    price: "£29/ay",
    icon: Server,
    color: "emerald",
    href: "/gamepanel",
  },
  {
    name: "WebStore",
    description: "Oyun sunucuları ve dijital ürünler için komple e-ticaret çözümü.",
    features: ["Stripe & PayPal integration", "Digital product delivery", "Subscription management", "Discord integration", "Custom themes", "Analytics dashboard"],
    price: "£19/ay",
    icon: ShoppingCart,
    color: "amber",
    href: "/webstore",
  },
];

const upcomingProducts = [
  { name: "Analytics", description: "Gelişmiş analitik dashboard", icon: BarChart3 },
  { name: "API Gateway", description: "Geliştirici API yönetimi", icon: Code2 },
  { name: "Config Manager", description: "Merkezi konfigürasyon yönetimi", icon: Settings },
];

const trustItems = [
  { icon: Shield, label: "Kurumsal Güvenlik", sublabel: "Enterprise-seviye koruma" },
  { icon: Building2, label: "UK Kayıtlı Şirket", sublabel: "Companies House #15872841" },
  { icon: Lock, label: "GDPR Uyumlu", sublabel: "Avrupa veri koruma standartları" },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "API", label: "Hazır" },
  { value: "7/24", label: "Destek" },
];

export default function CloudHomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Cross-sell Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm">
          <Server className="w-4 h-4 text-white" />
          <span className="text-white">
            <strong>Oyun sunucusu mu arıyorsunuz?</strong> Hyble Studios'a göz atın
          </span>
          <Link
            href="https://studios.hyble.co"
            className="flex items-center gap-1 text-white font-medium hover:underline"
          >
            Studios'a Git
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-9 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cloud className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Hyble<span className="text-indigo-600">Cloud</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#products" className="text-slate-600 hover:text-indigo-600 transition font-medium">
              Ürünler
            </Link>
            <Link href="https://hyble.co" className="text-slate-600 hover:text-indigo-600 transition font-medium">
              Hyble.co
            </Link>
            <Link href="https://id.hyble.co/auth/login" className="text-slate-600 hover:text-indigo-600 transition font-medium">
              Giriş Yap
            </Link>
          </nav>

          <Link
            href="https://console.hyble.co/cloud"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            Konsola Git
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-4 min-h-screen flex items-center overflow-hidden">
        {/* Premium Grid Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50/50">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(99, 102, 241, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(99, 102, 241, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200/50 rounded-full mb-8 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">
                  SaaS Solutions
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]"
              >
                <span className="text-slate-900">Güçlü </span>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Cloud
                </span>
                <br />
                <span className="text-slate-900">Uygulamaları</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-600 max-w-xl mb-8 leading-relaxed"
              >
                Operasyonlarınızı kolaylaştırmak için tasarlanmış kurumsal seviye SaaS ürünleri.
                GamePanel, WebStore ve daha fazlası.
              </motion.p>

              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                {[
                  { icon: Zap, label: "Anında Kurulum" },
                  { icon: Shield, label: "Kurumsal Güvenlik" },
                  { icon: Code2, label: "API Hazır" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-indigo-200 shadow-sm"
                  >
                    <item.icon className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link
                  href="https://console.hyble.co/cloud"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                >
                  Uygulamaları Keşfet
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="#products"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-semibold text-lg transition-all border border-slate-200 shadow-sm"
                >
                  Ürünleri Gör
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-slate-500"
              >
                14 gün ücretsiz deneme • İptal ücreti yok
              </motion.p>
            </div>

            {/* Right Content - Trust Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 p-8 backdrop-blur-sm">
                <div className="absolute -top-px -right-px w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-tr-3xl rounded-bl-3xl opacity-10" />

                <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
                  Güvenilir Altyapı
                </h3>
                <p className="text-slate-500 text-sm text-center mb-8">
                  Ölçeklendirme ve güvenilirlik için inşa edildi
                </p>

                <div className="space-y-4 mb-8">
                  {trustItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{item.label}</div>
                        <div className="text-sm text-slate-500">{item.sublabel}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-4 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Ürünlerimiz</h2>
            <p className="text-slate-600">Ölçek ve güvenilirlik için inşa edilmiş cloud-native uygulamalar</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {products.map((product, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition group"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                    product.color === "emerald"
                      ? "bg-emerald-100 group-hover:bg-emerald-200"
                      : "bg-amber-100 group-hover:bg-amber-200"
                  } transition`}>
                    <product.icon className={`h-7 w-7 ${
                      product.color === "emerald" ? "text-emerald-600" : "text-amber-600"
                    }`} />
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.color === "emerald"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {product.color === "emerald" ? "Gaming" : "E-commerce"}
                    </span>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">
                      {product.name}
                    </h3>
                  </div>
                </div>

                <p className="mt-4 text-slate-600">
                  {product.description}
                </p>

                <ul className="mt-6 space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className={`h-4 w-4 ${
                        product.color === "emerald" ? "text-emerald-500" : "text-amber-500"
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-2xl font-bold text-indigo-600">
                    {product.price}
                  </p>
                  <Link
                    href={product.href}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    Daha fazla
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Yakında Gelecek Uygulamalar</h2>
            <p className="mt-4 text-slate-600">
              Yeni nesil cloud uygulamalarını geliştiriyoruz. Takipte kalın!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingProducts.map((product, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center"
              >
                <div className="h-12 w-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <product.icon className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900">{product.name}</h3>
                <p className="text-slate-500 text-sm">{product.description}</p>
                <span className="mt-4 inline-block px-3 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded-full">
                  Yakında
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Hemen Başlayın</h2>
          <p className="text-indigo-100 mb-8">
            Cloud uygulamalarımızı 14 gün ücretsiz deneyin.
          </p>
          <Link
            href="https://console.hyble.co/cloud"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg transition shadow-xl"
          >
            <Cloud className="h-5 w-5" />
            Ücretsiz Başla
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Cloud className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">
                Hyble<span className="text-indigo-600">Cloud</span>
              </span>
            </div>

            <p className="text-slate-500 text-sm">
              Hyble Ltd. bir markasıdır. UK Company No: 15872841
            </p>

            <div className="flex items-center gap-4 text-slate-500">
              <Link href="https://hyble.co" className="hover:text-indigo-600 transition">
                Hyble
              </Link>
              <Link href="https://hyble.co/legal/privacy" className="hover:text-indigo-600 transition">
                Gizlilik
              </Link>
              <Link href="https://hyble.co/legal/terms" className="hover:text-indigo-600 transition">
                Şartlar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
