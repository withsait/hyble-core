# HybleBilling Core - Database Schema

> **ORM:** Prisma
> **Database:** PostgreSQL
> **Versiyon:** 1.0.0

---

## 1. SCHEMA OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                     HybleBilling Core Schema                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │ Customer │────▶│ Service  │────▶│ Invoice  │                │
│  └──────────┘     └──────────┘     └──────────┘                │
│       │                │                │                        │
│       │                │                ▼                        │
│       │                │          ┌──────────┐                  │
│       │                │          │ Payment  │                  │
│       │                ▼          └──────────┘                  │
│       │          ┌──────────┐          │                        │
│       │          │ Product  │          │                        │
│       │          └──────────┘          │                        │
│       │                                │                        │
│       ▼                                ▼                        │
│  ┌──────────┐                    ┌──────────┐                  │
│  │  Wallet  │◀───────────────────│ Gateway  │                  │
│  └──────────┘                    └──────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. PRISMA SCHEMA

```prisma
// ============================================
// HybleBilling Core - Prisma Schema
// ============================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum CustomerStatus {
  PENDING
  ACTIVE
  SUSPENDED
  CLOSED
}

enum ServiceStatus {
  PENDING
  ACTIVE
  SUSPENDED
  TERMINATED
  CANCELLED
}

enum InvoiceStatus {
  DRAFT
  PENDING
  PAID
  PARTIALLY_PAID
  OVERDUE
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  BANK_TRANSFER
  PAYPAL
  WALLET
  MANUAL
}

enum BillingCycle {
  ONE_TIME
  MONTHLY
  QUARTERLY
  SEMI_ANNUALLY
  ANNUALLY
  BIENNIALLY
  TRIENNIALLY
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  PAUSED
  CANCELLED
  EXPIRED
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

enum WalletTransactionType {
  CREDIT
  DEBIT
  REFUND
  PROMO
  ADJUSTMENT
}

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

model Customer {
  id              String          @id @default(cuid())
  
  // External Reference (Hyble ID)
  externalId      String?         @unique
  
  // Basic Info
  email           String          @unique
  firstName       String
  lastName        String
  companyName     String?
  
  // Tax Info
  taxId           String?
  taxExempt       Boolean         @default(false)
  
  // Preferences
  currencyCode    String          @default("TRY")
  language        String          @default("tr")
  timezone        String          @default("Europe/Istanbul")
  
  // Location
  country         String?
  
  // Status
  status          CustomerStatus  @default(PENDING)
  
  // Metadata
  metadata        Json?
  
  // Relations
  addresses       Address[]
  services        Service[]
  invoices        Invoice[]
  payments        Payment[]
  paymentTokens   PaymentToken[]
  wallet          Wallet?
  subscriptions   Subscription[]
  couponUsages    CouponUsage[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([email])
  @@index([externalId])
  @@index([status])
}

model Address {
  id            String      @id @default(cuid())
  
  customerId    String
  customer      Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  type          String      @default("billing") // billing, shipping
  
  line1         String
  line2         String?
  city          String
  state         String?
  postalCode    String
  country       String
  
  isDefault     Boolean     @default(false)
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@index([customerId])
}

// ============================================
// PRODUCT CATALOG
// ============================================

model ProductGroup {
  id            String    @id @default(cuid())
  
  name          String
  slug          String    @unique
  description   String?
  
  sortOrder     Int       @default(0)
  isHidden      Boolean   @default(false)
  
  products      Product[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Product {
  id            String          @id @default(cuid())
  
  // Basic Info
  name          String
  slug          String          @unique
  description   String?
  
  // Category
  groupId       String
  group         ProductGroup    @relation(fields: [groupId], references: [id])
  
  // Type
  type          String          @default("service") // service, addon, one-time
  
  // Vertical (for cross-vertical)
  vertical      String          @default("hyble") // hyble, gaming, etc.
  
  // Pricing
  pricing       ProductPricing[]
  
  // Setup Fee
  setupFee      Decimal?        @db.Decimal(10, 2)
  
  // Stock
  stockEnabled  Boolean         @default(false)
  stockQuantity Int?
  
  // Config Options
  configOptions ProductConfigOption[]
  
  // Status
  isActive      Boolean         @default(true)
  isHidden      Boolean         @default(false)
  
  // Metadata (for provisioning, etc.)
  metadata      Json?
  
  // Relations
  services      Service[]
  
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  
  @@index([groupId])
  @@index([vertical])
  @@index([isActive])
}

model ProductPricing {
  id            String       @id @default(cuid())
  
  productId     String
  product       Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  currencyCode  String
  billingCycle  BillingCycle
  
  price         Decimal      @db.Decimal(10, 2)
  setupFee      Decimal?     @db.Decimal(10, 2)
  
  @@unique([productId, currencyCode, billingCycle])
}

model ProductConfigOption {
  id            String    @id @default(cuid())
  
  productId     String
  product       Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  name          String
  key           String    // For API usage
  type          String    // dropdown, radio, checkbox, quantity, text
  
  options       Json?     // Array of { value, label, price }
  
  isRequired    Boolean   @default(false)
  sortOrder     Int       @default(0)
  
  @@unique([productId, key])
}
```


