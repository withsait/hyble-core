"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Gamepad2,
  Globe,
  Server,
  Palette,
  Puzzle,
  ShoppingCart,
  Sparkles,
  Zap,
  Users,
  Package,
  Building2,
  Clock,
  Headphones,
  CheckCircle2,
} from "lucide-react";

const verticals = [
  {
    id: "digital",
    icon: Briefcase,
    title: "DIGITAL",
    subtitle: "Web & SaaS Cozumleri",
    tagline: "Isletmenizi dijitallestirin",
    description: "Kurumsal web siteleri, e-ticaret ve ozel yazilim projeleri",
    features: [
      { icon: Globe, label: "Web Siteleri" },
      { icon: Palette, label: "200+ Sablon" },
      { icon: ShoppingCart, label: "E-ticaret" },
      { icon: Sparkles, label: "AI Araclar" },
    ],
    stats: { value: "2,500+", label: "Web Sitesi" },
    cta: "Digital'i Kesfet",
    href: "https://digital.hyble.co",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10",
    borderColor: "border-amber-200/50 dark:border-amber-500/20",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-400/50",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    shadowColor: "shadow-amber-500/20",
  },
  {
    id: "studios",
    icon: Gamepad2,
    title: "STUDIOS",
    subtitle: "Gaming Cozumleri",
    tagline: "Oyun deneyimini yukselt",
    description: "Minecraft hosting, premium pluginler ve sunucu paketleri",
    features: [
      { icon: Server, label: "MC Hosting" },
      { icon: Puzzle, label: "Pluginler" },
      { icon: Package, label: "Paketler" },
      { icon: Zap, label: "DDoS Koruma" },
    ],
    stats: { value: "500+", label: "Sunucu" },
    cta: "Studios'u Kesfet",
    href: "https://studios.hyble.co",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10",
    borderColor: "border-emerald-200/50 dark:border-emerald-500/20",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-400/50",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    shadowColor: "shadow-emerald-500/20",
  },
];

const trustStats = [
  { icon: Users, value: "5,000+", label: "Kullanici" },
  { icon: Building2, value: "UK", label: "Kayitli" },
  { icon: Clock, value: "99.9%", label: "Uptime" },
  { icon: Headphones, value: "7/24", label: "Destek" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center py-6 lg:py-8 overflow-hidden">
      {/* Background with grid pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        {/* Grid pattern - visible in both modes */}
        <div className="absolute inset-0 grid-pattern" />

        {/* Animated gradient orbs - sky/cyan for light, subtle gray for dark */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/15 dark:bg-white/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/15 dark:bg-white/[0.02] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-sky-400/12 dark:bg-white/[0.015] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 lg:mb-8"
        >
          {/* Brand Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-white/5 backdrop-blur-xl rounded-full border border-slate-200 dark:border-white/10 shadow-lg shadow-slate-200/20 dark:shadow-none mb-4"
          >
            <div className="w-6 h-6 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-white">
              HYBLE <span className="text-slate-400 dark:text-slate-500">| UK Platform</span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] mb-3"
          >
            <span className="text-slate-900 dark:text-white">Fikriniz Var, </span>
            <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">Biz Hayata Gecirelim</span>
          </motion.h1>

          {/* Subtitle with concrete value props */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-2"
          >
            Web siteniz <span className="text-amber-600 dark:text-amber-400 font-semibold">24 saatte</span> hazir,
            sunucunuz <span className="text-emerald-600 dark:text-emerald-400 font-semibold">5 dakikada</span> aktif
          </motion.p>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-sm text-slate-500 dark:text-slate-500 mb-4"
          >
            UK kayitli sirket • 5,000+ mutlu musteri • 99.9% uptime garantisi
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <a
              href="https://id.hyble.co/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all hover:scale-[1.02]"
            >
              <span>Ucretsiz Basla</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl font-semibold backdrop-blur-sm transition-all hover:scale-[1.02]"
            >
              Incele
            </a>
          </motion.div>
        </motion.div>

        {/* Vertical Cards - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4 lg:gap-6 mb-6"
        >
          {verticals.map((vertical, index) => (
            <a
              key={vertical.id}
              href={vertical.href}
              className={`group relative overflow-hidden rounded-2xl border ${vertical.borderColor} ${vertical.hoverBorder} bg-white/80 dark:bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
            >
              {/* Card Background */}
              <div className={`absolute inset-0 ${vertical.bgGradient} opacity-50`} />

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
              </div>

              {/* Content */}
              <div className="relative p-5 lg:p-6">
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${vertical.gradient} flex items-center justify-center shadow-lg ${vertical.shadowColor}`}>
                      <vertical.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl lg:text-2xl font-bold bg-gradient-to-r ${vertical.gradient} bg-clip-text text-transparent`}>
                        {vertical.title}
                      </h2>
                      <p className={`text-xs font-medium ${vertical.iconColor}`}>
                        {vertical.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Stats badge */}
                  <div className={`hidden sm:block px-3 py-1.5 rounded-lg ${vertical.iconBg}`}>
                    <div className={`text-sm font-bold ${vertical.iconColor}`}>{vertical.stats.value}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{vertical.stats.label}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {vertical.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {vertical.features.map((feature) => (
                    <div
                      key={feature.label}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${vertical.iconBg} text-xs font-medium`}
                    >
                      <feature.icon className={`w-3.5 h-3.5 ${vertical.iconColor}`} />
                      <span className="text-slate-700 dark:text-slate-300">{feature.label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className={`inline-flex items-center gap-2 text-sm font-semibold ${vertical.iconColor} group-hover:gap-3 transition-all`}>
                  <span>{vertical.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>
          ))}
        </motion.div>

        {/* Trust Bar - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center items-center gap-6 lg:gap-10 py-4 px-6 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/5"
        >
          {trustStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <stat.icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <div className="flex items-baseline gap-1">
                <span className="text-base lg:text-lg font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Subtle benefits row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 lg:gap-6 mt-4 text-xs text-slate-500 dark:text-slate-500"
        >
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
            Kredi karti gerektirmez
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
            Aninda kurulum
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
            Turkce destek
          </span>
        </motion.div>
      </div>
    </section>
  );
}
