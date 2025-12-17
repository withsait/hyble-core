"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Shield, CreditCard, Key,
  Activity, Cloud, Wrench, Play
} from "lucide-react";
import { useState, useEffect } from "react";

// Dinamik kelime döngüsü
const rotatingWords = [
  { text: "SaaS Projelerinizi", color: "text-blue-500" },
  { text: "E-Ticaret Sitenizi", color: "text-emerald-500" },
  { text: "Oyun Sunucularınızı", color: "text-purple-500" },
  { text: "Dijital İşinizi", color: "text-cyan-500" },
];

// Ürün kartları - basit ve temiz
const productCards = [
  { icon: Shield, name: "ID", desc: "Kimlik Doğrulama" },
  { icon: CreditCard, name: "Wallet", desc: "Ödeme Sistemi" },
  { icon: Key, name: "License", desc: "Lisans Yönetimi" },
  { icon: Activity, name: "Status", desc: "Durum İzleme" },
  { icon: Cloud, name: "Cloud", desc: "Sunucu Hosting" },
  { icon: Wrench, name: "Tools", desc: "Geliştirici Araçları" },
];

export function HeroSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.08] bg-blue-500" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.06] bg-cyan-500" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline with Rotating Word */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`inline-block ${rotatingWords[currentWordIndex]?.color ?? "text-blue-500"}`}
                >
                  {rotatingWords[currentWordIndex]?.text ?? ""}
                </motion.span>
              </AnimatePresence>
            </h1>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Tek Platformdan Yönetin
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8"
          >
            Kimlik doğrulama, ödeme altyapısı, lisanslama, hosting ve daha fazlası.
            <span className="text-slate-900 dark:text-white font-medium"> All in One. All in Hyble.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <a
              href="https://id.hyble.co/register"
              className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
            >
              Ücretsiz Başla
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#how-it-works"
              className="group flex items-center gap-2 px-6 py-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600 rounded-xl font-semibold transition-all w-full sm:w-auto justify-center"
            >
              <Play className="w-4 h-4" />
              Nasıl Çalışır?
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mb-12"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>7 gün ücretsiz</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Kredi kartı gerekmez</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>5 dakikada kurulum</span>
            </div>
          </motion.div>

          {/* Product Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          >
            {productCards.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center mx-auto mb-2 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors">
                  <product.icon className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Hyble {product.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{product.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
