"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Shield, Server, Package, Puzzle, Check,
  Code2, ShoppingBag, Wrench, Lock, Globe, Rocket, Download, Layers,
  Bot, Gift, Award, TrendingUp, CreditCard, Users
} from "lucide-react";

// Minecraft Emojileri
const MC = {
  pickaxe: "⛏️",
  diamond: "💎",
  gold: "🪙",
  star: "⭐",
  fire: "🔥",
  rocket: "🚀",
  trophy: "🏆",
  crown: "👑",
  shield: "🛡️",
  lightning: "⚡",
  chest: "📦",
  book: "📖",
  gear: "⚙️",
  target: "🎯",
  medal: "🏅",
  game: "🎮",
  world: "🌍",
  server: "🖥️",
  bot: "🤖",
  gift: "🎁",
  money: "💰",
};

// Ürün Kategorileri
const productCategories = [
  {
    id: "hosting",
    icon: Server,
    emoji: MC.server,
    title: "Sunucu Hosting",
    description: "Pterodactyl tabanlı oyun paneli",
    href: "/hosting",
    features: ["Otomatik kurulum", "DDoS koruma", "NVMe SSD"],
    badge: "Yeni",
  },
  {
    id: "plugins",
    icon: Puzzle,
    emoji: MC.gear,
    title: "Eklentiler",
    description: "Özel & hazır Spigot/Paper eklentileri",
    href: "/plugins",
    features: ["AI destekli", "Bedrock uyumlu", "Lisanslı"],
    badge: "100+",
  },
  {
    id: "packs",
    icon: Package,
    emoji: MC.chest,
    title: "Sunucu Paketleri",
    description: "Hazır sunucu kurulumları",
    href: "/packs",
    features: ["Survival", "Skyblock", "Factions", "Prison"],
    badge: "Popüler",
  },
  {
    id: "configs",
    icon: Code2,
    emoji: MC.book,
    title: "Config Paketleri",
    description: "Optimize edilmiş yapılandırmalar",
    href: "/configs",
    features: ["Paper", "Purpur", "Velocity"],
  },
  {
    id: "webstore",
    icon: ShoppingBag,
    emoji: MC.money,
    title: "Web Store",
    description: "VIP & ürün satış sistemi",
    href: "/webstore",
    features: ["Discord entegre", "Otomatik VIP"],
    badge: "Rakip",
  },
  {
    id: "tools",
    icon: Wrench,
    emoji: MC.pickaxe,
    title: "Araçlar",
    description: "MOTD, LogPaste, Medic",
    href: "/tools",
    features: ["Ücretsiz", "AI hata çözümü"],
  },
];

// Yakında Gelecekler
const upcomingProducts = [
  {
    emoji: MC.rocket,
    title: "Hyble Fork",
    description: "Paper rakibi, yüksek performanslı sunucu yazılımı",
    status: "Geliştiriliyor",
    progress: 35,
  },
  {
    emoji: MC.game,
    title: "Launcher & Client",
    description: "Özel Minecraft launcher ve optimize client",
    status: "Planlama",
    progress: 15,
  },
  {
    emoji: MC.world,
    title: "3D Modeller & Maps",
    description: "Pixel art, 3D modeller ve profesyonel map buildleri",
    status: "Yakında",
    progress: 5,
  },
];

// Credit Özellikleri
const creditFeatures = [
  { emoji: MC.bot, title: "AI Kullanımı", description: "AI destekli eklentiler credit ile çalışır" },
  { emoji: MC.gift, title: "Görev & Ödüller", description: "Günlük görevlerle ücretsiz credit kazan" },
  { emoji: MC.medal, title: "Rozetler", description: "Başarımlarla özel rozetler ve bonuslar" },
  { emoji: MC.fire, title: "Seviye Sistemi", description: "Seviye atladıkça daha fazla avantaj" },
];

