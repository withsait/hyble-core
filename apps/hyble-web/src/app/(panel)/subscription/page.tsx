"use client";

import { useState } from "react";
import { Card } from "@hyble/ui";
import {
  CreditCard,
  Check,
  X,
  Crown,
  Zap,
  Star,
  ArrowRight,
  Plus,
  Receipt,
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Shield,
  Globe,
  Server,
  Users,
  BarChart3,
  Sparkles,
  Gift,
  Percent,
  Clock,
  ChevronRight,
  ExternalLink,
  Building2,
  Rocket,
  CheckCircle,
  ArrowUpRight,
  Layers,
  Mail,
  Phone,
  MessageSquare,
  Database,
} from "lucide-react";

// Plan verileri
const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Kişisel projeler ve küçük web siteleri için",
    price: 9,
    yearlyPrice: 7,
    popular: false,
    features: [
      { name: "1 Web Sitesi", included: true },
      { name: "5 GB SSD Depolama", included: true },
      { name: "Ücretsiz SSL", included: true },
      { name: "Hyble Alt Alan Adı", included: true },
      { name: "Temel SEO Araçları", included: true },
      { name: "7/24 Destek (E-posta)", included: true },
      { name: "Özel Domain", included: false },
      { name: "E-ticaret Özellikleri", included: false },
      { name: "Gelişmiş Analytics", included: false },
      { name: "White-Label", included: false },
    ],
    cta: "Başla",
    icon: Zap,
    color: "blue",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Büyüyen işletmeler ve profesyoneller için",
    price: 29,
    yearlyPrice: 24,
    popular: true,
    features: [
      { name: "5 Web Sitesi", included: true },
      { name: "25 GB SSD Depolama", included: true },
      { name: "Ücretsiz SSL", included: true },
      { name: "Özel Domain Bağlama", included: true },
      { name: "Gelişmiş SEO Araçları", included: true },
      { name: "7/24 Öncelikli Destek", included: true },
      { name: "E-ticaret (100 Ürün)", included: true },
      { name: "Gelişmiş Analytics", included: true },
      { name: "Form Builder", included: true },
      { name: "White-Label", included: false },
    ],
    cta: "Yükselt",
    icon: Star,
    color: "amber",
  },
  {
    id: "business",
    name: "Business",
    description: "Ajanslar ve büyük işletmeler için",
    price: 79,
    yearlyPrice: 66,
    popular: false,
    features: [
      { name: "Sınırsız Web Sitesi", included: true },
      { name: "100 GB SSD Depolama", included: true },
      { name: "Ücretsiz SSL (Wildcard)", included: true },
      { name: "Sınırsız Domain", included: true },
      { name: "Tüm SEO Araçları", included: true },
      { name: "Öncelikli VIP Destek", included: true },
      { name: "E-ticaret (Sınırsız)", included: true },
      { name: "Gelişmiş Analytics + Raporlar", included: true },
      { name: "White-Label Branding", included: true },
      { name: "API Erişimi", included: true },
    ],
    cta: "İletişime Geç",
    icon: Crown,
    color: "purple",
  },
];

// Ek özellikler (Upsell)
const addons = [
  {
    id: "extra-storage",
    name: "Ek Depolama",
    description: "50 GB ek SSD depolama alanı",
    price: 5,
    period: "ay",
    icon: Database,
    color: "blue",
    benefits: ["Yüksek hızlı SSD", "Otomatik yedekleme", "CDN desteği"],
  },
  {
    id: "extra-sites",
    name: "Ek Web Sitesi",
    description: "5 ek web sitesi oluşturma hakkı",
    price: 10,
    period: "ay",
    icon: Globe,
    color: "green",
    benefits: ["Sınırsız sayfa", "Özel şablon", "Alt domain"],
  },
  {
    id: "priority-support",
    name: "VIP Destek",
    description: "Telefon desteği ve öncelikli yanıt",
    price: 15,
    period: "ay",
    icon: Phone,
    color: "amber",
    benefits: ["1 saat yanıt garantisi", "Telefon desteği", "Özel hesap yöneticisi"],
  },
  {
    id: "advanced-analytics",
    name: "Premium Analytics",
    description: "Detaylı analitik ve özel raporlar",
    price: 12,
    period: "ay",
    icon: BarChart3,
    color: "purple",
    benefits: ["Gerçek zamanlı veriler", "Özel raporlar", "Dışa aktarma"],
  },
  {
    id: "ai-content",
    name: "AI İçerik Paketi",
    description: "Aylık 1000 AI içerik üretimi kredisi",
    price: 20,
    period: "ay",
    icon: Sparkles,
    color: "pink",
    benefits: ["GPT-4 destekli", "SEO optimizasyonu", "Çoklu dil"],
  },
  {
    id: "backup-pro",
    name: "Pro Yedekleme",
    description: "Saatlik yedekleme ve 90 gün arşiv",
    price: 8,
    period: "ay",
    icon: Shield,
    color: "cyan",
    benefits: ["Saatlik yedekleme", "90 gün arşiv", "Tek tık geri yükleme"],
  },
  {
    id: "email-marketing",
    name: "E-posta Pazarlama",
    description: "Aylık 10.000 e-posta gönderimi",
    price: 15,
    period: "ay",
    icon: Mail,
    color: "indigo",
    benefits: ["Drag & drop editör", "A/B testi", "Otomasyon"],
  },
  {
    id: "live-chat",
    name: "Canlı Destek Widget",
    description: "Web sitenize canlı sohbet ekleyin",
    price: 10,
    period: "ay",
    icon: MessageSquare,
    color: "emerald",
    benefits: ["Sınırsız sohbet", "Chatbot entegrasyonu", "Mobil uygulama"],
  },
];

