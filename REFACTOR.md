# HYBLE ECOSYSTEM REFACTOR - MASTER TASK

## PROJE BAĞLAMI

Hyble, tek marka altında 3 vertikal sunan bir platform:
- **Studios** (studios.hyble.co): Gaming - Minecraft, Roblox, Rust hosting
- **Digital** (digital.hyble.co): Kurumsal web hizmetleri
- **Cloud** (cloud.hyble.co): SaaS ürünleri (GamePanel, WebStore)

Mevcut yapı refactor edilerek yeni mimariye geçilecek.

---

## MEVCUT YAPI

```
apps/
├── hyble-admin/      → core içine taşınacak
├── hyble-panel/      → core olarak kalacak
├── hyble-web/        → gateway + console olarak bölünecek
└── hyblegaming-web/  → studios olarak rename

packages/
├── @hyble/api        → kalıyor
├── @hyble/config     → kalıyor
├── @hyble/db         → kalıyor + güncelleme
├── @hyble/email      → kalıyor
└── @hyble/ui         → kalıyor + Universal Bar ekleme
```

---

## HEDEF YAPI

```
apps/
├── core/             # secret.hyble.net + api.hyble.co (God Panel + API)
├── gateway/          # hyble.co (Landing, yönlendirme)
├── studios/          # studios.hyble.co (Gaming vertical)
├── digital/          # digital.hyble.co (Kurumsal vertical)
├── cloud/            # cloud.hyble.co (SaaS vertical)
└── console/          # console.hyble.co (Müşteri paneli)

packages/
├── @hyble/api        # tRPC client
├── @hyble/auth       # YENİ: SSO, Hyble ID, session
├── @hyble/billing    # YENİ: Credits, Cart, Checkout
├── @hyble/config     # ESLint, TS, Tailwind
├── @hyble/db         # Prisma schemas
├── @hyble/email      # Email templates
└── @hyble/ui         # Shared components + Universal Bar
```

---

## DOMAIN HARİTASI

| Domain | App | Port | Açıklama |
|--------|-----|------|----------|
| secret.hyble.net | core | 3000 | Admin panel (gizli) |
| api.hyble.co | core | 3000 | tRPC API |
| hyble.co | gateway | 3001 | Ana landing |
| studios.hyble.co | studios | 3002 | Gaming marketing |
| digital.hyble.co | digital | 3003 | Kurumsal marketing |
| cloud.hyble.co | cloud | 3004 | SaaS marketing |
| console.hyble.co | console | 3005 | Müşteri dashboard |

---

## RENK PALETİ

### Hyble Primary (Mevcut - Değişmeyecek)
```javascript
primary: {
  50: "#EFF6FF",
  100: "#DBEAFE",
  200: "#BFDBFE",
  300: "#93C5FD",
  400: "#60A5FA",
  500: "#3B82F6",  // Ana renk
  600: "#2563EB",
  700: "#1D4ED8",
  800: "#1E40AF",
  900: "#1E3A8A",
}
```

### Vertical Renkleri
```javascript
// Studios - Emerald (Gaming)
studios: {
  50: "#ECFDF5",
  100: "#D1FAE5",
  200: "#A7F3D0",
  300: "#6EE7B7",
  400: "#34D399",
  500: "#10B981",  // Ana renk
  600: "#059669",
  700: "#047857",
  800: "#065F46",
  900: "#064E3B",
}

// Digital - Amber (Kurumsal)
digital: {
  50: "#FFFBEB",
  100: "#FEF3C7",
  200: "#FDE68A",
  300: "#FCD34D",
  400: "#FBBF24",
  500: "#F59E0B",  // Ana renk
  600: "#D97706",
  700: "#B45309",
  800: "#92400E",
  900: "#78350F",
}

// Cloud - Indigo (SaaS)
cloud: {
  50: "#EEF2FF",
  100: "#E0E7FF",
  200: "#C7D2FE",
  300: "#A5B4FC",
  400: "#818CF8",
  500: "#6366F1",  // Ana renk
  600: "#4F46E5",
  700: "#4338CA",
  800: "#3730A3",
  900: "#312E81",
}
```

