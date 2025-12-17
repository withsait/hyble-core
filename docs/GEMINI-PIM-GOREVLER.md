# GEMINI: FAZ2-PIM Frontend Görevleri

> **ÖNEMLİ**: Bu dosyada sadece SENİN görevlerin var. Backend (Claude) tamamlandı. Sen sadece frontend componentlerini ve sayfalarını oluşturacaksın.

---

## PROJE BİLGİSİ

- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **UI**: Shadcn/UI components (`@hyble/ui` paketinden import et)
- **API**: tRPC client (`@/lib/trpc/client` dan import et)
- **Dil**: Türkçe UI, kod yorumları İngilizce

---

## DOSYA YOLLARI

**MUTLAKA bu yolları kullan:**

```
apps/hyble-panel/src/components/pim/     ← Admin componentleri BURAYA
apps/hyble-panel/src/app/admin/products/ ← Admin sayfaları BURAYA
apps/hyble-web/src/components/products/  ← Public componentler BURAYA
apps/hyble-web/src/app/(landing)/products/ ← Public sayfalar BURAYA
```

---

## GÖREV 1: Admin Components Oluştur

Dosya yolu: `apps/hyble-panel/src/components/pim/`

### 1.1 İlk önce index.ts oluştur:
```typescript
// apps/hyble-panel/src/components/pim/index.ts
export * from "./ProductList"
export * from "./ProductForm"
export * from "./ProductCard"
export * from "./VariantEditor"
export * from "./CategoryTree"
export * from "./CategoryForm"
export * from "./MediaGallery"
export * from "./SEOMetaForm"
```

### 1.2 ProductList.tsx
- Ürünleri tablo halinde listele
- Kolonlar: Görsel, Ad (TR), Tip, Durum, Fiyat, Kategori
- Filtreleme: status, type dropdown
- Search input
- "Yeni Ürün" butonu
- Her satırda: Düzenle, Sil butonları

```typescript
// API kullanımı:
const { data, isLoading } = trpc.pim.listProducts.useQuery({
  status: filterStatus,
  type: filterType,
  search: searchTerm,
  limit: 20
})
```

### 1.3 ProductForm.tsx
- Ürün oluşturma/düzenleme formu
- Tabs: Genel, Varyantlar, Medya, SEO
- Genel tab: nameTr, nameEn, slug, type, category, descriptions
- react-hook-form + zod validation

```typescript
// Oluşturma:
const createMutation = trpc.pim.createProduct.useMutation()
// Güncelleme:
const updateMutation = trpc.pim.updateProduct.useMutation()
```

### 1.4 ProductCard.tsx
- Grid görünümü için kart
- Thumbnail, ad, fiyat, durum badge
- Tıklanınca edit sayfasına git

### 1.5 VariantEditor.tsx
- Ürüne varyant ekleme listesi
- Her varyant için: SKU, Ad, Fiyat, Özellikler (JSON)
- Ekle/Sil butonları

```typescript
const createVariant = trpc.pim.createVariant.useMutation()
const deleteVariant = trpc.pim.deleteVariant.useMutation()
```

### 1.6 CategoryTree.tsx
- Kategorileri hiyerarşik listele
- Her kategoride: Ad, Ürün sayısı, Düzenle/Sil

```typescript
const { data } = trpc.pim.listCategories.useQuery()
```

### 1.7 CategoryForm.tsx
- Kategori oluşturma/düzenleme modal
- Alanlar: nameTr, nameEn, slug, parentId, icon

### 1.8 MediaGallery.tsx
- Ürün görsellerini grid halinde göster
- Primary seçimi (yıldız ikonu)
- Silme butonu
- URL ile ekleme (şimdilik)

### 1.9 SEOMetaForm.tsx
- Meta title TR/EN (max 70 karakter)
- Meta description TR/EN (max 160 karakter)
- Karakter sayacı göster

---

## GÖREV 2: Admin Sayfaları Oluştur

Dosya yolu: `apps/hyble-panel/src/app/admin/products/`

