"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Wrench,
  Key,
  Activity,
  CreditCard,
  Cloud,
  Users,
  BarChart3,
  Lock,
  Zap,
  Globe,
  Code2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Server,
  Gamepad2,
} from "lucide-react";

// Live Preview Components
function HybleIDPreview() {
  return (
    <div className="mt-6 space-y-3">
      {/* Login Form Preview */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
        <div className="space-y-3">
          <div className="h-9 bg-slate-800 rounded-lg flex items-center px-3">
            <span className="text-xs text-slate-500">user@company.com</span>
          </div>
          <div className="h-9 bg-slate-800 rounded-lg flex items-center px-3">
            <span className="text-xs text-slate-500">••••••••••••</span>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="h-9 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center"
          >
            <span className="text-xs font-medium text-white">Giriş Yap</span>
          </motion.div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-700">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-xs">G</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-xs">𝕏</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-xs">🔗</span>
          </div>
        </div>
      </div>
      {/* Auth Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-slate-800/50 rounded-lg text-center">
          <p className="text-lg font-bold text-white">2FA</p>
          <p className="text-xs text-green-400">Aktif</p>
        </div>
        <div className="p-2 bg-slate-800/50 rounded-lg text-center">
          <p className="text-lg font-bold text-white">SSO</p>
          <p className="text-xs text-blue-400">Hazır</p>
        </div>
        <div className="p-2 bg-slate-800/50 rounded-lg text-center">
          <p className="text-lg font-bold text-white">OAuth</p>
          <p className="text-xs text-purple-400">2.0</p>
        </div>
      </div>
    </div>
  );
}

function WalletPreview() {
  return (
    <div className="mt-6 space-y-3">
      {/* Balance Card */}
      <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-green-100">Ana Bakiye</span>
          <CreditCard className="w-5 h-5 text-green-200" />
        </div>
        <p className="text-3xl font-bold text-white mb-1">€2,847.50</p>
        <div className="flex items-center gap-2 text-sm text-green-200">
          <TrendingUp className="w-4 h-4" />
          <span>+€350 bu ay</span>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-3 bg-slate-800/50 rounded-lg text-center cursor-pointer"
        >
          <span className="text-sm text-slate-300">Bakiye Yükle</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-3 bg-slate-800/50 rounded-lg text-center cursor-pointer"
        >
          <span className="text-sm text-slate-300">Transfer</span>
        </motion.div>
      </div>
    </div>
  );
}

function LicensePreview() {
  return (
    <div className="mt-6 space-y-3">
      {/* License Key */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 font-mono">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400">Aktif Lisans</span>
        </div>
        <p className="text-sm text-slate-300 mb-2 break-all">
          HYBL-XXXX-XXXX-XXXX
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Pro Plan</span>
          <span>31 Aralık 2025</span>
        </div>
      </div>
      {/* API Example */}
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400 mb-2">API Doğrulama</p>
        <code className="text-xs text-green-400">
          {"{ valid: true, plan: 'pro' }"}
        </code>
      </div>
    </div>
  );
}

function StatusPreview() {
  return (
    <div className="mt-4 space-y-2">
      {[
        { name: "API Gateway", status: "operational" },
        { name: "Database", status: "operational" },
        { name: "CDN", status: "operational" },
      ].map((service) => (
        <div
          key={service.name}
          className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg"
        >
          <span className="text-sm text-slate-300">{service.name}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-400">Çalışıyor</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CloudPreview() {
  return (
    <div className="mt-4 space-y-2">
      {[
        { name: "Web Server", cpu: "12%", ram: "2.4GB" },
        { name: "Game Server", cpu: "45%", ram: "8.2GB" },
      ].map((server) => (
        <div
          key={server.name}
          className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg"
        >
          <Server className="w-4 h-4 text-cyan-400" />
          <div className="flex-1">
            <p className="text-sm text-slate-300">{server.name}</p>
            <div className="flex gap-3 text-xs text-slate-500">
              <span>CPU: {server.cpu}</span>
              <span>RAM: {server.ram}</span>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      ))}
    </div>
  );
}

function ToolsPreview() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {[
        { icon: "{ }", name: "JSON" },
        { icon: "64", name: "Base64" },
        { icon: "#", name: "Hash" },
        { icon: "ID", name: "UUID" },
      ].map((tool) => (
        <motion.div
          key={tool.name}
          whileHover={{ scale: 1.05 }}
          className="p-2 bg-slate-800/50 rounded-lg text-center cursor-pointer"
        >
          <span className="text-lg font-mono text-amber-400">{tool.icon}</span>
          <p className="text-xs text-slate-400 mt-1">{tool.name}</p>
        </motion.div>
      ))}
    </div>
  );
}

function GamingPreview() {
  return (
    <div className="mt-4 space-y-3">
      {/* Game Server Status */}
      <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-emerald-100">Minecraft Sunucusu</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            <span className="text-xs text-emerald-200">Online</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-2xl font-bold text-white">45</p>
          <span className="text-sm text-emerald-200">/ 100 Oyuncu</span>
        </div>
        <div className="w-full bg-emerald-800/50 rounded-full h-1.5">
          <div className="bg-emerald-300 h-1.5 rounded-full" style={{ width: "45%" }} />
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-slate-800/50 rounded-lg text-center">
          <p className="text-lg font-bold text-white">20ms</p>
          <p className="text-xs text-slate-400">Ping</p>
        </div>
        <div className="p-2 bg-slate-800/50 rounded-lg text-center">
          <p className="text-lg font-bold text-white">99.9%</p>
          <p className="text-xs text-slate-400">Uptime</p>
        </div>
      </div>
    </div>
  );
}

const mainFeatures = [
  {
    icon: Shield,
    title: "Hyble ID",
    description: "Merkezi kimlik doğrulama sistemi. OAuth 2.0, MFA, SSO ve sosyal giriş desteği ile kullanıcılarınızı güvenle yönetin.",
    color: "from-blue-500 to-cyan-500",
    size: "large",
    href: "/products/id",
    preview: <HybleIDPreview />,
  },
  {
    icon: CreditCard,
    title: "Hyble Wallet",
    description: "Global ödeme altyapısı. Cüzdan, Stripe entegrasyonu, çoklu para birimi ve otomatik faturalama.",
    color: "from-green-500 to-emerald-500",
    size: "medium",
    href: "/products/wallet",
    preview: <WalletPreview />,
  },
  {
    icon: Key,
    title: "Hyble License",
    description: "Yazılım lisanslama API'si. Lisans oluşturma, doğrulama ve yönetim tek endpoint'te.",
    color: "from-orange-500 to-red-500",
    size: "medium",
    href: "/products/license",
    preview: <LicensePreview />,
  },
  {
    icon: Activity,
    title: "Hyble Status",
    description: "Gerçek zamanlı servis izleme. Durum sayfaları ve anlık bildirimler.",
    color: "from-purple-500 to-pink-500",
    size: "small",
    href: "/products/status",
    preview: <StatusPreview />,
  },
  {
    icon: Cloud,
    title: "Hyble Cloud",
    description: "Sunucu yönetimi tek panelden. VPS, game server, web hosting.",
    color: "from-cyan-500 to-blue-500",
    size: "small",
    href: "/products/cloud",
    badge: "Yakında",
    preview: <CloudPreview />,
  },
  {
    icon: Wrench,
    title: "Hyble Tools",
    description: "Ücretsiz geliştirici araçları. JSON, Base64, UUID ve daha fazlası.",
    color: "from-amber-500 to-orange-500",
    size: "small",
    href: "/tools",
    preview: <ToolsPreview />,
  },
  {
    icon: Gamepad2,
    title: "Hyble Gaming",
    description: "Oyun sunucuları için özel çözümler. Minecraft, FiveM, Rust ve daha fazlası. Düşük ping, yüksek performans.",
    color: "from-emerald-500 to-green-600",
    size: "medium",
    href: "/products/gaming",
    badge: "Popüler",
    preview: <GamingPreview />,
  },
];

const additionalFeatures = [
  { icon: Users, text: "Takım Yönetimi" },
  { icon: BarChart3, text: "Detaylı Analitik" },
  { icon: Zap, text: "Webhook Desteği" },
  { icon: Globe, text: "Çoklu Dil" },
  { icon: Code2, text: "REST API" },
  { icon: Lock, text: "RBAC" },
  { icon: Shield, text: "DDoS Koruması" },
  { icon: Server, text: "Yedekleme" },
];

export function FeatureBento() {
  return (
    <section id="products" className="relative py-16 lg:py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6"
          >
            <Zap className="w-4 h-4" />
            <span>Güçlü Araçlar</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            İhtiyacınız Olan Her Şey, Tek Platformda
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Modern işletmeler ve geliştiriciler için tasarlanmış eksiksiz araç seti.
            Entegre çözümlerle zamandan tasarruf edin.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-700 ${
                feature.size === "large"
                  ? "md:col-span-2 lg:col-span-2"
                  : feature.size === "medium"
                    ? "lg:row-span-1"
                    : ""
              }`}
            >
              {/* Gradient glow on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              />

              <div className="relative z-10 p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  {"badge" in feature && feature.badge && (
                    <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                      {feature.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Live Preview */}
                {feature.preview}

                {/* CTA Link */}
                <Link
                  href={feature.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:gap-3 transition-all"
                >
                  <span>Daha fazla bilgi</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Features - Scrolling Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            Tüm Özellikler
          </p>
          <div className="relative overflow-hidden">
            {/* Gradient masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

            {/* Scrolling content */}
            <div className="flex animate-scroll-features">
              {[...additionalFeatures, ...additionalFeatures, ...additionalFeatures].map((feature, index) => (
                <div
                  key={`${feature.text}-${index}`}
                  className="flex-shrink-0 mx-2 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <feature.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium whitespace-nowrap">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CSS for scroll animation */}
        <style jsx>{`
          @keyframes scroll-features {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
          .animate-scroll-features {
            animation: scroll-features 20s linear infinite;
          }
          .animate-scroll-features:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </section>
  );
}
