"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Settings,
  Globe,
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Search,
  Code,
  Palette,
  Bell,
  Shield,
  Image,
} from "lucide-react";

export default function WebsiteSettingsPage() {
  const params = useParams();
  const websiteId = params.id as string;
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    name: "My Business Site",
    description: "A professional business website",
    favicon: "",
    language: "tr",
    indexable: true,
    cookieConsent: true,
    analyticsId: "",
    headCode: "",
    footerCode: "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/websites"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Site Ayarları
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Web sitenizin genel ayarlarını yönetin
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Kaydet
          </button>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Genel Bilgiler
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Site Adı
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Dil
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </Card>

          {/* SEO Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              SEO Ayarları
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Arama Motorlarına İzin Ver</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sitenizin Google ve diğer arama motorları tarafından indexlenmesine izin verin
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, indexable: !settings.indexable })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.indexable ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.indexable ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Gizlilik
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Çerez Onayı Göster</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    KVKK/GDPR uyumluluğu için çerez bildirimini göster
                  </p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, cookieConsent: !settings.cookieConsent })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.cookieConsent ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings.cookieConsent ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-red-200 dark:border-red-900">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Tehlikeli Bölge
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Bu işlem geri alınamaz. Siteniz ve tüm içeriği kalıcı olarak silinecektir.
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
              Siteyi Sil
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
