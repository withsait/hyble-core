# ☁️ FAZ3-CLOUD: Web Hosting Panel (MVP)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | ⚙️ FAZ 3: SERVICE |
| Öncelik | 🔴 P0 (Blocker) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ3-CLOUD.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ1-IAM (User authentication)
- [x] FAZ2-BILLING (Plan subscription & payment)
- [x] FAZ3-NOTIFY (Deployment bildirimleri)

### Dependents (Bu modülü bekleyenler):
- **FAZ3-STATUS:** Cloud servis durumu buradan beslenir.
- **FAZ3-SUPPORT:** Hosting ile ilgili destek talepleri buraya referans verir.

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/cloud/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/cloud/` | 🟣 Claude | ❌ Gemini |
| `packages/worker/src/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/components/cloud/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/dashboard/cloud/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-admin/src/app/cloud/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 7 Model | ⬜ 0/7 |
| Site Service | 🟣 Claude | 6 Fonksiyon | ⬜ 0/6 |
| Deployment Service | 🟣 Claude | 5 Fonksiyon | ⬜ 0/5 |
| Domain Service | 🟣 Claude | 4 Fonksiyon | ⬜ 0/4 |
| Build Worker | 🟣 Claude | Orchestration | ⬜ 0/3 |
| API Endpoints | 🟣 Claude | 20+ Endpoint | ⬜ 0/20 |
| Frontend Components | 🔵 Gemini | 20+ Bileşen | ⬜ 0/20 |
| Pages | 🔵 Gemini | 10+ Sayfa | ⬜ 0/10 |

## 1. GENEL BAKIŞ
Hyble Cloud, Hetzner dedicated sunucuları üzerinde çalışan, maliyet odaklı ve yüksek performanslı bir PaaS (Platform as a Service) çözümüdür. Kullanıcılar statik sitelerini veya modern frontend framework'leri (Next.js, React, Vue) kolayca deploy edebilirler. Sistem, Docker container izolasyonu ve Caddy reverse proxy ile güvenli ve otomatik SSL destekli yayın yapar.

## 2. KAPSAM (MVP)

### ✅ Dahil Olanlar
- **Site Yönetimi:** Oluşturma, Silme, Ayarlar (Build command, Output dir).
- **Deployment:** ZIP yükleyerek manuel deploy, Build logları, Rollback.
- **Domain:** `*.hyble.net` subdomain ve Custom domain (DNS doğrulama + Auto SSL).
- **Environment:** Şifreli ortam değişkenleri.
- **Usage:** Bandwidth, Storage ve Build süresi takibi.
- **Planlar:** Free (1 site), Starter (3 site), Business (10 site).

### ❌ Dahil Olmayanlar (Sonraki Fazlar)
- Git Entegrasyonu (GitHub Push-to-Deploy) → FAZ 5
- Preview Deployments → FAZ 6
- Managed Databases → FAZ 6
- Serverless Functions → FAZ 6+
- CLI Tool → FAZ 6

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// ENUMS
enum SiteStatus { ACTIVE, DEPLOYING, SUSPENDED, DELETED }
enum DeploymentStatus { QUEUED, BUILDING, DEPLOYING, SUCCESS, FAILED, CANCELLED }
enum DomainStatus { PENDING, VERIFIED, FAILED }
enum DomainType { HYBLE_SUBDOMAIN, CUSTOM }

