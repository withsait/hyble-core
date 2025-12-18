"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@hyble/ui";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Layout,
  Sparkles,
  Check,
  Loader2,
  Store,
  FileText,
  Briefcase,
  Camera,
  Coffee,
  Heart,
  Palette,
} from "lucide-react";

const templates = [
  { id: "blank", name: "Boş Sayfa", icon: Layout, description: "Sıfırdan başlayın" },
  { id: "business", name: "İşletme", icon: Briefcase, description: "Şirket ve kurumsal siteler" },
  { id: "portfolio", name: "Portfolyo", icon: Camera, description: "Kişisel portfolyo ve CV" },
  { id: "blog", name: "Blog", icon: FileText, description: "Yazı ve içerik sitesi" },
  { id: "ecommerce", name: "E-Ticaret", icon: Store, description: "Online mağaza" },
  { id: "restaurant", name: "Restoran", icon: Coffee, description: "Kafe ve restoran sitesi" },
  { id: "nonprofit", name: "Sivil Toplum", icon: Heart, description: "Vakıf ve dernek sitesi" },
  { id: "creative", name: "Yaratıcı", icon: Palette, description: "Sanat ve tasarım sitesi" },
];

const plans = [
  {
    id: "STARTER",
    name: "Başlangıç",
    price: "Ücretsiz",
    features: ["1 GB Depolama", "hyble.co alt alan adı", "Temel analitik", "Topluluk desteği"],
  },
  {
    id: "PROFESSIONAL",
    name: "Profesyonel",
    price: "€9.99/ay",
    popular: true,
    features: ["10 GB Depolama", "Özel alan adı bağlama", "Gelişmiş analitik", "SSL sertifikası", "E-posta desteği"],
  },
  {
    id: "BUSINESS",
    name: "İşletme",
    price: "€24.99/ay",
    features: ["50 GB Depolama", "Sınırsız alan adı", "Öncelikli destek", "CDN entegrasyonu", "Otomatik yedekleme", "API erişimi"],
  },
];

export default function NewWebsitePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("STARTER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);

  const handleSubdomainChange = async (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubdomain(cleaned);
    setSubdomainAvailable(null);

    if (cleaned.length >= 3) {
      setCheckingSubdomain(true);
      // In production, check availability via API
      setTimeout(() => {
        setSubdomainAvailable(true);
        setCheckingSubdomain(false);
      }, 500);
    }
  };

  const handleCreate = async () => {
    if (!name || !subdomain || !selectedTemplate) {
      setError("Lütfen tüm alanları doldurun");
      return;
    }

    try {
      setLoading(true);
      // In production, call API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/websites");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/websites"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Yeni Web Sitesi Oluştur
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Birkaç adımda web sitenizi oluşturun
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                s < step
                  ? "bg-green-500 text-white"
                  : s === step
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500"
              }`}
            >
              {s < step ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-1 mx-2 rounded ${
                  s < step ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Temel Bilgiler
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Site Adı *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Benim Web Sitem"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Alt Alan Adı *
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  placeholder="siteniz"
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400"
                />
                <span className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-l-0 border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-500 dark:text-slate-400">
                  .hyble.co
                </span>
              </div>
              {subdomain.length >= 3 && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {checkingSubdomain ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      <span className="text-slate-500">Kontrol ediliyor...</span>
                    </>
                  ) : subdomainAvailable ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        {subdomain}.hyble.co kullanılabilir
                      </span>
                    </>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      Bu alt alan adı kullanımda
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!name || !subdomain || subdomain.length < 3 || !subdomainAvailable}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Devam
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Template Selection */}
      {step === 2 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Şablon Seçin
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedTemplate === template.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50"
                  }`}
                >
                  <Icon
                    className={`w-8 h-8 mx-auto mb-2 ${
                      selectedTemplate === template.id
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-400"
                    }`}
                  />
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {template.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {template.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium rounded-lg transition-colors"
            >
              Geri
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedTemplate}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Devam
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Step 3: Plan Selection */}
      {step === 3 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Plan Seçin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-6 rounded-xl border-2 text-left relative transition-all ${
                  selectedPlan === plan.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    Popüler
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  {plan.price}
                </p>
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium rounded-lg transition-colors"
            >
              Geri
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Site Oluştur
                </>
              )}
            </button>
          </div>
        </Card>
      )}

      {/* AI Create Option */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              AI ile Otomatik Oluştur
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              İşletmenizi tanımlayın, yapay zeka sizin için profesyonel bir web sitesi oluştursun.
            </p>
            <Link
              href="/websites/new/ai"
              className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
            >
              AI ile Başla
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
