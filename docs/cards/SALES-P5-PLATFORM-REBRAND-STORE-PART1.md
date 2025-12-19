# SALES-P5: Platform Rebrand & Template Store

## Özet
Hyble'ı "web sitesi yapım aracı"ndan "dijital altyapı platformu"na dönüştür. 5 segmentli yeni homepage, kapsamlı template store, satın alma flow'u ve one-click cloud deploy wizard'ı.

## Öncelik: P1 (Yüksek)
## Tahmini Süre: 32-40 saat
## Etkilenen Alanlar: hyble-web, hyble-panel, packages/db

---

## BÖLÜM 1: HOMEPAGE REBRAND

### 1.1 Yeni Hero Section

**Dosya:** `apps/hyble-web/src/components/landing/HeroSection.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Shield, Building2, Lock,
  Globe, Cloud, Code2, Gamepad2, Briefcase
} from "lucide-react";

// 5 Ana Segment
const segments = [
  {
    id: "websites",
    icon: Globe,
    title: "Web Sitesi",
    description: "Şablon seç, yayınla",
    href: "/store",
    color: "amber",
    stats: "200+ şablon",
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud Hosting",
    description: "VPS & Database",
    href: "/cloud",
    color: "blue",
    stats: "€1.99'dan",
  },
  {
    id: "api",
    icon: Code2,
    title: "API Çözümleri",
    description: "ID, Wallet, License",
    href: "/solutions",
    color: "purple",
    stats: "Ücretsiz tier",
  },
  {
    id: "gaming",
    icon: Gamepad2,
    title: "Gaming",
    description: "Oyun sunucuları",
    href: "https://gaming.hyble.co",
    color: "emerald",
    stats: "Anında kurulum",
    external: true,
  },
  {
    id: "enterprise",
    icon: Briefcase,
    title: "Kurumsal",
    description: "Özel çözümler",
    href: "/enterprise",
    color: "slate",
    stats: "Danışmanlık",
  },
];

const trustItems = [
  { icon: Shield, label: "256-bit SSL", sublabel: "Şifreli bağlantı" },
  { icon: Building2, label: "UK Şirketi", sublabel: "#15186175" },
  { icon: Lock, label: "GDPR Uyumlu", sublabel: "Veri koruma" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center py-12 lg:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800 rounded-full mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Web'den Gaming'e, API'den Cloud'a — Tek Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            <span className="text-slate-900 dark:text-white">Dijital Altyapınız İçin</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Tek Platform
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Hazır şablonlardan kurumsal çözümlere, cloud hosting'den oyun sunucularına.
            Her ölçekte işletme için dijital altyapı.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/store"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-amber-500/25"
            >
              Şablonları Keşfet
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/enterprise"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold text-lg transition-all"
            >
              Kurumsal Çözümler
            </Link>
          </motion.div>
        </div>

        {/* 5 Segment Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16"
        >
          {segments.map((segment, index) => {
            const colorClasses = {
              amber: "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10",
              blue: "hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10",
              purple: "hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10",
              emerald: "hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10",
              slate: "hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
            };

            const iconColorClasses = {
              amber: "text-amber-500",
              blue: "text-blue-500",
              purple: "text-purple-500",
              emerald: "text-emerald-500",
              slate: "text-slate-500",
            };

            const CardWrapper = segment.external ? 'a' : Link;
            const cardProps = segment.external 
              ? { href: segment.href, target: "_blank", rel: "noopener noreferrer" }
              : { href: segment.href };

            return (
              <CardWrapper
                key={segment.id}
                {...cardProps}
                className={`group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 transition-all duration-300 ${colorClasses[segment.color as keyof typeof colorClasses]}`}
              >
                <segment.icon className={`w-8 h-8 mb-3 ${iconColorClasses[segment.color as keyof typeof iconColorClasses]}`} />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {segment.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {segment.description}
                </p>
                <span className="text-xs font-medium text-slate-400">
                  {segment.stats}
                </span>
                <ArrowRight className="absolute bottom-6 right-6 w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </CardWrapper>
            );
          })}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6"
        >
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-5 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl border border-slate-200/50 dark:border-slate-700/50"
            >
              <item.icon className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</div>
                <div className="text-xs text-slate-500">{item.sublabel}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

### 1.2 Güncellenmiş AudienceSelector (5 Segment)

**Dosya:** `apps/hyble-web/src/components/landing/AudienceSelector.tsx`

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe, Cloud, Code2, Gamepad2, Briefcase,
  ArrowRight, Check, Sparkles
} from "lucide-react";

const audiences = [
  {
    id: "websites",
    icon: Globe,
    title: "Web Sitesi & Şablon",
    description: "Hazır şablonlarla hızlı başla",
    features: ["200+ profesyonel şablon", "Sürükle-bırak editör", "Hosting dahil", "One-click deploy"],
    cta: "Şablonları Gör",
    href: "/store",
    gradient: "from-amber-500 to-orange-500",
    hoverBorder: "hover:border-amber-500",
    badge: "En Popüler",
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud Hosting",
    description: "VPS, web hosting, managed database",
    features: ["Cloud VPS €1.99'dan", "Managed PostgreSQL/MySQL", "Auto-scaling", "DDoS koruması"],
    cta: "Sunucu Oluştur",
    href: "/cloud",
    gradient: "from-blue-500 to-cyan-500",
    hoverBorder: "hover:border-blue-500",
  },
  {
    id: "api",
    icon: Code2,
    title: "API & Ekosistem",
    description: "Geliştiriciler için hazır çözümler",
    features: ["Hyble ID (OAuth/SSO)", "Wallet & Ödeme", "License yönetimi", "Webhook & SDK"],
    cta: "Dokümantasyon",
    href: "/solutions",
    gradient: "from-purple-500 to-indigo-500",
    hoverBorder: "hover:border-purple-500",
  },
  {
    id: "gaming",
    icon: Gamepad2,
    title: "Gaming Hosting",
    description: "Minecraft, FiveM, Rust sunucuları",
    features: ["60 saniyede kurulum", "Mod & plugin desteği", "DDoS koruması", "7/24 destek"],
    cta: "Sunucu Kur",
    href: "https://gaming.hyble.co",
    gradient: "from-emerald-500 to-teal-500",
    hoverBorder: "hover:border-emerald-500",
    external: true,
  },
  {
    id: "enterprise",
    icon: Briefcase,
    title: "Kurumsal & Özel",
    description: "İşletmenize özel çözümler",
    features: ["Dedicated altyapı", "Özel entegrasyonlar", "SLA garantisi", "Account manager"],
    cta: "Demo Talep Et",
    href: "/enterprise",
    gradient: "from-slate-600 to-slate-800",
    hoverBorder: "hover:border-slate-500",
    badge: "B2B",
  },
];

export function AudienceSelector() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            İhtiyacınıza Uygun Çözüm
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Bireysel projelerden kurumsal çözümlere, her ölçekte yanınızdayız
          </p>
        </motion.div>

        {/* Cards Grid - 2-3 layout for better visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((audience, index) => {
            const isHovered = hoveredId === audience.id;
            const CardWrapper = audience.external ? 'a' : Link;
            const cardProps = audience.external
              ? { href: audience.href, target: "_blank", rel: "noopener noreferrer" }
              : { href: audience.href };

            return (
              <motion.div
                key={audience.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={index >= 3 ? "lg:col-span-1 md:col-span-1" : ""}
              >
                <CardWrapper
                  {...cardProps}
                  className="group block h-full"
                  onMouseEnter={() => setHoveredId(audience.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className={`
                    relative h-full overflow-hidden rounded-2xl border-2 p-8
                    bg-white dark:bg-slate-800
                    transition-all duration-300
                    border-slate-200 dark:border-slate-700
                    ${audience.hoverBorder}
                    ${isHovered ? 'shadow-xl' : 'shadow-sm'}
                  `}>
                    {/* Badge */}
                    {audience.badge && (
                      <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${
                        audience.badge === "En Popüler" 
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      }`}>
                        {audience.badge}
                      </span>
                    )}

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${audience.gradient}`}>
                      <audience.icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {audience.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      {audience.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {audience.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
                      {audience.cta}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

---

## BÖLÜM 2: TEMPLATE STORE

### 2.1 Prisma Schema Güncellemesi

**Dosya:** `packages/db/prisma/schema.prisma`

Aşağıdaki modelleri ekle/güncelle:

```prisma
// ==================== TEMPLATE STORE ====================

