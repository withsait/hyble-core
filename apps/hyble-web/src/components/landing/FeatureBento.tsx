"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";

const mainFeatures = [
  {
    icon: Shield,
    title: "Hyble ID",
    description: "Tüm platformlarda birleşik kimlik doğrulama. OAuth 2.0, MFA ve sorunsuz SSO ile kullanıcılarınızı güvenle yönetin.",
    color: "from-blue-500 to-cyan-500",
    size: "large",
    preview: (
      <div className="mt-4 p-4 bg-slate-900/50 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
            U
          </div>
          <div>
            <p className="text-sm font-medium text-white">user@example.com</p>
            <p className="text-xs text-slate-400">Doğrulandı</p>
          </div>
          <Lock className="w-4 h-4 text-green-400 ml-auto" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-slate-800 rounded-lg text-slate-300">OAuth 2.0</div>
          <div className="p-2 bg-slate-800 rounded-lg text-slate-300">2FA Aktif</div>
        </div>
      </div>
    ),
  },
  {
    icon: CreditCard,
    title: "Hyble Wallet",
    description: "Entegre ödeme sistemi. Cüzdan bakiyesi, Stripe entegrasyonu ve otomatik faturalama.",
    color: "from-green-500 to-emerald-500",
    size: "medium",
    preview: (
      <div className="mt-4 flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
        <div>
          <p className="text-xs text-slate-400">Bakiye</p>
          <p className="text-xl font-bold text-white">€1,234.56</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-green-400" />
        </div>
      </div>
    ),
  },
  {
    icon: Key,
    title: "Hyble License",
    description: "Yazılım lisanslaması artık çok kolay. API ile lisans oluşturun, doğrulayın ve yönetin.",
    color: "from-orange-500 to-red-500",
    size: "medium",
    preview: (
      <div className="mt-4 p-3 bg-slate-900/50 rounded-xl font-mono text-xs">
        <p className="text-slate-400 mb-1"># Lisans Doğrulama</p>
        <p className="text-green-400">✓ XXXX-XXXX-XXXX-XXXX</p>
        <p className="text-slate-500 mt-1">Geçerli: Pro Plan</p>
      </div>
    ),
  },
  {
    icon: Activity,
    title: "Hyble Status",
    description: "Servisleriniz için gerçek zamanlı izleme. Durum sayfaları ve anlık olay uyarıları.",
    color: "from-purple-500 to-pink-500",
    size: "small",
  },
  {
    icon: Cloud,
    title: "Hyble Cloud",
    description: "Sunucularınızı tek panelden yönetin. Hetzner entegrasyonu ile güçlü altyapı.",
    color: "from-cyan-500 to-blue-500",
    size: "small",
  },
  {
    icon: Wrench,
    title: "Developer Tools",
    description: "JSON formatlayıcı, Base64 encoder, UUID generator ve daha fazlası.",
    color: "from-amber-500 to-orange-500",
    size: "small",
  },
];

const additionalFeatures = [
  { icon: Users, text: "Takım Yönetimi" },
  { icon: BarChart3, text: "Detaylı Analitik" },
  { icon: Zap, text: "Webhook Desteği" },
  { icon: Globe, text: "Çoklu Dil" },
  { icon: Code2, text: "REST & GraphQL API" },
  { icon: Lock, text: "Rol Tabanlı Erişim" },
];

export function FeatureBento() {
  return (
    <section id="features" className="relative py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            İhtiyacınız Olan Her Şey
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Modern geliştiriciler ve ekipler için tasarlanmış eksiksiz bir araç seti.
            Tek platform, sınırsız olanak.
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
              className={`group relative p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-xl hover:border-transparent ${
                feature.size === "large"
                  ? "md:col-span-2 lg:col-span-2 lg:row-span-2"
                  : feature.size === "medium"
                    ? "lg:col-span-1 lg:row-span-2"
                    : ""
              }`}
            >
              {/* Gradient glow on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              />

              {/* Spotlight effect */}
              <div className="absolute -inset-px bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Preview (if exists) */}
                {feature.preview && (
                  <div className="mt-4">{feature.preview}</div>
                )}

                {/* Learn more link */}
                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                  <span>Daha fazla</span>
                  <svg
                    className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            Ve Daha Fazlası
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <feature.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
