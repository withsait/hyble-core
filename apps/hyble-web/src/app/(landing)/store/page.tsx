"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@hyble/ui";
import {
  Layout, ShoppingCart, Rocket, Package,
  Search, Star, Eye, Code, Palette, Zap,
  Shield, ArrowRight, Filter, Grid3X3, List, Loader2,
  Monitor, X, SlidersHorizontal, ChevronDown,
  ArrowUpDown, Check, GitCompare
} from "lucide-react";
import { useCompare, MAX_COMPARE_ITEMS, CompareProduct } from "@/lib/compare-context";

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.hyble.co";

// Kategori ikonları
const categoryIcons: Record<string, typeof Layout> = {
  "website-templates": Layout,
  "ecommerce": ShoppingCart,
  "landing-pages": Rocket,
  "saas-templates": Code,
  "vps": Package,
  "web-hosting": Package,
  "game-servers": Package,
};

interface Product {
  id: string;
  slug: string;
  type: string;
  nameTr: string;
  nameEn: string;
  shortDescTr: string | null;
  shortDescEn: string | null;
  tags: string[];
  isFeatured: boolean;
  demoUrl: string | null;
  category: {
    id: string;
    nameTr: string;
    nameEn: string;
    slug: string;
  } | null;
  primaryImage: string | null;
  lowestPrice: number | null;
  basePrice: number | null;
  variantCount: number;
}

interface Category {
  id: string;
  nameTr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  productCount: number;
}

interface Filters {
  priceRange: { min: number; max: number };
  availableTags: string[];
  types: string[];
}

interface Pagination {
  offset: number;
  limit: number;
  hasMore: boolean;
}

const ITEMS_PER_PAGE = 12;

