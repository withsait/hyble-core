# 09 - Hyble Credits (Wallet) Spesifikasyonu

> **Modül:** @hyble/wallet
> **Öncelik:** P2
> **Tahmini Süre:** 2 hafta
> **Not:** Hyble-specific, WHMCS'de yok

---

## 1. GENEL BAKIŞ

Cross-vertical kullanılabilen ön ödemeli kredi sistemi.

### 1.1 Özellikler
- Credit satın alma (top-up)
- Fatura ödemesi
- Cross-vertical kullanım (B2B SaaS + Gaming)
- Auto top-up
- Gift credits
- Promotional credits

---

## 2. DATABASE SCHEMA

```prisma
model Wallet {
  id            String   @id @default(cuid())
  
  customerId    String   @unique
  customer      Customer @relation(fields: [customerId], references: [id])
  
  // Bakiye
  balance       Decimal  @db.Decimal(10, 2) @default(0)
  
  // Promotional balance (ayrı tutuluyor)
  promoBalance  Decimal  @db.Decimal(10, 2) @default(0)
  
  // Auto top-up
  autoTopUp     Boolean  @default(false)
  autoTopUpAmount Decimal? @db.Decimal(10, 2)
  autoTopUpThreshold Decimal? @db.Decimal(10, 2)
  autoTopUpPaymentTokenId String?
  
  transactions  WalletTransaction[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model WalletTransaction {
  id            String              @id @default(cuid())
  
  walletId      String
  wallet        Wallet              @relation(fields: [walletId], references: [id])
  
  // Tip
  type          WalletTransactionType
  
  // Tutar
  amount        Decimal             @db.Decimal(10, 2)
  balanceBefore Decimal             @db.Decimal(10, 2)
  balanceAfter  Decimal             @db.Decimal(10, 2)
  
  // İlişkili entity
  referenceType String?             // Invoice, Order, Gift, Promo
  referenceId   String?
  
  // Açıklama
  description   String?
  
  // Admin note
  adminNote     String?
  adminUserId   String?
  
  createdAt     DateTime            @default(now())
  
  @@index([walletId])
  @@index([createdAt])
}

enum WalletTransactionType {
  CREDIT        // Para yükleme (top-up)
  DEBIT         // Ödeme
  REFUND        // İade
  GIFT          // Hediye (başka müşteriden)
  PROMO         // Promosyon kredisi
  ADJUSTMENT    // Manuel düzeltme
  EXPIRY        // Süre dolumu (promo için)
}

model CreditPackage {
  id            String   @id @default(cuid())
  
  name          String
  
  // Tutar
  amount        Decimal  @db.Decimal(10, 2) // Ne kadar kredi
  price         Decimal  @db.Decimal(10, 2) // Ne kadar ödeme
  
  // Bonus
  bonusAmount   Decimal  @db.Decimal(10, 2) @default(0)
  
  // Para birimi
  currencyCode  String
  
  // Görünürlük
  isActive      Boolean  @default(true)
  isFeatured    Boolean  @default(false)
  
  sortOrder     Int      @default(0)
  
  createdAt     DateTime @default(now())
}

model PromoCredit {
  id            String   @id @default(cuid())
  
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  
  amount        Decimal  @db.Decimal(10, 2)
  usedAmount    Decimal  @db.Decimal(10, 2) @default(0)
  
  // Geçerlilik
  expiresAt     DateTime?
  
  // Kaynak
  source        String   // signup_bonus, referral, campaign_xxx
  
  createdAt     DateTime @default(now())
  
  @@index([customerId])
  @@index([expiresAt])
}
```

---

## 3. BUSINESS LOGIC

### 3.1 Credit Satın Alma

