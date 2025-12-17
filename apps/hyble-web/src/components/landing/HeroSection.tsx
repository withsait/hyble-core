"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Play, Shield, Zap, Globe,
  CreditCard, Key, Activity, Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";

// Dinamik kelime döngüsü
const rotatingWords = [
  { text: "Büyüt", color: "text-blue-600" },
  { text: "Ölçekle", color: "text-emerald-600" },
  { text: "Yönet", color: "text-purple-600" },
  { text: "Güvende Tut", color: "text-cyan-600" },
];

// Soru bazlı onboarding seçenekleri
const onboardingOptions = [
  {
    icon: Shield,
    question: "Kullanıcı girişi sistemi kurmak",
    product: "Hyble ID",
    href: "/products/id",
  },
  {
    icon: CreditCard,
    question: "Ödeme almak",
    product: "Hyble Wallet",
    href: "/products/wallet",
  },
  {
    icon: Key,
    question: "Yazılımımı lisanslamak",
    product: "Hyble License",
    href: "/products/license",
  },
  {
    icon: Activity,
    question: "Sunucu durumu takibi",
    product: "Hyble Status",
    href: "/products/status",
  },
];

// Mini badge'ler
const badges = [
  { icon: Shield, text: "Güvenli" },
  { icon: Zap, text: "Hızlı" },
  { icon: Globe, text: "Global CDN" },
];

// Alt istatistikler
const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "10ms", label: "Response" },
  { value: "24/7", label: "Support" },
];

export function HeroSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-16 pb-16 overflow-hidden">
      {/* Background - More visible grid pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Grid Pattern - Daha belirgin */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Radial fade */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.8)_70%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,23,42,0.8)_70%)]" />
        {/* Subtle gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.06] bg-blue-500" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.04] bg-purple-500" />
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
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-full mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Geliştiriciler için hepsi bir arada platform
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-2">
              İnşa Et. Başlat.
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={rotatingWords[currentWordIndex]?.color ?? "text-blue-600"}
                >
                  {rotatingWords[currentWordIndex]?.text ?? "Büyüt"}.
                </motion.span>
              </AnimatePresence>
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mb-8 leading-relaxed">
              Yazılım işinizi kurmak ve büyütmek için ihtiyacınız olan her şey.
              Kimlik doğrulama, ödeme, bulut altyapısı ve izleme — hepsi tek bir yerde.
            </p>

            {/* Mini Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {badges.map((badge) => (
                <div
                  key={badge.text}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                  <badge.icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-6">
              <a
                href="https://id.hyble.co/register"
                className="group flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold transition-all hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/10"
              >
                Ücretsiz Başla
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="group flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg font-medium transition-all"
              >
                <Play className="w-4 h-4" />
                Demo İzle
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Kredi kartı gerekmez</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>14 gün ücretsiz deneme</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Dashboard Mockup + Onboarding */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Browser Frame */}
            <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-slate-900/10 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-white dark:bg-slate-900 rounded px-3 py-1 text-[11px] text-slate-400 border border-slate-200 dark:border-slate-700">
                    panel.hyble.co/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-5">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Toplam Kullanıcı</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">12,847</p>
                    <p className="text-[10px] text-green-600 font-medium">+12%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Aktif Oturum</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">1,234</p>
                    <p className="text-[10px] text-green-600 font-medium">+8%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">API Çağrısı</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">2.4M</p>
                    <p className="text-[10px] text-green-600 font-medium">+24%</p>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Gelir Grafiği</p>
                    <div className="text-[10px] text-slate-500">Son 7 gün</div>
                  </div>
                  <svg className="w-full h-16" viewBox="0 0 400 60">
                    <path
                      d="M 0 50 Q 50 45 100 40 T 200 30 T 300 20 T 400 10"
                      fill="none"
                      stroke="url(#chartGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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
                  className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-900 dark:text-white">Ödeme Alındı</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">€49.00 - Pro Plan</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Floating Notification */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1 }}
              className="absolute -top-3 -right-3 flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                A
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-900 dark:text-white">Yeni Kullanıcı</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400">az önce katıldı</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Question-based Onboarding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              Bugün ne yapmak istiyorsunuz?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hedefinize uygun ürünü keşfedin
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {onboardingOptions.map((option, index) => (
              <motion.a
                key={option.question}
                href={option.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                className="group flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                  <option.icon className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-tight">
                  {option.question}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {option.product} →
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