const sortOptions = [
  { value: "featured", label: "Öne Çıkan" },
  { value: "newest", label: "En Yeni" },
  { value: "price-asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price-desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "name", label: "İsme Göre (A-Z)" },
];

const typeLabels: Record<string, string> = {
  DIGITAL: "Dijital Ürün",
  SUBSCRIPTION: "Abonelik",
  BUNDLE: "Paket",
  SERVICE: "Hizmet",
};

function StoreContent() {
  const searchParams = useSearchParams();
  const { addItem: addToCompare, removeItem: removeFromCompare, isInCompare, itemCount: compareCount } = useCompare();

  // State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Filter state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get("featured") === "true");

  // Build URL params
  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedType) params.set("type", selectedType);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sortBy !== "featured") params.set("sort", sortBy);
    if (featuredOnly) params.set("featured", "true");
    params.set("limit", ITEMS_PER_PAGE.toString());
    return params;
  }, [searchQuery, selectedCategory, selectedType, selectedTags, minPrice, maxPrice, sortBy, featuredOnly]);

  // Fetch products
  const fetchProducts = useCallback(async (offset = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = buildParams();
      params.set("offset", offset.toString());

      const res = await fetch(`${API_BASE}/api/public/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();

      if (append) {
        setProducts(prev => [...prev, ...(data.products || [])]);
      } else {
        setProducts(data.products || []);
      }

      setCategories(data.categories || []);
      setFilters(data.filters || null);
      setPagination(data.pagination || null);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Ürünler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildParams]);

  // Initial load and filter changes
  useEffect(() => {
    fetchProducts(0, false);
  }, [fetchProducts]);

  // Update URL when filters change
  useEffect(() => {
    const params = buildParams();
    params.delete("limit");
    const newUrl = params.toString() ? `/store?${params.toString()}` : "/store";
    window.history.replaceState({}, "", newUrl);
  }, [buildParams]);

  // Load more
  const loadMore = () => {
    if (pagination && pagination.hasMore) {
      fetchProducts(pagination.offset + pagination.limit, true);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedType("");
    setSelectedTags([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("featured");
    setFeaturedOnly(false);
  };

  // Check if any filter is active
  const hasActiveFilters = searchQuery || selectedCategory || selectedType ||
    selectedTags.length > 0 || minPrice || maxPrice || featuredOnly;

  // Toggle tag
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

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
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-4 space-y-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtreler
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Temizle
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategori</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    Tümü
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.slug ? "" : cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>{cat.nameTr}</span>
                      <span className="text-xs text-slate-400">{cat.productCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Type */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Ürün Tipi</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedType("")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedType
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    Tümü
                  </button>
                  {filters?.types.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(selectedType === type ? "" : type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedType === type
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {typeLabels[type] || type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Fiyat Aralığı</h3>
                {filters && (
                  <p className="text-xs text-slate-500">
                    €{filters.priceRange.min.toFixed(0)} - €{filters.priceRange.max.toFixed(0)}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              </div>

              {/* Tags */}
              {filters && filters.availableTags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Etiketler</h3>
                  <div className="flex flex-wrap gap-2">
                    {filters.availableTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedTags.includes(tag)
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Only */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Sadece öne çıkan ürünler</span>
              </label>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filtreler
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {loading ? "Yükleniyor..." : `${total} ürün bulundu`}
                </p>
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

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                    Arama: {searchQuery}
                    <button onClick={() => setSearchQuery("")}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                    Kategori: {categories.find(c => c.slug === selectedCategory)?.nameTr}
                    <button onClick={() => setSelectedCategory("")}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedType && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                    Tip: {typeLabels[selectedType]}
                    <button onClick={() => setSelectedType("")}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                    #{tag}
                    <button onClick={() => toggleTag(tag)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                    Fiyat: €{minPrice || "0"} - €{maxPrice || "∞"}
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {featuredOnly && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-sm">
                    <Star className="w-3 h-3" /> Öne Çıkan
                    <button onClick={() => setFeaturedOnly(false)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Tümünü temizle
                </button>
              </div>
            )}

            {/* Products */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => fetchProducts()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">
                  {hasActiveFilters ? "Filtrelere uygun ürün bulunamadı" : "Henüz ürün bulunmuyor"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/store/${product.slug}`}
                      className="group"
                    >
                      <Card className="overflow-hidden h-full border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all">
                        {/* Preview Image */}
                        <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative overflow-hidden">
                          {product.primaryImage ? (
                            <img
                              src={product.primaryImage}
                              alt={product.nameTr}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                              <Package className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                            </>
                          )}

                          {/* Badge */}
                          {product.isFeatured && (
                            <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                              Öne Çıkan
                            </span>
                          )}

                          {/* Compare Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const compareProduct: CompareProduct = {
                                id: product.id,
                                slug: product.slug,
                                nameTr: product.nameTr,
                                nameEn: product.nameEn,
                                shortDescTr: product.shortDescTr,
                                shortDescEn: product.shortDescEn,
                                type: product.type,
                                category: product.category,
                                primaryImage: product.primaryImage,
                                lowestPrice: product.lowestPrice,
                                basePrice: product.basePrice,
                                tags: product.tags,
                                isFeatured: product.isFeatured,
                                demoUrl: product.demoUrl,
                                variantCount: product.variantCount,
                              };
                              if (isInCompare(product.id)) {
                                removeFromCompare(product.id);
                              } else if (compareCount < MAX_COMPARE_ITEMS) {
                                addToCompare(compareProduct);
                              }
                            }}
                            className={`absolute top-3 right-3 p-2 rounded-lg transition-all z-10 ${
                              isInCompare(product.id)
                                ? "bg-blue-600 text-white"
                                : "bg-white/90 text-slate-600 hover:bg-blue-600 hover:text-white"
                            } ${compareCount >= MAX_COMPARE_ITEMS && !isInCompare(product.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                            title={isInCompare(product.id) ? "Karşılaştırmadan Çıkar" : "Karşılaştırmaya Ekle"}
                          >
                            <GitCompare className="w-4 h-4" />
                          </button>

                          {/* Hover Actions */}
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <span className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium text-sm flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              İncele
                            </span>
                            {product.demoUrl && (
                              <Link
                                href={`/demo/${product.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-emerald-600 transition-colors"
                              >
                                <Monitor className="w-4 h-4" />
                                Demo
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              {product.category?.nameTr || "Genel"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {typeLabels[product.type] || product.type}
                            </span>
                          </div>

                          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {product.nameTr}
                          </h3>

                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                            {product.shortDescTr || product.shortDescEn || ""}
                          </p>

                          {/* Tags */}
                          {product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {product.tags.slice(0, 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                                >
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="text-xs px-2 py-0.5 text-slate-400">
                                  +{product.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Price */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-baseline gap-2">
                              {product.lowestPrice !== null ? (
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                  €{product.lowestPrice.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-500">Fiyat için tıklayın</span>
                              )}
                              {product.type === "SUBSCRIPTION" && (
                                <span className="text-sm text-slate-400">/ay</span>
                              )}
                            </div>
                            {product.variantCount > 1 && (
                              <span className="text-xs text-slate-500">
                                {product.variantCount} seçenek
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Load More */}
                {pagination?.hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          Daha Fazla Yükle
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Why Choose Our Templates */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-8">
            Neden Hyble?
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
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
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

export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    }>
      <StoreContent />
    </Suspense>
  );
}
