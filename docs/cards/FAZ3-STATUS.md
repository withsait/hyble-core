# 🚦 FAZ3-STATUS: Service Status Page & Incident Management (MVP)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | ⚙️ FAZ 3: SERVICE |
| Öncelik | 🟠 P1 (High) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ3-STATUS.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ1-IAM (Admin yetkisi için)
- [x] FAZ3-NOTIFY (Abonelere email gönderimi için)

### Dependents (Bu modülü bekleyenler):
- **FAZ3-CLOUD:** Sunucu kesintilerinde status sayfasını otomatik güncelleyebilir (İleri faz).
- **FAZ3-SUPPORT:** Destek ekibi ticket yanıtlarında status linki verir.

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/status/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/status/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-web/src/components/status/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-web/src/app/status/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-admin/src/app/status/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 7 Model | ⬜ 0/7 |
| Status Service | 🟣 Claude | 5 Fonksiyon | ⬜ 0/5 |
| Incident Logic | 🟣 Claude | Notify Trigger | ⬜ 0/3 |
| Uptime Cron | 🟣 Claude | Calculation | ⬜ 0/2 |
| API Endpoints | 🟣 Claude | 8 Endpoint | ⬜ 0/8 |
| Frontend Components | 🔵 Gemini | 8 Bileşen | ⬜ 0/8 |
| Pages | 🔵 Gemini | 4 Sayfa | ⬜ 0/4 |

## 1. GENEL BAKIŞ
Hyble platformunun şeffaflık yüzüdür. Kullanıcılar API'nin, ödeme sisteminin veya sunucuların durumunu buradan takip eder. Sistem yöneticileri (Admin), kesinti (Incident) veya bakım (Maintenance) durumlarını buradan duyurur. FAZ3-NOTIFY entegrasyonu ile abonelere anlık bilgi verilir.

## 2. KAPSAM (MVP)

### ✅ Dahil Olanlar
- **Public Status Page:** Herkesin erişebileceği durum sayfası.
- **Incident Management:** Kesinti oluşturma, güncelleme (Investigating, Identified, Monitoring, Resolved).
- **Maintenance:** Planlı bakım oluşturma ve zamanlanmış bildirimler.
- **Uptime History:** Her servis için son 90 günün durumu (Bar chart).
- **Email Subscriptions:** Kullanıcıların güncellemelere abone olması.
- **RSS Feed:** Otomatik XML feed.
- **Global Maintenance Mode:** Siteyi tamamen bakıma alma yeteneği.

### ❌ Dahil Olmayanlar (Sonraki Fazlar)
- SMS Bildirimleri → FAZ 5+
- Slack/Discord Webhook → FAZ 4
- Automated Monitoring (Prometheus/Grafana entegrasyonu) → FAZ 4+ (Şimdilik manuel trigger)
- Private Status Pages (Sadece belirli müşterilere özel) → FAZ 5+

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// ENUMS
enum ServiceStatus {
  OPERATIONAL       // Çalışıyor
  DEGRADED          // Performans Düşüklüğü
  PARTIAL_OUTAGE    // Kısmi Kesinti
  MAJOR_OUTAGE      // Ana Kesinti
  MAINTENANCE       // Bakım
}

enum IncidentStatus {
  INVESTIGATING
  IDENTIFIED
  MONITORING
  RESOLVED
}

enum MaintenanceStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// 1. SERVICES
model StatusGroup {
  id              String          @id @default(cuid())
  name            String          // "Core Services", "Regions"
  sortOrder       Int             @default(0)
  
  services        StatusService[]
  
  createdAt       DateTime        @default(now())
}

