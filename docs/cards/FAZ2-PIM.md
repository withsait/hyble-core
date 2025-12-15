# 📦 FAZ2-PIM: Product Information Management (MVP)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 💰 FAZ 2: MONEY |
| Öncelik | 🔴 P0 (Blocker) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ2-PIM.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ1-IAM (User rolleri - Admin yetkisi için)

### Dependents (Bu modülü bekleyenler):
- **FAZ2-CART:** Sepete ürün eklemek için PIM verisi gerekir.
- **FAZ2-BILLING:** Fatura kalemleri ürün ID'sine referans verir.
- **FAZ2-DELIVERY:** İndirilebilir ürünler buradaki ürün ID'si ile eşleşir.

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/pim/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/pim/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-web/src/components/products/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-admin/src/app/products/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-web/src/app/products/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 7 Model | ⬜ 0/7 |
| Product Service | 🟣 Claude | 6 Fonksiyon | ⬜ 0/6 |
| Variant Service | 🟣 Claude | 5 Fonksiyon | ⬜ 0/5 |
| Category Service | 🟣 Claude | 5 Fonksiyon | ⬜ 0/5 |
| Media Service | 🟣 Claude | R2 Upload | ⬜ 0/3 |
| Frontend Components | 🔵 Gemini | 16 Bileşen | ⬜ 0/16 |
| Admin Pages | 🔵 Gemini | 5 Sayfa | ⬜ 0/5 |
| Public Pages | 🔵 Gemini | 3 Sayfa | ⬜ 0/3 |

## 1. GENEL BAKIŞ
PIM (Product Information Management), Hyble'ın sunduğu tüm ürün ve hizmetlerin "tek gerçek kaynağıdır" (Single Source of Truth). Dijital ürünler (tema, SDK), abonelikler (hosting, SaaS), hizmetler (danışmanlık) ve paket ürünlerin (bundle) tüm detayları burada yönetilir. Çok dilli yapı (TR/EN) ve varyant sistemi (Basic/Pro/Enterprise) temel yapı taşlarıdır.

## 2. KAPSAM (MVP)

### ✅ Dahil Olanlar
- **Ürün Türleri:** DIGITAL, SUBSCRIPTION, BUNDLE, SERVICE.
- **Varyant Yönetimi:** Farklı planlar veya seçenekler için SKU, fiyat ve özellik matrisi.
- **Kategori:** Hiyerarşik (Parent/Child) yapı.
- **Medya:** Görsel, video, thumbnail yönetimi (R2).
- **SEO:** Title, description, OG tags ve Schema.org verisi.
- **İlişkiler:** Cross-sell (bunu da al), Up-sell (bir üst pakete geç).
- **i18n:** Ürün adı ve açıklamalarında TR/EN desteği.

### ❌ Dahil Olmayanlar (Sonraki Fazlar)
- Quote/Teklif Yönetimi → FAZ 4+
- SLA ve Sözleşme → FAZ 4+
- Müşteri Grubu Fiyatları (B2B Price List) → FAZ 4+
- Kampanya Yönetimi → FAZ 4+
- CSV Import/Export → FAZ 3

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// ENUMS
enum ProductType { DIGITAL, SUBSCRIPTION, BUNDLE, SERVICE }
enum ProductStatus { DRAFT, ACTIVE, ARCHIVED }
enum StockType { UNLIMITED, LIMITED, CAPACITY }

