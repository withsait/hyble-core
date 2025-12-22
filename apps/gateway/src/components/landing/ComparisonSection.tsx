"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Gamepad2,
  ArrowRight,
  Check,
  Globe,
  ShoppingCart,
  Sparkles,
  Server,
  Puzzle,
  Package,
  Users,
  Building2,
  Rocket,
} from "lucide-react";

const comparisons = [
  {
    id: "digital",
    icon: Briefcase,
    title: "Hyble Digital",
    subtitle: "Web & E-ticaret",
    description: "Isletmenizi dijitale tasiyin",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10",
    borderColor: "border-amber-200 dark:border-amber-500/20",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500/40",
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    href: "https://digital.hyble.co",
    idealFor: [
      { icon: Building2, text: "Isletme sahipleri" },
      { icon: Users, text: "Freelancerlar" },
      { icon: Rocket, text: "Startup'lar" },
    ],
    features: [
      "Kurumsal web siteleri",
      "E-ticaret magazalari",
      "Portfolyo siteleri",
      "AI destekli araclar",
    ],
    startingPrice: "₺499",
    priceLabel: "'dan baslayan",
    cta: "Digital'i Incele",
  },
  {
    id: "studios",
    icon: Gamepad2,
    title: "Hyble Studios",
    subtitle: "Gaming Altyapisi",
    description: "Oyun deneyimini yukselt",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10",
    borderColor: "border-emerald-200 dark:border-emerald-500/20",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500/40",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    href: "https://studios.hyble.co",
    idealFor: [
      { icon: Server, text: "Sunucu sahipleri" },
      { icon: Users, text: "Gaming topluluklar" },
      { icon: Puzzle, text: "Plugin gelistiriciler" },
    ],
    features: [
      "Minecraft sunuculari",
      "Premium pluginler",
      "Hazir sunucu paketleri",
      "DDoS korumasi",
    ],
    startingPrice: "₺49",
    priceLabel: "/ay baslayan",
    cta: "Studios'u Incele",
  },
];

export function ComparisonSection() {
  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-white dark:bg-slate-900">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-pattern" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Hangisi{" "}
            <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
              Size Uygun?
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Ihtiyaciniza gore dogru cozumu secin
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {comparisons.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative bg-gradient-to-br ${item.bgGradient} rounded-2xl border ${item.borderColor} ${item.hoverBorder} overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
            >
              {/* Top gradient bar */}
              <div className={`h-1 bg-gradient-to-r ${item.gradient}`} />

              <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className={`text-sm font-medium ${item.iconColor}`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Price Badge */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${item.iconColor}`}>
                      {item.startingPrice}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.priceLabel}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {item.description}
                </p>

                {/* Ideal For */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Ideal Kullanici
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {item.idealFor.map((ideal) => (
                      <div
                        key={ideal.text}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${item.iconBg} text-sm`}
                      >
                        <ideal.icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {ideal.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-3">
                    Ozellikler
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {item.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <Check className={`w-4 h-4 ${item.iconColor} flex-shrink-0`} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div
                  className={`flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-white/5`}
                >
                  <span className={`font-semibold ${item.iconColor}`}>
                    {item.cta}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-slate-500 dark:text-slate-500 mt-8"
        >
          Her iki platformda da{" "}
          <span className="text-sky-600 dark:text-sky-400 font-medium">
            tek Hyble ID
          </span>{" "}
          ile giris yapabilirsiniz
        </motion.p>
      </div>
    </section>
  );
}