enum TemplateCategory {
  WEBSITE           // Kurumsal, portfolyo
  ECOMMERCE         // Online mağaza
  LANDING_PAGE      // Tek sayfa, kampanya
  SAAS              // Dashboard, panel
  BLOG              // Blog, haber
  PORTFOLIO         // Kişisel portfolyo
  RESTAURANT        // Restoran, kafe
  AGENCY            // Ajans, stüdyo
}

enum TemplateStatus {
  DRAFT             // Taslak
  ACTIVE            // Satışta
  ARCHIVED          // Arşivde
}

enum TemplateFramework {
  NEXTJS            // Next.js
  REACT             // React
  HTML              // Static HTML
  WORDPRESS         // WordPress tema
}

model Template {
  id              String           @id @default(cuid())
  slug            String           @unique
  status          TemplateStatus   @default(DRAFT)
  
  // Temel Bilgiler
  nameTr          String
  nameEn          String
  descriptionTr   String           @db.Text
  descriptionEn   String           @db.Text
  shortDescTr     String?          // Liste görünümü için
  shortDescEn     String?
  
  // Kategori & Etiketler
  category        TemplateCategory
  tags            String[]         // ["modern", "minimal", "dark"]
  industry        String[]         // ["teknoloji", "sağlık", "eğitim"]
  
  // Fiyatlandırma
  price           Decimal          @db.Decimal(10, 2)
  comparePrice    Decimal?         @db.Decimal(10, 2)  // İndirim öncesi fiyat
  currency        String           @default("EUR")
  
  // Framework & Teknik
  framework       TemplateFramework
  version         String           @default("1.0.0")
  features        String[]         // ["responsive", "dark-mode", "seo-ready"]
  techStack       String[]         // ["tailwind", "framer-motion", "prisma"]
  
  // Görseller
  thumbnail       String           // Ana görsel
  images          String[]         // Galeri görselleri
  previewUrl      String?          // Canlı demo linki
  
  // Dosyalar
  downloadUrl     String?          // Kaynak dosya (protected)
  documentationUrl String?         // Kurulum dokümanı
  
  // İstatistikler
  salesCount      Int              @default(0)
  viewCount       Int              @default(0)
  rating          Decimal          @default(0) @db.Decimal(2, 1)
  reviewCount     Int              @default(0)
  
  // Öne Çıkarma
  isFeatured      Boolean          @default(false)
  featuredOrder   Int?
  isNew           Boolean          @default(true)
  
  // Cloud Entegrasyonu
  cloudCompatible Boolean          @default(true)
  deployTime      Int              @default(60)      // Saniye cinsinden tahmini kurulum
  
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  // Relations
  purchases       TemplatePurchase[]
  reviews         TemplateReview[]
  deployments     TemplateDeployment[]
  
  @@index([category])
  @@index([status])
  @@index([isFeatured])
  @@index([salesCount])
  @@index([slug])
}

