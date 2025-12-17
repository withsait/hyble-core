"use client";

import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Play, Shield, Zap, Globe,
  TrendingUp, Users, Activity
} from "lucide-react";
import { useState, useEffect } from "react";

// Dinamik kelime döngüsü
const rotatingWords = [
  { text: "Büyüt", color: "text-blue-500" },
  { text: "Ölçekle", color: "text-emerald-500" },
  { text: "Yönet", color: "text-purple-500" },
  { text: "Güvende Tut", color: "text-cyan-500" },
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 right-1/3 w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.04] bg-blue-500" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.03] bg-cyan-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full mb-6"
            >
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Geliştiriciler için hepsi bir arada platform
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
              İnşa Et. Başlat.
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <motion.span
                key={currentWordIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={rotatingWords[currentWordIndex]?.color ?? "text-blue-500"}
              >
                {rotatingWords[currentWordIndex]?.text ?? "Büyüt"}.
              </motion.span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-xl mb-8 leading-relaxed">
              Yazılım işinizi kurmak ve büyütmek için ihtiyacınız olan her şey.
              Kimlik doğrulama, ödeme, bulut altyapısı ve izleme — hepsi tek bir yerde.
            </p>

            {/* Mini Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {badges.map((badge) => (
                <div
                  key={badge.text}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <badge.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <a
                href="https://id.hyble.co/register"
                className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="group flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl font-semibold transition-all shadow-sm"
              >
                <Play className="w-4 h-4" />
                Demo İzle
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
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

          {/* Right Side - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Browser Frame */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white dark:bg-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-400 border border-slate-200 dark:border-slate-600">
                    panel.hyble.co/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Toplam Kullanıcı</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">12,847</p>
                    <p className="text-xs text-green-500 font-medium">+12%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Aktif Oturum</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">1,234</p>
                    <p className="text-xs text-green-500 font-medium">+8%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">API Çağrısı</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">2.4M</p>
                    <p className="text-xs text-green-500 font-medium">+24%</p>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Gelir Grafiği</p>
                    <div className="text-xs text-slate-500">Son 7 gün</div>
                  </div>
                  {/* Simple Chart SVG */}
                  <svg className="w-full h-24" viewBox="0 0 400 80">
                    <path
                      d="M 0 60 Q 50 50 100 45 T 200 35 T 300 25 T 400 15"
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1 }}
              className="absolute -top-4 -right-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl"
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

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
