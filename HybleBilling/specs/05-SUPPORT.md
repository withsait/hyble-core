# 05 - Destek Sistemi Spesifikasyonu

> **Modül:** @hyble/support
> **Öncelik:** P1
> **Tahmini Süre:** 2 hafta

---

## 1. DATABASE SCHEMA

### 1.1 Tickets

```prisma
model TicketDepartment {
  id          String   @id @default(cuid())
  name        String
  email       String?  // Piping için
  isHidden    Boolean  @default(false)
  sortOrder   Int      @default(0)
  tickets     Ticket[]
}

model Ticket {
  id            String         @id @default(cuid())
  ticketNumber  String         @unique // TKT-20250101-0001
  
  // Relations
  customerId    String
  customer      Customer       @relation(fields: [customerId], references: [id])
  departmentId  String
  department    TicketDepartment @relation(fields: [departmentId], references: [id])
  serviceId     String?        // İlişkili servis
  
  // Content
  subject       String
  
  // Status
  status        TicketStatus   @default(OPEN)
  priority      TicketPriority @default(MEDIUM)
  
  // Assignment
  assignedToId  String?
  assignedTo    AdminUser?     @relation(fields: [assignedToId], references: [id])
  
  // Flags
  isFlagged     Boolean        @default(false)
  
  // Timestamps
  lastReplyAt   DateTime?
  closedAt      DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  replies       TicketReply[]
  attachments   TicketAttachment[]
  
  @@index([customerId])
  @@index([status])
}

enum TicketStatus {
  OPEN
  CUSTOMER_REPLY
  AWAITING_REPLY
  IN_PROGRESS
  ON_HOLD
  CLOSED
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model TicketReply {
  id          String   @id @default(cuid())
  
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  
  // Author
  customerId  String?
  adminUserId String?
  
  content     String   @db.Text
  
  // Internal note
  isInternal  Boolean  @default(false)
  
  attachments TicketAttachment[]
  
  createdAt   DateTime @default(now())
  
  @@index([ticketId])
}

model TicketAttachment {
  id          String        @id @default(cuid())
  ticketId    String
  ticket      Ticket        @relation(fields: [ticketId], references: [id])
  replyId     String?
  reply       TicketReply?  @relation(fields: [replyId], references: [id])
  
  filename    String
  filepath    String
  filesize    Int
  mimetype    String
  
  createdAt   DateTime      @default(now())
}
```

### 1.2 Knowledgebase

```prisma
model KBCategory {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  description String?
  parentId    String?
  sortOrder   Int         @default(0)
  isHidden    Boolean     @default(false)
  articles    KBArticle[]
}

model KBArticle {
  id          String     @id @default(cuid())
  
  categoryId  String
  category    KBCategory @relation(fields: [categoryId], references: [id])
  
  title       String
  slug        String     @unique
  content     String     @db.Text
  
  // SEO
  metaTitle   String?
  metaDescription String?
  
  // Stats
  views       Int        @default(0)
  helpful     Int        @default(0)
  notHelpful  Int        @default(0)
  
  // Status
  isPublished Boolean    @default(false)
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

---

## 2. API ENDPOINTS

### 2.1 Ticket Endpoints

```typescript
// Client
tickets.list          // Müşteri ticketları
tickets.get           // Ticket detay
tickets.create        // Yeni ticket
tickets.reply         // Yanıt ekle
tickets.close         // Kapat
tickets.reopen        // Yeniden aç

// Admin
admin.tickets.list    // Tüm ticketlar (filtreli)
admin.tickets.get     // Detay
admin.tickets.reply   // Yanıt (+ internal note)
admin.tickets.assign  // Atama
admin.tickets.changeStatus
admin.tickets.changePriority
admin.tickets.changeDepartment
admin.tickets.merge   // Ticketları birleştir
admin.tickets.delete
```

### 2.2 Knowledgebase Endpoints

```typescript
// Public
kb.categories.list
kb.articles.list
kb.articles.get
kb.articles.search
kb.articles.vote     // Helpful/not helpful

// Admin
admin.kb.categories.create/update/delete
admin.kb.articles.create/update/delete/publish
```

---

## 3. FEATURES

### 3.1 Email Piping
- IMAP/POP3 bağlantısı
- Email → Ticket dönüşümü
- Reply email → Ticket reply
- Spam filtreleme

### 3.2 Canned Responses
```prisma
model CannedResponse {
  id          String   @id @default(cuid())
  name        String
  content     String   @db.Text
  categoryId  String?
  sortOrder   Int      @default(0)
}
```

### 3.3 Escalation Rules
```prisma
model EscalationRule {
  id            String   @id @default(cuid())
  name          String
  
  // Trigger
  triggerType   String   // time_since_open, time_since_reply
  triggerValue  Int      // hours
  
  // Conditions
  departments   String[] @default([])
  priorities    String[] @default([])
  
  // Actions
  actionType    String   // change_priority, assign, notify
  actionValue   Json
  
  isActive      Boolean  @default(true)
}
```

---

## 4. TASKS

- [ ] Ticket model & CRUD
- [ ] TicketReply
- [ ] File attachments
- [ ] Email piping (basic)
- [ ] Knowledgebase
- [ ] Canned responses
- [ ] Escalation rules
- [ ] Auto-close inactive tickets
