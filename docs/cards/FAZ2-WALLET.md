# 💳 FAZ2-WALLET: Hyble Global Wallet System (MVP)

## 📋 META
| Alan | Değer |
|------|-------|
| Faz | 💰 FAZ 2: MONEY |
| Öncelik | 🔴 P0 (Blocker) |
| Durum | 🟧 Planlandı |
| Son Güncelleme | 2025-12-15 |
| Teknik Döküman | `docs/cards/FAZ2-WALLET.md` |

## 🔗 BAĞIMLILIKLAR

### Prerequisites (Bu modül için gerekenler):
- [x] FAZ1-IAM (User ve Organization modelleri)
- [ ] FAZ1-EMAIL (İşlem bildirimleri için)

### Dependents (Bu modülü bekleyenler):
- **FAZ2-BILLING:** Ödeme sonrası deposit tetikler
- **FAZ2-CART:** Checkout'ta bakiye kullanımı
- **FAZ3-CLOUD:** Servis satın alımında bakiye düşme

## ⚠️ ÇAKIŞMA ÖNLEMİ (CONFLICT RULES)

| Dosya/Klasör | Sorumlu | Diğeri Dokunmasın |
|--------------|---------|-------------------|
| `packages/db/prisma/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/server/routers/wallet.ts` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/lib/services/wallet/` | 🟣 Claude | ❌ Gemini |
| `apps/hyble-panel/src/components/wallet/` | 🔵 Gemini | ❌ Claude |
| `apps/hyble-panel/src/app/dashboard/wallet/` | 🔵 Gemini | ❌ Claude |

## 📊 İLERLEME TAKİBİ

| Bölüm | Sorumlu | Görev | Tamamlanan |
|-------|---------|-------|:----------:|
| Database Schema | 🟣 Claude | 7 model | ⬜ 0/7 |
| Wallet Service | 🟣 Claude | 5 fonksiyon | ⬜ 0/5 |
| API Endpoints | 🟣 Claude | 6 endpoint | ⬜ 0/6 |
| Wallet Components | 🔵 Gemini | 6 component | ⬜ 0/6 |
| Wallet Pages | 🔵 Gemini | 3 sayfa | ⬜ 0/3 |

## 1. GENEL BAKIŞ
Hyble Wallet, hem bireysel (B2C) hem de kurumsal (B2B) müşterilerin bakiye yükleyip harcayabileceği, promosyon ve bonusları yönetebileceği merkezi finansal motordur. Bu fazda ödeme alma (Stripe) işlemi değil, bakiyenin tutulması, harcanması ve yönetilmesi (Internal Ledger) hedeflenmektedir.

## 2. KAPSAM (MVP)
### ✅ Dahil Olanlar
* **Bakiye Tipleri:** Ana Bakiye, Bonus, Promo.
* **Hesap Türleri:** Bireysel ve Kurumsal Cüzdanlar.
* **Harcama Motoru:** Promo → Bonus → Main öncelik sırası.
* **Teşvikler:** Bonus Tier sistemi ve Voucher (Kupon) altyapısı.
* **Para Birimi:** Taban EUR, gösterim opsiyonel (TRY, USD).

### ❌ Dahil Olmayanlar (Sonraki Fazlar)
* **Stripe Entegrasyonu:** (FAZ2-BILLING)
* **Credit Line (Veresiye/Postpaid):** (FAZ 5 - Enterprise)
* **Detaylı Bütçe & Onay Mekanizması:** (FAZ 6 - Enterprise Advanced)

## 3. VERİTABANI ŞEMASI (PRISMA)

```prisma
// schema.prisma

enum BalanceType {
  MAIN
  BONUS
  PROMO
}

enum TransactionType {
  DEPOSIT         // Para Yükleme
  WITHDRAWAL      // Para Çekme (İade)
  PURCHASE        // Harcama
  REFUND          // İade Alma
  TRANSFER        // Transfer (Org içi)
  BONUS_ADDED     // Bonus Kazanımı
  PROMO_ADDED     // Promo Tanımlama
  EXPIRED         // Süre Dolumu
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}

enum WalletStatus {
  ACTIVE
  FROZEN
  SUSPENDED
}

