# FAZ 2: MONEY - Detaylı Görev Listesi

> **Son Güncelleme:** 2025-12-17
> **Durum:** Planlandı → Devam Ediyor

---

## GENEL DURUM ÖZET

| Modül | Planlanan | Mevcut | Tamamlanma |
|-------|-----------|--------|------------|
| FAZ2-WALLET | 7 model, 6 endpoint | 2 model, 7 endpoint | ~40% |
| FAZ2-BILLING | 7 model, 8 webhook | 3 model, 0 webhook | ~25% |
| FAZ2-PIM | 7 model, 6 endpoint | 0 model | 0% |
| FAZ2-CART | 5 model, 7 endpoint | 0 model | 0% |
| FAZ2-DELIVERY | 7 model, 5 endpoint | 0 model | 0% |

---

## 1. FAZ2-PIM (Product Information Management)

### 1.1 Database Schema (Claude)

| # | Görev | Model | Durum |
|---|-------|-------|-------|
| 1.1.1 | Category modeli oluştur | `Category` | ⬜ |
| 1.1.2 | Product modeli oluştur | `Product` | ⬜ |
| 1.1.3 | ProductVariant modeli oluştur | `ProductVariant` | ⬜ |
| 1.1.4 | ProductMedia modeli oluştur | `ProductMedia` | ⬜ |
| 1.1.5 | ProductMeta (SEO) modeli oluştur | `ProductMeta` | ⬜ |
| 1.1.6 | ProductRelation modeli oluştur | `ProductRelation` | ⬜ |
| 1.1.7 | BundleItem modeli oluştur | `BundleItem` | ⬜ |

**Enum'lar:**
- `ProductType`: DIGITAL, SUBSCRIPTION, BUNDLE, SERVICE
- `ProductStatus`: DRAFT, ACTIVE, ARCHIVED
- `StockType`: UNLIMITED, LIMITED, CAPACITY

### 1.2 Backend API (Claude)

| # | Görev | Endpoint | Durum |
|---|-------|----------|-------|
| 1.2.1 | Ürün listeleme | `product.list` | ⬜ |
| 1.2.2 | Ürün detayı (slug) | `product.getBySlug` | ⬜ |
| 1.2.3 | Ürün oluşturma (admin) | `product.create` | ⬜ |
| 1.2.4 | Ürün güncelleme (admin) | `product.update` | ⬜ |
| 1.2.5 | Varyant ekleme | `variant.create` | ⬜ |
| 1.2.6 | Kategori CRUD | `category.*` | ⬜ |
| 1.2.7 | Bundle hesaplama | `bundle.calculate` | ⬜ |
| 1.2.8 | Medya yükleme (R2) | `media.upload` | ⬜ |

### 1.3 Frontend (Gemini)

| # | Görev | Component | Durum |
|---|-------|-----------|-------|
| 1.3.1 | Ürün formu (çok dilli) | `ProductForm.tsx` | ⬜ |
| 1.3.2 | Varyant editörü | `VariantEditor.tsx` | ⬜ |
| 1.3.3 | Özellik matrisi | `FeatureMatrixEditor.tsx` | ⬜ |
| 1.3.4 | Bundle builder | `BundleBuilder.tsx` | ⬜ |
| 1.3.5 | Karşılaştırma tablosu | `ComparisonTable.tsx` | ⬜ |
| 1.3.6 | Ürün kartı | `ProductCard.tsx` | ⬜ |
| 1.3.7 | Kategori ağacı | `CategoryTree.tsx` | ⬜ |
| 1.3.8 | Medya yükleyici | `MediaUploader.tsx` | ⬜ |

**Sayfalar:**
- `/admin/products` - Ürün listesi
- `/admin/products/new` - Yeni ürün
- `/admin/products/[id]` - Ürün düzenleme
- `/admin/categories` - Kategori yönetimi
- `/products` - Public ürün listesi
- `/products/[slug]` - Ürün detay

---

## 2. FAZ2-WALLET (Global Wallet System)

### 2.1 Database Schema (Claude)

| # | Görev | Model | Mevcut | Durum |
|---|-------|-------|--------|-------|
| 2.1.1 | Wallet modelini genişlet | `Wallet` | ✅ Basit | ⚠️ Güncelle |
| 2.1.2 | WalletTransaction güncelle | `WalletTransaction` | ✅ Var | ⚠️ Güncelle |
| 2.1.3 | WalletBonus modeli ekle | `WalletBonus` | ❌ | ⬜ |
| 2.1.4 | WalletPromo modeli ekle | `WalletPromo` | ❌ | ⬜ |
| 2.1.5 | BonusTier modeli ekle | `BonusTier` | ❌ | ⬜ |
| 2.1.6 | Voucher modeli ekle | `Voucher` | ❌ | ⬜ |
| 2.1.7 | VoucherUsage modeli ekle | `VoucherUsage` | ❌ | ⬜ |