### 2.1 page.tsx (Liste)
```
URL: /admin/products
```
- ProductList componentini kullan
- Başlık: "Ürün Yönetimi"

### 2.2 new/page.tsx (Yeni Ürün)
```
URL: /admin/products/new
```
- ProductForm componentini kullan (mode="create")
- Başarılı kayıtta /admin/products/[id] e yönlendir

### 2.3 [id]/page.tsx (Düzenleme)
```
URL: /admin/products/[id]
```
- ProductForm componentini kullan (mode="edit")
- Ürün verisini çek ve forma doldur

```typescript
const { data: product } = trpc.pim.getProductById.useQuery({ id: params.id })
```

### 2.4 categories/page.tsx (Kategoriler)
```
URL: /admin/products/categories
```
- CategoryTree + CategoryForm componentlerini kullan

---

## GÖREV 3: Public Components Oluştur

Dosya yolu: `apps/hyble-web/src/components/products/`

### 3.1 index.ts
```typescript
export * from "./ProductGrid"
export * from "./ProductCard"
export * from "./ProductDetail"
```

### 3.2 ProductGrid.tsx
- Responsive grid (mobile: 1, tablet: 2, desktop: 3-4 kolon)
- ProductCard componentini kullan

### 3.3 ProductCard.tsx (Public versiyon)
- Thumbnail
- Ürün adı
- Fiyat ("€XX'dan başlayan" formatı)
- Hover efekti
- Link to /products/[slug]

### 3.4 ProductDetail.tsx
- Sol: Görsel gallery
- Sağ: Ad, açıklama, fiyat, varyant seçici
- "Sepete Ekle" butonu (disabled, placeholder)

---

## GÖREV 4: Public Sayfaları Oluştur

Dosya yolu: `apps/hyble-web/src/app/(landing)/products/`

### 4.1 page.tsx (Liste)
```
URL: /products
```
- ProductGrid componentini kullan
- Sadece ACTIVE ürünleri göster

```typescript
const { data } = trpc.pim.listProducts.useQuery({ status: "ACTIVE" })
```

### 4.2 [slug]/page.tsx (Detay)
```
URL: /products/[slug]
```
- ProductDetail componentini kullan

```typescript
const { data } = trpc.pim.getProductBySlug.useQuery({ slug: params.slug })
```

---

## IMPORT ÖRNEKLERİ

```typescript
// tRPC client
import { trpc } from "@/lib/trpc/client"

// Shadcn UI (bu importlar çalışmalı)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Icons
import { Plus, Pencil, Trash2, Search, Star, Image } from "lucide-react"

// Next.js
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
```

---

## BADGE RENKLERİ

```typescript
// Ürün Tipi
const typeColors = {
  DIGITAL: "bg-purple-100 text-purple-800",
  SUBSCRIPTION: "bg-blue-100 text-blue-800",
  BUNDLE: "bg-green-100 text-green-800",
  SERVICE: "bg-orange-100 text-orange-800",
}

// Durum
const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  ARCHIVED: "bg-yellow-100 text-yellow-800",
}
```

---

## ÖNCELİK SIRASI

1. `apps/hyble-panel/src/components/pim/index.ts`
2. `apps/hyble-panel/src/components/pim/ProductList.tsx`
3. `apps/hyble-panel/src/components/pim/ProductCard.tsx`
4. `apps/hyble-panel/src/components/pim/CategoryTree.tsx`
5. `apps/hyble-panel/src/components/pim/CategoryForm.tsx`
6. `apps/hyble-panel/src/app/admin/products/page.tsx`
7. `apps/hyble-panel/src/app/admin/products/categories/page.tsx`
8. `apps/hyble-panel/src/components/pim/ProductForm.tsx`
9. `apps/hyble-panel/src/app/admin/products/new/page.tsx`
10. `apps/hyble-panel/src/app/admin/products/[id]/page.tsx`
11. Geri kalan componentler...

---

## BAŞLA!

İlk dosya: `apps/hyble-panel/src/components/pim/index.ts` oluştur.
