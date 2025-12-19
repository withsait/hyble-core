"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@hyble/ui";
import {
  ArrowRight, ArrowLeft, Check, Sparkles, Globe, Palette, Layout,
  Building2, ShoppingBag, Briefcase, Camera, Utensils, Heart,
  BookOpen, Stethoscope, GraduationCap, Home, Dumbbell, Monitor,
  Upload, Loader2, Wand2, Eye, Zap, Shield, Users, Star,
  FileText, Code, Coffee, CheckCircle, Image,
} from "lucide-react";

const businessTypes = [
  { id: "corporate", name: "Kurumsal / Sirket", icon: Building2, desc: "Sirket ve isletme siteleri" },
  { id: "ecommerce", name: "E-Ticaret", icon: ShoppingBag, desc: "Online magaza ve satis" },
  { id: "portfolio", name: "Portfolyo", icon: Briefcase, desc: "Kisisel portfolyo ve CV" },
  { id: "blog", name: "Blog", icon: BookOpen, desc: "Yazi ve icerik sitesi" },
  { id: "restaurant", name: "Restoran / Kafe", icon: Utensils, desc: "Yeme-icme isletmeleri" },
  { id: "healthcare", name: "Saglik", icon: Stethoscope, desc: "Klinik ve saglik kuruluslari" },
  { id: "education", name: "Egitim", icon: GraduationCap, desc: "Okul ve egitim kurumlari" },
  { id: "realestate", name: "Emlak", icon: Home, desc: "Emlak ve gayrimenkul" },
  { id: "fitness", name: "Fitness / Spor", icon: Dumbbell, desc: "Spor salonu ve fitness" },
  { id: "photography", name: "Fotografci", icon: Camera, desc: "Fotograf ve video" },
  { id: "tech", name: "Teknoloji / SaaS", icon: Monitor, desc: "Yazilim ve teknoloji" },
  { id: "nonprofit", name: "Sivil Toplum", icon: Heart, desc: "Vakif ve dernekler" },
];

const colorSchemes = [
  { id: "blue", name: "Profesyonel Mavi", colors: ["#3B82F6", "#1D4ED8", "#EFF6FF"] },
  { id: "emerald", name: "Dogal Yesil", colors: ["#10B981", "#059669", "#ECFDF5"] },
  { id: "purple", name: "Yaratici Mor", colors: ["#8B5CF6", "#7C3AED", "#F5F3FF"] },
  { id: "amber", name: "Sicak Turuncu", colors: ["#F59E0B", "#D97706", "#FFFBEB"] },
  { id: "rose", name: "Modern Pembe", colors: ["#F43F5E", "#E11D48", "#FFF1F2"] },
  { id: "slate", name: "Minimalist Koyu", colors: ["#475569", "#1E293B", "#F8FAFC"] },
];

const templateStyles = [
  { id: "modern", name: "Modern", desc: "Temiz cizgiler, bol bosluk", image: "" },
  { id: "classic", name: "Klasik", desc: "Geleneksel ve guvenilir", image: "" },
  { id: "bold", name: "Cesur", desc: "Dikkat cekici ve canli", image: "" },
  { id: "minimal", name: "Minimal", desc: "Az ama oz, sade", image: "" },
];