**Wallet Güncellemeleri:**
```diff
model Wallet {
  // Mevcut
  id, userId, balance, currency

  // Eklenecek
+ organizationId  String?  @unique
+ mainBalance     Decimal  @default(0)
+ bonusBalance    Decimal  @default(0)
+ promoBalance    Decimal  @default(0)
+ status          WalletStatus @default(ACTIVE)
+ bonuses         WalletBonus[]
+ promos          WalletPromo[]
}
```

### 2.2 Backend API (Claude)

| # | Görev | Endpoint | Mevcut | Durum |
|---|-------|----------|--------|-------|
| 2.2.1 | Bakiye sorgulama | `wallet.getBalance` | ✅ | ✅ |
| 2.2.2 | İşlem geçmişi | `wallet.getTransactions` | ✅ | ✅ |
| 2.2.3 | Para yükleme (Stripe) | `wallet.createDepositSession` | ✅ | ✅ |
| 2.2.4 | Harcama servisi | `wallet.spend` | ❌ | ⬜ |
| 2.2.5 | Voucher doğrulama | `voucher.validate` | ❌ | ⬜ |
| 2.2.6 | Voucher kullanma | `voucher.redeem` | ❌ | ⬜ |
| 2.2.7 | Admin kredi ekle | `admin.wallet.credit` | ✅ | ✅ |
| 2.2.8 | Admin kredi sil | `admin.wallet.debit` | ✅ | ✅ |

**Harcama Önceliği Mantığı:**
```typescript
// wallet.spend() içinde:
// 1. Promo bakiyeden düş (FIFO - süresi yakın olan önce)
// 2. Bonus bakiyeden düş (FIFO)
// 3. Main bakiyeden düş
```

### 2.3 Frontend (Gemini)

| # | Görev | Component | Mevcut | Durum |
|---|-------|-----------|--------|-------|
| 2.3.1 | 3'lü bakiye kartı | `WalletCard.tsx` | ❌ | ⬜ |
| 2.3.2 | İşlem listesi | `TransactionList.tsx` | ⚠️ Statik | ⬜ |
| 2.3.3 | Para yükleme modal | `DepositModal.tsx` | ❌ | ⬜ |
| 2.3.4 | Bonus tier seçici | `BonusTierSelector.tsx` | ❌ | ⬜ |
| 2.3.5 | Voucher input | `VoucherInput.tsx` | ❌ | ⬜ |
| 2.3.6 | Ayarlar (para birimi) | `WalletSettings.tsx` | ❌ | ⬜ |

**Sayfalar:**
- `/wallet` - Ana cüzdan sayfası (⚠️ Var, güncelle)
- `/wallet/deposit` - Para yükleme
- `/wallet/history` - İşlem geçmişi

---

## 3. FAZ2-BILLING (Fatura & Ödeme)

### 3.1 Database Schema (Claude)

| # | Görev | Model | Mevcut | Durum |
|---|-------|-------|--------|-------|
| 3.1.1 | Invoice modelini genişlet | `Invoice` | ✅ Basit | ⚠️ Güncelle |
| 3.1.2 | InvoiceItem modeli ekle | `InvoiceItem` | ❌ (Json) | ⬜ |
| 3.1.3 | Payment modeli ekle | `Payment` | ❌ | ⬜ |
| 3.1.4 | InvoicePayment modeli ekle | `InvoicePayment` | ❌ | ⬜ |
| 3.1.5 | PaymentMethod modeli ekle | `PaymentMethod` | ❌ | ⬜ |
| 3.1.6 | Subscription modeli ekle | `Subscription` | ❌ | ⬜ |
| 3.1.7 | SubscriptionPlan modeli ekle | `SubscriptionPlan` | ❌ | ⬜ |
| 3.1.8 | DunningAttempt modeli ekle | `DunningAttempt` | ❌ | ⬜ |

**Enum'lar:**
- `InvoiceType`: STANDARD, SUBSCRIPTION
- `InvoiceStatus`: DRAFT, PENDING, PAID, PARTIAL, OVERDUE, CANCELLED
- `PaymentStatus`: PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED
- `SubscriptionStatus`: ACTIVE, PAST_DUE, SUSPENDED, CANCELLED

