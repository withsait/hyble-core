"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "@/lib/trpc";
import {
  ArrowRight,
  Calendar,
  Clock,
  Tag,
  Sparkles,
  BookOpen,
  Loader2,
} from "lucide-react";

type PostVertical = "GENERAL" | "DIGITAL" | "STUDIOS";

interface BlogPost {
  id: string;
  slug: string;
  vertical: PostVertical;
  titleTr: string;
  excerptTr: string | null;
  featuredImage: string | null;
  authorName: string | null;
  authorImage: string | null;
  category: { nameTr: string } | null;
  tags: string[];
  readingTime: number;
  publishedAt: Date | string | null;
}

const verticalConfig: Record<PostVertical, { label: string; color: string; bgColor: string }> = {
  GENERAL: { label: "Hyble", color: "text-sky-600", bgColor: "bg-sky-100 dark:bg-sky-900/30" },
  DIGITAL: { label: "Digital", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  STUDIOS: { label: "Studios", color: "text-emerald-600", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
};

function formatDate(date: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("tr-TR", {
    month: "short",
    day: "numeric",
  });
}

export function BlogPreviewSection() {
  // Type assertion for cross-package tRPC compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: postsData, isLoading } = (api as any).blog.getFeaturedForLanding.useQuery({ limit: 3 }) as { data: BlogPost[] | undefined; isLoading: boolean };
  const posts = postsData ?? [];

  if (isLoading) {
    return (
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-br from-sky-500/10 to-cyan-500/10 blur-3xl rounded-full" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            Blog & Kaynaklar
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Son Yazılarımız
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Dijital dünya hakkında en güncel bilgiler, rehberler ve ipuçları
          </p>
        </motion.div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, index) => {
            const vertical = post.vertical as PostVertical;
            const config = verticalConfig[vertical];

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <article className="group h-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      {post.featuredImage ? (
                        <>
                          <img
                            src={post.featuredImage}
                            alt={post.titleTr}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${
                          vertical === "DIGITAL" ? "from-amber-500 to-orange-500" :
                          vertical === "STUDIOS" ? "from-emerald-500 to-teal-500" :
                          "from-sky-500 to-cyan-500"
                        }`}>
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                      )}
                      {/* Category Badge */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${config.bgColor} ${config.color}`}>
                          {config.label}
                        </span>
                        {post.category && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/20 text-white">
                            {post.category.nameTr}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                        {post.titleTr}
                      </h3>
                      {post.excerptTr && (
                        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
                          {post.excerptTr}
                        </p>
                      )}

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.readingTime} dk
                          </span>
                        </div>
                        {post.authorName && post.authorImage && (
                          <img
                            src={post.authorImage}
                            alt={post.authorName}
                            className="w-6 h-6 rounded-full"
                            title={post.authorName}
                          />
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors group"
          >
            <Sparkles className="h-5 w-5" />
            Tüm Yazıları Gör
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