model TemplatePurchase {
  id              String   @id @default(cuid())
  templateId      String
  userId          String
  
  // Ödeme
  amount          Decimal  @db.Decimal(10, 2)
  currency        String   @default("EUR")
  transactionId   String?
  
  // Lisans
  licenseKey      String   @unique @default(cuid())
  licenseType     String   @default("standard")  // standard, extended
  
  // Durum
  downloadCount   Int      @default(0)
  maxDownloads    Int      @default(5)
  expiresAt       DateTime?
  
  createdAt       DateTime @default(now())
  
  template        Template @relation(fields: [templateId], references: [id])
  deployments     TemplateDeployment[]
  
  @@unique([templateId, userId])
  @@index([userId])
  @@index([templateId])
}

model TemplateReview {
  id          String   @id @default(cuid())
  templateId  String
  userId      String
  
  rating      Int      // 1-5
  title       String?
  content     String?  @db.Text
  
  isVerified  Boolean  @default(false)  // Satın almış mı
  isApproved  Boolean  @default(false)  // Admin onayı
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  template    Template @relation(fields: [templateId], references: [id], onDelete: Cascade)
  
  @@unique([templateId, userId])
  @@index([templateId])
  @@index([rating])
}

model TemplateDeployment {
  id              String   @id @default(cuid())
  templateId      String
  purchaseId      String
  userId          String
  
  // Deployment Bilgileri
  projectName     String
  subdomain       String   @unique  // projectname.hyble.co
  customDomain    String?
  
  // Cloud Kaynakları
  serverId        String?           // Hyble Cloud VPS ID
  databaseId      String?           // Managed DB ID
  
  // Durum
  status          String   @default("pending")  // pending, deploying, active, failed, suspended
  deployedAt      DateTime?
  lastDeployAt    DateTime?
  
  // Wizard Config
  config          Json?             // Kullanıcı ayarları (logo, renkler, vs.)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  template        Template         @relation(fields: [templateId], references: [id])
  purchase        TemplatePurchase @relation(fields: [purchaseId], references: [id])
  
  @@index([userId])
  @@index([status])
  @@index([subdomain])
}
```

### 2.2 Template Store Ana Sayfa

**Dosya:** `apps/hyble-web/src/app/(landing)/store/page.tsx`

```tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { TemplateGrid } from "@/components/store/TemplateGrid";
import { StoreHero } from "@/components/store/StoreHero";
import { StoreFilters } from "@/components/store/StoreFilters";
import { StoreSidebar } from "@/components/store/StoreSidebar";