// ============================================
// SERVICE MANAGEMENT
// ============================================

model Service {
  id              String        @id @default(cuid())
  
  // Relations
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])
  
  productId       String
  product         Product       @relation(fields: [productId], references: [id])
  
  // Identifier
  identifier      String?       // Domain, server name, etc.
  
  // Vertical
  vertical        String        @default("hyble")
  
  // Billing
  billingCycle    BillingCycle
  amount          Decimal       @db.Decimal(10, 2)
  currencyCode    String
  
  // Dates
  startDate       DateTime      @default(now())
  nextDueDate     DateTime
  terminationDate DateTime?
  
  // Status
  status          ServiceStatus @default(PENDING)
  
  // Subscription (for recurring)
  subscriptionId  String?       @unique
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])
  
  // Config Options (selected values)
  configOptions   Json?
  
  // Provisioning Data
  provisioningData Json?        // Credentials, IPs, etc.
  
  // Notes
  adminNotes      String?
  
  // Invoice Items
  invoiceItems    InvoiceItem[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([customerId])
  @@index([productId])
  @@index([status])
  @@index([nextDueDate])
  @@index([vertical])
}

// ============================================
// SUBSCRIPTIONS
// ============================================

model Subscription {
  id              String             @id @default(cuid())
  
  customerId      String
  customer        Customer           @relation(fields: [customerId], references: [id])
  
  // Billing
  billingCycle    BillingCycle
  amount          Decimal            @db.Decimal(10, 2)
  currencyCode    String
  
  // Payment Method
  paymentTokenId  String?
  paymentToken    PaymentToken?      @relation(fields: [paymentTokenId], references: [id])
  
  // Dates
  startDate       DateTime           @default(now())
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  nextBillingDate DateTime
  
  // Trial
  trialEndDate    DateTime?
  
  // Status
  status          SubscriptionStatus @default(ACTIVE)
  
  // Cancellation
  cancelledAt     DateTime?
  cancelAtPeriodEnd Boolean          @default(false)
  cancelReason    String?
  
  // Service
  service         Service?
  
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  
  @@index([customerId])
  @@index([status])
  @@index([nextBillingDate])
}

// ============================================
// INVOICING
// ============================================

model Invoice {
  id              String        @id @default(cuid())
  invoiceNumber   String        @unique
  
  // Customer
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])
  
  // Amounts
  subtotal        Decimal       @db.Decimal(10, 2)
  taxTotal        Decimal       @db.Decimal(10, 2) @default(0)
  discount        Decimal       @db.Decimal(10, 2) @default(0)
  total           Decimal       @db.Decimal(10, 2)
  amountPaid      Decimal       @db.Decimal(10, 2) @default(0)
  balance         Decimal       @db.Decimal(10, 2)
  
  // Currency
  currencyCode    String
  exchangeRate    Decimal       @db.Decimal(10, 6) @default(1)
  
  // Status
  status          InvoiceStatus @default(DRAFT)
  
  // Dates
  issueDate       DateTime      @default(now())
  dueDate         DateTime
  paidDate        DateTime?
  
  // Notes
  notes           String?
  adminNotes      String?
  
  // Relations
  items           InvoiceItem[]
  payments        Payment[]
  
  // Coupon
  couponId        String?
  coupon          Coupon?       @relation(fields: [couponId], references: [id])
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([customerId])
  @@index([status])
  @@index([dueDate])
  @@index([invoiceNumber])
}

