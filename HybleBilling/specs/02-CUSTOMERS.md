# 02 - Müşteri Yönetimi Spesifikasyonu

> **Modül:** @hyble/customers (extends @hyble/auth)
> **Öncelik:** P0 (MVP)
> **Tahmini Süre:** 2 hafta

---

## 1. GENEL BAKIŞ

Müşteri hesapları, kimlik doğrulama ve self-service portal yönetimi.

### 1.1 Temel Sorumluluklar
- Müşteri kaydı ve doğrulama
- Authentication (login, 2FA, SSO)
- Profil ve iletişim yönetimi
- Müşteri grupları
- Alt hesaplar (sub-accounts)
- Adres ve ödeme yöntemi

---

## 2. DATABASE SCHEMA

### 2.1 Customers (Müşteriler)

```prisma
model Customer {
  id              String          @id @default(cuid())
  
  // Hesap Bilgileri
  email           String          @unique
  emailVerified   Boolean         @default(false)
  emailVerifiedAt DateTime?
  
  // Şifre (hashed)
  passwordHash    String?
  
  // Temel Bilgiler
  firstName       String
  lastName        String
  companyName     String?
  
  // Vergi Bilgileri
  taxId           String?         // VAT number, TC Kimlik No, etc.
  taxExempt       Boolean         @default(false)
  
  // Para Birimi
  currencyCode    String          @default("USD")
  
  // Dil ve Bölge
  language        String          @default("en")
  timezone        String          @default("UTC")
  country         String?
  
  // Durum
  status          CustomerStatus  @default(PENDING)
  
  // Grup
  groupId         String?
  group           CustomerGroup?  @relation(fields: [groupId], references: [id])
  
  // Referans
  referralCode    String?         @unique
  referredBy      String?
  
  // Meta
  notes           String?         // Admin notları
  customFields    Json?           // Özel alanlar
  
  // İlişkiler
  contacts        Contact[]
  addresses       Address[]
  paymentTokens   PaymentToken[]
  services        Service[]
  invoices        Invoice[]
  tickets         Ticket[]
  sessions        Session[]
  activityLogs    ActivityLog[]
  
  // 2FA
  twoFactorEnabled Boolean        @default(false)
  twoFactorSecret  String?
  backupCodes      String[]       @default([])
  
  // Timestamps
  lastLoginAt     DateTime?
  lastLoginIp     String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([email])
  @@index([status])
  @@index([groupId])
}

enum CustomerStatus {
  PENDING       // Email doğrulama bekliyor
  ACTIVE        // Aktif
  SUSPENDED     // Askıya alınmış
  CLOSED        // Kapatılmış
}
```

### 2.2 Contacts (İletişim Kişileri)

```prisma
model Contact {
  id            String      @id @default(cuid())
  
  customerId    String
  customer      Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  // Bilgiler
  firstName     String
  lastName      String
  email         String
  phone         String?
  
  // Yetkilendirme
  permissions   ContactPermission[]
  
  // Login
  canLogin      Boolean     @default(false)
  passwordHash  String?
  
  // Durum
  isPrimary     Boolean     @default(false)
  isActive      Boolean     @default(true)
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@index([customerId])
  @@index([email])
}

enum ContactPermission {
  VIEW_SERVICES
  MANAGE_SERVICES
  VIEW_INVOICES
  PAY_INVOICES
  OPEN_TICKETS
  VIEW_TICKETS
  MANAGE_CONTACTS
  MANAGE_PROFILE
}
```

### 2.3 Addresses (Adresler)

```prisma
model Address {
  id            String      @id @default(cuid())
  
  customerId    String
  customer      Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  // Tip
  type          AddressType @default(BILLING)
  
  // Adres Bilgileri
  line1         String
  line2         String?
  city          String
  state         String?
  postalCode    String
  country       String      // ISO country code
  
  // Meta
  isDefault     Boolean     @default(false)
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@index([customerId])
}

enum AddressType {
  BILLING
  SHIPPING
  BOTH
}
```

### 2.4 Customer Groups (Müşteri Grupları)

