# Hyble Core

UK-registered software platform with two brands:
- **Hyble**: Web hosting, cloud services, B2B SaaS
- **Mineble**: Minecraft game server hosting (Future)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEDICATED SERVER                            │
│              (Hetzner - 178.63.138.97)                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    hyble-panel                          │   │
│  │                  (Container #1 - Port 3000)             │   │
│  │                                                          │   │
│  │  secret.hyble.net → /admin     God Panel (Super Admin)  │   │
│  │  id.hyble.co      → /auth      Unified Auth Hub         │   │
│  │  api.hyble.co     → /api       tRPC API                 │   │
│  │                                                          │   │
│  │  • PostgreSQL TEK YAZMA YETKİSİ                         │   │
│  │  • tRPC Server (tüm backend logic)                      │   │
│  │  • Background Workers (deployment, email queue)         │   │
│  │  • Cron Jobs (billing, cleanup, uptime)                 │   │
│  │  • External APIs (Hetzner, Stripe, PayTR, Resend)       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                    Internal Network                             │
│                    (tRPC over HTTP)                             │
│                           │                                     │
│         ┌─────────────────┴─────────────────┐                  │
│         ▼                                   ▼                  │
│  ┌────────────────┐              ┌────────────────┐            │
│  │   hyble-web    │              │  mineble-web   │            │
│  │  (Port 3001)   │              │  (Port 3002)   │            │
│  │                │              │                │            │
│  │ hyble.co       │              │ mineble.com    │            │
│  │ panel.hyble.co │              │ (Future)       │            │
│  │ status.hyble.co│              │                │            │
│  │                │              │                │            │
│  │ API Client ONLY│              │ API Client ONLY│            │
│  │ ❌ DB erişimi  │              │ ❌ DB erişimi  │            │
│  └────────────────┘              └────────────────┘            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ PostgreSQL  │  │    Redis    │  │  R2/MinIO   │            │
│  │ hyble_core  │  │  (sessions) │  │  (storage)  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Nginx + Cloudflare (SSL/CDN)               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
hyble-core/
├── apps/
│   ├── hyble-panel/              # Container 1: Auth + API + God Panel
│   │   └── src/
│   │       ├── app/
│   │       │   ├── api/          # API Routes
│   │       │   │   ├── trpc/[trpc]/    # tRPC handler
│   │       │   │   ├── auth/           # NextAuth endpoints
│   │       │   │   ├── webhooks/       # Stripe, PayTR webhooks
│   │       │   │   └── cron/           # Scheduled jobs
│   │       │   ├── (god)/              # secret.hyble.net (God Panel)
│   │       │   │   ├── users/          # User management
│   │       │   │   ├── organizations/  # Org management
│   │       │   │   ├── cloud/          # Cloud admin
│   │       │   │   ├── support/        # Ticket admin
│   │       │   │   ├── billing/        # Billing admin
│   │       │   │   ├── logs/           # System logs
│   │       │   │   └── settings/       # System settings
│   │       │   ├── login/              # id.hyble.co/login
│   │       │   ├── register/           # id.hyble.co/register
│   │       │   ├── forgot-password/    # Password reset
│   │       │   ├── verify-2fa/         # 2FA verification
│   │       │   ├── dashboard/          # User dashboard
│   │       │   ├── settings/           # User settings
│   │       │   │   ├── security/       # 2FA, sessions
│   │       │   │   └── notifications/  # Notification prefs
│   │       │   └── organizations/      # Org management
│   │       ├── server/
│   │       │   ├── routers/            # tRPC routers
│   │       │   │   ├── auth.ts
│   │       │   │   ├── user.ts
│   │       │   │   ├── organization.ts
│   │       │   │   ├── security.ts
│   │       │   │   ├── wallet.ts       # FAZ2
│   │       │   │   ├── billing.ts      # FAZ2
│   │       │   │   ├── notify.ts       # FAZ3
│   │       │   │   ├── status.ts       # FAZ3
│   │       │   │   ├── support.ts      # FAZ3
│   │       │   │   ├── cloud.ts        # FAZ3
│   │       │   │   └── admin.ts        # God Panel APIs
│   │       │   └── trpc/
│   │       │       └── trpc.ts         # tRPC config
│   │       ├── lib/
│   │       │   ├── auth.ts             # NextAuth config
│   │       │   ├── db.ts               # Prisma client
│   │       │   └── services/           # Business logic
│   │       │       ├── notification.service.ts
│   │       │       ├── ticket.service.ts
│   │       │       ├── deployment.service.ts
│   │       │       └── billing.service.ts
│   │       ├── workers/                # Background jobs
│   │       │   ├── build.worker.ts     # Site deployment
│   │       │   └── email.worker.ts     # Email queue
│   │       ├── components/
│   │       │   ├── auth/               # Auth UI
│   │       │   ├── god/                # God Panel UI
│   │       │   └── ui/                 # Common UI
│   │       └── types/
│   │
│   ├── hyble-web/                # Container 2: Marketing + User Panel
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (marketing)/        # hyble.co landing
│   │       │   ├── (panel)/            # panel.hyble.co
│   │       │   │   ├── cloud/          # Cloud hosting panel
│   │       │   │   ├── billing/        # Billing & invoices
│   │       │   │   └── support/        # Support tickets
│   │       │   └── status/             # status.hyble.co (public)
│   │       ├── components/
│   │       └── content/                # MDX content
│   │
│   └── mineble-web/              # Container 3: Mineble (Future)
│
├── packages/
│   ├── db/                       # Prisma schema & client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── src/
│   │       └── client.ts
│   │
│   ├── api/                      # tRPC client exports
│   │   └── src/
│   │       ├── client.ts
│   │       └── types.ts
│   │
│   ├── ui/                       # Shared UI components
│   │   └── src/
│   │
│   ├── email/                    # Email templates (React Email)
│   │   └── src/
│   │       ├── templates/
│   │       └── send.ts
│   │
│   └── config/                   # Shared configs
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── tooling/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   └── Dockerfile.*
│   ├── nginx/
│   │   └── hyble.conf
│   └── scripts/
│       ├── setup.sh
│       └── backup.sh
│
└── docs/
    ├── cards/                    # FAZ specification cards
    │   ├── FAZ1-IAM.md
    │   ├── FAZ1-EMAIL.md
    │   ├── FAZ1-LANDING.md
    │   ├── FAZ1-INFRA.md
    │   ├── FAZ2-WALLET.md
    │   ├── FAZ2-BILLING.md
    │   ├── FAZ2-PIM.md
    │   ├── FAZ2-DELIVERY.md
    │   ├── FAZ2-CART.md
    │   ├── FAZ3-NOTIFY.md
    │   ├── FAZ3-STATUS.md
    │   ├── FAZ3-SUPPORT.md
    │   └── FAZ3-CLOUD.md
    ├── BACKLOG.md                # Deferred features
    └── PROJECT-STRUCTURE.md      # Path mapping reference
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20 LTS |
| Framework | Next.js 14 (App Router) |
| Monorepo | Turborepo + pnpm |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| API | tRPC v11 |
| Database | PostgreSQL 16 + Prisma |
| Cache | Redis 7 |
| Auth | NextAuth.js v5 (Auth.js) |
| Email | Resend + React Email |
| Payments | Stripe (Global) + PayTR (Turkey) |
| Storage | Cloudflare R2 / MinIO |
| Deployment | Docker + PM2 + Nginx |
| CDN/Security | Cloudflare |

## Commands

```bash
# Development
pnpm dev                          # Start all apps
pnpm dev --filter hyble-panel     # Start hyble-panel only
pnpm dev --filter hyble-web       # Start hyble-web only

# Build
pnpm build                        # Build all apps
pnpm build --filter hyble-panel   # Build specific app

# Database
pnpm db:generate                  # Generate Prisma client
pnpm db:push                      # Push schema to DB (dev)
pnpm db:migrate                   # Run migrations
pnpm db:studio                    # Open Prisma Studio
pnpm db:seed                      # Seed database

# Lint & Format
pnpm lint                         # Lint all packages
pnpm format                       # Format with Prettier
pnpm typecheck                    # TypeScript check

# Testing
pnpm test                         # Run tests
pnpm test:e2e                     # E2E tests (Playwright)
```

## Domains

| Domain | Port | App | Description |
|--------|------|-----|-------------|
| `secret.hyble.net` | 3000 | hyble-panel | God Panel (super admin) |
| `id.hyble.co` | 3000 | hyble-panel | Auth Hub (login/register) |
| `api.hyble.co` | 3000 | hyble-panel | tRPC API endpoint |
| `hyble.co` | 3001 | hyble-web | Marketing site |
| `panel.hyble.co` | 3001 | hyble-web | User panel |
| `status.hyble.co` | 3001 | hyble-web | Public status page |
| `cloud.hyble.co` | 3001 | hyble-web | Cloud hosting panel |
| `mineble.com` | 3002 | mineble-web | Mineble (future) |

## Server Info

| Property | Value |
|----------|-------|
| IP | 178.63.138.97 |
| Provider | Hetzner Dedicated |
| User | hyble |
| Apps Path | /home/hyble/apps/hyble-core |
| Database | PostgreSQL 16 (local) |
| Cache | Redis 7 (local) |
| Backup | Hetzner Storage Box |

## Development Phases

```
┌─────────────────────────────────────────────────────────────┐
│  FAZ 1: BEDROCK          │  FAZ 2: MONEY                   │
│  (Altyapı & Auth)        │  (Finans & Satış)               │
│                          │                                  │
│  ✅ FAZ1-INFRA           │  🔄 FAZ2-WALLET                 │
│  ✅ FAZ1-IAM             │  🔄 FAZ2-BILLING                │
│  ✅ FAZ1-EMAIL           │  📋 FAZ2-PIM                    │
│  📋 FAZ1-LANDING         │  📋 FAZ2-DELIVERY               │
│                          │  📋 FAZ2-CART                   │
├──────────────────────────┼──────────────────────────────────┤
│  FAZ 3: AUTOMATION       │  FAZ 4+: EXPANSION              │
│  (Otomasyon & Cloud)     │  (Genişleme)                    │
│                          │                                  │
│  📋 FAZ3-NOTIFY          │  📋 Git Integration             │
│  📋 FAZ3-STATUS          │  📋 Managed Databases           │
│  📋 FAZ3-SUPPORT         │  📋 Mineble Launch              │
│  📋 FAZ3-CLOUD           │  📋 Marketplace                 │
└─────────────────────────────────────────────────────────────┘

Status: ✅ Complete | 🔄 In Progress | 📋 Planned
```

### Phase Details

| Phase | Name | Modules | Description |
|-------|------|---------|-------------|
| **FAZ 1** | BEDROCK | INFRA, IAM, EMAIL, LANDING | Core infrastructure, authentication, email system |
| **FAZ 2** | MONEY | WALLET, BILLING, PIM, DELIVERY, CART | Payment processing, invoicing, product management |
| **FAZ 3** | AUTOMATION | NOTIFY, STATUS, SUPPORT, CLOUD | Notifications, status page, tickets, web hosting |
| **FAZ 4** | EXPANSION | Git, DB, Analytics | Advanced features, integrations |
| **FAZ 5** | SCALE | Multi-region, Enterprise | Scaling and enterprise features |

### FAZ 3 Priority Order

1. **FAZ3-NOTIFY** (P0) - Notification system (other modules depend on this)
2. **FAZ3-CLOUD** (P0) - Web hosting panel (main product)
3. **FAZ3-STATUS** (P1) - Public status page
4. **FAZ3-SUPPORT** (P1) - Ticket system

## AI Development Workflow

### Claude Code (Backend)
```
packages/db/prisma/                      # Database schema
apps/hyble-panel/src/server/routers/     # tRPC routers
apps/hyble-panel/src/lib/services/       # Business logic
apps/hyble-panel/src/workers/            # Background jobs
apps/hyble-panel/src/app/api/            # API routes
tooling/                                 # Infrastructure
```

### Gemini (Frontend)
```
apps/hyble-panel/src/components/         # Panel components
apps/hyble-panel/src/app/*/page.tsx      # Panel pages
apps/hyble-web/src/components/           # Marketing components
apps/hyble-web/src/app/                  # Marketing pages
packages/ui/src/                         # Shared UI
```

## Environment Variables

```env
# Database (Hetzner Server - Production)
DATABASE_URL="postgresql://hyble:HybleDB2024!Secure@178.63.138.97:5432/hyble_core"

# Redis (Session Management)
REDIS_URL="redis://localhost:6379"

# NextAuth (Generate with: openssl rand -base64 32)
AUTH_SECRET="your-auth-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://id.hyble.co"
AUTH_TRUST_HOST=true

# OAuth Providers (Get from Google/GitHub/Discord Developer Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Resend (Email)
RESEND_API_KEY="your-resend-api-key"

# App URLs (Production)
WEB_URL="https://hyble.co"
ID_URL="https://id.hyble.co"
ADMIN_URL="https://secret.hyble.net"
API_URL="https://api.hyble.co"
NEXT_PUBLIC_APP_URL="https://id.hyble.co"
NEXT_PUBLIC_API_URL="https://api.hyble.co"

# Cron Jobs
CRON_SECRET="your-cron-secret-key"

# Cloudflare Turnstile (Bot Protection)
TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""

# Payments (Future - FAZ2)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
PAYTR_MERCHANT_ID=""
PAYTR_MERCHANT_KEY=""
PAYTR_MERCHANT_SALT=""

# Cloudflare R2 Storage (Future - FAZ3)
CLOUDFLARE_API_TOKEN=""
CLOUDFLARE_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
```

## Quick Links

- **Documentation**: `docs/cards/`
- **Backlog**: `docs/BACKLOG.md`
- **Project Structure**: `docs/PROJECT-STRUCTURE.md`
- **God Panel**: https://secret.hyble.net

## Admin Access

- **God Panel**: https://secret.hyble.net
- **Admin Email**: sait@hyble.co
