"use client";

import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";

// Rekabet karşılaştırma tablosu - Vercel, Netlify, Railway, Render vs Hyble
const competitors = [
  { name: "Hyble", highlight: true },
  { name: "Vercel" },
  { name: "Netlify" },
  { name: "Railway" },
  { name: "Render" },
];

const comparisonData = [
  {
    feature: "Kimlik Doğrulama (Auth)",
    hyble: true,
    vercel: false,
    netlify: false,
    railway: false,
    render: false,
  },
  {
    feature: "Ödeme Altyapısı",
    hyble: true,
    vercel: false,
    netlify: false,
    railway: false,
    render: false,
  },
  {
    feature: "Lisans Yönetimi",
    hyble: true,
    vercel: false,
    netlify: false,
    railway: false,
    render: false,
  },
  {
    feature: "Durum Sayfaları",
    hyble: true,
    vercel: false,
    netlify: false,
    railway: false,
    render: false,
  },
  {
    feature: "Web Hosting",
    hyble: true,
    vercel: true,
    netlify: true,
    railway: true,
    render: true,
  },
  {
    feature: "Veritabanı",
    hyble: true,
    vercel: true,
    netlify: false,
    railway: true,
    render: true,
  },
  {
    feature: "GDPR Uyumlu (EU)",
    hyble: true,
    vercel: "Kısmi",
    netlify: "Kısmi",
    railway: "Kısmi",
    render: "Kısmi",
  },
  {
    feature: "Türkçe Destek",
    hyble: true,
    vercel: false,
    netlify: false,
    railway: false,
    render: false,
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-amber-600 dark:text-amber-400 text-sm">{value}</span>;
  }
  if (value) {
    return <Check className="w-5 h-5 text-green-500 mx-auto" />;
  }
  return <X className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto" />;
}

export function ComparisonSection() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Neden Hyble?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Diğer platformlardan farkımız: Tek yerden tüm ihtiyaçlarınızı karşılıyoruz.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white w-1/4">
                    Özellik
                  </th>
                  {competitors.map((comp) => (
                    <th
                      key={comp.name}
                      className={`text-center p-4 font-semibold ${
                        comp.highlight
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {comp.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={
                      index !== comparisonData.length - 1
                        ? "border-b border-slate-100 dark:border-slate-700/50"
                        : ""
                    }
                  >
                    <td className="p-4 text-slate-700 dark:text-slate-300 text-sm">
                      {row.feature}
                    </td>
                    <td className="p-4 text-center bg-blue-50/50 dark:bg-blue-900/10">
                      <CellValue value={row.hyble} />
                    </td>
                    <td className="p-4 text-center">
                      <CellValue value={row.vercel} />
                    </td>
                    <td className="p-4 text-center">
                      <CellValue value={row.netlify} />
                    </td>
                    <td className="p-4 text-center">
                      <CellValue value={row.railway} />
                    </td>
                    <td className="p-4 text-center">
                      <CellValue value={row.render} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Farklı platformları birleştirmek yerine, her şeyi tek yerden yönetin.
          </p>
          <a
            href="https://id.hyble.co/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Ücretsiz Deneyin
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// Eski StatsSection'ı da export edelim (uyumluluk için)
export function StatsSection() {
  return <ComparisonSection />;
}
