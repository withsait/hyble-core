"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@hyble/ui";
import {
  Search, Star, MapPin, Clock, Check, ChevronDown, Loader2,
  X, ArrowUpDown, Grid3X3, List, MessageSquare, Globe, Briefcase,
  Code, Palette, PenTool, Camera, Video, BarChart3, Shield,
  Users, Award, Zap, ArrowRight, Filter, Package,
} from "lucide-react";

// Freelancer kategorileri
const freelancerCategories = [
  { id: "all", name: "Tum Kategoriler", icon: Users },
  { id: "web-development", name: "Web Gelistirme", icon: Code },
  { id: "web-design", name: "Web Tasarim", icon: Palette },
  { id: "ui-ux", name: "UI/UX Tasarim", icon: PenTool },
  { id: "graphic-design", name: "Grafik Tasarim", icon: Palette },
  { id: "photography", name: "Fotografcilik", icon: Camera },
  { id: "video", name: "Video Produksiyon", icon: Video },
  { id: "seo", name: "SEO & Dijital Pazarlama", icon: BarChart3 },
  { id: "content", name: "Icerik Yazarligi", icon: MessageSquare },
];

// Beceri etiketleri
const skillTags = [
  "React", "Next.js", "Vue.js", "Angular", "Node.js", "Python", "PHP", "WordPress",
  "Figma", "Adobe XD", "Photoshop", "Illustrator", "After Effects",
  "SEO", "Google Ads", "Facebook Ads", "Content Writing", "Copywriting",
];

// Mock freelancer data
const mockFreelancers = [
  {
    id: "1",
    slug: "ahmet-yilmaz",
    name: "Ahmet Yilmaz",
    title: "Senior Full-Stack Developer",
    avatar: "",
    location: "Istanbul, Turkiye",
    hourlyRate: 75,
    rating: 4.9,
    reviewCount: 156,
    completedProjects: 234,
    responseTime: "1 saat icinde",
    skills: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL"],
    categories: ["web-development"],
    bio: "10+ yillik deneyimli full-stack developer. Modern web teknolojileri ve olceklenebilir sistemler konusunda uzman.",
    languages: ["Turkce", "Ingilizce"],
    isVerified: true,
    isTopRated: true,
    portfolio: [
      { title: "E-Ticaret Platformu", image: "" },
      { title: "SaaS Dashboard", image: "" },
      { title: "Mobil Uygulama", image: "" },
    ],
  },
  {
    id: "2",
    slug: "ayse-kaya",
    name: "Ayse Kaya",
    title: "UI/UX Designer",
    avatar: "",
    location: "Ankara, Turkiye",
    hourlyRate: 60,
    rating: 4.8,
    reviewCount: 89,
    completedProjects: 156,
    responseTime: "2 saat icinde",
    skills: ["Figma", "Adobe XD", "Photoshop", "Illustrator", "Prototyping"],
    categories: ["ui-ux", "web-design"],
    bio: "Kullanici odakli tasarimlar yapan yaratici UI/UX designer. Marka kimligi ve dijital urun tasarimi konusunda uzman.",
    languages: ["Turkce", "Ingilizce", "Almanca"],
    isVerified: true,
    isTopRated: false,
    portfolio: [
      { title: "Fintech App Tasarimi", image: "" },
      { title: "E-Learning Platform", image: "" },
    ],
  },
  {
    id: "3",
    slug: "mehmet-demir",
    name: "Mehmet Demir",
    title: "WordPress & E-Commerce Expert",
    avatar: "",
    location: "Izmir, Turkiye",
    hourlyRate: 45,
    rating: 4.7,
    reviewCount: 203,
    completedProjects: 312,
    responseTime: "30 dakika icinde",
    skills: ["WordPress", "WooCommerce", "Shopify", "PHP", "MySQL"],
    categories: ["web-development"],
    bio: "300+ basarili proje ile WordPress ve e-ticaret cozumleri uzman. Hizli teslimat ve kaliteli is garantisi.",
    languages: ["Turkce"],
    isVerified: true,
    isTopRated: true,
    portfolio: [
      { title: "Online Magaza", image: "" },
      { title: "Kurumsal Site", image: "" },
      { title: "Blog Platformu", image: "" },
    ],
  },
  {
    id: "4",
    slug: "elif-ozturk",
    name: "Elif Ozturk",
    title: "Graphic Designer & Illustrator",
    avatar: "",
    location: "Bursa, Turkiye",
    hourlyRate: 40,
    rating: 4.9,
    reviewCount: 178,
    completedProjects: 245,
    responseTime: "1 saat icinde",
    skills: ["Illustrator", "Photoshop", "InDesign", "Logo Design", "Brand Identity"],
    categories: ["graphic-design"],
    bio: "Yaratici grafik tasarimci ve illustrator. Logo, marka kimligi ve pazarlama materyalleri konusunda uzman.",
    languages: ["Turkce", "Ingilizce"],
    isVerified: true,
    isTopRated: false,
    portfolio: [
      { title: "Marka Kimligi", image: "" },
      { title: "Logo Koleksiyonu", image: "" },
    ],
  },
  {
    id: "5",
    slug: "can-aksoy",
    name: "Can Aksoy",
    title: "SEO & Digital Marketing Specialist",
    avatar: "",
    location: "Istanbul, Turkiye",
    hourlyRate: 55,
    rating: 4.8,
    reviewCount: 134,
    completedProjects: 189,
    responseTime: "2 saat icinde",
    skills: ["SEO", "Google Ads", "Facebook Ads", "Analytics", "Content Strategy"],
    categories: ["seo"],
    bio: "Dijital pazarlama ve SEO uzmani. Organik trafik artisi ve donusum optimizasyonu konusunda kanitlanmis basari.",
    languages: ["Turkce", "Ingilizce"],
    isVerified: true,
    isTopRated: true,
    portfolio: [
      { title: "SEO Case Study", image: "" },
      { title: "PPC Kampanyasi", image: "" },
    ],
  },
  {
    id: "6",
    slug: "zeynep-aydin",
    name: "Zeynep Aydin",
    title: "Content Writer & Copywriter",
    avatar: "",
    location: "Antalya, Turkiye",
    hourlyRate: 35,
    rating: 4.6,
    reviewCount: 98,
    completedProjects: 167,
    responseTime: "3 saat icinde",
    skills: ["Content Writing", "Copywriting", "Blog Writing", "SEO Writing", "Social Media"],
    categories: ["content"],
    bio: "SEO odakli icerik yazari ve copywriter. Blog yazilari, web icerikleri ve sosyal medya metinleri.",
    languages: ["Turkce", "Ingilizce"],
    isVerified: false,
    isTopRated: false,
    portfolio: [
      { title: "Blog Yazilari", image: "" },
      { title: "Web Icerikleri", image: "" },
    ],
  },
];