### Ortak Renkler (Tüm App'lerde)
```javascript
background: {
  primary: "#FFFFFF",
  secondary: "#F8FAFC",
  tertiary: "#F1F5F9",
}

foreground: {
  primary: "#0F172A",
  secondary: "#475569",
  muted: "#94A3B8",
}

border: {
  DEFAULT: "#E2E8F0",
  light: "#F1F5F9",
}
```

---

## GÖREVLER

### TASK 1: Cleanup & Rename
**Öncelik: 1 | Süre: 1-2 saat**

1. `apps/hyblegaming-web/` → `apps/studios/` olarak rename
2. `apps/studios/package.json` güncelle:
   - name: `@hyble/gaming` → `@hyble/studios`
   - port: 3002
3. Tüm import path'leri güncelle
4. `apps/hyble-admin/` içeriğini `apps/hyble-panel/src/app/admin/` ile birleştir
5. `apps/hyble-admin/` klasörünü sil
6. `apps/hyble-panel/` → `apps/core/` olarak rename
7. Root `package.json` script'lerini güncelle

**Doğrulama:**
```bash
pnpm dev --filter @hyble/core
pnpm dev --filter @hyble/studios
```

---

### TASK 2: Gateway App Oluştur
**Öncelik: 2 | Süre: 2-3 saat**

1. `apps/gateway/` oluştur (Next.js 14 App Router)
2. Minimal landing page:
   - Hero section (slogan + 3 CTA kartı)
   - Studios, Digital, Cloud'a yönlendirme
   - Universal Bar (sonra eklenecek)
3. Tema: Hyble Primary (mevcut mavi)

**Dosya yapısı:**
```
apps/gateway/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
│       ├── Hero.tsx
│       └── VerticalCards.tsx
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

**package.json:**
```json
{
  "name": "@hyble/gateway",
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

---

### TASK 3: Console App Oluştur
**Öncelik: 2 | Süre: 3-4 saat**

1. `apps/console/` oluştur
2. `apps/hyble-web/src/app/dashboard/` içeriğini taşı
3. `apps/hyble-web/src/components/` ilgili component'leri taşı
4. Sidebar'ı modüler yap (Gaming/Digital/Cloud context switcher)
5. Checkout flow'u buraya taşı

**Taşınacak route'lar:**
- `/dashboard/*` → `/`
- `/settings/*` → `/settings/*`
- `/organizations/*` → `/organizations/*`

**Dosya yapısı:**
```
apps/console/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (dashboard)
│   │   ├── checkout/
│   │   ├── billing/
│   │   ├── settings/
│   │   ├── support/
│   │   └── [vertical]/  # gaming, digital, cloud
│   └── components/
│       ├── layout/
│       │   ├── Sidebar.tsx
│       │   ├── VerticalSwitcher.tsx
│       │   └── Header.tsx
│       └── ...
├── package.json (port: 3005)
└── ...
```

---

### TASK 4: Digital & Cloud Apps (Skeleton)
**Öncelik: 3 | Süre: 1-2 saat**

1. `apps/digital/` oluştur (iskelet)
   - Tema: Amber
   - Port: 3003
   - Placeholder sayfalar

2. `apps/cloud/` oluştur (iskelet)
   - Tema: Indigo
   - Port: 3004
   - Placeholder sayfalar

---

### TASK 5: @hyble/auth Package
**Öncelik: 1 | Süre: 4-5 saat**

1. `packages/auth/` oluştur
2. SSO logic'i taşı (hyble-panel'den)
3. Cross-domain cookie yönetimi
4. Auth modal component

**Dosya yapısı:**
```
packages/auth/
├── src/
│   ├── index.ts
│   ├── session.ts        # Cookie/session management
│   ├── oauth.ts          # Google, Discord providers
│   ├── middleware.ts     # Next.js auth middleware
│   ├── hooks/
│   │   ├── useUser.ts
│   │   ├── useSession.ts
│   │   └── useAuth.ts
│   └── components/
│       ├── AuthModal.tsx
│       ├── AuthProvider.tsx
│       └── UserMenu.tsx
├── package.json
└── tsconfig.json
```

**Cookie config:**
```typescript
export const SESSION_COOKIE_CONFIG = {
  name: 'hyble_session',
  domain: '.hyble.co',
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60,
};
```

