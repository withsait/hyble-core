# HybleBilling Core - Özellik Seçimi ve Analiz

> **Amaç:** Hyble ekosistemi için modüler, reusable billing altyapısı
> **Kullanım Alanları:** Hyble (B2B SaaS), HybleGaming, Gelecek Vertikaller
> **Versiyon:** 1.0.0-planning

---

## 1. HYBLE EKOSİSTEM ANALİZİ

### 1.1 Mevcut ve Planlanan Projeler

| Proje | Tip | Billing İhtiyacı |
|-------|-----|------------------|
| **Hyble** | B2B SaaS | Subscription, One-time, Credits |
| **HybleGaming** | Game Hosting | Subscription, Credits, Top-up |
| **Gelecek Vertikaller** | TBD | Generic billing |

### 1.2 Ortak İhtiyaçlar (Tüm Projeler)

```
✅ Fatura oluşturma ve yönetimi
✅ Ödeme işleme (Stripe, iyzico, PayPal)
✅ Recurring billing (abonelik)
✅ Multi-currency (TRY, USD, EUR)
✅ Vergi hesaplama (KDV, VAT)
✅ Müşteri yönetimi
✅ Ürün/Servis tanımlama
✅ Hyble Credits (cross-vertical wallet)
✅ Kupon ve indirimler
✅ Email bildirimleri
✅ Webhook events
✅ Admin panel
```

### 1.3 Hyble'a Özgü (WHMCS'de Yok)

```
🆕 Hyble Credits - Cross-vertical prepaid wallet
🆕 Hyble ID - Unified authentication
🆕 Cross-vertical billing - Tek fatura, çoklu servis
🆕 Modern tech stack - Next.js, tRPC, Prisma
🆕 Real-time dashboard
🆕 API-first design
```

---

## 2. ÖZELLİK SEÇİMİ

### ✅ CORE (Mutlaka Olacak)

| # | Özellik | Öncelik | Açıklama |
|---|---------|---------|----------|
| 1 | **Invoice Management** | P0 | Fatura CRUD, PDF, numbering |
| 2 | **Payment Processing** | P0 | Gateway abstraction, tokenization |
| 3 | **Subscription/Recurring** | P0 | Billing cycles, auto-renewal |
| 4 | **Customer Management** | P0 | Customers, contacts, addresses |
| 5 | **Product Catalog** | P0 | Products, pricing, config options |
| 6 | **Service Management** | P0 | Customer services, status management |
| 7 | **Tax Engine** | P0 | VAT, KDV, multi-level tax |
| 8 | **Multi-Currency** | P0 | Currency conversion, display |
| 9 | **Coupon System** | P1 | Discounts, promo codes |
| 10 | **Hyble Credits** | P1 | Wallet, top-up, cross-vertical |
| 11 | **Email Notifications** | P1 | Templates, transactional emails |
| 12 | **Webhooks** | P1 | Event system, external notifications |
| 13 | **Admin API** | P0 | Full management API |
| 14 | **Client API** | P0 | Self-service API |

### ⏳ EXTENDED (Sonraki Fazlar)

| # | Özellik | Öncelik | Açıklama |
|---|---------|---------|----------|
| 15 | Quote System | P2 | Teklif oluşturma, kabul |
| 16 | Payment Reminders | P2 | Otomatik hatırlatıcılar |
| 17 | Late Fees | P2 | Gecikme ücreti |
| 18 | Refunds | P1 | İade işlemleri |
| 19 | Disputes | P3 | Chargeback yönetimi |
| 20 | Reports | P2 | Gelir raporları |
| 21 | Affiliate System | P3 | Ortaklık programı |

### ❌ EXCLUDED (Hyble İçin Gereksiz)

| Özellik | Neden Gereksiz |
|---------|----------------|
| Domain Management | Hyble domain satmıyor |
| cPanel/WHM Integration | Web hosting yok |
| Plesk/DirectAdmin | Web hosting yok |
| SSL Certificate Sales | MarketConnect gereksiz |
| Software Licensing | WHMCS'e özgü |
| Project Management | Ayrı tool kullanılabilir |
| Knowledgebase | Ayrı tool (docs site) |
| Network Status | Monitoring tool ile |

