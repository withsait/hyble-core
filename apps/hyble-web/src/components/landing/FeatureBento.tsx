"use client";

import { motion } from "framer-motion";
import { Shield, Wrench, Key, Activity } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Hyble ID",
    description: "Tüm platformlarda birleşik kimlik doğrulama. OAuth 2.0, MFA ve sorunsuz SSO.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Wrench,
    title: "Hyble Tools",
    description: "Geliştirici araçları ile saatler kazanın. JSON formatlayıcı, Base64 ve daha fazlası.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Key,
    title: "Hyble License",
    description: "Yazılım lisanslaması artık çok kolay. Güçlü API ile lisans oluşturun ve yönetin.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Activity,
    title: "Hyble Status",
    description: "Servisleriniz için gerçek zamanlı izleme. Durum sayfaları ve anlık olay uyarıları.",
    color: "from-green-500 to-emerald-500",
  },
];

export function FeatureBento() {
  return (
    <section id="features" className="relative py-32 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            İhtiyacınız Olan Her Şey
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Modern geliştiriciler ve ekipler için tasarlanmış eksiksiz bir araç seti.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