```prisma
model CustomerGroup {
  id            String    @id @default(cuid())
  
  name          String    @unique
  description   String?
  
  // İndirim
  discountType  DiscountType?
  discountValue Decimal?  @db.Decimal(5, 2)
  
  // Ayarlar
  separateBilling Boolean @default(false) // Grup için ayrı faturalama
  
  customers     Customer[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### 2.5 Sessions (Oturumlar)

```prisma
model Session {
  id            String    @id @default(cuid())
  
  customerId    String
  customer      Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  // Token
  token         String    @unique
  
  // Cihaz Bilgileri
  userAgent     String?
  ipAddress     String?
  
  // Geçerlilik
  expiresAt     DateTime
  
  // Remember Me
  isRemembered  Boolean   @default(false)
  
  createdAt     DateTime  @default(now())
  lastActiveAt  DateTime  @default(now())
  
  @@index([customerId])
  @@index([token])
  @@index([expiresAt])
}
```

### 2.6 Activity Logs

```prisma
model ActivityLog {
  id            String    @id @default(cuid())
  
  customerId    String
  customer      Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  // Aktivite
  action        String    // login, password_change, service_order, etc.
  description   String?
  
  // Context
  resourceType  String?   // Invoice, Service, Ticket
  resourceId    String?
  
  // Meta
  ipAddress     String?
  userAgent     String?
  metadata      Json?
  
  createdAt     DateTime  @default(now())
  
  @@index([customerId])
  @@index([action])
  @@index([createdAt])
}
```

---

## 3. AUTHENTICATION

### 3.1 Login Flow

```typescript
// 1. Email + Password login
async function login(email: string, password: string, rememberMe: boolean) {
  // 1. Customer bul
  const customer = await db.customer.findUnique({ where: { email } });
  if (!customer) throw new AuthError('Invalid credentials');
  
  // 2. Status kontrolü
  if (customer.status !== 'ACTIVE') {
    if (customer.status === 'PENDING') throw new AuthError('Email not verified');
    throw new AuthError('Account suspended');
  }
  
  // 3. Şifre doğrula
  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) {
    await logFailedAttempt(email);
    throw new AuthError('Invalid credentials');
  }
  
  // 4. 2FA kontrolü
  if (customer.twoFactorEnabled) {
    return { requiresTwoFactor: true, tempToken: generateTempToken(customer.id) };
  }
  
  // 5. Session oluştur
  const session = await createSession(customer.id, rememberMe);
  
  // 6. Activity log
  await logActivity(customer.id, 'login');
  
  return { session, customer };
}
```

### 3.2 Two-Factor Authentication

```typescript
// 2FA Setup
async function setup2FA(customerId: string) {
  const secret = speakeasy.generateSecret({ name: 'Hyble' });
  
  await db.customer.update({
    where: { id: customerId },
    data: { twoFactorSecret: encrypt(secret.base32) }
  });
  
  return { 
    secret: secret.base32,
    qrCode: await QRCode.toDataURL(secret.otpauth_url)
  };
}

// 2FA Verify
async function verify2FA(customerId: string, code: string) {
  const customer = await db.customer.findUnique({ where: { id: customerId } });
  const secret = decrypt(customer.twoFactorSecret);
  
  const valid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code
  });
  
  if (!valid) throw new AuthError('Invalid 2FA code');
  return true;
}

// Backup Codes
function generateBackupCodes(): string[] {
  return Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}
```

### 3.3 Registration

```typescript
async function register(input: RegisterInput) {
  // 1. Email kontrolü
  const existing = await db.customer.findUnique({ where: { email: input.email } });
  if (existing) throw new Error('Email already registered');
  
  // 2. Şifre hash
  const passwordHash = await bcrypt.hash(input.password, 12);
  
  // 3. Customer oluştur
  const customer = await db.customer.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      companyName: input.companyName,
      country: input.country,
      status: 'PENDING',
      referralCode: generateReferralCode()
    }
  });
  
  // 4. Verification email gönder
  await sendVerificationEmail(customer);
  
  // 5. Activity log
  await logActivity(customer.id, 'registration');
  
  return customer;
}
```

### 3.4 Password Reset

```typescript
// Request reset
async function requestPasswordReset(email: string) {
  const customer = await db.customer.findUnique({ where: { email } });
  if (!customer) return; // Silent fail for security
  
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour
  
  await db.passwordReset.create({
    data: { customerId: customer.id, token, expiresAt }
  });
  
  await sendPasswordResetEmail(customer.email, token);
}

