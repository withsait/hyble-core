import { Metadata } from "next";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Fiyatlandırma - Hyble",
  description: "Hyble fiyatlandırma planları. Beta döneminde tüm özellikler ücretsiz!",
};

const plans = [
  {
    name: "Starter",
    price: "Ücretsiz",
    description: "Bireysel geliştiriciler için mükemmel başlangıç",
    features: [
      "1 Organizasyon",
      "3 Proje",
      "1.000 API çağrısı/ay",
      "Topluluk desteği",
      "Temel analitikler",
    ],
    cta: "Ücretsiz Başla",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Beta'da Ücretsiz",
    originalPrice: "$29/ay",
    description: "Büyüyen ekipler için ideal çözüm",
    features: [
      "5 Organizasyon",
      "Sınırsız Proje",
      "100.000 API çağrısı/ay",
      "Öncelikli destek",
      "Gelişmiş analitikler",
      "Özel entegrasyonlar",
      "API erişimi",
    ],
    cta: "Pro'ya Geç",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "İletişime Geçin",
    description: "Kurumsal ihtiyaçlar için özelleştirilmiş çözümler",
    features: [
      "Sınırsız her şey",
      "Özel SLA",
      "Dedicated destek",
      "On-premise seçeneği",
      "Özel eğitim",
      "API önceliği",
    ],
    cta: "Satışla Görüşün",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
            Beta Döneminde Tüm Özellikler Ücretsiz!
          </span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Basit ve Şeffaf Fiyatlandırma
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            İhtiyaçlarınıza uygun planı seçin. İstediğiniz zaman yükseltin veya iptal edin.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-4 dark:ring-offset-slate-900"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                  En Popüler
                </span>
              )}

              <h3
                className={`text-xl font-semibold mb-2 ${
                  plan.highlighted ? "text-white" : "text-slate-900 dark:text-white"
                }`}
              >
                {plan.name}
              </h3>

              <div className="mb-4">
                <span
                  className={`text-4xl font-bold ${
                    plan.highlighted ? "text-white" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {plan.price}
                </span>
                {plan.originalPrice && (
                  <span className="ml-2 text-blue-200 line-through">{plan.originalPrice}</span>
                )}
              </div>

              <p
                className={`mb-6 ${
                  plan.highlighted ? "text-blue-100" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check
                      className={`w-5 h-5 ${
                        plan.highlighted ? "text-blue-200" : "text-blue-600 dark:text-blue-400"
                      }`}
                    />
                    <span
                      className={
                        plan.highlighted ? "text-blue-50" : "text-slate-600 dark:text-slate-400"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="https://id.hyble.co/register"
                className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                  plan.highlighted
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Sorularınız mı var?{" "}
            <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
              Bizimle iletişime geçin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