model InvoiceItem {
  id            String    @id @default(cuid())
  
  invoiceId     String
  invoice       Invoice   @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  // Service Reference
  serviceId     String?
  service       Service?  @relation(fields: [serviceId], references: [id])
  
  // Details
  description   String
  quantity      Int       @default(1)
  unitPrice     Decimal   @db.Decimal(10, 2)
  
  // Tax
  taxable       Boolean   @default(true)
  taxRate       Decimal   @db.Decimal(5, 2) @default(0)
  taxAmount     Decimal   @db.Decimal(10, 2) @default(0)
  
  // Discount
  discountAmount Decimal  @db.Decimal(10, 2) @default(0)
  
  // Totals
  subtotal      Decimal   @db.Decimal(10, 2)
  total         Decimal   @db.Decimal(10, 2)
  
  // Billing Period
  periodStart   DateTime?
  periodEnd     DateTime?
  
  createdAt     DateTime  @default(now())
  
  @@index([invoiceId])
  @@index([serviceId])
}

// ============================================
// PAYMENTS
// ============================================

model PaymentGateway {
  id                String    @id @default(cuid())
  
  name              String
  slug              String    @unique
  
  // Status
  isActive          Boolean   @default(false)
  isDefault         Boolean   @default(false)
  testMode          Boolean   @default(true)
  
  // Credentials (encrypted JSON)
  credentials       Json
  
  // Features
  supportsTokenization Boolean @default(false)
  supportsRefund       Boolean @default(true)
  supportsRecurring    Boolean @default(false)
  
  // Supported Currencies
  supportedCurrencies String[] @default(["TRY"])
  
  // Relations
  payments          Payment[]
  tokens            PaymentToken[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model PaymentToken {
  id            String         @id @default(cuid())
  
  customerId    String
  customer      Customer       @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  gatewayId     String
  gateway       PaymentGateway @relation(fields: [gatewayId], references: [id])
  
  // Token
  token         String
  
  // Card Info (masked)
  cardLast4     String
  cardBrand     String
  cardExpMonth  Int
  cardExpYear   Int
  cardholderName String?
  
  // Billing Address
  billingAddress Json?
  
  // Status
  isDefault     Boolean        @default(false)
  isActive      Boolean        @default(true)
  
  // Relations
  payments      Payment[]
  subscriptions Subscription[]
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  @@index([customerId])
}

model Payment {
  id              String        @id @default(cuid())
  
  // Relations
  invoiceId       String
  invoice         Invoice       @relation(fields: [invoiceId], references: [id])
  
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])
  
  // Amount
  amount          Decimal       @db.Decimal(10, 2)
  currencyCode    String
  
  // Gateway
  gatewayId       String
  gateway         PaymentGateway @relation(fields: [gatewayId], references: [id])
  gatewayTxnId    String?
  
  // Payment Token
  paymentTokenId  String?
  paymentToken    PaymentToken? @relation(fields: [paymentTokenId], references: [id])
  
  // Method & Status
  paymentMethod   PaymentMethod
  status          PaymentStatus @default(PENDING)
  
  // Card Info
  cardLast4       String?
  cardBrand       String?
  
  // Fees
  gatewayFee      Decimal       @db.Decimal(10, 2) @default(0)
  
  // Refunds
  refundedAmount  Decimal       @db.Decimal(10, 2) @default(0)
  refunds         Refund[]
  
  // Metadata
  metadata        Json?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([invoiceId])
  @@index([customerId])
  @@index([status])
  @@index([gatewayTxnId])
}

