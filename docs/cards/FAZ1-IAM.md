# 🔐 FAZ1-IAM: Hyble ID (Identity & Access Management)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 🚀 FAZ 1: BEDROCK |
| Öncelik | 🔴 P0 (Blocker) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ1-IAM.md` |

---

## 🎯 MODÜL AMACI
Kullanıcıların güvenli kaydını, B2B organizasyon yönetimini ve "Progressive Trust" (Kademeli Güven) modeline dayalı güvenlik altyapısını sağlar.

---

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] Turborepo monorepo kurulumu
- [x] PostgreSQL bağlantısı (DATABASE_URL)
- [ ] Resend API key (RESEND_API_KEY)
- [ ] Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] Discord OAuth credentials (DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET)
- [ ] Cloudflare Turnstile keys (NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY)

### Dependents (Bu modülü bekleyenler):
- **FAZ1-LANDING:** Header'da login/register/dashboard butonları.
- **FAZ1-EMAIL:** Doğrulama ve şifre sıfırlama mailleri.
- **FAZ2-WALLET:** Kullanıcı ID olmadan cüzdan oluşturulamaz.
- **FAZ2-BILLING:** Kullanıcı ve Org verisi olmadan fatura kesilemez.
- **FAZ3-CLOUD:** Auth olmadan panel erişimi engellidir.

---

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/app/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/settings/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/components/` | 🔵 Gemini | ❌ Claude |
| `packages/ui/` | 🔵 Gemini | ❌ Claude |

**Paylaşılan Alan (Dikkatli!):**
- `packages/api/src/types/` → Önce Claude tanımlar, Gemini kullanır

---

## 👥 GÖREV DAĞILIMI

### 🟣 CLAUDE CODE (Backend)
*Çalışma Alanı: `packages/db`, `apps/hyble-panel/src/server`*

1. **DATABASE:** Prisma şemasını oluştur ve migrate et.
2. **AUTH API:** Register, Login, OAuth, Verify, Reset endpoint'leri.
3. **SECURITY:** 2FA mantığı, Brute Force koruması, Session yönetimi.
4. **ADMIN API:** Org oluşturma, Banlama, Impersonation.

### 🔵 GEMINI VS CODE (Frontend)
*Çalışma Alanı: `apps/hyble-panel/src/components`, `apps/hyble-panel/src/app`*

1. **AUTH UI:** Login, Register, Forgot Password formları ve sayfaları.
2. **SETTINGS UI:** Profil, Avatar, Güvenlik Merkezi, Session listesi.
3. **ORG UI:** Organizasyon oluşturma, Davet etme, Üye listesi.

---

## 📐 TEKNİK DETAYLAR: DATABASE SCHEMA

