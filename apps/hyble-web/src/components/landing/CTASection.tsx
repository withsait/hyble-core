"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Gift, Zap, Shield, Clock, Rocket, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

// Scroll depth based CTA messages
const ctaVariants = {
  early: {
    badge: "Hemen Keşfet",
    title: "Dijital Geleceğinizi",
    highlight: "Şekillendirin",
    description: "Hyble ile projelerinizi hayata geçirin. Tüm araçlar tek platformda.",
    cta: "Ürünleri Keşfet",
    ctaLink: "#products",
    stats: [
      { value: "5dk", label: "Kurulum" },
      { value: "99.9%", label: "Uptime" },
      { value: "7/24", label: "Destek" },
    ],
  },
  middle: {
    badge: "Popüler Seçim",
    title: "Pro Plan ile",
    highlight: "Farkı Hissedin",
    description: "100.000+ API çağrısı, sınırsız kullanıcı ve öncelikli destek ile işinizi büyütün.",
    cta: "7 Gün Ücretsiz Dene",
    ctaLink: "https://id.hyble.co/register?plan=pro",
    stats: [
      { value: "€49", label: "/ay" },
      { value: "100K", label: "API/ay" },
      { value: "4 saat", label: "Destek SLA" },
    ],
  },
  late: {
    badge: "Son Adım",
    title: "Harekete Geçme",
    highlight: "Zamanı",
    description: "Şimdi başlayın, ilk 7 gün tamamen ücretsiz. Risk yok, bağlayıcılık yok.",
    cta: "Ücretsiz Hesap Oluştur",
    ctaLink: "https://id.hyble.co/register",
    stats: [
      { value: "7 gün", label: "Ücretsiz" },
      { value: "0€", label: "Başlangıç" },
      { value: "14 gün", label: "İade" },
    ],
  },
};

const benefits = [
  { icon: Gift, text: "7 gün ücretsiz deneme" },
  { icon: Shield, text: "14 gün para iade garantisi" },
  { icon: Clock, text: "5 dakikada kurulum" },
  { icon: Zap, text: "Anında aktivasyon" },
];

const techPartners = ["Stripe", "Hetzner", "Cloudflare", "PostgreSQL", "Redis"];

export function CTASection() {
  const [scrollDepth, setScrollDepth] = useState<"early" | "middle" | "late">("early");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercent < 40) {
        setScrollDepth("early");
      } else if (scrollPercent < 70) {
        setScrollDepth("middle");
      } else {
        setScrollDepth("late");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentCTA = ctaVariants[scrollDepth];

  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.02]" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 bg-blue-400 dark:bg-blue-600" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 bg-cyan-400 dark:bg-cyan-600" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-20 dark:opacity-30" />

          <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 lg:p-16 shadow-xl">
            {/* Content */}
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                key={scrollDepth}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>{currentCTA.badge}</span>
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                  {currentCTA.title}{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    {currentCTA.highlight}
                  </span>
                </h2>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
                  {currentCTA.description}
                </p>

                {/* Stats Row */}
                <div className="flex justify-center gap-8 md:gap-12 mb-10">
                  {currentCTA.stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                  <motion.a
                    href={currentCTA.ctaLink}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                  >
                    {currentCTA.cta}
                    <ArrowRight className="w-5 h-5" />
                  </motion.a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Satış ile Görüşün
                  </Link>
                </div>

                {/* Benefits */}
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
                  {benefits.map((benefit) => (
                    <div key={benefit.text} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tech Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">
            Güçlü Teknolojilerle Çalışıyoruz
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {techPartners.map((partner) => (
              <span
                key={partner}
                className="text-slate-400 dark:text-slate-500 font-semibold text-lg hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {partner}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Urgency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 md:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff0_0%,#fff1_50%,#fff0_100%)] animate-shimmer" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">Yeni Yıl Kampanyası</p>
                  <p className="text-sm text-white/80">Yıllık planlarda %20 indirim - Sınırlı süre</p>
                </div>
              </div>
              <a
                href="https://id.hyble.co/register?promo=newyear"
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                Hemen Başla
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </section>
  );
}
