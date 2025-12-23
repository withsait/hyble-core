# 01 - Billing & Ödeme Sistemi Spesifikasyonu

> **Modül:** @hyble/billing
> **Öncelik:** P0 (MVP)
> **Tahmini Süre:** 3-4 hafta

---

## 1. GENEL BAKIŞ

HybleBilling'in kalbi. Tüm finansal işlemleri yöneten merkezi modül.

### 1.1 Temel Sorumluluklar
- Fatura oluşturma ve yönetimi
- Ödeme işleme
- Recurring billing (abonelik)
- Vergi hesaplama
- Multi-currency desteği
- Kupon ve indirimler

---

## 2. DATABASE SCHEMA

### 2.1 Invoices (Faturalar)

```prisma
model Invoice {
  id            String         @id @default(cuid())
  invoiceNumber String         @unique
  
  // İlişkiler
  customerId    String
  customer      Customer       @relation(fields: [customerId], references: [id])
  
  // Tutar Bilgileri
  subtotal      Decimal        @db.Decimal(10, 2)
  taxTotal      Decimal        @db.Decimal(10, 2)
  discount      Decimal        @db.Decimal(10, 2) @default(0)
  total         Decimal        @db.Decimal(10, 2)
  amountPaid    Decimal        @db.Decimal(10, 2) @default(0)
  balance       Decimal        @db.Decimal(10, 2) // total - amountPaid
  
  // Para Birimi
  currencyCode  String         @default("USD")
  exchangeRate  Decimal        @db.Decimal(10, 6) @default(1)
  
  // Durum
  status        InvoiceStatus  @default(DRAFT)
  
  // Tarihler
  issueDate     DateTime       @default(now())
  dueDate       DateTime
  paidDate      DateTime?
  
  // Notlar
  notes         String?
  adminNotes    String?
  
  // Meta
  items         InvoiceItem[]
  payments      Payment[]
  transactions  Transaction[]
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  @@index([customerId])
  @@index([status])
  @@index([dueDate])
}

enum InvoiceStatus {
  DRAFT           // Taslak - müşteriye görünmez
  PENDING         // Bekliyor - ödeme bekleniyor
  PAID            // Ödendi
  PARTIALLY_PAID  // Kısmi ödendi
  OVERDUE         // Gecikmiş
  CANCELLED       // İptal edildi
  REFUNDED        // İade edildi
  COLLECTIONS     // Tahsilata verildi
}
```

### 2.2 Invoice Items (Fatura Kalemleri)

```prisma
model InvoiceItem {
  id            String    @id @default(cuid())
  
  invoiceId     String
  invoice       Invoice   @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  // Ürün Referansı (opsiyonel)
  serviceId     String?
  service       Service?  @relation(fields: [serviceId], references: [id])
  
  // Kalem Detayları
  description   String
  quantity      Int       @default(1)
  unitPrice     Decimal   @db.Decimal(10, 2)
  
  // Vergi
  taxable       Boolean   @default(true)
  taxRate       Decimal   @db.Decimal(5, 2) @default(0)
  taxAmount     Decimal   @db.Decimal(10, 2) @default(0)
  
  // İndirim
  discountType  DiscountType?
  discountValue Decimal?  @db.Decimal(10, 2)
  discountAmount Decimal  @db.Decimal(10, 2) @default(0)
  
  // Toplam
  subtotal      Decimal   @db.Decimal(10, 2) // quantity * unitPrice
  total         Decimal   @db.Decimal(10, 2) // subtotal + tax - discount
  
  // Billing Period (recurring için)
  periodStart   DateTime?
  periodEnd     DateTime?
  
  createdAt     DateTime  @default(now())
  
  @@index([invoiceId])
}

enum DiscountType {
  PERCENTAGE
  FIXED
}
```

### 2.3 Payments (Ödemeler)