Aşağıdaki şema `packages/db/prisma/schema.prisma` dosyasına uygulanacaktır.
```prisma
// ═══════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════

enum UserStatus {
  ACTIVE
  SUSPENDED
  FROZEN
  PENDING_DELETION
}

enum TrustLevel {
  GUEST           // Level 0: Onaysız
  VERIFIED        // Level 1: Email onaylı
  SECURE          // Level 2: 2FA aktif
  CORPORATE       // Level 3: Vergi no onaylı
}

enum OrgRole {
  OWNER
  ADMIN
  MANAGER
  MEMBER
  BILLING
  VIEWER
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
  CANCELLED
}

// ═══════════════════════════════════════
// USER & PROFILE (CORE)
// ═══════════════════════════════════════

model User {
  id                  String          @id @default(cuid())
  email               String          @unique
  passwordHash        String?         // Argon2
  emailVerified       Boolean         @default(false)
  emailVerifiedAt     DateTime?
  status              UserStatus      @default(ACTIVE)
  trustLevel          TrustLevel      @default(GUEST)
  phoneNumber         String?
  phoneVerified       Boolean         @default(false)
  
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  // Relations
  profile             UserProfile?
  addresses           UserAddress[]
  sessions            Session[]
  organizations       OrganizationMember[]
  ownedOrganizations  Organization[]  @relation("OrgOwner")
  securityLogs        SecurityLog[]
  twoFactorAuth       TwoFactorAuth?
  backupCodes         BackupCode[]
  oauthConnections    OAuthConnection[]
  trustedDevices      TrustedDevice[]
  apiKeys             ApiKey[]
  emailLogs           EmailLog[]      // FAZ1-EMAIL bağlantısı
}

model UserProfile {
  id                  String          @id @default(cuid())
  userId              String          @unique
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  firstName           String?
  lastName            String?
  avatar              String?
  language            String          @default("tr")
  timezone            String          @default("Europe/Istanbul")
  dateFormat          String          @default("DD/MM/YYYY")
  
  updatedAt           DateTime        @updatedAt
}

model UserAddress {
  id                  String          @id @default(cuid())
  userId              String
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type                String          // home, work, billing
  title               String
  line1               String
  line2               String?
  city                String
  state               String?
  country             String
  postalCode          String
  isDefault           Boolean         @default(false)
  
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
}

// ═══════════════════════════════════════
// ORGANIZATION (B2B)
// ═══════════════════════════════════════

model Organization {
  id                  String          @id @default(cuid())
  ownerId             String
  owner               User            @relation("OrgOwner", fields: [ownerId], references: [id])
  
  name                String
  slug                String          @unique
  taxId               String?
  vatNumber           String?
  vatVerified         Boolean         @default(false)
  
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  members             OrganizationMember[]
  invites             OrganizationInvite[]
  apiKeys             ApiKey[]
}

model OrganizationMember {
  id                  String          @id @default(cuid())
  organizationId      String
  organization        Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId              String
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role                OrgRole         @default(MEMBER)
  joinedAt            DateTime        @default(now())

  @@unique([organizationId, userId])
}

model OrganizationInvite {
  id                  String          @id @default(cuid())
  organizationId      String
  organization        Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  email               String
  role                OrgRole         @default(MEMBER)
  token               String          @unique
  expiresAt           DateTime
  status              InviteStatus    @default(PENDING)

  @@unique([organizationId, email])
}

// ═══════════════════════════════════════
// SECURITY & AUTH
// ═══════════════════════════════════════

model Session {
  id                  String          @id @default(cuid())
  userId              String
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  token               String          @unique
  ip                  String
  userAgent           String?
  device              String?
  location            String?
  expiresAt           DateTime
  lastActivity        DateTime        @default(now())
  createdAt           DateTime        @default(now())
  
  @@index([userId])
  @@index([token])
}

model OAuthConnection {
  id                  String          @id @default(cuid())
  userId              String
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  provider            String          // google, discord
  providerId          String
  email               String?
  username            String?
  avatar              String?
  accessToken         String?
  refreshToken        String?
  createdAt           DateTime        @default(now())
  
  @@unique([provider, providerId])
  @@unique([userId, provider])
}

model TwoFactorAuth {
  id                  String          @id @default(cuid())
  userId              String          @unique
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  method              String          @default("totp")
  secret              String          // Encrypted
  enabled             Boolean         @default(false)
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  
  backupCodes         BackupCode[]    // ✅ Relation eklendi
}

model BackupCode {
  id                  String          @id @default(cuid())
  userId              String
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  twoFactorId         String
  twoFactor           TwoFactorAuth   @relation(fields: [twoFactorId], references: [id], onDelete: Cascade)
  
  codeHash            String
  used                Boolean         @default(false)
  usedAt              DateTime?
  createdAt           DateTime        @default(now())
}

model SecurityLog {
  id                  String          @id @default(cuid())
  userId              String
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  action              String          // login, logout, password_change, 2fa_enable
  ip                  String
  userAgent           String?
  device              String?
  status              String          // success, failed
  details             Json?
  createdAt           DateTime        @default(now())

  @@index([userId, createdAt])
}

model LoginAttempt {
  id                  String          @id @default(cuid())
  email               String
  ip                  String
  userAgent           String?
  success             Boolean
  failReason          String?
  createdAt           DateTime        @default(now())
  
  @@index([email, createdAt])
  @@index([ip, createdAt])
}

model TrustedDevice {
  id                  String          @id @default(cuid())
  userId              String
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  fingerprint         String
  name                String
  lastUsed            DateTime        @default(now())
  expiresAt           DateTime
  createdAt           DateTime        @default(now())
  
  @@unique([userId, fingerprint])
}

model ApiKey {
  id                  String          @id @default(cuid())
  userId              String?
  user                User?           @relation(fields: [userId], references: [id], onDelete: Cascade)
  organizationId      String?
  organization        Organization?   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  name                String
  keyHash             String          @unique
  keyPrefix           String
  scopes              String[]
  ipWhitelist         String[]
  expiresAt           DateTime?
  lastUsed            DateTime?
  createdAt           DateTime        @default(now())
}
```

