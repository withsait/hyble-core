# 📧 FAZ1-EMAIL: Resend Email Infrastructure

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 🚀 FAZ 1: BEDROCK |
| Öncelik | 🔴 P0 (Blocker) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ1-EMAIL.md` |

---

## 🎯 MODÜL AMACI
Hyble ve Mineble ekosistemindeki kullanıcı iletişimini standartlaştırmak. E-postaların "Spam" kutusuna düşmesini engellemek (High Deliverability), modern HTML şablonları kullanmak ve tüm gönderim süreçlerini loglamak.

---

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] Turborepo kurulumu
- [ ] Resend Hesabı ve Onaylı Domain (`mail.hyble.co`)
- [ ] FAZ1-IAM (Kullanıcı veritabanı - Loglama için)

### Dependents (Bu modülü bekleyenler):
- **FAZ1-IAM:** Doğrulama ve Şifre Sıfırlama mailleri için.
- **FAZ2-BILLING:** Fatura gönderimi için.
- **FAZ6-SUPPORT:** Destek talebi bildirimleri için.

---

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/email.ts` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/email/` | 🟣 Claude | ❌ Gemini |
| `packages/email/` (Templates) | 🔵 Gemini | ❌ Claude |
| `apps/hyble-admin/src/app/emails/` | 🔵 Gemini | ❌ Claude |

---

## 👥 GÖREV DAĞILIMI

### 🟣 CLAUDE CODE (Backend)
*Çalışma Alanı: `apps/hyble-panel/src/server`, `packages/db`*

1.  **DATABASE:** `EmailLog` modelini oluştur ve User modeline bağla.
2.  **CORE SERVICE:** `apps/hyble-panel/src/lib/services/email.ts` içinde Resend wrapper yaz.
    * Hata yakalama (Try/Catch)
    * Development ortamında console.log'a basma (Maliyet tasarrufu)
3.  **WEBHOOKS:** Resend'den gelen (Bounced, Complained) eventleri işleyip `EmailLog` tablosunu güncelleyen endpoint.
4.  **RATE LIMIT:** Aynı kullanıcıya dakikada max X mail gönderim kısıtlaması.

### 🔵 GEMINI VS CODE (Frontend)
*Çalışma Alanı: `packages/email`*

1.  **REACT EMAIL:** `packages/email` klasöründe React Email projesini initialize et.
2.  **LAYOUT:** Ortak Header (Logo), Footer (Unsubscribe, Adres) bileşenlerini yap.
3.  **TEMPLATES:**
    * `welcome.tsx`: Hoş geldin, CTA butonu.
    * `verify-email.tsx`: Token linki içeren sade tasarım.
    * `reset-password.tsx`: Güvenlik uyarılı şifre sıfırlama.
    * `invoice-created.tsx`: Fatura özeti tablosu.
    * `ticket-reply.tsx`: Destek mesaj içeriği.
4.  **ADMIN UI:** Gönderilen maillerin listelendiği basit bir dashboard sayfası.

---

## 📐 TEKNİK DETAYLAR

### 1. Database Schema (Prisma)

```prisma
// ═══════════════════════════════════════
// EMAIL & LOGS
// ═══════════════════════════════════════

enum EmailStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  BOUNCED
  OPENED
  CLICKED
}

enum EmailType {
  VERIFICATION
  RESET_PASSWORD
  WELCOME
  INVOICE
  TICKET_REPLY
  MARKETING
  SYSTEM_ALERT
}

model EmailLog {
  id              String      @id @default(cuid())
  userId          String?
  user            User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  resendId        String?     // Resend tarafından dönen ID
  type            EmailType
  recipient       String      // user.email değişirse log bozulmasın diye static
  subject         String
  status          EmailStatus @default(PENDING)
  
  error           String?     // Hata mesajı varsa
  openedAt        DateTime?
  clickedAt       DateTime?
  sentAt          DateTime    @default(now())
  
  @@index([userId])
  @@index([resendId])
  @@index([recipient])
}

// User modeline eklenecek relation:
// model User {
//   ...
//   emailLogs EmailLog[]
// }
2. API Service Structure (Wrapper)
// apps/hyble-panel/src/lib/services/email.ts

interface SendEmailParams {
  to: string;
  type: EmailType;
  subject: string;
  template: React.ReactElement; // React Email component
  userId?: string;
}

export const sendEmail = async ({ to, type, subject, template, userId }: SendEmailParams) => {
  // 1. Log oluştur (PENDING)
  // 2. Resend API call
  // 3. Log güncelle (SENT veya FAILED)
  // 4. Return result
}
✅ KABUL KRİTERLERİ (DoD)
[ ] packages/email içinde npm run dev çalıştırıldığında şablonlar tarayıcıda görünüyor.

[ ] Gönderilen e-postalar Gmail ve Outlook'ta düzgün render oluyor (Dark mode uyumlu).

[ ] Her gönderim EmailLog tablosuna kayıt ediliyor.

[ ] Bounced (iletilemeyen) mailler veritabanında BOUNCED olarak işaretleniyor (Webhook).

[ ] User ID silinse bile email logları (SetNull) korunuyor.

[ ] Development ortamında gerçek mail atılmıyor, console'a basılıyor.

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 1 Model | ⬜ 0/1 |
| API Wrapper | 🟣 Claude | Send Logic | ⬜ 0/1 |
| Webhook | 🟣 Claude | Event Handler | ⬜ 0/1 |
| UI/Layout | 🔵 Gemini | Base Components | ⬜ 0/1 |
| Templates | 🔵 Gemini | 5 Templates | ⬜ 0/5 |