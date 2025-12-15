# 🧠 FAZ4-HYLA: AI Chatbot & Smart Support Agent (MVP)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 🧠 FAZ 4: HYLA AI |
| Öncelik | 🔴 P0 (Blocker) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ4-HYLA.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ1-IAM (Kullanıcı tanıma ve session yönetimi)
- [x] FAZ3-SUPPORT (Human handoff durumunda ticket oluşturmak için)
- [x] FAZ3-NOTIFY (Kritik durumlarda admin/agent bildirimi için)

### Dependents (Bu modülü bekleyenler):
- **FAZ5-CRM:** Chat geçmişinin müşteri profiline işlenmesi.

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/database/prisma/` | 🟣 Claude | ❌ Gemini |
| `packages/api/src/routers/hyla/` | 🟣 Claude | ❌ Gemini |
| `packages/api/src/services/ai/` | 🟣 Claude | ❌ Gemini |
| `apps/web/components/hyla/` | 🔵 Gemini | ❌ Claude |
| `apps/web/app/(admin)/hyla/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 4 Model | ⬜ 0/4 |
| AI Service (Claude) | 🟣 Claude | Streaming | ⬜ 0/3 |
| KB Retrieval | 🟣 Claude | Search Logic | ⬜ 0/2 |
| Chat API | 🟣 Claude | 5 Endpoint | ⬜ 0/5 |
| Widget UI | 🔵 Gemini | 6 Bileşen | ⬜ 0/6 |
| Admin Pages | 🔵 Gemini | 2 Sayfa | ⬜ 0/2 |

## 1. GENEL BAKIŞ
Hyla, Hyble ekosisteminin 7/24 çalışan ilk destek hattıdır. Ziyaretçilerin ve kullanıcıların sorularını yanıtlar, basit sorunları çözer ve karmaşık durumlarda destek ekibine (FAZ3-SUPPORT) yönlendirme yapar. LLM (Large Language Model) gücüyle doğal dil işleme yeteneğine sahiptir.

## 2. KAPSAM (MVP)

### ✅ Dahil Olanlar (MVP)
- **Site Widget:** Sağ alt köşede yüzen ikon ve sohbet penceresi.
- **Streaming Yanıt:** Claude API kullanılarak harf harf akan yanıtlar (SSE).
- **RAG (Retrieval Augmented Generation):** Admin tarafından girilen Knowledge Base (SSS) makalelerinden bilgi çekip yanıtlama.
- **Intent Classification:** Kullanıcı niyetini anlama (Satış, Destek, Fatura).
- **Human Handoff:** "Temsilciye bağlanmak istiyorum" dendiğinde veya AI çözemediğinde Ticket oluşturma önerisi.
- **Conversation History:** Oturum bazlı sohbet geçmişi.
- **Multi-language:** TR/EN desteği (Kullanıcı diline göre otomatik).
- **Admin Yönetimi:** SSS ekleme/düzenleme ve sohbet loglarını izleme.
- **Rate Limiting:** IP/User bazlı spam koruması.

### ❌ Dahil Olmayanlar (FAZ 8'e Ertelenenler)
- Voice Support (Sesli yanıt/Speech-to-text)
- Proactive Chat (Kullanıcı sayfada takılınca otomatik açılma)
- Sentiment Analysis Dashboard (Duygu analizi raporları)
- Smart Suggestions for Agents (Destek ekibine yanıt önerisi)
- Conversation Summarization (Sohbet özeti çıkarma)
- CRM/Lead Entegrasyonu (Sohbetten lead yaratma)
- Custom Persona (Organizasyon bazlı özel bot eğitimi)
- Slack/Discord Bot Entegrasyonu

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// ENUMS
enum HylaRole { USER, ASSISTANT, SYSTEM }
enum HylaIntent { GENERAL, SUPPORT, BILLING, SALES, TECH }
enum ConversationStatus { ACTIVE, HANDOFF, CLOSED }