---

## 🔌 API ENDPOINT STRUCTURE (tRPC)

`apps/hyble-panel/src/server/routers/auth.ts` içinde uygulanacak yapı:
```typescript
// ═══════════════════════════════════════
// AUTH ROUTER
// ═══════════════════════════════════════

auth.register
  Type: publicProcedure.mutation
  Input: {
    email: string (email format)
    password: string (min 8, 1 uppercase, 1 number)
    name?: string
    turnstileToken: string
  }
  Output: {
    success: boolean
    userId: string
    message: string
  }
  Errors: 
    - EMAIL_ALREADY_EXISTS
    - INVALID_TURNSTILE
    - WEAK_PASSWORD
  Side Effects:
    - Verification email gönderilir (Resend)
    - SecurityLog kaydı oluşur (action: "register")

auth.login
  Type: publicProcedure.mutation
  Input: {
    email: string
    password: string
    code?: string (2FA code)
    turnstileToken: string
  }
  Output: {
    success: boolean
    requires2FA?: boolean
    sessionToken?: string
  }
  Errors:
    - INVALID_CREDENTIALS
    - ACCOUNT_LOCKED (Brute force)
    - INVALID_2FA_CODE
  Side Effects:
    - LoginAttempt kaydı oluşur
    - Başarılı ise Session oluşturulur (HttpOnly Cookie)

auth.verifyEmail
  Type: publicProcedure.mutation
  Input: { token: string }
  Output: { success: boolean }
  Side Effects:
    - User.emailVerified = true
    - User.trustLevel = VERIFIED

auth.requestPasswordReset
  Type: publicProcedure.mutation
  Input: { email: string }
  Output: { success: boolean, message: string }
  Side Effects:
    - Reset token oluşturulur (15dk geçerli)
    - Email gönderilir
  Notes:
    - Kullanıcı bulunamasa bile aynı mesaj dön (güvenlik)

auth.resetPassword
  Type: publicProcedure.mutation
  Input: { token: string, newPassword: string }
  Output: { success: boolean }
  Side Effects:
    - User.passwordHash güncellenir
    - SecurityLog kaydı (action: "password_reset")
    - Tüm oturumlar sonlandırılır

auth.googleOAuth
  Type: publicProcedure.mutation
  Input: { code: string, state: string }
  Output: { success: boolean, sessionToken: string, isNewUser: boolean }
  Side Effects:
    - OAuthConnection oluşturulur/güncellenir
    - Yeni kullanıcı ise User + Profile oluşturulur
    - Mevcut email varsa Smart Merge

auth.discordOAuth
  Type: publicProcedure.mutation
  Input: { code: string, state: string }
  Output: { success: boolean, sessionToken: string, isNewUser: boolean }
  Side Effects:
    - OAuthConnection oluşturulur/güncellenir
    - Avatar Discord'dan çekilir

auth.setup2FA
  Type: protectedProcedure.mutation
  Input: { password: string } // Güvenlik için şifre doğrulama
  Output: { secret: string, qrCodeUrl: string, backupCodes: string[] }
  Side Effects:
    - TwoFactorAuth kaydı oluşur (enabled: false)
    - 10 adet BackupCode oluşturulur (hashli)

auth.verify2FA
  Type: protectedProcedure.mutation
  Input: { code: string }
  Output: { success: boolean }
  Side Effects:
    - TwoFactorAuth.enabled = true
    - User.trustLevel = SECURE
    - SecurityLog kaydı (action: "2fa_enable")

auth.useBackupCode
  Type: publicProcedure.mutation
  Input: { email: string, password: string, backupCode: string }
  Output: { success: boolean, sessionToken: string }
  Side Effects:
    - BackupCode.used = true, usedAt = now()
    - Session oluşturulur
    - SecurityLog kaydı (action: "backup_code_used")

// ═══════════════════════════════════════
// ORG ROUTER
// ═══════════════════════════════════════

org.create
  Type: protectedProcedure.mutation
  Input: { name: string, slug?: string, taxId?: string }
  Output: { orgId: string, slug: string }
  Side Effects:
    - Organization kaydı oluşur
    - Oluşturan OWNER rolüyle OrganizationMember'a eklenir

org.invite
  Type: protectedProcedure.mutation
  Input: { orgId: string, email: string, role: OrgRole }
  Output: { inviteId: string }
  Side Effects:
    - OrganizationInvite oluşturulur
    - Davet emaili gönderilir
  Auth: OWNER veya ADMIN rolü gerekli

org.acceptInvite
  Type: protectedProcedure.mutation
  Input: { token: string }
  Output: { success: boolean, orgSlug: string }
  Side Effects:
    - OrganizationMember oluşturulur
    - Invite.status = ACCEPTED

// ═══════════════════════════════════════
// ADMIN ROUTER
// ═══════════════════════════════════════

admin.impersonate
  Type: protectedProcedure.mutation
  Input: { userId: string }
  Output: { sessionToken: string }
  Auth: Super Admin only
  Side Effects:
    - Özel impersonation session oluşturulur
    - SecurityLog kaydı (action: "admin_impersonate")

admin.banUser
  Type: protectedProcedure.mutation
  Input: { userId: string, reason: string }
  Output: { success: boolean }
  Side Effects:
    - User.status = SUSPENDED
    - Tüm sessionlar sonlandırılır
    - SecurityLog kaydı
```

