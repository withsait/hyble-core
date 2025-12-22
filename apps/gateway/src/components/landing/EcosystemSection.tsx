"use client";

import { motion } from "framer-motion";
import { Fingerprint, Wallet, HeadphonesIcon, ShieldCheck } from "lucide-react";

const ecosystemBenefits = [
  {
    icon: Fingerprint,
    title: "Tek Hesap",
    description: "Tum servislerde gecerli Hyble ID",
    gradient: "from-sky-500 to-sky-600",
    bgGlow: "bg-sky-500/10 dark:bg-white/5",
    iconBg: "bg-sky-100 dark:bg-white/10",
    iconColor: "text-sky-500 dark:text-white",
  },
  {
    icon: Wallet,
    title: "Tek Cuzdan",
    description: "Hyble Credits ile odeme kolayligi",
    gradient: "from-sky-500 to-sky-600",
    bgGlow: "bg-sky-500/10 dark:bg-white/5",
    iconBg: "bg-sky-100 dark:bg-white/10",
    iconColor: "text-sky-500 dark:text-white",
  },
  {
    icon: HeadphonesIcon,
    title: "Tek Destek",
    description: "7/24 Turkce teknik destek",
    gradient: "from-sky-500 to-sky-600",
    bgGlow: "bg-sky-500/10 dark:bg-white/5",
    iconBg: "bg-sky-100 dark:bg-white/10",
    iconColor: "text-sky-500 dark:text-white",
  },
  {
    icon: ShieldCheck,
    title: "UK Guvence",
    description: "Companies House kayitli sirket",
    gradient: "from-sky-500 to-sky-600",
    bgGlow: "bg-sky-500/10 dark:bg-white/5",
    iconBg: "bg-sky-100 dark:bg-white/10",
    iconColor: "text-sky-500 dark:text-white",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function EcosystemSection() {
  return (
    <section id="explore" className="relative py-16 lg:py-20 overflow-hidden bg-white dark:bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-pattern" />
        {/* Gradient Orbs - sky for light mode, subtle white for dark */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/5 dark:bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-white/[0.015] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-400/5 dark:bg-white/[0.01] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-white/5 dark:to-white/5 border border-sky-200/50 dark:border-white/10 rounded-full mb-4">
            <span className="text-sm font-semibold bg-gradient-to-r from-sky-600 to-cyan-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              TEK EKOSISTEM
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Hyble ID ile{" "}
            <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
              Tum Hizmetlere
            </span>{" "}
            Erisin
          </h2>

          <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Digital ve Studios hizmetlerini tek hesapla yonetin
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {ecosystemBenefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              className="group relative p-5 bg-white/80 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden backdrop-blur-sm"
            >
              {/* Background Glow on Hover */}
              <div
                className={`absolute inset-0 ${benefit.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl`}
              />

              {/* Icon */}
              <div
                className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-3 shadow-md`}
              >
                <benefit.icon className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <h3 className="relative text-base font-semibold text-slate-900 dark:text-white mb-1">
                {benefit.title}
              </h3>
              <p className="relative text-sm text-slate-600 dark:text-slate-400">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Unified Access CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <a
            href="https://id.hyble.co"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm transition-colors border border-slate-200 dark:border-white/10"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Hyble ID ile Giris Yap</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
