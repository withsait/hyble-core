# 🧾 FAZ2-BILLING: Fatura & Ödeme Altyapısı (Stripe + PayTR)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 💰 FAZ 2: MONEY |
| Öncelik | 🔴 P0 (Blocker) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ2-BILLING.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ1-IAM (User ve Organization modelleri)
- [x] FAZ2-WALLET (Hibrit ödemede bakiye kullanımı için)

### Dependents (Bu modülü bekleyenler):
- **FAZ2-CART:** Ödeme sayfası bu modülü kullanır.
- **FAZ3-CLOUD:** Sunucu/Hizmet oluşturulmadan önce fatura ödenmiş olmalıdır.

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/billing/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/stripe/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/paytr/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/app/api/webhooks/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/components/billing/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/dashboard/billing/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 7 Model | ⬜ 0/7 |
| Stripe Service | 🟣 Claude | 5 Fonksiyon | ⬜ 0/5 |
| **PayTR Service** | 🟣 Claude | 3 Fonksiyon | ⬜ 0/3 |
| Invoice Logic | 🟣 Claude | PDF & Numbering | ⬜ 0/2 |
| Webhook Handler | 🟣 Claude | **8 Event Type** | ⬜ 0/8 |
| Frontend Components | 🔵 Gemini | **11 Bileşen** | ⬜ 0/11 |
| Frontend Pages | 🔵 Gemini | 4 Sayfa | ⬜ 0/4 |

## 1. GENEL BAKIŞ
Bu modül, Hyble platformunun finansal omurgasıdır. Müşterilerden ödeme alma, alınan ödemeyi belgeleme (Fatura) ve düzenli ödemeleri takip etme (Abonelik) işlevlerini yerine getirir. **Global ödemeler için Stripe**, **Türkiye pazarındaki müşteriler için PayTR** altyapısını kullanır.

## 2. KAPSAM (MVP)

### ✅ Dahil Olanlar
- **Ödeme Gateway:** Stripe (Global) ve PayTR (Türkiye/Taksitli).
- **Fatura:** PDF oluşturma, Numara takibi (`HYB-202512-0001`), CRUD işlemleri.
- **Abonelik:** Aylık/Yıllık basit planlar.
- **Dunning:** Başarısız ödemelerde 3 kez tekrar deneme ve askıya alma.
- **Hibrit Ödeme:** Cüzdan bakiyesi + Kredi kartı kombinasyonu.
- **Vergi:** Sabit %20 KDV hesaplaması.

### ❌ Dahil Olmayanlar (Sonraki Fazlar)
- E-Fatura/E-Arşiv (TR GİB) → FAZ 4+
- Banka Havalesi / EFT → FAZ 3
- Muhasebe Yazılımı Entegrasyonu (Paraşüt/Xero) → FAZ 4+
- Credits Note / İade Faturası → FAZ 3

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// ENUMS
enum InvoiceType { STANDARD, SUBSCRIPTION }
enum InvoiceStatus { DRAFT, PENDING, PAID, PARTIAL, OVERDUE, CANCELLED }
enum PaymentStatus { PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED }
enum SubscriptionStatus { ACTIVE, PAST_DUE, SUSPENDED, CANCELLED }

// INVOICE
model Invoice {
  id                String        @id @default(cuid())
  invoiceNumber     String        @unique // HYB-202512-0001
  type              InvoiceType   @default(STANDARD)
  
  userId            String
  // user           User          @relation(fields: [userId], references: [id])
  organizationId    String?
  // organization   Organization? @relation(fields: [organizationId], references: [id])
  subscriptionId    String?
  subscription      Subscription? @relation(fields: [subscriptionId], references: [id])
  
  // Amounts (cents)
  subtotal          Int
  taxRate           Decimal       @db.Decimal(5, 2) @default(20)
  taxTotal          Int
  total             Int
  amountPaid        Int           @default(0)
  amountDue         Int
  
  currency          String        @default("EUR")
  status            InvoiceStatus @default(DRAFT)
  
  issueDate         DateTime      @default(now())
  dueDate           DateTime
  paidAt            DateTime?
  
  notes             String?
  items             InvoiceItem[]
  payments          InvoicePayment[]
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@index([userId])
  @@index([status])
}

model InvoiceItem {
  id            String   @id @default(cuid())
  invoiceId     String
  invoice       Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  productId     String?
  description   String
  quantity      Int      @default(1)
  unitPrice     Int      // cents
  taxAmount     Int
  total         Int
  
  createdAt     DateTime @default(now())
}

