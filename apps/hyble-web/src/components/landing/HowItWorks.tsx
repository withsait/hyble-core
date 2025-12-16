"use client";

import { UserPlus, LayoutGrid, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Hesap Oluştur",
    description: "Saniyeler içinde ücretsiz hesabınızı oluşturun ve Hyble ekosistemine katılın.",
  },
  {
    icon: LayoutGrid,
    title: "Projelerini Yönet",
    description: "Dashboard üzerinden kimlik, lisans ve izleme servislerini yapılandırın.",
  },
  {
    icon: Rocket,
    title: "İşini Büyüt",
    description: "Güçlü altyapımızla işinizi ölçeklendirin ve müşterilerinize odaklanın.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Nasıl Çalışır?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Üç basit adımda Hyble ile tanışın.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.title} className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