---

## 3. MODÜL MİMARİSİ

### 3.1 Package Yapısı

```
@hyble/billing-core/
├── packages/
│   ├── core/                 # Temel tipler ve utilities
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants/
│   │
│   ├── database/             # Prisma schema ve client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── client/
│   │
│   ├── invoices/             # Fatura modülü
│   │   ├── models/
│   │   ├── services/
│   │   ├── api/
│   │   └── pdf/
│   │
│   ├── payments/             # Ödeme modülü
│   │   ├── gateways/
│   │   │   ├── stripe/
│   │   │   ├── iyzico/
│   │   │   ├── paypal/
│   │   │   └── manual/
│   │   ├── services/
│   │   └── api/
│   │
│   ├── subscriptions/        # Abonelik modülü
│   │   ├── services/
│   │   ├── jobs/
│   │   └── api/
│   │
│   ├── customers/            # Müşteri modülü
│   │   ├── services/
│   │   └── api/
│   │
│   ├── products/             # Ürün kataloğu
│   │   ├── services/
│   │   └── api/
│   │
│   ├── tax/                  # Vergi motoru
│   │   ├── calculators/
│   │   ├── validators/       # VAT number validation
│   │   └── rules/
│   │
│   ├── currency/             # Para birimi
│   │   ├── converters/
│   │   └── formatters/
│   │
│   ├── coupons/              # Kupon sistemi
│   │   ├── services/
│   │   └── api/
│   │
│   ├── wallet/               # Hyble Credits
│   │   ├── services/
│   │   └── api/
│   │
│   ├── notifications/        # Bildirimler
│   │   ├── email/
│   │   ├── templates/
│   │   └── providers/
│   │
│   ├── webhooks/             # Webhook sistemi
│   │   ├── events/
│   │   └── dispatcher/
│   │
│   └── admin/                # Admin utilities
│       ├── dashboard/
│       └── reports/
│
├── apps/
│   ├── api/                  # Standalone API server
│   └── admin-ui/             # Admin panel (opsiyonel)
│
└── examples/
    ├── nextjs-integration/
    └── express-integration/
```

### 3.2 Entegrasyon Modları

```typescript
// Mode 1: Full Package (Monorepo içinde)
import { BillingCore } from '@hyble/billing-core';

const billing = new BillingCore({
  database: prismaClient,
  gateways: {
    stripe: { apiKey: '...' },
    iyzico: { apiKey: '...', secretKey: '...' }
  },
  currency: { default: 'TRY', supported: ['TRY', 'USD', 'EUR'] },
  tax: { defaultRate: 20, country: 'TR' }
});

// Mode 2: Individual Packages
import { InvoiceService } from '@hyble/billing-core/invoices';
import { PaymentService } from '@hyble/billing-core/payments';
import { StripeGateway } from '@hyble/billing-core/payments/gateways/stripe';

// Mode 3: API Client (Remote billing service)
import { BillingClient } from '@hyble/billing-client';

const billing = new BillingClient({
  apiUrl: 'https://billing-api.hyble.co',
  apiKey: '...'
});
```

---

## 4. KULLANIM SENARYOLARI

### 4.1 Hyble (B2B SaaS)

```typescript
// Örnek: SaaS subscription oluşturma
const subscription = await billing.subscriptions.create({
  customerId: 'cust_123',
  productId: 'prod_enterprise',
  billingCycle: 'MONTHLY',
  paymentMethod: { tokenId: 'tok_visa_123' }
});

// Örnek: Usage-based billing
await billing.invoices.addUsageCharge({
  customerId: 'cust_123',
  description: 'API Calls - December 2024',
  quantity: 150000,
  unitPrice: 0.001 // $0.001 per call
});
```

### 4.2 HybleGaming

