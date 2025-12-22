"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  UserPlus,
  Palette,
  Settings,
  Rocket,
  Server,
  Puzzle,
  Zap,
  Briefcase,
  Gamepad2,
  ArrowRight,
  Check,
} from "lucide-react";

const digitalSteps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Kayit Ol",
    description: "2 dakikada ucretsiz hesap olustur",
    time: "2 dk",
  },
  {
    step: 2,
    icon: Palette,
    title: "Sablon Sec",
    description: "200+ profesyonel sablondan birini sec",
    time: "5 dk",
  },
  {
    step: 3,
    icon: Settings,
    title: "Ozellestir",
    description: "Icerik ve tasarimi markaniza gore duzenle",
    time: "1-24 saat",
  },
  {
    step: 4,
    icon: Rocket,
    title: "Yayinla",
    description: "Tek tikla web sitenizi yayina alin",
    time: "Aninda",
  },
];

const studiosSteps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Kayit Ol",
    description: "Hyble ID ile hizlica giris yap",
    time: "1 dk",
  },
  {
    step: 2,
    icon: Server,
    title: "Sunucu Sec",
    description: "Ihtiyacina uygun paketi sec",
    time: "2 dk",
  },
  {
    step: 3,
    icon: Puzzle,
    title: "Plugin Ekle",
    description: "Istersen premium pluginler ekle",
    time: "Opsiyonel",
  },
  {
    step: 4,
    icon: Zap,
    title: "Basla",
    description: "Sunucun aninda aktif, oynamaya basla",
    time: "5 dk",
  },
];

const tabs = [
  {
    id: "digital",
    label: "Web Sitesi",
    icon: Briefcase,
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "studios",
    label: "Oyun Sunucusu",
    icon: Gamepad2,
    color: "emerald",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<"digital" | "studios">("digital");

  const steps = activeTab === "digital" ? digitalSteps : studiosSteps;
  const isDigital = activeTab === "digital";
  const accentColor = isDigital ? "amber" : "emerald";

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-pattern opacity-50" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Nasil{" "}
            <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
              Calisir?
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Sadece 4 adimda hayalinizdeki projeye kavusun
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex p-1 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "digital" | "studios")}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeHowTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className="relative w-4 h-4" />
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-white/10 -translate-y-1/2" />
          <div
            className={`hidden md:block absolute top-1/2 left-0 h-0.5 bg-gradient-to-r ${
              isDigital ? "from-amber-500 to-orange-500" : "from-emerald-500 to-teal-500"
            } -translate-y-1/2 transition-all duration-500`}
            style={{ width: "100%" }}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white dark:bg-white/[0.03] rounded-2xl p-5 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-all text-center group">
                  {/* Step Number */}
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      isDigital ? "from-amber-500 to-orange-500" : "from-emerald-500 to-teal-500"
                    } flex items-center justify-center text-white font-bold text-sm mx-auto mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${
                      isDigital ? "bg-amber-50 dark:bg-amber-500/10" : "bg-emerald-50 dark:bg-emerald-500/10"
                    } flex items-center justify-center mx-auto mb-3`}
                  >
                    <step.icon
                      className={`w-6 h-6 ${
                        isDigital ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {step.description}
                  </p>

                  {/* Time Badge */}
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                      isDigital
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                    }`}
                  >
                    {step.time}
                  </span>
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
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <a
            href="https://id.hyble.co/register"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${
              isDigital ? "from-amber-500 to-orange-500" : "from-emerald-500 to-teal-500"
            } text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5`}
          >
            <span>Hemen Basla</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
