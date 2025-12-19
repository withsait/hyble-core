"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@hyble/ui";
import {
  Search, Star, Eye, ShoppingCart, Filter, Grid3X3, List, Loader2,
  Monitor, X, ChevronDown, ArrowUpDown, Check, Layout, Sparkles,
  Code, Palette, Zap, Shield, Globe, Rocket, Store, FileText,
  Briefcase, Camera, Coffee, Heart, Building2, GraduationCap,
  Stethoscope, Home, Dumbbell, Play, ArrowRight, Package,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.hyble.co";

// Template kategorileri
const templateCategories = [
  { id: "all", name: "Tumu", icon: Layout, count: 0 },
  { id: "business", name: "Isletme", icon: Building2, count: 0 },
  { id: "ecommerce", name: "E-Ticaret", icon: Store, count: 0 },
  { id: "portfolio", name: "Portfolyo", icon: Briefcase, count: 0 },
  { id: "blog", name: "Blog", icon: FileText, count: 0 },
  { id: "landing", name: "Landing Page", icon: Rocket, count: 0 },
  { id: "saas", name: "SaaS", icon: Code, count: 0 },
  { id: "restaurant", name: "Restoran", icon: Coffee, count: 0 },
  { id: "healthcare", name: "Saglik", icon: Stethoscope, count: 0 },
  { id: "education", name: "Egitim", icon: GraduationCap, count: 0 },
  { id: "realestate", name: "Emlak", icon: Home, count: 0 },
  { id: "fitness", name: "Fitness", icon: Dumbbell, count: 0 },
  { id: "photography", name: "Fotografci", icon: Camera, count: 0 },
  { id: "nonprofit", name: "STK", icon: Heart, count: 0 },
];

// Mock template data
const mockTemplates = [
  {
    id: "1",
    slug: "startup-landing",
    name: "Startup Landing",
    description: "Modern startup ve SaaS sirketleri icin profesyonel landing page sablonu",
    category: "saas",
    price: 0,
    isPremium: false,
    thumbnail: "/templates/startup-landing.jpg",
    demoUrl: "https://demo.hyble.co/startup-landing",
    features: ["Responsive", "Dark Mode", "Animations", "SEO Ready"],
    rating: 4.8,
    reviewCount: 124,
    downloads: 2340,
    tags: ["startup", "saas", "modern", "minimal"],
  },
  {
    id: "2",
    slug: "ecommerce-pro",
    name: "E-Commerce Pro",
    description: "Tam donanimli e-ticaret sablonu. Urun listesi, sepet, odeme sayfasi dahil.",
    category: "ecommerce",
    price: 49,
    isPremium: true,
    thumbnail: "/templates/ecommerce-pro.jpg",
    demoUrl: "https://demo.hyble.co/ecommerce-pro",
    features: ["Responsive", "Cart System", "Payment Ready", "Multi-language"],
    rating: 4.9,
    reviewCount: 89,
    downloads: 1560,
    tags: ["ecommerce", "shop", "store", "retail"],
  },
  {
    id: "3",
    slug: "portfolio-minimal",
    name: "Portfolio Minimal",
    description: "Yaratici profesyoneller icin minimalist portfolyo sablonu",
    category: "portfolio",
    price: 0,
    isPremium: false,
    thumbnail: "/templates/portfolio-minimal.jpg",
    demoUrl: "https://demo.hyble.co/portfolio-minimal",
    features: ["Responsive", "Gallery", "Contact Form", "Animations"],
    rating: 4.7,
    reviewCount: 156,
    downloads: 3120,
    tags: ["portfolio", "creative", "minimal", "artist"],
  },
  {
    id: "4",
    slug: "restaurant-deluxe",
    name: "Restaurant Deluxe",
    description: "Restoran ve kafeler icin luks tasarimli sablon. Menu, rezervasyon dahil.",
    category: "restaurant",
    price: 39,
    isPremium: true,
    thumbnail: "/templates/restaurant-deluxe.jpg",
    demoUrl: "https://demo.hyble.co/restaurant-deluxe",
    features: ["Menu System", "Reservation", "Gallery", "Location Map"],
    rating: 4.8,
    reviewCount: 67,
    downloads: 890,
    tags: ["restaurant", "food", "cafe", "menu"],
  },
  {
    id: "5",
    slug: "corporate-business",
    name: "Corporate Business",
    description: "Kurumsal sirketler icin profesyonel web sitesi sablonu",
    category: "business",
    price: 59,
    isPremium: true,
    thumbnail: "/templates/corporate-business.jpg",
    demoUrl: "https://demo.hyble.co/corporate-business",
    features: ["Multi-page", "Team Section", "Services", "Blog"],
    rating: 4.9,
    reviewCount: 203,
    downloads: 4560,
    tags: ["corporate", "business", "professional", "company"],
  },
  {
    id: "6",
    slug: "blog-starter",
    name: "Blog Starter",
    description: "Icerik ureticileri icin SEO odakli blog sablonu",
    category: "blog",
    price: 0,
    isPremium: false,
    thumbnail: "/templates/blog-starter.jpg",
    demoUrl: "https://demo.hyble.co/blog-starter",
    features: ["SEO Ready", "Categories", "Comments", "Newsletter"],
    rating: 4.6,
    reviewCount: 178,
    downloads: 5670,
    tags: ["blog", "content", "writer", "news"],
  },
  {
    id: "7",
    slug: "fitness-studio",
    name: "Fitness Studio",
    description: "Spor salonlari ve fitness studyolari icin dinamik sablon",
    category: "fitness",
    price: 29,
    isPremium: true,
    thumbnail: "/templates/fitness-studio.jpg",
    demoUrl: "https://demo.hyble.co/fitness-studio",
    features: ["Class Schedule", "Trainers", "Membership", "Gallery"],
    rating: 4.7,
    reviewCount: 45,
    downloads: 670,
    tags: ["fitness", "gym", "sports", "health"],
  },
  {
    id: "8",
    slug: "real-estate-pro",
    name: "Real Estate Pro",
    description: "Emlak acenteleri icin profesyonel ilan ve portfoy sablonu",
    category: "realestate",
    price: 69,
    isPremium: true,
    thumbnail: "/templates/real-estate-pro.jpg",
    demoUrl: "https://demo.hyble.co/real-estate-pro",
    features: ["Property Listing", "Search Filter", "Agent Profile", "Map View"],
    rating: 4.8,
    reviewCount: 92,
    downloads: 1230,
    tags: ["realestate", "property", "agent", "listing"],
  },
  {
    id: "9",
    slug: "education-academy",
    name: "Education Academy",
    description: "Egitim kurumlari ve online kurslar icin kapsamli sablon",
    category: "education",
    price: 49,
    isPremium: true,
    thumbnail: "/templates/education-academy.jpg",
    demoUrl: "https://demo.hyble.co/education-academy",
    features: ["Course Listing", "Instructor", "Events", "LMS Ready"],
    rating: 4.7,
    reviewCount: 78,
    downloads: 1890,
    tags: ["education", "school", "course", "learning"],
  },
  {
    id: "10",
    slug: "photography-studio",
    name: "Photography Studio",
    description: "Fotografcilar icin etkileyici portfolyo ve galeri sablonu",
    category: "photography",
    price: 0,
    isPremium: false,
    thumbnail: "/templates/photography-studio.jpg",
    demoUrl: "https://demo.hyble.co/photography-studio",
    features: ["Gallery Grid", "Lightbox", "Portfolio", "Contact"],
    rating: 4.9,
    reviewCount: 234,
    downloads: 4560,
    tags: ["photography", "gallery", "visual", "creative"],
  },
  {
    id: "11",
    slug: "healthcare-clinic",
    name: "Healthcare Clinic",
    description: "Saglik kuruluslari ve klinikler icin guven veren sablon",
    category: "healthcare",
    price: 59,
    isPremium: true,
    thumbnail: "/templates/healthcare-clinic.jpg",
    demoUrl: "https://demo.hyble.co/healthcare-clinic",
    features: ["Appointment", "Doctors", "Services", "Testimonials"],
    rating: 4.8,
    reviewCount: 56,
    downloads: 780,
    tags: ["healthcare", "medical", "clinic", "doctor"],
  },
  {
    id: "12",
    slug: "nonprofit-charity",
    name: "Nonprofit Charity",
    description: "Vakiflar ve sivil toplum kuruluslari icin etkileyici sablon",
    category: "nonprofit",
    price: 0,
    isPremium: false,
    thumbnail: "/templates/nonprofit-charity.jpg",
    demoUrl: "https://demo.hyble.co/nonprofit-charity",
    features: ["Donation", "Events", "Volunteers", "Causes"],
    rating: 4.6,
    reviewCount: 89,
    downloads: 1230,
    tags: ["nonprofit", "charity", "ngo", "donation"],
  },
];

const sortOptions = [
  { value: "popular", label: "Populer" },
  { value: "newest", label: "En Yeni" },
  { value: "rating", label: "En Yuksek Puan" },
  { value: "price-asc", label: "Fiyat: Dusukten Yuksege" },
  { value: "price-desc", label: "Fiyat: Yuksekten Dusuge" },
];

function TemplatesContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [templates, setTemplates] = useState(mockTemplates);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popular");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "premium">(
    (searchParams.get("price") as any) || "all"
  );

  // Filter templates
  useEffect(() => {
    let filtered = [...mockTemplates];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Price filter
    if (priceFilter === "free") {
      filtered = filtered.filter(t => t.price === 0);
    } else if (priceFilter === "premium") {
      filtered = filtered.filter(t => t.price > 0);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        // Mock - in production, use createdAt
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      default: // popular
        filtered.sort((a, b) => b.downloads - a.downloads);
    }

    setTemplates(filtered);
  }, [searchQuery, selectedCategory, sortBy, priceFilter]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              {mockTemplates.length}+ Profesyonel Sablon
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Web Sitesi Sablonlari
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Profesyonel tasarimcilar tarafindan hazirlanan, production-ready sablonlar.
              Tek tikla kurulum, kolay ozellestirme.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Sablon ara... (orn: e-ticaret, landing page, blog)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* AI Create CTA */}
          <div className="flex justify-center mt-6">
            <Link
              href="/websites/new/ai"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              AI ile Ozel Sablon Olustur
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 min-w-max">
            {templateCategories.map((cat) => {
              const Icon = cat.icon;
              const count = cat.id === "all"
                ? mockTemplates.length
                : mockTemplates.filter(t => t.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                  <span className={`text-xs ${
                    selectedCategory === cat.id ? "text-blue-200" : "text-slate-400"
                  }`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {templates.length} sablon bulundu
            </p>

            {/* Price Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              {[
                { value: "all", label: "Tumu" },
                { value: "free", label: "Ucretsiz" },
                { value: "premium", label: "Premium" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriceFilter(opt.value as any)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    priceFilter === opt.value
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">{sortOptions.find(s => s.value === sortBy)?.label}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between ${
                        sortBy === option.value ? "text-blue-600" : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Mode */}
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

        {/* Templates Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">Aramaniza uygun sablon bulunamadi</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setPriceFilter("all");
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}>
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all group ${
                  viewMode === "list" ? "flex flex-row" : ""
                }`}
              >
                {/* Preview Image */}
                <div className={`relative overflow-hidden ${
                  viewMode === "list" ? "w-64 flex-shrink-0" : "aspect-[16/10]"
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <Layout className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {template.price === 0 && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                        Ucretsiz
                      </span>
                    )}
                    {template.isPremium && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Link
                      href={`/templates/${template.slug}`}
                      className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-slate-100"
                    >
                      <Eye className="w-4 h-4" />
                      Incele
                    </Link>
                    <a
                      href={template.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4" />
                      Demo
                    </a>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-5 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">
                      {templateCategories.find(c => c.id === template.category)?.name}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{template.rating}</span>
                      <span className="text-xs text-slate-400">({template.reviewCount})</span>
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
                    {template.features.slice(0, 4).map((feature, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-baseline gap-1">
                      {template.price === 0 ? (
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          Ucretsiz
                        </span>
                      ) : (
                        <span className="text-xl font-bold text-slate-900 dark:text-white">
                          ${template.price}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {template.downloads.toLocaleString()} indirme
                      </span>
                      <Link
                        href={`/templates/${template.slug}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Kullan
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {templates.length > 0 && templates.length >= 12 && (
          <div className="text-center mt-8">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Daha Fazla Yukle
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Neden Hyble Sablonlari?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: "Hizli Kurulum",
                desc: "Tek tikla kurulum. Dakikalar icinde siteniz hazir.",
              },
              {
                icon: Palette,
                title: "Kolay Ozellestirme",
                desc: "Drag & drop editor ile istediginiz gibi duzenleyin.",
              },
              {
                icon: Globe,
                title: "SEO Optimize",
                desc: "Arama motorlarinda ust siralarda yer alin.",
              },
              {
                icon: Shield,
                title: "Omur Boyu Destek",
                desc: "Premium sablonlarda sinirsiZ guncelleme ve destek.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Kendi Sablonunuzu Mu Olusturmak Istiyorsunuz?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            AI destekli web sitesi olusturucumuz ile dakikalar icinde profesyonel bir site oluturun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/websites/new/ai"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              AI ile Olustur
            </Link>
            <Link
              href="/freelancers"
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
            >
              Freelancer'a Yaptir
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    }>
      <TemplatesContent />
    </Suspense>
  );
}
