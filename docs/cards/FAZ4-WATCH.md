# 👁️ FAZ4-WATCH: System Monitoring & Alerting (MVP)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 🧠 FAZ 4: HYLA AI |
| Öncelik | 🟠 P1 (High) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ4-WATCH.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ1-INFRA (Sunucu erişimi ve Docker)
- [x] FAZ1-EMAIL (Alert bildirimleri için)
- [x] FAZ3-STATUS (Otomatik incident oluşturmak için)
- [x] FAZ3-NOTIFY (Bildirim kanalları yönetimi için)

### Dependents (Bu modülü bekleyenler):
- **FAZ5-SCALE:** Auto-scaling kararları buradaki metrikler (CPU Load) üzerinden verilir.

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/database/prisma/` | 🟣 Claude | ❌ Gemini |
| `packages/api/src/routers/watch/` | 🟣 Claude | ❌ Gemini |
| `packages/api/src/services/watch/` | 🟣 Claude | ❌ Gemini |
| `apps/worker/src/monitors/` | 🟣 Claude | ❌ Gemini |
| `apps/web/components/watch/` | 🔵 Gemini | ❌ Claude |
| `apps/web/app/(admin)/watch/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 5 Model | ⬜ 0/5 |
| Check Service | 🟣 Claude | Cron Logic | ⬜ 0/3 |
| Metric Collector | 🟣 Claude | Docker API | ⬜ 0/2 |
| Alert Service | 🟣 Claude | Thresholds | ⬜ 0/3 |
| API Endpoints | 🟣 Claude | 8 Endpoint | ⬜ 0/8 |
| Frontend Dashboard | 🔵 Gemini | 6 Bileşen | ⬜ 0/6 |
| Frontend Charts | 🔵 Gemini | 2 Grafik | ⬜ 0/2 |

## 1. GENEL BAKIŞ
FAZ4-WATCH, Hyble sisteminin "sinir sistemidir". Sunucuların, servislerin ve veritabanlarının sağlığını sürekli kontrol eder. Bir sorun tespit ettiğinde (örn: API yanıt vermiyor veya CPU %90 üzerinde), sistem yöneticilerini uyarır ve halka açık durum sayfasını (FAZ3-STATUS) otomatik olarak günceller.

## 2. KAPSAM (MVP)

### ✅ Dahil Olanlar (MVP)
- **Service Health Checks:** Belirlenen URL'lere (HTTP) veya Portlara (TCP) ping atma.
- **Resource Monitoring:** Docker container'ların CPU, RAM ve Disk I/O verilerinin toplanması.
- **Uptime Monitoring:** 1-5 dakika aralıklarla kontrol.
- **Alert Rules:** Basit eşik değerleri (Threshold) tanımlama (örn: Latency > 2s).
- **Auto-Incident:** Kesinti durumunda FAZ3-STATUS üzerinde Incident kaydı açma.
- **Notification:** Email ve Webhook üzerinden uyarı gönderme.
- **History:** Son 7 günlük verilerin saklanması.
- **Dashboard:** Admin panelde canlı izleme ekranı.

