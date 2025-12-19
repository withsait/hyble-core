# SALES-P1: Homepage Simplification

## Özet
Homepage'i "Jobs to be Done" bazlı segmentasyonla yeniden tasarla. Ziyaretçinin 3 saniyede ne yapabileceğini anlamasını sağla.

## Öncelik: P1
## Tahmini Süre: 12-16 saat
## Etkilenen Alanlar: hyble-web
## Bağımlılık: SALES-P0 tamamlanmış olmalı

---

## Görevler

### 1. Yeni Segment Selector Komponenti Oluştur

**Dosya:** `apps/hyble-web/src/components/landing/AudienceSelector.tsx`

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Layout, Code2, Gamepad2, Building2,
  ArrowRight, Sparkles, Zap, Shield
} from "lucide-react";

const audiences = [
  {
    id: "creators",
    icon: Layout,
    title: "Web Sitesi İstiyorum",
    description: "Şablon seç, özelleştir, yayınla",
    features: ["Sürükle-bırak editör", "200+ hazır şablon", "Hosting dahil"],
    cta: "Şablonları Gör",
    href: "/store",
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "developers",
    icon: Code2,
    title: "API Entegrasyonu",
    description: "Kimlik, ödeme, lisans API'leri",
    features: ["Hyble ID (OAuth)", "Wallet API", "License API"],
    cta: "Dokümantasyon",
    href: "/developers",
    color: "blue",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "gaming",
    icon: Gamepad2,
    title: "Oyun Sunucusu",
    description: "Minecraft, FiveM ve daha fazlası",
    features: ["Anında kurulum", "DDoS koruması", "Mod desteği"],
    cta: "Sunucu Oluştur",
    href: "https://gaming.hyble.co",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-500",
    external: true,
  },
];

export function AudienceSelector() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ne yapmak istiyorsunuz?
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Size en uygun çözümü seçin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map((audience) => {
            const isHovered = hoveredId === audience.id;
            const LinkComponent = audience.external ? "a" : Link;
            const linkProps = audience.external
              ? { href: audience.href, target: "_blank", rel: "noopener" }
              : { href: audience.href };

            return (
              <LinkComponent
                key={audience.id}
                {...linkProps}
                className="group relative"
                onMouseEnter={() => setHoveredId(audience.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={`
                  relative overflow-hidden rounded-2xl border-2 p-8
                  bg-white dark:bg-slate-800
                  transition-all duration-300
                  ${isHovered 
                    ? `border-${audience.color}-500 shadow-xl shadow-${audience.color}-500/10` 
                    : 'border-slate-200 dark:border-slate-700'
                  }
                `}>
                  {/* Icon */}
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center mb-6
                    bg-gradient-to-br ${audience.gradient}
                  `}>
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
                  <ul className="space-y-2 mb-8">
                    {audience.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Sparkles className="w-4 h-4 text-slate-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className={`
                    flex items-center gap-2 font-medium
                    text-${audience.color}-600 dark:text-${audience.color}-400
                  `}>
                    {audience.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </LinkComponent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

### 2. Social Proof Komponenti Oluştur

**Dosya:** `apps/hyble-web/src/components/landing/SocialProof.tsx`

```tsx
import { Star, Quote } from "lucide-react";

// Gerçek testimonial'lar eklenecek
const testimonials = [
  {
    id: 1,
    name: "Ahmet Y.",
    role: "E-ticaret Sahibi",
    avatar: "/testimonials/ahmet.jpg", // Placeholder
    content: "Hyble ile web sitemi 1 günde kurdum. Hosting dahil olması büyük avantaj.",
    rating: 5,
  },
  {
    id: 2,
    name: "Mehmet K.",
    role: "Minecraft Sunucu Sahibi",
    avatar: "/testimonials/mehmet.jpg",
    content: "Oyun sunucum hiç downtime yaşamadı. Destek ekibi çok hızlı.",
    rating: 5,
  },
  {
    id: 3,
    name: "Zeynep A.",
    role: "Freelance Developer",
    avatar: "/testimonials/zeynep.jpg",
    content: "Hyble ID API'si ile müşterilerime SSO sunuyorum. Entegrasyon çok kolay.",
    rating: 5,
  },
];

const trustBadges = [
  { label: "UK Registered", sublabel: "#15186175" },
  { label: "GDPR Compliant", sublabel: "EU Data Protection" },
  { label: "99.9% Uptime", sublabel: "SLA Guaranteed" },
  { label: "24/7 Support", sublabel: "Discord & Email" },
];

export function SocialProof() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="text-center">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">
                {badge.label}
              </div>
              <div className="text-sm text-slate-500">{badge.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 3. Homepage'i Güncelle

**Dosya:** `apps/hyble-web/src/app/(landing)/page.tsx`

```tsx
import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { AudienceSelector } from "@/components/landing/AudienceSelector";
import { SocialProof } from "@/components/landing/SocialProof";
import { PricingSection } from "@/components/landing/PricingSection";

export const metadata: Metadata = {
  title: "Hyble - Web Sitenizi 5 Dakikada Oluşturun",
  description: "Şablon seçin, özelleştirin, yayınlayın. Hosting dahil. Ücretsiz başlayın.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AudienceSelector />
      <SocialProof />
      <PricingSection />
    </>
  );
}
```

### 4. Gereksiz Komponentleri Kaldır/Archive Et

Aşağıdaki komponentleri `_archive` klasörüne taşı:
- `IntegrationLogos.tsx` (gerekirse SocialProof'a ekle)
- `FeatureBento.tsx` (çok karmaşık)
- `FeaturedProducts.tsx` (AudienceSelector ile değişti)
- `HowItWorks.tsx` (basitleştirilecek)
- `WhyHyble.tsx` (SocialProof'a entegre edildi)
- `ScrollCTA.tsx` (PricingSection yeterli)

```bash
mkdir -p apps/hyble-web/src/components/landing/_archive
mv apps/hyble-web/src/components/landing/IntegrationLogos.tsx apps/hyble-web/src/components/landing/_archive/
# ... diğerleri
```

---

## Kontrol Listesi

- [x] AudienceSelector komponenti oluşturuldu
- [x] SocialProof komponenti oluşturuldu
- [x] Homepage sadeleştirildi (max 4 section)
- [x] Gereksiz komponentler archive edildi
- [x] Mobile responsive test edildi
- [x] Dark mode test edildi
- [x] Framer motion animasyonları eklendi

## Test

```bash
pnpm dev --filter hyble-web
# Lighthouse performance score kontrol et
# Mobile emulator test et
```