// Reset password
async function resetPassword(token: string, newPassword: string) {
  const reset = await db.passwordReset.findUnique({ where: { token } });
  
  if (!reset || reset.expiresAt < new Date()) {
    throw new Error('Invalid or expired token');
  }
  
  const passwordHash = await bcrypt.hash(newPassword, 12);
  
  await db.customer.update({
    where: { id: reset.customerId },
    data: { passwordHash }
  });
  
  await db.passwordReset.delete({ where: { id: reset.id } });
  
  // Tüm sessionları invalidate et
  await db.session.deleteMany({ where: { customerId: reset.customerId } });
}
```

---

## 4. API ENDPOINTS

### 4.1 Auth Endpoints

```typescript
// tRPC Router: authRouter

// Register
auth.register
  Input: { email, password, firstName, lastName, companyName?, country? }
  Output: { customer: Customer, message: string }

// Login
auth.login
  Input: { email, password, rememberMe? }
  Output: { session?, requiresTwoFactor?, tempToken? }

// Verify 2FA
auth.verify2FA
  Input: { tempToken, code }
  Output: { session: Session }

// Logout
auth.logout
  Input: {}
  Output: { success: boolean }

// Logout all devices
auth.logoutAll
  Input: {}
  Output: { count: number }

// Request password reset
auth.requestPasswordReset
  Input: { email }
  Output: { message: string }

// Reset password
auth.resetPassword
  Input: { token, newPassword }
  Output: { success: boolean }

// Verify email
auth.verifyEmail
  Input: { token }
  Output: { success: boolean }

// Resend verification
auth.resendVerification
  Input: { email }
  Output: { message: string }
```

### 4.2 Customer Endpoints (Client Area)

```typescript
// tRPC Router: customerRouter (self-service)

// Get profile
customer.getProfile
  Input: {}
  Output: Customer (with contacts, addresses)

// Update profile
customer.updateProfile
  Input: { firstName?, lastName?, companyName?, phone?, timezone?, language? }
  Output: Customer

// Change password
customer.changePassword
  Input: { currentPassword, newPassword }
  Output: { success: boolean }

// Change email
customer.changeEmail
  Input: { newEmail, password }
  Output: { message: string } // Verification required

// Setup 2FA
customer.setup2FA
  Input: {}
  Output: { secret: string, qrCode: string }

// Enable 2FA
customer.enable2FA
  Input: { code: string }
  Output: { backupCodes: string[] }

// Disable 2FA
customer.disable2FA
  Input: { code: string }
  Output: { success: boolean }

// Get sessions
customer.getSessions
  Input: {}
  Output: Session[]

// Revoke session
customer.revokeSession
  Input: { sessionId: string }
  Output: { success: boolean }

// Get activity log
customer.getActivityLog
  Input: { page?, limit? }
  Output: { logs: ActivityLog[], total: number }
```

### 4.3 Address Endpoints

```typescript
// tRPC Router: addressRouter

// List addresses
addresses.list
  Input: {}
  Output: Address[]

// Add address
addresses.add
  Input: { type, line1, line2?, city, state?, postalCode, country, isDefault? }
  Output: Address

// Update address
addresses.update
  Input: { id, ...partial fields }
  Output: Address

// Delete address
addresses.delete
  Input: { id }
  Output: { success: boolean }

// Set default
addresses.setDefault
  Input: { id }
  Output: Address
```

### 4.4 Contact Endpoints

```typescript
// tRPC Router: contactRouter

// List contacts
contacts.list
  Input: {}
  Output: Contact[]

// Add contact
contacts.add
  Input: { firstName, lastName, email, phone?, permissions, canLogin? }
  Output: Contact

// Update contact
contacts.update
  Input: { id, ...partial fields }
  Output: Contact

// Delete contact
contacts.delete
  Input: { id }
  Output: { success: boolean }