const plans = [
  {
    id: "starter",
    name: "Baslangic",
    price: "Ucretsiz",
    desc: "Kucuk projeler icin ideal",
    features: ["1 GB Depolama", "hyble.co alt alan adi", "Temel SEO", "SSL Sertifikasi"],
  },
  {
    id: "professional",
    name: "Profesyonel",
    price: "9.99",
    period: "/ay",
    desc: "Buyuyen isletmeler icin",
    popular: true,
    features: ["10 GB Depolama", "Ozel alan adi", "Gelismis SEO", "Oncelikli Destek", "Analitik"],
  },
  {
    id: "business",
    name: "Isletme",
    price: "24.99",
    period: "/ay",
    desc: "Tam ozellikli cozum",
    features: ["50 GB Depolama", "Sinirsiz Alan Adi", "E-ticaret", "API Erisimi", "7/24 Destek"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    businessType: "",
    businessName: "",
    description: "",
    colorScheme: "",
    templateStyle: "",
    logo: null as File | null,
    subdomain: "",
    plan: "starter",
    useAI: false,
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 1: return formData.businessType && formData.businessName;
      case 2: return formData.colorScheme;
      case 3: return formData.templateStyle;
      case 4: return formData.subdomain && formData.subdomain.length >= 3;
      case 5: return formData.plan;
      default: return false;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
    router.push("/websites");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              Web Sitenizi Olusturun
            </h1>
            <span className="text-sm text-slate-500">
              Adim {step} / {totalSteps}
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step 1: Business Info */}
        {step === 1 && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Isletmenizi Tanitin
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Web sitenizin amacini ve isletmenizi anlamamiza yardimci olun
            </p>

            {/* Business Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Isletme Turu
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {businessTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, businessType: type.id })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.businessType === type.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${
                        formData.businessType === type.id ? "text-blue-600" : "text-slate-400"
                      }`} />
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{type.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{type.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Business Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Isletme / Site Adi
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Ornek: Acme Teknoloji"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kisa Aciklama (Opsiyonel)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Isletmenizi veya sitenizi kisaca tanitin..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
              />
            </div>
          </Card>
        )}

        {/* Step 2: Color Scheme */}
        {step === 2 && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Renk Temanizi Secin
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Markanizi yansitan renk paletini secin
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setFormData({ ...formData, colorScheme: scheme.id })}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    formData.colorScheme === scheme.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex gap-2 mb-3">
                    {scheme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-lg shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{scheme.name}</p>
                  {formData.colorScheme === scheme.id && (
                    <Check className="w-5 h-5 text-blue-600 mt-2" />
                  )}
                </button>
              ))}
            </div>

            {/* Logo Upload */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Logo (Opsiyonel)
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 mb-1">
                  Logo yuklemek icin tiklayin veya surukleyin
                </p>
                <p className="text-xs text-slate-400">PNG, JPG veya SVG (max 2MB)</p>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Template Style */}
        {step === 3 && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Tasarim Stilini Secin
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Sitenizin genel gorunumunu belirleyin
            </p>

            <div className="grid grid-cols-2 gap-4">
              {templateStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setFormData({ ...formData, templateStyle: style.id })}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${
                    formData.templateStyle === style.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <Layout className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                  </div>
                  <div className="p-4 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900 dark:text-white">{style.name}</p>
                      {formData.templateStyle === style.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{style.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* AI Option */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    AI ile Otomatik Tasarim
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Yapay zeka, isletmenize ozel profesyonel bir tasarim olusturabilir.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useAI}
                      onChange={(e) => setFormData({ ...formData, useAI: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      AI'in benim icin tasarim olusturmasini istiyorum
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Domain */}
        {step === 4 && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Site Adresinizi Belirleyin
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Sitenize nasil eriseceksiniz?
            </p>

            {/* Subdomain */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ucretsiz Alt Alan Adi
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({
                    ...formData,
                    subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  })}
                  placeholder="siteadiniz"
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-l-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-500">
                  .hyble.co
                </span>
              </div>
              {formData.subdomain && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {formData.subdomain}.hyble.co kullanilabilir
                </p>
              )}
            </div>

            {/* Custom Domain Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-400 mb-1">
                    Ozel Alan Adi
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-500">
                    Profesyonel planlarimizda kendi alan adinizi (ornek.com) baglayabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 5: Plan Selection */}
        {step === 5 && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Planinizi Secin
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Ihtiyaciniza uygun plani secin. Istediginiz zaman yukseltebilirsiniz.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setFormData({ ...formData, plan: plan.id })}
                  className={`p-6 rounded-xl border-2 text-left relative transition-all ${
                    formData.plan === plan.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                      Populer
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    {plan.price === "Ucretsiz" ? (
                      <span className="text-2xl font-bold text-green-600">{plan.price}</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">${plan.price}</span>
                        <span className="text-slate-500">{plan.period}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mb-4">{plan.desc}</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </button>

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Devam
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={!canProceed() || isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Olusturuluyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Siteyi Olustur
                </>
              )}
            </button>
          )}
        </div>

        {/* Summary Preview */}
        {step > 1 && (
          <Card className="mt-6 p-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Secimleriniz:</p>
            <div className="flex flex-wrap gap-2">
              {formData.businessType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400">
                  <Building2 className="w-3 h-3" />
                  {businessTypes.find(t => t.id === formData.businessType)?.name}
                </span>
              )}
              {formData.businessName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400">
                  {formData.businessName}
                </span>
              )}
              {formData.colorScheme && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400">
                  <Palette className="w-3 h-3" />
                  {colorSchemes.find(c => c.id === formData.colorScheme)?.name}
                </span>
              )}
              {formData.templateStyle && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400">
                  <Layout className="w-3 h-3" />
                  {templateStyles.find(s => s.id === formData.templateStyle)?.name}
                </span>
              )}
              {formData.subdomain && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-600 dark:text-slate-400">
                  <Globe className="w-3 h-3" />
                  {formData.subdomain}.hyble.co
                </span>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
