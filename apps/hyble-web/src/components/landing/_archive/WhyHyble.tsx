"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Clock,
  HeadphonesIcon,
  TrendingUp,
  Lock,
  CreditCard,
} from "lucide-react";

// Kompakt özellik listesi
const features = [
  { icon: Zap, title: "5dk Kurulum", description: "Hızlı başlangıç" },
  { icon: Shield, title: "DDoS Koruması", description: "Güvenli altyapı" },
  { icon: Clock, title: "%99.9 Uptime", description: "SLA garantili" },
  { icon: HeadphonesIcon, title: "7/24 Destek", description: "Her zaman yanınızda" },
  { icon: TrendingUp, title: "Ölçeklenebilir", description: "Her bütçeye uygun" },
  { icon: CreditCard, title: "Şeffaf Fiyat", description: "Gizli maliyet yok" },
];

export function WhyHyble() {
  return (
    <section id="why-hyble" className="py-10 lg:py-14 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kompakt Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Neden Hyble?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Güvenilir altyapı, şeffaf fiyatlandırma
          </p>
        </motion.div>

        {/* Kompakt Özellik Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                <feature.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {feature.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-green-500" />
            GDPR Uyumlu • ISO 27001 • Avrupa Datacenter
          </div>
        </motion.div>
      </div>
    </section>
  );
}
