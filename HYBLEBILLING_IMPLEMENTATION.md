# HybleBilling Core - Claude Code Implementation Prompt

> **Proje:** HybleBilling Core Implementation
> **Mod:** AUTONOMOUS (soru sorma, direkt implement et)
> **Yaklaşım:** Build → Test → Security Audit → Deploy → Verify

---

## 🎯 GÖREV

HybleBilling Core sistemini hyble-core monorepo'ya tamamen entegre et. Tüm spec dosyaları `/HybleBilling/` klasöründe mevcut.

**KURAL:** Hiçbir şey sorma. Belirsiz durumlarda en mantıklı kararı ver ve devam et. Her adımı test et. Bitince beni bekle.

---

## 📁 PROJE YAPISI

```
C:\Users\ahmet\Desktop\hyble-core\
├── apps/
│   ├── core/           → Backend (secret.hyble.net, api.hyble.co)
│   ├── console/        → User Dashboard (console.hyble.co) - Billing UI
│   ├── gateway/        → Landing (hyble.co)
│   ├── digital/        → Digital vertical
│   └── studios/        → Gaming vertical
├── packages/
│   ├── db/             → Prisma (packages/db/prisma/schema.prisma)
│   ├── billing/        → 🎯 BURAYA IMPLEMENT ET
│   ├── auth/
│   ├── email/
│   └── ui/
└── HybleBilling/       → Spec dosyaları (referans)
    ├── hyble-billing-core/
    │   ├── FEATURE_SELECTION.md
    │   ├── DATABASE_SCHEMA.md
    │   ├── API_REFERENCE.md
    │   └── INTEGRATION_GUIDE.md
    └── specs/
```

---

## 🚀 IMPLEMENTATION PLANI

### PHASE 1: DATABASE SCHEMA (Day 1)

1. **Prisma Schema Güncelle** (`packages/db/prisma/schema.prisma`)
   - `HybleBilling/hyble-billing-core/DATABASE_SCHEMA.md` dosyasındaki tüm modelleri ekle
   - Mevcut User modeli ile ilişkilendir (customerId → userId)
   - Enum'ları ekle

2. **Migration Oluştur**
   ```bash
   cd packages/db
   pnpm prisma migrate dev --name add_billing_models
   ```

3. **Seed Data**
   - Default currencies (TRY, USD, EUR)
   - Default tax rules (TR KDV %20)
   - Default payment gateways (inactive)

---

### PHASE 2: CORE BILLING PACKAGE (Day 2-4)

**Lokasyon:** `packages/billing/`

```
packages/billing/
├── src/
│   ├── index.ts
│   ├── core/
│   │   ├── BillingCore.ts       # Ana class
│   │   ├── types.ts             # TypeScript types
│   │   └── errors.ts            # Custom errors
│   ├── services/
│   │   ├── CustomerService.ts
│   │   ├── ProductService.ts
│   │   ├── InvoiceService.ts
│   │   ├── PaymentService.ts
│   │   ├── SubscriptionService.ts
│   │   ├── WalletService.ts
│   │   ├── CouponService.ts
│   │   └── TaxService.ts
│   ├── gateways/
│   │   ├── BaseGateway.ts       # Abstract class
│   │   ├── StripeGateway.ts
│   │   ├── IyzicoGateway.ts
│   │   ├── PayPalGateway.ts
│   │   └── ManualGateway.ts
│   ├── jobs/
│   │   ├── RecurringBillingJob.ts
│   │   ├── InvoiceReminderJob.ts
│   │   ├── OverdueCheckJob.ts
│   │   └── AutoSuspendJob.ts
│   ├── pdf/
│   │   ├── InvoicePdfGenerator.ts
│   │   └── templates/
│   ├── utils/
│   │   ├── currency.ts
│   │   ├── proration.ts
│   │   ├── invoiceNumber.ts
│   │   └── vatValidator.ts
│   ├── events/
│   │   ├── BillingEvents.ts
│   │   └── WebhookDispatcher.ts
│   └── __tests__/              # Test dosyaları
│       ├── invoice.test.ts
│       ├── payment.test.ts
│       ├── subscription.test.ts
│       ├── wallet.test.ts
│       └── security.test.ts    # 🔒 Güvenlik testleri
├── package.json
└── tsconfig.json
```

---

### PHASE 3: tRPC INTEGRATION (Day 5-6)

**Lokasyon:** `apps/core/src/server/routers/billing/`

