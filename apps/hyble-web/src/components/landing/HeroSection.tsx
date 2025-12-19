"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Shield, Building2, Lock,
  Globe, Cloud, Code2, Gamepad2, Briefcase
} from "lucide-react";

// 5 Ana Segment
const segments = [
  {
    id: "websites",
    icon: Globe,
    title: "Web Sitesi",
    description: "Şablon seç, yayınla",
    href: "/store",
    color: "amber",
    stats: "200+ şablon",
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud Hosting",
    description: "VPS & Database",
    href: "/cloud",
    color: "blue",
    stats: "€1.99'dan",
  },
  {
    id: "api",
    icon: Code2,
    title: "API Çözümleri",
    description: "ID, Wallet, License",
    href: "/solutions",
    color: "purple",
    stats: "Ücretsiz tier",
  },
  {
    id: "gaming",
    icon: Gamepad2,
    title: "Gaming",
    description: "Oyun sunucuları",
    href: "https://gaming.hyble.co",
    color: "emerald",
    stats: "Anında kurulum",
    external: true,
  },
  {
    id: "enterprise",
    icon: Briefcase,
    title: "Kurumsal",
    description: "Özel çözümler",
    href: "/enterprise",
    color: "slate",
    stats: "Danışmanlık",
  },
];

const trustItems = [
  { icon: Shield, label: "256-bit SSL", sublabel: "Şifreli bağlantı" },
  { icon: Building2, label: "UK Şirketi", sublabel: "#15872841" },
  { icon: Lock, label: "GDPR Uyumlu", sublabel: "Veri koruma" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center py-12 lg:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800 rounded-full mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Web'den Gaming'e, API'den Cloud'a — Tek Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            <span className="text-slate-900 dark:text-white">Dijital Altyapınız İçin</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Tek Platform
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Hazır şablonlardan kurumsal çözümlere, cloud hosting'den oyun sunucularına.
            Her ölçekte işletme için dijital altyapı.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/store"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-amber-500/25"
            >
              Şablonları Keşfet
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/enterprise"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold text-lg transition-all"
            >
              Kurumsal Çözümler
            </Link>
          </motion.div>
        </div>

        {/* 5 Segment Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16"
        >
          {segments.map((segment) => {
            const colorClasses = {
              amber: "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10",
              blue: "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10",
              purple: "hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10",
              emerald: "hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10",
              slate: "hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
            };

            const iconColorClasses = {
              amber: "text-amber-500",
              blue: "text-blue-500",
              purple: "text-purple-500",
              emerald: "text-emerald-500",
              slate: "text-slate-500",
            };

            const CardWrapper = segment.external ? 'a' : Link;
            const cardProps = segment.external
              ? { href: segment.href, target: "_blank", rel: "noopener noreferrer" }
              : { href: segment.href };

            return (
              <CardWrapper
                key={segment.id}
                {...cardProps}
                className={`group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 transition-all duration-300 ${colorClasses[segment.color as keyof typeof colorClasses]}`}
              >
                <segment.icon className={`w-8 h-8 mb-3 ${iconColorClasses[segment.color as keyof typeof iconColorClasses]}`} />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {segment.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {segment.description}
                </p>
                <span className="text-xs font-medium text-slate-400">
                  {segment.stats}
                </span>
                <ArrowRight className="absolute bottom-6 right-6 w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </CardWrapper>
            );
          })}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-5 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl border border-slate-200/50 dark:border-slate-700/50"
            >
              <item.icon className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</div>
                <div className="text-xs text-slate-500">{item.sublabel}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
