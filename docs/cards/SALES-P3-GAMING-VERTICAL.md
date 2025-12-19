# SALES-P3: Gaming Vertical Birleştirme

## Özet
game.hyble.co → gaming.hyble.co migration. HybleGaming brandını ana Hyble ekosistemiyle entegre et. Unified auth, cross-sell fırsatları.

## Öncelik: P3
## Tahmini Süre: 20-24 saat
## Etkilenen Alanlar: hyblegaming-web, hyble-panel, nginx, DNS
## Bağımlılık: SALES-P0 tamamlanmış olmalı

---

## Görevler

### 1. DNS & Nginx Konfigürasyonu

**Dosya:** `tooling/nginx/hyble.conf`

```nginx
# Gaming redirect (eski domain)
server {
    listen 80;
    listen 443 ssl http2;
    server_name game.hyble.co;
    
    ssl_certificate /etc/letsencrypt/live/hyble.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hyble.co/privkey.pem;
    
    # Permanent redirect to new domain
    return 301 https://gaming.hyble.co$request_uri;
}

# Gaming ana domain
server {
    listen 80;
    listen 443 ssl http2;
    server_name gaming.hyble.co;
    
    ssl_certificate /etc/letsencrypt/live/hyble.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hyble.co/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Cloudflare DNS:**
```
A     gaming.hyble.co    178.63.138.97    Proxied
CNAME game.hyble.co      gaming.hyble.co  Proxied
```

### 2. HybleGaming Web App Yapısı

**Dosya:** `apps/hyblegaming-web/src/app/(landing)/page.tsx`

```tsx
import { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { GameSelector } from "@/components/landing/GameSelector";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";

export const metadata: Metadata = {
  title: "Hyble Gaming - Oyun Sunucusu Hosting",
  description: "Minecraft, FiveM, Rust sunucunu 60 saniyede kur. DDoS koruması, 7/24 destek, anında kurulum.",
};

export default function GamingHomePage() {
  return (
    <>
      <HeroSection />
      <GameSelector />
      <Features />
      <Pricing />
      <FAQ />
    </>
  );
}
```

### 3. Gaming Hero Section

**Dosya:** `apps/hyblegaming-web/src/components/landing/HeroSection.tsx`

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Zap, Shield, Headphones } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-500/20 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{ 
              y: [null, "-100%"],
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-8"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Hyble Gaming by Hyble</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-white mb-6"
        >
          Oyun Sunucunu
          <span className="block text-emerald-400">60 Saniyede Kur</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 max-w-2xl mx-auto mb-8"
        >
          Minecraft, FiveM, Rust ve daha fazlası. DDoS koruması, mod desteği, 
          otomatik yedekleme. Hemen başla.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="https://id.hyble.co/register?redirect=gaming"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-lg transition-colors"
          >
            Ücretsiz Dene
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-lg transition-colors"
          >
            Fiyatları Gör
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-8 mt-12"
        >
          <div className="flex items-center gap-2 text-slate-400">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span>Anında Kurulum</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>DDoS Koruması</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Headphones className="w-5 h-5 text-emerald-400" />
            <span>7/24 Destek</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

### 4. Game Selector Komponenti

**Dosya:** `apps/hyblegaming-web/src/components/landing/GameSelector.tsx`

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Users, Server, Cpu } from "lucide-react";

const games = [
  {
    id: "minecraft",
    name: "Minecraft",
    description: "Java & Bedrock Edition",
    image: "/games/minecraft.png",
    startingPrice: "€2.99",
    popular: true,
    features: ["Paper/Spigot/Forge", "Plugin desteği", "BungeeCord/Velocity"],
    href: "/games/minecraft",
  },
  {
    id: "fivem",
    name: "FiveM",
    description: "GTA V Multiplayer",
    image: "/games/fivem.png",
    startingPrice: "€9.99",
    popular: true,
    features: ["ESX/QBCore hazır", "Script desteği", "MySQL dahil"],
    href: "/games/fivem",
  },
  {
    id: "rust",
    name: "Rust",
    description: "Survival Game",
    image: "/games/rust.png",
    startingPrice: "€12.99",
    popular: false,
    features: ["Oxide/uMod", "Plugin desteği", "Otomatik wipe"],
    href: "/games/rust",
  },
  {
    id: "csgo",
    name: "CS2",
    description: "Counter-Strike 2",
    image: "/games/cs2.png",
    startingPrice: "€4.99",
    popular: false,
    features: ["128 Tick", "SourceMod", "Turnuva modu"],
    href: "/games/cs2",
  },
  {
    id: "ark",
    name: "ARK",
    description: "Survival Evolved",
    image: "/games/ark.png",
    startingPrice: "€14.99",
    popular: false,
    features: ["Cluster desteği", "Mod desteği", "Scheduled restart"],
    href: "/games/ark",
  },
  {
    id: "palworld",
    name: "Palworld",
    description: "Creature Collection",
    image: "/games/palworld.png",
    startingPrice: "€9.99",
    popular: true,
    features: ["Dedicated server", "Save yönetimi", "Kolay kurulum"],
    href: "/games/palworld",
  },
];

export function GameSelector() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  return (
    <section className="py-20 px-4 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Hangi Oyunu Oynuyorsun?
          </h2>
          <p className="text-slate-400">
            Desteklenen tüm oyunlar için anında kurulum
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className="group relative"
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
            >
              <div className={`
                relative overflow-hidden rounded-2xl border-2 p-6
                bg-slate-800/50 backdrop-blur
                transition-all duration-300
                ${hoveredGame === game.id 
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' 
                  : 'border-slate-700'
                }
              `}>
                {/* Popular badge */}
                {game.popular && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                    Popüler
                  </div>
                )}

                {/* Game icon placeholder */}
                <div className="w-16 h-16 bg-slate-700 rounded-xl mb-4 flex items-center justify-center">
                  <Server className="w-8 h-8 text-slate-500" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-1">
                  {game.name}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {game.description}
                </p>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-emerald-400">
                    {game.startingPrice}
                  </span>
                  <span className="text-slate-500">/ay'dan</span>
                </div>

                <ul className="space-y-1 mb-4">
                  {game.features.slice(0, 2).map((feature) => (
                    <li key={feature} className="text-sm text-slate-400">
                      • {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 text-emerald-400 font-medium group-hover:gap-3 transition-all">
                  Sunucu Kur
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* All games link */}
        <div className="text-center mt-8">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            Tüm oyunları gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

### 5. Unified Header (Brand Switcher)

**Dosya:** `apps/hyblegaming-web/src/components/layout/Header.tsx`

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Gamepad2, ChevronDown, Globe, Code2, Layout } from "lucide-react";

const brands = [
  { 
    id: "gaming", 
    name: "Hyble Gaming", 
    icon: Gamepad2, 
    href: "https://gaming.hyble.co",
    color: "emerald",
    active: true,
  },
  { 
    id: "main", 
    name: "Hyble", 
    icon: Globe, 
    href: "https://hyble.co",
    color: "amber",
    active: false,
  },
  { 
    id: "cloud", 
    name: "Hyble Cloud", 
    icon: Code2, 
    href: "https://cloud.hyble.co",
    color: "blue",
    active: false,
  },
];

export function Header() {
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Switcher */}
        <div className="relative">
          <button
            onClick={() => setBrandMenuOpen(!brandMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white">Hyble Gaming</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {brandMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2">
              {brands.map((brand) => (
                <a
                  key={brand.id}
                  href={brand.href}
                  className={`
                    flex items-center gap-3 px-4 py-2 hover:bg-slate-700 transition-colors
                    ${brand.active ? 'bg-slate-700/50' : ''}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg bg-${brand.color}-500 flex items-center justify-center`}>
                    <brand.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white">{brand.name}</span>
                  {brand.active && (
                    <span className="ml-auto text-xs text-emerald-400">Aktif</span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/games" className="text-slate-300 hover:text-white transition-colors">
            Oyunlar
          </Link>
          <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">
            Fiyatlandırma
          </Link>
          <Link href="/features" className="text-slate-300 hover:text-white transition-colors">
            Özellikler
          </Link>
          <Link href="/support" className="text-slate-300 hover:text-white transition-colors">
            Destek
          </Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-4">
          <Link
            href="https://id.hyble.co/auth/login"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Giriş
          </Link>
          <Link
            href="https://id.hyble.co/auth/register?redirect=gaming"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            Başla
          </Link>
        </div>
      </div>
    </header>
  );
}
```

### 6. Cross-Sell Banner

**Dosya:** `apps/hyblegaming-web/src/components/CrossSellBanner.tsx`

```tsx
import Link from "next/link";
import { Layout, ArrowRight, X } from "lucide-react";

export function CrossSellBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm">
        <Layout className="w-4 h-4 text-white" />
        <span className="text-white">
          <strong>Yeni!</strong> Oyun sunucun için web sitesi oluştur
        </span>
        <Link
          href="https://hyble.co/store?tag=gaming"
          className="flex items-center gap-1 text-white font-medium hover:underline"
        >
          Şablonları Gör
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
```

---

## Kontrol Listesi

- [ ] DNS records eklendi (gaming.hyble.co, game.hyble.co redirect)
- [ ] Nginx config güncellendi
- [ ] SSL sertifikası gaming.hyble.co için oluşturuldu
- [x] HybleGaming Hero section oluşturuldu
- [x] Game selector komponenti oluşturuldu
- [x] Header Hyble.co linki eklendi
- [x] Cross-sell banner eklendi
- [x] Hyble ID redirect parametresi destekleniyor
- [x] Mobile responsive test edildi
- [x] Dark theme (gaming default dark)

## Deployment

```bash
# DNS
# Cloudflare'da gaming.hyble.co A record ekle

# SSL
ssh root@178.63.138.97
certbot --nginx -d gaming.hyble.co

# Nginx reload
nginx -t && systemctl reload nginx

# Deploy
pnpm build --filter hyblegaming-web
pm2 restart hyblegaming-web
```