```prisma
model Payment {
  id              String        @id @default(cuid())
  
  // İlişkiler
  invoiceId       String
  invoice         Invoice       @relation(fields: [invoiceId], references: [id])
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])
  
  // Ödeme Detayları
  amount          Decimal       @db.Decimal(10, 2)
  currencyCode    String
  exchangeRate    Decimal       @db.Decimal(10, 6) @default(1)
  
  // Gateway Bilgileri
  gatewayId       String
  gateway         PaymentGateway @relation(fields: [gatewayId], references: [id])
  gatewayTxnId    String?       // Gateway transaction ID
  
  // Ödeme Yöntemi
  paymentMethod   PaymentMethod
  
  // Durum
  status          PaymentStatus @default(PENDING)
  
  // Kart Bilgileri (tokenized)
  paymentTokenId  String?
  paymentToken    PaymentToken? @relation(fields: [paymentTokenId], references: [id])
  cardLast4       String?
  cardBrand       String?       // Visa, Mastercard, etc.
  
  // Fees
  gatewayFee      Decimal       @db.Decimal(10, 2) @default(0)
  
  // Refund
  refundedAmount  Decimal       @db.Decimal(10, 2) @default(0)
  refunds         Refund[]
  
  // Meta
  metadata        Json?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([customerId])
  @@index([invoiceId])
  @@index([status])
}

enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  BANK_TRANSFER
  PAYPAL
  CRYPTO
  WALLET          // Hyble Credits
  MANUAL          // Offline payment
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
  REFUNDED
  PARTIALLY_REFUNDED
  DISPUTED
}
```

### 2.4 Payment Gateways

```prisma
model PaymentGateway {
  id            String    @id @default(cuid())
  
  name          String    // "Stripe", "iyzico", "PayPal"
  slug          String    @unique
  
  // Ayarlar
  isActive      Boolean   @default(false)
  isDefault     Boolean   @default(false)
  testMode      Boolean   @default(true)
  
  // Credentials (encrypted)
  credentials   Json      // { apiKey, secretKey, ... }
  
  // Desteklenen Özellikler
  supportsTokenization Boolean @default(false)
  supportsRefund       Boolean @default(true)
  supportsRecurring    Boolean @default(false)
  
  // Desteklenen Para Birimleri
  supportedCurrencies  String[] @default(["USD"])
  
  // Ücretler
  feePercentage Decimal?  @db.Decimal(5, 2)
  feeFixed      Decimal?  @db.Decimal(10, 2)
  
  payments      Payment[]
  tokens        PaymentToken[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 2.5 Payment Tokens (Kayıtlı Kartlar)

```prisma
model PaymentToken {
  id            String         @id @default(cuid())
  
  customerId    String
  customer      Customer       @relation(fields: [customerId], references: [id])
  
  gatewayId     String
  gateway       PaymentGateway @relation(fields: [gatewayId], references: [id])
  
  // Token Bilgileri
  token         String         // Gateway token
  
  // Kart Bilgileri (maskelenmiş)
  cardLast4     String
  cardBrand     String         // Visa, Mastercard
  cardExpMonth  Int
  cardExpYear   Int
  cardholderName String?
  
  // Billing Address
  billingAddress Json?
  
  // Meta
  isDefault     Boolean        @default(false)
  isActive      Boolean        @default(true)
  
  payments      Payment[]
  subscriptions Subscription[]
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  @@index([customerId])
}
```

### 2.6 Tax Rules (Vergi Kuralları)

```prisma
model TaxRule {
  id            String    @id @default(cuid())
  
  name          String    // "UK VAT", "TR KDV"
  
  // Koşullar
  country       String?   // ISO country code
  state         String?   // State/province
  
  // Vergi Oranları
  rate          Decimal   @db.Decimal(5, 2) // 20.00 = %20
  
  // Uygulama
  isInclusive   Boolean   @default(false) // Fiyata dahil mi?
  isCompound    Boolean   @default(false) // Diğer vergilerin üzerine mi?
  priority      Int       @default(0)
  
  isActive      Boolean   @default(true)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([country])
}

