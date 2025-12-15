# 🎫 FAZ3-SUPPORT: Destek ve Ticket Yönetim Sistemi (MVP)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | ⚙️ FAZ 3: SERVICE |
| Öncelik | 🟠 P1 (High) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ3-SUPPORT.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ1-IAM (User ve Admin yetkileri)
- [x] FAZ3-NOTIFY (Ticket güncellemelerinde mail gönderimi)

### Dependents (Bu modülü bekleyenler):
- **FAZ3-CLOUD:** Sunucu panelinden "Destek Al" butonu buraya yönlendirir.

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/support/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/support/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/components/support/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/dashboard/support/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-admin/src/app/support/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 8 Model | ⬜ 0/8 |
| Ticket Service | 🟣 Claude | 6 Fonksiyon | ⬜ 0/6 |
| Agent Service | 🟣 Claude | 4 Fonksiyon | ⬜ 0/4 |
| API Endpoints | 🟣 Claude | 15 Endpoint | ⬜ 0/15 |
| Frontend Customer | 🔵 Gemini | 8 Bileşen | ⬜ 0/8 |
| Frontend Admin | 🔵 Gemini | 10 Bileşen | ⬜ 0/10 |
| Pages | 🔵 Gemini | 5 Sayfa | ⬜ 0/5 |

## 1. GENEL BAKIŞ
Hyble müşterilerinin yaşadığı sorunları iletebileceği, destek ekibinin (Agent) bu sorunları takip edip çözebileceği merkezi helpdesk sistemidir. "Ticket" (Bilet) mantığıyla çalışır. Her talep benzersiz bir `TKT-XXXX` numarası alır ve yaşam döngüsü boyunca (New -> Open -> Resolved) takip edilir.

## 2. KAPSAM (MVP)

### ✅ Dahil Olanlar
- **Ticket Yönetimi:** Oluşturma, Yanıtlama, Durum Değiştirme, Kapatma.
- **Kategori Bazlı Yönlendirme:** Teknik, Fatura, Satış vb.
- **Dosya Eki:** Max 5 dosya, 10MB/dosya (R2 entegrasyonu).
- **SLA Takibi:** İlk yanıt (24s) ve Çözüm (72s) hedefleri.
- **Agent Rolleri:** Agent (Standart) ve Manager (Yönetici).
- **CSAT:** Ticket kapandığında basit memnuniyet anketi.
- **Bildirimler:** Tüm güncellemelerde e-posta bildirimi.

### ❌ Dahil Olmayanlar (Sonraki Fazlar)
- Discord Bot Entegrasyonu → FAZ 6
- Email Piping (Mail atınca ticket açılması) → FAZ 6
- Knowledge Base (SSS) Entegrasyonu → FAZ 5
- Live Chat → FAZ 5+
- Makrolar (Hazır Cevaplar) → FAZ 5

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// ENUMS
enum TicketStatus { NEW, OPEN, PENDING, RESOLVED, CLOSED }
enum TicketPriority { LOW, NORMAL, HIGH, CRITICAL }
enum AgentRole { AGENT, MANAGER }

