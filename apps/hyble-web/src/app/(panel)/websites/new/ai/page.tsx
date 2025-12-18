"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Globe,
  Palette,
  Layout,
  CheckCircle,
  Zap,
  Building2,
  ShoppingBag,
  Briefcase,
  Camera,
  Utensils,
  Heart,
  BookOpen,
  Stethoscope,
  GraduationCap,
  Home,
  Dumbbell,
  Monitor,
  Wand2,
} from "lucide-react";

const businessTypes = [
  { id: "corporate", name: "Kurumsal", icon: Building2 },
  { id: "ecommerce", name: "E-Ticaret", icon: ShoppingBag },
  { id: "portfolio", name: "Portfolyo", icon: Briefcase },
  { id: "photography", name: "Fotoğrafçı", icon: Camera },
  { id: "restaurant", name: "Restoran", icon: Utensils },
  { id: "nonprofit", name: "STK", icon: Heart },
  { id: "blog", name: "Blog", icon: BookOpen },
  { id: "healthcare", name: "Sağlık", icon: Stethoscope },
  { id: "education", name: "Eğitim", icon: GraduationCap },
  { id: "realestate", name: "Emlak", icon: Home },
  { id: "fitness", name: "Fitness", icon: Dumbbell },
  { id: "tech", name: "Teknoloji", icon: Monitor },
];

const colorSchemes = [
  { id: "blue", name: "Mavi", colors: ["#3B82F6", "#1D4ED8"] },
  { id: "emerald", name: "Zümrüt", colors: ["#10B981", "#059669"] },
  { id: "purple", name: "Mor", colors: ["#8B5CF6", "#7C3AED"] },
  { id: "amber", name: "Amber", colors: ["#F59E0B", "#D97706"] },
  { id: "rose", name: "Gül", colors: ["#F43F5E", "#E11D48"] },
  { id: "slate", name: "Koyu", colors: ["#475569", "#1E293B"] },
];

export default function AIWebCreatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    businessType: "",
    colorScheme: "",
    siteName: "",
    prompt: "",
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsGenerating(false);
    router.push("/websites/new-site/editor");
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
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-500" />
              AI Web Oluşturucu
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Yapay zeka ile profesyonel web sitenizi oluşturun
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? "bg-purple-500" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Business Type */}
        {step === 1 && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              İşletme Türünü Seçin
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Web sitenizin amacına uygun bir şablon ile başlayalım
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {businessTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setFormData({ ...formData, businessType: type.id });
                      setStep(2);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.businessType === type.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {type.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Step 2: Color Scheme */}
        {step === 2 && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Renk Teması Seçin
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Markanıza uygun renk paleti
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-8">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setFormData({ ...formData, colorScheme: scheme.id })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.colorScheme === scheme.id
                      ? "border-purple-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    {scheme.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {scheme.name}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Geri
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.colorScheme}
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-medium rounded-lg"
              >
                Devam
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <Card className="p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Son Detaylar
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Siteniz hakkında biraz bilgi verin
            </p>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Site Adı
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  placeholder="Örn: Acme Teknoloji"
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Site Hakkında (Opsiyonel)
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Sitenizde ne tür içerikler olmasını istersiniz? AI'ya talimat verin..."
                  rows={4}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Geri
              </button>
              <button
                onClick={handleGenerate}
                disabled={!formData.siteName || isGenerating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold rounded-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    AI ile Oluştur
                  </>
                )}
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