model TaxExemption {
  id            String    @id @default(cuid())
  
  customerId    String
  customer      Customer  @relation(fields: [customerId], references: [id])
  
  // VAT Numarası
  taxNumber     String?   // VAT number
  isVerified    Boolean   @default(false)
  verifiedAt    DateTime?
  
  // Muafiyet Detayları
  exemptionType String    // "VAT_REGISTERED", "NON_PROFIT", etc.
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([customerId])
}
```

### 2.7 Currencies (Para Birimleri)

```prisma
model Currency {
  id            String    @id @default(cuid())
  
  code          String    @unique // USD, EUR, TRY
  name          String    // US Dollar, Euro, Turkish Lira
  symbol        String    // $, €, ₺
  
  // Format
  decimalPlaces Int       @default(2)
  symbolPosition String   @default("before") // before, after
  thousandsSeparator String @default(",")
  decimalSeparator String @default(".")
  
  // Exchange Rate (base currency'e göre)
  exchangeRate  Decimal   @db.Decimal(10, 6) @default(1)
  lastUpdated   DateTime  @default(now())
  
  isDefault     Boolean   @default(false)
  isActive      Boolean   @default(true)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 2.8 Coupons (Kuponlar)

```prisma
model Coupon {
  id            String      @id @default(cuid())
  
  code          String      @unique
  description   String?
  
  // İndirim Tipi
  discountType  DiscountType
  discountValue Decimal     @db.Decimal(10, 2)
  
  // Limitler
  maxUses       Int?        // Toplam kullanım limiti
  maxUsesPerCustomer Int?   // Müşteri başına limit
  usedCount     Int         @default(0)
  
  // Geçerlilik
  validFrom     DateTime    @default(now())
  validUntil    DateTime?
  
  // Minimum Tutar
  minimumAmount Decimal?    @db.Decimal(10, 2)
  
  // Kısıtlamalar
  applicableProducts String[] @default([]) // Boş = hepsi
  applicableCategories String[] @default([])
  
  // Recurring
  recurringDiscount Boolean @default(false) // Sadece ilk fatura mı?
  recurringMonths   Int?    // Kaç ay geçerli?
  
  isActive      Boolean     @default(true)
  
  usages        CouponUsage[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model CouponUsage {
  id          String   @id @default(cuid())
  
  couponId    String
  coupon      Coupon   @relation(fields: [couponId], references: [id])
  
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  
  invoiceId   String?
  
  discountAmount Decimal @db.Decimal(10, 2)
  
  usedAt      DateTime @default(now())
  
  @@index([couponId])
  @@index([customerId])
}
```

### 2.9 Subscriptions (Abonelikler)

```prisma
model Subscription {
  id              String            @id @default(cuid())
  
  customerId      String
  customer        Customer          @relation(fields: [customerId], references: [id])
  
  serviceId       String
  service         Service           @relation(fields: [serviceId], references: [id])
  
  // Billing
  billingCycle    BillingCycle
  amount          Decimal           @db.Decimal(10, 2)
  currencyCode    String
  
  // Tarihler
  startDate       DateTime
  nextBillingDate DateTime
  endDate         DateTime?
  
  // Ödeme Yöntemi
  paymentTokenId  String?
  paymentToken    PaymentToken?     @relation(fields: [paymentTokenId], references: [id])
  
  // Durum
  status          SubscriptionStatus @default(ACTIVE)
  
  // Cancellation
  cancelledAt     DateTime?
  cancelReason    String?
  cancelAtPeriodEnd Boolean         @default(false)
  
  // Trial
  trialEndDate    DateTime?
  
  // Proration
  prorationBehavior String          @default("create_prorations")
  
  invoices        Invoice[]
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@index([customerId])
  @@index([status])
  @@index([nextBillingDate])
}

enum BillingCycle {
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
```

### 2.10 Refunds (İadeler)

```prisma
model Refund {
  id            String       @id @default(cuid())
  
  paymentId     String
  payment       Payment      @relation(fields: [paymentId], references: [id])
  
  amount        Decimal      @db.Decimal(10, 2)
  reason        String?
  
  // Gateway
  gatewayRefundId String?
  
  status        RefundStatus @default(PENDING)
  
  processedBy   String?      // Admin user ID
  processedAt   DateTime?
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  @@index([paymentId])
}

enum RefundStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## 3. API ENDPOINTS

### 3.1 Invoice Endpoints

```typescript
// tRPC Router: invoiceRouter

// List invoices
invoices.list
  Input: { customerId?, status?, dateFrom?, dateTo?, page?, limit? }
  Output: { invoices: Invoice[], total: number, page: number }

// Get single invoice
invoices.get
  Input: { id: string }
  Output: Invoice (with items, payments)

// Create invoice
invoices.create
  Input: {
    customerId: string
    items: InvoiceItemInput[]
    dueDate: Date
    notes?: string
    currencyCode?: string
    sendEmail?: boolean
  }
  Output: Invoice

// Update invoice
invoices.update
  Input: { id: string, ...partial fields }
  Output: Invoice

// Delete invoice (only drafts)
invoices.delete
  Input: { id: string }
  Output: { success: boolean }

// Send invoice email
invoices.send
  Input: { id: string }
  Output: { success: boolean }

// Mark as paid (manual)
invoices.markPaid
  Input: { id: string, paymentMethod: string, transactionId?: string }
  Output: Invoice

// Apply credit
invoices.applyCredit
  Input: { id: string, amount: Decimal }
  Output: Invoice

// Add item
invoices.addItem
  Input: { invoiceId: string, item: InvoiceItemInput }
  Output: InvoiceItem

// Remove item
invoices.removeItem
  Input: { itemId: string }
  Output: { success: boolean }

// Generate PDF
invoices.generatePdf
  Input: { id: string }
  Output: { url: string }

// Duplicate invoice
invoices.duplicate
  Input: { id: string }
  Output: Invoice
```

### 3.2 Payment Endpoints

```typescript
// tRPC Router: paymentRouter

// List payments
payments.list
  Input: { customerId?, invoiceId?, status?, dateFrom?, dateTo?, page?, limit? }
  Output: { payments: Payment[], total: number }

// Get payment
payments.get
  Input: { id: string }
  Output: Payment

// Process payment
payments.process
  Input: {
    invoiceId: string
    gatewayId: string
    paymentTokenId?: string  // Kayıtlı kart
    cardDetails?: {          // Yeni kart
      number: string
      expMonth: number
      expYear: number
      cvv: string
      saveCard?: boolean
    }
    amount?: Decimal         // Partial payment
  }
  Output: { payment: Payment, success: boolean, error?: string }

// Capture payment (pre-authorized)
payments.capture
  Input: { id: string, amount?: Decimal }
  Output: Payment

// Refund payment
payments.refund
  Input: { id: string, amount?: Decimal, reason?: string }
  Output: Refund

// Void payment
payments.void
  Input: { id: string }
  Output: Payment

// Record offline payment
payments.recordOffline
  Input: {
    invoiceId: string
    amount: Decimal
    method: PaymentMethod
    reference?: string
    date?: Date
  }
  Output: Payment
```

### 3.3 Subscription Endpoints

```typescript
// tRPC Router: subscriptionRouter

// List subscriptions
subscriptions.list
  Input: { customerId?, serviceId?, status?, page?, limit? }
  Output: { subscriptions: Subscription[], total: number }

// Get subscription
subscriptions.get
  Input: { id: string }
  Output: Subscription

// Create subscription
subscriptions.create
  Input: {
    customerId: string
    serviceId: string
    billingCycle: BillingCycle
    paymentTokenId?: string
    startDate?: Date
    trialDays?: number
    couponCode?: string
  }
  Output: Subscription

// Update subscription
subscriptions.update
  Input: { id: string, ...partial fields }
  Output: Subscription

// Cancel subscription
subscriptions.cancel
  Input: { id: string, immediate?: boolean, reason?: string }
  Output: Subscription

// Pause subscription
subscriptions.pause
  Input: { id: string, resumeDate?: Date }
  Output: Subscription

// Resume subscription
subscriptions.resume
  Input: { id: string }
  Output: Subscription

// Change plan (upgrade/downgrade)
subscriptions.changePlan
  Input: { id: string, newServiceId: string, prorate?: boolean }
  Output: Subscription

// Preview change
subscriptions.previewChange
  Input: { id: string, newServiceId: string }
  Output: { proratedAmount: Decimal, newAmount: Decimal }
```

### 3.4 Payment Token Endpoints

```typescript
// tRPC Router: paymentTokenRouter

// List customer's saved cards
paymentTokens.list
  Input: { customerId: string }
  Output: PaymentToken[]

// Add new card
paymentTokens.add
  Input: {
    customerId: string
    gatewayId: string
    cardDetails: { ... }
    setDefault?: boolean
  }
  Output: PaymentToken

// Delete card
paymentTokens.delete
  Input: { id: string }
  Output: { success: boolean }

// Set default
paymentTokens.setDefault
  Input: { id: string }
  Output: PaymentToken
```

### 3.5 Coupon Endpoints

```typescript
// tRPC Router: couponRouter

// Validate coupon
coupons.validate
  Input: { code: string, customerId?: string, productIds?: string[] }
  Output: { valid: boolean, coupon?: Coupon, error?: string }

// Apply coupon
coupons.apply
  Input: { code: string, invoiceId: string }
  Output: Invoice

// Admin: Create coupon
coupons.create
  Input: { ...CouponInput }
  Output: Coupon

// Admin: Update coupon
coupons.update
  Input: { id: string, ...partial fields }
  Output: Coupon

// Admin: Delete coupon
coupons.delete
  Input: { id: string }
  Output: { success: boolean }

// Admin: List coupons
coupons.list
  Input: { isActive?, page?, limit? }
  Output: { coupons: Coupon[], total: number }
```

---

## 4. BUSINESS LOGIC

### 4.1 Invoice Number Generation

```typescript
// Format: INV-{YEAR}{MONTH}-{SEQUENCE}
// Örnek: INV-202501-00001

async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `INV-${year}${month}`;
  
  const lastInvoice = await db.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' }
  });
  
  let sequence = 1;
  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    sequence = lastSeq + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(5, '0')}`;
}
```

