"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Shield, Building2, Lock, Globe, Layout, Code2,
  Briefcase, Check, Zap, Palette, Clock, Users, FileText,
  ShoppingCart, Layers, Monitor, Smartphone, Database, Cloud,
  Star, Award, Crown, Sparkles
} from "lucide-react";

const services = [
  {
    id: "templates",
    icon: Layout,
    title: "Web Sablonlari",
    description: "Premium kurumsal temalar",
    href: "/templates",
    gradient: "from-amber-500 to-orange-600",
    bgGlow: "bg-amber-500/20",
    stats: "50+ sablon",
    badge: "Premium",
  },
  {
    id: "ecommerce",
    icon: ShoppingCart,
    title: "E-Ticaret",
    description: "Online magaza cozumleri",
    href: "/templates?category=ecommerce",
    gradient: "from-amber-600 to-yellow-500",
    bgGlow: "bg-yellow-500/20",
    stats: "Tam entegre",
  },
  {
    id: "landing",
    icon: Monitor,
    title: "Landing Page",
    description: "Yuksek donusum oranlari",
    href: "/templates?category=landing",
    gradient: "from-orange-500 to-amber-600",
    bgGlow: "bg-orange-500/20",
    stats: "A/B test",
  },
  {
    id: "solutions",
    icon: Code2,
    title: "Ekosistem",
    description: "ID, Wallet, License API",
    href: "/solutions",
    gradient: "from-amber-400 to-orange-500",
    bgGlow: "bg-amber-400/20",
    stats: "API hazir",
    badge: "Yeni",
  },
];

const trustItems = [
  { icon: Shield, label: "256-bit SSL Sifreleme", sublabel: "Tum verileriniz sifreli" },
  { icon: Building2, label: "UK Kayitli Sirket", sublabel: "Companies House #15872841" },
  { icon: Lock, label: "GDPR Uyumlu", sublabel: "Avrupa veri koruma standartlari" },
];

const stats = [
  { value: "500+", label: "Aktif Site" },
  { value: "99.9%", label: "Uptime" },
  { value: "<1s", label: "Yukleme" },
];

const features = [
  {
    icon: Zap,
    title: "Hizli Kurulum",
    description: "Dakikalar icinde online olun. Tek tikla deploy.",
  },
  {
    icon: Shield,
    title: "Guvenli Altyapi",
    description: "SSL, DDoS korumasi ve gunluk yedekleme.",
  },
  {
    icon: Code2,
    title: "Modern Teknoloji",
    description: "Next.js, React, TypeScript ile gelistirildi.",
  },
  {
    icon: Clock,
    title: "7/24 Destek",
    description: "Turkce destek ekibi her zaman yaninda.",
  },
  {
    icon: Palette,
    title: "Ozellestirilebilir",
    description: "Markaniza uygun renk ve tasarim secenekleri.",
  },
  {
    icon: Users,
    title: "Coklu Kullanici",
    description: "Ekip yonetimi ve rol tabanli erisim.",
  },
];

const templates = [
  { name: "Kurumsal Pro", category: "Business", price: "199", featured: true },
  { name: "E-Ticaret Elite", category: "E-commerce", price: "299", featured: true },
  { name: "Portfolio Gold", category: "Creative", price: "149" },
  { name: "SaaS Premium", category: "SaaS", price: "399", featured: true },
];