export const metadata: Metadata = {
  title: "Şablon Mağazası | Hyble",
  description: "200+ profesyonel web sitesi şablonu. Next.js, React, HTML. Hosting dahil, one-click deploy.",
};

interface StorePageProps {
  searchParams: {
    category?: string;
    sort?: string;
    q?: string;
    framework?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default function StorePage({ searchParams }: StorePageProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <StoreHero />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <StoreSidebar />
          </aside>
          
          {/* Main Grid */}
          <main className="flex-1">
            {/* Top Filters */}
            <StoreFilters searchParams={searchParams} />
            
            {/* Templates Grid */}
            <Suspense fallback={<TemplateGridSkeleton />}>
              <TemplateGrid searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

function TemplateGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-slate-200 dark:bg-slate-700 rounded-xl aspect-[4/3]" />
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 2.3 Store Hero Component

**Dosya:** `apps/hyble-web/src/components/store/StoreHero.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Search, Sparkles, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const stats = [
  { icon: Sparkles, value: "200+", label: "Profesyonel Şablon" },
  { icon: Zap, value: "60sn", label: "Ortalama Kurulum" },
  { icon: Shield, value: "Dahil", label: "Hosting & SSL" },
];

export function StoreHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/store?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 pt-20 pb-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(251, 191, 36, 0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-full mb-6"
        >
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Yeni şablonlar eklendi
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6"
        >
          Profesyonel Web Şablonları
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
        >
          Şablonu seç, tek tıkla kur, hemen yayınla. Hosting, SSL ve teknik destek dahil.
        </motion.p>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSearch}
          className="max-w-xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Şablon ara... (ör: e-ticaret, restoran, portfolio)"
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              Ara
            </button>
          </div>
        </motion.form>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-8"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

### 2.4 Template Card Component

**Dosya:** `apps/hyble-web/src/components/store/TemplateCard.tsx`

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Eye, ShoppingCart, Zap, ExternalLink } from "lucide-react";
import { useState } from "react";

interface TemplateCardProps {
  template: {
    id: string;
    slug: string;
    nameTr: string;
    shortDescTr: string;
    category: string;
    price: number;
    comparePrice?: number;
    thumbnail: string;
    previewUrl?: string;
    rating: number;
    reviewCount: number;
    salesCount: number;
    framework: string;
    isNew: boolean;
    isFeatured: boolean;
    features: string[];
  };
  index?: number;
}

export function TemplateCard({ template, index = 0 }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const discount = template.comparePrice 
    ? Math.round((1 - template.price / template.comparePrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/store/${template.slug}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all duration-300 hover:shadow-xl">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
            <Image
              src={template.thumbnail}
              alt={template.nameTr}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Overlay on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                {template.previewUrl && (
                  <a
                    href={template.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Önizle
                  </a>
                )}
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                  Sepete Ekle
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {template.isNew && (
                <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                  Yeni
                </span>
              )}
              {template.isFeatured && (
                <span className="px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                  Öne Çıkan
                </span>
              )}
              {discount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                  %{discount} İndirim
                </span>
              )}
            </div>

            {/* Framework Badge */}
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-slate-900/70 text-white text-xs font-medium rounded-full">
                {template.framework}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Category */}
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
              {template.category}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {template.nameTr}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
              {template.shortDescTr}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-4">
              {template.features.slice(0, 3).map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              {/* Rating & Sales */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {template.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({template.reviewCount})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Zap className="w-3 h-3" />
                  {template.salesCount} satış
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                {template.comparePrice && (
                  <span className="text-sm text-slate-400 line-through mr-2">
                    €{template.comparePrice}
                  </span>
                )}
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  €{template.price}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
```

### 2.5 Template Detail Page

**Dosya:** `apps/hyble-web/src/app/(landing)/store/[slug]/page.tsx`

```tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, ShoppingCart, Eye, Download, Check, 
  Monitor, Smartphone, Tablet, ChevronRight,
  Zap, Shield, Clock, MessageCircle
} from "lucide-react";
import { TemplateGallery } from "@/components/store/TemplateGallery";
import { TemplatePurchaseCard } from "@/components/store/TemplatePurchaseCard";
import { TemplateReviews } from "@/components/store/TemplateReviews";
import { RelatedTemplates } from "@/components/store/RelatedTemplates";
// import { api } from "@/lib/api"; // tRPC client

interface TemplatePageProps {
  params: { slug: string };
}

// export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
//   const template = await api.template.getBySlug.query({ slug: params.slug });
//   if (!template) return { title: "Şablon Bulunamadı" };
//   return {
//     title: `${template.nameTr} | Hyble Şablon Mağazası`,
//     description: template.shortDescTr,
//   };
// }

export default async function TemplatePage({ params }: TemplatePageProps) {
  // const template = await api.template.getBySlug.query({ slug: params.slug });
  // if (!template) notFound();

  // Placeholder data
  const template = {
    id: "1",
    slug: params.slug,
    nameTr: "StartupX - Modern Startup Landing",
    descriptionTr: "Modern ve profesyonel startup landing page şablonu. Conversion odaklı tasarım, dark mode desteği, tam responsive yapı.",
    shortDescTr: "Startup'lar için modern landing page",
    category: "Landing Page",
    price: 49,
    comparePrice: 79,
    currency: "EUR",
    framework: "Next.js",
    version: "2.1.0",
    thumbnail: "/templates/startupx-thumb.jpg",
    images: ["/templates/startupx-1.jpg", "/templates/startupx-2.jpg"],
    previewUrl: "https://demo.hyble.co/startupx",
    features: ["Dark Mode", "Responsive", "SEO Ready", "Analytics", "Blog"],
    techStack: ["Next.js 14", "Tailwind CSS", "Framer Motion", "TypeScript"],
    rating: 4.8,
    reviewCount: 124,
    salesCount: 847,
    deployTime: 60,
    isNew: false,
    isFeatured: true,
  };

  const discount = template.comparePrice 
    ? Math.round((1 - template.price / template.comparePrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Breadcrumb */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/store" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              Mağaza
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <Link href={`/store?category=${template.category.toLowerCase()}`} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              {template.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-medium">{template.nameTr}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Gallery & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <TemplateGallery 
              images={template.images} 
              thumbnail={template.thumbnail}
              previewUrl={template.previewUrl}
            />

            {/* Description */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Açıklama
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {template.descriptionTr}
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Özellikler
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {template.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Teknoloji Stack
              </h2>
              <div className="flex flex-wrap gap-3">
                {template.techStack.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <TemplateReviews templateId={template.id} />
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TemplatePurchaseCard template={template} />
            </div>
          </div>
        </div>

        {/* Related Templates */}
        <div className="mt-20">
          <RelatedTemplates category={template.category} currentId={template.id} />
        </div>
      </div>
    </div>
  );
}
```

### 2.6 Purchase Card Component

**Dosya:** `apps/hyble-web/src/components/store/TemplatePurchaseCard.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, Zap, Download, Cloud, Check,
  Monitor, Smartphone, Shield, Clock, Star
} from "lucide-react";
import { motion } from "framer-motion";

interface TemplatePurchaseCardProps {
  template: {
    id: string;
    slug: string;
    nameTr: string;
    price: number;
    comparePrice?: number;
    rating: number;
    reviewCount: number;
    salesCount: number;
    previewUrl?: string;
    deployTime: number;
    framework: string;
  };
}

export function TemplatePurchaseCard({ template }: TemplatePurchaseCardProps) {
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const discount = template.comparePrice 
    ? Math.round((1 - template.price / template.comparePrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    // TODO: Add to cart logic
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAddingToCart(false);
    // Show cart drawer or notification
  };

  const handleBuyNow = () => {
    router.push(`/store/${template.slug}/checkout`);
  };

  const handleDeploy = () => {
    router.push(`/store/${template.slug}/deploy`);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
      {/* Price Section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-4xl font-bold text-slate-900 dark:text-white">
            €{template.price}
          </span>
          {template.comparePrice && (
            <span className="text-xl text-slate-400 line-through">
              €{template.comparePrice}
            </span>
          )}
        </div>
        {discount > 0 && (
          <span className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-full">
            %{discount} İndirim
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 space-y-3">
        {/* One-Click Deploy - Primary */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDeploy}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/25"
        >
          <Cloud className="w-5 h-5" />
          Satın Al & Hemen Kur
        </motion.button>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {isAddingToCart ? "Ekleniyor..." : "Sepete Ekle"}
        </button>

        {/* Preview */}
        {template.previewUrl && (
          <a
            href={template.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
          >
            <Monitor className="w-5 h-5" />
            Canlı Önizleme
          </a>
        )}
      </div>

      {/* Features */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
          Dahil Olanlar
        </h4>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Check className="w-4 h-4 text-green-500" />
            Kaynak kodu (lifetime erişim)
          </li>
          <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Check className="w-4 h-4 text-green-500" />
            Hyble Cloud hosting (1 yıl ücretsiz)
          </li>
          <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Check className="w-4 h-4 text-green-500" />
            SSL sertifikası dahil
          </li>
          <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Check className="w-4 h-4 text-green-500" />
            Ücretsiz güncellemeler
          </li>
          <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Check className="w-4 h-4 text-green-500" />
            Teknik destek (6 ay)
          </li>
        </ul>
      </div>

      {/* Stats */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold">{template.rating}</span>
            </div>
            <div className="text-xs text-slate-500">{template.reviewCount} yorum</div>
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white mb-1">
              {template.salesCount}
            </div>
            <div className="text-xs text-slate-500">satış</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-white mb-1">
              <Clock className="w-4 h-4" />
              <span className="font-bold">{template.deployTime}sn</span>
            </div>
            <div className="text-xs text-slate-500">kurulum</div>
          </div>
        </div>
      </div>

      {/* Trust */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-400">
        <Shield className="w-4 h-4" />
        14 gün para iade garantisi
      </div>
    </div>
  );
}
```