---

### TASK 6: @hyble/billing Package
**Öncelik: 2 | Süre: 4-5 saat**

1. `packages/billing/` oluştur
2. Unified Cart logic
3. Hyble Credits yönetimi
4. Checkout flow

**Dosya yapısı:**
```
packages/billing/
├── src/
│   ├── index.ts
│   ├── cart.ts
│   ├── credits.ts
│   ├── checkout.ts
│   ├── subscription.ts
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useCredits.ts
│   │   └── useCheckout.ts
│   └── components/
│       ├── CartDrawer.tsx
│       ├── CartIcon.tsx
│       ├── CreditsBadge.tsx
│       └── CheckoutWizard.tsx
├── package.json
└── tsconfig.json
```

---

### TASK 7: Universal Bar Component
**Öncelik: 1 | Süre: 2-3 saat**

`packages/ui/src/components/UniversalBar.tsx` oluştur

**Component spec:**
```typescript
interface UniversalBarProps {
  activeApp: 'gateway' | 'studios' | 'digital' | 'cloud' | 'console';
}

// Giriş yapmamış:
// ◆ Hyble │ Studios  Digital  Cloud │              [Giriş]

// Giriş yapmış:
// ◆ Hyble │ Studios  Digital  Cloud │  🛒 2  │ ₺150 │ Sait ▼
```

**Özellikler:**
- Aktif app vurgulu (underline veya renk)
- Cart icon + badge
- Credits badge
- User dropdown
- Mobile responsive (hamburger)

---

### TASK 8: Prisma Schema Güncelleme
**Öncelik: 2 | Süre: 2-3 saat**

1. Platform enum güncelle:
```prisma
enum Platform {
  HYBLE
  STUDIOS
  DIGITAL
  CLOUD
}
```

2. ServiceType enum ekle:
```prisma
enum ServiceType {
  GAME_SERVER
  WEB_PROJECT
  SAAS_LICENSE
  DIGITAL_PRODUCT
}
```

3. Ban sistemini servis bazlı yap:
```prisma
model UserBan {
  scope       BanScope    @default(SERVICE)
  serviceType ServiceType?
}

enum BanScope {
  SERVICE
  ECOSYSTEM
}
```

---

### TASK 9: Tema Sistemi & Tailwind Preset
**Öncelik: 3 | Süre: 2-3 saat**

`packages/config/tailwind/preset.js` oluştur:

```javascript
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Hyble Primary - Mevcut mavi korunuyor
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // Studios - Emerald
        studios: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        // Digital - Amber
        digital: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // Cloud - Indigo
        cloud: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        // Ortak
        background: {
          primary: "#FFFFFF",
          secondary: "#F8FAFC",
          tertiary: "#F1F5F9",
        },
        foreground: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
        border: {
          DEFAULT: "#E2E8F0",
          light: "#F1F5F9",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "pulse-slow": "pulse 3s infinite",
        "bounce-slow": "bounce 2s infinite",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)" },
        },
      },
    },
  },
};
```

---

### TASK 10: Turbo.json & Workspace Güncelle
**Öncelik: 1 | Süre: 30 dakika**

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", ".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^lint"] },
    "clean": { "cache": false },
    "db:generate": { "cache": false },
    "db:push": { "cache": false },
    "db:migrate": { "cache": false }
  }
}
```

**Root package.json scripts:**
```json
{
  "scripts": {
    "dev": "turbo dev",
    "dev:core": "turbo dev --filter=@hyble/core",
    "dev:gateway": "turbo dev --filter=@hyble/gateway",
    "dev:studios": "turbo dev --filter=@hyble/studios",
    "dev:digital": "turbo dev --filter=@hyble/digital",
    "dev:cloud": "turbo dev --filter=@hyble/cloud",
    "dev:console": "turbo dev --filter=@hyble/console"
  }
}
```

---

## RESPONSIVE TASARIM KURALLARI

### Breakpoints
```javascript
// Tailwind default breakpoints
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Laptop
  'xl': '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
}
```

### Mobile-First Yaklaşım
- Base styles = mobile
- `sm:`, `md:`, `lg:` ile büyük ekranlara genişlet
- Touch-friendly: min 44x44px tıklanabilir alan
- Hamburger menu < 768px

### Container Genişlikleri
```javascript
container: {
  center: true,
  padding: {
    DEFAULT: '1rem',
    sm: '2rem',
    lg: '4rem',
    xl: '6rem',
  },
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
}
```

---

## PAGESPEED OPTİMİZASYONU

### Hedef Skorlar
| Metrik | Hedef |
|--------|-------|
| Performance | 90+ |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 95+ |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |

### Next.js Optimizasyonları

**next.config.js:**
```javascript
module.exports = {
  // Image optimizasyonu
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 gün
  },
  
  // Compression
  compress: true,
  
  // Production optimizations
  swcMinify: true,
  
  // Bundle analyzer (dev only)
  ...(process.env.ANALYZE && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({ enabled: true })
      );
      return config;
    },
  }),
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};
```

### Component Optimizasyonları

**Lazy Loading:**
```typescript
// Heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false,
});

