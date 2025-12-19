"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@hyble/ui";
import {
  Search, Globe, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  ArrowUp, ArrowDown, Minus, RefreshCw, ExternalLink, Loader2,
  FileText, Image, Link2, Clock, Zap, Shield, Eye, BarChart3,
  Target, Award, AlertCircle, ChevronRight, Download, Calendar,
  Smartphone, Monitor, Activity,
} from "lucide-react";

interface SeoScore {
  category: string;
  score: number;
  maxScore: number;
  status: "good" | "warning" | "error";
  items: {
    name: string;
    status: "pass" | "warning" | "fail";
    message: string;
    priority: "high" | "medium" | "low";
  }[];
}

interface WebVitals {
  lcp: { value: number; rating: "good" | "needs-improvement" | "poor" };
  fid: { value: number; rating: "good" | "needs-improvement" | "poor" };
  cls: { value: number; rating: "good" | "needs-improvement" | "poor" };
  fcp: { value: number; rating: "good" | "needs-improvement" | "poor" };
  ttfb: { value: number; rating: "good" | "needs-improvement" | "poor" };
}

// Mock SEO data
const mockSeoData = {
  overallScore: 78,
  lastAudit: "2024-01-15T10:30:00Z",
  webVitals: {
    lcp: { value: 2.1, rating: "good" as const },
    fid: { value: 45, rating: "good" as const },
    cls: { value: 0.12, rating: "needs-improvement" as const },
    fcp: { value: 1.2, rating: "good" as const },
    ttfb: { value: 380, rating: "good" as const },
  },
  lighthouse: {
    performance: 85,
    accessibility: 92,
    bestPractices: 88,
    seo: 95,
  },
  scores: [
    {
      category: "Meta Etiketler",
      score: 90,
      maxScore: 100,
      status: "good" as const,
      items: [
        { name: "Title Etiketi", status: "pass" as const, message: "Baslik etiketi mevcut ve uygun uzunlukta (55 karakter)", priority: "high" as const },
        { name: "Meta Description", status: "pass" as const, message: "Meta aciklama mevcut ve uygun uzunlukta (145 karakter)", priority: "high" as const },
        { name: "Open Graph Etiketleri", status: "warning" as const, message: "og:image etiketi eksik", priority: "medium" as const },
        { name: "Twitter Cards", status: "pass" as const, message: "Twitter card etiketleri dogru yapilandirilmis", priority: "low" as const },
      ],
    },
    {
      category: "Icerik Optimizasyonu",
      score: 75,
      maxScore: 100,
      status: "warning" as const,
      items: [
        { name: "H1 Etiketi", status: "pass" as const, message: "Sayfa tek bir H1 etiketi iceriyor", priority: "high" as const },
        { name: "Baslik Hiyerarsisi", status: "warning" as const, message: "H3 etiketi H2'den once kullanilmis", priority: "medium" as const },
        { name: "Alt Metinleri", status: "fail" as const, message: "3 gorsel alt metni eksik", priority: "high" as const },
        { name: "Kelime Sayisi", status: "pass" as const, message: "Sayfa yeterli icerik iceriyor (1,250 kelime)", priority: "medium" as const },
      ],
    },
    {
      category: "Teknik SEO",
      score: 85,
      maxScore: 100,
      status: "good" as const,
      items: [
        { name: "SSL Sertifikasi", status: "pass" as const, message: "Site HTTPS ile korunuyor", priority: "high" as const },
        { name: "Robots.txt", status: "pass" as const, message: "robots.txt dosyasi mevcut ve dogru yapilandirilmis", priority: "medium" as const },
        { name: "Sitemap.xml", status: "pass" as const, message: "XML sitemap mevcut ve Google'a gonderilmis", priority: "medium" as const },
        { name: "Canonical URL", status: "warning" as const, message: "Bazi sayfalarda canonical etiketi eksik", priority: "medium" as const },
      ],
    },
    {
      category: "Mobil Uyumluluk",
      score: 95,
      maxScore: 100,
      status: "good" as const,
      items: [
        { name: "Responsive Tasarim", status: "pass" as const, message: "Site tum cihazlarda duzgun goruntuyor", priority: "high" as const },
        { name: "Viewport Meta", status: "pass" as const, message: "Viewport etiketi dogru ayarlanmis", priority: "high" as const },
        { name: "Dokunma Hedefleri", status: "pass" as const, message: "Tum butonlar yeterli boyutta", priority: "medium" as const },
        { name: "Font Boyutu", status: "pass" as const, message: "Metin mobilde okunabilir boyutta", priority: "medium" as const },
      ],
    },
    {
      category: "Sayfa Hizi",
      score: 70,
      maxScore: 100,
      status: "warning" as const,
      items: [
        { name: "Gorsel Optimizasyonu", status: "warning" as const, message: "5 gorsel WebP formatina donusturulebilir", priority: "high" as const },
        { name: "JavaScript Boyutu", status: "warning" as const, message: "JS dosyalari 450KB, azaltilabilir", priority: "medium" as const },
        { name: "CSS Boyutu", status: "pass" as const, message: "CSS dosyalari optimize edilmis", priority: "medium" as const },
        { name: "Onbellek", status: "pass" as const, message: "Browser cache dogru yapilandirilmis", priority: "medium" as const },
      ],
    },
  ] as SeoScore[],
  keywords: [
    { keyword: "web hosting", position: 12, change: 3, volume: 8100 },
    { keyword: "website builder", position: 18, change: -2, volume: 5400 },
    { keyword: "cloud hosting", position: 25, change: 5, volume: 3200 },
    { keyword: "vps sunucu", position: 8, change: 0, volume: 2900 },
    { keyword: "domain satin al", position: 34, change: 7, volume: 4500 },
  ],
  pages: [
    { url: "/", title: "Ana Sayfa", score: 92, issues: 2 },
    { url: "/pricing", title: "Fiyatlar", score: 88, issues: 3 },
    { url: "/features", title: "Ozellikler", score: 85, issues: 4 },
    { url: "/blog", title: "Blog", score: 78, issues: 6 },
    { url: "/contact", title: "Iletisim", score: 95, issues: 1 },
  ],
};

