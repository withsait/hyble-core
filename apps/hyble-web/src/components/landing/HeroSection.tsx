"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, CheckCircle2, Zap, Clock, Bot,
  Shield, Wallet, Cloud, Server, Gamepad2, Store,
  ChevronRight, Search
} from "lucide-react";
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

// Quick Setup Wizard seçenekleri
const setupOptions = [
  {
    id: "saas",
    icon: Store,
    label: "SaaS Projesi",
    description: "Abonelik bazlı yazılım",
    color: "from-blue-500 to-cyan-500",
    features: ["Hyble ID", "Wallet", "License"],
  },
  {
    id: "game",
    icon: Gamepad2,
    label: "Oyun Sunucusu",
    description: "Minecraft, FiveM vb.",
    color: "from-emerald-500 to-green-500",
    features: ["Cloud", "Status", "Wallet"],
  },
  {
    id: "web",
    icon: Server,
    label: "Web Projesi",
    description: "E-ticaret, portal, blog",
    color: "from-purple-500 to-pink-500",
    features: ["Cloud", "ID", "Tools"],
  },
];

// Dashboard mockup - müşteri paneli görünümü
const dashboardServices = [
  { name: "Web Hosting", status: "active", icon: "🌐", usage: "2.4 GB / 10 GB" },
  { name: "Game Server", status: "active", icon: "🎮", players: "12 / 50" },
  { name: "API License", status: "active", icon: "🔑", calls: "1,234 / 10K" },
];

export function HeroSection() {
  const [selectedSetup, setSelectedSetup] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(0);

  const handleSetupSelect = (id: string) => {
    setSelectedSetup(id);
    setWizardStep(1);
  };

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center pt-20 lg:pt-24 pb-12 lg:pb-16 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-slate-900/80 dark:to-slate-900" />

        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-[600px] h-[400px] rounded-full blur-3xl opacity-20 bg-blue-400 dark:bg-blue-600" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[350px] rounded-full blur-3xl opacity-15 bg-cyan-400 dark:bg-cyan-600" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Hepsi bir arada platform</span>
            </motion.div>

            {/* Main Headline with Gradient */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
            >
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                Kur.
              </span>{" "}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Başlat.
              </span>{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 bg-clip-text text-transparent">
                  Büyüt.
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M1 5.5Q50 1 100 5.5T199 5.5" stroke="url(#underline)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="underline" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981"/>
                      <stop offset="100%" stopColor="#22C55E"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8"
            >
              Web sitenizi, oyun sunucunuzu veya dijital projenizi dakikalar içinde kurun.
              Kolay yönetim, hızlı kurulum ve profesyonel altyapı — hepsi tek platformda.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8"
            >
              {[
                { icon: Zap, text: "Hızlı Kurulum", highlight: true },
                { icon: Shield, text: "Güvenli Altyapı" },
                { icon: Clock, text: "7/24 Destek" },
              ].map((item) => (
                <div
                  key={item.text}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    item.highlight
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
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
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/25 w-full sm:w-auto justify-center"
              >
                7 Gün Ücretsiz Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#products"
                className="group flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl font-semibold transition-all"
              >
                <Search className="w-5 h-5" />
                Demo İncele
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Kredi kartı gerekmez</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>İstediğiniz zaman iptal</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Quick Setup Wizard & Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* AI Setup Wizard */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-20" />

              {/* Main Card */}
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Hızlı Başlangıç</h3>
                      <p className="text-sm text-blue-100">Projenize uygun çözümü seçin</p>
                    </div>
                  </div>
                </div>

                {/* Wizard Content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {wizardStep === 0 ? (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                      >
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ne yapmak istiyorsunuz?</p>
                        {setupOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleSetupSelect(option.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
                              selectedSetup === option.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0`}>
                              <option.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-semibold text-slate-900 dark:text-white">{option.label}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{option.description}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </button>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center py-4"
                      >
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          Harika seçim!
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                          {setupOptions.find(o => o.id === selectedSetup)?.label} için önerilen ürünler:
                        </p>
                        <div className="flex justify-center gap-2 mb-6">
                          {setupOptions.find(o => o.id === selectedSetup)?.features.map((feature) => (
                            <span
                              key={feature}
                              className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setWizardStep(0)}
                            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            Geri
                          </button>
                          <a
                            href="https://id.hyble.co/register"
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Hemen Başla
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating Service Cards - Desktop only */}
              <div className="hidden lg:block">
                {/* Active Services Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -left-12 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-4 w-52"
                >
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Aktif Hizmetler</p>
                  <div className="space-y-2">
                    {dashboardServices.slice(0, 2).map((service) => (
                      <div key={service.name} className="flex items-center gap-2">
                        <span className="text-lg">{service.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{service.name}</p>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">Aktif</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Balance Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -bottom-6 -right-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-4 w-44"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Bakiye</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">€247.50</p>
                  <p className="text-xs text-green-500">+€50 kredi aktif</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
