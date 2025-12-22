"use client";

import { motion } from "framer-motion";
import { Star, Shield, Building2, Clock, Headphones } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Ahmet Y.",
    role: "E-ticaret Sahibi",
    content: "Hyble ile web sitemi 1 günde kurdum. Hosting dahil olması büyük avantaj.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mehmet K.",
    role: "Minecraft Sunucu Sahibi",
    content: "Oyun sunucum hiç downtime yaşamadı. Destek ekibi çok hızlı.",
    rating: 5,
  },
  {
    id: 3,
    name: "Zeynep A.",
    role: "Freelance Developer",
    content: "Hyble ID API'si ile müşterilerime SSO sunuyorum. Entegrasyon çok kolay.",
    rating: 5,
  },
];

const trustBadges = [
  { icon: Building2, label: "UK Registered", sublabel: "#15872841" },
  { icon: Shield, label: "GDPR Compliant", sublabel: "EU Data Protection" },
  { icon: Clock, label: "99.9% Uptime", sublabel: "SLA Guaranteed" },
  { icon: Headphones, label: "24/7 Support", sublabel: "Discord & Email" },
];

export function SocialProof() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-8 mb-16"
        >
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <badge.icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {badge.label}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {badge.sublabel}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Müşterilerimiz Ne Diyor?
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Binlerce kullanıcı Hyble ile projelerini hayata geçiriyor
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
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
