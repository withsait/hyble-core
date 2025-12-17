"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Zap, Globe, Play, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Floating icons for visual interest
const floatingIcons = [
  { icon: "🚀", x: "10%", y: "20%", delay: 0 },
  { icon: "⚡", x: "85%", y: "15%", delay: 0.5 },
  { icon: "🔐", x: "5%", y: "70%", delay: 1 },
  { icon: "☁️", x: "90%", y: "65%", delay: 1.5 },
  { icon: "💳", x: "15%", y: "85%", delay: 2 },
  { icon: "📊", x: "80%", y: "80%", delay: 2.5 },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "10ms", label: "Response" },
  { value: "24/7", label: "Support" },
];

export function HeroSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-slate-900/50 dark:to-slate-900" />

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-3xl opacity-20 bg-blue-400 dark:bg-blue-600" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full blur-3xl opacity-10 bg-purple-400 dark:bg-purple-600" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[300px] rounded-full blur-3xl opacity-10 bg-cyan-400 dark:bg-cyan-600" />
      </div>

      {/* Floating Icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-3xl sm:text-4xl opacity-20 dark:opacity-10 pointer-events-none hidden sm:block"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 0.2,
            scale: 1,
            y: [0, -10, 0],
          }}
          transition={{
            delay: item.delay,
            duration: 3,
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Geliştiriciler için hepsi bir arada platform</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
            >
              İnşa Et. Başlat.{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Büyüt.
                </span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8"
            >
              Yazılım işinizi kurmak ve büyütmek için ihtiyacınız olan her şey.
              Kimlik doğrulama, ödeme, bulut altyapısı ve izleme — hepsi tek bir yerde.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8"
            >
              {[
                { icon: Shield, text: "Güvenli" },
                { icon: Zap, text: "Hızlı" },
                { icon: Globe, text: "Global CDN" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm"
                >
                  <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
            >
              <a
                href="https://id.hyble.co/register"
                className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
              >
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <button
                onClick={() => setIsVideoOpen(true)}
                className="group flex items-center gap-2 px-6 py-4 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                Demo İzle
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Kredi kartı gerekmez</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>14 gün ücretsiz deneme</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Main dashboard mockup */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-2xl opacity-20" />

              {/* Dashboard card */}
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
                {/* Browser header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center px-3">
                      <span className="text-xs text-slate-400 dark:text-slate-500">panel.hyble.co/dashboard</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard content mockup */}
                <div className="p-6">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "Toplam Kullanıcı", value: "12,847", change: "+12%" },
                      { label: "Aktif Oturum", value: "1,234", change: "+8%" },
                      { label: "API Çağrısı", value: "2.4M", change: "+24%" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl"
                      >
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        <span className="text-xs text-green-500">{stat.change}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="h-32 bg-gradient-to-t from-blue-500/10 to-transparent rounded-xl relative overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                      <path
                        d="M0,80 Q50,60 100,70 T200,50 T300,60 T400,30"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-4 -left-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-4 w-56"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Ödeme Alındı</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">€49.00 - Pro Plan</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating user card */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-3 w-48"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Yeni Kullanıcı</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">az önce katıldı</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:max-w-none lg:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-1"
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Video Modal Placeholder */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">Demo videosu yakında eklenecek</p>
            <button
              onClick={() => setIsVideoOpen(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
