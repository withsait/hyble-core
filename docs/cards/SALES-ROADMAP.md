# SALES-ROADMAP: Satış & Müşteri Odaklı Geliştirme Master Plan

## 🎯 Hedef
Hyble'ın conversion rate'ini artır, müşteri güvenini oluştur, retention'ı güçlendir.

## 📊 Metrikler (Takip Edilecek)
- Homepage → Register conversion rate
- Free trial → Paid conversion rate
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Net Promoter Score (NPS)
- Monthly Recurring Revenue (MRR)
- Churn rate

---

## 🗓️ Roadmap Özeti

| Faz | Card | Süre | Öncelik | Bağımlılık |
|-----|------|------|---------|------------|
| **P0** | SALES-P0-URGENT-FIXES | 4-6 saat | 🔴 ACİL | - |
| **P1** | SALES-P1-HOMEPAGE-SIMPLIFICATION | 12-16 saat | 🟠 Yüksek | P0 |
| **P2** | SALES-P2-CONVERSION-FUNNEL | 16-20 saat | 🟡 Orta | P1 |
| **P3** | SALES-P3-GAMING-VERTICAL | 20-24 saat | 🟡 Orta | P0 |
| **P4** | SALES-P4-RETENTION-GROWTH | 24-32 saat | 🟢 Normal | P2 |

**Toplam Tahmini Süre:** 76-98 saat (~2-3 hafta full-time)

---

## 📁 Card Dosyaları

```
docs/cards/
├── SALES-P0-URGENT-FIXES.md        # Fake metrikler, CTA, gaming redirect
├── SALES-P1-HOMEPAGE-SIMPLIFICATION.md  # AudienceSelector, SocialProof
├── SALES-P2-CONVERSION-FUNNEL.md   # Exit popup, lead capture, onboarding
├── SALES-P3-GAMING-VERTICAL.md     # gaming.hyble.co, brand switcher
├── SALES-P4-RETENTION-GROWTH.md    # Referral, usage alerts, NPS
└── SALES-ROADMAP.md                # Bu dosya (master plan)
```

---

## ✅ Başlangıç Sırası

### Hafta 1
1. **SALES-P0-URGENT-FIXES** (4-6 saat)
   - Fake metrikleri kaldır
   - Hero headline güncelle
   - CTA sadeleştir
   - Header menüsünü düzenle

2. **SALES-P3-GAMING-VERTICAL** (paralel başla - DNS/infra)
   - DNS kayıtları ekle
   - Nginx config hazırla
   - SSL sertifikası oluştur

### Hafta 2
3. **SALES-P1-HOMEPAGE-SIMPLIFICATION** (12-16 saat)
   - AudienceSelector komponenti
   - SocialProof komponenti
   - Homepage yeniden yapılandır

4. **SALES-P3-GAMING-VERTICAL** (devam)
   - Gaming hero section
   - Game selector
   - Brand switcher

### Hafta 3
5. **SALES-P2-CONVERSION-FUNNEL** (16-20 saat)
   - Exit intent popup
   - Lead capture API
   - Onboarding wizard
   - Email templates

### Hafta 4+
6. **SALES-P4-RETENTION-GROWTH** (24-32 saat)
   - Referral program
   - Usage alerts
   - NPS survey

---

## 🔧 Teknik Gereksinimler

### Yeni Prisma Modeller
```
- Lead
- EmailSequence
- ABTestEvent
- ReferralCode
- Referral
- UsageAlert
- NpsSurvey
- PayoutRequest
```

### Yeni tRPC Routers
```
- leadRouter
- referralRouter
- npsRouter
- usageRouter
```

### Yeni Email Templates
```
- welcome_coupon
- usage_alert
- referral_invite
- nps_followup
- drip_day1, drip_day3, drip_day7
```

### Cron Jobs
```
- Usage alerts (hourly)
- Email sequences (daily 10:00)
- NPS survey recipients (daily 09:00)
- Referral commission calculation (daily)
```

---

## 🚀 Claude Code Kullanımı

Her card için:
```
1. Card dosyasını oku
2. Görevleri sırayla uygula
3. Kontrol listesini tamamla
4. Test et
5. Commit at
```

Örnek prompt:
```
docs/cards/SALES-P0-URGENT-FIXES.md dosyasını oku ve içindeki görevleri sırayla uygula.
Her görevi tamamladıktan sonra kontrol listesindeki ilgili maddeyi işaretle.
```

---

## 📝 Notlar

1. **Brand Güncellemesi:** Mineble artık yok, gaming.hyble.co / HybleGaming olarak devam
2. **Öncelik:** P0 mutlaka ilk yapılmalı (güven sorunu kritik)
3. **Test:** Her fazdan sonra mobile + dark mode test edilmeli
4. **Commit Stratejisi:** Her görev için ayrı commit
5. **Rollback:** Eski komponentler _archive klasörüne taşınmalı (silinmemeli)

---

## 📞 Kontakt

Sorular için: Claude Code veya bu dökümanı güncelle.