### 4.2 Tax Calculation

```typescript
interface TaxCalculationResult {
  subtotal: Decimal;
  taxableAmount: Decimal;
  taxes: Array<{
    ruleId: string;
    name: string;
    rate: Decimal;
    amount: Decimal;
  }>;
  taxTotal: Decimal;
  total: Decimal;
}

async function calculateTax(
  items: InvoiceItem[],
  customerCountry: string,
  customerState?: string,
  taxExempt?: boolean
): Promise<TaxCalculationResult> {
  // 1. Tax exempt kontrolü
  if (taxExempt) {
    return { subtotal, taxableAmount: 0, taxes: [], taxTotal: 0, total: subtotal };
  }
  
  // 2. Applicable tax rules bul
  const taxRules = await db.taxRule.findMany({
    where: {
      isActive: true,
      OR: [
        { country: null },
        { country: customerCountry }
      ]
    },
    orderBy: { priority: 'asc' }
  });
  
  // 3. Her item için vergi hesapla
  // ... implementation
}
```

### 4.3 Proration Calculation

```typescript
interface ProrationResult {
  daysRemaining: number;
  daysInPeriod: number;
  creditAmount: Decimal;  // Eski plan için
  chargeAmount: Decimal;  // Yeni plan için
  netAmount: Decimal;     // chargeAmount - creditAmount
}

function calculateProration(
  currentPlanPrice: Decimal,
  newPlanPrice: Decimal,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  changeDate: Date = new Date()
): ProrationResult {
  const daysInPeriod = differenceInDays(currentPeriodEnd, currentPeriodStart);
  const daysRemaining = differenceInDays(currentPeriodEnd, changeDate);
  const daysUsed = daysInPeriod - daysRemaining;
  
  // Eski plan için credit
  const dailyRateCurrent = currentPlanPrice.dividedBy(daysInPeriod);
  const creditAmount = dailyRateCurrent.times(daysRemaining);
  
  // Yeni plan için charge
  const dailyRateNew = newPlanPrice.dividedBy(daysInPeriod);
  const chargeAmount = dailyRateNew.times(daysRemaining);
  
  return {
    daysRemaining,
    daysInPeriod,
    creditAmount,
    chargeAmount,
    netAmount: chargeAmount.minus(creditAmount)
  };
}
```

