# Hyble Platform

UK-registered hosting platform with two brands:
- **Hyble**: Web hosting, cloud services
- **Mineble**: Minecraft game server hosting (future)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DEDICATED SERVER                        │
│              (Hetzner - 178.63.138.97)                      │
│                                                             │
│  apps/admin → ops.hyble.net (Admin Panel)                  │
│  apps/id    → id.hyble.co (Auth Service / User Portal)     │
│  apps/web   → hyble.co (Marketing Landing Page)            │
│                                                             │
│  PostgreSQL + Redis + Nginx                                 │
└─────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
hyble/
├── apps/
│   ├── admin/      # Admin Panel (Port 3002) - ops.hyble.net
│   ├── id/         # Auth Service (Port 3001) - id.hyble.co
│   └── web/        # Landing Page (Port 3000) - hyble.co
├── packages/
│   ├── config/     # Shared TypeScript configs
│   ├── database/   # Prisma schema + client
│   ├── email/      # Email templates (Resend)
│   └── ui/         # Shared UI components
└── tooling/        # Docker, Nginx configs
```

## Commands

```bash
pnpm dev              # Start all apps
pnpm dev --filter admin   # Start admin only
pnpm dev --filter id      # Start id only
pnpm dev --filter web     # Start web only
pnpm build            # Build all apps
pnpm db:push          # Push schema to database
pnpm db:generate      # Generate Prisma client
```

## Apps

### apps/admin (Port 3002)
Admin panel for platform management:
- User management (CRUD, 2FA, sessions)
- Organization management
- Security logs
- System stats

### apps/id (Port 3001)
Authentication hub:
- Login/Register
- 2FA (TOTP)
- Email verification
- Password reset
- User dashboard
- Profile management
- Session tracking
- Organization management

### apps/web (Port 3000)
Marketing landing page:
- Service showcase
- Pricing
- Contact

## Tech Stack

- Runtime: Node.js 20 LTS
- Framework: Next.js 14 (App Router)
- Monorepo: Turborepo + pnpm
- Language: TypeScript
- Styling: Tailwind CSS
- Database: PostgreSQL + Prisma
- Auth: NextAuth v5 (beta)
- Email: Resend

## Server Info

- IP: 178.63.138.97
- User: hyble
- Apps: /home/hyble/apps/
