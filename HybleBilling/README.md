# HybleBilling - Modüler Billing Altyapısı

> **Proje:** HybleBilling Core
> **Amaç:** Hyble ekosistemi için reusable billing modülü
> **Versiyon:** 1.0.0-planning

---

## 📁 Proje Yapısı

```
HybleBilling/
│
├── 📄 README.md                          # Bu dosya
├── 📄 WHMCS_FEATURES_ANALYSIS.md         # WHMCS özellik analizi (referans)
│
├── 📁 specs/                             # WHMCS-based detaylı spec'ler
│   ├── 01-BILLING.md                     # (Referans için)
│   ├── 02-CUSTOMERS.md
│   ├── ...
│   └── 09-WALLET.md
│
└── 📁 hyble-billing-core/                # ⭐ ANA MODÜL
    ├── 📄 FEATURE_SELECTION.md           # Seçilen özellikler
    ├── 📄 DATABASE_SCHEMA.md             # Prisma schema
    ├── 📄 API_REFERENCE.md               # tRPC API endpoints
    └── 📄 INTEGRATION_GUIDE.md           # Entegrasyon rehberi
```

---

## 🎯 HybleBilling Core Nedir?

**HybleBilling Core**, Hyble ekosistemindeki tüm projelerde kullanılabilecek modüler bir billing altyapısıdır.

### Kullanım Alanları

| Proje | Kullanım |
|-------|----------|
| **Hyble** (B2B SaaS) | Subscription billing, usage-based |
| **HybleGaming** | Game server satışı, credits |
| **Gelecek Projeler** | Generic billing |

### Temel Özellikler

```
✅ Fatura Yönetimi (Invoice)
✅ Ödeme İşleme (Stripe, iyzico, PayPal)
✅ Abonelik Sistemi (Recurring)
✅ Hyble Credits (Cross-vertical Wallet)
✅ Multi-Currency (TRY, USD, EUR)
✅ Vergi Motoru (KDV, VAT)
✅ Kupon Sistemi
✅ Webhook Events
✅ Type-safe API (tRPC)
```

---

## 📊 WHMCS vs HybleBilling Core

### Dahil Edilen Özellikler

| Kategori | WHMCS | HybleBilling |
|----------|-------|--------------|
| Invoice Management | ✅ | ✅ |
| Recurring Billing | ✅ | ✅ |
| Payment Gateways | ✅ (100+) | ✅ (3-5 core) |
| Multi-Currency | ✅ | ✅ |
| Tax Engine | ✅ | ✅ |
| Coupons | ✅ | ✅ |
| Customer Management | ✅ | ✅ |
| Product Catalog | ✅ | ✅ |
| Wallet/Credits | ❌ | ✅ 🆕 |
| Cross-Vertical | ❌ | ✅ 🆕 |
| tRPC API | ❌ | ✅ 🆕 |
| Modern Stack | ❌ (PHP) | ✅ (TS/Next) |

### Hariç Tutulan Özellikler

| Özellik | Neden |
|---------|-------|
| Domain Management | Hyble domain satmıyor |
| cPanel/WHM | Web hosting yok |
| SSL Automation | Gereksiz |
| Software Licensing | WHMCS'e özgü |
| Project Management | Ayrı tool |
| Knowledgebase | Docs site var |

---

## 🛠 Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Language | TypeScript |
| Database | PostgreSQL + Prisma |
| API | tRPC |
| Cache | Redis |
| Queue | BullMQ |
| Runtime | Node.js |

---

## 📦 Modül Yapısı

```
@hyble/billing-core/
├── packages/
│   ├── core/              # Types, utils
│   ├── database/          # Prisma client
│   ├── invoices/          # Invoice module
│   ├── payments/          # Payment processing
│   │   └── gateways/      # Stripe, iyzico, etc.
│   ├── subscriptions/     # Recurring billing
│   ├── customers/         # Customer management
│   ├── products/          # Product catalog
│   ├── tax/               # Tax engine
│   ├── currency/          # Multi-currency
│   ├── coupons/           # Discount codes
│   ├── wallet/            # Hyble Credits
│   ├── notifications/     # Email
│   └── webhooks/          # Event system
│
└── examples/
    ├── hyble-integration/
    └── gaming-integration/
```

---

## 🚀 Quick Start

### 1. Installation

```bash
pnpm add @hyble/billing-core
```

### 2. Initialize

```typescript
import { BillingCore, StripeGateway } from '@hyble/billing-core';

const billing = new BillingCore({
  prisma,
  gateways: [new StripeGateway({ secretKey: '...' })],
  currency: { default: 'TRY' },
  tax: { defaultRate: 20 },
});
```

### 3. Use

```typescript
// Create customer
const customer = await billing.customers.create({
  email: 'user@example.com',
  firstName: 'John',
});

// Create invoice
const invoice = await billing.invoices.create({
  customerId: customer.id,
  items: [{ description: 'Pro Plan', unitPrice: 99 }],
});

// Process payment
await billing.payments.process({
  invoiceId: invoice.id,
  gatewaySlug: 'stripe',
});
```

---

## 📅 Roadmap

| Faz | Süre | İçerik |
|-----|------|--------|
| **P1: Foundation** | 4 hafta | Core, DB, Customers, Products, Invoices |
| **P2: Payments** | 4 hafta | Gateways, Tokens, Refunds |
| **P3: Subscriptions** | 4 hafta | Recurring, Proration, Upgrades |
| **P4: Advanced** | 4 hafta | Wallet, Coupons, Tax, Multi-currency |
| **P5: Polish** | 4 hafta | Notifications, Webhooks, Docs |

**Toplam:** ~20 hafta (5 ay)

---

## 📚 Dokümantasyon

| Dosya | İçerik |
|-------|--------|
| [FEATURE_SELECTION.md](./hyble-billing-core/FEATURE_SELECTION.md) | Seçilen özellikler ve analiz |
| [DATABASE_SCHEMA.md](./hyble-billing-core/DATABASE_SCHEMA.md) | Prisma schema (24 model) |
| [API_REFERENCE.md](./hyble-billing-core/API_REFERENCE.md) | 80+ API endpoint |
| [INTEGRATION_GUIDE.md](./hyble-billing-core/INTEGRATION_GUIDE.md) | Next.js/tRPC entegrasyonu |

---

## 🔗 İlişkili Projeler

- **Hyble** - B2B SaaS platform
- **HybleGaming** - Game server hosting
- **Hyble ID** - Unified authentication
- **Pickaxe** - Game server daemon

---

**Hazırlayan:** Claude AI  
**Tarih:** Aralık 2024  
**Durum:** Planning Phase
