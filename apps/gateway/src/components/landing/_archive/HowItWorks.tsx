"use client";

import { motion } from "framer-motion";
import { UserPlus, Package, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Hesap Oluştur",
    description: "E-posta adresinizle ücretsiz kayıt olun. 30 saniyede tamamlayın.",
  },
  {
    icon: Package,
    number: "2",
    title: "Ürünleri Seç",
    description: "İhtiyacınız olan araçları aktifleştirin. Sadece kullandığınız kadar ödeyin.",
  },
  {
    icon: Rocket,
    number: "3",
    title: "Başla",
    description: "API anahtarlarınızı alın ve dakikalar içinde entegre edin.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            3 Adımda Başlayın
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Karmaşık kurulumlarla uğraşmayın. Hemen başlayın.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-center relative z-10">
                  {/* Step Number */}
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-7 h-7 text-slate-600 dark:text-slate-300" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <a
            href="https://id.hyble.co/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Hemen Başla
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
