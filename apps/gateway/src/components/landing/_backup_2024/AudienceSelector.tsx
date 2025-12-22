"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe, Cloud, Code2, Gamepad2, Briefcase,
  ArrowRight, Check, Sparkles
} from "lucide-react";

const audiences = [
  {
    id: "websites",
    icon: Globe,
    title: "Web Sitesi & Şablon",
    description: "Hazır şablonlarla hızlı başla",
    features: ["200+ profesyonel şablon", "Sürükle-bırak editör", "Hosting dahil", "One-click deploy"],
    cta: "Şablonları Gör",
    href: "/store",
    gradient: "from-amber-500 to-orange-500",
    hoverBorder: "hover:border-amber-500",
    badge: "En Popüler",
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud Hosting",
    description: "VPS, web hosting, managed database",
    features: ["Cloud VPS €1.99'dan", "Managed PostgreSQL/MySQL", "Auto-scaling", "DDoS koruması"],
    cta: "Sunucu Oluştur",
    href: "/cloud",
    gradient: "from-blue-500 to-cyan-500",
    hoverBorder: "hover:border-blue-500",
  },
  {
    id: "api",
    icon: Code2,
    title: "API & Ekosistem",
    description: "Geliştiriciler için hazır çözümler",
    features: ["Hyble ID (OAuth/SSO)", "Wallet & Ödeme", "License yönetimi", "Webhook & SDK"],
    cta: "Dokümantasyon",
    href: "/solutions",
    gradient: "from-purple-500 to-indigo-500",
    hoverBorder: "hover:border-purple-500",
  },
  {
    id: "gaming",
    icon: Gamepad2,
    title: "Gaming Hosting",
    description: "Minecraft, FiveM, Rust sunucuları",
    features: ["60 saniyede kurulum", "Mod & plugin desteği", "DDoS koruması", "7/24 destek"],
    cta: "Sunucu Kur",
    href: "https://gaming.hyble.co",
    gradient: "from-emerald-500 to-teal-500",
    hoverBorder: "hover:border-emerald-500",
    external: true,
  },
  {
    id: "enterprise",
    icon: Briefcase,
    title: "Kurumsal & Özel",
    description: "İşletmenize özel çözümler",
    features: ["Dedicated altyapı", "Özel entegrasyonlar", "SLA garantisi", "Account manager"],
    cta: "Demo Talep Et",
    href: "/enterprise",
    gradient: "from-slate-600 to-slate-800",
    hoverBorder: "hover:border-slate-500",
    badge: "B2B",
  },
];

export function AudienceSelector() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            İhtiyacınıza Uygun Çözüm
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Bireysel projelerden kurumsal çözümlere, her ölçekte yanınızdayız
          </p>
        </motion.div>

        {/* Cards Grid - 2-3 layout for better visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((audience, index) => {
            const isHovered = hoveredId === audience.id;
            const CardWrapper = audience.external ? 'a' : Link;
            const cardProps = audience.external
              ? { href: audience.href, target: "_blank", rel: "noopener noreferrer" }
              : { href: audience.href };

            return (
              <motion.div
                key={audience.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={index >= 3 ? "lg:col-span-1 md:col-span-1" : ""}
              >
                <CardWrapper
                  {...cardProps}
                  className="group block h-full"
                  onMouseEnter={() => setHoveredId(audience.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className={`
                    relative h-full overflow-hidden rounded-2xl border-2 p-8
                    bg-white dark:bg-slate-800
                    transition-all duration-300
                    border-slate-200 dark:border-slate-700
                    ${audience.hoverBorder}
                    ${isHovered ? 'shadow-xl' : 'shadow-sm'}
                  `}>
                    {/* Badge */}
                    {audience.badge && (
                      <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${
                        audience.badge === "En Popüler"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      }`}>
                        {audience.badge}
                      </span>
                    )}

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${audience.gradient}`}>
                      <audience.icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {audience.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {audience.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {audience.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
                      {audience.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
