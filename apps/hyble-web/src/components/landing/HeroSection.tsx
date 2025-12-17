"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Eye, Shield, Zap,
  Sparkles, Headphones, Globe, ShoppingCart, Gamepad2, Settings
} from "lucide-react";
import { useState, useEffect } from "react";

// Dinamik kelime döngüsü - Her biri farklı gradient ile
const rotatingWords = [
  { text: "Büyüt", gradient: "from-blue-500 via-cyan-500 to-blue-600" },
  { text: "Ölçekle", gradient: "from-emerald-500 via-green-500 to-teal-500" },
  { text: "Yönet", gradient: "from-purple-500 via-violet-500 to-indigo-500" },
  { text: "Güvende Tut", gradient: "from-amber-500 via-orange-500 to-red-500" },
];

// Yeni wizard seçenekleri - Pazarlama odaklı, kullanıcı dostu
const wizardOptions = [
  {
    icon: Globe,
    title: "Web Sitesi Kurmak",
    description: "5 dakikada yayında",
    href: "/products/hosting",
    highlight: "En Popüler",
    stats: "2.500+ site",
  },
  {
    icon: ShoppingCart,
    title: "Online Satış Başlatmak",
    description: "Hemen satışa geç",
    href: "/products/ecommerce",
    stats: "€0 kurulum",
  },
  {
    icon: Gamepad2,
    title: "Oyun Sunucusu Açmak",
    description: "Minecraft, FiveM, Rust",
    href: "/products/gaming",
    highlight: "Yeni",
    stats: "99.9% uptime",
  },
  {
    icon: Settings,
    title: "Özel Proje Geliştirmek",
    description: "Size özel çözümler",
    href: "/contact",
    stats: "7/24 destek",
  },
];

// Mini badge'ler - Genel kitleye hitap eden
const badges = [
  { icon: Shield, text: "Güvenli Altyapı" },
  { icon: Zap, text: "Anında Kurulum" },
  { icon: Headphones, text: "7/24 Destek" },
];

export function HeroSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

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
                Hepsi bir arada dijital platform
              </span>
            </motion.div>

            {/* Main Headline - Gradient efektli */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-2">
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                İnşa Et. Başlat.
              </span>
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-gradient-to-r ${rotatingWords[currentWordIndex]?.gradient ?? "from-blue-500 to-cyan-500"} bg-clip-text text-transparent`}
                >
                  {rotatingWords[currentWordIndex]?.text ?? "Büyüt"}.
                </motion.span>
              </AnimatePresence>
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mb-8 leading-relaxed">
              Hızlı kurulum, kolay yönetim. Dakikalar içinde başlayın,
              tek panel üzerinden tüm hizmetlerinizi yönetin. Hosting, ödeme, kimlik doğrulama — hepsi hazır.
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

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <a
                href="https://id.hyble.co/register"
                className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
              >
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="group flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl font-semibold transition-all shadow-sm"
              >
                <Eye className="w-4 h-4 text-blue-500" />
                Demo İncele
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Kredi kartı gerekmez</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>14 gün ücretsiz deneme</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Browser Frame */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-blue-900/10 dark:shadow-slate-900/50 border border-slate-200/80 dark:border-slate-700 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white dark:bg-slate-900 rounded-lg px-4 py-1.5 text-xs text-slate-400 border border-slate-200 dark:border-slate-600">
                    panel.hyble.co/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Toplam Kullanıcı</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">12,847</p>
                    <p className="text-xs text-green-600 font-medium">+12%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Aktif Oturum</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">1,234</p>
                    <p className="text-xs text-green-600 font-medium">+8%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">API Çağrısı</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">2.4M</p>
                    <p className="text-xs text-green-600 font-medium">+24%</p>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Gelir Grafiği</p>
                    <div className="text-xs text-slate-500">Son 7 gün</div>
                  </div>
                  <svg className="w-full h-20" viewBox="0 0 400 70">
                    <path
                      d="M 0 55 Q 50 50 100 45 T 200 35 T 300 25 T 400 12"
                      fill="none"
                      stroke="url(#chartGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Notification Toast */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Ödeme Alındı</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">€49.00 - Pro Plan</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Floating Notification */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1 }}
              className="absolute -top-4 -right-4 flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                A
              </div>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-white">Yeni Kullanıcı</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">az önce katıldı</p>
              </div>
            </motion.div>
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
