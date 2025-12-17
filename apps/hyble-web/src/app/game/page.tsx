"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Gamepad2,
  Server,
  Zap,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Check,
  MapPin,
  Cpu,
  HardDrive,
  Gauge,
  Headphones,
  Star,
} from "lucide-react";

// Minecraft icon
const MinecraftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h16V4H4zm2 2h4v4H6V6zm8 0h4v4h-4V6zm-4 4h4v4h-4v-4zm-4 4h4v4H6v-4zm8 0h4v4h-4v-4z" />
  </svg>
);

// Pricing plans
const gamingPlans = [
  {
    name: "Starter",
    description: "Arkadaşlarla oynamak için",
    price: "4.99",
    ram: "2 GB",
    cpu: "2 vCPU",
    storage: "10 GB NVMe",
    players: "10 Oyuncu",
    features: [
      "Anında Kurulum",
      "Temel Modpack Desteği",
      "DDoS Koruması",
      "Günlük Yedekleme",
    ],
    cta: "Başla",
    popular: false,
  },
  {
    name: "Pro",
    description: "Büyüyen topluluklar için",
    price: "9.99",
    ram: "4 GB",
    cpu: "4 vCPU",
    storage: "25 GB NVMe",
    players: "30 Oyuncu",
    features: [
      "Anında Kurulum",
      "Tüm Modpack Desteği",
      "DDoS Koruması",
      "Saatlik Yedekleme",
      "Özel Subdomain",
      "FTP Erişimi",
    ],
    cta: "En Popüler",
    popular: true,
  },
  {
    name: "Ultimate",
    description: "Profesyonel sunucular için",
    price: "19.99",
    ram: "8 GB",
    cpu: "6 vCPU",
    storage: "50 GB NVMe",
    players: "100 Oyuncu",
    features: [
      "Anında Kurulum",
      "Tüm Modpack Desteği",
      "Gelişmiş DDoS Koruması",
      "Sürekli Yedekleme",
      "Özel Domain",
      "SFTP Erişimi",
      "Öncelikli Destek",
      "Özel IP",
    ],
    cta: "Ultimate Al",
    popular: false,
  },
];

// Features
const features = [
  {
    icon: Zap,
    title: "Anında Kurulum",
    description: "Sunucunuz dakikalar içinde hazır. Beklemeyin, hemen oynayın.",
  },
  {
    icon: Gauge,
    title: "Düşük Ping",
    description: "Almanya datacenter ile Avrupa'dan <20ms ping.",
  },
  {
    icon: Shield,
    title: "DDoS Koruması",
    description: "Tüm planlarda ücretsiz DDoS koruması dahil.",
  },
  {
    icon: Headphones,
    title: "7/24 Destek",
    description: "Discord ve ticket üzerinden hızlı Türkçe destek.",
  },
];

// Stats
const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "<20ms", label: "Ping (EU)" },
  { value: "7/24", label: "Destek" },
  { value: "3+", label: "Datacenter" },
];

export default function GamePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white">Hyble</span>
                <span className="font-bold text-lg text-emerald-400">Gaming</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
                Fiyatlar
              </a>
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                Özellikler
              </a>
              <Link href="https://hyble.co" className="text-sm text-slate-400 hover:text-white transition-colors">
                Hyble.co
              </Link>
            </nav>
            <a
              href="https://id.hyble.co/register"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Giriş Yap
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 bg-emerald-500" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 bg-green-500" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6"
            >
              <MinecraftIcon className="w-4 h-4" />
              <span>Minecraft Server Hosting</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
            >
              Oyun Sunucunuzu{" "}
              <span className="text-emerald-400">Dakikalar İçinde</span>{" "}
              Başlatın
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8"
            >
              Yüksek performanslı NVMe depolama, düşük ping ve 7/24 Türkçe destek.
              Arkadaşlarınızla oynamaya hemen başlayın.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <a
                href="#pricing"
                className="group flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl"
              >
                Sunucu Kur
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://discord.gg/hyble"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-4 border border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 rounded-xl font-semibold transition-all"
              >
                Discord'a Katıl
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-8"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Neden HybleGaming?
            </h2>
            <p className="text-slate-400">
              Oyun sunucunuz için en iyi altyapıyı sunuyoruz.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Basit ve Şeffaf Fiyatlandırma
            </h2>
            <p className="text-slate-400">
              Gizli maliyet yok. İstediğiniz zaman iptal edin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {gamingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 ${
                  plan.popular
                    ? "bg-gradient-to-b from-emerald-900/50 to-slate-800 border-2 border-emerald-500"
                    : "bg-slate-800/50 border border-slate-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    En Popüler
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-slate-400">€</span>
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-slate-400">/ay</span>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <span>{plan.ram} RAM</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>{plan.cpu}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>{plan.storage}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>{plan.players}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://id.hyble.co/register?product=gaming"
                  className={`block w-full py-3 rounded-lg font-semibold text-center transition-colors ${
                    plan.popular
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  {plan.cta}
                </a>
              </motion.div>
            ))}
          </div>

          {/* Custom Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-slate-400 mb-4">
              Daha büyük sunuculara mı ihtiyacınız var?
            </p>
            <Link
              href="/contact"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Özel plan için bizimle iletişime geçin →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Almanya Datacenter</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Avrupa'dan Düşük Ping
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Sunucularımız Almanya'da bulunan Hetzner datacenter'larında çalışıyor.
            Türkiye dahil tüm Avrupa'dan düşük ping ile kesintisiz oyun deneyimi.
          </p>
          <div className="inline-flex items-center gap-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">~15ms</p>
              <p className="text-xs text-slate-500">Almanya</p>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">~35ms</p>
              <p className="text-xs text-slate-500">Türkiye</p>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">~50ms</p>
              <p className="text-xs text-slate-500">UK</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />

            <div className="relative p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Oyun Sunucunuzu Bugün Başlatın
              </h2>
              <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                Kurulum sadece 5 dakika. Arkadaşlarınızla oynamaya hemen başlayın.
              </p>
              <a
                href="https://id.hyble.co/register?product=gaming"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
              >
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">
                <span className="text-white">Hyble</span>
                <span className="text-emerald-400">Gaming</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="https://hyble.co" className="hover:text-white transition-colors">
                Hyble.co
              </Link>
              <Link href="https://hyble.co/legal/terms" className="hover:text-white transition-colors">
                Şartlar
              </Link>
              <Link href="https://hyble.co/legal/privacy" className="hover:text-white transition-colors">
                Gizlilik
              </Link>
              <a href="https://discord.gg/hyble" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Discord
              </a>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Hyble Ltd
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
