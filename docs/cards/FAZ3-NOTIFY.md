# 🔔 FAZ3-NOTIFY: Bildirim Merkezi (MVP)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | ⚙️ FAZ 3: SERVICE |
| Öncelik | 🟠 P1 (High) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ3-NOTIFY.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ1-IAM (User ve Organization modelleri)
- [x] FAZ1-EMAIL (Resend altyapısı - Email kanalı için)

### Dependents (Bu modülü bekleyenler):
- **FAZ3-STATUS:** Sistem kesinti bildirimleri için.
- **FAZ3-SUPPORT:** Ticket yanıt bildirimleri için.
- **FAZ3-CLOUD:** Sunucu kurulum/hata bildirimleri için.

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/notify/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/notify/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/components/notifications/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/settings/notifications/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/settings/webhooks/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 6 Model | ⬜ 0/6 |
| Notification Service | 🟣 Claude | 5 Fonksiyon | ⬜ 0/5 |
| Webhook Service | 🟣 Claude | 4 Fonksiyon | ⬜ 0/4 |
| Push Service | 🟣 Claude | 3 Fonksiyon | ⬜ 0/3 |
| API Endpoints | 🟣 Claude | 10 Endpoint | ⬜ 0/10 |
| Frontend Components | 🔵 Gemini | 8 Bileşen | ⬜ 0/8 |
| Pages | 🔵 Gemini | 3 Sayfa | ⬜ 0/3 |

## 1. GENEL BAKIŞ
FAZ3-NOTIFY, sistemdeki tüm modüllerin kullanıcılarla iletişim kurmasını sağlayan merkezi servistir. "Single Source of Truth" prensibiyle çalışır; yani bir fatura oluşturulduğunda Billing modülü doğrudan mail atmaz, Notify modülüne "Fatura Oluştu" eventi gönderir. Notify modülü, kullanıcının tercihlerine göre bu bildirimi Email, In-App veya Webhook olarak dağıtır.

## 2. KAPSAM (MVP)

### ✅ Dahil Olanlar
- **Çoklu Kanal:** Email (Resend), In-App (Panel), Web Push, Webhook (B2B).
- **Şablon Yönetimi:** Dinamik veri (variable substitution) destekli TR/EN şablonlar.
- **Tercih Yönetimi:** Kullanıcıların kanal bazında bildirimleri açıp kapatabilmesi.
- **B2B Webhooks:** Kurumsal müşterilerin kendi sistemlerini entegre edebilmesi.
- **Delivery Tracking:** Gönderim başarılı/başarısız durumlarının takibi.
- **Queue:** Yüksek trafiği yönetmek için asenkron gönderim yapısı.

### ❌ Dahil Olmayanlar (Sonraki Fazlar)
- SMS Bildirimleri → FAZ 5+
- Slack/Discord Entegrasyonu → FAZ 4
- Pazarlama Kampanya Sihirbazı → FAZ 5+
- A/B Testleri → FAZ 5+
- Rich Push (Görsel içeren push) → FAZ 4

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// ENUMS
enum NotificationChannel { EMAIL, IN_APP, PUSH, WEBHOOK }
enum NotificationStatus { PENDING, QUEUED, SENT, DELIVERED, FAILED, READ }
enum NotificationType { TRANSACTIONAL, SYSTEM, MARKETING }
enum NotificationPriority { LOW, NORMAL, HIGH, URGENT }

