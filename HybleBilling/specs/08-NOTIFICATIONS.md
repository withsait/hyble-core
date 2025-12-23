# 08 - Bildirim Sistemi Spesifikasyonu

> **Modül:** @hyble/notifications
> **Öncelik:** P1
> **Tahmini Süre:** 1-2 hafta

---

## 1. DATABASE SCHEMA

```prisma
model EmailTemplate {
  id            String    @id @default(cuid())
  
  name          String    // customer_welcome, invoice_created
  slug          String    @unique
  
  // Content
  subject       String
  bodyHtml      String    @db.Text
  bodyText      String?   @db.Text
  
  // Type
  type          EmailType @default(TRANSACTIONAL)
  
  // Variables
  variables     String[]  // Available variables for this template
  
  isActive      Boolean   @default(true)
  
  // Localization
  translations  EmailTemplateTranslation[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum EmailType {
  TRANSACTIONAL
  MARKETING
  SYSTEM
}

model EmailTemplateTranslation {
  id          String        @id @default(cuid())
  templateId  String
  template    EmailTemplate @relation(fields: [templateId], references: [id])
  
  language    String        // en, tr, de
  subject     String
  bodyHtml    String        @db.Text
  bodyText    String?       @db.Text
  
  @@unique([templateId, language])
}

model EmailLog {
  id            String      @id @default(cuid())
  
  // Recipient
  recipientEmail String
  customerId    String?
  
  // Content
  templateSlug  String?
  subject       String
  
  // Status
  status        EmailStatus @default(PENDING)
  error         String?
  
  // Provider
  providerMessageId String?
  
  // Tracking
  openedAt      DateTime?
  clickedAt     DateTime?
  
  createdAt     DateTime    @default(now())
  sentAt        DateTime?
}

enum EmailStatus {
  PENDING
  SENT
  DELIVERED
  BOUNCED
  FAILED
}
```

---

## 2. EMAIL TEMPLATES

### 2.1 Default Templates

```typescript
const defaultTemplates = [
  // Auth
  'customer_welcome',
  'email_verification',
  'password_reset',
  'password_changed',
  'two_factor_enabled',
  'login_alert',
  
  // Billing
  'invoice_created',
  'invoice_reminder',
  'invoice_overdue',
  'invoice_paid',
  'payment_confirmation',
  'payment_failed',
  'refund_processed',
  
  // Services
  'service_welcome',
  'service_suspended',
  'service_unsuspended',
  'service_terminated',
  'service_renewal_reminder',
  
  // Domains
  'domain_registered',
  'domain_renewal_reminder',
  'domain_expired',
  'domain_transfer_initiated',
  'domain_transfer_complete',
  
  // Support
  'ticket_opened',
  'ticket_reply',
  'ticket_closed',
  
  // Admin
  'admin_new_order',
  'admin_fraud_alert',
  'admin_ticket_assigned',
];
```

### 2.2 Template Variables

```typescript
// Customer variables
const customerVariables = {
  '{customer.firstName}': 'First name',
  '{customer.lastName}': 'Last name',
  '{customer.email}': 'Email',
  '{customer.company}': 'Company name'
};

// Invoice variables
const invoiceVariables = {
  '{invoice.number}': 'Invoice number',
  '{invoice.total}': 'Total amount',
  '{invoice.dueDate}': 'Due date',
  '{invoice.link}': 'Payment link'
};

// Service variables
const serviceVariables = {
  '{service.name}': 'Service name',
  '{service.domain}': 'Domain',
  '{service.username}': 'Username',
  '{service.password}': 'Password',
  '{service.ip}': 'IP address'
};
```

---

## 3. NOTIFICATION CHANNELS

### 3.1 Email (Primary)

```typescript
interface EmailProvider {
  send(options: EmailOptions): Promise<SendResult>;
}

// Implementations
class SMTPProvider implements EmailProvider { }
class SendGridProvider implements EmailProvider { }
class PostmarkProvider implements EmailProvider { }
class ResendProvider implements EmailProvider { }
```

### 3.2 SMS (Optional)

```typescript
interface SMSProvider {
  send(phone: string, message: string): Promise<boolean>;
}

// Implementations
class TwilioProvider implements SMSProvider { }
class NexmoProvider implements SMSProvider { }
```

### 3.3 In-App Notifications

```prisma
model Notification {
  id          String   @id @default(cuid())
  
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  
  title       String
  message     String
  
  type        String   // info, warning, success, error
  
  // Link
  actionUrl   String?
  actionText  String?
  
  isRead      Boolean  @default(false)
  readAt      DateTime?
  
  createdAt   DateTime @default(now())
  
  @@index([customerId])
}
```

---

## 4. API ENDPOINTS

```typescript
// Email sending
notifications.sendEmail
  Input: { templateSlug, recipientEmail, customerId?, variables }
  Output: { success, messageId? }

// In-app notifications (client)
notifications.list
notifications.markRead
notifications.markAllRead
notifications.getUnreadCount

// Admin
admin.emailTemplates.list
admin.emailTemplates.get
admin.emailTemplates.update
admin.emailTemplates.preview
admin.emailTemplates.test

admin.emailLogs.list
admin.emailLogs.get
admin.emailLogs.resend
```

---

## 5. TASKS

- [ ] EmailTemplate model & seeding
- [ ] Email sending service
- [ ] SMTP provider
- [ ] Template rendering (Handlebars/React Email)
- [ ] Email logs
- [ ] In-app notifications
- [ ] Admin template editor
- [ ] Email preview/test