export default function DigitalHomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center py-16 lg:py-24 overflow-hidden">
        {/* Premium Grid Background - Amber/Gold Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/50 dark:from-[#0f172a] dark:via-slate-900 dark:to-amber-950/20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(245, 158, 11, 0.07) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(245, 158, 11, 0.07) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
          {/* Premium Gradient Orbs */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-yellow-400/15 to-amber-400/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200/50 dark:border-amber-700/50 rounded-full mb-8 shadow-sm"
              >
                <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Premium Kurumsal Cozumler
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                  <span className="text-slate-900 dark:text-white">Isletmenizi</span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                    Dijital Dunyada
                  </span>
                  <br />
                  <span className="text-slate-900 dark:text-white">One Cikarin</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
              >
                Premium web sablonlari, e-ticaret cozumleri ve kurumsal araclar.
                Hosting dahil, ekstra ucret yok.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-8"
              >
                {[
                  { icon: Layout, label: "50+ Sablon" },
                  { icon: Globe, label: "Hosting Dahil" },
                  { icon: Shield, label: "SSL Ucretsiz" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-amber-200/50 dark:border-amber-700/30 shadow-sm"
                  >
                    <item.icon className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link
                  href="/templates"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5"
                >
                  Sablonlari Incele
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/solutions"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 text-slate-900 dark:text-white rounded-xl font-semibold text-lg hover:bg-amber-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cozumleri Kesfet
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-slate-500 dark:text-slate-400"
              >
                <Star className="inline w-4 h-4 text-amber-400 mr-1" />
                14 gun ucretsiz deneme &bull; Kredi karti gerekmez
              </motion.p>
            </div>

            {/* Right Content - Trust Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-white dark:bg-slate-800/90 rounded-3xl border border-amber-200/80 dark:border-amber-700/30 shadow-2xl shadow-amber-200/50 dark:shadow-amber-900/20 p-8 backdrop-blur-sm">
                {/* Premium Corner Accent */}
                <div className="absolute -top-px -right-px w-24 h-24 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-tr-3xl rounded-bl-3xl opacity-20" />
                <div className="absolute top-4 right-4">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                  Kurumsal Altyapi
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8">
                  Premium isletmeler icin profesyonel cozumler
                </p>

                <div className="space-y-4 mb-8">
                  {trustItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/30"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-500/30 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{item.label}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{item.sublabel}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-amber-100 dark:border-amber-800/30">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{stat.value}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section - Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20"
          >
            <h2 className="text-center text-lg font-medium text-slate-600 dark:text-slate-400 mb-8">
              Isletmeniz icin ne ariyorsunuz?
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={service.href}
                  className="group relative p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-amber-100 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-200/50 dark:hover:shadow-amber-900/20 hover:-translate-y-1 overflow-hidden"
                >
                  <div className={`absolute inset-0 ${service.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl`} />

                  {service.badge && (
                    <span className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/50">
                      {service.badge}
                    </span>
                  )}

                  <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="relative font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="relative text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {service.description}
                  </p>
                  <div className="relative flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      {service.stats}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50/50 to-white dark:from-slate-800/50 dark:to-[#0f172a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Premium Ozellikler</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Neden Hyble Digital?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Kurumsal isletmeler icin tasarlanmis premium cozumler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-amber-100 dark:border-amber-800/30 hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors shadow-sm hover:shadow-md hover:shadow-amber-100/50 dark:hover:shadow-amber-900/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Templates */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-3">
                <Star className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">En Cok Satan</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Premium Sablonlar
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                En cok tercih edilen profesyonel tasarimlar
              </p>
            </div>
            <Link
              href="/templates"
              className="hidden md:inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium hover:gap-3 transition-all"
            >
              Tumunu Gor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.name}
                className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-amber-100 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-600/50 hover:shadow-xl hover:shadow-amber-100/50 dark:hover:shadow-amber-900/20 transition-all"
              >
                {template.featured && (
                  <div className="absolute top-4 right-4">
                    <Crown className="w-5 h-5 text-amber-500" />
                  </div>
                )}
                <div className="aspect-video bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl mb-4 flex items-center justify-center border border-amber-100/50 dark:border-amber-800/30">
                  <Layout className="w-12 h-12 text-amber-300 dark:text-amber-700" />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-500">{template.category}</p>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    ${template.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium"
            >
              Tum Sablonlari Gor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-amber-50/50 dark:from-[#0f172a] dark:to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white relative overflow-hidden shadow-2xl shadow-amber-500/30">
            {/* Grid Pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
            {/* Shimmer Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />

            <div className="relative">
              <Crown className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">
                Premium Dijital Donusum
              </h2>
              <p className="opacity-90 mb-8 max-w-xl mx-auto">
                Ucretsiz hesap olusturun, premium sablonlari inceleyin ve isletmenizi dijitallestirin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://id.hyble.co/auth/register"
                  className="px-8 py-4 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-colors shadow-lg"
                >
                  Ucretsiz Baslayin
                </a>
                <Link
                  href="/solutions"
                  className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors border border-amber-400/30"
                >
                  Cozumleri Kesfet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
