"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Building2,
  Clock,
  Headphones,
  Server,
  Star,
  Users,
  Zap,
} from "lucide-react";

const trustBadges = [
  {
    icon: Building2,
    label: "UK Registered",
    sublabel: "Companies House #15872841",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    label: "GDPR Compliant",
    sublabel: "EU Data Protection",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Clock,
    label: "99.9% Uptime",
    sublabel: "SLA Guaranteed",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Headphones,
    label: "7/24 Destek",
    sublabel: "Turkce & Ingilizce",
    gradient: "from-teal-500 to-emerald-500",
  },
];

const stats = [
  {
    icon: Users,
    value: "5,000+",
    label: "Aktif Kullanici",
    color: "text-amber-500 dark:text-amber-400",
  },
  {
    icon: Server,
    value: "500+",
    label: "Aktif Sunucu",
    color: "text-emerald-500 dark:text-emerald-400",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Musteri Puani",
    color: "text-orange-500 dark:text-orange-400",
  },
  {
    icon: Zap,
    value: "<50ms",
    label: "API Yanit Suresi",
    color: "text-teal-500 dark:text-teal-400",
  },
];

const testimonials = [
  {
    id: 1,
    name: "Ahmet Y.",
    role: "E-ticaret Sahibi",
    content:
      "Hyble Digital ile web sitemi 1 gunde kurdum. Hosting dahil olmasi buyuk avantaj.",
    rating: 5,
    vertical: "digital",
  },
  {
    id: 2,
    name: "Mehmet K.",
    role: "Minecraft Sunucu Sahibi",
    content:
      "Hyble Studios ile oyun sunucum hic downtime yasamadi. Destek ekibi cok hizli.",
    rating: 5,
    vertical: "studios",
  },
  {
    id: 3,
    name: "Zeynep A.",
    role: "Freelance Developer",
    content:
      "Hyble ID API'si ile musterilerime SSO sunuyorum. Entegrasyon cok kolay.",
    rating: 5,
    vertical: "ecosystem",
  },
];

export function TrustSection() {
  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-slate-50 dark:bg-[#08080f]">
      <div className="absolute inset-0 grid-pattern" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12"
        >
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-3 p-4 bg-white/80 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5 backdrop-blur-sm"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${badge.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}
              >
                <badge.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  {badge.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {badge.sublabel}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              className="text-center p-5 bg-white/80 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5 backdrop-blur-sm"
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Musterilerimiz Ne Diyor?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Her iki dikeyde binlerce mutlu kullanici
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-white/80 dark:bg-white/[0.02] rounded-xl p-5 border border-slate-200 dark:border-white/5 backdrop-blur-sm"
            >
              {/* Vertical Badge */}
              <div
                className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
                  testimonial.vertical === "digital"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                    : testimonial.vertical === "studios"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                }`}
              >
                {testimonial.vertical === "digital"
                  ? "Digital"
                  : testimonial.vertical === "studios"
                  ? "Studios"
                  : "Ecosystem"}
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                    testimonial.vertical === "digital"
                      ? "bg-gradient-to-br from-amber-500 to-orange-500"
                      : testimonial.vertical === "studios"
                      ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                      : "bg-gradient-to-br from-orange-500 to-amber-500"
                  }`}
                >
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm text-slate-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
