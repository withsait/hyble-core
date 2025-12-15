# 🌐 FAZ1-LANDING: hyble.co Landing Page

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 🚀 FAZ 1: BEDROCK |
| Öncelik | 🟠 P1 (High) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ1-LANDING.md` |

---

## 🎯 MODÜL AMACI
Ziyaretçileri karşılayan, Hyble'ın değer önerisini (Value Proposition) net bir şekilde ileten, güven veren ve kayıt olmaya teşvik eden yüksek performanslı (Core Web Vitals yeşil) bir pazarlama yüzü oluşturmak.

---

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] Turborepo ve Next.js kurulumu (`apps/hyble-web`)
- [x] `packages/ui` (Shadcn bileşenleri)
- [ ] FAZ1-EMAIL (İletişim formu için)

### Dependents (Bu modülü bekleyenler):
- **Marketing:** Reklam ve SEO çalışmaları bu sayfa olmadan başlayamaz.
- **FAZ1-IAM:** Header'daki "Login/Register" butonları Auth sayfalarına yönlendirecek.

---

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `apps/hyble-web/src/app/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-web/src/components/landing/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-web/src/content/` (Legal MDX) | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/api/contact/` | 🟣 Claude | ❌ Gemini |

---

## 👥 GÖREV DAĞILIMI

### 🔵 GEMINI VS CODE (Frontend - %90)
*Çalışma Alanı: `apps/hyble-web`*

1.  **SETUP:**
    * Layout düzeni: `(landing)/layout.tsx` (Navbar ve Footer burada olacak, Dashboard'dan ayrı).
    * i18n: `middleware.ts` üzerinden dil algılama ve yönlendirme.
    * SEO: `robots.txt`, `sitemap.xml` ve dinamik `metadata` üretimi.
2.  **COMPONENTS:**
    * **Hero:** Büyük, cesur tipografi. "Start Building" CTA butonu. Arka planda hafif gradient veya mesh effect.
    * **Bento Grid:** Özellikleri (Money, Cloud, AI) grid yapısında, farklı boyutlarda kartlarla gösterme. Hover efektleri.
    * **Trust:** "Powered by Hetzner", "GDPR Compliant", "256-bit SSL" logoları (Grayscale -> Color hover).
    * **Legal:** Gizlilik ve Kullanım Şartları sayfaları için MDX veya basit HTML yapısı.
3.  **PERFORMANCE:**
    * `next/image` optimizasyonu.
    * CLS (Cumulative Layout Shift) önlemleri.

### 🟣 CLAUDE CODE (Backend - %10)
*Çalışma Alanı: `apps/hyble-panel/src/app/api`*

1.  **CONTACT API:**
    * `POST /api/contact` endpoint'i.
    * Rate limiting (Upstash veya basit IP kontrolü).
    * Resend kullanarak `support@hyble.co` adresine mail gönderimi.
    * Zod validasyonu (Email, Subject, Message).

---

## 📐 TEKNİK DETAYLAR

### 1. Component Tree (`apps/hyble-web/src/components/landing/`)
components/landing/ ├── HeroSection.tsx # H1, Subtext, Primary CTA ├── FeatureBento.tsx # Bento Grid Layout (CSS Grid) ├── HowItWorks.tsx # 3-Step Process (Icons + Text) ├── TrustBadges.tsx # Logo strip ├── TestimonialSection.tsx # Marquee effect veya Grid ├── PricingTeaser.tsx # "Free during beta" vb. ├── CTASection.tsx # Footer öncesi son çağrı ├── SiteHeader.tsx # Logo, NavLinks, AuthBtns, ThemeToggle, LangSwitch └── SiteFooter.tsx # Links, Socials, Copyright


### 2. Sayfa Yapısı (`apps/hyble-web/src/app/`)
app/(landing)/ ├── page.tsx # Landing Home ├── about/page.tsx # Vizyon/Misyon (Static) ├── contact/page.tsx # İletişim Formu (Client Component) ├── pricing/page.tsx # Fiyatlandırma (Static) └── legal/ ├── privacy/page.tsx └── terms/page.tsx


### 3. SEO & Metadata
* **Title:** Hyble - The All-in-One Digital Ecosystem
* **Description:** Manage your identity, payments, and cloud infrastructure in one unified platform. Powered by AI.
* **Keywords:** digital wallet, cloud hosting, b2b identity, saas platform
* **Schema.org:** `Organization` (Hyble), `WebSite`.

---

## ✅ KABUL KRİTERLERİ (DoD)

- [ ] PageSpeed Insights / Lighthouse skoru Desktop için **95+**, Mobile için **90+** (Performance).
- [ ] Mobil cihazlarda yatay kaydırma (horizontal scroll) sorunu yok.
- [ ] Dark/Light mode geçişi pürüzsüz çalışıyor (FOUC yok).
- [ ] İletişim formu doldurulduğunda API 200 dönüyor ve mail düşüyor.
- [ ] Tüm linkler (Nav, Footer, CTA) doğru yerlere gidiyor.
- [ ] Dil değiştirildiğinde içerik güncelleniyor ve URL değişiyor (`/tr`, `/en`).
- [ ] Meta etiketleri (OG Image, Title, Description) sosyal medyada paylaşım önizlemesinde doğru görünüyor.

---

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Setup (SEO/i18n) | 🔵 Gemini | Config | ⬜ 0/1 |
| Layout & Header | 🔵 Gemini | Components | ⬜ 0/1 |
| Hero & Bento | 🔵 Gemini | UI Design | ⬜ 0/1 |
| Content Pages | 🔵 Gemini | Legal/About | ⬜ 0/1 |
| Contact API | 🟣 Claude | Endpoint | ⬜ 0/1 |