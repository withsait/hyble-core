# 🛒 FAZ2-CART: Sepet ve Checkout Sistemi (MVP)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 💰 FAZ 2: MONEY |
| Öncelik | 🔴 P0 (Blocker) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ2-CART.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ2-PIM (Sepete eklenecek ürün verisi)
- [x] FAZ2-BILLING (Ödeme ve Fatura işlemi)
- [x] FAZ2-WALLET (Bakiye kullanımı)
- [x] FAZ2-DELIVERY (Dijital lisans oluşturma)

### Dependents (Bu modülü bekleyenler):
- **FAZ3-CLOUD:** Cloud servisleri sipariş tamamlanmadan provision edilemez.

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/cart/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/cart/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/components/cart/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/components/checkout/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/dashboard/cart/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/dashboard/checkout/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 5 Model | ⬜ 0/5 |
| Cart Service | 🟣 Claude | 8 Fonksiyon | ⬜ 0/8 |
| Checkout Service | 🟣 Claude | 4 Fonksiyon | ⬜ 0/4 |
| Order Service | 🟣 Claude | 5 Fonksiyon | ⬜ 0/5 |
| Coupon Service | 🟣 Claude | 4 Fonksiyon | ⬜ 0/4 |
| Frontend Cart | 🔵 Gemini | 10 Bileşen | ⬜ 0/10 |
| Frontend Checkout | 🔵 Gemini | 7 Bileşen | ⬜ 0/7 |
| Frontend Orders | 🔵 Gemini | 6 Bileşen | ⬜ 0/6 |
| Pages | 🔵 Gemini | 9 Sayfa | ⬜ 0/9 |

## 1. GENEL BAKIŞ
Bu modül, Hyble'ın e-ticaret altyapısının merkezidir. Kullanıcıların ürünleri sepete eklemesini, kupon kullanmasını, ödeme adımına (Checkout) geçmesini ve sipariş oluşturmasını sağlar. Misafir kullanıcılar (Guest) için localStorage destekli sepet yapısı ve giriş yaptıktan sonra sepet birleştirme (Merge) mekanizması kritik özelliklerdir.

## 2. KAPSAM (MVP)

### ✅ Dahil Olanlar
- **Sepet Yönetimi:** Ekle, çıkar, miktar güncelle, temizle.
- **Sepet Türleri:** Guest (Session ID) ve Auth (User ID).
- **Cart Merge:** Giriş yapınca Guest sepetin User sepete aktarılması.
- **Kupon:** Yüzdelik (%) ve Sabit Tutar (Fixed) indirimler.
- **Checkout:** 3 Adımlı Wizard (Fatura → Ödeme → Onay).
- **Sipariş:** Order ve OrderItem kaydı, Fatura (Invoice) tetikleme.
- **Fiyat Kilidi:** Sepete eklenen ürün fiyatı 7 gün sabit kalır.
- **Özet:** Subtotal, Tax, Discount, Total hesaplaması.

### ❌ Dahil Olmayanlar (Sonraki Fazlar)
- B2B Approval Workflow (Onay mekanizması) → FAZ 4+
- Quote/Teklif Sistemi → FAZ 4+
- Terk Edilmiş Sepet (Abandoned Cart) E-postaları → FAZ 3
- Exit Intent Popup → FAZ 3
- Çoklu Sepet (Multi-Cart) → FAZ 5+

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// ENUMS
enum CartStatus { ACTIVE, ABANDONED, CONVERTED, EXPIRED }
enum OrderStatus { PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED }
enum CouponType { PERCENTAGE, FIXED_AMOUNT }

// CART
model Cart {
  id              String      @id @default(cuid())
  userId          String?
  // user         User?       @relation(fields: [userId], references: [id])
  organizationId  String?
  // organization Organization? @relation(fields: [organizationId], references: [id])
  
  sessionId       String?     // Guest cart identifier
  status          CartStatus  @default(ACTIVE)
  
  // Kupon
  couponId        String?
  coupon          Coupon?     @relation(fields: [couponId], references: [id])
  couponDiscount  Int         @default(0) // Hesaplanan indirim (cents)
  
  // Fiyat kilidi
  priceLockedAt   DateTime?
  priceLockedUntil DateTime?  // +7 gün
  
  // Totals
  subtotal        Int         @default(0)
  taxAmount       Int         @default(0)
  discountAmount  Int         @default(0)
  total           Int         @default(0)
  
  currency        String      @default("EUR")
  expiresAt       DateTime?   // Guest cart expiry (30 gün)
  
  items           CartItem[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([userId, status])
  @@index([sessionId])
  @@index([status])
}

model CartItem {
  id              String      @id @default(cuid())
  cartId          String
  cart            Cart        @relation(fields: [cartId], references: [id], onDelete: Cascade)
  
  productId       String
  // product      Product     @relation(fields: [productId], references: [id])
  variantId       String?
  // variant      ProductVariant? @relation(fields: [variantId], references: [id])
  
  quantity        Int         @default(1)
  unitPrice       Int         // Cents (Price Lock Snapshot)
  
  configuration   Json?       // Hosting config vb.
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([cartId, productId, variantId])
  @@index([cartId])
}

// ORDER
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique // HYB-ORD-202512-0001
  
  userId          String
  // user         User        @relation(fields: [userId], references: [id])
  organizationId  String?
  // organization Organization? @relation(fields: [organizationId], references: [id])
  
  status          OrderStatus @default(PENDING)
  
  // Amounts (cents)
  subtotal        Int
  discountAmount  Int         @default(0)
  taxRate         Decimal     @db.Decimal(5, 2) @default(20)
  taxAmount       Int
  total           Int
  
  currency        String      @default("EUR")
  
  // Kupon
  couponId        String?
  couponCode      String?
  
  // Snapshot
  billingAddress  Json
  
  // Ödeme
  paymentStatus   String      @default("pending")
  paidAt          DateTime?
  
  // Teslimat
  fulfilledAt     DateTime?
  
  items           OrderItem[]
  invoiceId       String?     // FAZ2-BILLING Invoice reference
  
  notes           String?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([userId])
  @@index([status])
}

