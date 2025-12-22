"use client";

import Link from "next/link";
import {
  Gamepad2,
  Server,
  Shield,
  Zap,
  Clock,
  Headphones,
  ChevronRight,
  Check,
  Users,
  Globe,
  Cpu,
  ArrowRight,
  Sparkles,
  Building2,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "Anında Kurulum",
    description: "Sunucunuz 60 saniye içinde hazır. Tek tıkla modpack kurulumu.",
  },
  {
    icon: Shield,
    title: "DDoS Koruması",
    description: "Ücretsiz enterprise-seviye DDoS koruması ile güvende olun.",
  },
  {
    icon: Clock,
    title: "99.9% Uptime",
    description: "SLA garantili kesintisiz sunucu hizmeti.",
  },
  {
    icon: Headphones,
    title: "7/24 Destek",
    description: "Uzman teknik ekibimiz her zaman yanınızda.",
  },
];

const plans = [
  {
    name: "Starter",
    ram: "2 GB",
    players: "10",
    price: "4.99",
    features: ["Vanilla & Paper", "Temel Eklentiler", "Günlük Yedekleme"],
    popular: false,
  },
  {
    name: "Standard",
    ram: "4 GB",
    players: "25",
    price: "9.99",
    features: ["Modpack Desteği", "Tüm Eklentiler", "Saatlik Yedekleme", "Özel Domain"],
    popular: true,
  },
  {
    name: "Premium",
    ram: "8 GB",
    players: "50",
    price: "19.99",
    features: ["Forge & Fabric", "Sınırsız Eklenti", "Anlık Yedekleme", "Öncelikli Destek"],
    popular: false,
  },
  {
    name: "Ultimate",
    ram: "16 GB",
    players: "100+",
    price: "39.99",
    features: ["Her Şey Dahil", "Dedicated IP", "Özel Kurulum", "VIP Destek"],
    popular: false,
  },
];

const games = [
  { name: "Minecraft Java" },
  { name: "Minecraft Bedrock" },
  { name: "Rust" },
  { name: "ARK" },
  { name: "Terraria" },
  { name: "Valheim" },
];

