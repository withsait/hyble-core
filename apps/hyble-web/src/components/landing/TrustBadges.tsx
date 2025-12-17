"use client";

import { motion } from "framer-motion";
import { Shield, Server, Lock, CreditCard, Globe, Award } from "lucide-react";

const securityBadges = [
  { icon: Server, text: "Hetzner Altyapısı", subtext: "Almanya DC" },
  { icon: Shield, text: "GDPR Uyumlu", subtext: "Veri Güvenliği" },
  { icon: Lock, text: "256-bit SSL", subtext: "Şifreli Bağlantı" },
  { icon: CreditCard, text: "PCI DSS", subtext: "Güvenli Ödeme" },
  { icon: Globe, text: "Global CDN", subtext: "Hızlı Erişim" },
  { icon: Award, text: "ISO 27001", subtext: "Sertifikalı" },
];

// Partner/Technology logos (using text placeholders - replace with actual logos)
const techPartners = [
  { name: "Stripe", logo: "stripe" },
  { name: "Cloudflare", logo: "cloudflare" },
  { name: "Hetzner", logo: "hetzner" },
  { name: "Vercel", logo: "vercel" },
  { name: "PostgreSQL", logo: "postgresql" },
];

export function TrustBadges() {
  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            Güvenlik ve Uyumluluk
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {securityBadges.map((badge, index) => (
              <motion.div
                key={badge.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <badge.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{badge.text}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{badge.subtext}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 my-12" />

        {/* Technology Partners - Logo Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            Teknoloji Ortaklarımız
          </p>

          {/* Logo scroll container */}
          <div className="relative overflow-hidden">
            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10" />

            {/* Scrolling logos */}
            <div className="flex animate-scroll">
              {/* First set */}
              {[...techPartners, ...techPartners].map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="flex-shrink-0 mx-8 flex items-center justify-center"
                >
                  <div className="px-6 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-lg font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                      {partner.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 pt-12 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Aktif Kullanıcı" },
              { value: "1M+", label: "API Çağrısı/Ay" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "<50ms", label: "Ortalama Yanıt" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
