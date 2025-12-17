"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  CreditCard,
  Gift,
  Star,
  ChevronDown,
  Users,
  Building2,
  Rocket,
} from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: Rocket,
    description: "Bireysel geliştiriciler ve küçük projeler için ideal başlangıç noktası.",
    price: "0",
    period: "sonsuza kadar ücretsiz",
    highlight: false,
    badge: null,
    color: "from-slate-500 to-slate-600",
    features: [
      "1.000 API çağrısı/ay",
      "100 kullanıcı limiti",
      "Temel analitik dashboard",
      "Email desteği (48 saat)",
      "SSL sertifikası dahil",
      "Topluluk forum erişimi",
    ],
    cta: "Ücretsiz Başla",
    ctaLink: "https://id.hyble.co/register",
  },
  {
    id: "pro",
    name: "Pro",
    icon: Star,
    description: "Büyüyen işletmeler için güçlü özellikler ve öncelikli destek.",
    price: "49",
    originalPrice: "79",
    period: "/ay",
    highlight: true,
    badge: "En Popüler",
    color: "from-blue-500 to-cyan-500",
    features: [
      "100.000 API çağrısı/ay",
      "Sınırsız kullanıcı",
      "Gelişmiş analitik & raporlar",
      "Öncelikli destek (4 saat)",
      "Özel domain bağlama",
      "Webhook entegrasyonları",
      "API rate limit artışı",
      "99.9% SLA garantisi",
    ],
    cta: "7 Gün Ücretsiz Dene",
    ctaLink: "https://id.hyble.co/register?plan=pro",
    savings: "Yıllık ödemede €240 tasarruf",
  },
  {
    id: "business",
    name: "Business",
    icon: Building2,
    description: "Kurumsal gereksinimler için özelleştirilmiş çözümler.",
    price: "199",
    period: "/ay",
    highlight: false,
    badge: "Kurumsal",
    color: "from-purple-500 to-pink-500",
    features: [
      "Sınırsız API çağrısı",
      "Sınırsız kullanıcı & takım",
      "Özel analitik dashboard",
      "7/24 telefon desteği",
      "Wildcard SSL sertifikası",
      "Çoklu domain desteği",
      "Özel entegrasyonlar",
      "99.99% SLA garantisi",
      "Dedicated account manager",
    ],
    cta: "Demo Talep Et",
    ctaLink: "/contact",
  },
];

const guarantees = [
  { icon: Clock, text: "7 Gün Ücretsiz Deneme" },
  { icon: CreditCard, text: "Kredi Kartı Gerekmez" },
  { icon: Shield, text: "Para İade Garantisi" },
  { icon: Gift, text: "İlk Ay %50 İndirim" },
];

