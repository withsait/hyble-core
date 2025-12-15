# 📦 FAZ2-DELIVERY: Dijital Varlık Dağıtım Sistemi (MVP)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 💰 FAZ 2: MONEY |
| Öncelik | 🔴 P0 (Blocker) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ2-DELIVERY.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ1-IAM (User ve Organization modelleri)
- [x] FAZ2-BILLING (Lisansın satın alınması ve faturalandırılması için)

### Dependents (Bu modülü bekleyenler):
- **FAZ3-CLOUD:** Cloud servislerinin ihtiyaç duyacağı SDK/Agent dosyaları buradan indirilecek.

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/delivery/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/r2/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/components/downloads/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/dashboard/downloads/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-admin/src/app/downloads/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 7 Model | ⬜ 0/7 |
| Product Service | 🟣 Claude | 4 Fonksiyon | ⬜ 0/4 |
| Download Service | 🟣 Claude | 5 Fonksiyon | ⬜ 0/5 |
| License Service | 🟣 Claude | 3 Fonksiyon | ⬜ 0/3 |
| R2 Integration | 🟣 Claude | Upload/Download | ⬜ 0/2 |
| Frontend Components | 🔵 Gemini | 12 Bileşen | ⬜ 0/12 |
| Frontend Pages | 🔵 Gemini | 8 Sayfa | ⬜ 0/8 |

## 1. GENEL BAKIŞ
Bu modül, Hyble'ın sattığı veya sunduğu dijital ürünlerin (SDK, Tema, Dokümantasyon, Proje Dosyaları) güvenli bir şekilde dağıtılmasını sağlar. Sadece aktif lisansa sahip kullanıcılar indirme yapabilir. Sistem, sürüm geçmişini (changelog) tutar ve güvenli indirme linkleri (Signed URL) ile dosyaları korur.

## 2. KAPSAM (MVP)

### ✅ Dahil Olanlar
- **Ürün Yönetimi:** Tema, SDK, Asset kategorilerinde ürünler.
- **Sürüm Takibi:** Versiyonlama (v1.0.0), Changelog, Stable/Latest etiketleri.
- **Güvenlik:** Signed URL (60dk geçerli, IP kilitli), Checksum (SHA256).
- **Lisans Kontrolü:** Aktif lisans şartı, Grace Period (7 gün).
- **Rate Limiting:** Kullanıcı ve plan bazlı indirme limiti.
- **Depolama:** Cloudflare R2 entegrasyonu.

### ❌ Dahil Olmayanlar (Sonraki Fazlar)
- CI/CD Entegrasyonu & Webhook → FAZ 4+
- NPM/Composer Paket Yönetimi → FAZ 5+
- "Deploy to Cloud" butonu → FAZ 3+
- Bundle Paketler → FAZ 5+
- Virüs Tarama (ClamAV) → FAZ 3

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// ENUMS
enum LicenseType { LIFETIME, SUBSCRIPTION, PROJECT }
enum LicenseStatus { ACTIVE, GRACE_PERIOD, EXPIRED, SUSPENDED }
enum DownloadStatus { STARTED, COMPLETED, FAILED, CANCELLED }

