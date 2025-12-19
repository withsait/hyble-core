// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
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
  MessageSquare,
  Send,
  RefreshCw,
  Eye,
  Code,
  Image,
  Type,
  Copy,
  Check,
  Lightbulb,
  PenTool,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  Layers,
  Target,
  Users,
  Star,
  TrendingUp,
  Smartphone,
  Tablet,
  Monitor as Desktop,
  History,
  Undo2,
  Redo2,
  Save,
  Download,
} from "lucide-react";

const businessTypes = [
  { id: "corporate", name: "Kurumsal", icon: Building2, description: "İşletmeler ve şirketler için profesyonel web sitesi" },
  { id: "ecommerce", name: "E-Ticaret", icon: ShoppingBag, description: "Online mağaza ve ürün satışı" },
  { id: "portfolio", name: "Portfolyo", icon: Briefcase, description: "Kişisel veya ajans portfolyosu" },
  { id: "photography", name: "Fotoğrafçı", icon: Camera, description: "Fotoğraf galerisi ve stüdyo" },
  { id: "restaurant", name: "Restoran", icon: Utensils, description: "Kafe, restoran ve yemek işletmeleri" },
  { id: "nonprofit", name: "STK", icon: Heart, description: "Sivil toplum kuruluşları" },
  { id: "blog", name: "Blog", icon: BookOpen, description: "Kişisel blog ve içerik platformu" },
  { id: "healthcare", name: "Sağlık", icon: Stethoscope, description: "Klinik, doktor ve sağlık hizmetleri" },
  { id: "education", name: "Eğitim", icon: GraduationCap, description: "Okul, kurs ve eğitim platformu" },
  { id: "realestate", name: "Emlak", icon: Home, description: "Gayrimenkul ve emlak ofisi" },
  { id: "fitness", name: "Fitness", icon: Dumbbell, description: "Spor salonu ve fitness merkezi" },
  { id: "tech", name: "Teknoloji", icon: Monitor, description: "SaaS, startup ve teknoloji şirketi" },
];

const colorSchemes = [
  { id: "blue", name: "Okyanus", colors: ["#3B82F6", "#1D4ED8", "#EFF6FF"], description: "Profesyonel ve güvenilir" },
  { id: "emerald", name: "Orman", colors: ["#10B981", "#059669", "#ECFDF5"], description: "Doğal ve taze" },
  { id: "purple", name: "Kraliyet", colors: ["#8B5CF6", "#7C3AED", "#F5F3FF"], description: "Yaratıcı ve premium" },
  { id: "amber", name: "Güneş", colors: ["#F59E0B", "#D97706", "#FFFBEB"], description: "Enerjik ve sıcak" },
  { id: "rose", name: "Çiçek", colors: ["#F43F5E", "#E11D48", "#FFF1F2"], description: "Romantik ve zarif" },
  { id: "slate", name: "Gece", colors: ["#475569", "#1E293B", "#F8FAFC"], description: "Modern ve sofistike" },
  { id: "teal", name: "Deniz", colors: ["#14B8A6", "#0D9488", "#F0FDFA"], description: "Sakin ve temiz" },
  { id: "orange", name: "Ateş", colors: ["#F97316", "#EA580C", "#FFF7ED"], description: "Dinamik ve cesur" },
];

const styleOptions = [
  { id: "minimal", name: "Minimal", description: "Sade ve temiz tasarım" },
  { id: "modern", name: "Modern", description: "Çağdaş ve şık görünüm" },
  { id: "classic", name: "Klasik", description: "Zamansız ve profesyonel" },
  { id: "bold", name: "Cesur", description: "Dikkat çekici ve güçlü" },
  { id: "playful", name: "Eğlenceli", description: "Renkli ve neşeli" },
  { id: "elegant", name: "Zarif", description: "Lüks ve sofistike" },
];

const samplePrompts = [
  "Modern bir teknoloji şirketi için landing page oluştur. Ürün özellikleri, müşteri yorumları ve fiyatlandırma bölümleri olsun.",
  "Bir restoran için menü, rezervasyon formu ve galeri içeren web sitesi tasarla.",
  "E-ticaret sitesi için ürün listeleme, filtreleme ve sepet özellikli tasarım yap.",
  "Kişisel portfolyo sitesi: projelerim, hakkımda ve iletişim sayfaları olsun.",
  "Fitness merkezi için üyelik planları, eğitmen profilleri ve program takvimi olan site oluştur.",
];

