"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Gift, Zap, Shield, Clock, Star, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

const benefits = [
  { icon: Gift, text: "7 gun ucretsiz deneme" },
  { icon: Shield, text: "30 gun para iade garantisi" },
  { icon: Clock, text: "5 dakikada kurulum" },
  { icon: Zap, text: "Aninda aktivasyon" },
];

const testimonials = [
  {
    quote: "Hyble ile projemizi 2 hafta erken teslim ettik. Harika bir deneyim!",
    author: "Mehmet K.",
    role: "CTO, TechStartup",
    avatar: "M",
  },
  {
    quote: "API entegrasyonu inanilmaz kolay. Dokumantasyon cok detayli.",
    author: "Ayse Y.",
    role: "Senior Developer",
    avatar: "A",
  },
  {
    quote: "Musteri destegi gercekten 7/24. Gece 3'te bile cevap aldim.",
    author: "Can B.",
    role: "Founder, GameStudio",
    avatar: "C",
  },
];

export function CTASection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative py-16 lg:py-20 bg-slate-900 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Gradient mesh - midnight black */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-900 to-slate-800/30" />

        {/* Animated gradient orbs - subtle in dark mode */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl bg-white/[0.03]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl bg-white/[0.02]"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.02]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Content */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left Column - Static Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-semibold mb-5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Hemen Baslayin</span>
            </motion.div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Projenizi{" "}
              <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                Bugun Baslatin
              </span>
            </h2>

            <p className="text-base lg:text-lg text-slate-400 mb-6 leading-relaxed">
              7 gun ucretsiz deneyin, risk yok. Dakikalar icinde kurulum yapin ve hemen kullanmaya baslayin.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6 lg:gap-8 mb-8">
              {[
                { value: "5dk", label: "Kurulum" },
                { value: "99.9%", label: "Uptime" },
                { value: "7/24", label: "Destek" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.a
                href="https://id.hyble.co/register"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 transition-all"
              >
                Ucretsiz Hesap Olustur
                <ArrowRight className="w-4 h-4" />
              </motion.a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 text-white border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Sorulariniz mi Var?
              </Link>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {benefits.map((benefit) => (
                <div key={benefit.text} className="flex items-center gap-2 text-sm text-slate-400">
                  <benefit.icon className="w-4 h-4 text-sky-400 flex-shrink-0" />
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
            <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/5 p-6 md:p-8">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Testimonial */}
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-lg md:text-xl text-white font-medium mb-6 leading-relaxed">
                  &quot;{testimonials[currentTestimonial]?.quote}&quot;
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {testimonials[currentTestimonial]?.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{testimonials[currentTestimonial]?.author}</p>
                    <p className="text-xs text-slate-400">{testimonials[currentTestimonial]?.role}</p>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial dots */}
              <div className="flex gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentTestimonial
                        ? "bg-sky-400 w-4"
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg"
              >
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                Dogrulanmis
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 -bottom-6 -left-6 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl" />
            <div className="absolute -z-10 -top-6 -right-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