// 1. TEMPLATES
model NotificationTemplate {
  id              String      @id @default(cuid())
  code            String      @unique // örn: invoice_created, ticket_reply
  
  type            NotificationType
  priority        NotificationPriority @default(NORMAL)
  
  titleTr         String
  titleEn         String
  bodyTr          String      @db.Text // HTML veya Markdown destekli
  bodyEn          String      @db.Text
  
  supportedChannels NotificationChannel[] // Bu şablon hangi kanalları destekler
  
  isActive        Boolean     @default(true)
  
  notifications   Notification[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// 2. NOTIFICATIONS (LOGS)
model Notification {
  id              String      @id @default(cuid())
  
  userId          String
  // user         User        @relation(fields: [userId], references: [id])
  
  templateId      String?
  template        NotificationTemplate? @relation(fields: [templateId], references: [id])
  
  channel         NotificationChannel
  status          NotificationStatus @default(PENDING)
  
  title           String      // Render edilmiş başlık (Snapshot)
  body            String      @db.Text // Render edilmiş içerik (Snapshot)
  
  data            Json?       // Dinamik veriler (örn: { invoiceId: "123", amount: "100" })
  metadata        Json?       // Ekstra teknik veriler
  
  errorReason     String?     // Hata mesajı
  
  sentAt          DateTime?
  readAt          DateTime?   // Sadece IN_APP için
  
  createdAt       DateTime    @default(now())
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

// 3. PREFERENCES
model NotificationPreference {
  id              String      @id @default(cuid())
  
  userId          String
  // user         User        @relation(fields: [userId], references: [id])
  
  channel         NotificationChannel
  enabled         Boolean     @default(true)
  
  // Kategori bazlı filtreleme (Opsiyonel)
  categories      Json?       // { "transactional": true, "marketing": false }
  
  updatedAt       DateTime    @updatedAt
  
  @@unique([userId, channel])
}

// 4. WEBHOOKS (B2B)
model WebhookEndpoint {
  id              String      @id @default(cuid())
  
  organizationId  String
  // organization Organization @relation(fields: [organizationId], references: [id])
  
  url             String
  secret          String      // HMAC imzası için
  events          String[]    // ["invoice.paid", "ticket.created"]
  
  description     String?
  isActive        Boolean     @default(true)
  
  deliveries      WebhookDelivery[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([organizationId])
}

model WebhookDelivery {
  id              String      @id @default(cuid())
  
  endpointId      String
  endpoint        WebhookEndpoint @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  
  event           String
  payload         Json
  
  responseStatus  Int?
  responseBody    String?     @db.Text
  
  status          String      // "success", "failed"
  durationMs      Int?
  
  createdAt       DateTime    @default(now())
  
  @@index([endpointId])
}

// 5. PUSH SUBSCRIPTIONS
model PushSubscription {
  id              String      @id @default(cuid())
  
  userId          String
  // user         User        @relation(fields: [userId], references: [id])
  
  endpoint        String      @db.Text
  keys            Json        // { p256dh: "...", auth: "..." }
  
  userAgent       String?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([userId])
}
4. İŞ MANTIĞI (BUSINESS LOGIC)
A. Bildirim Gönderim Akışı
Trigger: NotificationService.send({ template: 'invoice_created', user: userId, data: {...} }) çağrılır.

Template Load: Şablon DB'den çekilir.

Preferences Check: Kullanıcının tercihleri kontrol edilir (Örn: Email açık mı?).

Render: Şablon, data verisi ile birleştirilerek render edilir (Handlebars veya benzeri).

Queue/Send:

IN_APP: Doğrudan DB'ye yazılır.

EMAIL: Resend API'ye istek atılır.

PUSH: Web Push kütüphanesi ile tarayıcıya gönderilir.

WEBHOOK: Organization webhookları taranır, eşleşen event varsa POST edilir.

Status Update: İşlem sonucu Notification tablosuna yazılır.

B. Webhook Güvenlik & Retry
İmza: Her webhook isteği X-Hyble-Signature header'ı içerir. Bu header, payload'un secret ile SHA256 HMAC hash'idir.

Retry: Eğer alıcı sunucu 2xx dönmezse, sistem 3 kez tekrar dener (Exponential backoff: 1dk, 5dk, 30dk).

C. Varsayılan Tercihler
Transactional (Fatura, Şifre Sıfırlama): Kullanıcı kapatamaz (Zorunlu).

System (Bakım, SLA): Varsayılan açık, kapatılabilir.

Marketing: Varsayılan kapalı (GDPR/KVKK gereği), kullanıcı açmalı.

5. API ENDPOINTS
GET /api/notifications: Kullanıcının panel bildirimlerini listeler.

POST /api/notifications/read: Bildirimleri okundu yapar.

GET /api/notifications/preferences: Kullanıcı tercihlerini getirir.

PUT /api/notifications/preferences: Tercihleri günceller.

POST /api/notifications/push/subscribe: Web push izni kaydeder.

GET /api/webhooks: Kurumsal webhook listesi.

POST /api/webhooks: Yeni webhook endpoint ekle.

POST /api/webhooks/:id/test: Webhook testi yap.

POST /api/admin/notifications/send: Admin manuel gönderim.

6. FRONTEND BİLEŞENLERİ (UI)
NotificationCenter: Header'da çan ikonu. Okunmamış sayısı badge olarak görünür. Tıklayınca son 5 bildirim listelenir.

NotificationList: Tüm bildirimlerin listelendiği sayfa. "Tümünü Okundu Yap" butonu.

WebhookEndpointForm: B2B müşterilerin URL ve Secret girdiği, hangi eventleri dinleyeceğini seçtiği form.

WebhookDeliveryLog: Webhook gönderimlerinin başarı durumunu ve response body'sini gösteren log tablosu.

✅ KABUL KRİTERLERİ (DoD)
[ ] In-App bildirimler Header'daki dropdown'a düşüyor.

[ ] In-App bildirimler okundu olarak işaretlenebiliyor.

[ ] Email bildirimleri Resend entegrasyonu ile gidiyor.

[ ] Kullanıcı panelden email/push tercihlerini değiştirebiliyor.

[ ] B2B kullanıcıları Webhook endpoint ekleyebiliyor.

[ ] Webhook gönderimleri HMAC ile imzalanıyor.

[ ] Başarısız Webhook'lar için retry mekanizması çalışıyor.

[ ] Admin panelden şablon seçerek toplu veya tekil bildirim atılabiliyor.

[ ] Şablonlarda TR/EN dil desteği çalışıyor.