```typescript
async function purchaseCredits(
  customerId: string,
  packageId: string,
  paymentMethod: PaymentSource
): Promise<WalletTransaction> {
  const pkg = await db.creditPackage.findUnique({ where: { id: packageId } });
  const wallet = await getOrCreateWallet(customerId);
  
  // Payment process
  const payment = await processPayment({
    customerId,
    amount: pkg.price,
    currency: pkg.currencyCode,
    description: `Credit purchase: ${pkg.name}`,
    paymentMethod
  });
  
  if (!payment.success) {
    throw new Error('Payment failed');
  }
  
  // Add credits
  const totalCredits = pkg.amount.plus(pkg.bonusAmount);
  
  const transaction = await db.$transaction(async (tx) => {
    const txn = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amount: totalCredits,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance.plus(totalCredits),
        referenceType: 'Payment',
        referenceId: payment.id,
        description: `Purchased ${pkg.name}`
      }
    });
    
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: totalCredits } }
    });
    
    return txn;
  });
  
  return transaction;
}
```

### 3.2 Fatura Ödemesi (Credit ile)

```typescript
async function payInvoiceWithCredits(
  invoiceId: string,
  customerId: string
): Promise<{ success: boolean; remainingBalance: Decimal }> {
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  const wallet = await db.wallet.findUnique({ where: { customerId } });
  
  if (!wallet || wallet.balance.lt(invoice.balance)) {
    throw new Error('Insufficient credits');
  }
  
  await db.$transaction(async (tx) => {
    // Debit wallet
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEBIT',
        amount: invoice.balance.negated(),
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance.minus(invoice.balance),
        referenceType: 'Invoice',
        referenceId: invoice.id,
        description: `Payment for invoice ${invoice.invoiceNumber}`
      }
    });
    
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: invoice.balance } }
    });
    
    // Create payment record
    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        customerId,
        amount: invoice.balance,
        paymentMethod: 'WALLET',
        status: 'COMPLETED'
      }
    });
    
    // Update invoice
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: { increment: invoice.balance },
        balance: 0,
        status: 'PAID',
        paidDate: new Date()
      }
    });
  });
  
  const updatedWallet = await db.wallet.findUnique({ where: { customerId } });
  return { success: true, remainingBalance: updatedWallet.balance };
}
```

### 3.3 Auto Top-Up

```typescript
// Cron: Her ödeme sonrası veya günlük
async function checkAutoTopUp(customerId: string) {
  const wallet = await db.wallet.findUnique({ where: { customerId } });
  
  if (!wallet.autoTopUp || !wallet.autoTopUpPaymentTokenId) return;
  
  if (wallet.balance.lte(wallet.autoTopUpThreshold)) {
    await purchaseCredits(
      customerId,
      null, // Custom amount
      { tokenId: wallet.autoTopUpPaymentTokenId },
      wallet.autoTopUpAmount
    );
  }
}
```

---

## 4. API ENDPOINTS

```typescript
// Client
wallet.getBalance
wallet.getTransactions
wallet.purchaseCredits     // Top-up
wallet.payInvoice          // Pay with credits
wallet.setupAutoTopUp
wallet.disableAutoTopUp
wallet.getCreditPackages

// Admin
admin.wallet.getByCustomer
admin.wallet.adjustBalance // Manuel düzeltme
admin.wallet.addPromoCredits
admin.wallet.getTransactions

admin.creditPackages.list
admin.creditPackages.create
admin.creditPackages.update
admin.creditPackages.delete
```

---

## 5. UI COMPONENTS

### 5.1 Client Area
- Wallet balance widget (header'da)
- Credit purchase page
- Transaction history
- Auto top-up settings
- Pay with credits button (invoice page)

### 5.2 Admin
- Customer wallet overview
- Manual adjustment form
- Promo credit assignment
- Credit package management

---

## 6. TASKS

- [ ] Wallet model
- [ ] WalletTransaction model
- [ ] Credit purchase flow
- [ ] Pay with credits flow
- [ ] CreditPackage CRUD
- [ ] PromoCredit system
- [ ] Auto top-up
- [ ] Transaction history
- [ ] Admin adjustments
- [ ] Expiring promo credits job