model Wallet {
  id              String   @id @default(cuid())
  
  // Sahiplik (Biri dolu olmak zorunda)
  userId          String?  @unique
  organizationId  String?  @unique
  
  // Bakiyeler (Decimal: Hassas finansal veri)
  mainBalance     Decimal  @default(0) @db.Decimal(10, 2)
  bonusBalance    Decimal  @default(0) @db.Decimal(10, 2)
  promoBalance    Decimal  @default(0) @db.Decimal(10, 2)
  
  currency        String   @default("EUR")
  status          WalletStatus @default(ACTIVE)
  
  // İlişkiler
  transactions    WalletTransaction[]
  bonuses         WalletBonus[]
  promos          WalletPromo[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([organizationId])
}

model WalletTransaction {
  id              String            @id @default(cuid())
  walletId        String
  wallet          Wallet            @relation(fields: [walletId], references: [id])
  
  type            TransactionType
  amount          Decimal           @db.Decimal(10, 2)
  balanceType     BalanceType       // Hangi bakiyeyi etkiledi
  
  status          TransactionStatus @default(COMPLETED)
  
  // Metadata
  description     String?
  metadata        Json?             // { ip: "...", userAgent: "..." }
  platform        String            @default("hyble") // hyble | mineble
  
  // Referanslar
  referenceType   String?           // "order", "refund", "manual_adjustment"
  referenceId     String?
  
  // Snapshot (Denetim için işlem sonrası bakiye)
  balanceAfter    Decimal           @db.Decimal(10, 2)
  
  createdAt       DateTime          @default(now())
  
  @@index([walletId])
  @@index([referenceType, referenceId])
}

model WalletBonus {
  id              String    @id @default(cuid())
  walletId        String
  wallet          Wallet    @relation(fields: [walletId], references: [id])
  
  transactionId   String?   // Hangi yüklemeden geldiği
  amount          Decimal   @db.Decimal(10, 2)
  remaining       Decimal   @db.Decimal(10, 2)
  
  expiresAt       DateTime  // Genelde 6 ay
  createdAt       DateTime  @default(now())
}

model WalletPromo {
  id              String    @id @default(cuid())
  walletId        String
  wallet          Wallet    @relation(fields: [walletId], references: [id])
  
  type            String    // "COMPENSATION", "WELCOME"
  amount          Decimal   @db.Decimal(10, 2)
  remaining       Decimal   @db.Decimal(10, 2)
  
  reason          String?
  createdById     String?   // Ekleyen admin
  
  expiresAt       DateTime
  createdAt       DateTime  @default(now())
}

model BonusTier {
  id              String    @id @default(cuid())
  minAmount       Decimal   @db.Decimal(10, 2)
  maxAmount       Decimal?  @db.Decimal(10, 2)
  
  bonusPercentage Int       @default(0) // %10 için 10
  bonusFixed      Decimal   @default(0) @db.Decimal(10, 2)
  
  isActive        Boolean   @default(true)
}

model Voucher {
  id              String    @id @default(cuid())
  code            String    @unique
  
  type            String    // "FIXED", "PERCENTAGE"
  value           Decimal   @db.Decimal(10, 2)
  
  usageLimit      Int?      // Toplam kaç kere kullanılabilir
  usageCount      Int       @default(0)
  
  minAmount       Decimal?  @db.Decimal(10, 2) // Min sepet tutarı
  targetAudience  String?   // "NEW_USER", "ENTERPRISE", null=ALL
  
  isActive        Boolean   @default(true)
  expiresAt       DateTime?
  
  createdById     String
  createdAt       DateTime  @default(now())
  
  usages          VoucherUsage[]
}

model VoucherUsage {
  id              String   @id @default(cuid())
  voucherId       String
  voucher         Voucher  @relation(fields: [voucherId], references: [id])
  
  userId          String
  walletId        String
  amount          Decimal  @db.Decimal(10, 2) // Kazanılan tutar
  
  usedAt          DateTime @default(now())
  
  @@unique([voucherId, userId])
}
4. İŞ MANTIĞI (BUSINESS LOGIC)
A. Harcama Önceliği (Spending Priority)
Kullanıcı bir hizmet satın aldığında sistem şu sırayla bakiyeyi düşer:

Promo Bakiye: Süresi en yakın dolacak olanlar önce harcanır.

Bonus Bakiye: Süresi en yakın dolacak olanlar önce harcanır.

Main (Ana) Bakiye: En son gerçek para kullanılır.

B. Bonus Tier Sistemi
Kullanıcı yükleme yaparken (UI simülasyonu) aşağıdaki tabloya göre bonus hesaplanır:

50€ - 99€ arası: +5€ Sabit

100€ - 249€ arası: +12€ Sabit

250€ - 499€ arası: +40€ Sabit

500€ ve üzeri: +100€ Sabit

C. Para Birimi
Tüm veritabanı kayıtları EUR olarak tutulur.

Frontend'de kullanıcı TRY veya USD seçerse, sistemde tanımlı sabit bir kur çarpanı ile çarpılarak sadece gösterim yapılır.

5. API ENDPOINTS
Wallet Core
GET /api/wallet: Kullanıcının cüzdan özetini döner.

GET /api/wallet/transactions: İşlem geçmişi (Pagination + Filter).

POST /api/wallet/spend: (Internal Use Only) Servislerin bakiye düşmesi için.

POST /api/wallet/deposit: (Simülasyon veya Callback) Bakiye ekleme.

Voucher
POST /api/wallet/voucher/validate: Kod geçerliliğini kontrol eder.

POST /api/wallet/voucher/redeem: Kodu kullanır ve bakiyeyi yükler.

Admin
POST /api/admin/wallet/credit: Kullanıcıya manuel kredi ekle.

POST /api/admin/wallet/debit: Kullanıcıdan manuel kredi sil.

6. FRONTEND BİLEŞENLERİ (UI)
WalletCard: 3 parçalı (Main/Bonus/Promo) ilerleme çubuğu ile bakiye gösterimi.

TransactionList: Tarih, İşlem Tipi, Tutar, Durum içeren tablo.

DepositModal: Tutar girişi ve Bonus Tier kartlarının seçimi.

WalletSettings: Para birimi değiştirme ayarı.

✅ KABUL KRİTERLERİ (DoD)
[ ] Wallet oluşturma otomatik (User/Org create sonrası)

[ ] Harcama önceliği doğru çalışıyor (Promo → Bonus → Main)

[ ] Negatif bakiye oluşmuyor (edge case test)

[ ] Voucher kodu geçerli/geçersiz feedback veriyor

[ ] İşlem geçmişi filtreleme ve pagination çalışıyor

[ ] Para birimi gösterimi kullanıcı tercihine göre değişiyor

[ ] Admin manuel kredi ekleme/silme audit log'a düşüyor

// User modeline ekle:
model User {
  // ... mevcut field'lar ...
  wallet          Wallet?
}


Cross-Module Relations:
// Organization modeline ekle:
model Organization {
  // ... mevcut field'lar ...
  wallet          Wallet?
}
```