// 1. KATEGORİLER
model TicketCategory {
  id              String      @id @default(cuid())
  nameTr          String
  nameEn          String
  slug            String      @unique
  icon            String?     // Lucide icon name
  description     String?
  defaultPriority TicketPriority @default(NORMAL)
  sortOrder       Int         @default(0)
  isActive        Boolean     @default(true)
  
  tickets         Ticket[]
  agentAssignments AgentCategoryAssignment[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// 2. SUPPORT AGENT
model SupportAgent {
  id              String      @id @default(cuid())
  userId          String      @unique
  // user         User        @relation(fields: [userId], references: [id])
  
  role            AgentRole   @default(AGENT)
  isAvailable     Boolean     @default(true)
  maxTickets      Int         @default(10)
  
  assignedTickets Ticket[]
  categoryAssignments AgentCategoryAssignment[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// 3. AGENT-CATEGORY REL
model AgentCategoryAssignment {
  id              String      @id @default(cuid())
  agentId         String
  agent           SupportAgent @relation(fields: [agentId], references: [id], onDelete: Cascade)
  categoryId      String
  category        TicketCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@unique([agentId, categoryId])
}

// 4. TICKET
model Ticket {
  id              String      @id @default(cuid())
  referenceNo     String      @unique // TKT-2024-00001
  
  userId          String
  // user         User        @relation(fields: [userId], references: [id])
  
  categoryId      String
  category        TicketCategory @relation(fields: [categoryId], references: [id])
  
  subject         String
  priority        TicketPriority @default(NORMAL)
  status          TicketStatus   @default(NEW)
  
  assignedAgentId String?
  assignedAgent   SupportAgent?  @relation(fields: [assignedAgentId], references: [id])
  
  // SLA
  slaFirstResponseAt DateTime?
  slaResolvedAt   DateTime?
  closedAt        DateTime?
  
  messages        TicketMessage[]
  attachments     TicketAttachment[]
  statusHistory   TicketStatusHistory[]
  csat            TicketCSAT?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([categoryId])
  @@index([assignedAgentId])
}

// 5. MESSAGE
model TicketMessage {
  id              String      @id @default(cuid())
  ticketId        String
  ticket          Ticket      @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  
  senderId        String      // User ID
  senderType      String      // "customer" | "agent"
  message         String      @db.Text
  
  attachments     TicketAttachment[]
  
  createdAt       DateTime    @default(now())
  
  @@index([ticketId, createdAt])
}

// 6. ATTACHMENT
model TicketAttachment {
  id              String      @id @default(cuid())
  ticketId        String
  ticket          Ticket      @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  messageId       String?
  message         TicketMessage? @relation(fields: [messageId], references: [id])
  
  fileName        String
  fileUrl         String
  fileSize        Int
  mimeType        String
  
  uploadedBy      String      // User ID
  
  createdAt       DateTime    @default(now())
  
  @@index([ticketId])
}

// 7. HISTORY
model TicketStatusHistory {
  id              String      @id @default(cuid())
  ticketId        String
  ticket          Ticket      @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  
  oldStatus       TicketStatus?
  newStatus       TicketStatus
  changedBy       String      // User ID
  note            String?
  
  createdAt       DateTime    @default(now())
  
  @@index([ticketId, createdAt])
}

// 8. CSAT
model TicketCSAT {
  id              String      @id @default(cuid())
  ticketId        String      @unique
  ticket          Ticket      @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  
  rating          Int         // 1-5
  comment         String?
  
  createdAt       DateTime    @default(now())
}
4. İŞ MANTIĞI (BUSINESS LOGIC)
A. Reference Number
Format: TKT-{YIL}-{SIRA} (Örn: TKT-2024-00156). Her yılın başında sayaç sıfırlanabilir.

B. Durum Geçişleri
NEW → OPEN: Agent ilk yanıtı verdiğinde otomatik.

OPEN → PENDING: Agent, müşteriden bilgi bekliyorsa manuel alır.

PENDING → OPEN: Müşteri yanıt verdiğinde otomatik.

OPEN → RESOLVED: Agent, sorunu çözdüğünü düşündüğünde.

RESOLVED → CLOSED: Müşteri onaylarsa VEYA 72 saat hareketsiz kalırsa.

CLOSED → OPEN: Müşteri 7 gün içinde tekrar yazarsa (Reopen).

C. SLA Hedefleri
İlk Yanıt: 24 saat içinde verilmelidir.

Çözüm: 72 saat içinde sunulmalıdır.

Hedefler aşıldığında admin panelinde ticket kırmızı renkle işaretlenir.

D. Renk Kodları (Frontend)
NEW: 🟡 Sarı

OPEN: 🔵 Mavi

PENDING: 🟠 Turuncu

RESOLVED: 🟢 Yeşil

CLOSED: ⚫ Gri

5. API ENDPOINTS
POST /api/tickets: Yeni ticket oluştur.

GET /api/tickets: Müşterinin ticketları.

GET /api/tickets/:id: Ticket detayı ve mesajlar.

POST /api/tickets/:id/messages: Mesaj gönder.

POST /api/admin/tickets/:id/status: (Admin) Durum değiştir.

POST /api/admin/tickets/:id/assign: (Admin) Ticket ata.

POST /api/tickets/:id/csat: CSAT puanı ver.

6. FRONTEND BİLEŞENLERİ (UI)
TicketWizard: Kategori seçimi -> Konu/Detay -> Dosya Ekleme adımları.

TicketConversation: WhatsApp benzeri chat görünümü. Müşteri sağda, Agent solda.

AdminTicketList: Filtrelenebilir tablo (Durum, Kategori, Öncelik).

TicketSidebar: (Admin) Müşteri bilgileri, SLA sayacı, Aksiyon butonları.

✅ KABUL KRİTERLERİ (DoD)
[ ] Müşteri ticket oluşturabiliyor (wizard ile).

[ ] Dosya yükleme (5 adet, 10MB) çalışıyor.

[ ] Agent ticketları filtreleyip görüntüleyebiliyor.

[ ] Mesajlaşma (chat view) sorunsuz çalışıyor.

[ ] Durum geçişleri (NEW -> OPEN -> RESOLVED) doğru çalışıyor.

[ ] Ticket kapatıldığında CSAT anketi çıkıyor.

[ ] SLA süreleri hesaplanıyor ve gecikmeler belirtiliyor.

[ ] Bildirimler (Email) FAZ3-NOTIFY üzerinden gidiyor.