### ❌ Dahil Olmayanlar (FAZ 8'e Ertelenenler)
- APM (Application Performance Monitoring - Kod seviyesinde trace)
- Distributed Tracing (Microservices arası takip)
- Custom Metrics (Uygulama içi özel sayaçlar)
- Alert Escalation (Önce Junior, sonra Senior'a haber ver)
- PagerDuty/Opsgenie Entegrasyonu
- Slack/Discord Bot Entegrasyonu
- Anomaly Detection (AI tabanlı sapma tespiti)
- Cost Monitoring (Cloud maliyet takibi)
- Synthetic Monitoring (Kullanıcı senaryosu simülasyonu)

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// ENUMS
enum MonitorType { HTTP, TCP, DOCKER, POSTGRES }
enum MonitorStatus { UP, DOWN, DEGRADED, MAINTENANCE }
enum AlertSeverity { INFO, WARNING, CRITICAL }
enum ComparisonOp { GT, LT, EQ } // Greater Than, Less Than...

// 1. MONITOR TARGETS
model Monitor {
  id              String        @id @default(cuid())
  name            String
  type            MonitorType
  
  // Config
  target          String        // URL, IP:Port or Container ID
  interval        Int           @default(60) // saniye
  timeout         Int           @default(5000) // ms
  
  // Status Sync (FAZ3-STATUS relation)
  statusServiceId String?       // Hangi public servis ile eşleşiyor?
  
  isActive        Boolean       @default(true)
  currentStatus   MonitorStatus @default(UP)
  lastCheckedAt   DateTime?
  
  checks          MonitorCheck[]
  metrics         ServerMetric[]
  alertRules      AlertRule[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

// 2. CHECK LOGS (Pings)
model MonitorCheck {
  id              String        @id @default(cuid())
  monitorId       String
  monitor         Monitor       @relation(fields: [monitorId], references: [id], onDelete: Cascade)
  
  status          MonitorStatus
  latency         Int           // ms
  statusCode      Int?          // HTTP 200, 404 vs.
  errorMessage    String?
  
  createdAt       DateTime      @default(now())
  
  @@index([monitorId, createdAt])
}

// 3. METRICS (Resources)
model ServerMetric {
  id              String        @id @default(cuid())
  monitorId       String
  monitor         Monitor       @relation(fields: [monitorId], references: [id], onDelete: Cascade)
  
  cpuPercent      Float?
  memoryUsage     BigInt?       // bytes
  diskUsage       BigInt?       // bytes
  
  createdAt       DateTime      @default(now())
  
  @@index([monitorId, createdAt])
}

// 4. ALERT RULES
model AlertRule {
  id              String        @id @default(cuid())
  monitorId       String
  monitor         Monitor       @relation(fields: [monitorId], references: [id])
  
  metricType      String        // "latency", "cpu", "status"
  operator        ComparisonOp
  threshold       Float
  
  duration        Int           // "x dakika boyunca" (örn: 5 dk boyunca CPU > 90)
  severity        AlertSeverity
  
  isActive        Boolean       @default(true)
  
  history         AlertHistory[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

// 5. ALERT HISTORY
model AlertHistory {
  id              String        @id @default(cuid())
  ruleId          String
  rule            AlertRule     @relation(fields: [ruleId], references: [id])
  
  triggeredAt     DateTime      @default(now())
  resolvedAt      DateTime?
  
  value           Float         // Tetiklendiği andaki değer
  
  // FAZ3 Integration
  incidentId      String?       // Oluşturulan otomatik incident ID'si
  
  @@index([ruleId, triggeredAt])
}
4. İŞ MANTIĞI (BUSINESS LOGIC)
A. Check Engine (Cron Job)
Sistem her dakika (check:run job) aktif monitörleri tarar.

HTTP: Target URL'e HEAD veya GET isteği atar.

TCP: Target IP ve Port'a socket bağlantısı dener.

Docker: Docker Socket üzerinden container durumunu sorgular.

Sonuç (Latency, Status) MonitorCheck tablosuna yazılır.

B. Metric Collection
Sadece MonitorType.DOCKER olanlar için çalışır.

docker stats API'si üzerinden CPU ve RAM verisi çekilir.

ServerMetric tablosuna yazılır.

Performans Notu: Veriler Redis'te bufferlanıp toplu (batch) olarak DB'ye yazılabilir (High frequency write).

C. Alerting & Auto-Incident Logic
Her check sonrası ilgili monitörün AlertRule'ları kontrol edilir.

Örnek Senaryo: "API Latency > 2000ms" kuralı.

Eğer son 3 kontrolde (duration ayarı) bu eşik aşılmışsa:

AlertHistory kaydı açılır.

FAZ3-NOTIFY kullanılarak Admin'e email atılır.

Eğer kural CRITICAL ise: FAZ3-STATUS servisi çağrılır ve yeni bir "Major Outage" Incident'ı otomatik oluşturulur.

Değerler normale dönünce:

Alert resolve edilir ("Resolved" bildirimi gider).

İlgili Incident "Monitoring" veya "Resolved" statüsüne çekilir.

D. Data Retention
MonitorCheck ve ServerMetric verileri çok hızlı büyür.

Her gece çalışan bir job, 7 günden eski verileri siler (Pruning).

Gerekirse veriler özetlenerek (Hourly Average) saklanabilir (MVP dışı).

5. API ENDPOINTS
GET /api/admin/watch/monitors: Tüm monitörlerin anlık durumu.

GET /api/admin/watch/monitors/:id/metrics: Belirli bir aralıktaki metrik grafiği verisi.

POST /api/admin/watch/monitors: Yeni izleme ekle.

POST /api/admin/watch/rules: Yeni alarm kuralı ekle.

GET /api/admin/watch/alerts: Aktif ve geçmiş alarmlar.

6. FRONTEND BİLEŞENLERİ (UI)
HealthDashboard: Tüm sistemlerin yeşil/kırmızı ışıklarla gösterildiği ana ekran.

MetricCharts: Recharts kullanılarak çizilen CPU, RAM ve Latency çizgi grafikleri.

MonitorForm: "URL gir", "Kontrol Sıklığı Seç" gibi basit bir sihirbaz.

AlertRuleBuilder: "IF [CPU] [>] [90] FOR [5 min] THEN [CRITICAL]" şeklinde kural oluşturucu.

✅ KABUL KRİTERLERİ (DoD)
[ ] HTTP ve TCP check'ler çalışıyor ve loglanıyor.

[ ] Docker container metrikleri (CPU/RAM) çekilebiliyor.

[ ] Dashboard'da canlı grafikler görüntüleniyor.

[ ] Eşik değer (Threshold) aşılınca Alert kaydı oluşuyor.

[ ] Alert oluşunca Email bildirimi gidiyor.

[ ] Kritik alert durumunda FAZ3-STATUS sayfasında otomatik Incident oluşuyor.

[ ] 7 günden eski loglar otomatik temizleniyor.