// PRODUCT
model DownloadableProduct {
  id              String          @id @default(cuid())
  name            String
  slug            String          @unique
  description     String?
  category        String          // template, sdk, documentation, asset
  image           String?
  
  licenseType     LicenseType     @default(SUBSCRIPTION)
  isActive        Boolean         @default(true)
  
  versions        ProductVersion[]
  licenses        ProductLicense[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model ProductVersion {
  id              String          @id @default(cuid())
  productId       String
  product         DownloadableProduct @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  version         String          // v1.0.0
  changelog       String?         @db.Text
  releaseDate     DateTime        @default(now())
  
  isStable        Boolean         @default(true)
  isLatest        Boolean         @default(false)
  isDeprecated    Boolean         @default(false)
  
  minRequirements String?
  compatibility   String?
  
  files           ProductFile[]
  downloadHistory DownloadHistory[]
  
  createdAt       DateTime        @default(now())
  
  @@unique([productId, version])
  @@index([productId])
}

model ProductFile {
  id              String          @id @default(cuid())
  versionId       String
  version         ProductVersion  @relation(fields: [versionId], references: [id], onDelete: Cascade)
  
  fileName        String
  filePath        String          // r2://downloads/products/...
  fileSize        Int             // bytes
  fileHash        String          // SHA256
  mimeType        String
  
  sortOrder       Int             @default(0)
  
  downloadTokens  DownloadToken[]
  downloadHistory DownloadHistory[]
  
  createdAt       DateTime        @default(now())
}

// LICENSE
model ProductLicense {
  id              String          @id @default(cuid())
  
  userId          String?
  user            User?           @relation(fields: [userId], references: [id])
  organizationId  String?
  organization    Organization?   @relation(fields: [organizationId], references: [id])
  
  productId       String
  product         DownloadableProduct @relation(fields: [productId], references: [id])
  
  licenseType     LicenseType
  status          LicenseStatus   @default(ACTIVE)
  
  purchasedAt     DateTime        @default(now())
  expiresAt       DateTime?
  gracePeriodEndsAt DateTime?
  
  invoiceId       String?
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([userId])
  @@index([organizationId])
  @@index([productId])
}

// DOWNLOAD
model DownloadToken {
  id              String          @id @default(cuid())
  
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  
  fileId          String
  file            ProductFile     @relation(fields: [fileId], references: [id])
  
  token           String          @unique
  ipAddress       String
  
  expiresAt       DateTime        // 60 min
  
  isUsed          Boolean         @default(false)
  usedAt          DateTime?
  
  createdAt       DateTime        @default(now())
  
  @@index([token])
}

model DownloadHistory {
  id              String          @id @default(cuid())
  
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  
  organizationId  String?
  
  fileId          String
  file            ProductFile     @relation(fields: [fileId], references: [id])
  versionId       String
  version         ProductVersion  @relation(fields: [versionId], references: [id])
  
  ipAddress       String
  userAgent       String?
  
  status          DownloadStatus  @default(STARTED)
  bytesDownloaded Int?
  
  createdAt       DateTime        @default(now())
  
  @@index([userId])
  @@index([fileId])
}

// RATE LIMIT
model DownloadLimit {
  id              String          @id @default(cuid())
  
  userId          String          @unique
  user            User            @relation(fields: [userId], references: [id])
  
  dailyCount      Int             @default(0)
  monthlyCount    Int             @default(0)
  
  dailyLimit      Int             @default(10)
  monthlyLimit    Int             @default(50)
  
  lastResetDaily  DateTime        @default(now())
  lastResetMonthly DateTime       @default(now())
  
  @@index([userId])
}

// --- CROSS-MODULE UPDATES (FAZ1-IAM) ---
// Aşağıdaki relation'lar User ve Organization modellerine eklenmelidir.

/*
model User {
  // ... mevcut field'lar ...
  productLicenses   ProductLicense[]
  downloadTokens    DownloadToken[]
  downloadHistory   DownloadHistory[]
  downloadLimit     DownloadLimit?
}

model Organization {
  // ... mevcut field'lar ...
  productLicenses   ProductLicense[]
}
*/
4. İŞ MANTIĞI (BUSINESS LOGIC)
A. Signed URL Akışı
İstek: Kullanıcı POST /api/download/token endpointine fileId ile istek atar.

Kontrol:

Auth: Kullanıcı giriş yapmış mı?

Lisans: ProductLicense tablosunda status=ACTIVE kaydı var mı?

Grace Period: expiresAt geçmiş olsa bile gracePeriodEndsAt geçerli mi?

Rate Limit: Günlük/Aylık indirme hakkı kalmış mı?

Token: Tüm kontroller geçerse benzersiz bir token üretilir ve IP adresiyle eşleştirilip DB'ye kaydedilir.

URL: Kullanıcıya https://api.hyble.com/download/{token} adresi dönülür.

İndirme: Kullanıcı bu linke tıkladığında, token kontrol edilir, IP eşleştirilir, 60 dk süre kontrol edilir ve dosya stream edilir.

B. Grace Period Mantığı
Aktif Lisans: expiresAt > now() → Tam erişim.

Grace Period: expiresAt < now() ve gracePeriodEndsAt > now() → Kısıtlı erişim (Sadece güvenlik yamaları, yeni sürüm yok).

Expired: Her iki tarih de geçmiş → İndirme engellenir.

Süre: Varsayılan 7 gün.

C. Rate Limiting
Planlara göre limitler belirlenir (Örn: Starter 10/gün, Business 50/gün).

Her başarılı indirmede sayaç artar.

Cron job ile günlük sayaç gece 00:00'da, aylık sayaç her ayın 1'inde sıfırlanır.

5. DEPOLAMA (CLOUDFLARE R2)
Bucket: hyble-downloads

Path: products/{productSlug}/{version}/{fileName}

R2 API kullanılarak signed URL veya stream yöntemiyle dosya sunulur. Public erişim kapalıdır.

6. FRONTEND BİLEŞENLERİ (UI)
ProductList: Kart görünümünde ürünler, "Aktif", "Süresi Dolmuş" etiketleri.

ProductDetail: Ürün açıklaması, versiyon seçici, changelog accordion.

DownloadButton:

Aktif: Yeşil "İndir (v1.2.0)" butonu.

Grace: Sarı "Yenileme Gerekli (Sadece Yamalar)" butonu.

Expired: Kırmızı "Lisans Yenile" butonu (Billing'e yönlendirir).

ChecksumDisplay: Dosya bütünlüğü için SHA256 kodunu gösterir ve kopyalama imkanı sunar.

✅ KABUL KRİTERLERİ (DoD)
[ ] Ürün oluşturulabiliyor ve listelenebiliyor.

[ ] Sürüm yüklenebiliyor (dosya + changelog).

[ ] Lisanslı kullanıcı dosya indirebiliyor.

[ ] Lisanssız veya süresi dolmuş kullanıcı indirme yapamıyor.

[ ] Signed URL 60dk sonra geçersiz oluyor.

[ ] IP adresi kontrolü çalışıyor (Link paylaşılamıyor).

[ ] Rate limiting çalışıyor (Limit aşılınca engel).

[ ] Grace period mantığı çalışıyor (7 gün ek süre).

[ ] İndirme geçmişi eksiksiz kaydediliyor.

[ ] Dosya Checksum (SHA256) doğru hesaplanıp gösteriliyor.