```typescript
// apps/core/src/server/routers/billing/index.ts
export const billingRouter = router({
  customers: customerRouter,
  products: productRouter,
  invoices: invoiceRouter,
  payments: paymentRouter,
  subscriptions: subscriptionRouter,
  wallet: walletRouter,
  coupons: couponRouter,
  admin: adminBillingRouter,  // Admin-only endpoints
});
```

**Endpoints:** `HybleBilling/hyble-billing-core/API_REFERENCE.md` dosyasına göre implement et.

---

### PHASE 4: ADMIN PANEL (Day 7-8)

**Lokasyon:** `apps/core/src/app/admin/billing/`

```
admin/billing/
├── page.tsx                    # Dashboard
├── invoices/
│   ├── page.tsx               # Invoice list
│   └── [id]/page.tsx          # Invoice detail
├── payments/
│   └── page.tsx               # Payment list
├── subscriptions/
│   └── page.tsx               # Subscription list
├── products/
│   ├── page.tsx               # Product list
│   └── [id]/page.tsx          # Product edit
├── customers/
│   └── page.tsx               # Customer billing view
├── coupons/
│   ├── page.tsx               # Coupon list
│   └── new/page.tsx           # Create coupon
├── gateways/
│   └── page.tsx               # Gateway settings
└── settings/
    └── page.tsx               # Billing settings (tax, currency)
```

---

### PHASE 5: CONSOLE (User Panel) (Day 9-10)

**Lokasyon:** `apps/console/src/app/billing/`

```
billing/
├── page.tsx                    # Billing overview
├── invoices/
│   ├── page.tsx               # My invoices
│   └── [id]/page.tsx          # Invoice detail + pay
├── wallet/
│   ├── page.tsx               # Wallet balance
│   └── topup/page.tsx         # Top up credits
├── subscriptions/
│   └── page.tsx               # My subscriptions
├── payment-methods/
│   └── page.tsx               # Saved cards
└── transactions/
    └── page.tsx               # Transaction history
```

---

### PHASE 6: PAYMENT GATEWAY INTEGRATION (Day 11-12)

1. **Stripe**
   - API key config
   - Checkout Session
   - Webhook handler (`/api/webhooks/stripe`)
   - Tokenization (SaveCard)
   - Refunds

2. **iyzico** (Türkiye için)
   - API key config
   - 3D Secure payment
   - Webhook handler (`/api/webhooks/iyzico`)
   - Tokenization

3. **Manual Payments**
   - Bank transfer recording
   - Cash payment recording

---

### PHASE 7: SECURITY AUDIT (Day 13-14)

**🔒 GÜVENLİK TARAMASI - HER MODÜL İÇİN ZORUNLU**

```typescript
// packages/billing/src/__tests__/security.test.ts

describe('Security Audit', () => {
  describe('SQL Injection', () => {
    // Tüm input'ları test et
  });
  
  describe('Authentication', () => {
    // Unauthorized access attempts
  });
  
  describe('Authorization', () => {
    // Cross-customer data access
    // Admin-only endpoint protection
  });
  
  describe('Rate Limiting', () => {
    // Payment endpoint abuse
    // API abuse
  });
  
  describe('Input Validation', () => {
    // Negative amounts
    // Invalid currencies
    // XSS attempts
  });
  
  describe('Payment Security', () => {
    // Double payment prevention
    // Refund abuse
    // Wallet manipulation
  });
  
  describe('Data Exposure', () => {
    // Card number exposure
    // API key exposure
    // Sensitive data in logs
  });
});
```

**KONTROL LİSTESİ:**
- [ ] Tüm endpoint'ler auth gerektiriyor mu?
- [ ] Customer sadece kendi verisine erişebiliyor mu?
- [ ] Admin endpoint'leri korumalı mı?
- [ ] Payment amount manipulation engelleniyor mu?
- [ ] Coupon abuse engelleniyor mu?
- [ ] Wallet balance manipulation engelleniyor mu?
- [ ] Rate limiting aktif mi?
- [ ] SQL injection koruması var mı?
- [ ] XSS koruması var mı?
- [ ] CSRF koruması var mı?
- [ ] Sensitive data loglanmıyor mu?
- [ ] Card numbers masked mı?

---

### PHASE 8: TESTING SUITE (Day 15)

```bash
# Unit Tests
pnpm --filter @hyble/billing test

# Integration Tests
pnpm --filter @hyble/billing test:integration

# E2E Tests
pnpm --filter @hyble/core test:e2e

# Security Tests
pnpm --filter @hyble/billing test:security

# All Tests
pnpm test
```

**Test Coverage Hedefi:** %80+

---

### PHASE 9: DEPLOYMENT (Day 16)

