"use client";

import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
          Hemen Başlamaya Hazır Mısınız?
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
          Binlerce geliştirici arasına katılın ve projelerinizi bir üst seviyeye taşıyın.
          Kredi kartı gerekmez.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://id.hyble.co/register"
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Ücretsiz Hesap Oluştur
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