// 1. KNOWLEDGE BASE (RAG Source)
model HylaKnowledgeBase {
  id              String      @id @default(cuid())
  question        String      @db.Text
  answer          String      @db.Text
  tags            String[]    // ["billing", "setup"]
  language        String      @default("tr") // tr, en
  
  // Vector search için (Opsiyonel: pgvector kullanılamazsa text search)
  embedding       Unsupported("vector(1536)")? 
  
  isActive        Boolean     @default(true)
  viewCount       Int         @default(0)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

// 2. CONVERSATION
model HylaConversation {
  id              String      @id @default(cuid())
  
  userId          String?     // Logged in user
  // user         User?       @relation(fields: [userId], references: [id])
  
  sessionId       String?     // Guest user identifier
  
  status          ConversationStatus @default(ACTIVE)
  detectedIntent  HylaIntent?
  
  // Eğer ticket'a dönüştüyse
  ticketId        String?     // FAZ3-SUPPORT Ticket ID
  
  messages        HylaMessage[]
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([userId])
  @@index([sessionId])
}

// 3. MESSAGE
model HylaMessage {
  id              String      @id @default(cuid())
  conversationId  String
  conversation    HylaConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  role            HylaRole
  content         String      @db.Text
  
  // Metadata (kullanılan kaynaklar vb.)
  metadata        Json?       // { "sources": ["kb_id_1"] }
  
  feedback        HylaFeedback?
  
  createdAt       DateTime    @default(now())
  
  @@index([conversationId])
}

// 4. FEEDBACK
model HylaFeedback {
  id              String      @id @default(cuid())
  messageId       String      @unique
  message         HylaMessage @relation(fields: [messageId], references: [id], onDelete: Cascade)
  
  isPositive      Boolean
  comment         String?
  
  createdAt       DateTime    @default(now())
}
4. İŞ MANTIĞI (BUSINESS LOGIC)
A. RAG (Retrieval Augmented Generation) Akışı
User Input: Kullanıcı "Faturam neden yüksek geldi?" yazar.

Search: Sistem HylaKnowledgeBase tablosunda "fatura", "yüksek", "billing" kelimelerini veya vektör benzerliğini arar.

Context Construction: Bulunan en alakalı 3 makale alınır.

Prompt Engineering:

Plaintext

System: Sen Hyble asistanısın. Aşağıdaki bağlamı kullanarak cevap ver. Bilmiyorsan uydurma, destek ekibine yönlendir.
Context: [KB Makale 1], [KB Makale 2]
User: Faturam neden yüksek geldi?
Generation: Claude API'ye gönderilir ve yanıt stream edilir.

B. Human Handoff (İnsana Devir)
Bot şu durumlarda ConversationStatus'u HANDOFF yapar ve Ticket oluşturma önerisi sunar:

Kullanıcı açıkça "Müşteri temsilcisi", "İnsanla konuşmak istiyorum" derse.

Botun yanıtında "Üzgünüm, bunu anlayamadım" veya "Bilgim yok" pattern'i arka arkaya 2 kez tekrarlanırsa.

Tespit edilen niyet (Intent) "CRITICAL_TECH_ISSUE" ise.

Aksiyon:

Kullanıcıya: "Bu konu beni aşıyor, sizin için bir destek talebi oluşturmamı ister misiniz?"

Evet derse: FAZ3-SUPPORT servisi üzerinden sohbet geçmişini içeren bir Ticket oluşturulur.

C. Rate Limiting (Abuse Prevention)
Redis kullanılarak IP veya User ID bazlı limit uygulanır.

Limit: Dakikada 10 mesaj, Saatte 100 mesaj.

Limit aşımında: "Çok hızlı yazıyorsunuz, lütfen biraz bekleyin."

5. API ENDPOINTS
POST /api/hyla/chat: Mesaj gönder (SSE Streaming Response döner).

POST /api/hyla/feedback: Mesaja like/dislike ver.

GET /api/hyla/history: Mevcut oturumun geçmişini getir.

GET /api/admin/hyla/kb: KB listesi.

POST /api/admin/hyla/kb: Yeni KB makalesi ekle.

GET /api/admin/hyla/conversations: Tüm sohbet logları.

6. FRONTEND BİLEŞENLERİ (UI)
HylaWidget:

Launcher: Sağ altta yuvarlak ikon (Badge ile "Yardım lazım mı?").

Window: Başlık, mesaj alanı, input alanı.

Minimize/Close: Pencereyi küçültme.

ChatInterface:

MessageBubble: User (Sağ/Mavi), AI (Sol/Gri). Markdown render eder (Linkler, kod blokları).

TypingIndicator: "Hyla yazıyor..." animasyonu.

QuickReplies: Sohbet başında butonlar ("Fiyatlar", "Kurulum", "Destek").

AdminKBManager: Soru-cevap ekleme formu ve listesi.

✅ KABUL KRİTERLERİ (DoD)
[ ] Widget siteye eklendiğinde açılıp kapanabiliyor.

[ ] Kullanıcı sorusuna Claude API üzerinden streaming yanıt dönüyor.

[ ] Yanıtlar Knowledge Base verileriyle besleniyor (Alakasız cevap vermiyor).

[ ] Sohbet geçmişi (History) DB'de tutuluyor ve sayfayı yenileyince kaybolmuyor.

[ ] "Temsilciye bağlan" denildiğinde Ticket oluşturma akışı çalışıyor.

[ ] Çok hızlı mesaj atıldığında Rate Limit devreye giriyor.

[ ] Admin panelden yeni SSS (KB) eklenebiliyor.

[ ] TR ve EN sorulara uygun dilde yanıt veriyor.