### 4.4 Recurring Billing Job

```typescript
// Cron: Her gün 00:00'da çalışır
async function processRecurringBilling() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 1. Bugün faturalanacak subscriptions
  const subscriptions = await db.subscription.findMany({
    where: {
      status: 'ACTIVE',
      nextBillingDate: { lte: today }
    },
    include: { customer: true, service: true, paymentToken: true }
  });
  
  for (const sub of subscriptions) {
    try {
      // 2. Fatura oluştur
      const invoice = await createSubscriptionInvoice(sub);
      
      // 3. Kayıtlı kart varsa ödeme al
      if (sub.paymentToken) {
        await processPayment(invoice, sub.paymentToken);
      }
      
      // 4. Sonraki billing date güncelle
      await updateNextBillingDate(sub);
      
    } catch (error) {
      await handleBillingError(sub, error);
    }
  }
}
```

---

## 5. WEBHOOK EVENTS

### 5.1 Invoice Events
```typescript
type InvoiceEvents = 
  | 'invoice.created'
  | 'invoice.updated'
  | 'invoice.sent'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'invoice.overdue'
  | 'invoice.cancelled'
  | 'invoice.refunded';
```

### 5.2 Payment Events
```typescript
type PaymentEvents = 
  | 'payment.created'
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.refunded'
  | 'payment.disputed';
```