```typescript
// Örnek: Game server satın alma
const order = await billing.orders.create({
  customerId: 'cust_456',
  items: [{
    productId: 'minecraft_premium',
    configOptions: {
      ram: '4096', // 4GB RAM
      slots: '20',
      location: 'tr-ist'
    }
  }],
  paymentMethod: 'hyble_credits' // Wallet ile ödeme
});

// Örnek: Credit top-up
await billing.wallet.topUp({
  customerId: 'cust_456',
  amount: 100,
  currency: 'TRY',
  paymentMethod: { gateway: 'iyzico', ... }
});
```

### 4.3 Cross-Vertical Billing

```typescript
// Tek müşteri, farklı vertikallerde servisler
const customer = await billing.customers.get('cust_789');

// Hyble SaaS servisi
const saasService = customer.services.find(s => s.vertical === 'hyble');

// Gaming servisi
const gameService = customer.services.find(s => s.vertical === 'gaming');

// Tek fatura, çoklu servis
const invoice = await billing.invoices.create({
  customerId: customer.id,
  items: [
    { serviceId: saasService.id, description: 'Hyble Pro - January' },
    { serviceId: gameService.id, description: 'Minecraft Server - January' }
  ]
});
```

---

## 5. TEKNİK KARARLAR

### 5.1 Tech Stack

| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| Language | TypeScript | Type safety, DX |
| Database | PostgreSQL + Prisma | Relational, type-safe ORM |
| Cache | Redis | Session, rate limiting |
| Queue | BullMQ | Background jobs |
| API | tRPC | Type-safe, fast |
| Validation | Zod | Runtime validation |

### 5.2 Design Principles

1. **Modular**: Her modül bağımsız çalışabilir
2. **Extensible**: Gateway, tax rule eklenebilir
3. **Type-safe**: End-to-end TypeScript
4. **Event-driven**: Webhook ve internal events
5. **Multi-tenant ready**: Tenant isolation support
6. **Testable**: Unit ve integration tests

### 5.3 Versioning Strategy

```
@hyble/billing-core@1.x.x - Core packages
@hyble/billing-client@1.x.x - API client
@hyble/billing-admin@1.x.x - Admin UI components
```

---

## 6. ROADMAP

### Phase 1: Foundation (Hafta 1-4)
- [ ] Core types ve utilities
- [ ] Database schema (Prisma)
- [ ] Customer management
- [ ] Product catalog
- [ ] Basic invoice CRUD

### Phase 2: Payments (Hafta 5-8)
- [ ] Payment gateway abstraction
- [ ] Stripe integration
- [ ] iyzico integration
- [ ] Tokenization
- [ ] Refunds

### Phase 3: Subscriptions (Hafta 9-12)
- [ ] Subscription management
- [ ] Recurring billing job
- [ ] Proration
- [ ] Upgrade/downgrade

### Phase 4: Advanced (Hafta 13-16)
- [ ] Hyble Credits (Wallet)
- [ ] Coupon system
- [ ] Tax engine (VAT validation)
- [ ] Multi-currency

### Phase 5: Polish (Hafta 17-20)
- [ ] Email notifications
- [ ] Webhooks
- [ ] Admin dashboard
- [ ] Documentation
- [ ] Examples

---

## 7. DOSYA YAPISI (Bu Klasör)

```
hyble-billing-core/
├── FEATURE_SELECTION.md      # Bu dosya
├── ARCHITECTURE.md           # Detaylı mimari
├── DATABASE_SCHEMA.md        # Prisma schema
├── API_REFERENCE.md          # API endpoints
├── GATEWAY_SPEC.md           # Payment gateway spec
├── INTEGRATION_GUIDE.md      # Entegrasyon rehberi
└── modules/
    ├── 01-CORE.md
    ├── 02-CUSTOMERS.md
    ├── 03-PRODUCTS.md
    ├── 04-INVOICES.md
    ├── 05-PAYMENTS.md
    ├── 06-SUBSCRIPTIONS.md
    ├── 07-TAX.md
    ├── 08-CURRENCY.md
    ├── 09-COUPONS.md
    ├── 10-WALLET.md
    ├── 11-NOTIFICATIONS.md
    └── 12-WEBHOOKS.md
```

---

**Sonraki Adım:** Bu dökümanı onayladıktan sonra her modül için detaylı spec yazılacak.
