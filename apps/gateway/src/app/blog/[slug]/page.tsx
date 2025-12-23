"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { api } from "@/lib/trpc";
import { sanitizeBlogContent } from "@hyble/ui";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Tag,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  ChevronRight,
  Loader2,
  User,
} from "lucide-react";

type PostVertical = "GENERAL" | "DIGITAL" | "STUDIOS";

interface RelatedPost {
  id: string;
  slug: string;
  titleTr: string;
  thumbnail: string | null;
  readingTime: number;
}

interface BlogPost {
  id: string;
  slug: string;
  vertical: PostVertical;
  titleTr: string;
  titleEn: string;
  excerptTr: string | null;
  contentTr: string;
  featuredImage: string | null;
  authorName: string | null;
  authorImage: string | null;
  category: { nameTr: string } | null;
  tags: string[];
  readingTime: number;
  viewCount: number;
  publishedAt: Date | string | null;
  relatedPosts?: RelatedPost[];
}

const verticalConfig: Record<PostVertical, { label: string; color: string; bgColor: string; gradient: string }> = {
  GENERAL: {
    label: "Hyble",
    color: "text-sky-600",
    bgColor: "bg-sky-100 dark:bg-sky-900/30",
    gradient: "from-sky-500 to-cyan-500"
  },
  DIGITAL: {
    label: "Digital",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    gradient: "from-amber-500 to-orange-500"
  },
  STUDIOS: {
    label: "Studios",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    gradient: "from-emerald-500 to-teal-500"
  },
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

function MarkdownContent({ content }: { content: string }) {
  // Simple markdown parsing for display
  // In production, use a proper markdown library like react-markdown
  const html = content
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/\n\n/gim, '</p><p class="mb-4">')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/gim, '<br />');

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = sanitizeBlogContent(`<p class="mb-4">${html}</p>`);

  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Fetch post - using type assertion for cross-package tRPC compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, error } = (api as any).blog.getBySlug.useQuery({ slug });
  const post = data as BlogPost | null;

  // Share functions
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = post?.titleTr || "";

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      alert("Link kopyalandı!");
      return;
    }

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Yazı bulunamadı
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Blog'a Dön
          </Link>
        </div>
      </div>
    );
  }

  const vertical = post.vertical as PostVertical;
  const config = verticalConfig[vertical];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="relative">
        {post.featuredImage ? (
          <div className="relative h-[50vh] min-h-[400px]">
            <img
              src={post.featuredImage}
              alt={post.titleTr}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="container mx-auto px-4 pb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Blog'a Dön
                  </Link>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </span>
                    {post.category && (
                      <span className="text-white/80 text-sm">
                        {post.category.nameTr}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-4xl">
                    {post.titleTr}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-white/80">
                    {post.authorName && (
                      <div className="flex items-center gap-2">
                        {post.authorImage ? (
                          <img
                            src={post.authorImage}
                            alt={post.authorName}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                        <span className="font-medium text-white">{post.authorName}</span>
                      </div>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readingTime} dk okuma
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.viewCount.toLocaleString()} görüntülenme
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`relative py-20 bg-gradient-to-br ${config.gradient} overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="container mx-auto px-4 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Blog'a Dön
                </Link>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                    {config.label}
                  </span>
                  {post.category && (
                    <span className="text-white/80 text-sm">
                      {post.category.nameTr}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 max-w-4xl">
                  {post.titleTr}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-white/80">
                  {post.authorName && (
                    <div className="flex items-center gap-2">
                      {post.authorImage ? (
                        <img
                          src={post.authorImage}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <span className="font-medium text-white">{post.authorName}</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readingTime} dk okuma
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.viewCount.toLocaleString()} görüntülenme
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <article className="flex-1 max-w-3xl">
              {post.excerptTr && (
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                  {post.excerptTr}
                </p>
              )}

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <MarkdownContent content={post.contentTr} />
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Etiketler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${tag}`}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Paylaş
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleShare("twitter")}
                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 transition-colors"
                    aria-label="Twitter'da paylaş"
                  >
                    <Twitter className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors"
                    aria-label="LinkedIn'de paylaş"
                  >
                    <Linkedin className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors"
                    aria-label="Facebook'ta paylaş"
                  >
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Linki kopyala"
                  >
                    <LinkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-8">
                {/* Author Card */}
                {post.authorName && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                      Yazar
                    </h3>
                    <div className="flex items-center gap-4">
                      {post.authorImage ? (
                        <img
                          src={post.authorImage}
                          alt={post.authorName}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <User className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {post.authorName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Hyble Ekibi
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Related Posts */}
                {post.relatedPosts && post.relatedPosts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                      İlgili Yazılar
                    </h3>
                    <div className="space-y-4">
                      {post.relatedPosts.map((related) => (
                        <Link
                          key={related.id}
                          href={`/blog/${related.slug}`}
                          className="group flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {related.thumbnail && (
                            <img
                              src={related.thumbnail}
                              alt={related.titleTr}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {related.titleTr}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {related.readingTime} dk
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-sky-500 flex-shrink-0 self-center" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to Blog */}
                <Link
                  href="/blog"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Tüm Yazılar
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
