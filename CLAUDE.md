# Hyble Core

UK-registered software platform with two main verticals:
- **Hyble Digital**: Corporate websites, templates, tools, custom orders (digital.hyble.co)
- **Hyble Studios**: Game servers, plugins, server packs, gaming solutions (studios.hyble.co)

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DEDICATED SERVER                               │
│                (Hetzner - 178.63.138.97)                            │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      hyble-core                              │    │
│  │                    (Container #1)                            │    │
│  │                      Port 3000                               │    │
│  │                                                              │    │
│  │  secret.hyble.net → Admin Panel (God Panel)                 │    │
│  │  id.hyble.co      → Auth Hub (Unified Auth)                 │    │
│  │  api.hyble.co     → tRPC API (Backend)                      │    │
│  │                                                              │    │
│  │  • PostgreSQL TEK YAZMA YETKİSİ                             │    │
│  │  • Cloud Infrastructure (deploy, domains, SSL)              │    │
│  │  • All backend logic & services                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                       Internal tRPC                                  │
│                              │                                       │
│  ┌───────────────────────────┼───────────────────────────┐          │
│  │                           │                           │          │
│  ▼                           ▼                           ▼          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   gateway   │    │   digital   │    │   studios   │          │
│  │  Port 3001  │    │  Port 3002  │    │  Port 3003  │          │
│  │             │    │             │    │             │          │
│  │ hyble.co    │    │ digital.    │    │ studios.    │          │
│  │             │    │ hyble.co    │    │ hyble.co    │          │
│  │ Portfolio   │    │             │    │             │          │
│  │ Landing     │    │ Templates   │    │ Servers     │          │
│  │ Wizard      │    │ Tools       │    │ Plugins     │          │
│  │             │    │ Custom Work │    │ Packs       │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                              │                                   │
│                              ▼                                   │
│                     ┌─────────────┐                              │
│                     │   console   │                              │
│                     │  Port 3004  │                              │
│                     │             │                              │
│                     │ console.    │                              │
│                     │ hyble.co    │                              │
│                     │             │                              │
│                     │ Dashboard   │                              │
│                     │ Billing     │                              │
│                     │ Support     │                              │
│                     └─────────────┘                              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐                               │
│  │ PostgreSQL  │  │    Redis    │                               │
│  │ hyble_core  │  │  (sessions) │                               │
│  └─────────────┘  └─────────────┘                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                        Nginx                             │    │
│  │              (Reverse Proxy + SSL)                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
hyble-core/
├── apps/
│   ├── core/              # Port 3000 - Backend Merkezi
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── admin/     # secret.hyble.net
│   │   │   │   ├── auth/      # id.hyble.co  
│   │   │   │   ├── api/       # api.hyble.co
│   │   │   │   └── dashboard/ # Core dashboard
│   │   │   ├── server/        # tRPC routers
│   │   │   └── lib/           # Auth, DB, services
│   │   └── Dockerfile
│   │
│   ├── gateway/           # Port 3001 - Landing & Portfolio
│   │   └── src/app/
│   │       ├── page.tsx       # hyble.co homepage
│   │       ├── about/         # About us
│   │       ├── contact/       # Contact
│   │       └── wizard/        # Vertical selection wizard
│   │
│   ├── digital/           # Port 3002 - Corporate Vertical
│   │   └── src/app/
│   │       ├── templates/     # Website templates
│   │       ├── tools/         # Web tools
│   │       ├── store/         # Marketplace
│   │       └── custom/        # Custom orders
│   │
│   ├── studios/           # Port 3003 - Gaming Vertical
│   │   └── src/app/
│   │       ├── servers/       # Game servers
│   │       ├── plugins/       # Plugin marketplace
│   │       ├── packs/         # Server packs
│   │       └── solutions/     # Custom gaming solutions
│   │
│   └── console/           # Port 3004 - User Panel
│       └── src/app/
│           ├── dashboard/     # Unified dashboard
│           ├── billing/       # Billing & invoices
│           ├── wallet/        # Hyble Credits
│           ├── support/       # Tickets
│           └── settings/      # Profile, security
│
├── packages/
│   ├── @hyble/db/         # Prisma schema (core only!)
│   ├── @hyble/ui/         # Shared UI components
│   ├── @hyble/email/      # Email templates (Resend)
│   └── @hyble/config/     # ESLint, TS, Tailwind configs
│
└── tooling/
    ├── docker/
    │   └── docker-compose.yml
    └── nginx/
        └── hyble.conf
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20 LTS |
| Framework | Next.js 14 (App Router) |
| Monorepo | Turborepo + pnpm |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| API | tRPC v11 |
| Database | PostgreSQL 16 + Prisma |
| Cache | Redis 7 |
| Auth | NextAuth.js v5 |
| Email | Resend |
| Deployment | Docker + PM2 |

## Apps & Domains

| App | Port | Domain(s) | Purpose |
|-----|------|-----------|---------|
| core | 3000 | secret.hyble.net, id.hyble.co, api.hyble.co | Backend, Admin, Auth |
| gateway | 3001 | hyble.co | Landing, Portfolio, Wizard |
| digital | 3002 | digital.hyble.co | Corporate vertical |
| studios | 3003 | studios.hyble.co | Gaming vertical |
| console | 3004 | console.hyble.co | User dashboard |

## Commands

```bash
# Development
pnpm dev                      # Start all apps
pnpm dev:core                 # Start core only (port 3000)
pnpm dev:gateway              # Start gateway only (port 3001)
pnpm dev:digital              # Start digital only (port 3002)
pnpm dev:studios              # Start studios only (port 3003)
pnpm dev:console              # Start console only (port 3004)

# Build
pnpm build                    # Build all apps

# Database
pnpm db:generate              # Generate Prisma client
pnpm db:push                  # Push schema to DB
pnpm db:migrate               # Run migrations
pnpm db:studio                # Open Prisma Studio
```

## Server Info

- **IP**: 178.63.138.97
- **User**: root
- **Apps**: /home/hyble/apps/hyble-core
- **Database**: PostgreSQL (local)
- **Cache**: Redis (local)

## Key Principles

1. **Core = God Panel**: Only core has DB write access
2. **Frontend apps = API clients**: gateway, digital, studios, console use tRPC
3. **Unified Auth**: id.hyble.co handles all authentication
4. **Hyble Credits**: Single wallet system across all verticals
5. **Vertical Separation**: Digital and Studios are independent, sellable units

---

## Domain Architecture

### id.hyble.co (Auth Gateway + Account)
Minimal auth gateway - sadece login/register ve hesap yonetimi:
- `/login` - Giris yap → console.hyble.co/dashboard'a yonlendir
- `/register` - Kayit ol → console.hyble.co/dashboard'a yonlendir
- `/account` - Hesap Merkezi (Collapsible sections):
  - Profil Bilgileri (ad, soyad, dil, para birimi)
  - Guvenlik (email, sifre, 2FA)
  - Bagli Hesaplar (Google, GitHub, Discord)
  - Aktif Oturumlar
  - Tehlikeli Bolge (hesabi dondur/sil)
- `/verify-email`, `/reset-password`, `/verify-2fa` - Auth akislari
- `/logout` - Cikis

### console.hyble.co (User Panel)
Kullanici paneli - tum servisler tek yerden:
- `/dashboard` - Ana sayfa
- `/billing` - Faturalar, odemeler, abonelikler
- `/wallet` - Hyble Credits
- `/websites` - Web siteleri (Digital)
- `/servers` - Sunucular (Studios)
- `/support` - Destek talepleri
- Sidebar'da "Hesap" butonu → id.hyble.co/account

### secret.hyble.net (Admin Panel)
Ayri domain guvenlik icin (.net vs .co):
- `/admin/dashboard` - Genel istatistikler
- `/admin/users` - Kullanici yonetimi (console'daki her seyi gor/duzenle)
- `/admin/wallets` - Tum cuzdanlar
- `/admin/billing` - Tum faturalar
- `/admin/support` - Tum ticketlar
- `/admin/...` - Diger yonetim panelleri


---

## HybleBilling Core

**Status:** Implementation Phase  
**Spec Files:** `/HybleBilling/hyble-billing-core/`

### Overview

Modular billing infrastructure for the entire Hyble ecosystem.

### Features

- Invoice Management
- Payment Processing (Stripe, iyzico, PayPal)
- Recurring Billing (Subscriptions)
- Hyble Credits (Cross-vertical Wallet)
- Multi-Currency (TRY, USD, EUR)
- Tax Engine (KDV, VAT)
- Coupon System

### Implementation Files

```
/HybleBilling/hyble-billing-core/
├── FEATURE_SELECTION.md     # Selected features
├── DATABASE_SCHEMA.md       # Prisma models (24)
├── API_REFERENCE.md         # tRPC endpoints (80+)
└── INTEGRATION_GUIDE.md     # Integration guide
```

### Key Locations

- **Database:** `packages/db/prisma/schema.prisma`
- **Package:** `packages/billing/`
- **API:** `apps/core/src/server/routers/billing/`
- **Admin UI:** `apps/core/src/app/admin/billing/`
- **Console UI:** `apps/console/src/app/billing/`

### Quick Start

```bash
# See implementation prompt
cat CLAUDE_CODE_BILLING_PROMPT.md

# See detailed guide
cat HYBLEBILLING_IMPLEMENTATION.md
```