// Simüle edilmiş AI yanıtları
const aiResponses = [
  "Site yapınızı analiz ediyorum...",
  "İçerik önerileri hazırlanıyor...",
  "Renk paleti uygulanıyor...",
  "Bileşenler oluşturuluyor...",
  "Responsive tasarım ayarlanıyor...",
  "SEO optimizasyonu yapılıyor...",
  "Son dokunuşlar ekleniyor...",
];

type DeviceType = "desktop" | "tablet" | "mobile";

export default function AIWebCreatorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentAiMessage, setCurrentAiMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<DeviceType>("desktop");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    businessType: "",
    colorScheme: "",
    style: "modern",
    siteName: "",
    prompt: "",
    pages: ["home", "about", "contact"],
    features: [] as string[],
    targetAudience: "",
    language: "tr",
  });

  const pageOptions = [
    { id: "home", name: "Ana Sayfa", required: true },
    { id: "about", name: "Hakkımızda", required: false },
    { id: "services", name: "Hizmetler", required: false },
    { id: "products", name: "Ürünler", required: false },
    { id: "portfolio", name: "Portfolyo", required: false },
    { id: "blog", name: "Blog", required: false },
    { id: "contact", name: "İletişim", required: false },
    { id: "faq", name: "SSS", required: false },
    { id: "pricing", name: "Fiyatlandırma", required: false },
    { id: "team", name: "Ekibimiz", required: false },
  ];

  const featureOptions = [
    { id: "contact-form", name: "İletişim Formu", icon: MessageSquare },
    { id: "newsletter", name: "Bülten Kayıt", icon: Send },
    { id: "gallery", name: "Galeri", icon: Image },
    { id: "testimonials", name: "Müşteri Yorumları", icon: Star },
    { id: "social-links", name: "Sosyal Medya", icon: Users },
    { id: "google-maps", name: "Google Maps", icon: Globe },
    { id: "live-chat", name: "Canlı Destek", icon: MessageSquare },
    { id: "analytics", name: "Analytics", icon: TrendingUp },
  ];

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsGenerating(false);
            setGenerationComplete(true);
            return 100;
          }
          const messageIndex = Math.floor(prev / (100 / aiResponses.length));
          setCurrentAiMessage(aiResponses[Math.min(messageIndex, aiResponses.length - 1)]);
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setChatMessages([
      ...chatMessages,
      { role: "ai", content: "Web sitenizi oluşturmaya başlıyorum. Bu işlem birkaç saniye sürebilir..." }
    ]);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages([
      ...chatMessages,
      { role: "user", content: chatInput },
      { role: "ai", content: "Anlıyorum, bu değişiklikleri sitenize uyguluyorum..." }
    ]);
    setChatInput("");
  };

  const handleSamplePrompt = (prompt: string) => {
    setFormData({ ...formData, prompt });
  };

  const togglePage = (pageId: string) => {
    if (pageId === "home") return;
    setFormData({
      ...formData,
      pages: formData.pages.includes(pageId)
        ? formData.pages.filter((p) => p !== pageId)
        : [...formData.pages, pageId],
    });
  };

  const toggleFeature = (featureId: string) => {
    setFormData({
      ...formData,
      features: formData.features.includes(featureId)
        ? formData.features.filter((f) => f !== featureId)
        : [...formData.features, featureId],
    });
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(formData.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-900 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/websites"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-white dark:hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                AI Website Builder
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Yapay zeka ile dakikalar içinde profesyonel web sitenizi oluşturun
              </p>
            </div>
            {generationComplete && (
              <button
                onClick={() => router.push("/websites/new-site/editor")}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Editöre Git
              </button>
            )}
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[
                { num: 1, name: "İşletme Türü" },
                { num: 2, name: "Tasarım" },
                { num: 3, name: "İçerik" },
                { num: 4, name: "Oluştur" },
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                        s.num < step
                          ? "bg-green-500 text-white"
                          : s.num === step
                          ? "bg-purple-600 text-white ring-4 ring-purple-200 dark:ring-purple-900"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {s.num < step ? <CheckCircle className="w-5 h-5" /> : s.num}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${
                      s.num <= step ? "text-purple-600" : "text-slate-400"
                    }`}>
                      {s.name}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`w-full h-1 mx-2 rounded-full ${
                      s.num < step ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                    }`} style={{ width: "60px" }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Business Type */}
          {step === 1 && (
            <Card className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Hangi Tür Web Sitesi Oluşturmak İstiyorsunuz?
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  İşletme türünüzü seçin, AI sizin için en uygun şablonu hazırlasın
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {businessTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.businessType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setFormData({ ...formData, businessType: type.id })}
                      className={`p-5 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:shadow-md bg-white dark:bg-slate-800"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                        isSelected ? "bg-purple-100 dark:bg-purple-900/50" : "bg-slate-100 dark:bg-slate-700"
                      }`}>
                        <Icon className={`w-6 h-6 ${isSelected ? "text-purple-600" : "text-slate-600 dark:text-slate-400"}`} />
                      </div>
                      <p className={`font-semibold ${isSelected ? "text-purple-700 dark:text-purple-300" : "text-slate-900 dark:text-white"}`}>
                        {type.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.businessType}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  Devam Et
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </Card>
          )}

          {/* Step 2: Design */}
          {step === 2 && (
            <Card className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Tasarım Tercihleriniz
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Renk teması ve stil seçin
                </p>
              </div>

              {/* Color Scheme */}
              <div className="mb-8">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  Renk Paleti
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {colorSchemes.map((scheme) => {
                    const isSelected = formData.colorScheme === scheme.id;
                    return (
                      <button
                        key={scheme.id}
                        onClick={() => setFormData({ ...formData, colorScheme: scheme.id })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-purple-500 shadow-lg"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        } bg-white dark:bg-slate-800`}
                      >
                        <div className="flex gap-2 mb-3">
                          {scheme.colors.map((color, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-8 rounded-lg ${i === 0 ? "rounded-l-lg" : ""} ${i === 2 ? "rounded-r-lg" : ""}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{scheme.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{scheme.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Style */}
              <div className="mb-8">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-purple-500" />
                  Tasarım Stili
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {styleOptions.map((style) => {
                    const isSelected = formData.style === style.id;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setFormData({ ...formData, style: style.id })}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          isSelected
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800"
                        }`}
                      >
                        <p className={`font-medium text-sm ${isSelected ? "text-purple-700 dark:text-purple-300" : "text-slate-700 dark:text-slate-300"}`}>
                          {style.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Geri
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.colorScheme}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-semibold rounded-lg"
                >
                  Devam Et
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </Card>
          )}

          {/* Step 3: Content */}
          {step === 3 && (
            <Card className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Site İçeriği ve Ayarlar
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Siteniz hakkında detaylı bilgi verin
                </p>
              </div>

              <div className="space-y-6">
                {/* Site Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Site / İşletme Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    placeholder="Örn: Acme Teknoloji"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Pages */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sayfalar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {pageOptions.map((page) => {
                      const isSelected = formData.pages.includes(page.id);
                      return (
                        <button
                          key={page.id}
                          onClick={() => togglePage(page.id)}
                          disabled={page.required}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            isSelected
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-500"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-transparent hover:border-slate-300"
                          } ${page.required ? "cursor-not-allowed opacity-75" : ""}`}
                        >
                          {page.name}
                          {page.required && <span className="text-xs ml-1">(Zorunlu)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Özellikler
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {featureOptions.map((feature) => {
                      const isSelected = formData.features.includes(feature.id);
                      return (
                        <button
                          key={feature.id}
                          onClick={() => toggleFeature(feature.id)}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                            isSelected
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800"
                          }`}
                        >
                          <feature.icon className={`w-4 h-4 ${isSelected ? "text-purple-600" : "text-slate-400"}`} />
                          <span className={`text-sm font-medium ${isSelected ? "text-purple-700 dark:text-purple-300" : "text-slate-700 dark:text-slate-300"}`}>
                            {feature.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      AI'ya Özel Talimat (Opsiyonel)
                    </label>
                    <button
                      onClick={copyPrompt}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                      disabled={!formData.prompt}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Kopyalandı" : "Kopyala"}
                    </button>
                  </div>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    placeholder="Sitenizde ne tür içerikler olmasını istersiniz? AI'ya detaylı talimat verin..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />

                  {/* Sample Prompts */}
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Örnek promptlar:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {samplePrompts.slice(0, 3).map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSamplePrompt(prompt)}
                          className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors truncate max-w-xs"
                        >
                          {prompt.substring(0, 50)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced Options */}
                <div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                    Gelişmiş Ayarlar
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Hedef Kitle
                        </label>
                        <input
                          type="text"
                          value={formData.targetAudience}
                          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                          placeholder="Örn: 25-45 yaş arası profesyoneller"
                          className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Site Dili
                        </label>
                        <select
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                          className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        >
                          <option value="tr">Türkçe</option>
                          <option value="en">English</option>
                          <option value="de">Deutsch</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Geri
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!formData.siteName}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-semibold rounded-lg"
                >
                  Devam Et
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </Card>
          )}

          {/* Step 4: Generate */}
          {step === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary & Generate */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                  Özet
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">İşletme Türü</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {businessTypes.find(t => t.id === formData.businessType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Renk Teması</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {colorSchemes.find(c => c.id === formData.colorScheme)?.colors.slice(0, 2).map((color, i) => (
                          <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {colorSchemes.find(c => c.id === formData.colorScheme)?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Stil</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {styleOptions.find(s => s.id === formData.style)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Site Adı</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formData.siteName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Sayfalar</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formData.pages.length} sayfa</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500 dark:text-slate-400">Özellikler</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formData.features.length > 0 ? `${formData.features.length} özellik` : "Seçilmedi"}
                    </span>
                  </div>
                </div>

                {!isGenerating && !generationComplete && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setStep(3)}
                      className="w-full px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <ArrowLeft className="w-4 h-4 inline mr-1" />
                      Düzenle
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-purple-500/30"
                    >
                      <Wand2 className="w-6 h-6" />
                      AI ile Web Sitesi Oluştur
                    </button>
                  </div>
                )}

                {isGenerating && (
                  <div className="space-y-4">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-600">{currentAiMessage}</span>
                        <span className="text-sm font-medium text-purple-600">{generationProgress}%</span>
                      </div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>AI sitenizi oluşturuyor...</span>
                    </div>
                  </div>
                )}

                {generationComplete && (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Site Başarıyla Oluşturuldu!</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Editöre giderek düzenleme yapabilirsiniz.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Önizle
                      </button>
                      <button
                        onClick={() => router.push("/websites/new-site/editor")}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
                      >
                        <PenTool className="w-4 h-4" />
                        Düzenle
                      </button>
                    </div>
                  </div>
                )}
              </Card>

              {/* AI Chat */}
              <Card className="p-6 flex flex-col h-[500px]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">AI Asistan</h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Site oluşturulduktan sonra AI ile sohbet edebilir, değişiklik talep edebilirsiniz.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                            msg.role === "user"
                              ? "bg-purple-600 text-white rounded-br-none"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="AI'ya talimat verin..."
                    disabled={!generationComplete}
                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-full focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || !generationComplete}
                    className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-full"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </Card>
            </div>
          )}

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Önizleme</h3>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      {[
                        { id: "desktop" as DeviceType, icon: Desktop, width: "w-full" },
                        { id: "tablet" as DeviceType, icon: Tablet, width: "w-[768px]" },
                        { id: "mobile" as DeviceType, icon: Smartphone, width: "w-[375px]" },
                      ].map((device) => (
                        <button
                          key={device.id}
                          onClick={() => setPreviewDevice(device.id)}
                          className={`p-2 rounded-md transition-colors ${
                            previewDevice === device.id
                              ? "bg-white dark:bg-slate-700 shadow-sm"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          <device.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-800 overflow-auto h-[calc(90vh-80px)] flex justify-center">
                  <div
                    className={`bg-white dark:bg-slate-900 shadow-2xl transition-all duration-300 ${
                      previewDevice === "desktop" ? "w-full" : previewDevice === "tablet" ? "w-[768px]" : "w-[375px]"
                    }`}
                    style={{ minHeight: "600px" }}
                  >
                    {/* Mock Preview Content */}
                    <div className="p-8">
                      <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg mb-8 flex items-center px-4">
                        <div className="w-32 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="flex-1" />
                        <div className="flex gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                          ))}
                        </div>
                      </div>
                      <div className="text-center mb-12">
                        <div className="w-3/4 h-12 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-4" />
                        <div className="w-1/2 h-6 bg-slate-100 dark:bg-slate-800 rounded mx-auto" />
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