// PAYMENT
model Payment {
  id                String        @id @default(cuid())
  userId            String
  // user           User          @relation(fields: [userId], references: [id])
  
  gateway           String        // stripe, paytr, wallet
  gatewayPaymentId  String?       // Stripe Payment Intent ID veya PayTR merchant_oid
  
  // PayTR Specific
  installment       Int?          // Taksit sayısı (2-12)
  paytrHash         String?       // Güvenlik hash
  
  amount            Int           // cents
  currency          String        @default("EUR")
  status            PaymentStatus @default(PENDING)
  
  paymentMethodId   String?
  paymentMethod     PaymentMethod? @relation(fields: [paymentMethodId], references: [id])
  
  metadata          Json?
  failureReason     String?
  processedAt       DateTime?
  
  invoicePayments   InvoicePayment[]
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@index([userId])
  @@index([gateway, gatewayPaymentId])
}

model InvoicePayment {
  id          String   @id @default(cuid())
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id])
  paymentId   String
  payment     Payment  @relation(fields: [paymentId], references: [id])
  
  amount      Int      // Allocated amount
  allocatedAt DateTime @default(now())
  
  @@unique([invoiceId, paymentId])
}

model PaymentMethod {
  id               String   @id @default(cuid())
  userId           String
  // user           User     @relation(fields: [userId], references: [id])
  
  gateway          String   @default("stripe")
  gatewayMethodId  String   // Stripe PM ID
  
  type             String   // card
  lastFour         String
  brand            String   // visa, mastercard
  expMonth         Int
  expYear          Int
  
  isDefault        Boolean  @default(false)
  
  payments         Payment[]
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@unique([gateway, gatewayMethodId])
  @@index([userId])
}

// SUBSCRIPTION
model Subscription {
  id                   String             @id @default(cuid())
  userId               String
  // user              User               @relation(fields: [userId], references: [id])
  organizationId       String?
  // organization      Organization?      @relation(fields: [organizationId], references: [id])
  
  planId               String
  plan                 SubscriptionPlan   @relation(fields: [planId], references: [id])
  
  status               SubscriptionStatus @default(ACTIVE)
  billingPeriod        String             // monthly, annually
  
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelledAt          DateTime?
  cancelReason         String?
  
  stripeSubscriptionId String?            @unique
  
  invoices             Invoice[]
  dunningAttempts      DunningAttempt[]
  
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  
  @@index([userId])
  @@index([status])
}

