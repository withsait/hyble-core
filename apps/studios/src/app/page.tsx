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
  Star,
  Users,
  Globe,
  Cpu,
  HardDrive,
  ArrowRight,
} from "lucide-react";

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
  { name: "Minecraft Java", icon: "https://cdn-icons-png.flaticon.com/512/3308/3308395.png" },
  { name: "Minecraft Bedrock", icon: "https://cdn-icons-png.flaticon.com/512/3308/3308395.png" },
  { name: "Rust", icon: "https://cdn-icons-png.flaticon.com/512/686/686613.png" },
  { name: "ARK", icon: "https://cdn-icons-png.flaticon.com/512/686/686613.png" },
  { name: "Terraria", icon: "https://cdn-icons-png.flaticon.com/512/686/686613.png" },
  { name: "Valheim", icon: "https://cdn-icons-png.flaticon.com/512/686/686613.png" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
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
      <header className="fixed top-9 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-emerald-500" />
            <span className="text-xl font-bold">
              Hyble<span className="text-emerald-500">Gaming</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#pricing" className="text-slate-300 hover:text-white transition">
              Fiyatlar
            </Link>
            <Link href="#features" className="text-slate-300 hover:text-white transition">
              Özellikler
            </Link>
            <Link href="#games" className="text-slate-300 hover:text-white transition">
              Oyunlar
            </Link>
            <Link href="https://hyble.co" className="text-slate-300 hover:text-white transition">
              Hyble.co
            </Link>
            <Link href="https://id.hyble.co/auth/login" className="text-slate-300 hover:text-white transition">
              Giriş Yap
            </Link>
          </nav>

          <Link
            href="https://id.hyble.co/auth/register?redirect=gaming"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            Sunucu Oluştur
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm mb-6">
            <Gamepad2 className="h-4 w-4" />
            Hyble Gaming by Hyble
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">Premium </span>
            <span className="text-emerald-500 text-glow">Oyun Sunucusu</span>
            <br />
            <span className="text-white">Hosting</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Minecraft, Rust, ARK ve daha fazlası için yüksek performanslı sunucu hosting.
            60 saniyede kurulum, DDoS koruması dahil.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#pricing"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2 glow-green"
            >
              <Server className="h-5 w-5" />
              Planları İncele
            </Link>
            <Link
              href="#features"
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2 border border-slate-700"
            >
              Özellikler
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-3xl mx-auto">
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "5000+", label: "Aktif Sunucu" },
              { value: "<50ms", label: "Ping" },
              { value: "24/7", label: "Destek" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-emerald-500">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Neden HybleGaming?</h2>
            <p className="text-slate-400">Oyun sunucunuz için en iyi altyapı</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition group"
              >
                <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition">
                  <feature.icon className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Minecraft Sunucu Planları</h2>
            <p className="text-slate-400">Her bütçeye uygun seçenekler</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative bg-slate-800 border rounded-xl p-6 ${
                  plan.popular
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-slate-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    En Popüler
                  </div>
                )}

                <h3 className="font-bold text-xl mb-2">{plan.name}</h3>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-emerald-500">€{plan.price}</span>
                  <span className="text-slate-400">/ay</span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
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
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
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
      <section id="games" className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Desteklenen Oyunlar</h2>
            <p className="text-slate-400">Favori oyununuz için sunucu başlatın</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {games.map((game, i) => (
              <div
                key={i}
                className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center hover:border-emerald-500/50 transition cursor-pointer group"
              >
                <div className="h-16 w-16 bg-slate-700 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:bg-slate-600 transition">
                  <Gamepad2 className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="font-medium text-sm">{game.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Hemen Başlayın</h2>
          <p className="text-slate-400 mb-8">
            60 saniyede sunucunuzu kurun, arkadaşlarınızla oynamaya başlayın.
          </p>
          <Link
            href="https://panel.hyble.co/game"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition glow-green"
          >
            <Server className="h-5 w-5" />
            Ücretsiz Dene
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-emerald-500" />
              <span className="font-bold">
                Hyble<span className="text-emerald-500">Gaming</span>
              </span>
            </div>

            <p className="text-slate-400 text-sm">
              Hyble Ltd. bir markasıdır. UK Company No: 15872841
            </p>

            <div className="flex items-center gap-4 text-slate-400">
              <Link href="https://hyble.co" className="hover:text-white transition">
                Hyble
              </Link>
              <Link href="https://hyble.co/legal/privacy" className="hover:text-white transition">
                Gizlilik
              </Link>
              <Link href="https://hyble.co/legal/terms" className="hover:text-white transition">
                Şartlar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
