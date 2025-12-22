"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Shield, Gamepad2, Server, Cpu,
  Package, Puzzle, Zap, Clock, Users, Headphones, Globe,
  Sword, Trophy, Check, HardDrive, Terminal
} from "lucide-react";

const services = [
  {
    id: "minecraft",
    icon: Gamepad2,
    title: "Minecraft",
    description: "Java & Bedrock sunuculari",
    href: "/servers/minecraft",
    gradient: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/20",
    stats: "En populer",
    badge: "Populer",
  },
  {
    id: "fivem",
    icon: Cpu,
    title: "FiveM",
    description: "GTA V roleplay sunuculari",
    href: "/servers/fivem",
    gradient: "from-orange-500 to-red-600",
    bgGlow: "bg-orange-500/20",
    stats: "RP hazir",
  },
  {
    id: "rust",
    icon: Sword,
    title: "Rust",
    description: "Survival oyun sunuculari",
    href: "/servers/rust",
    gradient: "from-red-500 to-rose-600",
    bgGlow: "bg-red-500/20",
    stats: "Modlu",
  },
  {
    id: "plugins",
    icon: Puzzle,
    title: "Pluginler",
    description: "Ozel plugin gelistirme",
    href: "/plugins",
    gradient: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/20",
    stats: "100+ plugin",
    badge: "Yeni",
  },
];

const trustItems = [
  { icon: Zap, label: "DDoS Korumasi", sublabel: "20 Tbps+ koruma kapasitesi" },
  { icon: Server, label: "Yuksek Performans", sublabel: "NVMe SSD & DDR5 RAM" },
  { icon: Globe, label: "Dusuk Ping", sublabel: "Avrupa lokasyonlari" },
];

const stats = [
  { value: "1000+", label: "Aktif Sunucu" },
  { value: "99.9%", label: "Uptime" },
  { value: "<20ms", label: "Ping" },
];

const features = [
  {
    icon: Zap,
    title: "Aninda Kurulum",
    description: "Sunucunuz dakikalar icinde hazir. Otomatik kurulum.",
  },
  {
    icon: Shield,
    title: "DDoS Korumasi",
    description: "20 Tbps+ koruma kapasitesi ile tam guvenlik.",
  },
  {
    icon: Server,
    title: "Yuksek Performans",
    description: "NVMe SSD, DDR5 RAM ve yuksek CPU frekansi.",
  },
  {
    icon: Clock,
    title: "7/24 Destek",
    description: "Turkce teknik destek her zaman yaninda.",
  },
  {
    icon: Puzzle,
    title: "Mod Destegi",
    description: "Tum populer modlar ve pluginler desteklenir.",
  },
  {
    icon: Terminal,
    title: "Panel Erisimi",
    description: "Kullanici dostu kontrol paneli ile kolay yonetim.",
  },
];

const games = [
  { name: "Minecraft Java", players: "500+ sunucu", price: "2.99", icon: Gamepad2 },
  { name: "Minecraft Bedrock", players: "200+ sunucu", price: "2.99", icon: Gamepad2 },
  { name: "FiveM", players: "300+ sunucu", price: "9.99", icon: Cpu },
  { name: "Rust", players: "150+ sunucu", price: "14.99", icon: Sword },
];

const plans = [
  {
    name: "Starter",
    ram: "2 GB",
    slots: "10",
    price: "2.99",
    features: ["NVMe SSD", "DDoS Korumasi", "Gunluk Yedekleme"],
  },
  {
    name: "Standard",
    ram: "4 GB",
    slots: "20",
    price: "5.99",
    features: ["NVMe SSD", "DDoS Korumasi", "Gunluk Yedekleme", "Mod Destegi"],
    popular: true,
  },
  {
    name: "Pro",
    ram: "8 GB",
    slots: "50",
    price: "9.99",
    features: ["NVMe SSD", "DDoS Korumasi", "Gunluk Yedekleme", "Mod Destegi", "Oncelikli Destek"],
  },
  {
    name: "Enterprise",
    ram: "16 GB",
    slots: "100+",
    price: "19.99",
    features: ["NVMe SSD", "DDoS Korumasi", "Gunluk Yedekleme", "Mod Destegi", "7/24 Destek", "SLA Garantisi"],
  },
];