model SubscriptionPlan {
  id            String         @id @default(cuid())
  name          String
  description   String?
  
  billingPeriod String         // monthly, annually
  price         Int            // cents
  currency      String         @default("EUR")
  
  features      Json?
  isActive      Boolean        @default(true)
  
  subscriptions Subscription[]
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model DunningAttempt {
  id             String       @id @default(cuid())
  subscriptionId String
  subscription   Subscription @relation(fields: [subscriptionId], references: [id])
  
  attemptNumber  Int          // 1, 2, 3
  result         String       // success, failed
  nextAttemptAt  DateTime?
  
  createdAt      DateTime     @default(now())
  
  @@index([subscriptionId])
}
4. İŞ MANTIĞI (BUSINESS LOGIC)A. Fatura NumaralamaFaturalar sıralı ve benzersiz olmalıdır: HYB-YYYYMM-XXXX.Örn: HYB-202512-0001Her ayın başında sayaç sıfırlanabilir veya kümülatif gidebilir (MVP: Kümülatif).B. Hibrit Ödeme (Orchestration)Kullanıcı bir hizmet alırken:Toplam Tutar: 100€Wallet Kontrolü: Cüzdanda 20€ var. Kullanıcı "Cüzdanı Kullan" dedi.Bölme: 20€ Wallet'tan, 80€ Karttan çekilecek.İşlem 1 (Wallet): WalletService.spend(20) çağrılır. Başarılıysa devam.İşlem 2 (Gateway): 80€'luk işlem Stripe veya PayTR üzerinden başlatılır.Finalize: Gateway başarılı dönünce Fatura PAID işaretlenir. Başarısız olursa Wallet işlemi refund edilir.C. Dunning (Ödeme Tekrarı)Abonelik ödemesi başarısız olduğunda:Gün 0: Ödeme başarısız. Status: PAST_DUE. E-posta gönder.Gün 1, 3, 7: Tekrar deneme periyotları.Gün 10: Başarısız ise Status: SUSPENDED. Hizmet durdurulur.5. API ENDPOINTS & WEBHOOKSAPI Routersinvoice.*: Listeleme, detay görüntüleme, PDF indirme.payment.*: Checkout başlatma, kayıtlı kartları listeleme.subscription.*: Abonelik oluşturma, iptal etme.Stripe WebhooksSistem şu eventleri dinler ve veritabanını günceller:checkout.session.completed → Faturayı ödenmiş yap.payment_intent.succeeded → Ödeme kaydı oluştur.invoice.payment_failed → Dunning sürecini tetikle.customer.subscription.updated → Abonelik durumunu güncelle.7. PAYTR ENTEGRASYONU (Türkiye)A. Neden PayTR?Türkiye'de taksit desteği (2-12 ay)Türk kartları için daha yüksek onay oranıTRY ile ödeme alma3D Secure zorunluB. Kullanım SenaryosuTypeScript// Gateway seçimi: Kullanıcının ülkesine göre
if (user.country === 'TR' || currency === 'TRY') {
  gateway = 'paytr'
} else {
  gateway = 'stripe'
}
C. PayTR AkışıKullanıcı checkout'a gelirBackend PayTRService.createToken() çağırırPayTR iframe içinde ödeme formu açılırKullanıcı taksit seçer (opsiyonel)3D Secure doğrulamaPayTR callback URL'e POST yaparBackend webhook'u işler, fatura güncellerD. PayTR ServiceTypeScript// packages/api/src/services/paytr.ts

interface PayTRService {
  createToken(params: {
    userId: string
    amount: number // Kuruş cinsinden
    currency: 'TRY'
    invoiceId: string
    installment?: number
  }): Promise<{ token: string; iframeUrl: string }>
  
  verifyCallback(params: {
    merchantOid: string
    status: string
    totalAmount: number
    hash: string
  }): Promise<boolean>
}
E. PayTR WebhookTypeScript// Dinlenecek callback:
POST /api/webhooks/paytr

// Payload:
{
  merchant_oid: "INV-123",
  status: "success" | "failed",
  total_amount: "10000", // Kuruş
  hash: "...",
  installment_count: "3"
}

// İşlem:
1. Hash doğrula (güvenlik)
2. Payment kaydı oluştur/güncelle
3. Invoice status güncelle
4. "OK" response dön (PayTR gereksinimi)
F. Frontend: Taksit Seçimicomponents/billing/
├── PayTRCheckout.tsx       # PayTR iframe wrapper
├── InstallmentSelector.tsx # Taksit seçim tablosu
└── PaymentGatewaySwitch.tsx # Stripe/PayTR toggle
G. Taksit Tablosu ÖrneğiTaksitAylıkToplamKomisyonTek Çekim₺1000₺1000%03 Taksit₺340₺1020%26 Taksit₺175₺1050%59 Taksit₺120₺1080%812 Taksit₺95₺1140%14Not: Komisyon oranları örnek, PayTR anlaşmasına göre değişir.H. Environment VariablesKod snippet'iPAYTR_MERCHANT_ID=xxx
PAYTR_MERCHANT_KEY=xxx
PAYTR_MERCHANT_SALT=xxx
PAYTR_TEST_MODE=true


✅ KABUL KRİTERLERİ (DoD)[ ] Fatura oluşturulabiliyor (draft → pending → paid).[ ] Fatura PDF olarak indirilebiliyor (basit tasarım).[ ] Stripe Checkout ile başarılı ödeme alınıyor ve DB güncelleniyor.[ ] Stripe Webhook'ları doğru çalışıyor ve güvenli.[ ] PayTR ile TRY ödeme alınabiliyor.[ ] PayTR taksit seçimi çalışıyor.[ ] PayTR 3D Secure doğrulama çalışıyor.[ ] PayTR webhook hash doğrulaması yapılıyor.[ ] Gateway seçimi (Stripe/PayTR) ülkeye göre otomatik yapılıyor.[ ] Kullanıcı kredi kartını kaydedebiliyor (Stripe için).[ ] Abonelik başlatılabiliyor ve iptal edilebiliyor.[ ] Hibrit ödeme (Wallet + Kart) senaryosu test edildi.

// User modeline ekle:
model User {
  // ... mevcut field'lar ...
  invoices        Invoice[]
  payments        Payment[]
  paymentMethods  PaymentMethod[]
  subscriptions   Subscription[]
}

// Organization modeline ekle:
model Organization {
  // ... mevcut field'lar ...
  invoices        Invoice[]
  subscriptions   Subscription[]
}

🔴 KRİTİK: Cross-Module Relations
FAZ2-BILLING'deki InvoiceItem modeline şu relation eklenecek:
prisma// InvoiceItem modeline ekle:
model InvoiceItem {
  // ... mevcut field'lar ...
  productId     String?
  product       Product?  @relation(fields: [productId], references: [id])
}
Bu notu FAZ2-BILLING.md'ye "Cross-Module Relations" bölümü olarak eklemen gerekiyor.