1. **Local Test**
   ```bash
   pnpm dev
   ```
   - Admin panel'de billing sayfalarını test et
   - Console'da invoice/wallet test et
   - Payment flow test et

2. **Build**
   ```bash
   pnpm build
   ```

3. **Deploy to Server**
   ```bash
   ssh root@178.63.138.97
   cd /var/www/hyble-core
   git pull
   pnpm install
   pnpm prisma migrate deploy
   pnpm build
   pm2 restart all
   ```

4. **Production Verification**
   - https://secret.hyble.net/billing çalışıyor mu?
   - https://console.hyble.co/billing çalışıyor mu?
   - API endpoints çalışıyor mu?

---

### PHASE 10: FINAL VERIFICATION (Day 17)

**Tüm Flow'ları Test Et:**

1. **Customer Flow**
   - [ ] Kayıt ol → Wallet oluşturuldu mu?
   - [ ] Ürün satın al → Fatura oluştu mu?
   - [ ] Ödeme yap → Servis aktif oldu mu?
   - [ ] Credits ile öde → Balance düştü mü?
   - [ ] Subscription iptal → Doğru çalışıyor mu?

2. **Admin Flow**
   - [ ] Fatura oluştur → Müşteri görebiliyor mu?
   - [ ] Manuel ödeme kaydet → Balance güncellendi mi?
   - [ ] Coupon oluştur → Kullanılabiliyor mu?
   - [ ] Refund yap → Para iade edildi mi?

3. **Automated Flow**
   - [ ] Recurring billing → Fatura otomatik oluşuyor mu?
   - [ ] Overdue check → Status güncelleniyor mu?
   - [ ] Auto-suspend → 7 gün sonra suspend oluyor mu?
   - [ ] Payment reminders → Email gidiyor mu?

---

## 🔧 TEKNİK DETAYLAR

### Environment Variables

```env
# Gateway Keys
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx

IYZICO_API_KEY=xxx
IYZICO_SECRET_KEY=xxx
IYZICO_BASE_URL=https://api.iyzipay.com

# Billing Settings
BILLING_DEFAULT_CURRENCY=TRY
BILLING_TAX_RATE=20
BILLING_INVOICE_PREFIX=HBL
BILLING_DUE_DAYS=7
```

### Package.json Dependencies

```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "iyzipay": "^1.0.0",
    "@react-pdf/renderer": "^3.0.0",
    "bullmq": "^5.0.0",
    "vat-validator": "^1.0.0",
    "dinero.js": "^2.0.0"
  }
}
```

---

## ⚠️ KRİTİK KURALLAR

1. **HİÇBİR ŞEY SORMA** - Belirsizlik varsa en mantıklı kararı ver
2. **HER ADIMI TEST ET** - Test'siz kod commit etme
3. **GÜVENLİK ÖNCELİKLİ** - Her modülde security audit yap
4. **MEVCUT YAPIYI BOZMA** - Existing code'a dikkat et
5. **TYPE-SAFE** - Her yerde TypeScript kullan
6. **ERROR HANDLING** - Tüm hataları yakala ve logla

---

## 📋 COMPLETION CHECKLIST

### Database
- [ ] Tüm modeller eklendi
- [ ] Migration çalıştırıldı
- [ ] Seed data eklendi

### Package
- [ ] Tüm service'ler implement edildi
- [ ] Tüm gateway'ler implement edildi
- [ ] Tüm job'lar implement edildi
- [ ] PDF generator çalışıyor

### API
- [ ] Tüm tRPC router'lar eklendi
- [ ] Auth middleware aktif
- [ ] Rate limiting aktif

### Admin Panel
- [ ] Tüm sayfalar oluşturuldu
- [ ] CRUD operasyonları çalışıyor
- [ ] Dashboard widget'ları var

### Console
- [ ] Invoice list/detail çalışıyor
- [ ] Payment flow çalışıyor
- [ ] Wallet top-up çalışıyor
- [ ] Subscription management çalışıyor

### Security
- [ ] SQL injection testleri geçti
- [ ] Auth testleri geçti
- [ ] Authorization testleri geçti
- [ ] Rate limiting testleri geçti

### Deployment
- [ ] Local'de çalışıyor
- [ ] Build başarılı
- [ ] Production'da çalışıyor
- [ ] Tüm flow'lar test edildi

---

## 🏁 BİTİRİNCE

1. Tüm testler geçiyor
2. Security audit tamamlandı
3. Production'da deploy edildi
4. Tüm flow'lar manuel test edildi

**Sonra beni bekle, ben final test yapacağım.**

---

**Başla!**