const sortOptions = [
  { value: "recommended", label: "Onerilen" },
  { value: "rating", label: "En Yuksek Puan" },
  { value: "reviews", label: "En Cok Degerlendirme" },
  { value: "price-asc", label: "Fiyat: Dusukten Yuksege" },
  { value: "price-desc", label: "Fiyat: Yuksekten Dusuge" },
];

function FreelancersContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [freelancers, setFreelancers] = useState(mockFreelancers);
  const [loading, setLoading] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recommended");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [topRatedOnly, setTopRatedOnly] = useState(false);

  // Filter freelancers
  useEffect(() => {
    let filtered = [...mockFreelancers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(f => f.categories.includes(selectedCategory));
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(f =>
        selectedSkills.some(skill => f.skills.includes(skill))
      );
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter(f => f.isVerified);
    }

    // Top rated filter
    if (topRatedOnly) {
      filtered = filtered.filter(f => f.isTopRated);
    }

    // Sort
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "reviews":
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "price-asc":
        filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
      default: // recommended
        filtered.sort((a, b) => {
          const scoreA = a.rating * a.reviewCount + (a.isTopRated ? 1000 : 0);
          const scoreB = b.rating * b.reviewCount + (b.isTopRated ? 1000 : 0);
          return scoreB - scoreA;
        });
    }

    setFreelancers(filtered);
  }, [searchQuery, selectedCategory, sortBy, selectedSkills, verifiedOnly, topRatedOnly]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              {mockFreelancers.length}+ Dogrulanmis Freelancer
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Freelancer Marketplace
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Profesyonel freelancer'lar ile calisin. Web sitesi, tasarim, pazarlama ve daha fazlasi.
              Guvenli odeme, kaliteli is garantisi.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Freelancer veya beceri ara... (orn: React, Logo tasarim)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg"
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

          {/* Post Project CTA */}
          <div className="flex justify-center mt-6">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Briefcase className="w-5 h-5" />
              Proje Ilani Ver
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 min-w-max">
            {freelancerCategories.map((cat) => {
              const Icon = cat.icon;
              const count = cat.id === "all"
                ? mockFreelancers.length
                : mockFreelancers.filter(f => f.categories.includes(cat.id)).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                  <span className={`text-xs ${
                    selectedCategory === cat.id ? "text-emerald-200" : "text-slate-400"
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtreler
                </h2>
              </div>

              {/* Quick Filters */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Shield className="w-4 h-4 text-blue-500" />
                    Dogrulanmis
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={topRatedOnly}
                    onChange={(e) => setTopRatedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    Top Rated
                  </span>
                </label>
              </div>

              {/* Skills Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Beceriler</h3>
                <div className="flex flex-wrap gap-2">
                  {skillTags.slice(0, 12).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <button
                    onClick={() => setSelectedSkills([])}
                    className="text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    Temizle
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {freelancers.length} freelancer bulundu
              </p>

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
                            sortBy === option.value ? "text-emerald-600" : "text-slate-600 dark:text-slate-400"
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

            {/* Freelancers Grid */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : freelancers.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Aramaniza uygun freelancer bulunamadi</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedSkills([]);
                    setVerifiedOnly(false);
                    setTopRatedOnly(false);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              }`}>
                {freelancers.map((freelancer) => (
                  <Card
                    key={freelancer.id}
                    className="overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-xl transition-all"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {freelancer.name.split(" ").map(n => n[0]).join("")}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                              {freelancer.name}
                            </h3>
                            {freelancer.isVerified && (
                              <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" title="Dogrulanmis" />
                            )}
                            {freelancer.isTopRated && (
                              <Award className="w-4 h-4 text-amber-500 flex-shrink-0" title="Top Rated" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {freelancer.title}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {freelancer.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {freelancer.responseTime}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            ${freelancer.hourlyRate}
                          </p>
                          <p className="text-xs text-slate-500">/saat</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 py-3 border-y border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span className="font-semibold text-slate-900 dark:text-white">{freelancer.rating}</span>
                          <span className="text-sm text-slate-500">({freelancer.reviewCount})</span>
                        </div>
                        <div className="text-sm text-slate-500">
                          {freelancer.completedProjects} proje tamamlandi
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {freelancer.bio}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {freelancer.skills.slice(0, 5).map((skill, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          >
                            {skill}
                          </span>
                        ))}
                        {freelancer.skills.length > 5 && (
                          <span className="text-xs px-2 py-1 text-slate-400">
                            +{freelancer.skills.length - 5}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/freelancers/${freelancer.slug}`}
                          className="flex-1 py-2.5 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                        >
                          Profili Gor
                        </Link>
                        <button className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Nasil Calisir?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: Search,
                title: "Freelancer Bul",
                desc: "Ihtiyaciniza uygun freelancer'i arayin ve secin.",
              },
              {
                step: "2",
                icon: MessageSquare,
                title: "Iletisime Gec",
                desc: "Projenizi anlathn ve teklif alin.",
              },
              {
                step: "3",
                icon: Shield,
                title: "Guvenli Odeme",
                desc: "Escrow sistemi ile guvende odeme yapin.",
              },
              {
                step: "4",
                icon: Check,
                title: "Projeyi Tamamla",
                desc: "Isleri onaylayin ve degerlendirme yapin.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-emerald-200 dark:bg-emerald-800" />
                )}
                <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 relative z-10">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Freelancer Olmak Ister Misiniz?
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            Yeteneklerinizi sergileyin, musterilerle baglanti kurun ve kazanmaya baslayin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/become-freelancer"
              className="px-8 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Freelancer Ol
            </Link>
            <Link
              href="/projects/new"
              className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Proje Ilani Ver
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function FreelancersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    }>
      <FreelancersContent />
    </Suspense>
  );
}
