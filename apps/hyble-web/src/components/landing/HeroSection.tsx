"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

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

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-slate-900/50 dark:to-slate-900" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-3xl opacity-20 bg-blue-400 dark:bg-blue-600" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
          className="text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>Geliştiriciler için hepsi bir arada platform</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6"
          >
            İnşa Et. Başlat.{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Büyüt.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Yazılım işinizi kurmak ve büyütmek için ihtiyacınız olan her şey.
            Kimlik doğrulama, araçlar, lisanslama ve izleme — hepsi tek bir yerde.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://id.hyble.co/register"
              className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Ücretsiz Başla
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
