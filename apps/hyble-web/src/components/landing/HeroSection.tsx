"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Shield, Building2, Lock, Sparkles,
  Globe, Cloud, Code2, Gamepad2, Briefcase, Check, Zap
} from "lucide-react";

// 5 Ana Segment - zengin kartlar
const segments = [
  {
    id: "websites",
    icon: Globe,
    title: "Web Sitesi",
    description: "Sürükle-bırak editör",
    href: "/store",
    gradient: "from-amber-500 to-orange-600",
    bgGlow: "bg-amber-500/20",
    stats: "2.500+ site",
    badge: "En Popüler",
  },
  {
    id: "ai",
    icon: Sparkles,
    title: "AI ile Site Yap",
    description: "60 saniyede hazır",
    href: "/websites/new/ai",
    gradient: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/20",
    stats: "Yapay zeka",
    badge: "Yeni",
  },
  {
    id: "store",
    icon: Globe,
    title: "Şablon Satın Al",
    description: "Profesyonel tasarımlar",
    href: "/store",
    gradient: "from-blue-500 to-cyan-600",
    bgGlow: "bg-blue-500/20",
    stats: "200+ şablon",
  },
  {
    id: "ecosystem",
    icon: Code2,
    title: "Ekosistem Hizmetleri",
    description: "ID, Wallet, License",
    href: "/solutions",
    gradient: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/20",
    stats: "API hazır",
  },
];

const trustItems = [
  { icon: Shield, label: "256-bit SSL Şifreleme", sublabel: "Tüm verileriniz şifreli" },
  { icon: Building2, label: "UK Kayıtlı Şirket", sublabel: "Companies House #15872841" },
  { icon: Lock, label: "GDPR Uyumlu", sublabel: "Avrupa veri koruma standartları" },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "7/24", label: "Destek" },
  { value: "EU", label: "Sunucu Lokasyonu" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center py-16 lg:py-24 overflow-hidden">
      {/* Premium Grid Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 border border-blue-200/50 dark:border-blue-700/50 rounded-full mb-8 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Web sitesi yapımı ve şablon mağazası
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                <span className="text-slate-900 dark:text-white">Web Sitenizi</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  5 Dakikada
                </span>
                <br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Oluşturun
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
            >
              Şablon seçin, özelleştirin, yayınlayın. Hosting dahil, ekstra ücret yok.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              {[
                { icon: Zap, label: "Sürükle & Bırak" },
                { icon: Globe, label: "Hosting Dahil" },
                { icon: Shield, label: "7/24 Destek" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <item.icon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Link
                href="/websites/new"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5"
              >
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Trust Note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-slate-500 dark:text-slate-400"
            >
              Kredi kartı gerekmez • 14 gün ücretsiz deneme
            </motion.p>
          </div>

          {/* Right Content - Trust Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            {/* Trust Card */}
            <div className="relative bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 backdrop-blur-sm">
              {/* Decorative Corner */}
              <div className="absolute -top-px -right-px w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-tr-3xl rounded-bl-3xl opacity-10" />

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                Güvenilir Altyapı
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8">
                İşletmeniz için kurumsal seviye güvenlik
              </p>

              {/* Trust Items */}
              <div className="space-y-4 mb-8">
                {trustItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{item.label}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{item.sublabel}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
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
          <h2 className="text-center text-lg font-medium text-slate-600 dark:text-slate-400 mb-8">
            Bugün ne yapmak istiyorsunuz?
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {segments.map((segment, index) => (
              <Link
                key={segment.id}
                href={segment.href}
                className="group relative p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 overflow-hidden"
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 ${segment.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl`} />

                {/* Badge */}
                {segment.badge && (
                  <span className={`absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full ${
                    segment.badge === "En Popüler"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      : "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                  }`}>
                    {segment.badge}
                  </span>
                )}

                {/* Icon */}
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${segment.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <segment.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="relative font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {segment.title}
                </h3>
                <p className="relative text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {segment.description}
                </p>
                <div className="relative flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {segment.stats}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
