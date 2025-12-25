"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Building2,
  Palette,
  Layout,
  FileText,
  Globe,
  Rocket,
  Loader2,
  RefreshCw,
  ChevronDown,
  Upload,
  Image,
  Eye,
} from "lucide-react";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: any;
}

interface BusinessType {
  id: string;
  name: string;
  icon: string;
}

const steps: WizardStep[] = [
  { id: 1, title: "İşletme Tipi", description: "İşletme türünüzü seçin", icon: Building2 },
  { id: 2, title: "İşletme Bilgileri", description: "Temel bilgileri girin", icon: FileText },
  { id: 3, title: "Tasarım Tercihleri", description: "Görsel tercihlerinizi belirleyin", icon: Palette },
  { id: 4, title: "Sayfa Yapısı", description: "Sayfaları yapılandırın", icon: Layout },
  { id: 5, title: "İçerik Oluşturma", description: "AI ile içerik oluşturun", icon: Sparkles },
  { id: 6, title: "Yayınla", description: "Sitenizi yayına alın", icon: Rocket },
];

const colorPresets = [
  { name: "Ocean", primary: "#0ea5e9", secondary: "#06b6d4" },
  { name: "Forest", primary: "#22c55e", secondary: "#16a34a" },
  { name: "Sunset", primary: "#f97316", secondary: "#ef4444" },
  { name: "Purple", primary: "#8b5cf6", secondary: "#a855f7" },
  { name: "Rose", primary: "#f43f5e", secondary: "#ec4899" },
  { name: "Slate", primary: "#64748b", secondary: "#475569" },
];

const styleOptions = [
  { id: "modern", name: "Modern", description: "Temiz, minimal tasarım" },
  { id: "classic", name: "Klasik", description: "Zamansız, profesyonel" },
  { id: "playful", name: "Eğlenceli", description: "Renkli, dinamik" },
  { id: "corporate", name: "Kurumsal", description: "Ciddi, güvenilir" },
  { id: "artistic", name: "Sanatsal", description: "Yaratıcı, özgün" },
];

const pageOptions = [
  { id: "home", name: "Ana Sayfa", required: true },
  { id: "about", name: "Hakkımızda", required: false },
  { id: "services", name: "Hizmetler", required: false },
  { id: "products", name: "Ürünler", required: false },
  { id: "portfolio", name: "Portfolyo", required: false },
  { id: "blog", name: "Blog", required: false },
  { id: "contact", name: "İletişim", required: false },
  { id: "pricing", name: "Fiyatlandırma", required: false },
  { id: "faq", name: "SSS", required: false },
  { id: "testimonials", name: "Müşteri Yorumları", required: false },
  { id: "team", name: "Ekibimiz", required: false },
];

