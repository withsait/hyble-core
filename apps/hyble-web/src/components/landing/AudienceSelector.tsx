"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layout, Code2, Gamepad2,
  ArrowRight, Check
} from "lucide-react";

const audiences = [
  {
    id: "creators",
    icon: Layout,
    title: "Web Sitesi İstiyorum",
    description: "Şablon seç, özelleştir, yayınla",
    features: ["Sürükle-bırak editör", "200+ hazır şablon", "Hosting dahil"],
    cta: "Şablonları Gör",
    href: "/store",
    gradient: "from-amber-500 to-orange-500",
    hoverBorder: "hover:border-amber-500",
    ctaColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "developers",
    icon: Code2,
    title: "API Entegrasyonu",
    description: "Kimlik, ödeme, lisans API'leri",
    features: ["Hyble ID (OAuth)", "Wallet API", "License API"],
    cta: "Dokümantasyon",
    href: "/solutions",
    gradient: "from-blue-500 to-indigo-500",
    hoverBorder: "hover:border-blue-500",
    ctaColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "gaming",
    icon: Gamepad2,
    title: "Oyun Sunucusu",
    description: "Minecraft, FiveM ve daha fazlası",
    features: ["Anında kurulum", "DDoS koruması", "Mod desteği"],
    cta: "Sunucu Oluştur",
    href: "https://gaming.hyble.co",
    gradient: "from-emerald-500 to-teal-500",
    hoverBorder: "hover:border-emerald-500",
    ctaColor: "text-emerald-600 dark:text-emerald-400",
    external: true,
  },
];

export function AudienceSelector() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ne yapmak istiyorsunuz?
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Size en uygun çözümü seçin
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map((audience, index) => {
            const isHovered = hoveredId === audience.id;

            const cardContent = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`
                  relative overflow-hidden rounded-2xl border-2 p-8
                  bg-white dark:bg-slate-800
                  transition-all duration-300
                  border-slate-200 dark:border-slate-700
                  ${audience.hoverBorder}
                  ${isHovered ? 'shadow-xl' : 'shadow-sm'}
                `}
                onMouseEnter={() => setHoveredId(audience.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Icon */}
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-6
                  bg-gradient-to-br ${audience.gradient}
                `}>
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
                <ul className="space-y-2 mb-8">
                  {audience.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className={`flex items-center gap-2 font-medium ${audience.ctaColor}`}>
                  {audience.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );

            if (audience.external) {
              return (
                <a
                  key={audience.id}
                  href={audience.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <Link key={audience.id} href={audience.href} className="group">
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