export default function StudiosHomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center py-16 lg:py-24 overflow-hidden">
        {/* Premium Grid Background - Gaming Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(16, 185, 129, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full mb-8 shadow-sm"
              >
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">
                  Gaming Cozumleri
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                  <span className="text-white">Oyun Sunucunuzu</span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Simdi Baslatin
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-400 mb-8 leading-relaxed"
              >
                Minecraft, FiveM, Rust ve daha fazlasi. Yuksek performansli sunucular,
                DDoS korumasi ve 7/24 Turkce destek.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                {[
                  { icon: Zap, label: "Aninda Kurulum" },
                  { icon: Shield, label: "DDoS Korumasi" },
                  { icon: Headphones, label: "7/24 Destek" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700/50 shadow-sm"
                  >
                    <item.icon className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-slate-300">{item.label}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <a
                  href="#plans"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                >
                  Sunucu Olustur
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <Link
                  href="/plugins"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 border border-slate-700 text-white rounded-xl font-semibold text-lg hover:bg-slate-700 transition-all"
                >
                  Pluginleri Incele
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-slate-500"
              >
                Kredi karti gerekmez &bull; Aninda aktivasyon
              </motion.p>
            </div>

            {/* Right Content - Trust Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-slate-800/90 rounded-3xl border border-slate-700/50 shadow-2xl shadow-emerald-500/10 p-8 backdrop-blur-sm">
                <div className="absolute -top-px -right-px w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-tr-3xl rounded-bl-3xl opacity-20" />

                <h3 className="text-xl font-bold text-white mb-2 text-center">
                  Gaming Altyapisi
                </h3>
                <p className="text-slate-400 text-sm text-center mb-8">
                  Oyuncular icin optimize edilmis sunucular
                </p>

                <div className="space-y-4 mb-8">
                  {trustItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-2xl"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{item.label}</div>
                        <div className="text-sm text-slate-400">{item.sublabel}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl font-bold text-emerald-400">{stat.value}</div>
                      <div className="text-xs text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section - Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20"
          >
            <h2 className="text-center text-lg font-medium text-slate-400 mb-8">
              Hangi oyun icin sunucu ariyorsunuz?
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={service.href}
                  className="group relative p-6 bg-slate-800/80 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 overflow-hidden"
                >
                  <div className={`absolute inset-0 ${service.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl`} />

                  {service.badge && (
                    <span className={`absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full ${
                      service.badge === "Populer"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-violet-500/20 text-violet-300"
                    }`}>
                      {service.badge}
                    </span>
                  )}

                  <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="relative font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="relative text-sm text-slate-400 mb-3">
                    {service.description}
                  </p>
                  <div className="relative flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {service.stats}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Desteklenen Oyunlar
            </h2>
            <p className="text-slate-400">
              Favori oyununuz icin optimize edilmis sunucular
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game) => (
              <div
                key={game.name}
                className="group p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all"
              >
                <div className="w-16 h-16 bg-slate-700/50 rounded-2xl mb-4 flex items-center justify-center">
                  <game.icon className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
                  {game.name}
                </h3>
                <p className="text-sm text-slate-400 mb-2">{game.players}</p>
                <p className="text-lg font-bold text-emerald-400">
                  ${game.price}<span className="text-sm text-slate-500 font-normal">/ay</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Neden Hyble Studios?
            </h2>
            <p className="text-slate-400">
              Oyuncular icin tasarlanmis profesyonel altyapi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900" id="plans">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Minecraft Planlari
            </h2>
            <p className="text-slate-400">
              Ihtiyaciniza uygun plani secin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 bg-slate-800/50 rounded-2xl border ${
                  plan.popular
                    ? "border-emerald-500 ring-1 ring-emerald-500"
                    : "border-slate-700/50"
                }`}
              >
                {plan.popular && (
                  <div className="text-xs font-medium text-emerald-400 mb-4">En Populer</div>
                )}
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span>{plan.ram} RAM</span>
                  <span>•</span>
                  <span>{plan.slots} Slot</span>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  <span className="text-slate-500">/ay</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://id.hyble.co/auth/register"
                  className={`block w-full py-3 text-center font-medium rounded-xl transition-colors ${
                    plan.popular
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  Basla
                </a>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              Ozel ihtiyaclariniz icin{" "}
              <Link href="/contact" className="text-emerald-400 hover:text-emerald-300">
                satis ekibiyle gorusun
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white relative overflow-hidden">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />

            <div className="relative">
              <Trophy className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">
                Oyun Maceraniza Baslayin
              </h2>
              <p className="opacity-90 mb-8 max-w-xl mx-auto">
                Sunucunuzu hemen olusturun. Aninda aktivasyon, 7/24 destek ve DDoS korumasi dahil.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://id.hyble.co/auth/register"
                  className="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  Ucretsiz Baslayin
                </a>
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
                >
                  Bize Ulasin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