### 5.3 Subscription Events
```typescript
type SubscriptionEvents = 
  | 'subscription.created'
  | 'subscription.activated'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'subscription.expired'
  | 'subscription.trial_ending'
  | 'subscription.payment_failed';
```

---

## 6. GATEWAY ADAPTERS

### 6.1 Gateway Interface

```typescript
interface PaymentGatewayAdapter {
  // Ödeme işleme
  charge(amount: Decimal, currency: string, source: PaymentSource): Promise<ChargeResult>;
  
  // Kart tokenize
  createToken(cardDetails: CardDetails): Promise<TokenResult>;
  
  // Refund
  refund(transactionId: string, amount?: Decimal): Promise<RefundResult>;
  
  // Webhook doğrulama
  verifyWebhook(payload: string, signature: string): boolean;
  
  // Transaction sorgulama
  getTransaction(transactionId: string): Promise<Transaction>;
}
```

### 6.2 Implementasyonlar (ayrı dosyalarda)
- `adapters/stripe.ts`
- `adapters/iyzico.ts`
- `adapters/paytr.ts`
- `adapters/paypal.ts`

---

## 7. PDF TEMPLATE

### 7.1 Invoice PDF Structure
- Company logo & info
- Customer info
- Invoice details (number, date, due date)
- Items table
- Subtotal, Tax, Discount, Total
- Payment instructions
- Footer (terms, bank details)

### 7.2 Template Engine
- `@react-pdf/renderer` veya `puppeteer`
- Customizable templates
- Multi-language support

---

## 8. TASKS / CHECKLIST

### Phase 1: Core Billing (1. Hafta)
- [ ] Invoice model & CRUD
- [ ] InvoiceItem model
- [ ] Invoice number generation
- [ ] Basic tax calculation
- [ ] PDF generation

### Phase 2: Payments (2. Hafta)
- [ ] Payment model
- [ ] Stripe adapter
- [ ] iyzico adapter
- [ ] Payment token (saved cards)
- [ ] Manual payment recording

### Phase 3: Recurring (3. Hafta)
- [ ] Subscription model
- [ ] Billing cycle logic
- [ ] Proration calculation
- [ ] Recurring billing job
- [ ] Upgrade/downgrade

### Phase 4: Advanced (4. Hafta)
- [ ] Multi-currency
- [ ] Coupon system
- [ ] Refunds
- [ ] Webhooks
- [ ] Late fees

---

## 9. DEPENDENCIES

```json
{
  "@prisma/client": "^5.x",
  "decimal.js": "^10.x",
  "stripe": "^14.x",
  "date-fns": "^3.x",
  "@react-pdf/renderer": "^3.x",
  "zod": "^3.x"
}
```

---

**İlgili Dosyalar:**
- `packages/billing/src/invoices/`
- `packages/billing/src/payments/`
- `packages/billing/src/subscriptions/`
- `packages/billing/src/gateways/`
- `packages/billing/src/tax/`


---

## 10. EKSİK ÖZELLİKLER - WHMCS BILLING AUTOMATION

> Bu bölüm /billing-automation/ sayfası kontrolünden sonra eklendi

---

### 10.1 QUOTES (TEKLİF) SİSTEMİ

```prisma
model Quote {
  id            String       @id @default(cuid())
  quoteNumber   String       @unique  // QUO-202501-0001
  
  // Müşteri
  customerId    String
  customer      Customer     @relation(fields: [customerId], references: [id])
  
  // İçerik
  subject       String
  introduction  String?      @db.Text
  items         QuoteItem[]
  
  // Tutarlar
  subtotal      Decimal      @db.Decimal(10, 2)
  taxTotal      Decimal      @db.Decimal(10, 2)
  discount      Decimal      @db.Decimal(10, 2) @default(0)
  total         Decimal      @db.Decimal(10, 2)
  
  // Para Birimi
  currencyCode  String
  
  // Durum
  status        QuoteStatus  @default(DRAFT)
  
  // Geçerlilik
  validUntil    DateTime
  
  // Kabul
  acceptedAt    DateTime?
  acceptedBy    String?      // IP veya user
  signature     String?      // E-signature
  
  // Dönüşüm
  invoiceId     String?      @unique
  invoice       Invoice?     @relation(fields: [invoiceId], references: [id])
  
  // Notlar
  notes         String?
  adminNotes    String?
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  @@index([customerId])
  @@index([status])
}

enum QuoteStatus {
  DRAFT
  SENT          // Müşteriye gönderildi
  VIEWED        // Müşteri görüntüledi
  ACCEPTED      // Kabul edildi
  DECLINED      // Reddedildi
  EXPIRED       // Süresi doldu
  INVOICED      // Faturaya dönüştürüldü
}

model QuoteItem {
  id            String    @id @default(cuid())
  
  quoteId       String
  quote         Quote     @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  
  // Ürün (opsiyonel)
  productId     String?
  
  description   String
  quantity      Int       @default(1)
  unitPrice     Decimal   @db.Decimal(10, 2)
  
  // Vergi
  taxable       Boolean   @default(true)
  taxRate       Decimal   @db.Decimal(5, 2) @default(0)
  
  // Discount
  discount      Decimal   @db.Decimal(10, 2) @default(0)
  
  total         Decimal   @db.Decimal(10, 2)
  
  sortOrder     Int       @default(0)
}
```

