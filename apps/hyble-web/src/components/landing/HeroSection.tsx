"use client";

import { motion } from "framer-motion";
import {
  ArrowRight, Shield, Zap,
  Sparkles, Headphones, Globe, ShoppingCart, Settings,
  Building2, Lock
} from "lucide-react";

// Yeni wizard seçenekleri - Site builder ve şablon odaklı
const wizardOptions = [
  {
    icon: Globe,
    title: "Web Sitesi Oluştur",
    description: "Sürükle-bırak editör",
    href: "/websites/new",
    highlight: "En Popüler",
    stats: "2.500+ site",
  },
  {
    icon: Sparkles,
    title: "AI ile Site Yap",
    description: "60 saniyede hazır",
    href: "/websites/new/ai",
    highlight: "Yeni",
    stats: "Yapay zeka",
  },
  {
    icon: ShoppingCart,
    title: "Şablon Satın Al",
    description: "Profesyonel tasarımlar",
    href: "/store",
    stats: "200+ şablon",
  },
  {
    icon: Settings,
    title: "Ekosistem Hizmetleri",
    description: "ID, Wallet, License",
    href: "/solutions",
    stats: "API hazır",
  },
];

// Mini badge'ler - Site builder odaklı
const badges = [
  { icon: Zap, text: "Sürükle & Bırak" },
  { icon: Shield, text: "Hosting Dahil" },
  { icon: Headphones, text: "7/24 Destek" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-120px)] flex items-center pt-8 pb-12 lg:pt-12 lg:pb-16 overflow-hidden">
      {/* Background - Açık mavi gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 bg-blue-400" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-15 bg-cyan-400" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-left"
          >
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Web sitesi yapımı ve şablon mağazası
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-2">
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                Web Sitenizi
              </span>
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
                5 Dakikada Oluşturun
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mb-8 leading-relaxed">
              Şablon seçin, özelleştirin, yayınlayın. Hosting dahil, ekstra ücret yok.
            </p>

            {/* Mini Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {badges.map((badge) => (
                <div
                  key={badge.text}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-sm"
                >
                  <badge.icon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Button - Tek ana CTA */}
            <div className="flex flex-col items-start gap-4">
              <a
                href="https://id.hyble.co/register"
                className="group flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30"
              >
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Kredi kartı gerekmez • 14 gün ücretsiz deneme
              </p>
            </div>
          </motion.div>

          {/* Right Side - Trust Badges & Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Trust Badges Card */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-blue-900/10 dark:shadow-slate-900/50 border border-slate-200/80 dark:border-slate-700 overflow-hidden p-8">
              {/* Main Trust Badges */}
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                    Güvenilir Altyapı
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    İşletmeniz için kurumsal seviye güvenlik
                  </p>
                </div>

                {/* Trust Items */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">256-bit SSL Şifreleme</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Tüm verileriniz şifreli</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">UK Kayıtlı Şirket</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Companies House #15872841</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">GDPR Uyumlu</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Avrupa veri koruma standartları</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats - Real values */}
                <div className="flex items-center justify-center gap-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">99.9%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Uptime SLA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">7/24</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Destek</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">EU</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sunucu Lokasyonu</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Wizard Card - Bugün ne yapmak istiyorsunuz? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10"
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-5">
              <p className="text-base font-semibold text-slate-800 dark:text-white">
                Bugün ne yapmak istiyorsunuz?
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {wizardOptions.map((option, index) => (
                <motion.a
                  key={option.title}
                  href={option.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                  className="group relative flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all bg-white dark:bg-slate-800/80 overflow-hidden"
                >
                  {/* Highlight Badge */}
                  {"highlight" in option && option.highlight && (
                    <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      option.highlight === "En Popüler"
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                        : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {option.highlight}
                    </span>
                  )}

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 flex items-center justify-center transition-colors mb-3">
                    <option.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                    {option.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {option.description}
                  </p>

                  {/* Stats & Arrow */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {option.stats}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