### 3.2 Backend Services (Claude)

| # | Görev | Service | Durum |
|---|-------|---------|-------|
| 3.2.1 | Stripe servis wrapper | `StripeService` | ⬜ |
| 3.2.2 | PayTR servis wrapper | `PayTRService` | ⬜ |
| 3.2.3 | Invoice numaralama | `InvoiceService.generateNumber` | ⬜ |
| 3.2.4 | PDF oluşturma | `InvoiceService.generatePDF` | ⬜ |
| 3.2.5 | Hibrit ödeme orchestrator | `PaymentOrchestrator` | ⬜ |

### 3.3 Backend API (Claude)

| # | Görev | Endpoint | Durum |
|---|-------|----------|-------|
| 3.3.1 | Fatura listesi | `invoice.list` | ⬜ |
| 3.3.2 | Fatura detayı | `invoice.get` | ⬜ |
| 3.3.3 | PDF indirme | `invoice.downloadPDF` | ⬜ |
| 3.3.4 | Checkout başlat | `payment.createCheckout` | ⬜ |
| 3.3.5 | Kayıtlı kartlar | `payment.listMethods` | ⬜ |
| 3.3.6 | Kart kaydet | `payment.saveMethod` | ⬜ |
| 3.3.7 | Abonelik oluştur | `subscription.create` | ⬜ |
| 3.3.8 | Abonelik iptal | `subscription.cancel` | ⬜ |

### 3.4 Webhooks (Claude)

| # | Görev | Event | Durum |
|---|-------|-------|-------|
| 3.4.1 | Stripe webhook handler | `/api/webhooks/stripe` | ⬜ |
| 3.4.2 | checkout.session.completed | Event handler | ⬜ |
| 3.4.3 | payment_intent.succeeded | Event handler | ⬜ |
| 3.4.4 | invoice.payment_failed | Event handler | ⬜ |
| 3.4.5 | customer.subscription.updated | Event handler | ⬜ |
| 3.4.6 | PayTR webhook handler | `/api/webhooks/paytr` | ⬜ |
| 3.4.7 | PayTR hash doğrulama | Security check | ⬜ |
| 3.4.8 | PayTR taksit işleme | Installment handler | ⬜ |

### 3.5 Frontend (Gemini)

| # | Görev | Component | Durum |
|---|-------|-----------|-------|
| 3.5.1 | Fatura listesi | `InvoiceList.tsx` | ⬜ |
| 3.5.2 | Fatura detay | `InvoiceDetail.tsx` | ⬜ |
| 3.5.3 | Checkout formu | `CheckoutForm.tsx` | ⬜ |
| 3.5.4 | Kayıtlı kartlar | `SavedCards.tsx` | ⬜ |
| 3.5.5 | Kart ekleme | `AddCardForm.tsx` | ⬜ |
| 3.5.6 | PayTR iframe | `PayTRCheckout.tsx` | ⬜ |
| 3.5.7 | Taksit seçici | `InstallmentSelector.tsx` | ⬜ |
| 3.5.8 | Gateway switch | `PaymentGatewaySwitch.tsx` | ⬜ |
| 3.5.9 | Abonelik kartı | `SubscriptionCard.tsx` | ⬜ |
| 3.5.10 | Plan karşılaştırma | `PlanComparison.tsx` | ⬜ |
| 3.5.11 | Ödeme özeti | `PaymentSummary.tsx` | ⬜ |

**Sayfalar:**
- `/billing` - Fatura listesi
- `/billing/[id]` - Fatura detay
- `/billing/checkout` - Ödeme sayfası
- `/billing/subscriptions` - Abonelikler

---

## 4. FAZ2-CART (Sepet & Checkout)

### 4.1 Database Schema (Claude)

| # | Görev | Model | Durum |
|---|-------|-------|-------|
| 4.1.1 | Cart modeli oluştur | `Cart` | ⬜ |
| 4.1.2 | CartItem modeli oluştur | `CartItem` | ⬜ |
| 4.1.3 | Order modeli oluştur | `Order` | ⬜ |
| 4.1.4 | OrderItem modeli oluştur | `OrderItem` | ⬜ |
| 4.1.5 | Coupon modeli oluştur | `Coupon` | ⬜ |
| 4.1.6 | CouponUsage modeli oluştur | `CouponUsage` | ⬜ |

**Enum'lar:**
- `CartStatus`: ACTIVE, ABANDONED, CONVERTED, EXPIRED
- `OrderStatus`: PENDING, PROCESSING, COMPLETED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED
- `CouponType`: PERCENTAGE, FIXED_AMOUNT

