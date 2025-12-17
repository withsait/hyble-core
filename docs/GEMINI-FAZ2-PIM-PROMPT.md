# GEMINI GÖREV: FAZ2-PIM Frontend Geliştirme

## PROJE BİLGİLERİ

Bu bir Next.js 14 (App Router) + TypeScript + Tailwind CSS projesidir.
- **Monorepo**: Turborepo + pnpm
- **UI Framework**: Shadcn/UI (packages/ui altında)
- **API**: tRPC (Backend hazır, endpoint'ler aşağıda)
- **i18n**: TR/EN desteği (şimdilik hardcoded, ileride i18n eklenecek)

---

## DOSYA YOLLARI (ÖNEMLİ!)

Tüm dosyalar bu yapıda oluşturulmalı:

```
C:\Users\ahmet\Desktop\hyble-core\
├── apps\
│   ├── hyble-panel\src\           # Admin Panel (dev.hyble.net)
│   │   ├── app\
│   │   │   └── admin\
│   │   │       └── products\      # OLUŞTURULACAK
│   │   │           ├── page.tsx           # Ürün listesi
│   │   │           ├── new\page.tsx       # Yeni ürün
│   │   │           ├── [id]\page.tsx      # Ürün düzenleme
│   │   │           └── categories\page.tsx # Kategori yönetimi
│   │   └── components\
│   │       └── pim\               # OLUŞTURULACAK
│   │           ├── ProductForm.tsx
│   │           ├── ProductList.tsx
│   │           ├── ProductCard.tsx
│   │           ├── VariantEditor.tsx
│   │           ├── FeatureMatrixEditor.tsx
│   │           ├── CategoryTree.tsx
│   │           ├── CategoryForm.tsx
│   │           ├── MediaUploader.tsx
│   │           ├── MediaGallery.tsx
│   │           ├── BundleBuilder.tsx
│   │           ├── RelationManager.tsx
│   │           ├── SEOMetaForm.tsx
│   │           └── index.ts
│   │
│   └── hyble-web\src\             # Public Website (hyble.co)
│       ├── app\
│       │   └── (landing)\
│       │       └── products\      # OLUŞTURULACAK
│       │           ├── page.tsx           # Public ürün listesi
│       │           └── [slug]\page.tsx    # Ürün detay
│       └── components\
│           └── products\          # OLUŞTURULACAK
│               ├── ProductGrid.tsx
│               ├── ProductCard.tsx
│               ├── ProductDetail.tsx
│               ├── VariantSelector.tsx
│               ├── ComparisonTable.tsx
│               ├── RelatedProducts.tsx
│               └── index.ts
│
└── packages\
    └── ui\src\components\         # Shared UI (mevcut Shadcn components)
```

---

## BACKEND API (tRPC) - HAZIR ENDPOINT'LER

Backend tamamen hazır. Şu endpoint'leri kullanabilirsin:

### Kategori
```typescript
// Kategori listesi
trpc.pim.listCategories.useQuery({ includeInactive?: boolean, parentId?: string })

// Kategori detayı
trpc.pim.getCategoryBySlug.useQuery({ slug: string })

// Kategori oluştur (admin)
trpc.pim.createCategory.useMutation()
// Input: { nameTr, nameEn, slug, parentId?, icon?, description?, sortOrder? }

// Kategori güncelle (admin)
trpc.pim.updateCategory.useMutation()
// Input: { id, nameTr?, nameEn?, slug?, isActive?, ... }

// Kategori sil (admin)
trpc.pim.deleteCategory.useMutation()
// Input: { id }
```

### Ürün
```typescript
// Ürün listesi
trpc.pim.listProducts.useQuery({
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED",
  type?: "DIGITAL" | "SUBSCRIPTION" | "BUNDLE" | "SERVICE",
  categoryId?: string,
  search?: string,
  isFeatured?: boolean,
  limit?: number,
  cursor?: string
})
// Returns: { products: [...], nextCursor?: string }

// Ürün detayı (public - slug ile)
trpc.pim.getProductBySlug.useQuery({ slug: string })

// Ürün detayı (admin - id ile)
trpc.pim.getProductById.useQuery({ id: string })

// Ürün oluştur (admin)
trpc.pim.createProduct.useMutation()
// Input: {
//   type: "DIGITAL" | "SUBSCRIPTION" | "BUNDLE" | "SERVICE",
//   nameTr, nameEn, slug, categoryId?, descriptionTr?, descriptionEn?,
//   shortDescTr?, shortDescEn?, targetAudience?: string[],
//   tags?: string[], basePrice?, currency?, taxRate?, isFeatured?
// }

// Ürün güncelle (admin)
trpc.pim.updateProduct.useMutation()
// Input: { id, ...fields, status?: "DRAFT" | "ACTIVE" | "ARCHIVED" }

// Ürün sil (admin)
trpc.pim.deleteProduct.useMutation()
// Input: { id }
```

### Varyant
```typescript
// Varyant oluştur
trpc.pim.createVariant.useMutation()
// Input: {
//   productId, sku, name, price, currency?, features?: Record<string, any>,
//   stockType?: "UNLIMITED" | "LIMITED" | "CAPACITY", stockQty?,
//   billingPeriod?, sortOrder?, isDefault?
// }

// Varyant güncelle
trpc.pim.updateVariant.useMutation()
// Input: { id, ...fields, isActive? }

// Varyant sil
trpc.pim.deleteVariant.useMutation()
// Input: { id }
```

### Medya
```typescript
// Medya ekle
trpc.pim.addMedia.useMutation()
// Input: { productId, type, url, alt?, title?, width?, height?, fileSize?, sortOrder?, isPrimary? }

// Medya sırası güncelle
trpc.pim.updateMediaOrder.useMutation()
// Input: { productId, mediaIds: string[] }

// Medya sil
trpc.pim.deleteMedia.useMutation()
// Input: { id }

// Primary medya ayarla
trpc.pim.setPrimaryMedia.useMutation()
// Input: { id, productId }
```

### SEO Meta
```typescript
// Meta güncelle (upsert)
trpc.pim.updateMeta.useMutation()
// Input: {
//   productId, metaTitleTr?, metaTitleEn?, metaDescTr?, metaDescEn?,
//   ogImage?, canonicalUrl?, keywordsTr?: string[], keywordsEn?: string[]
// }
```

### İlişkiler
```typescript
// İlişki ekle
trpc.pim.addRelation.useMutation()
// Input: { productId, relatedId, type: "upsell" | "crosssell" | "accessory" | "similar", sortOrder? }

// İlişki sil
trpc.pim.removeRelation.useMutation()
// Input: { id }
```

### Bundle
```typescript
// Bundle item ekle
trpc.pim.addBundleItem.useMutation()
// Input: { bundleProductId, includedProductId, quantity?, individualValue, sortOrder? }

// Bundle item sil
trpc.pim.removeBundleItem.useMutation()
// Input: { id }

// Tasarruf hesapla
trpc.pim.calculateBundleSavings.useQuery({ bundleProductId: string })
// Returns: { totalIndividualValue, bundlePrice, savings, savingsPercentage, itemCount }
```

---

## GÖREVLER

### 1. Admin Panel Components (apps/hyble-panel/src/components/pim/)

#### 1.1 ProductList.tsx
- Tablo görünümü (DataTable)
- Kolonlar: Görsel, Ad, Tip, Durum, Fiyat, Kategori, Tarih
- Filtreleme: status, type, category, search
- Pagination (cursor-based)
- Bulk actions: Durum değiştir, Sil
- Row actions: Düzenle, Kopyala, Sil

#### 1.2 ProductForm.tsx
- Multi-step form VEYA tab-based form
- Tab 1: Temel Bilgiler (nameTr, nameEn, slug, type, category, descriptions)
- Tab 2: Fiyatlandırma (basePrice, currency, taxRate, variants)
- Tab 3: Medya (resim/video yükleme)
- Tab 4: SEO (meta başlıklar, açıklamalar, OG image)
- Tab 5: İlişkiler (upsell, crosssell ürünleri)
- Auto-slug generation (nameden)
- Form validation (zod + react-hook-form)

#### 1.3 ProductCard.tsx
- Grid görünümü için kart
- Thumbnail, ad, fiyat, durum badge
- Quick actions (edit, delete, duplicate)

#### 1.4 VariantEditor.tsx
- Ürüne varyant ekleme/düzenleme
- Her varyant için: SKU, ad, fiyat, özellikler, stok
- Sürükle-bırak sıralama
- Default varyant seçimi

#### 1.5 FeatureMatrixEditor.tsx
- Varyant özellikleri için key-value editör
- Dinamik field ekleme/silme
- Önceden tanımlı key önerileri (ram, disk, bandwidth, ssl, support)
- Boolean, string, number tip desteği

#### 1.6 CategoryTree.tsx
- Hiyerarşik kategori görünümü
- Drag & drop ile sıralama
- Inline edit
- Expand/collapse

#### 1.7 CategoryForm.tsx
- Kategori oluşturma/düzenleme modal
- Parent seçimi (dropdown tree)
- Icon seçici (Lucide icons)
- TR/EN isim alanları

#### 1.8 MediaUploader.tsx
- Drag & drop dosya yükleme
- Önizleme
- Progress bar
- (Şimdilik URL input, R2 upload sonra eklenecek)

#### 1.9 MediaGallery.tsx
- Grid görünümü
- Sürükle-bırak sıralama
- Primary image seçimi (yıldız ikonu)
- Silme işlemi

#### 1.10 BundleBuilder.tsx
- Paket için ürün seçici
- Seçilen ürünler listesi
- Individual value girişi
- Tasarruf hesaplama ve gösterimi

#### 1.11 RelationManager.tsx
- İlişki tipi seçimi (upsell, crosssell, similar)
- Ürün arama ve seçme
- Seçilen ilişkiler listesi

#### 1.12 SEOMetaForm.tsx
- Meta title (TR/EN) - karakter sayacı (max 70)
- Meta description (TR/EN) - karakter sayacı (max 160)
- Keywords input (tag input)
- OG Image URL
- Canonical URL
- Google önizleme simülasyonu

---

### 2. Admin Panel Pages (apps/hyble-panel/src/app/admin/products/)

#### 2.1 page.tsx (Ürün Listesi)
```
/admin/products
```
- ProductList component
- "Yeni Ürün" butonu
- Kategori filtreleme sidebar

#### 2.2 new/page.tsx (Yeni Ürün)
```
/admin/products/new
```
- ProductForm (create mode)
- Başarılı kayıt sonrası /admin/products/[id] e yönlendir

#### 2.3 [id]/page.tsx (Ürün Düzenleme)
```
/admin/products/[id]
```
- ProductForm (edit mode)
- Silme butonu (confirm modal)
- Durum değiştirme (Draft/Active/Archived)

#### 2.4 categories/page.tsx (Kategori Yönetimi)
```
/admin/products/categories
```
- CategoryTree
- CategoryForm (modal)
- CRUD işlemleri

---

### 3. Public Pages (apps/hyble-web/src/app/(landing)/products/)

#### 3.1 page.tsx (Ürün Listesi)
```
/products
```
- ProductGrid component
- Kategori filtresi (sidebar veya dropdown)
- Tip filtresi (Digital, Subscription, Bundle, Service)
- Search
- Sadece ACTIVE ürünler

#### 3.2 [slug]/page.tsx (Ürün Detay)
```
/products/[slug]
```
- ProductDetail component
- Ürün görselleri (gallery)
- Varyant seçimi
- Fiyat gösterimi
- Açıklama (descriptionTr/En)
- Özellik tablosu (variants features)
- İlişkili ürünler

---

### 4. Public Components (apps/hyble-web/src/components/products/)

#### 4.1 ProductGrid.tsx
- Responsive grid (1-2-3-4 kolonlu)
- ProductCard kullanır
- Load more / infinite scroll

#### 4.2 ProductCard.tsx
- Thumbnail
- Ürün adı
- Fiyat (varyant varsa "X€'dan başlayan")
- Kategori badge
- Tip badge (renk kodlu)
- Hover efekti

#### 4.3 ProductDetail.tsx
- Layout: Sol taraf gallery, sağ taraf bilgiler
- Gallery: Ana görsel + thumbnail strip
- Varyant seçici
- "Sepete Ekle" butonu (şimdilik disabled, FAZ2-CART'ta aktif olacak)
- Tab: Açıklama, Özellikler, İncelemeler (placeholder)

#### 4.4 VariantSelector.tsx
- Radio button veya card seçici
- Seçili varyantın özellikleri göster
- Fiyat güncelleme

#### 4.5 ComparisonTable.tsx
- Varyantları yan yana karşılaştır
- Özellik satırları
- Fiyat satırı
- "Seç" butonu

#### 4.6 RelatedProducts.tsx
- Yatay kaydırmalı carousel
- ProductCard kullanır
- "Bunu da beğenebilirsiniz" başlığı

---

## TASARIM REHBERİ

### Renkler (Hyble Brand)
- Primary: Blue (#3B82F6)
- Secondary: Slate (#64748B)
- Success: Green (#22C55E)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)

### Badge Renkleri (Product Type)
- DIGITAL: Purple (#8B5CF6)
- SUBSCRIPTION: Blue (#3B82F6)
- BUNDLE: Green (#22C55E)
- SERVICE: Orange (#F97316)

### Badge Renkleri (Status)
- DRAFT: Gray
- ACTIVE: Green
- ARCHIVED: Yellow

### Spacing
- Tailwind varsayılanları kullan
- Card padding: p-4 veya p-6
- Section gap: space-y-6

### Responsive
- Mobile first yaklaşım
- Breakpoints: sm (640), md (768), lg (1024), xl (1280)

---

## SHADCN COMPONENTS (Mevcut)

Bu componentler `packages/ui` altında mevcut, import edebilirsin:

```typescript
import { Button } from "@hyble/ui/components/button"
import { Input } from "@hyble/ui/components/input"
import { Label } from "@hyble/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle } from "@hyble/ui/components/card"
import { Badge } from "@hyble/ui/components/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@hyble/ui/components/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@hyble/ui/components/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@hyble/ui/components/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@hyble/ui/components/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@hyble/ui/components/table"
import { Textarea } from "@hyble/ui/components/textarea"
import { Switch } from "@hyble/ui/components/switch"
import { Checkbox } from "@hyble/ui/components/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@hyble/ui/components/avatar"
import { Skeleton } from "@hyble/ui/components/skeleton"
import { Toast } from "@hyble/ui/components/toast"
```

---

## tRPC CLIENT KULLANIMI

```typescript
// apps/hyble-panel veya hyble-web içinde
import { trpc } from "@/lib/trpc/client"

// Query örneği
const { data, isLoading, error } = trpc.pim.listProducts.useQuery({
  status: "ACTIVE",
  limit: 20
})

// Mutation örneği
const createProduct = trpc.pim.createProduct.useMutation({
  onSuccess: (data) => {
    toast({ title: "Ürün oluşturuldu" })
    router.push(`/admin/products/${data.id}`)
  },
  onError: (error) => {
    toast({ title: "Hata", description: error.message, variant: "destructive" })
  }
})

// Kullanım
createProduct.mutate({
  type: "DIGITAL",
  nameTr: "Yeni Ürün",
  nameEn: "New Product",
  slug: "yeni-urun"
})
```

---

## ÖNCELİK SIRASI

1. **Admin Components** (önce bunları yap)
   - ProductList.tsx
   - ProductForm.tsx (temel)
   - CategoryTree.tsx
   - CategoryForm.tsx

2. **Admin Pages**
   - /admin/products/page.tsx
   - /admin/products/new/page.tsx
   - /admin/products/[id]/page.tsx
   - /admin/products/categories/page.tsx

3. **Admin Detay Components**
   - VariantEditor.tsx
   - MediaGallery.tsx
   - SEOMetaForm.tsx
   - BundleBuilder.tsx

4. **Public Pages** (en son)
   - /products/page.tsx
   - /products/[slug]/page.tsx
   - ProductGrid.tsx
   - ProductCard.tsx
   - ProductDetail.tsx

---

## NOTLAR

1. **Slug Oluşturma**: Türkçe karakterleri dönüştür (ş→s, ğ→g, ü→u, ö→o, ç→c, ı→i)
2. **Form Validation**: Zod şemaları backend ile uyumlu olmalı
3. **Loading States**: Her query için skeleton göster
4. **Error Handling**: Toast notification ile hata göster
5. **Responsive**: Mobile'da da çalışmalı
6. **Dark Mode**: Tailwind dark: prefix'lerini kullan

---

## BAŞLANGIÇ

İlk olarak şu dosyayı oluştur:
```
apps/hyble-panel/src/components/pim/index.ts
```

İçeriği:
```typescript
export * from "./ProductList"
export * from "./ProductForm"
export * from "./ProductCard"
export * from "./VariantEditor"
export * from "./CategoryTree"
export * from "./CategoryForm"
export * from "./MediaGallery"
export * from "./SEOMetaForm"
```

Sonra sırayla componentleri oluşturmaya başla.