model OrderItem {
  id              String      @id @default(cuid())
  orderId         String
  order           Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  productId       String
  // product      Product     @relation(fields: [productId], references: [id])
  variantId       String?
  
  // Snapshot
  productName     String
  variantName     String?
  
  quantity        Int
  unitPrice       Int         // Cents
  totalPrice      Int
  
  configuration   Json?
  
  status          String      @default("pending")
  fulfilledAt     DateTime?
  
  licenseId       String?     // FAZ2-DELIVERY
  subscriptionId  String?     // FAZ2-BILLING
  
  createdAt       DateTime    @default(now())
  
  @@index([orderId])
}

// COUPON
model Coupon {
  id              String      @id @default(cuid())
  code            String      @unique
  name            String?
  
  type            CouponType
  value           Int         // % veya cents
  
  minOrderAmount  Int?
  maxDiscountAmount Int?
  
  applicableProductIds String[]
  applicableCategoryIds String[]
  newCustomersOnly Boolean    @default(false)
  
  usageLimit      Int?
  usageLimitPerUser Int?
  usageCount      Int         @default(0)
  
  startsAt        DateTime    @default(now())
  expiresAt       DateTime?
  
  isActive        Boolean     @default(true)
  
  carts           Cart[]
  usages          CouponUsage[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([code])
}

model CouponUsage {
  id              String      @id @default(cuid())
  couponId        String
  coupon          Coupon      @relation(fields: [couponId], references: [id])
  
  userId          String
  orderId         String
  
  discountAmount  Int
  usedAt          DateTime    @default(now())
  
  @@index([couponId])
  @@index([userId])
}
4. İŞ MANTIĞI (BUSINESS LOGIC)
A. Sepet Akışı
Get/Create: Kullanıcı Auth ise userId ile, değilse sessionId ile aktif sepet aranır. Yoksa oluşturulur.

Add Item: Ürün sepete eklenirken anlık fiyatı unitPrice olarak kaydedilir ve fiyat kilidi (7 gün) başlar.

Merge: Guest kullanıcı giriş yaptığında, sessionId'li sepetteki ürünler userId'li sepete aktarılır. Çakışan ürünlerde miktar artırılır. Guest sepet silinir.

B. Kupon Validasyonu
Bir kupon uygulanırken sırasıyla şu kontroller yapılır:

Kupon aktif mi?

Süresi dolmuş mu?

Genel kullanım limiti dolmuş mu?

Kullanıcı özel limiti dolmuş mu?

Minimum sepet tutarı karşılanıyor mu?

Geçerli ürünler sepette var mı?

C. Checkout & Sipariş
Validation: Sepetteki ürünlerin stoğu ve fiyatları son kez kontrol edilir.

Order Create: Cart verileri Order ve OrderItem tablolarına kopyalanır (Snapshot).

Invoice: FAZ2-BILLING servisi çağrılarak taslak fatura oluşturulur.

Payment: Ödeme (Stripe/PayTR/Wallet) başlatılır.

Conversion: Ödeme başarılıysa Order statüsü PROCESSING olur, Cart statüsü CONVERTED olur.

5. API ENDPOINTS
GET /api/cart: Aktif sepeti getir.

POST /api/cart/items: Sepete ürün ekle.

POST /api/cart/coupon: Kupon uygula.

POST /api/cart/merge: Sepet birleştir.

POST /api/checkout/order: Sipariş oluştur.

GET /api/orders: Sipariş geçmişi.

GET /api/admin/orders: Tüm siparişler (Yönetim).

6. FRONTEND BİLEŞENLERİ (UI)
CartDrawer: Sağdan açılan, hızlı sepet önizlemesi.

CheckoutWizard: 3 Adımlı (Fatura, Ödeme, Onay) işlem sihirbazı.

OrderSummaryCard: Sepet toplamlarını ve uygulanan indirimleri gösteren kart.

CouponInput: Kupon kodu girip "Uygula" denilen alan.

OrderList: Kullanıcının geçmiş siparişlerini listeleyen tablo.

✅ KABUL KRİTERLERİ (DoD)
[ ] Sepete ürün eklenebiliyor, çıkarılabiliyor, güncellenebiliyor.

[ ] Misafir (Guest) kullanıcılar sepeti kullanabiliyor (localStorage).

[ ] Giriş yapınca misafir sepeti kullanıcı sepetine aktarılıyor (Merge).

[ ] Kupon kodu uygulanabiliyor ve indirim doğru hesaplanıyor.

[ ] Checkout süreci 3 adımda tamamlanabiliyor.

[ ] Başarılı ödeme sonrası Sipariş ve Fatura kayıtları oluşuyor.

[ ] Sipariş geçmişi görüntülenebiliyor.

[ ] Yönetim panelinde siparişler ve kuponlar yönetilebiliyor.