### 4.2 Backend Services (Claude)

| # | Görev | Service | Durum |
|---|-------|---------|-------|
| 4.2.1 | Cart service | `CartService` | ⬜ |
| 4.2.2 | Guest cart (session) | `CartService.getGuestCart` | ⬜ |
| 4.2.3 | Cart merge | `CartService.merge` | ⬜ |
| 4.2.4 | Price lock (7 gün) | `CartService.lockPrice` | ⬜ |
| 4.2.5 | Coupon validation | `CouponService.validate` | ⬜ |
| 4.2.6 | Order service | `OrderService` | ⬜ |
| 4.2.7 | Order numaralama | `OrderService.generateNumber` | ⬜ |

### 4.3 Backend API (Claude)

| # | Görev | Endpoint | Durum |
|---|-------|----------|-------|
| 4.3.1 | Sepeti getir | `cart.get` | ⬜ |
| 4.3.2 | Ürün ekle | `cart.addItem` | ⬜ |
| 4.3.3 | Ürün çıkar | `cart.removeItem` | ⬜ |
| 4.3.4 | Miktar güncelle | `cart.updateQuantity` | ⬜ |
| 4.3.5 | Sepet temizle | `cart.clear` | ⬜ |
| 4.3.6 | Kupon uygula | `cart.applyCoupon` | ⬜ |
| 4.3.7 | Sepet birleştir | `cart.merge` | ⬜ |
| 4.3.8 | Checkout (order oluştur) | `checkout.createOrder` | ⬜ |
| 4.3.9 | Sipariş listesi | `order.list` | ⬜ |
| 4.3.10 | Sipariş detayı | `order.get` | ⬜ |

### 4.4 Frontend (Gemini)

| # | Görev | Component | Durum |
|---|-------|-----------|-------|
| 4.4.1 | Sepet drawer | `CartDrawer.tsx` | ⬜ |
| 4.4.2 | Sepet ikonu (badge) | `CartIcon.tsx` | ⬜ |
| 4.4.3 | Sepet item | `CartItem.tsx` | ⬜ |
| 4.4.4 | Miktar seçici | `QuantitySelector.tsx` | ⬜ |
| 4.4.5 | Kupon input | `CouponInput.tsx` | ⬜ |
| 4.4.6 | Sipariş özeti | `OrderSummary.tsx` | ⬜ |
| 4.4.7 | Checkout wizard | `CheckoutWizard.tsx` | ⬜ |
| 4.4.8 | Adres seçici | `AddressSelector.tsx` | ⬜ |
| 4.4.9 | Ödeme adımı | `PaymentStep.tsx` | ⬜ |
| 4.4.10 | Onay adımı | `ConfirmationStep.tsx` | ⬜ |
| 4.4.11 | Sipariş listesi | `OrderList.tsx` | ⬜ |
| 4.4.12 | Sipariş detay | `OrderDetail.tsx` | ⬜ |

**Sayfalar:**
- `/cart` - Sepet sayfası
- `/checkout` - 3 adımlı checkout
- `/checkout/success` - Başarılı sipariş
- `/orders` - Sipariş geçmişi
- `/orders/[id]` - Sipariş detay

---

## 5. FAZ2-DELIVERY (Dijital Dağıtım)

### 5.1 Database Schema (Claude)

| # | Görev | Model | Durum |
|---|-------|-------|-------|
| 5.1.1 | DownloadableProduct modeli | `DownloadableProduct` | ⬜ |
| 5.1.2 | ProductVersion modeli | `ProductVersion` | ⬜ |
| 5.1.3 | ProductFile modeli | `ProductFile` | ⬜ |
| 5.1.4 | ProductLicense modeli | `ProductLicense` | ⬜ |
| 5.1.5 | DownloadToken modeli | `DownloadToken` | ⬜ |
| 5.1.6 | DownloadHistory modeli | `DownloadHistory` | ⬜ |
| 5.1.7 | DownloadLimit modeli | `DownloadLimit` | ⬜ |

**Enum'lar:**
- `LicenseType`: LIFETIME, SUBSCRIPTION, PROJECT
- `LicenseStatus`: ACTIVE, GRACE_PERIOD, EXPIRED, SUSPENDED
- `DownloadStatus`: STARTED, COMPLETED, FAILED, CANCELLED

### 5.2 Backend Services (Claude)