model Refund {
  id            String   @id @default(cuid())
  
  paymentId     String
  payment       Payment  @relation(fields: [paymentId], references: [id])
  
  amount        Decimal  @db.Decimal(10, 2)
  reason        String?
  
  // Gateway
  gatewayRefundId String?
  
  // Status
  status        String   @default("pending") // pending, completed, failed
  
  // Admin
  processedBy   String?
  processedAt   DateTime?
  
  createdAt     DateTime @default(now())
  
  @@index([paymentId])
}
```


// ============================================
// TAX ENGINE
// ============================================

model TaxRule {
  id            String    @id @default(cuid())
  
  name          String
  
  // Location Matching
  country       String?   // ISO code, null = all
  state         String?
  
  // Rate
  rate          Decimal   @db.Decimal(5, 2)
  
  // Behavior
  isInclusive   Boolean   @default(false)
  isCompound    Boolean   @default(false)
  priority      Int       @default(0)
  
  isActive      Boolean   @default(true)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([country])
}

model TaxExemption {
  id            String    @id @default(cuid())
  
  customerId    String    @unique
  
  taxNumber     String?   // VAT number
  isVerified    Boolean   @default(false)
  verifiedAt    DateTime?
  
  exemptionType String    // VAT_REGISTERED, NON_PROFIT, etc.
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// ============================================
// CURRENCY
// ============================================

model Currency {
  id              String    @id @default(cuid())
  
  code            String    @unique
  name            String
  symbol          String
  
  // Format
  decimalPlaces   Int       @default(2)
  symbolPosition  String    @default("before")
  thousandsSep    String    @default(",")
  decimalSep      String    @default(".")
  
  // Exchange Rate (base = TRY for Hyble)
  exchangeRate    Decimal   @db.Decimal(10, 6) @default(1)
  lastUpdated     DateTime  @default(now())
  
  isDefault       Boolean   @default(false)
  isActive        Boolean   @default(true)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ============================================
// COUPONS
// ============================================

model Coupon {
  id            String       @id @default(cuid())
  
  code          String       @unique
  description   String?
  
  // Discount
  discountType  DiscountType
  discountValue Decimal      @db.Decimal(10, 2)
  
  // Limits
  maxUses       Int?
  maxUsesPerCustomer Int?
  usedCount     Int          @default(0)
  
  // Validity
  validFrom     DateTime     @default(now())
  validUntil    DateTime?
  
  // Minimum Amount
  minimumAmount Decimal?     @db.Decimal(10, 2)
  
  // Restrictions
  applicableProducts   String[] @default([])
  applicableVerticals  String[] @default([])
  
  // Recurring
  applyToRecurring     Boolean @default(false)
  recurringMonths      Int?
  
  isActive      Boolean      @default(true)
  
  // Relations
  usages        CouponUsage[]
  invoices      Invoice[]
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model CouponUsage {
  id            String   @id @default(cuid())
  
  couponId      String
  coupon        Coupon   @relation(fields: [couponId], references: [id])
  
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  
  invoiceId     String?
  
  discountAmount Decimal @db.Decimal(10, 2)
  
  usedAt        DateTime @default(now())
  
  @@index([couponId])
  @@index([customerId])
}

// ============================================
// WALLET (HYBLE CREDITS)
// ============================================

model Wallet {
  id            String   @id @default(cuid())
  
  customerId    String   @unique
  customer      Customer @relation(fields: [customerId], references: [id])
  
  // Balance
  balance       Decimal  @db.Decimal(10, 2) @default(0)
  
  // Promo Balance (separate, expirable)
  promoBalance  Decimal  @db.Decimal(10, 2) @default(0)
  
  // Auto Top-Up
  autoTopUpEnabled    Boolean  @default(false)
  autoTopUpAmount     Decimal? @db.Decimal(10, 2)
  autoTopUpThreshold  Decimal? @db.Decimal(10, 2)
  autoTopUpTokenId    String?
  
  // Transactions
  transactions  WalletTransaction[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model WalletTransaction {
  id            String                @id @default(cuid())
  
  walletId      String
  wallet        Wallet                @relation(fields: [walletId], references: [id])
  
  // Type
  type          WalletTransactionType
  
  // Amount
  amount        Decimal               @db.Decimal(10, 2)
  balanceBefore Decimal               @db.Decimal(10, 2)
  balanceAfter  Decimal               @db.Decimal(10, 2)
  
  // Reference
  referenceType String?               // Invoice, TopUp, Promo
  referenceId   String?
  
  // Description
  description   String?
  
  createdAt     DateTime              @default(now())
  
  @@index([walletId])
  @@index([createdAt])
}

model CreditPackage {
  id            String   @id @default(cuid())
  
  name          String
  
  // Amount
  creditAmount  Decimal  @db.Decimal(10, 2)
  price         Decimal  @db.Decimal(10, 2)
  
  // Bonus
  bonusAmount   Decimal  @db.Decimal(10, 2) @default(0)
  
  currencyCode  String
  
  isActive      Boolean  @default(true)
  isFeatured    Boolean  @default(false)
  sortOrder     Int      @default(0)
  
  createdAt     DateTime @default(now())
}

// ============================================
// WEBHOOKS & EVENTS
// ============================================

model WebhookEndpoint {
  id            String    @id @default(cuid())
  
  url           String
  secret        String    // For signature verification
  
  // Events to send
  events        String[]  @default([])
  
  // Status
  isActive      Boolean   @default(true)
  
  // Stats
  lastCalledAt  DateTime?
  failureCount  Int       @default(0)
  
  // Logs
  logs          WebhookLog[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model WebhookLog {
  id            String          @id @default(cuid())
  
  endpointId    String
  endpoint      WebhookEndpoint @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  
  event         String
  payload       Json
  
  // Response
  statusCode    Int?
  responseBody  String?
  
  // Status
  success       Boolean
  error         String?
  
  // Timing
  duration      Int?            // ms
  
  createdAt     DateTime        @default(now())
  
  @@index([endpointId])
  @@index([event])
  @@index([createdAt])
}

// ============================================
// AUDIT LOG
// ============================================

model AuditLog {
  id            String   @id @default(cuid())
  
  // Actor
  actorType     String   // customer, admin, system
  actorId       String?
  
  // Action
  action        String   // invoice.created, payment.completed, etc.
  
  // Target
  resourceType  String   // Invoice, Payment, Service
  resourceId    String
  
  // Changes
  previousData  Json?
  newData       Json?
  
  // Context
  ipAddress     String?
  userAgent     String?
  
  createdAt     DateTime @default(now())
  
  @@index([resourceType, resourceId])
  @@index([actorId])
  @@index([action])
  @@index([createdAt])
}
```