// Güvenlik Özellikleri
const securityFeatures = [
  { icon: Lock, label: "Gelişmiş Lisanslama", sublabel: "Kırılmaz koruma sistemi" },
  { icon: Shield, label: "20 Tbps DDoS Koruma", sublabel: "Kesintisiz oyun deneyimi" },
  { icon: Globe, label: "Geyser & Floodgate", sublabel: "Java + Bedrock desteği" },
];

// İstatistikler
const stats = [
  { value: "10K+", label: "Aktif Oyuncu", emoji: MC.game },
  { value: "99.9%", label: "Uptime SLA", emoji: MC.shield },
  { value: "<15ms", label: "Ping (EU)", emoji: MC.lightning },
  { value: "500+", label: "Sunucu", emoji: MC.server },
];

// Tecrübe
const experience = [
  "5+ yıl Minecraft sektör deneyimi",
  "Türkiye'nin önde gelen sunucularıyla çalışma",
  "1M+ toplam oyuncu deneyimi",
  "Kurumsal düzeyde altyapı",
];

// Hosting Planları
const hostingPlans = [
  {
    name: "Starter",
    emoji: "🧊",
    ram: "2 GB",
    slots: "10",
    price: "49",
    features: ["NVMe SSD", "DDoS Koruma", "Günlük Yedek", "Pterodactyl Panel"],
  },
  {
    name: "Crafter",
    emoji: MC.pickaxe,
    ram: "4 GB",
    slots: "25",
    price: "89",
    features: ["NVMe SSD", "DDoS Koruma", "Günlük Yedek", "Pterodactyl Panel", "Mod Desteği", "Özel Subdomain"],
    popular: true,
  },
  {
    name: "Builder",
    emoji: MC.diamond,
    ram: "8 GB",
    slots: "50",
    price: "159",
    features: ["NVMe SSD", "DDoS Koruma", "Günlük Yedek", "Pterodactyl Panel", "Mod Desteği", "Özel Subdomain", "Öncelikli Destek"],
  },
  {
    name: "Network",
    emoji: MC.crown,
    ram: "16 GB",
    slots: "100+",
    price: "299",
    features: ["NVMe SSD", "DDoS Koruma", "Anlık Yedek", "Pterodactyl Panel", "Mod Desteği", "Özel Domain", "7/24 VIP Destek", "SLA Garantisi"],
  },
];

// WebStore Rakipleri
const webstoreCompetitors = ["Tebex", "LeaderOS", "Minexon", "MineStore"];

// Tools
const tools = [
  { emoji: "🎨", title: "MOTD Builder", description: "Sürükle-bırak ile sunucu MOTD'u oluştur", href: "/tools/motd", badge: "Ücretsiz" },
  { emoji: "📋", title: "LogPaste", description: "Log paylaş, link al. Hastebin alternatifi", href: "/tools/logpaste", badge: "Ücretsiz" },
  { emoji: MC.bot, title: "Hyble Medic", description: "AI ile log analizi ve hata çözümü", href: "/tools/medic", badge: "AI" },
];

// WebStore Features
const webstoreFeatures = [
  { emoji: MC.money, title: "Güvenli Ödeme", description: "Stripe, PayPal ve yerel ödeme yöntemleri" },
  { emoji: MC.game, title: "Discord Entegrasyon", description: "Otomatik rol ve sunucu bağlantısı" },
  { emoji: MC.target, title: "Gelişmiş Analitik", description: "Satış istatistikleri ve raporlar" },
];