| # | Görev | Service | Durum |
|---|-------|---------|-------|
| 5.2.1 | R2 upload service | `R2Service.upload` | ⬜ |
| 5.2.2 | Signed URL oluşturma | `R2Service.getSignedUrl` | ⬜ |
| 5.2.3 | License kontrolü | `LicenseService.check` | ⬜ |
| 5.2.4 | Grace period kontrolü | `LicenseService.checkGrace` | ⬜ |
| 5.2.5 | Rate limiting | `DownloadService.checkLimit` | ⬜ |
| 5.2.6 | Checksum hesaplama | `FileService.calculateHash` | ⬜ |

### 5.3 Backend API (Claude)

| # | Görev | Endpoint | Durum |
|---|-------|----------|-------|
| 5.3.1 | Ürün listesi | `download.listProducts` | ⬜ |
| 5.3.2 | Ürün detayı | `download.getProduct` | ⬜ |
| 5.3.3 | Versiyon listesi | `download.listVersions` | ⬜ |
| 5.3.4 | Token oluştur | `download.createToken` | ⬜ |
| 5.3.5 | Dosya indir | `GET /download/:token` | ⬜ |
| 5.3.6 | İndirme geçmişi | `download.history` | ⬜ |
| 5.3.7 | Admin: Ürün ekle | `admin.download.createProduct` | ⬜ |
| 5.3.8 | Admin: Versiyon ekle | `admin.download.createVersion` | ⬜ |

### 5.4 Frontend (Gemini)

| # | Görev | Component | Durum |
|---|-------|-----------|-------|
| 5.4.1 | Ürün listesi | `DownloadProductList.tsx` | ⬜ |
| 5.4.2 | Ürün kartı | `DownloadProductCard.tsx` | ⬜ |
| 5.4.3 | Ürün detay | `DownloadProductDetail.tsx` | ⬜ |
| 5.4.4 | Versiyon seçici | `VersionSelector.tsx` | ⬜ |
| 5.4.5 | Changelog accordion | `ChangelogAccordion.tsx` | ⬜ |
| 5.4.6 | Download button | `DownloadButton.tsx` | ⬜ |
| 5.4.7 | Checksum display | `ChecksumDisplay.tsx` | ⬜ |
| 5.4.8 | License badge | `LicenseBadge.tsx` | ⬜ |
| 5.4.9 | İndirme geçmişi | `DownloadHistory.tsx` | ⬜ |
| 5.4.10 | Rate limit uyarı | `RateLimitWarning.tsx` | ⬜ |
| 5.4.11 | Admin: Ürün formu | `DownloadProductForm.tsx` | ⬜ |
| 5.4.12 | Admin: Versiyon formu | `VersionUploadForm.tsx` | ⬜ |

**Sayfalar:**
- `/downloads` - İndirilebilir ürünler
- `/downloads/[slug]` - Ürün detay & indirme
- `/downloads/history` - İndirme geçmişi
- `/admin/downloads` - Yönetim paneli

---

## ÖNCELİK SIRASI

```
1. FAZ2-PIM      → Ürün altyapısı (diğerleri buna bağlı)
2. FAZ2-WALLET   → Mevcut yapıyı genişlet
3. FAZ2-BILLING  → Ödeme altyapısı
4. FAZ2-CART     → Sepet & Checkout
5. FAZ2-DELIVERY → Dijital ürün dağıtımı
```

---

## TOPLAM GÖREV SAYISI

| Kategori | Claude | Gemini | Toplam |
|----------|--------|--------|--------|
| Database Models | 33 | - | 33 |
| Backend Services | 18 | - | 18 |
| Backend API | 43 | - | 43 |
| Webhooks | 8 | - | 8 |
| Frontend Components | - | 52 | 52 |
| Frontend Pages | - | ~25 | ~25 |
| **TOPLAM** | **102** | **77** | **179** |

---

## ENV VARIABLES (Gerekli)

```env
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# PayTR
PAYTR_MERCHANT_ID=xxx
PAYTR_MERCHANT_KEY=xxx
PAYTR_MERCHANT_SALT=xxx
PAYTR_TEST_MODE=true

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=hyble-downloads
R2_PUBLIC_URL=https://downloads.hyble.co
```

---

## NOTLAR

1. **Cross-Module Relations**: User ve Organization modellerine yeni relation'lar eklenecek
2. **Migration**: Her schema değişikliğinde `pnpm db:generate && pnpm db:push`
3. **Server Deploy**: Schema güncellemelerinden sonra server'da da migration çalıştırılmalı
4. **i18n**: PIM modülünde TR/EN desteği var, dikkatli olunmalı