// Set primary
contacts.setPrimary
  Input: { id }
  Output: Contact
```

### 4.5 Admin Customer Endpoints

```typescript
// tRPC Router: adminCustomerRouter

// List customers
admin.customers.list
  Input: { status?, groupId?, search?, page?, limit?, sortBy?, sortOrder? }
  Output: { customers: Customer[], total: number }

// Get customer
admin.customers.get
  Input: { id }
  Output: Customer (full details)

// Create customer
admin.customers.create
  Input: { email, firstName, lastName, password?, ... }
  Output: Customer

// Update customer
admin.customers.update
  Input: { id, ...partial fields }
  Output: Customer

// Suspend customer
admin.customers.suspend
  Input: { id, reason? }
  Output: Customer

// Unsuspend customer
admin.customers.unsuspend
  Input: { id }
  Output: Customer

// Delete customer
admin.customers.delete
  Input: { id }
  Output: { success: boolean }

// Impersonate (login as customer)
admin.customers.impersonate
  Input: { id }
  Output: { session: Session, returnUrl: string }

// Send email
admin.customers.sendEmail
  Input: { id, subject, message }
  Output: { success: boolean }

// Merge customers
admin.customers.merge
  Input: { sourceId, targetId }
  Output: Customer

// Export customers
admin.customers.export
  Input: { format: 'csv' | 'xlsx', filters? }
  Output: { url: string }
```

---

## 5. SECURITY

### 5.1 Password Policy

```typescript
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: false,
  maxAge: 90, // days (optional)
  preventReuse: 5 // last N passwords
};

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters`);
  }
  // ... more validations
  
  return { valid: errors.length === 0, errors };
}
```

### 5.2 Rate Limiting

```typescript
// Login attempts
const loginRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,
  blockDuration: 30 * 60 * 1000 // 30 minutes
};

// API requests
const apiRateLimit = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100
};
```

### 5.3 Session Management

```typescript
const sessionConfig = {
  defaultExpiry: 24 * 60 * 60 * 1000, // 24 hours
  rememberMeExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxConcurrentSessions: 10,
  renewalThreshold: 60 * 60 * 1000 // Renew if < 1 hour left
};
```

---

## 6. EMAIL TEMPLATES

### 6.1 Verification Email
- Subject: "Verify your Hyble account"
- Content: Welcome message + verification link
- Expiry: 24 hours

### 6.2 Password Reset Email
- Subject: "Reset your Hyble password"
- Content: Reset link
- Expiry: 1 hour

### 6.3 Login Alert Email
- Subject: "New login to your Hyble account"
- Content: Device, IP, location, time
- Option to revoke session

### 6.4 2FA Enabled/Disabled
- Subject: "Two-factor authentication updated"
- Content: Confirmation + security tips

---

## 7. TASKS / CHECKLIST

### Phase 1: Core Auth (1. Hafta)
- [ ] Customer model
- [ ] Registration flow
- [ ] Email verification
- [ ] Login / Logout
- [ ] Session management
- [ ] Password reset

### Phase 2: Security (2. Hafta)
- [ ] 2FA (TOTP)
- [ ] Backup codes
- [ ] Rate limiting
- [ ] Activity logging
- [ ] Session listing/revocation
- [ ] IP tracking

### Phase 3: Profile Management
- [ ] Profile CRUD
- [ ] Address management
- [ ] Contact management (sub-users)
- [ ] Contact permissions
- [ ] Customer groups

### Phase 4: Admin Features
- [ ] Customer list/search
- [ ] Customer CRUD
- [ ] Suspend/unsuspend
- [ ] Impersonation
- [ ] Bulk actions
- [ ] Export

---

## 8. DEPENDENCIES

```json
{
  "bcrypt": "^5.x",
  "speakeasy": "^2.x",
  "qrcode": "^1.x",
  "zod": "^3.x",
  "jose": "^5.x"
}
```

---

**İlgili Dosyalar:**
- `packages/auth/src/`
- `packages/customers/src/`
- `apps/client/src/app/(auth)/`
- `apps/admin/src/app/customers/`