const trustItems = [
  { icon: Shield, label: "DDoS Koruması", sublabel: "Enterprise-seviye güvenlik" },
  { icon: Building2, label: "UK Kayıtlı Şirket", sublabel: "Companies House #15872841" },
  { icon: Lock, label: "Veri Güvenliği", sublabel: "Günlük otomatik yedekleme" },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "5000+", label: "Sunucu" },
  { value: "<50ms", label: "Ping" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Cross-sell Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm">
          <Globe className="w-4 h-4 text-white" />
          <span className="text-white">
            <strong>Yeni!</strong> Oyun sunucun için web sitesi oluştur
          </span>
          <Link
            href="https://hyble.co/store?tag=gaming"
            className="flex items-center gap-1 text-white font-medium hover:underline"
          >
            Şablonları Gör
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-9 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Hyble<span className="text-emerald-600">Studios</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#pricing" className="text-slate-600 hover:text-emerald-600 transition font-medium">
              Fiyatlar
            </Link>
            <Link href="#features" className="text-slate-600 hover:text-emerald-600 transition font-medium">
              Özellikler
            </Link>
            <Link href="#games" className="text-slate-600 hover:text-emerald-600 transition font-medium">
              Oyunlar
            </Link>
            <Link href="https://hyble.co" className="text-slate-600 hover:text-emerald-600 transition font-medium">
              Hyble.co
            </Link>
            <Link href="https://id.hyble.co/auth/login" className="text-slate-600 hover:text-emerald-600 transition font-medium">
              Giriş Yap
            </Link>
          </nav>

          <Link
            href="https://id.hyble.co/auth/register?redirect=gaming"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            Sunucu Oluştur
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-4 min-h-screen flex items-center overflow-hidden">
        {/* Premium Grid Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50">
          {/* Grid Pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(16, 185, 129, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(16, 185, 129, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200/50 rounded-full mb-8 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  Hyble Studios by Hyble
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]"
              >
                <span className="text-slate-900">Premium </span>
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Oyun Sunucusu
                </span>
                <br />
                <span className="text-slate-900">Hosting</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-600 max-w-xl mb-8 leading-relaxed"
              >
                Minecraft, Rust, ARK ve daha fazlası için yüksek performanslı sunucu hosting.
                60 saniyede kurulum, DDoS koruması dahil.
              </motion.p>

              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                {[
                  { icon: Zap, label: "60 Saniyede Kurulum" },
                  { icon: Shield, label: "DDoS Koruması" },
                  { icon: Headphones, label: "7/24 Destek" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-emerald-200 shadow-sm"
                  >
                    <item.icon className="w-4 h-4 text-emerald-500" />
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
                  href="#pricing"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                >
                  <Server className="h-5 w-5" />
                  Planları İncele
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-semibold text-lg transition-all border border-slate-200 shadow-sm"
                >
                  Özellikler
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-slate-500"
              >
                Kredi kartı gerekmez • Anında kurulum
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
                <div className="absolute -top-px -right-px w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-tr-3xl rounded-bl-3xl opacity-10" />

                <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
                  Neden Hyble Studios?
                </h3>
                <p className="text-slate-500 text-sm text-center mb-8">
                  Oyun sunucunuz için en iyi altyapı
                </p>

                <div className="space-y-4 mb-8">
                  {trustItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-emerald-600" />
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
                      <div className="text-2xl font-bold text-emerald-600">{stat.value}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Neden HybleStudios?</h2>
            <p className="text-slate-600">Oyun sunucunuz için en iyi altyapı</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-lg transition group"
              >
                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition">
                  <feature.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Minecraft Sunucu Planları</h2>
            <p className="text-slate-600">Her bütçeye uygun seçenekler</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-white border rounded-2xl p-6 ${
                  plan.popular
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg"
                    : "border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    En Popüler
                  </div>
                )}

                <h3 className="font-bold text-xl mb-2 text-slate-900">{plan.name}</h3>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-emerald-600">€{plan.price}</span>
                  <span className="text-slate-500">/ay</span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-4 w-4" />
                    {plan.ram}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {plan.players}
                  </span>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl font-medium transition ${
                    plan.popular
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Seç
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games */}
      <section id="games" className="py-20 px-4 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Desteklenen Oyunlar</h2>
            <p className="text-slate-600">Favori oyununuz için sunucu başlatın</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {games.map((game, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-center hover:border-emerald-300 hover:shadow-lg transition cursor-pointer group"
              >
                <div className="h-16 w-16 bg-emerald-100 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:bg-emerald-200 transition">
                  <Gamepad2 className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="font-medium text-sm text-slate-700">{game.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Hemen Başlayın</h2>
          <p className="text-emerald-100 mb-8">
            60 saniyede sunucunuzu kurun, arkadaşlarınızla oynamaya başlayın.
          </p>
          <Link
            href="https://console.hyble.co/game"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg transition shadow-xl"
          >
            <Server className="h-5 w-5" />
            Ücretsiz Dene
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Gamepad2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">
                Hyble<span className="text-emerald-600">Studios</span>
              </span>
            </div>

            <p className="text-slate-500 text-sm">
              Hyble Ltd. bir markasıdır. UK Company No: 15872841
            </p>

            <div className="flex items-center gap-4 text-slate-500">
              <Link href="https://hyble.co" className="hover:text-emerald-600 transition">
                Hyble
              </Link>
              <Link href="https://hyble.co/legal/privacy" className="hover:text-emerald-600 transition">
                Gizlilik
              </Link>
              <Link href="https://hyble.co/legal/terms" className="hover:text-emerald-600 transition">
                Şartlar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
