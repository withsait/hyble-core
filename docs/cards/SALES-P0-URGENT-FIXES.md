# SALES-P0: Acil Düzeltmeler

## Özet
Homepage'deki güven sorunlarını ve CTA karmaşasını düzelt. Fake metrikleri kaldır, ana değer önerisini netleştir.

## Öncelik: P0 (ACİL)
## Tahmini Süre: 4-6 saat
## Etkilenen Alanlar: hyble-web

---

## Görevler

### 1. Fake Metrikleri Kaldır/Değiştir

**Dosya:** `apps/hyble-web/src/components/landing/HeroSection.tsx`

Mevcut fake metrikler:
- "12,847 Toplam Kullanıcı"
- "1,234 Aktif Oturum"  
- "2.4M API Çağrısı"

**Değişiklik:**
```tsx
// KALDIR: Fake dashboard preview kartını
// YERİNE: Trust badges ekle

<div className="flex items-center gap-6 justify-center mt-8">
  <div className="flex items-center gap-2 text-sm text-slate-500">
    <Shield className="w-4 h-4" />
    <span>256-bit SSL</span>
  </div>
  <div className="flex items-center gap-2 text-sm text-slate-500">
    <Building2 className="w-4 h-4" />
    <span>UK Registered Company</span>
  </div>
  <div className="flex items-center gap-2 text-sm text-slate-500">
    <Lock className="w-4 h-4" />
    <span>GDPR Uyumlu</span>
  </div>
</div>
```

### 2. Hero Headline'ı Netleştir

**Mevcut:** "İnşa Et. Başlat. Büyüt." (çok genel)

**Yeni:**
```tsx
<h1>
  <span className="block">Web Sitenizi</span>
  <span className="block text-amber-500">5 Dakikada Oluşturun</span>
</h1>
<p className="text-xl text-slate-600 max-w-2xl mx-auto">
  Şablon seçin, özelleştirin, yayınlayın. Hosting dahil, ekstra ücret yok.
</p>
```

### 3. CTA Butonlarını Sadeleştir

**Mevcut:** 2 buton + alt yazılar
**Yeni:** Tek ana CTA

```tsx
<div className="flex flex-col items-center gap-4">
  <Link
    href="https://id.hyble.co/register"
    className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-lg shadow-lg shadow-amber-500/25 transition-all"
  >
    Ücretsiz Başla
  </Link>
  <p className="text-sm text-slate-500">
    Kredi kartı gerekmez • 14 gün ücretsiz deneme
  </p>
</div>
```

### 4. Header Menüsünü Sadeleştir

**Dosya:** `apps/hyble-web/src/components/layout/Header.tsx` veya `Navbar.tsx`

**Mevcut:** Ürünler (mega menu), Çözümler (mega menu), Kaynaklar, Fiyatlandırma, Hakkımızda, İletişim

**Yeni (Max 5 item):**
```tsx
const navItems = [
  { label: "Ürünler", href: "/products" },
  { label: "Fiyatlandırma", href: "/pricing" },
  { label: "Şablonlar", href: "/store" },
  { label: "Destek", href: "/support" },
];

// Mega menu'leri kaldır, basit dropdown yap
```

### 5. Gaming Redirect Ekle

**Dosya:** `apps/hyble-web/next.config.js`

```javascript
async redirects() {
  return [
    {
      source: '/game/:path*',
      destination: 'https://gaming.hyble.co/:path*',
      permanent: true,
    },
  ];
},
```

**Not:** game.hyble.co için DNS ve nginx config ayrıca yapılacak.

---

## Kontrol Listesi

- [x] HeroSection'dan fake dashboard preview kaldırıldı
- [x] Trust badges eklendi (SSL, UK Company, GDPR)
- [x] Headline "Web Sitenizi 5 Dakikada Oluşturun" olarak güncellendi
- [x] Tek ana CTA butonu (Ücretsiz Başla)
- [x] Header menüsü 5 item'a indirildi
- [x] Mega menu'ler basit dropdown'a çevrildi
- [x] /game/* redirect eklendi

## Test

```bash
pnpm dev --filter hyble-web
# http://localhost:3001 kontrol et
```

## Notlar

- Mevcut komponentleri değiştirirken yedek al
- Tailwind class'larını mevcut design system'e uygun tut
- Mobile responsive kontrol et
