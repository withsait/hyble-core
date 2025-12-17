"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    description: "Bireysel geliştiriciler ve küçük projeler için ideal başlangıç.",
    price: "0",
    period: "sonsuza kadar",
    highlight: false,
    badge: null,
    features: [
      { text: "1.000 API çağrısı/ay", included: true },
      { text: "100 kullanıcı", included: true },
      { text: "Temel analitik", included: true },
      { text: "Email desteği", included: true },
      { text: "SSL sertifikası", included: true },
      { text: "Özel domain", included: false },
      { text: "Öncelikli destek", included: false },
      { text: "SLA garantisi", included: false },
    ],
    cta: "Ücretsiz Başla",
    ctaVariant: "outline",
  },
  {
    name: "Pro",
    description: "Büyüyen işletmeler ve profesyonel ekipler için güçlü özellikler.",
    price: "49",
    period: "/ay",
    highlight: true,
    badge: "En Popüler",
    features: [
      { text: "100.000 API çağrısı/ay", included: true },
      { text: "Sınırsız kullanıcı", included: true },
      { text: "Gelişmiş analitik", included: true },
      { text: "Öncelikli email desteği", included: true },
      { text: "SSL sertifikası", included: true },
      { text: "Özel domain", included: true },
      { text: "Webhook entegrasyonları", included: true },
      { text: "99.9% SLA garantisi", included: true },
    ],
    cta: "Pro'ya Geç",
    ctaVariant: "primary",
  },
  {
    name: "Business",
    description: "Kurumsal gereksinimler için özelleştirilmiş çözümler ve destek.",
    price: "199",
    period: "/ay",
    highlight: false,
    badge: "Kurumsal",
    features: [
      { text: "Sınırsız API çağrısı", included: true },
      { text: "Sınırsız kullanıcı", included: true },
      { text: "Özel analitik dashboard", included: true },
      { text: "7/24 telefon desteği", included: true },
      { text: "Wildcard SSL", included: true },
      { text: "Çoklu özel domain", included: true },
      { text: "Özel entegrasyonlar", included: true },
      { text: "99.99% SLA garantisi", included: true },
    ],
    cta: "İletişime Geç",
    ctaVariant: "outline",
  },
];

const faqs = [
  {
    q: "Planımı istediğim zaman değiştirebilir miyim?",
    a: "Evet, dilediğiniz zaman plan yükseltme veya düşürme yapabilirsiniz. Değişiklikler anında uygulanır.",
  },
  {
    q: "Ücretsiz deneme süresi var mı?",
    a: "Pro ve Business planları için 14 gün ücretsiz deneme sunuyoruz. Kredi kartı gerekmez.",
  },
  {
    q: "Fatura kesiliyor mu?",
    a: "Evet, tüm ödemeleriniz için yasal fatura düzenliyoruz. İngiltere merkezli şirketimiz üzerinden.",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 bg-blue-400 dark:bg-blue-600" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 bg-purple-400 dark:bg-purple-600" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
            <Zap className="w-4 h-4" />
            <span>Şeffaf Fiyatlandırma</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            İhtiyacınıza Uygun Plan Seçin
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Gizli maliyet yok. İstediğiniz zaman iptal edin.
            Tüm planlar temel özellikleri içerir.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlight
                  ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/25 scale-105 z-10"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold ${
                    plan.highlight
                      ? "bg-amber-400 text-amber-900"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {plan.badge === "En Popüler" && <Sparkles className="w-3 h-3 inline mr-1" />}
                  {plan.badge}
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    plan.highlight ? "text-white" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.highlight ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-sm ${
                      plan.highlight ? "text-blue-200" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    €
                  </span>
                  <span
                    className={`text-5xl font-bold tracking-tight ${
                      plan.highlight ? "text-white" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.highlight ? "text-blue-200" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="https://id.hyble.co/register"
                className={`block w-full py-3 px-4 rounded-xl font-semibold text-center transition-all mb-8 ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                    : plan.ctaVariant === "primary"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {plan.cta}
              </a>

              {/* Features List */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check
                        className={`w-5 h-5 flex-shrink-0 ${
                          plan.highlight ? "text-blue-200" : "text-green-500"
                        }`}
                      />
                    ) : (
                      <X
                        className={`w-5 h-5 flex-shrink-0 ${
                          plan.highlight ? "text-blue-300/50" : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? plan.highlight
                            ? "text-white"
                            : "text-slate-700 dark:text-slate-300"
                          : plan.highlight
                            ? "text-blue-300/50"
                            : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-8 md:p-12 mb-16"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Daha Büyük İhtiyaçlar İçin
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Özel gereksinimleriniz mi var? Enterprise planımız ile size özel çözümler sunalım.
              </p>
            </div>
            <Link
              href="/contact"
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Satış ile Görüşün
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Sıkça Sorulan Sorular
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
              >
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Full pricing page link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Tüm özellikleri karşılaştır
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