model StatusService {
  id              String          @id @default(cuid())
  groupId         String
  group           StatusGroup     @relation(fields: [groupId], references: [id])
  
  name            String          // "API", "Dashboard", "US-East-1"
  description     String?
  slug            String          @unique
  
  currentStatus   ServiceStatus   @default(OPERATIONAL)
  sortOrder       Int             @default(0)
  
  dailyUptimes    DailyUptime[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([groupId])
}

// 2. INCIDENTS
model StatusIncident {
  id              String          @id @default(cuid())
  
  title           String
  status          IncidentStatus  @default(INVESTIGATING)
  impact          ServiceStatus   @default(DEGRADED) // Etki seviyesi
  
  affectedServices String[]       // JSON array of service names or relation logic
  
  updates         IncidentUpdate[]
  
  resolvedAt      DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model IncidentUpdate {
  id              String          @id @default(cuid())
  incidentId      String
  incident        StatusIncident  @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  
  status          IncidentStatus
  message         String          @db.Text
  
  createdAt       DateTime        @default(now())
}

// 3. MAINTENANCE
model StatusMaintenance {
  id              String          @id @default(cuid())
  
  title           String
  description     String?         @db.Text
  status          MaintenanceStatus @default(SCHEDULED)
  
  affectedServices String[]
  
  scheduledStart  DateTime
  scheduledEnd    DateTime
  
  startedAt       DateTime?
  completedAt     DateTime?
  
  isGlobalMode    Boolean         @default(false) // Siteyi komple bakıma alır mı?
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

// 4. METRICS & SUBSCRIBERS
model DailyUptime {
  id              String          @id @default(cuid())
  serviceId       String
  service         StatusService   @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  
  date            DateTime        // YYYY-MM-DD
  status          ServiceStatus   // Günün en kötü durumu
  percentage      Int             // 0-100 (Operational=100, Major=0)
  
  createdAt       DateTime        @default(now())
  
  @@unique([serviceId, date])
}

model StatusSubscriber {
  id              String          @id @default(cuid())
  email           String          @unique
  
  isVerified      Boolean         @default(false)
  verifyToken     String?
  
  subscribedAt    DateTime        @default(now())
}
4. İŞ MANTIĞI (BUSINESS LOGIC)
A. Uptime Hesaplama (Cron Job)
Her gece 00:00'da çalışan bir job:

Önceki gün içindeki tüm Incident ve Maintenance kayıtlarını tarar.

Her servis için günün "en kötü" durumunu belirler.

Puanlama:

OPERATIONAL: %100

DEGRADED: %90

PARTIAL_OUTAGE: %50

MAJOR_OUTAGE: %0

DailyUptime tablosuna kaydeder. Frontend bu tabloyu kullanarak 90 günlük bar'ı çizer.

B. Bildirim Tetikleyicileri (FAZ3-NOTIFY)
Aşağıdaki durumlarda NotificationService tetiklenir ve abonelere e-posta gönderilir:

Incident Created: Yeni bir kesinti başladığında.

Incident Status Change: Durum değiştiğinde (örn: Resolved).

Maintenance Scheduled: Bakım planlandığında.

Maintenance Reminder: Bakıma 24 saat kala.

Maintenance Started/Completed: Bakım başlayınca ve bitince.

C. Renk Kodları
Frontend'de kullanılacak standart renkler:

🟢 Operational: #22c55e (green-500)

🟡 Degraded: #eab308 (yellow-500)

🟠 Partial Outage: #f97316 (orange-500)

🔴 Major Outage: #ef4444 (red-500)

🔵 Maintenance: #3b82f6 (blue-500)

D. Global Bakım Modu
Eğer aktif bir StatusMaintenance kaydında isGlobalMode = true ve status = IN_PROGRESS ise:

Frontend middleware (middleware.ts) tüm istekleri yakalar.

Admin paneli (/admin/*) ve Status API (/api/status/*) hariç tüm yolları engeller.

Kullanıcıya özel tasarlanmış 503 Service Unavailable sayfası gösterilir (Countdown ile).

5. API ENDPOINTS
GET /api/status: Tüm servislerin güncel durumunu ve aktif olayları döner.

GET /api/status/history: 90 günlük uptime verisi.

GET /api/status/incidents: Geçmiş olaylar (Pagination).

POST /api/status/subscribe: Email aboneliği başlat.

POST /api/admin/status/incident: Yeni incident oluştur (Admin).

PUT /api/admin/status/incident/:id: Update ekle veya resolve et (Admin).

POST /api/admin/status/maintenance: Bakım planla (Admin).

6. FRONTEND BİLEŞENLERİ (UI)
StatusHero: Sayfanın en üstünde büyük ikon. Her şey yolundaysa "All Systems Operational" yazar.

ServiceGroup: Servisleri kategorilere ayırır (Core, Cloud vb.).

UptimeBar: 90 adet küçük dikdörtgen. Hover olunca tarih ve o günkü durumu gösterir.

IncidentTimeline: Olayın güncellemelerini zaman çizelgesi olarak gösterir.

MaintenanceBanner: Planlı bakım varsa sayfanın tepesinde sayaç ile gösterilir.

✅ KABUL KRİTERLERİ (DoD)
[ ] status.hyble.co (veya /status) public olarak erişilebilir.

[ ] Servisler gruplandırılmış şekilde listeleniyor.

[ ] Her servis için 90 günlük uptime barı doğru renklerle çalışıyor.

[ ] Aktif incident varsa Hero section'da uyarı veriyor.

[ ] Admin panelden Incident oluşturulup güncelleme (update) girilebiliyor.

[ ] Planlı bakım oluşturulabiliyor ve banner aktifleşiyor.

[ ] Global bakım modu açıldığında site 503 sayfasına düşüyor (Admin hariç).

[ ] Email aboneliği (Subscribe) çalışıyor ve doğrulama maili gidiyor.

[ ] Incident durumlarında FAZ3-NOTIFY üzerinden mail tetikleniyor.

[ ] RSS feed (/feed.xml) valid bir XML döndürüyor.