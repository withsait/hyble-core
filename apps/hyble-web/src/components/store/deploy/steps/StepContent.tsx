"use client";

import { Building2, Mail, Phone, FileText } from "lucide-react";
import type { WizardData } from "../DeployWizard";

interface StepContentProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function StepContent({ data, updateData }: StepContentProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          İçerik Bilgileri
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Sitenizde görünecek temel bilgileri girin
        </p>
      </div>

      {/* Site Info */}
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Site Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Building2 className="w-4 h-4" />
              Site / Şirket Adı *
            </label>
            <input
              type="text"
              value={data.siteName}
              onChange={(e) => updateData({ siteName: e.target.value })}
              placeholder="Örn: Acme Teknoloji"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Site Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <FileText className="w-4 h-4" />
              Kısa Açıklama
            </label>
            <input
              type="text"
              value={data.siteDescription}
              onChange={(e) => updateData({ siteDescription: e.target.value })}
              placeholder="Örn: Yazılım çözümleri"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <h3 className="font-medium text-slate-900 dark:text-white mb-4">
            Ana Sayfa Hero Bölümü
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                Başlık
              </label>
              <input
                type="text"
                value={data.heroTitle}
                onChange={(e) => updateData({ heroTitle: e.target.value })}
                placeholder="Örn: Geleceği Bugün İnşa Edin"
                className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                Alt Başlık
              </label>
              <textarea
                value={data.heroSubtitle}
                onChange={(e) => updateData({ heroSubtitle: e.target.value })}
                placeholder="Örn: İnovatif çözümlerimizle işinizi bir sonraki seviyeye taşıyın."
                rows={2}
                className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Mail className="w-4 h-4" />
              E-posta Adresi
            </label>
            <input
              type="email"
              value={data.contactEmail}
              onChange={(e) => updateData({ contactEmail: e.target.value })}
              placeholder="info@sirketiniz.com"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Phone className="w-4 h-4" />
              Telefon Numarası
            </label>
            <input
              type="tel"
              value={data.contactPhone}
              onChange={(e) => updateData({ contactPhone: e.target.value })}
              placeholder="+90 212 123 45 67"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
        Bu bilgileri daha sonra panel üzerinden düzenleyebilirsiniz.
      </p>
    </div>
  );
}