// 1. HOSTING PLAN
model HostingPlan {
  id              String      @id @default(cuid())
  name            String
  slug            String      @unique
  
  priceMonthly    Int         @default(0)
  priceYearly     Int         @default(0)
  currency        String      @default("EUR")
  
  // Limits
  maxSites        Int
  bandwidthBytes  BigInt
  storageBytes    BigInt
  buildMinutes    Int
  
  // Features
  customDomain    Boolean     @default(false)
  prioritySupport Boolean     @default(false)
  
  isActive        Boolean     @default(true)
  sortOrder       Int         @default(0)
  
  sites           HostingSite[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// 2. HOSTING SITE
model HostingSite {
  id              String      @id @default(cuid())
  userId          String
  // user         User        @relation(fields: [userId], references: [id])
  organizationId  String?
  // organization Organization? @relation(fields: [organizationId], references: [id])
  
  planId          String
  plan            HostingPlan @relation(fields: [planId], references: [id])
  
  name            String
  slug            String      @unique
  framework       String
  status          SiteStatus  @default(ACTIVE)
  
  // Build Settings
  buildCommand    String?
  outputDirectory String?
  installCommand  String?
  nodeVersion     String      @default("18")
  
  // Internal
  containerId     String?
  containerPort   Int?
  
  domains         SiteDomain[]
  deployments     Deployment[]
  envVars         SiteEnvVar[]
  usage           SiteUsage[]
  
  deletedAt       DateTime?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([userId])
  @@index([slug])
}

// 3. SITE DOMAIN
model SiteDomain {
  id              String      @id @default(cuid())
  siteId          String
  site            HostingSite @relation(fields: [siteId], references: [id], onDelete: Cascade)
  
  domain          String      @unique
  type            DomainType
  
  status          DomainStatus @default(PENDING)
  verificationToken String?
  verifiedAt      DateTime?
  
  sslEnabled      Boolean     @default(true)
  sslExpiresAt    DateTime?
  
  isPrimary       Boolean     @default(false)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([siteId])
}

// 4. DEPLOYMENT
model Deployment {
  id              String      @id @default(cuid())
  siteId          String
  site            HostingSite @relation(fields: [siteId], references: [id], onDelete: Cascade)
  
  source          String      @default("upload")
  fileName        String?
  fileSize        Int?
  
  status          DeploymentStatus @default(QUEUED)
  
  queuedAt        DateTime    @default(now())
  buildStartedAt  DateTime?
  buildFinishedAt DateTime?
  deployedAt      DateTime?
  buildDuration   Int?
  
  deploymentUrl   String?
  errorMessage    String?
  triggeredBy     String
  isProduction    Boolean     @default(false)
  
  logs            DeploymentLog[]
  
  createdAt       DateTime    @default(now())
  
  @@index([siteId, status])
}

// 5. DEPLOYMENT LOG
model DeploymentLog {
  id              String      @id @default(cuid())
  deploymentId    String
  deployment      Deployment  @relation(fields: [deploymentId], references: [id], onDelete: Cascade)
  
  step            String
  message         String
  level           String      @default("info")
  
  timestamp       DateTime    @default(now())
  
  @@index([deploymentId, timestamp])
}

// 6. ENV VARS
model SiteEnvVar {
  id              String      @id @default(cuid())
  siteId          String
  site            HostingSite @relation(fields: [siteId], references: [id], onDelete: Cascade)
  
  key             String
  valueEncrypted  String
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([siteId, key])
}

// 7. USAGE
model SiteUsage {
  id              String      @id @default(cuid())
  siteId          String
  site            HostingSite @relation(fields: [siteId], references: [id], onDelete: Cascade)
  
  periodStart     DateTime
  periodEnd       DateTime
  
  bandwidthBytes  BigInt      @default(0)
  storageBytes    BigInt      @default(0)
  buildMinutes    Int         @default(0)
  deploymentCount Int         @default(0)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@unique([siteId, periodStart])
}
4. İŞ MANTIĞI (BUSINESS LOGIC)
A. Deployment Akışı
Upload: Kullanıcı ZIP dosyasını yükler. Dosya R2/Storage'a kaydedilir. Deployment kaydı QUEUED olarak oluşur.

Queue: Worker, kuyruktan işi alır. Status: BUILDING.

Build:

ZIP açılır.

Bağımlılıklar yüklenir (npm install).

Build komutu çalıştırılır (npm run build).

Loglar gerçek zamanlı olarak DeploymentLog tablosuna yazılır.

Deploy:

Build çıktısı (dist veya out klasörü) yeni bir Docker imajına veya volume'a kopyalanır.

Caddy config güncellenir.

Status: SUCCESS.

isProduction = true yapılır, eski production deploy false yapılır.

Bildirim gönderilir (FAZ3-NOTIFY).

B. Domain Doğrulama
Kullanıcı example.com ekler.

Sistem hyble-verify-xyz gibi bir token üretir.

Kullanıcıdan _hyble-verify.example.com adresine bu token'ı TXT kaydı olarak eklemesi istenir.

Kullanıcı "Doğrula" dediğinde sistem DNS sorgusu yapar.

Başarılıysa domain VERIFIED olur ve SSL sertifikası (Let's Encrypt) otomatik alınır.

C. Limit Yönetimi
Free Plan: 1 Site, 10GB Bandwidth, 100dk Build.

Aşım: Limitlerin %80'ine gelindiğinde kullanıcı uyarılır. %100'e gelindiğinde Free planda yeni deploy engellenir, Paid planlarda overage uyarısı verilir veya site suspend edilir (kritik aşımda).

5. API ENDPOINTS
GET /api/cloud/sites: Site listesi.

POST /api/cloud/sites: Yeni site oluştur.

GET /api/cloud/sites/:slug: Site detayı.

POST /api/cloud/sites/:slug/deploy: Yeni deployment başlat.

GET /api/cloud/sites/:slug/deployments/:id/logs: Logları getir.

POST /api/cloud/sites/:slug/domains: Domain ekle.

POST /api/cloud/sites/:slug/domains/:id/verify: DNS doğrula.

GET /api/cloud/plans: Plan listesi.

6. FRONTEND BİLEŞENLERİ (UI)
CreateSiteWizard: Framework seçimi (Next.js, React, Vue ikonları), Proje ismi girişi.

SiteDashboard: Ana ekran. Sitenin önizlemesi, durumu, son deployment bilgisi ve hızlı aksiyonlar.

DeploymentLogs: Terminal benzeri, satır satır akan log penceresi.

EnvVarEditor: Key-Value tablosu. Değerler ***** olarak görünür, göze basınca açılır.

UsageMeter: "75% of 100GB used" şeklinde progress barlar.

✅ KABUL KRİTERLERİ (DoD)
[ ] Kullanıcı Free plan ile site oluşturabiliyor.

[ ] ZIP dosyası yükleyerek manuel deployment yapılabiliyor.

[ ] Deployment süreci (Queued -> Building -> Success) doğru işliyor.

[ ] Loglar görüntülenebiliyor.

[ ] Başarılı deploy sonrası site slug.hyble.net adresinden erişilebiliyor.

[ ] Custom domain eklenebiliyor ve DNS doğrulaması çalışıyor.

[ ] Environment variables build sürecine inject ediliyor.

[ ] Kullanım istatistikleri (Bandwidth, Build süresi) doğru takip ediliyor.

[ ] Rollback işlemi (eski deploy'a dönüş) çalışıyor.