// Below-the-fold sections
const Footer = dynamic(() => import('./Footer'));
```

**Image Handling:**
```typescript
// next/image kullan, <img> kullanma
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority // LCP için above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**Font Optimizasyonu:**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

### CSS Optimizasyonları

**Kritik CSS:**
- Above-the-fold CSS inline
- Non-critical CSS lazy load

**Tailwind Purge:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  // Unused CSS otomatik kaldırılır
};
```

### Animasyon Performansı

**GPU-Accelerated Properties:**
```css
/* Tercih et */
transform: translateX(), translateY(), scale(), rotate()
opacity: 0-1

/* Kaçın (layout thrashing) */
width, height, top, left, margin, padding
```

**will-change Kullanımı:**
```css
.animated-element {
  will-change: transform, opacity;
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## SIRALI YÜRÜTME PLANI

```
Faz 1 (Gün 1):
├── TASK 1: Cleanup & Rename
├── TASK 10: Turbo.json güncelle
└── Test: pnpm dev çalışıyor mu?

Faz 2 (Gün 2):
├── TASK 5: @hyble/auth package
├── TASK 7: Universal Bar
└── Test: SSO çalışıyor mu?

Faz 3 (Gün 3):
├── TASK 2: Gateway app
├── TASK 3: Console app
└── Test: Yönlendirmeler çalışıyor mu?

Faz 4 (Gün 4):
├── TASK 6: @hyble/billing package
├── TASK 8: Prisma güncelleme
└── Test: Cart + Checkout çalışıyor mu?

Faz 5 (Gün 5):
├── TASK 4: Digital & Cloud skeletons
├── TASK 9: Tema sistemi
└── Final test: Tüm app'ler ayakta mı?
```

---

## KRİTİK KURALLAR

1. **Mineble referanslarını tamamen kaldır** - Artık studios.hyble.co
2. **id.hyble.co kaldır** - SSO artık modal ile
3. **DB erişimi sadece core'da** - Diğer app'ler tRPC client
4. **Cookie domain: .hyble.co** - Tüm subdomain'lerde geçerli
5. **Her app kendi port'unda** - 3000-3005 arası
6. **Universal Bar tüm app'lerde** - Tutarlı UX
7. **Hyble primary mavi korunsun** - #3B82F6 değişmeyecek
8. **Mobile-first responsive** - Base = mobile
9. **PageSpeed 90+** - Lazy load, image opt, code split

---

## TEST CHECKLIST

### Her task sonrası:
- [ ] `pnpm build` başarılı mı?
- [ ] `pnpm dev` çalışıyor mu?
- [ ] Type error yok mu?
- [ ] Import path'ler doğru mu?

### Migration sonrası:
- [ ] SSO cross-domain çalışıyor mu?
- [ ] Cart tüm site'larda senkron mu?
- [ ] Universal Bar tüm app'lerde görünüyor mu?
- [ ] Tema renkleri doğru mu?

### Responsive test:
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12)
- [ ] 768px (iPad)
- [ ] 1024px (Laptop)
- [ ] 1440px (Desktop)
- [ ] 1920px (Full HD)

### PageSpeed test:
- [ ] Lighthouse Desktop 90+
- [ ] Lighthouse Mobile 85+
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] FID < 100ms
