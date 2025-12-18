"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Layout, ShoppingCart, Rocket, Package, ChevronRight,
  Search, Star, Eye, Download, Code, Palette, Zap,
  Shield, CheckCircle, ArrowRight, Filter, Grid3X3, List
} from "lucide-react";

// Şablon kategorileri
const templateCategories = [
  {
    slug: "website-templates",
    name: "Web Sitesi Şablonları",
    description: "Kurumsal ve kişisel web siteleri",
    icon: Layout,
    count: 12,
  },
  {
    slug: "ecommerce",
    name: "E-ticaret Şablonları",
    description: "Online mağaza çözümleri",
    icon: ShoppingCart,
    count: 8,
  },
  {
    slug: "landing-pages",
    name: "Landing Page",
    description: "Dönüşüm odaklı sayfalar",
    icon: Rocket,
    count: 15,
  },
  {
    slug: "saas-templates",
    name: "SaaS Şablonları",
    description: "Yazılım ürünleri için",
    icon: Code,
    count: 6,
  },
];

// Öne çıkan şablonlar
const featuredTemplates = [
  {
    slug: "starter-business-website",
    name: "Business Starter",
    description: "Küçük işletmeler için profesyonel web sitesi şablonu. SEO optimize, responsive tasarım.",
    category: "Web Sitesi",
    price: 49,
    originalPrice: 79,
    rating: 4.8,
    reviews: 124,
    sales: 1200,
    features: ["5 Sayfa", "SEO Optimize", "Responsive", "Dark Mode"],
    badge: "En Çok Satan",
  },
  {
    slug: "ecommerce-starter",
    name: "E-commerce Pro",
    description: "Modern e-ticaret şablonu. Stripe entegrasyonu, stok yönetimi, sipariş takibi.",
    category: "E-ticaret",
    price: 89,
    originalPrice: 129,
    rating: 4.9,
    reviews: 89,
    sales: 850,
    features: ["Ödeme Entegrasyonu", "Stok Takibi", "Sipariş Yönetimi", "Dashboard"],
    badge: "Popüler",
  },
  {
    slug: "saas-landing",
    name: "SaaS Landing Pro",
    description: "SaaS ürünleri için modern landing page. Yüksek dönüşüm oranı optimize.",
    category: "Landing Page",
    price: 39,
    originalPrice: 59,
    rating: 4.7,
    reviews: 156,
    sales: 2100,
    features: ["Pricing Table", "Feature Grid", "Testimonials", "FAQ"],
    badge: "Yeni",
  },
  {
    slug: "corporate-pro",
    name: "Corporate Pro",
    description: "Büyük firmalar için kurumsal web sitesi. Çoklu dil, blog sistemi dahil.",
    category: "Web Sitesi",
    price: 149,
    originalPrice: 199,
    rating: 4.9,
    reviews: 67,
    sales: 450,
    features: ["15+ Sayfa", "Blog Sistemi", "Çoklu Dil", "CMS Ready"],
  },
  {
    slug: "agency-starter",
    name: "Agency Template",
    description: "Dijital ajanslar için modern tasarım. Portfolio, case study sayfaları.",
    category: "Web Sitesi",
    price: 89,
    originalPrice: 119,
    rating: 4.6,
    reviews: 45,
    sales: 320,
    features: ["Case Study", "Team Section", "Animasyonlar", "Contact Form"],
  },
  {
    slug: "startup-landing",
    name: "Startup Landing",
    description: "Startuplar için tek sayfa landing. Hızlı, minimal ve etkileyici.",
    category: "Landing Page",
    price: 29,
    rating: 4.5,
    reviews: 234,
    sales: 3500,
    features: ["Tek Sayfa", "Animasyonlar", "Newsletter", "Social Proof"],
  },
];

// Teknoloji filtreleri
const techFilters = [
  { name: "Next.js", count: 24 },
  { name: "React", count: 18 },
  { name: "Tailwind CSS", count: 32 },
  { name: "TypeScript", count: 20 },
];

export default function StorePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Premium Şablonlar
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Profesyonel tasarımcılar tarafından hazırlanmış, production-ready şablonlar.
              Tek seferlik ödeme, ömür boyu erişim.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Şablon ara... (örn: e-ticaret, landing page, blog)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Kategoriler</h2>
            <Link
              href="/store/categories"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
            >
              Tümü <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templateCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/store/category/${category.slug}`}
                className="group"
              >
                <Card className="p-4 h-full border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                      <category.icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {category.count} şablon
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Templates */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Öne Çıkan Şablonlar</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">En popüler ve çok satan şablonlar</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                <Filter className="w-4 h-4" />
                Filtrele
              </button>
              <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-800">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid" ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-400"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded ${viewMode === "list" ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-400"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {featuredTemplates.map((template) => (
              <Link
                key={template.slug}
                href={`/store/${template.slug}`}
                className="group"
              >
                <Card className="overflow-hidden h-full border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all">
                  {/* Preview Image */}
                  <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <Package className="w-16 h-16 text-slate-300 dark:text-slate-600" />

                    {/* Badge */}
                    {template.badge && (
                      <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium ${
                        template.badge === "En Çok Satan"
                          ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400"
                          : template.badge === "Popüler"
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400"
                          : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                      }`}>
                        {template.badge}
                      </span>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <span className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Önizle
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {template.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {template.rating}
                        </span>
                        <span className="text-xs text-slate-400">({template.reviews})</span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {template.name}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.features.slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                        >
                          {feature}
                        </span>
                      ))}
                      {template.features.length > 3 && (
                        <span className="text-xs px-2 py-0.5 text-slate-400">
                          +{template.features.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Price & Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          €{template.price}
                        </span>
                        {template.originalPrice && (
                          <span className="text-sm text-slate-400 line-through">
                            €{template.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Download className="w-3.5 h-3.5" />
                        {template.sales.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/store/all"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Tüm Şablonları Gör
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack Filter */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Teknolojiye Göre</h2>
          <div className="flex flex-wrap gap-3">
            {techFilters.map((tech) => (
              <button
                key={tech.name}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {tech.name}
                <span className="ml-2 text-slate-400">({tech.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Templates */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-8">
            Neden Hyble Şablonları?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: Code,
                title: "Clean Code",
                desc: "TypeScript, best practices ve modern standartlarla yazılmış temiz kod.",
              },
              {
                icon: Palette,
                title: "Özelleştirilebilir",
                desc: "Tailwind CSS ile kolay özelleştirme. Renkler, fontlar, layout.",
              },
              {
                icon: Zap,
                title: "Yüksek Performans",
                desc: "Lighthouse 95+ skor. Hızlı yükleme, optimize edilmiş assets.",
              },
              {
                icon: Shield,
                title: "Ömür Boyu Güncelleme",
                desc: "Tek seferlik ödeme, ömür boyu güncelleme ve destek.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Cloud hosting mi arıyorsunuz?
          </h2>
          <p className="text-slate-400 mb-6">
            VPS sunucular, web hosting ve managed database çözümleri için Cloud sayfamızı ziyaret edin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cloud"
              className="px-6 py-2.5 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cloud Çözümleri
            </Link>
            <Link
              href="/contact"
              className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Özel Proje Teklifi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