const comparisonFeatures = [
  { name: "API Çağrısı", starter: "1K/ay", pro: "100K/ay", business: "Sınırsız" },
  { name: "Kullanıcı Limiti", starter: "100", pro: "Sınırsız", business: "Sınırsız" },
  { name: "Özel Domain", starter: false, pro: true, business: true },
  { name: "Webhook Desteği", starter: false, pro: true, business: true },
  { name: "SLA Garantisi", starter: false, pro: "99.9%", business: "99.99%" },
  { name: "Öncelikli Destek", starter: false, pro: true, business: true },
  { name: "Özel Entegrasyon", starter: false, pro: false, business: true },
  { name: "Account Manager", starter: false, pro: false, business: true },
];

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [showComparison, setShowComparison] = useState(false);

  const getPrice = (basePrice: string) => {
    if (basePrice === "0") return "0";
    const price = parseInt(basePrice);
    if (billingPeriod === "yearly") {
      return Math.round(price * 0.8).toString(); // 20% discount for yearly
    }
    return basePrice;
  };

  return (
    <section id="pricing" className="relative py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 bg-gradient-to-r from-blue-400 to-cyan-400 dark:opacity-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 bg-gradient-to-r from-purple-400 to-pink-400 dark:opacity-10" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.015] dark:opacity-[0.02]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Şeffaf Fiyatlandırma</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            İşinizi Büyütecek Plan Seçin
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Gizli maliyet yok. İstediğiniz zaman iptal edin.
            <span className="text-blue-600 dark:text-blue-400 font-medium"> 7 gün ücretsiz deneyin.</span>
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === "yearly"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Yıllık
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs rounded-full font-semibold">
                %20 İndirim
              </span>
            </button>
          </div>
        </motion.div>

        {/* Trust Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12"
        >
          {guarantees.map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <item.icon className="w-4 h-4 text-green-500" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-3xl p-1 ${
                plan.highlight
                  ? "bg-gradient-to-b from-blue-500 via-cyan-500 to-blue-600"
                  : "bg-transparent"
              }`}
            >
              <div
                className={`relative h-full rounded-[22px] p-6 lg:p-8 ${
                  plan.highlight
                    ? "bg-white dark:bg-slate-900"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg ${
                      plan.highlight
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    }`}
                  >
                    {plan.badge === "En Popüler" && <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />}
                    {plan.badge}
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    {plan.originalPrice && billingPeriod === "monthly" && (
                      <span className="text-lg text-slate-400 line-through">€{plan.originalPrice}</span>
                    )}
                    <span className="text-sm text-slate-500 dark:text-slate-400">€</span>
                    <span className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {getPrice(plan.price)}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {plan.period}
                    </span>
                  </div>
                  {plan.savings && billingPeriod === "yearly" && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                      {plan.savings}
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <motion.a
                  href={plan.ctaLink}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`block w-full py-3.5 px-4 rounded-xl font-semibold text-center transition-all mb-8 ${
                    plan.highlight
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </motion.a>

                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <span>Tüm Özellikleri Karşılaştır</span>
            <motion.div
              animate={{ rotate: showComparison ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </button>
        </motion.div>

        {/* Feature Comparison Table */}
        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-16"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Özellik</th>
                        <th className="text-center p-4 font-semibold text-slate-900 dark:text-white">Starter</th>
                        <th className="text-center p-4 font-semibold text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-900/20">Pro</th>
                        <th className="text-center p-4 font-semibold text-slate-900 dark:text-white">Business</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((feature, index) => (
                        <tr
                          key={feature.name}
                          className={index !== comparisonFeatures.length - 1 ? "border-b border-slate-100 dark:border-slate-700/50" : ""}
                        >
                          <td className="p-4 text-slate-600 dark:text-slate-300">{feature.name}</td>
                          <td className="p-4 text-center">
                            {typeof feature.starter === "boolean" ? (
                              feature.starter ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600">—</span>
                              )
                            ) : (
                              <span className="text-slate-600 dark:text-slate-300">{feature.starter}</span>
                            )}
                          </td>
                          <td className="p-4 text-center bg-blue-50/50 dark:bg-blue-900/10">
                            {typeof feature.pro === "boolean" ? (
                              feature.pro ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600">—</span>
                              )
                            ) : (
                              <span className="text-slate-600 dark:text-slate-300 font-medium">{feature.pro}</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof feature.business === "boolean" ? (
                              feature.business ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600">—</span>
                              )
                            ) : (
                              <span className="text-slate-600 dark:text-slate-300">{feature.business}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Order CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />

          <div className="relative p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left - Text Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Özel Sipariş</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Size Özel Çözüm mü Gerekiyor?
                </h3>
                <p className="text-slate-300 mb-6">
                  Standart paketlerimiz ihtiyaçlarınızı karşılamıyorsa, size özel bir çözüm oluşturalım.
                  Özel konfigürasyonlar, dedicated kaynaklar ve kurumsal SLA ile projenize uygun paket hazırlayalım.
                </p>
                <ul className="space-y-2 text-left">
                  {[
                    "Özel sunucu konfigürasyonları",
                    "Dedicated kaynaklar ve izole ortam",
                    "Kurumsal SLA ve öncelikli destek",
                    "Özel entegrasyonlar ve API limitleri",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right - Quick Contact Form */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Bize Ulaşın</h4>
                <form className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Adınız Soyadınız"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="E-posta Adresiniz"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="İhtiyaçlarınızı kısaca açıklayın..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                  <Link
                    href="/contact"
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
                  >
                    Teklif Alın
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </form>
                <p className="text-xs text-slate-400 text-center mt-4">
                  24 saat içinde size geri dönüş yapacağız.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              30 gün içinde memnun kalmazsanız, paranızı iade ediyoruz. Soru sormadan.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
