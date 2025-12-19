# SALES-ROADMAP: Satış & Müşteri Odaklı Geliştirme Master Plan (v2)

## 🎯 Hedef
Hyble'ı "web sitesi yapım aracı"ndan "dijital altyapı platformu"na dönüştür. Tüm vertikalleri (Web, Cloud, API, Gaming, Kurumsal) net şekilde konumlandır.

## 📊 Metrikler (Takip Edilecek)
- Homepage → Register conversion rate
- Template purchase → Deploy conversion rate
- Free trial → Paid conversion rate
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Net Promoter Score (NPS)
- Monthly Recurring Revenue (MRR)
- Churn rate

---

## 🗓️ Güncel Roadmap

| Faz | Card | Süre | Öncelik | Durum |
|-----|------|------|---------|-------|
| **P0** | SALES-P0-URGENT-FIXES | 4-6 saat | ✅ Tamamlandı | Done |
| **P1** | SALES-P1-HOMEPAGE-SIMPLIFICATION | 12-16 saat | ✅ Tamamlandı | Done |
| **P5** | SALES-P5-PLATFORM-REBRAND-STORE | 32-40 saat | 🔴 **SONRAKİ** | Pending |
| **P2** | SALES-P2-CONVERSION-FUNNEL | 16-20 saat | 🟡 Beklemede | Pending |
| **P3** | SALES-P3-GAMING-VERTICAL | 20-24 saat | 🟡 Beklemede | Pending |
| **P4** | SALES-P4-RETENTION-GROWTH | 24-32 saat | 🟢 Backlog | Pending |

**Not:** P5 öncelikli hale geldi çünkü ana değer önerisi ve template store kritik.

---

## 📁 Card Dosyaları

```
docs/cards/
├── SALES-ROADMAP.md                        # Bu dosya (master plan)
├── SALES-P0-URGENT-FIXES.md                # ✅ Tamamlandı
├── SALES-P1-HOMEPAGE-SIMPLIFICATION.md     # ✅ Tamamlandı
├── SALES-P5-PLATFORM-REBRAND-STORE-PART1.md # 🔴 Sonraki - Homepage + Store
├── SALES-P5-PLATFORM-REBRAND-STORE-PART2.md # 🔴 Sonraki - Wizard + API
├── SALES-P2-CONVERSION-FUNNEL.md           # Beklemede
├── SALES-P3-GAMING-VERTICAL.md             # Beklemede
└── SALES-P4-RETENTION-GROWTH.md            # Backlog
```

---

## 🔥 SONRAKİ: SALES-P5 Platform Rebrand & Template Store

### Bu Card Ne Yapıyor?

1. **Homepage Rebrand**
   - "Web Sitenizi 5 Dakikada Oluşturun" → "Dijital Altyapınız İçin Tek Platform"
   - 5 segmentli AudienceSelector (Web, Cloud, API, Gaming, Kurumsal)
   - Tüm `game.hyble.co` → `gaming.hyble.co`

2. **Template Store**
   - `/store` - Ana mağaza sayfası
   - `/store/[slug]` - Şablon detay sayfası
   - Filtreleme, arama, kategori
   - Satın alma flow'u

3. **Deployment Wizard**
   - 5 adımlı kurulum wizard'ı
   - Payment (Wallet/Card)
   - Branding (Logo, renkler, font)
   - Content (Site adı, açıklama)
   - Domain (Subdomain/Custom)
   - Deploy (One-click kurulum)

4. **Cloud Entegrasyonu**
   - Şablon satın al → Tek tıkla deploy
   - Hyble Cloud üzerinde hosting
   - SSL otomatik
   - Subdomain veya custom domain

### Başlatma Promptu

```
docs/cards/SALES-P5-PLATFORM-REBRAND-STORE-PART1.md ve 
docs/cards/SALES-P5-PLATFORM-REBRAND-STORE-PART2.md dosyalarını oku.

Sırayla:
1. Prisma schema güncellemelerini yap
2. Homepage HeroSection ve AudienceSelector'ı güncelle
3. Store sayfalarını oluştur
4. Deploy wizard'ı oluştur
5. Template router'ı oluştur

Her adımda commit at.
```

---

## 🏗️ Mimari Özet

```
┌─────────────────────────────────────────────────────────────────┐
│                         hyble.co                                │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐ │
│  │   Web   │ │  Cloud  │ │   API   │ │ Gaming  │ │ Kurumsal  │ │
│  │  /store │ │ /cloud  │ │/solution│ │gaming.co│ │/enterprise│ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └─────┬─────┘ │
│       │           │           │           │             │       │
│       └───────────┴───────────┴───────────┴─────────────┘       │
│                               │                                  │
│                         Hyble ID                                │
│                    (Unified Auth)                               │
│                               │                                  │
│                         Hyble Panel                             │
│                    (User Dashboard)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 Beklenen Etki

| Metrik | Önce | Sonra (Hedef) |
|--------|------|---------------|
| Homepage bounce rate | ~60% | ~40% |
| Template conversion | N/A | 3-5% |
| Deploy completion | N/A | 70%+ |
| Segment clarity | Düşük | Yüksek |
| Cross-sell fırsatları | Düşük | Yüksek |

---

## 📝 Kritik Notlar

1. **Deploy Edilmedi:** P0 ve P1 değişiklikleri henüz canlıda yok
2. **Mineble → HybleGaming:** Tüm referanslar güncellenmeli
3. **game.hyble.co → gaming.hyble.co:** DNS ve kod değişiklikleri
4. **Template Store:** Demo şablonlar gerekli (placeholder veya gerçek)
5. **Cloud Entegrasyonu:** Deployment API hazır olmalı

---

## 🚀 Hemen Yapılacaklar

1. **Mevcut değişiklikleri deploy et** (P0, P1)
2. **P5 Part1'i başlat** (Homepage rebrand)
3. **Demo template'ler hazırla** (En az 6 adet)
4. **gaming.hyble.co DNS ayarla**