#### Quote API Endpoints

```typescript
// tRPC Router: quoteRouter

// Admin
quotes.list
quotes.get
quotes.create
quotes.update
quotes.delete
quotes.send              // Email ile gönder
quotes.duplicate
quotes.convertToInvoice  // Faturaya dönüştür

// Client
quotes.myQuotes          // Müşterinin teklifleri
quotes.view              // Teklifi görüntüle
quotes.accept            // Kabul et (e-signature)
quotes.decline           // Reddet
```

---

### 10.2 PAYMENT REMINDERS (ÖDEME HATIRLATICI)

```prisma
model PaymentReminder {
  id            String   @id @default(cuid())
  
  // Kural
  name          String
  
  // Zamanlama
  triggerType   ReminderTriggerType
  triggerDays   Int      // Pozitif: sonra, Negatif: önce
  
  // Email template
  emailTemplateId String
  
  // Koşullar
  invoiceTypes  String[] @default([]) // Boş = hepsi
  minAmount     Decimal? @db.Decimal(10, 2)
  
  isActive      Boolean  @default(true)
  
  // Logs
  logs          ReminderLog[]
  
  createdAt     DateTime @default(now())
}

enum ReminderTriggerType {
  BEFORE_DUE     // Due date'den önce
  ON_DUE         // Due date'de
  AFTER_DUE      // Due date'den sonra (overdue)
}

model ReminderLog {
  id          String          @id @default(cuid())
  
  reminderId  String
  reminder    PaymentReminder @relation(fields: [reminderId], references: [id])
  
  invoiceId   String
  customerId  String
  
  sentAt      DateTime        @default(now())
  
  @@index([invoiceId])
}
```

#### Default Reminder Schedule
```typescript
const defaultReminders = [
  { name: '7 Days Before Due', triggerType: 'BEFORE_DUE', triggerDays: -7 },
  { name: '3 Days Before Due', triggerType: 'BEFORE_DUE', triggerDays: -3 },
  { name: 'On Due Date', triggerType: 'ON_DUE', triggerDays: 0 },
  { name: '1 Day Overdue', triggerType: 'AFTER_DUE', triggerDays: 1 },
  { name: '3 Days Overdue', triggerType: 'AFTER_DUE', triggerDays: 3 },
  { name: '7 Days Overdue', triggerType: 'AFTER_DUE', triggerDays: 7 },
  { name: '14 Days Overdue', triggerType: 'AFTER_DUE', triggerDays: 14 },
];
```

---

### 10.3 LATE FEES (GECİKME ÜCRETİ)

```prisma
model LateFeeRule {
  id            String   @id @default(cuid())
  
  name          String
  
  // Tetikleme
  daysOverdue   Int      // Kaç gün gecikince
  
  // Ücret tipi
  feeType       LateFeeType
  feeAmount     Decimal  @db.Decimal(10, 2)
  
  // Tekrarlama
  recurring     Boolean  @default(false)  // Her X günde tekrar
  recurringDays Int?     // Kaç günde bir
  maxFees       Int?     // Maksimum kaç kez
  
  // Kapsam
  applyToAllInvoices Boolean @default(true)
  minInvoiceAmount   Decimal? @db.Decimal(10, 2)
  
  isActive      Boolean  @default(true)
  
  createdAt     DateTime @default(now())
}

enum LateFeeType {
  FIXED       // Sabit tutar
  PERCENTAGE  // Fatura tutarının yüzdesi
}
```