export default function SeoPage() {
  const params = useParams();
  const websiteId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [seoData, setSeoData] = useState(mockSeoData);
  const [activeTab, setActiveTab] = useState<"overview" | "audit" | "keywords" | "pages">("overview");

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const runAudit = async () => {
    setRunning(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setRunning(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const getRatingColor = (rating: string) => {
    if (rating === "good") return "text-green-500 bg-green-50 dark:bg-green-900/20";
    if (rating === "needs-improvement") return "text-amber-500 bg-amber-50 dark:bg-amber-900/20";
    return "text-red-500 bg-red-50 dark:bg-red-900/20";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            SEO & Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Son tarama: {new Date(seoData.lastAudit).toLocaleDateString("tr-TR")}
          </p>
        </div>
        <button
          onClick={runAudit}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Tarama Yapiliyor...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              SEO Taramasi Baslat
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: "overview", label: "Genel Bakis", icon: BarChart3 },
          { id: "audit", label: "SEO Analizi", icon: Search },
          { id: "keywords", label: "Anahtar Kelimeler", icon: Target },
          { id: "pages", label: "Sayfalar", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Overall Score */}
            <Card className="p-6 col-span-1 md:col-span-2">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Genel SEO Skoru</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${seoData.overallScore * 3.52} 352`}
                      className={getScoreColor(seoData.overallScore)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(seoData.overallScore)}`}>
                      {seoData.overallScore}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Siteniz {seoData.overallScore >= 80 ? "iyi" : seoData.overallScore >= 60 ? "orta" : "dusuk"} performans gosteriyor
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-500">90+: Mukemmel</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-slate-500">70-89: Iyi</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-500">0-69: Gelistirilmeli</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Lighthouse Scores */}
            {Object.entries(seoData.lighthouse).map(([key, score]) => (
              <Card key={key} className="p-6">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 capitalize">
                  {key === "bestPractices" ? "En Iyi Uyg." : key === "seo" ? "SEO" : key}
                </h3>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
                  <span className="text-slate-400 mb-1">/100</span>
                </div>
                <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreBg(score)} rounded-full transition-all`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Core Web Vitals */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Core Web Vitals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { key: "lcp", label: "LCP", desc: "Largest Contentful Paint", unit: "s", good: "< 2.5s" },
                { key: "fid", label: "FID", desc: "First Input Delay", unit: "ms", good: "< 100ms" },
                { key: "cls", label: "CLS", desc: "Cumulative Layout Shift", unit: "", good: "< 0.1" },
                { key: "fcp", label: "FCP", desc: "First Contentful Paint", unit: "s", good: "< 1.8s" },
                { key: "ttfb", label: "TTFB", desc: "Time to First Byte", unit: "ms", good: "< 600ms" },
              ].map((metric) => {
                const data = seoData.webVitals[metric.key as keyof WebVitals];
                return (
                  <div
                    key={metric.key}
                    className={`p-4 rounded-lg ${getRatingColor(data.rating)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{metric.label}</span>
                      {data.rating === "good" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : data.rating === "needs-improvement" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    <p className="text-2xl font-bold">
                      {data.value}{metric.unit}
                    </p>
                    <p className="text-xs mt-1 opacity-75">{metric.desc}</p>
                    <p className="text-xs mt-1">Hedef: {metric.good}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">5</p>
                  <p className="text-sm text-slate-500">Indekslenen Sayfa</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">16</p>
                  <p className="text-sm text-slate-500">SEO Uyarisi</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">+15%</p>
                  <p className="text-sm text-slate-500">Organik Trafik</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">5</p>
                  <p className="text-sm text-slate-500">Takip Edilen Kelime</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {seoData.scores.map((category, idx) => (
            <Card key={idx} className="overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    category.status === "good"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                      : category.status === "warning"
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600"
                  }`}>
                    {category.status === "good" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : category.status === "warning" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{category.category}</h3>
                    <p className="text-sm text-slate-500">
                      {category.items.filter(i => i.status === "pass").length} / {category.items.length} basarili
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                    {category.score}
                  </span>
                  <span className="text-slate-400">/ {category.maxScore}</span>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {category.items.map((item, i) => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    {item.status === "pass" ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : item.status === "warning" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.message}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.priority === "high"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : item.priority === "medium"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}>
                      {item.priority === "high" ? "Yuksek" : item.priority === "medium" ? "Orta" : "Dusuk"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === "keywords" && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Anahtar Kelime Siralamasi</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Kelime Ekle
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Anahtar Kelime</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Siralama</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Degisim</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-500">Arama Hacmi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {seoData.keywords.map((kw, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900 dark:text-white">{kw.keyword}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                          kw.position <= 10
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : kw.position <= 30
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        }`}>
                          #{kw.position}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.change > 0 ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <ArrowUp className="w-4 h-4" />
                            {kw.change}
                          </span>
                        ) : kw.change < 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <ArrowDown className="w-4 h-4" />
                            {Math.abs(kw.change)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Minus className="w-4 h-4" />
                            0
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                        {kw.volume.toLocaleString()} / ay
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Pages Tab */}
      {activeTab === "pages" && (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white">Sayfa SEO Analizi</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {seoData.pages.map((page, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    page.score >= 90
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                      : page.score >= 70
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600"
                  }`}>
                    <span className="font-bold">{page.score}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{page.title}</p>
                    <p className="text-sm text-slate-500">{page.url}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {page.issues > 0 && (
                      <span className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {page.issues} sorun
                      </span>
                    )}
                    <button className="text-blue-600 hover:text-blue-700">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