export default function StudiosHomePage() {
  return (
    <div className="bg-stone-50">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center py-16 lg:py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-stone-50 to-emerald-100/50" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Sol İçerik */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 border border-emerald-200 rounded-full mb-6"
              >
                <span className="text-lg">{MC.pickaxe}</span>
                <span className="text-sm font-medium text-emerald-700">Minecraft Ekosistemi</span>
                <span className="px-2 py-0.5 bg-emerald-200 rounded-full text-xs text-emerald-800">v2.0</span>
              </motion.div>

              {/* Başlık */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              >
                <span className="text-slate-900">Minecraft</span>
                <br />
                <span className="text-emerald-600">Ekosistemin</span>
                <br />
                <span className="text-slate-900 inline-flex items-center gap-3">
                  Merkezi <span className="text-3xl">{MC.diamond}</span>
                </span>
              </motion.h1>

              {/* Alt Başlık */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed"
              >
                Hosting, eklentiler, sunucu paketleri, web store ve daha fazlası.
                <span className="text-emerald-600 font-medium"> AI destekli </span>
                araçlar ve
                <span className="text-emerald-600 font-medium"> credit sistemi </span>
                ile yeni nesil Minecraft deneyimi.
              </motion.p>

              {/* Özellik Pilleri */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                {[
                  { emoji: MC.lightning, label: "Pterodactyl Panel" },
                  { emoji: MC.bot, label: "AI Entegrasyon" },
                  { emoji: MC.shield, label: "Gelişmiş Lisans" },
                  { emoji: MC.world, label: "Bedrock Uyumlu" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm"
                  >
                    <span>{item.emoji}</span>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Butonları */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
              >
                <a
                  href="#hosting"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40"
                >
                  <span>{MC.rocket}</span>
                  Sunucu Aç
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <Link
                  href="/plugins"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-300 text-slate-900 rounded-xl font-semibold text-lg hover:bg-stone-100 transition-all"
                >
                  <span>{MC.gear}</span>
                  Eklentileri Keşfet
                </Link>
              </motion.div>

              {/* Güven Notu */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 text-sm text-slate-500"
              >
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Kredi kartı gerekmez
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Anında kurulum
                </span>
              </motion.div>
            </div>

            {/* Sağ İçerik - İstatistik Kartı */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-8">
                <div className="absolute -top-px -right-px w-24 h-24 bg-emerald-500 rounded-tr-3xl rounded-bl-3xl opacity-10" />

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <span className="text-2xl">{MC.trophy}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Tecrübeli Ekip</h3>
                    <p className="text-sm text-slate-500">Minecraft sektöründe uzman</p>
                  </div>
                </div>

                {/* Experience List */}
                <div className="space-y-3 mb-8">
                  {experience.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-stone-100 rounded-xl"
                    >
                      <span className="text-emerald-500">{MC.star}</span>
                      <span className="text-sm text-slate-700">{item}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center p-3 bg-stone-100 rounded-xl">
                      <div className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-2">
                        <span className="text-lg">{stat.emoji}</span>
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ÜRÜN KATEGORİLERİ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-4xl mb-4 block">{MC.chest}</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Tüm Minecraft İhtiyaçların Tek Yerde
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hosting'den eklentilere, sunucu paketlerinden web store'a kadar eksiksiz Minecraft ekosistemi
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={category.href}
                  className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
                >
                  {category.badge && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full mb-4 bg-emerald-100 text-emerald-700">
                      {category.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg">
                      <span className="text-xl">{category.emoji}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-slate-500">{category.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {category.features.map((feature) => (
                      <span key={feature} className="px-2 py-1 text-xs bg-stone-100 text-slate-600 rounded-lg">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CREDİT SİSTEMİ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-4xl mb-4 block">{MC.gold}</span>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Hyble Credit Sistemi</h2>
              <p className="text-slate-600 mb-6">
                Aternos mantığıyla çalışan credit sistemi. AI destekli eklentiler, özel araçlar ve premium özellikler için credit kullan. Görevleri tamamla, rozet kazan, seviye atla!
              </p>

              <div className="space-y-4 mb-8">
                {["Günlük görevlerle ücretsiz credit kazan", "AI kullanımları credit ile ölçeklenir", "Rozetler ve başarımlarla dopamin", "Seviye sistemiyle artan avantajlar"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-slate-700">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://id.hyble.co/auth/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg"
              >
                <span>{MC.gift}</span>
                500 Credit Hediye Al
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {creditFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all"
                >
                  <span className="text-3xl mb-3 block">{feature.emoji}</span>
                  <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-slate-500">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* WEB STORE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-4xl mb-4 block">{MC.money}</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Hyble WebStore</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-6">
              Sunucunuz için profesyonel VIP satış sistemi. Discord entegrasyonu, otomatik rank verme ve gelişmiş analitik.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="text-sm text-slate-500">Rakiplerimiz:</span>
              {webstoreCompetitors.map((competitor) => (
                <span key={competitor} className="px-3 py-1 bg-white text-slate-600 text-sm rounded-full border border-slate-200">
                  {competitor}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {webstoreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white rounded-2xl border border-slate-200 text-center"
              >
                <span className="text-4xl mb-4 block">{feature.emoji}</span>
                <h4 className="font-semibold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ARAÇLAR */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-4xl mb-4 block">{MC.pickaxe}</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Ücretsiz Araçlar</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              MOTD oluşturucu, LogPaste ve AI destekli hata çözümleyici
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={tool.href}
                  className="group block p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{tool.emoji}</span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                      {tool.badge}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {tool.title}
                  </h4>
                  <p className="text-sm text-slate-500">{tool.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* YAKINDA GELECEKLER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-4xl mb-4 block">{MC.rocket}</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Yakında Geliyor</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Roadmap'imizde yer alan heyecan verici projeler
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingProducts.map((product, index) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white rounded-2xl border border-slate-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{product.emoji}</span>
                  <span className="px-2 py-1 text-xs bg-stone-100 text-slate-600 rounded-full">
                    {product.status}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{product.title}</h4>
                <p className="text-sm text-slate-500 mb-4">{product.description}</p>

                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${product.progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">{product.progress}% tamamlandı</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOSTİNG PLANLARI */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50" id="hosting">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-4xl mb-4 block">{MC.server}</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Minecraft Hosting Planları</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Pterodactyl panel ile profesyonel sunucu yönetimi
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hostingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 bg-white rounded-2xl border ${
                  plan.popular ? "border-emerald-500 ring-2 ring-emerald-500" : "border-slate-200"
                }`}
              >
                {plan.popular && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-4">
                    <span>{MC.star}</span>
                    En Popüler
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{plan.emoji}</span>
                  <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span>{plan.ram} RAM</span>
                  <span>•</span>
                  <span>{plan.slots} Oyuncu</span>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-slate-900">₺{plan.price}</span>
                  <span className="text-slate-500">/ay</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://id.hyble.co/auth/register"
                  className={`block w-full py-3 text-center font-medium rounded-xl transition-colors ${
                    plan.popular
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-stone-200 hover:bg-stone-300 text-slate-900"
                  }`}
                >
                  {MC.rocket} Başla
                </a>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              Özel ihtiyaçlarınız için{" "}
              <Link href="/contact" className="text-emerald-600 hover:underline">
                satış ekibiyle görüşün
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* GÜVENLİK */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-4xl mb-4 block">{MC.shield}</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Güvenlik & Lisanslama</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Çağ dışı yöntemlerle değil, modern lisanslama sistemiyle koruma
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-white rounded-2xl border border-slate-200"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">{feature.label}</h4>
                <p className="text-sm text-slate-500">{feature.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-emerald-600 text-white relative overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />

            <div className="relative text-center">
              <span className="text-6xl mb-6 block">{MC.diamond}</span>
              <h2 className="text-3xl font-bold mb-4">Minecraft Macerana Başla</h2>
              <p className="opacity-90 mb-8 max-w-xl mx-auto">
                Hosting, eklentiler, web store ve daha fazlası. Tüm Minecraft ihtiyaçların için tek adres.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://id.hyble.co/auth/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  <span>{MC.rocket}</span>
                  Ücretsiz Başla
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors border border-emerald-400"
                >
                  <span>{MC.game}</span>
                  Bize Ulaş
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