---

## 🖼️ FRONTEND COMPONENT TREE

`apps/hyble-panel/src/components/` klasör yapısı:
```
📁 apps/hyble-panel/src/components/
├── auth/
│   ├── LoginForm.tsx           # Email/Pass + 2FA input
│   ├── RegisterForm.tsx        # Kayıt formu + Validation
│   ├── OAuthButtons.tsx        # Google/Discord butonları
│   ├── PasswordStrengthMeter.tsx # Şifre gücü göstergesi
│   ├── TurnstileWidget.tsx     # Cloudflare widget wrapper
│   ├── TwoFactorForm.tsx       # 6 haneli kod girişi
│   └── BackupCodesDisplay.tsx  # Yedek kodları indirme UI
├── settings/
│   ├── ProfileForm.tsx         # Ad/Soyad güncelleme
│   ├── AvatarUpload.tsx        # Avatar yükleme/değiştirme
│   ├── SessionList.tsx         # Aktif oturumlar listesi
│   ├── SecurityScore.tsx       # Güvenlik skoru görselleştirmesi
│   └── TwoFactorSetup.tsx      # QR kod ve kurulum sihirbazı
└── org/
    ├── OrgSwitcher.tsx         # Header'da organizasyon seçici
    ├── CreateOrgForm.tsx       # Yeni org oluşturma
    ├── MemberList.tsx          # Üye tablosu ve yönetimi
    └── InviteForm.tsx          # E-posta ile davet
```

---

## ✅ KABUL KRİTERLERİ (DoD)

- [ ] Kullanıcı kayıt olabiliyor (email + password)
- [ ] Kayıt sonrası doğrulama emaili geliyor
- [ ] Yanlış şifrede "Email veya şifre hatalı" (jenerik) mesajı
- [ ] 5 hatalı girişte 5dk kilit, 10 hatalı girişte 30dk kilit
- [ ] 2FA aktifken login sırasında 6 haneli kod isteniyor
- [ ] Backup code ile giriş yapılabiliyor (tek kullanım)
- [ ] OAuth ile giriş yapıldığında avatar çekiliyor
- [ ] Aynı email ile OAuth + Password hesabı birleştirilebiliyor
- [ ] Organizasyon oluşturulabiliyor ve üye davet edilebiliyor
- [ ] Admin kullanıcı başka kullanıcı gibi görüntüleyebiliyor (impersonation)

---

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 14 model | ⬜ 0/14 |
| Auth API | 🟣 Claude | 10 endpoint | ⬜ 0/10 |
| Org API | 🟣 Claude | 3 endpoint | ⬜ 0/3 |
| Admin API | 🟣 Claude | 2 endpoint | ⬜ 0/2 |
| Security Logic | 🟣 Claude | 5 feature | ⬜ 0/5 |
| Auth Components | 🔵 Gemini | 7 component | ⬜ 0/7 |
| Settings Components | 🔵 Gemini | 5 component | ⬜ 0/5 |
| Org Components | 🔵 Gemini | 4 component | ⬜ 0/4 |