export function WizardFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    businessType: "",
    businessName: "",
    description: "",
    targetAudience: "",
    location: "",
    phone: "",
    email: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
    colorScheme: "light" as "light" | "dark" | "colorful" | "minimal",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    style: "modern",
    selectedPages: ["home", "about", "contact"],
    generatedContent: null as any,
    subdomain: "",
    logoUrl: "",
  });

  useEffect(() => {
    fetchBusinessTypes();
    loadSession();
  }, []);

  const fetchBusinessTypes = async () => {
    try {
      const response = await fetch("/api/trpc/wizard.getBusinessTypes");
      const data = await response.json();
      if (data.result?.data) {
        setBusinessTypes(data.result.data);
      }
    } catch (error) {
      console.error("Failed to fetch business types:", error);
    }
  };

  const loadSession = async () => {
    try {
      const response = await fetch("/api/trpc/wizard.getSession");
      const data = await response.json();
      if (data.result?.data) {
        const session = data.result.data;
        setCurrentStep(session.step || 1);
        if (session.data) {
          setFormData(prev => ({ ...prev, ...session.data }));
        }
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  };

  const saveSession = async () => {
    try {
      await fetch("/api/trpc/wizard.updateSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            step: currentStep,
            data: formData,
          },
        }),
      });
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  };

  const nextStep = async () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
      await saveSession();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateContent = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/trpc/wizard.generateContent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            businessInfo: {
              businessName: formData.businessName,
              businessType: formData.businessType,
              description: formData.description,
              targetAudience: formData.targetAudience,
              location: formData.location,
              phone: formData.phone,
              email: formData.email,
            },
            contentType: "full",
          },
        }),
      });
      const data = await response.json();
      if (data.result?.data) {
        setFormData(prev => ({ ...prev, generatedContent: data.result.data }));
      }
    } catch (error) {
      console.error("Failed to generate content:", error);
    } finally {
      setGenerating(false);
    }
  };

  const createWebsite = async () => {
    if (!formData.subdomain) {
      alert("Lütfen bir subdomain girin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/trpc/wizard.createWebsite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            subdomain: formData.subdomain,
          },
        }),
      });
      const data = await response.json();
      if (data.result?.data) {
        window.location.href = `/console/websites/${data.result.data.id}`;
      }
    } catch (error) {
      console.error("Failed to create website:", error);
      alert("Site oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                İşletme Türünüzü Seçin
              </h2>
              <p className="text-slate-500">
                Size en uygun şablonları ve içerikleri hazırlamamız için işletme türünüzü seçin
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData(prev => ({ ...prev, businessType: type.id }))}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    formData.businessType === type.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-3xl mb-3 block">{type.icon}</span>
                  <p className="font-medium text-slate-900 dark:text-white">{type.name}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                İşletme Bilgileriniz
              </h2>
              <p className="text-slate-500">
                Web sitenizin içeriğini oluşturmak için temel bilgileri girin
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  İşletme Adı *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                  placeholder="Örn: Acme Yazılım"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  İşletme Açıklaması *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                  placeholder="İşletmenizi kısaca tanıtın..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Hedef Kitle
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                  placeholder="Örn: Küçük ve orta ölçekli işletmeler"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                    placeholder="+90 555 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                    placeholder="info@isletme.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Konum
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                  placeholder="İstanbul, Türkiye"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Tasarım Tercihleri
              </h2>
              <p className="text-slate-500">
                Sitenizin görsel kimliğini oluşturun
              </p>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Logo (Opsiyonel)
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">Logo dosyanızı sürükleyin veya yükleyin</p>
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm">
                  Dosya Seç
                </button>
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Renk Şeması
              </label>
              <div className="grid grid-cols-4 gap-3">
                {["light", "dark", "colorful", "minimal"].map((scheme) => (
                  <button
                    key={scheme}
                    onClick={() => setFormData(prev => ({ ...prev, colorScheme: scheme as any }))}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      formData.colorScheme === scheme
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <p className="font-medium text-slate-900 dark:text-white capitalize">{scheme}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Renk Paleti
              </label>
              <div className="grid grid-cols-6 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary,
                    }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.primaryColor === preset.primary
                        ? "border-blue-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded-lg mb-2"
                      style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                    />
                    <p className="text-xs text-center text-slate-600 dark:text-slate-400">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Tasarım Stili
              </label>
              <div className="grid grid-cols-5 gap-3">
                {styleOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData(prev => ({ ...prev, style: option.id }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.style === option.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{option.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Sayfa Yapısı
              </h2>
              <p className="text-slate-500">
                Web sitenizde hangi sayfaların olmasını istiyorsunuz?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {pageOptions.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    if (page.required) return;
                    setFormData(prev => ({
                      ...prev,
                      selectedPages: prev.selectedPages.includes(page.id)
                        ? prev.selectedPages.filter(p => p !== page.id)
                        : [...prev.selectedPages, page.id],
                    }));
                  }}
                  disabled={page.required}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                    formData.selectedPages.includes(page.id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700"
                  } ${page.required ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span className="font-medium text-slate-900 dark:text-white">{page.name}</span>
                  {formData.selectedPages.includes(page.id) && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                AI İçerik Oluşturma
              </h2>
              <p className="text-slate-500">
                Yapay zeka ile web sitenizin içeriğini otomatik oluşturun
              </p>
            </div>

            {!formData.generatedContent ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  İçerik Oluşturmaya Hazır
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  AI, işletme bilgilerinize göre profesyonel içerik oluşturacak:
                  Hero section, hakkımızda, hizmetler, SSS ve SEO metinleri.
                </p>
                <button
                  onClick={generateContent}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      İçerik Oluştur
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Oluşturulan İçerik
                  </h3>
                  <button
                    onClick={generateContent}
                    disabled={generating}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
                    Yeniden Oluştur
                  </button>
                </div>

                {/* Hero Content */}
                <div className="p-6 bg-slate-50 dark:bg-[#0d0d14] rounded-2xl">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">Hero Section</h4>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {formData.generatedContent.hero?.title}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {formData.generatedContent.hero?.subtitle}
                    </p>
                    <p className="text-blue-600 font-medium">
                      CTA: {formData.generatedContent.hero?.cta}
                    </p>
                  </div>
                </div>

                {/* About Content */}
                <div className="p-6 bg-slate-50 dark:bg-[#0d0d14] rounded-2xl">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">Hakkımızda</h4>
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {formData.generatedContent.about}
                  </p>
                </div>

                {/* Services */}
                {formData.generatedContent.services && (
                  <div className="p-6 bg-slate-50 dark:bg-[#0d0d14] rounded-2xl">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">Hizmetler</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.generatedContent.services.slice(0, 4).map((service: any, i: number) => (
                        <div key={i} className="p-4 bg-white dark:bg-[#12121a] rounded-xl">
                          <p className="font-medium text-slate-900 dark:text-white">{service.title}</p>
                          <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SEO */}
                {formData.generatedContent.seo && (
                  <div className="p-6 bg-slate-50 dark:bg-[#0d0d14] rounded-2xl">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">SEO Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-500">Başlık:</span> {formData.generatedContent.seo.title}</p>
                      <p><span className="text-slate-500">Açıklama:</span> {formData.generatedContent.seo.description}</p>
                      <p><span className="text-slate-500">Anahtar Kelimeler:</span> {formData.generatedContent.seo.keywords?.join(", ")}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Sitenizi Yayınlayın
              </h2>
              <p className="text-slate-500">
                Son adım! Sitenizin adresini belirleyin ve yayına alın
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Site Adresi *
              </label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl text-slate-500">
                  https://
                </span>
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                  placeholder="sirketiniz"
                />
                <span className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-xl text-slate-500">
                  .hyble.co
                </span>
              </div>
              {formData.subdomain && (
                <p className="text-sm text-slate-500 mt-2">
                  Siteniz şu adreste yayınlanacak: <span className="text-blue-600">https://{formData.subdomain}.hyble.co</span>
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="p-6 bg-slate-50 dark:bg-[#0d0d14] rounded-2xl">
              <h3 className="font-medium text-slate-900 dark:text-white mb-4">Özet</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">İşletme Adı</span>
                  <span className="text-slate-900 dark:text-white">{formData.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">İşletme Türü</span>
                  <span className="text-slate-900 dark:text-white">
                    {businessTypes.find(t => t.id === formData.businessType)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tasarım Stili</span>
                  <span className="text-slate-900 dark:text-white capitalize">{formData.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sayfa Sayısı</span>
                  <span className="text-slate-900 dark:text-white">{formData.selectedPages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Renkler</span>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: formData.primaryColor }} />
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: formData.secondaryColor }} />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={createWebsite}
              disabled={loading || !formData.subdomain}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-medium text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Siteyi Yayınla
                </>
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f]">
      {/* Progress Header */}
      <div className="bg-white dark:bg-[#12121a] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Site Oluşturma Sihirbazı
            </h1>
            <button
              onClick={() => window.history.back()}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              İptal
            </button>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-3 ${
                      isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : isCompleted
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium">{step.title}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-4 ${
                        isCompleted ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#12121a] border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-400 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri
          </button>

          <span className="text-sm text-slate-500">
            Adım {currentStep} / {steps.length}
          </span>

          {currentStep < 6 && (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !formData.businessType) ||
                (currentStep === 2 && (!formData.businessName || !formData.description))
              }
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl"
            >
              İleri
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
