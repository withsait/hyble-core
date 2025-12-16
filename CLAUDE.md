# Hyble Core

UK-registered hosting platform with two brands:
- **Hyble**: Web hosting, cloud services (Amber/Orange theme)
- **Mineble**: Minecraft game server hosting (Emerald/Green theme)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEDICATED SERVER                            │
│              (Hetzner - 178.63.138.97)                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    hyble-panel                          │   │
│  │                  (Container #1)                          │   │
│  │                                                          │   │
│  │  secret.hyble.net → (admin)   God Panel                 │   │
│  │  id.hyble.co      → (auth)    Unified Auth Hub          │   │
│  │  api.hyble.co     → /api      tRPC API                  │   │
│  │                                                          │   │
│  │  • PostgreSQL TEK YAZMA YETKİSİ                         │   │
│  │  • tRPC Server (tüm backend logic)                      │   │
│  │  • Cron Jobs (faturalama, temizlik)                     │   │
│  │  • External API (Hetzner, Stripe, Resend)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                    Internal Network                             │
│                    (tRPC over HTTP)                             │
│                           │                                     │
│         ┌─────────────────┴─────────────────┐                  │
│         ▼                                   ▼                  │
│  ┌─────────────────┐              ┌─────────────────┐          │
│  │   hyble-web     │              │  mineble-web    │          │
│  │  (Container #2) │              │  (Container #3) │          │
│  │                 │              │                 │          │
│  │ hyble.co        │              │ mineble.com     │          │
│  │ panel.hyble.co  │              │ panel.mineble   │          │
│  │ cloud.hyble.co  │              │ game.mineble    │          │
│  │                 │              │                 │          │
│  │ API Client ONLY │              │ API Client ONLY │          │
│  │ ❌ DB erişimi   │              │ ❌ DB erişimi   │          │
│  └─────────────────┘              └─────────────────┘          │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │ PostgreSQL  │  │    Redis    │                              │
│  │ hyble_core  │  │  (sessions) │                              │
│  └─────────────┘  └─────────────┘                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Nginx                               │   │
│  │            (Reverse Proxy + SSL)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
hyble-core/
├── apps/
│   ├── hyble-panel/         # Container 1: God Panel + Auth + API
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── admin/   # secret.hyble.net routes
│   │   │   │   ├── auth/    # id.hyble.co routes
│   │   │   │   └── api/     # api.hyble.co
│   │   │   ├── server/      # tRPC routers & services
│   │   │   └── lib/         # Auth, DB configs
│   │   └── Dockerfile
│   │
│   ├── hyble-web/           # Container 2: Hyble Frontend
│   │   ├── src/app/
│   │   │   ├── (marketing)/ # hyble.co
│   │   │   └── (panel)/     # panel.hyble.co
│   │   └── Dockerfile
│   │
│   └── mineble-web/         # Container 3: Mineble Frontend (later)
│
├── packages/
│   ├── @hyble/db/           # Prisma schema (hyble-panel only!)
│   ├── @hyble/api/          # tRPC client + types
│   ├── @hyble/ui/           # Shared UI components
│   ├── @hyble/email/        # Email templates (Resend)
│   └── @hyble/config/       # ESLint, TS, Tailwind configs
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

## Commands

```bash
# Development
pnpm dev                      # Start all apps
pnpm dev --filter hyble-panel # Start hyble-panel only
pnpm dev --filter hyble-web   # Start hyble-web only

# Build
pnpm build                    # Build all apps

# Database
pnpm db:generate              # Generate Prisma client
pnpm db:push                  # Push schema to DB
pnpm db:migrate               # Run migrations
pnpm db:studio                # Open Prisma Studio
```

## Domains

| Domain | Port | App | Description |
|--------|------|-----|-------------|
| secret.hyble.net | 3000 | hyble-panel | God Panel (admin only) |
| id.hyble.co | 3000 | hyble-panel | Auth Hub (all users) |
| api.hyble.co | 3000 | hyble-panel | tRPC API |
| hyble.co | 3001 | hyble-web | Marketing site |
| panel.hyble.co | 3001 | hyble-web | User panel |
| mineble.com | 3002 | mineble-web | Mineble (future) |

## Server Info

- **IP**: 178.63.138.97
- **User**: hyble
- **Apps**: /home/hyble/apps/hyble-core
- **Database**: PostgreSQL (local)
- **Cache**: Redis (local)

## Admin Access

- **URL**: https://secret.hyble.net
- **Email**: sait@hyble.co