#### Late Fee Business Logic
```typescript
async function applyLateFees() {
  const rules = await db.lateFeeRule.findMany({ where: { isActive: true } });
  
  for (const rule of rules) {
    const overdueInvoices = await db.invoice.findMany({
      where: {
        status: 'OVERDUE',
        dueDate: { lte: subDays(new Date(), rule.daysOverdue) }
      }
    });
    
    for (const invoice of overdueInvoices) {
      // Check if fee already applied today
      const existingFee = await checkExistingLateFee(invoice.id, rule.id);
      if (existingFee && !rule.recurring) continue;
      
      // Calculate fee
      const feeAmount = rule.feeType === 'FIXED' 
        ? rule.feeAmount 
        : invoice.total.times(rule.feeAmount).dividedBy(100);
      
      // Add fee as invoice item
      await db.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          description: `Late Fee - ${rule.name}`,
          quantity: 1,
          unitPrice: feeAmount,
          total: feeAmount,
          taxable: false
        }
      });
      
      // Update invoice total
      await recalculateInvoiceTotal(invoice.id);
    }
  }
}
```

---

### 10.4 CAPTURE ON-DEMAND (MANUEL ÖDEME ÇEKME)

```typescript
// API Endpoint
payments.captureOnDemand
  Input: {
    customerId: string
    paymentTokenId: string  // Kayıtlı kart
    amount: Decimal
    invoiceId?: string      // Opsiyonel - belirli fatura için
    description?: string
  }
  Output: {
    success: boolean
    payment?: Payment
    error?: string
  }

// Admin UI
// - Customer profile'da "Capture Payment" butonu
// - Saved cards listesi
// - Amount input
// - Invoice selection (opsiyonel)
```

---

### 10.5 PAYMENT DISPUTES (ÖDEME İTİRAZLARI)

```prisma
model PaymentDispute {
  id            String        @id @default(cuid())
  
  paymentId     String
  payment       Payment       @relation(fields: [paymentId], references: [id])
  
  // Gateway'den gelen bilgi
  gatewayDisputeId String?
  
  // Dispute detayları
  reason        DisputeReason
  amount        Decimal       @db.Decimal(10, 2)
  
  // Durum
  status        DisputeStatus @default(OPEN)
  
  // Evidence
  evidence      Json?         // Uploaded documents, notes
  
  // Deadlines
  respondBy     DateTime?
  
  // Resolution
  resolvedAt    DateTime?
  resolution    DisputeResolution?
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([paymentId])
  @@index([status])
}

enum DisputeReason {
  FRAUDULENT
  DUPLICATE
  PRODUCT_NOT_RECEIVED
  PRODUCT_UNACCEPTABLE
  SUBSCRIPTION_CANCELED
  CREDIT_NOT_PROCESSED
  GENERAL
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  EVIDENCE_SUBMITTED
  WON
  LOST
  CLOSED
}

enum DisputeResolution {
  WON           // Dispute kazanıldı, para geri alındı
  LOST          // Dispute kaybedildi
  REFUNDED      // Müşteriye iade yapıldı
  WITHDRAWN     // Müşteri itirazı geri çekti
}
```

---

### 10.6 GÜNCELLENMIŞ TASK LİSTESİ

#### Phase 1: Core Billing (1. Hafta)
- [ ] Invoice model & CRUD
- [ ] InvoiceItem model
- [ ] Invoice number generation
- [ ] Basic tax calculation
- [ ] PDF generation

#### Phase 2: Payments (2. Hafta)
- [ ] Payment model
- [ ] Stripe adapter
- [ ] iyzico adapter
- [ ] Payment token (saved cards)
- [ ] Manual payment recording
- [ ] **Capture on-demand**

#### Phase 3: Recurring (3. Hafta)
- [ ] Subscription model
- [ ] Billing cycle logic
- [ ] Proration calculation
- [ ] Recurring billing job
- [ ] Upgrade/downgrade
- [ ] **Payment reminders**
- [ ] **Late fees**

#### Phase 4: Advanced (4. Hafta)
- [ ] Multi-currency
- [ ] Coupon system
- [ ] Refunds
- [ ] **Quote system**
- [ ] **Payment disputes**
- [ ] Webhooks

---

**Güncelleme:** Bu bölüm `/billing-automation/` sayfası ile karşılaştırma sonrası eklendi.
