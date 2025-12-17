"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Gift, Zap, Shield, Clock, Star, Rocket } from "lucide-react";
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
      { value: "30 gün", label: "İade" },
    ],
  },
};

const benefits = [
  { icon: Gift, text: "7 gün ücretsiz deneme" },
  { icon: Shield, text: "30 gün para iade garantisi" },
  { icon: Clock, text: "5 dakikada kurulum" },
  { icon: Zap, text: "Anında aktivasyon" },
];

const testimonials = [
  {
    quote: "Hyble ile projemizi 2 hafta erken teslim ettik. Harika bir deneyim!",
    author: "Mehmet K.",
    role: "CTO, TechStartup",
    avatar: "M",
  },
  {
    quote: "API entegrasyonu inanılmaz kolay. Dokümantasyon çok detaylı.",
    author: "Ayşe Y.",
    role: "Senior Developer",
    avatar: "A",
  },
  {
    quote: "Müşteri desteği gerçekten 7/24. Gece 3'te bile cevap aldım.",
    author: "Can B.",
    role: "Founder, GameStudio",
    avatar: "C",
  },
];

export function CTASection() {
  const [scrollDepth, setScrollDepth] = useState<"early" | "middle" | "late">("early");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentCTA = ctaVariants[scrollDepth];

  return (
    <section className="relative py-24 bg-slate-900 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-slate-900 to-purple-900/50" />

        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl bg-blue-500/30"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl bg-purple-500/30"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:40px_40px] opacity-5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Dynamic Content */}
          <motion.div
            key={scrollDepth}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>{currentCTA.badge}</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {currentCTA.title}{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {currentCTA.highlight}
              </span>
            </h2>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              {currentCTA.description}
            </p>

            {/* Stats Row */}
            <div className="flex gap-8 mb-10">
              {currentCTA.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a
                href={currentCTA.ctaLink}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
              >
                {currentCTA.cta}
                <ArrowRight className="w-5 h-5" />
              </motion.a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                Satış ile Görüşün
              </Link>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 mt-10">
              {benefits.map((benefit) => (
                <div key={benefit.text} className="flex items-center gap-2 text-sm text-slate-300">
                  <benefit.icon className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            {/* Main Card */}
            <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 md:p-10">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Testimonial */}
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xl md:text-2xl text-white font-medium mb-8 leading-relaxed">
                  &quot;{testimonials[currentTestimonial]?.quote}&quot;
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[currentTestimonial]?.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonials[currentTestimonial]?.author}</p>
                    <p className="text-sm text-slate-400">{testimonials[currentTestimonial]?.role}</p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial dots */}
              <div className="flex gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTestimonial
                        ? "bg-blue-400 w-6"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                Doğrulanmış Müşteri
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 -bottom-8 -left-8 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -z-10 -top-8 -right-8 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
          </motion.div>
        </div>

        {/* Bottom Section - Trust & Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 pt-12 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* User count */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {["A", "B", "C", "D", "E"].map((letter, i) => (
                  <div
                    key={letter}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-900 flex items-center justify-center text-white text-sm font-medium"
                    style={{ zIndex: 5 - i }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-semibold">500+ Aktif Kullanıcı</p>
                <p className="text-sm text-slate-400">Son 30 günde katılan</p>
              </div>
            </div>

            {/* Partners */}
            <div className="flex items-center gap-8">
              <span className="text-sm text-slate-500 uppercase tracking-wider">Güvenilir Altyapı</span>
              <div className="flex items-center gap-6">
                {["Stripe", "Hetzner", "Cloudflare"].map((partner) => (
                  <span
                    key={partner}
                    className="text-slate-500 font-semibold hover:text-slate-300 transition-colors cursor-default"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Urgency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/30 p-6 md:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff0_0%,#fff1_50%,#fff0_100%)] animate-shimmer" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Yılsonu Kampanyası</p>
                  <p className="text-sm text-amber-200/80">Yıllık planlarda ekstra %10 indirim - 31 Aralık'a kadar</p>
                </div>
              </div>
              <a
                href="https://id.hyble.co/register?promo=newyear"
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-semibold transition-colors whitespace-nowrap"
              >
                Kampanyadan Yararlan
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CSS for shimmer animation */}
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