---

## 3. INDEXES & PERFORMANCE

### 3.1 Critical Indexes

```sql
-- High-frequency queries
CREATE INDEX idx_invoices_due_status ON "Invoice"("dueDate", "status");
CREATE INDEX idx_services_next_due ON "Service"("nextDueDate", "status");
CREATE INDEX idx_subscriptions_billing ON "Subscription"("nextBillingDate", "status");

-- Search
CREATE INDEX idx_customers_search ON "Customer"("email", "firstName", "lastName");
CREATE INDEX idx_products_search ON "Product"("name", "slug", "isActive");

-- Cross-vertical
CREATE INDEX idx_services_vertical ON "Service"("vertical", "customerId");
CREATE INDEX idx_products_vertical ON "Product"("vertical", "isActive");
```

### 3.2 Soft Delete (Optional)

```prisma
// Add to models that need soft delete
deletedAt     DateTime?

@@index([deletedAt])
```

---

## 4. SCHEMA MIGRATIONS

### 4.1 Initial Migration

```bash
npx prisma migrate dev --name init
```

### 4.2 Seed Data

```typescript
// prisma/seed.ts
async function main() {
  // Default currencies
  await prisma.currency.createMany({
    data: [
      { code: 'TRY', name: 'Turkish Lira', symbol: '₺', isDefault: true },
      { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 0.029 },
      { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.027 },
    ]
  });
  
  // Default tax rules
  await prisma.taxRule.createMany({
    data: [
      { name: 'TR KDV', country: 'TR', rate: 20 },
      { name: 'EU VAT', country: null, rate: 0 }, // Reverse charge
    ]
  });
  
  // Default payment gateways (inactive)
  await prisma.paymentGateway.createMany({
    data: [
      { name: 'Stripe', slug: 'stripe', credentials: {}, supportsTokenization: true, supportsRecurring: true },
      { name: 'iyzico', slug: 'iyzico', credentials: {}, supportsTokenization: true },
      { name: 'PayPal', slug: 'paypal', credentials: {} },
      { name: 'Manual', slug: 'manual', credentials: {}, isActive: true },
    ]
  });
}
```

---

## 5. TYPE EXPORTS

```typescript
// packages/database/src/types.ts
export type {
  Customer,
  Address,
  Product,
  ProductGroup,
  ProductPricing,
  Service,
  Subscription,
  Invoice,
  InvoiceItem,
  Payment,
  PaymentGateway,
  PaymentToken,
  Refund,
  TaxRule,
  Currency,
  Coupon,
  Wallet,
  WalletTransaction,
  WebhookEndpoint,
  AuditLog,
} from '@prisma/client';

export {
  CustomerStatus,
  ServiceStatus,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
  BillingCycle,
  SubscriptionStatus,
  DiscountType,
  WalletTransactionType,
} from '@prisma/client';
```

---

**Toplam Model Sayısı:** 24
**Toplam Enum Sayısı:** 8