// CATEGORY
model Category {
  id              String      @id @default(cuid())
  parentId        String?
  parent          Category?   @relation("CategoryTree", fields: [parentId], references: [id])
  children        Category[]  @relation("CategoryTree")
  
  nameTr          String
  nameEn          String
  slug            String      @unique
  icon            String?
  description     String?
  
  sortOrder       Int         @default(0)
  
  products        Product[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// PRODUCT
model Product {
  id              String        @id @default(cuid())
  type            ProductType
  status          ProductStatus @default(DRAFT)
  
  categoryId      String?
  category        Category?     @relation(fields: [categoryId], references: [id])
  
  // Temel Bilgiler (i18n)
  nameTr          String
  nameEn          String
  slug            String        @unique
  descriptionTr   String?       @db.Text
  descriptionEn   String?       @db.Text
  shortDescTr     String?
  shortDescEn     String?
  
  // Hedef Kitle
  targetAudience  String[]      // ["startup", "smb", "enterprise"]
  tags            String[]
  
  // Fiyatlandırma (Varyant yoksa baz fiyat)
  basePrice       Decimal?      @db.Decimal(10, 2)
  currency        String        @default("EUR")
  taxRate         Decimal       @db.Decimal(5, 2) @default(20)
  
  // Relations
  variants        ProductVariant[]
  media           ProductMedia[]
  meta            ProductMeta?
  relations       ProductRelation[] @relation("SourceProduct")
  relatedTo       ProductRelation[] @relation("RelatedProduct")
  
  // Bundle için
  bundleItems     BundleItem[]  @relation("BundleProduct")
  includedIn      BundleItem[]  @relation("IncludedProduct")
  
  // Billing entegrasyonu (FAZ2-BILLING)
  // invoiceItems InvoiceItem[]
  
  createdBy       String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([categoryId])
  @@index([status])
  @@index([type])
}

// VARIANT
model ProductVariant {
  id              String      @id @default(cuid())
  productId       String
  product         Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  sku             String      @unique
  name            String      // "Starter", "Business", "Enterprise"
  
  price           Decimal     @db.Decimal(10, 2)
  currency        String      @default("EUR")
  
  // Özellik matrisi (JSON)
  features        Json?       // { "ram": "4GB", "disk": "50GB" }
  
  // Stok
  stockType       StockType   @default(UNLIMITED)
  stockQty        Int?        // LIMITED için
  
  // Abonelik için
  billingPeriod   String?     // monthly, quarterly, annually
  
  sortOrder       Int         @default(0)
  isDefault       Boolean     @default(false)
  isActive        Boolean     @default(true)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([productId])
}

// MEDIA
model ProductMedia {
  id              String      @id @default(cuid())
  productId       String
  product         Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  type            String      // image, video, thumbnail, banner
  url             String
  alt             String?
  
  sortOrder       Int         @default(0)
  
  createdAt       DateTime    @default(now())
}

// SEO META
model ProductMeta {
  id              String      @id @default(cuid())
  productId       String      @unique
  product         Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  metaTitleTr     String?
  metaTitleEn     String?
  metaDescTr      String?
  metaDescEn      String?
  
  ogImage         String?
  schemaJson      Json?       // Schema.org Product
  canonicalUrl    String?
}

// RELATED PRODUCTS
model ProductRelation {
  id              String      @id @default(cuid())
  
  productId       String
  product         Product     @relation("SourceProduct", fields: [productId], references: [id], onDelete: Cascade)
  
  relatedId       String
  relatedProduct  Product     @relation("RelatedProduct", fields: [relatedId], references: [id], onDelete: Cascade)
  
  type            String      // upsell, crosssell
  
  @@unique([productId, relatedId, type])
}

// BUNDLE ITEMS
model BundleItem {
  id                String    @id @default(cuid())
  
  bundleProductId   String
  bundleProduct     Product   @relation("BundleProduct", fields: [bundleProductId], references: [id], onDelete: Cascade)
  
  includedProductId String
  includedProduct   Product   @relation("IncludedProduct", fields: [includedProductId], references: [id])
  
  quantity          Int       @default(1)
  individualValue   Decimal   @db.Decimal(10, 2) // Bireysel değer (tasarruf hesabı için)
  
  @@unique([bundleProductId, includedProductId])
}

4. İŞ MANTIĞI (BUSINESS LOGIC)
A. Varyant Özellik Matrisi
Her ürün varyantı, teknik özelliklerini bir JSON yapısında tutar. Bu yapı, frontend'de karşılaştırma tabloları oluşturmak için kullanılır.

Örnek:

JSON

{
  "disk": "50 GB",
  "bandwidth": "500 GB",
  "ssl": true,
  "support": "standard"
}
B. Bundle (Paket) Mantığı
Bundle ürünler, diğer ürünleri (Included Products) içerir.

Fiyatlandırma: Bundle'ın kendi basePrice'ı vardır.

Tasarruf: İçindeki ürünlerin individualValue toplamı ile Bundle fiyatı arasındaki fark hesaplanır ve müşteriye "X€ Tasarruf" olarak gösterilir.

Stok: Bundle satıldığında, içindeki fiziksel/limitli stok ürünlerin stoğu da düşer (MVP'de stok takibi basit tutulmuştur).

C. Çok Dilli (i18n) Yapı
Ürün adları, açıklamaları ve SEO meta verileri veritabanında Tr ve En suffix'leri ile ayrı sütunlarda tutulur. Frontend, kullanıcının seçtiği dile göre ilgili sütunu gösterir.

5. API ENDPOINTS
GET /api/products: Ürünleri listeler (filtreleme destekli).

GET /api/products/[slug]: Tekil ürün detayı (SEO dostu).

POST /api/admin/products: Yeni ürün oluşturma.

POST /api/admin/variants: Ürüne varyant ekleme.

POST /api/admin/bundle/calculate: Bundle toplam değeri ve tasarrufu hesaplama.

GET /api/categories: Kategori ağacı.

6. FRONTEND BİLEŞENLERİ (UI)
ProductForm: Ürün oluşturma/düzenleme formu. Çok dilli alanlar (TR/EN tabları).

FeatureMatrixEditor: Varyant özelliklerini key-value şeklinde girmeyi sağlayan JSON editörü.

BundleBuilder: Paket oluştururken mevcut ürünleri arayıp seçmeyi sağlayan bileşen.

ComparisonTable: Varyantların özelliklerini yan yana karşılaştıran tablo.

✅ KABUL KRİTERLERİ (DoD)
[ ] 4 farklı ürün tipi (Digital, Subscription, Bundle, Service) oluşturulabiliyor.

[ ] Varyantlar eklenebiliyor ve özellik matrisi (JSON) kaydediliyor.

[ ] Kategori ağacı (Parent/Child) oluşturulabiliyor.

[ ] Görseller R2'ye yüklenip ürünle ilişkilendirilebiliyor.

[ ] TR ve EN içerikler ayrı ayrı girilip görüntülenebiliyor.

[ ] Bundle ürünler, içindeki ürünlerin toplam değerini ve tasarrufu hesaplayabiliyor.

[ ] SEO meta verileri kaydediliyor.

[ ] Ürün durumu (Draft/Active) değiştirilebiliyor.