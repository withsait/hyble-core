"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/trpc";
import {
  Search,
  Calendar,
  Clock,
  ChevronRight,
  Tag,
  ArrowRight,
  Loader2,
  Filter,
  Star,
} from "lucide-react";

type PostVertical = "GENERAL" | "DIGITAL" | "STUDIOS";

const verticalConfig: Record<PostVertical, { label: string; color: string; bgColor: string }> = {
  GENERAL: { label: "Hyble", color: "text-sky-600", bgColor: "bg-sky-100 dark:bg-sky-900/30" },
  DIGITAL: { label: "Digital", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  STUDIOS: { label: "Studios", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
};

function formatDate(date: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const [verticalFilter, setVerticalFilter] = useState<PostVertical | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Fetch posts
  const { data: postsData, isLoading: postsLoading } = api.blog.listPublished.useQuery({
    limit: 20,
    vertical: verticalFilter !== "ALL" ? verticalFilter : undefined,
    tag: selectedTag || undefined,
    search: searchTerm || undefined,
  });

  // Fetch featured posts
  const { data: featuredPosts } = api.blog.getFeaturedForLanding.useQuery({ limit: 3 });

  // Fetch categories
  const { data: categories } = api.blog.listCategories.useQuery({});

  // Fetch all tags
  const { data: allTags } = api.blog.getAllTags.useQuery();

  const posts = postsData?.posts ?? [];
  const topTags = allTags?.slice(0, 10) ?? [];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Blog & İçerikler
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Dijital Dünyadan
              <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent"> Haberler</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Web geliştirme, oyun sunucuları ve dijital ürünler hakkında en güncel içerikler,
              rehberler ve ipuçları.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Yazılarda ara..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts && featuredPosts.length > 0 && !searchTerm && verticalFilter === "ALL" && !selectedTag && (
        <section className="py-12 border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Öne Çıkan Yazılar</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <article className="group bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                      {post.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.titleTr}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <span className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${verticalConfig[post.vertical as PostVertical]?.bgColor} ${verticalConfig[post.vertical as PostVertical]?.color}`}>
                            {verticalConfig[post.vertical as PostVertical]?.label}
                          </span>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                          {post.titleTr}
                        </h3>
                        {post.excerptTr && (
                          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                            {post.excerptTr}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readingTime} dk
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-8">
                {/* Vertical Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtrele
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: "ALL", label: "Tümü" },
                      { value: "GENERAL", label: "Genel" },
                      { value: "DIGITAL", label: "Hyble Digital" },
                      { value: "STUDIOS", label: "Hyble Studios" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setVerticalFilter(item.value as PostVertical | "ALL")}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                          verticalFilter === item.value
                            ? "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                {categories && categories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                      Kategoriler
                    </h3>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/blog/category/${cat.slug}`}
                          className="flex items-center justify-between px-4 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span>{cat.nameTr}</span>
                          <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                            {cat._count?.posts || 0}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Tags */}
                {topTags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                      Popüler Etiketler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {topTags.map(({ tag, count }) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors ${
                            selectedTag === tag
                              ? "bg-sky-500 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                          <span className="opacity-60">({count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Posts List */}
            <main className="flex-1">
              {/* Active Filters */}
              {(searchTerm || selectedTag || verticalFilter !== "ALL") && (
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <span className="text-sm text-slate-500">Filtreler:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm">
                      "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedTag && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-full text-sm">
                      <Tag className="h-3 w-3" />
                      {selectedTag}
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {verticalFilter !== "ALL" && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${verticalConfig[verticalFilter]?.bgColor} ${verticalConfig[verticalFilter]?.color}`}>
                      {verticalConfig[verticalFilter]?.label}
                      <button
                        onClick={() => setVerticalFilter("ALL")}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}

              {postsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    Yazı bulunamadı
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Arama kriterlerinize uygun yazı bulunamadı.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <article className="group flex gap-6 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {post.thumbnail && (
                            <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden">
                              <img
                                src={post.thumbnail}
                                alt={post.titleTr}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${verticalConfig[post.vertical as PostVertical]?.bgColor} ${verticalConfig[post.vertical as PostVertical]?.color}`}>
                                {verticalConfig[post.vertical as PostVertical]?.label}
                              </span>
                              {post.category && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {post.category.nameTr}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                              {post.titleTr}
                            </h3>
                            {post.excerptTr && (
                              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
                                {post.excerptTr}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {post.readingTime} dk okuma
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(post.publishedAt)}
                              </span>
                              {post.authorName && (
                                <span className="flex items-center gap-2">
                                  {post.authorImage && (
                                    <img
                                      src={post.authorImage}
                                      alt={post.authorName}
                                      className="w-5 h-5 rounded-full"
                                    />
                                  )}
                                  {post.authorName}
                                </span>
                              )}
                            </div>
                            {post.tags.length > 0 && (
                              <div className="flex gap-2 mt-3">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="hidden md:flex items-center">
                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </article>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