// Aktif abonelik
const currentSubscription = {
  plan: "professional",
  status: "active",
  startDate: "2024-10-01",
  nextBillingDate: "2025-01-01",
  amount: 29,
  billingCycle: "monthly",
  addons: ["extra-storage"],
};

// Kullanım verileri
const usageData = {
  websites: { used: 3, total: 5 },
  storage: { used: 18.5, total: 75 },
  bandwidth: { used: 45, total: null },
  products: { used: 42, total: 100 },
  forms: { used: 12, total: 50 },
  emailSent: { used: 2340, total: 5000 },
};

type TabType = "overview" | "plans" | "addons" | "usage";

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null);

  const tabs = [
    { id: "overview" as TabType, name: "Genel Bakış", icon: Layers },
    { id: "plans" as TabType, name: "Planlar", icon: Crown },
    { id: "addons" as TabType, name: "Ek Özellikler", icon: Plus },
    { id: "usage" as TabType, name: "Kullanım", icon: BarChart3 },
  ];

  const currentPlan = plans.find((p) => p.id === currentSubscription.plan);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600", border: "border-blue-500" },
      green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600", border: "border-green-500" },
      amber: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600", border: "border-amber-500" },
      purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600", border: "border-purple-500" },
      pink: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600", border: "border-pink-500" },
      cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600", border: "border-cyan-500" },
      indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600", border: "border-indigo-500" },
      emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600", border: "border-emerald-500" },
    };
    return colors[color] || colors.blue;
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Mevcut Plan */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              currentPlan?.color === "amber"
                ? "bg-amber-100 dark:bg-amber-900/30"
                : currentPlan?.color === "purple"
                ? "bg-purple-100 dark:bg-purple-900/30"
                : "bg-blue-100 dark:bg-blue-900/30"
            }`}>
              {currentPlan && <currentPlan.icon className={`w-7 h-7 ${
                currentPlan?.color === "amber"
                  ? "text-amber-600"
                  : currentPlan?.color === "purple"
                  ? "text-purple-600"
                  : "text-blue-600"
              }`} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {currentPlan?.name} Plan
                </h2>
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Aktif
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {currentPlan?.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Sonraki fatura: {currentSubscription.nextBillingDate}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  ${currentSubscription.amount}/ay
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab("plans")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Planı Yükselt
            </button>
            <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              Yönet
            </button>
          </div>
        </div>
      </Card>

      {/* Hızlı Kullanım Özeti */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Web Siteleri</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {usageData.websites.used} / {usageData.websites.total}
          </p>
          <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(usageData.websites.used / usageData.websites.total) * 100}%` }}
            />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Depolama</span>
            <Database className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {usageData.storage.used} / {usageData.storage.total} GB
          </p>
          <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${(usageData.storage.used / usageData.storage.total) * 100}%` }}
            />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Ürünler</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {usageData.products.used} / {usageData.products.total}
          </p>
          <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${(usageData.products.used / usageData.products.total) * 100}%` }}
            />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Bant Genişliği</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{usageData.bandwidth.used} GB</p>
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Sınırsız
          </p>
        </Card>
      </div>

      {/* Özel Teklif Banner */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 border-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Yıllık Plana Geç, %20 Tasarruf Et!</h3>
              <p className="text-purple-100 text-sm mt-0.5">
                Yıllık faturalandırmaya geçerek 2 ay ücretsiz kullanım kazanın.
              </p>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 flex items-center gap-2 flex-shrink-0">
            Yıllık Plana Geç
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Aktif Eklentiler */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Aktif Eklentiler</h3>
          <button
            onClick={() => setActiveTab("addons")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            Tümünü Gör
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {currentSubscription.addons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSubscription.addons.map((addonId) => {
              const addon = addons.find((a) => a.id === addonId);
              if (!addon) return null;
              const colorClasses = getColorClasses(addon.color) || { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600", border: "border-blue-500" };
              return (
                <Card key={addon.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses.bg}`}>
                        <addon.icon className={`w-5 h-5 ${colorClasses.text}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{addon.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">${addon.price}/{addon.period}</p>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-600 text-sm font-medium">
                      İptal Et
                    </button>
                  </div>
                </Card>
              );
            })}
            <Card
              className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors"
              onClick={() => setActiveTab("addons")}
            >
              <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Yeni Eklenti Ekle</span>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Henüz aktif eklentiniz yok</p>
            <button
              onClick={() => setActiveTab("addons")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Eklentileri Keşfet
            </button>
          </Card>
        )}
      </div>

      {/* Önerilen Yükseltmeler */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Sizin İçin Önerilir</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">AI İçerik Paketi</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  İçeriklerinizi AI ile oluşturun
                </p>
                <p className="text-sm font-semibold text-amber-600 mt-2">$20/ay</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Premium Analytics</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Detaylı raporlar ve içgörüler
                </p>
                <p className="text-sm font-semibold text-purple-600 mt-2">$12/ay</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">Canlı Destek Widget</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Müşterilerinizle anlık iletişim
                </p>
                <p className="text-sm font-semibold text-emerald-600 mt-2">$10/ay</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderPlansTab = () => (
    <div className="space-y-6">
      {/* Fatura Döngüsü Seçimi */}
      <div className="flex items-center justify-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
          Aylık
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            billingCycle === "yearly" ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
          }`}
        >
          <span
            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              billingCycle === "yearly" ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
          Yıllık
        </span>
        {billingCycle === "yearly" && (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1">
            <Percent className="w-3 h-3" />
            %20 Tasarruf
          </span>
        )}
      </div>

      {/* Plan Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentSubscription.plan;
          const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.price;
          const colorClasses = getColorClasses(plan.color) || { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600", border: "border-blue-500" };

          return (
            <Card
              key={plan.id}
              className={`p-6 relative ${
                plan.popular ? "border-2 border-amber-500 dark:border-amber-400" : ""
              } ${isCurrentPlan ? "ring-2 ring-blue-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                    En Popüler
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                    Mevcut
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4 ${colorClasses.bg}`}>
                  <plan.icon className={`w-7 h-7 ${colorClasses.text}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">${price}</span>
                  <span className="text-slate-500 dark:text-slate-400">/ay</span>
                </div>
                {billingCycle === "yearly" && (
                  <p className="text-sm text-green-600 mt-1">
                    Yıllık ${price * 12} (${(plan.price - plan.yearlyPrice) * 12} tasarruf)
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    {feature.included ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    )}
                    <span className={feature.included ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrentPlan}
                className={`w-full py-3 font-semibold rounded-lg transition-colors ${
                  isCurrentPlan
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    : plan.popular
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900"
                }`}
              >
                {isCurrentPlan ? "Mevcut Planınız" : plan.cta}
              </button>
            </Card>
          );
        })}
      </div>

      {/* Kurumsal Plan */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 border-0">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Enterprise</h3>
              <p className="text-slate-300 mt-0.5">
                Özel çözümler, sınırsız kaynak ve özel destek
              </p>
            </div>
          </div>
          <button className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 flex items-center gap-2">
            İletişime Geç
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Plan Karşılaştırma */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Planları Karşılaştır</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Özellik</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Starter</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-amber-600">Professional</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">Web Siteleri</td>
                <td className="py-3 px-4 text-sm text-center text-slate-600 dark:text-slate-400">1</td>
                <td className="py-3 px-4 text-sm text-center font-medium text-amber-600">5</td>
                <td className="py-3 px-4 text-sm text-center text-slate-600 dark:text-slate-400">Sınırsız</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">Depolama</td>
                <td className="py-3 px-4 text-sm text-center text-slate-600 dark:text-slate-400">5 GB</td>
                <td className="py-3 px-4 text-sm text-center font-medium text-amber-600">25 GB</td>
                <td className="py-3 px-4 text-sm text-center text-slate-600 dark:text-slate-400">100 GB</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">E-ticaret Ürünleri</td>
                <td className="py-3 px-4 text-sm text-center text-slate-400">-</td>
                <td className="py-3 px-4 text-sm text-center font-medium text-amber-600">100</td>
                <td className="py-3 px-4 text-sm text-center text-slate-600 dark:text-slate-400">Sınırsız</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">Özel Domain</td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-amber-500 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">White-Label</td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                <td className="py-3 px-4 text-center"><CheckCircle className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderAddonsTab = () => (
    <div className="space-y-6">
      {/* Aktif Eklentiler */}
      {currentSubscription.addons.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Aktif Eklentileriniz</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSubscription.addons.map((addonId) => {
              const addon = addons.find((a) => a.id === addonId);
              if (!addon) return null;
              const colorClasses = getColorClasses(addon.color) || { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600", border: "border-blue-500" };
              return (
                <Card key={addon.id} className={`p-6 border-2 ${colorClasses.border}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses.bg}`}>
                        <addon.icon className={`w-6 h-6 ${colorClasses.text}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{addon.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{addon.description}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                      Aktif
                    </span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {addon.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ${addon.price}/{addon.period}
                    </span>
                    <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      İptal Et
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tüm Eklentiler */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Mevcut Eklentiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addons.filter(a => !currentSubscription.addons.includes(a.id)).map((addon) => {
            const colorClasses = getColorClasses(addon.color) || { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600", border: "border-blue-500" };

            return (
              <Card
                key={addon.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedAddon === addon.id ? `ring-2 ${colorClasses.border}` : ""
                }`}
                onClick={() => setSelectedAddon(selectedAddon === addon.id ? null : addon.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses.bg}`}>
                    <addon.icon className={`w-6 h-6 ${colorClasses.text}`} />
                  </div>
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-white">{addon.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{addon.description}</p>

                {selectedAddon === addon.id && (
                  <ul className="space-y-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {addon.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">${addon.price}</span>
                    <span className="text-slate-500 dark:text-slate-400">/{addon.period}</span>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Ekle
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Özel Paket Talebi */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">Özel İhtiyaçlarınız mı Var?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              İşletmenize özel bir paket oluşturmak için bizimle iletişime geçin.
            </p>
          </div>
          <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            İletişime Geç
          </button>
        </div>
      </Card>
    </div>
  );

  const renderUsageTab = () => (
    <div className="space-y-6">
      {/* Kullanım Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Web Siteleri", icon: Globe, color: "blue", ...usageData.websites },
          { label: "Depolama", icon: Database, color: "green", ...usageData.storage, unit: "GB" },
          { label: "E-ticaret Ürünleri", icon: Building2, color: "amber", ...usageData.products },
          { label: "Formlar", icon: Receipt, color: "purple", ...usageData.forms },
          { label: "E-posta Gönderimi", icon: Mail, color: "indigo", ...usageData.emailSent },
          { label: "Bant Genişliği", icon: TrendingUp, color: "pink", ...usageData.bandwidth, unit: "GB" },
        ].map((item, idx) => {
          const percentage = item.total ? (item.used / item.total) * 100 : 0;
          const isUnlimited = !item.total;
          const colorClasses = getColorClasses(item.color) || { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600", border: "border-blue-500" };

          return (
            <Card key={idx} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses.bg}`}>
                    <item.icon className={`w-5 h-5 ${colorClasses.text}`} />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">{item.label}</span>
                </div>
                {percentage > 80 && !isUnlimited && (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                )}
              </div>

              <div className="mb-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {item.used}
                  {item.unit && <span className="text-lg font-normal text-slate-500"> {item.unit}</span>}
                </span>
                {!isUnlimited && (
                  <span className="text-slate-500 dark:text-slate-400">
                    {" "}/ {item.total}{item.unit ? ` ${item.unit}` : ""}
                  </span>
                )}
              </div>

              {isUnlimited ? (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Sınırsız kullanım
                </p>
              ) : (
                <>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-orange-500" : colorClasses.text.replace("text-", "bg-")
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    %{percentage.toFixed(0)} kullanıldı
                  </p>
                </>
              )}

              {percentage > 80 && !isUnlimited && (
                <button className="mt-4 w-full py-2 border border-blue-500 text-blue-600 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm">
                  Limiti Artır
                </button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Kullanım Geçmişi */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Kullanım Geçmişi</h3>
        <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Kullanım grafiği burada gösterilecek</p>
          </div>
        </div>
      </Card>

      {/* Limit Uyarıları */}
      <Card className="p-6 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">Limit Yaklaşıyor</h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              E-posta gönderim limitinizin %47'sini kullandınız. Daha fazla e-posta göndermek için
              E-posta Pazarlama eklentisini değerlendirin.
            </p>
            <button className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg text-sm">
              Eklentiyi İncele
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Abonelik Yönetimi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Planınızı yönetin, eklentiler satın alın ve kullanımınızı takip edin
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "plans" && renderPlansTab()}
        {activeTab === "addons" && renderAddonsTab()}
        {activeTab === "usage" && renderUsageTab()}
      </div>
    </div>
  );
}
