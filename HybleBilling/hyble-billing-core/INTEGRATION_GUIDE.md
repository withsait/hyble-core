# HybleBilling Core - Integration Guide

> Bu rehber, HybleBilling Core'u Hyble ekosistemindeki projelere nasıl entegre edeceğinizi gösterir.

---

## 1. KURULUM

### 1.1 Package Installation

```bash
# Core package
pnpm add @hyble/billing-core

# Optional: Individual packages
pnpm add @hyble/billing-invoices
pnpm add @hyble/billing-payments
pnpm add @hyble/billing-wallet
```

### 1.2 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/hyble_billing"
REDIS_URL="redis://localhost:6379"

# Encryption
ENCRYPTION_KEY="your-32-byte-encryption-key"

# Gateways (configure as needed)
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

IYZICO_API_KEY="xxx"
IYZICO_SECRET_KEY="xxx"
IYZICO_BASE_URL="https://api.iyzipay.com"

# Email (optional)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user"
SMTP_PASS="pass"
```

### 1.3 Database Setup

```bash
# Generate Prisma client
pnpm billing db:generate

# Run migrations
pnpm billing db:migrate

# Seed default data
pnpm billing db:seed
```

---

## 2. TEMEL ENTEGRASYON

### 2.1 Initialize Billing Core

```typescript
// lib/billing.ts
import { BillingCore, StripeGateway, IyzicoGateway } from '@hyble/billing-core';
import { prisma } from './prisma';

export const billing = new BillingCore({
  // Database
  prisma,
  
  // Payment Gateways
  gateways: [
    new StripeGateway({
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    }),
    new IyzicoGateway({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      baseUrl: process.env.IYZICO_BASE_URL!,
    }),
  ],
  
  // Currency Settings
  currency: {
    default: 'TRY',
    supported: ['TRY', 'USD', 'EUR'],
    autoConvert: true,
  },
  
  // Tax Settings
  tax: {
    defaultRate: 20,
    country: 'TR',
    validateVAT: true,
  },
  
  // Invoice Settings
  invoice: {
    prefix: 'HBL',
    dueDays: 7,
    pdfTemplate: 'default',
  },
  
  // Webhook Settings
  webhooks: {
    secret: process.env.WEBHOOK_SECRET!,
    retryAttempts: 3,
  },
});
```

### 2.2 Next.js tRPC Integration

```typescript
// server/routers/billing.ts
import { router, protectedProcedure } from '../trpc';
import { billing } from '@/lib/billing';

export const billingRouter = router({
  // Customer endpoints
  getMyInvoices: protectedProcedure.query(async ({ ctx }) => {
    return billing.invoices.list({
      customerId: ctx.user.billingCustomerId,
    });
  }),
  
  getInvoice: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return billing.invoices.get({ id: input.id });
    }),
  
  payInvoice: protectedProcedure
    .input(z.object({
      invoiceId: z.string(),
      paymentTokenId: z.string().optional(),
      useCredits: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.useCredits) {
        return billing.wallet.payInvoice({
          customerId: ctx.user.billingCustomerId,
          invoiceId: input.invoiceId,
        });
      }
      
      return billing.payments.process({
        invoiceId: input.invoiceId,
        gatewaySlug: 'stripe',
        paymentTokenId: input.paymentTokenId,
      });
    }),
  
  // Wallet endpoints
  getWallet: protectedProcedure.query(async ({ ctx }) => {
    return billing.wallet.get({
      customerId: ctx.user.billingCustomerId,
    });
  }),
  
  topUpWallet: protectedProcedure
    .input(z.object({
      amount: z.number(),
      paymentTokenId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return billing.wallet.topUp({
        customerId: ctx.user.billingCustomerId,
        amount: input.amount,
        paymentMethod: {
          gatewaySlug: 'iyzico',
          paymentTokenId: input.paymentTokenId,
        },
      });
    }),
});
```

### 2.3 Webhook Handler

```typescript
// app/api/webhooks/billing/route.ts (Next.js App Router)
import { billing } from '@/lib/billing';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('x-billing-signature');
  
  try {
    const event = billing.webhooks.verify(payload, signature!);
    
    switch (event.type) {
      case 'invoice.paid':
        // Handle paid invoice
        await handleInvoicePaid(event.data);
        break;
        
      case 'subscription.cancelled':
        // Handle subscription cancellation
        await handleSubscriptionCancelled(event.data);
        break;
        
      case 'payment.failed':
        // Handle failed payment
        await handlePaymentFailed(event.data);
        break;
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}

// Gateway-specific webhooks
// app/api/webhooks/stripe/route.ts
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');
  
  try {
    await billing.gateways.stripe.handleWebhook(payload, signature!);
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

---

## 3. HYBLE ENTEGRASYONU

### 3.1 Hyble ID ile Senkronizasyon

```typescript
// Hyble ID kullanıcısı oluşturulduğunda billing customer oluştur
async function onHybleUserCreated(hybleUser: HybleUser) {
  const customer = await billing.customers.create({
    externalId: hybleUser.id,
    email: hybleUser.email,
    firstName: hybleUser.firstName,
    lastName: hybleUser.lastName,
    country: hybleUser.country,
    metadata: {
      hybleUserId: hybleUser.id,
      registrationSource: 'hyble',
    },
  });
  
  // User'a billingCustomerId ekle
  await prisma.hybleUser.update({
    where: { id: hybleUser.id },
    data: { billingCustomerId: customer.id },
  });
  
  // Wallet oluştur
  await billing.wallet.create({ customerId: customer.id });
  
  return customer;
}

// Hyble ID'den billing customer bul
async function getBillingCustomer(hybleUserId: string) {
  return billing.customers.getByExternalId({
    externalId: hybleUserId,
  });
}
```

### 3.2 Cross-Vertical Service Management

```typescript
// Farklı vertical'lerden service oluşturma
async function createService(
  customerId: string,
  vertical: 'hyble' | 'gaming',
  productSlug: string,
  options?: Record<string, any>
) {
  const product = await billing.products.getBySlug({ slug: productSlug });
  
  const { service, invoice } = await billing.services.create({
    customerId,
    productId: product.id,
    billingCycle: 'MONTHLY',
    configOptions: options,
  });
  
  // Vertical-specific provisioning
  if (vertical === 'gaming') {
    await provisionGameServer(service, options);
  } else if (vertical === 'hyble') {
    await provisionSaaSAccount(service, options);
  }
  
  return { service, invoice };
}

// Müşterinin tüm servislerini getir (cross-vertical)
async function getCustomerServices(customerId: string) {
  const allServices = await billing.services.list({ customerId });
  
  return {
    hyble: allServices.services.filter(s => s.vertical === 'hyble'),
    gaming: allServices.services.filter(s => s.vertical === 'gaming'),
    total: allServices.total,
  };
}
```

---

## 4. HYBLEGAMING ENTEGRASYONU

### 4.1 Game Server Satın Alma

```typescript
// pages/api/gaming/order.ts
import { billing } from '@/lib/billing';
import { provisionPickaxeServer } from '@/lib/pickaxe';

export async function createGameServerOrder(
  customerId: string,
  serverType: 'minecraft' | 'rust' | 'ark',
  plan: string,
  config: GameServerConfig
) {
  // 1. Ürünü bul
  const product = await billing.products.getBySlug({
    slug: `gaming-${serverType}-${plan}`,
  });
  
  // 2. Fiyat hesapla
  const pricing = await billing.products.calculatePrice({
    productId: product.id,
    billingCycle: 'MONTHLY',
    currencyCode: 'TRY',
    configOptions: {
      ram: config.ram,
      slots: config.slots,
      location: config.location,
    },
  });
  
  // 3. Servis ve fatura oluştur
  const { service, invoice } = await billing.services.create({
    customerId,
    productId: product.id,
    billingCycle: 'MONTHLY',
    identifier: config.serverName,
    configOptions: {
      ram: config.ram,
      slots: config.slots,
      location: config.location,
      serverType,
    },
    createInvoice: true,
  });
  
  return { service, invoice, pricing };
}

// Ödeme sonrası provisioning
async function onGameServerPayment(serviceId: string) {
  const service = await billing.services.get({ id: serviceId });
  
  // Pickaxe ile server provision et
  const serverData = await provisionPickaxeServer({
    name: service.identifier,
    ram: service.configOptions.ram,
    slots: service.configOptions.slots,
    location: service.configOptions.location,
    game: service.configOptions.serverType,
  });
  
  // Service'e provisioning data ekle
  await billing.services.update({
    id: serviceId,
    provisioningData: {
      serverId: serverData.id,
      ip: serverData.ip,
      port: serverData.port,
      ftpUser: serverData.ftpUser,
      ftpPass: serverData.ftpPass,
    },
    status: 'ACTIVE',
  });
  
  // Welcome email gönder
  await sendWelcomeEmail(service.customerId, serverData);
}
```

### 4.2 Credits ile Ödeme

```typescript
// Game server için credits kullanma
async function payWithCredits(customerId: string, invoiceId: string) {
  // 1. Bakiye kontrolü
  const wallet = await billing.wallet.get({ customerId });
  const invoice = await billing.invoices.get({ id: invoiceId });
  
  if (wallet.balance < invoice.balance) {
    // Yetersiz bakiye - top up sayfasına yönlendir
    return {
      success: false,
      error: 'INSUFFICIENT_BALANCE',
      required: invoice.balance,
      current: wallet.balance,
      topUpUrl: `/wallet/topup?amount=${invoice.balance - wallet.balance}`,
    };
  }
  
  // 2. Credits ile öde
  const result = await billing.wallet.payInvoice({
    customerId,
    invoiceId,
  });
  
  // 3. Başarılı ise provisioning tetikle
  if (result.success) {
    const invoice = await billing.invoices.get({ id: invoiceId });
    for (const item of invoice.items) {
      if (item.serviceId) {
        await onGameServerPayment(item.serviceId);
      }
    }
  }
  
  return result;
}
```

---

## 5. FRONTEND COMPONENTS

### 5.1 Invoice List Component

```tsx
// components/billing/InvoiceList.tsx
'use client';

import { api } from '@/lib/trpc';

export function InvoiceList() {
  const { data, isLoading } = api.billing.getMyInvoices.useQuery();
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div className="space-y-4">
      {data.invoices.map((invoice) => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const payMutation = api.billing.payInvoice.useMutation();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <span className="font-mono">{invoice.invoiceNumber}</span>
          <Badge variant={getStatusVariant(invoice.status)}>
            {invoice.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold">
              {formatCurrency(invoice.total, invoice.currencyCode)}
            </p>
            <p className="text-sm text-muted-foreground">
              Due: {formatDate(invoice.dueDate)}
            </p>
          </div>
          {invoice.status === 'PENDING' && (
            <Button
              onClick={() => payMutation.mutate({ invoiceId: invoice.id })}
              disabled={payMutation.isLoading}
            >
              Pay Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.2 Wallet Widget

```tsx
// components/billing/WalletWidget.tsx
'use client';

import { api } from '@/lib/trpc';

export function WalletWidget() {
  const { data: wallet } = api.billing.getWallet.useQuery();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Hyble Credits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {formatCurrency(wallet?.balance ?? 0, 'TRY')}
        </div>
        {wallet?.promoBalance > 0 && (
          <p className="text-sm text-green-600">
            +{formatCurrency(wallet.promoBalance, 'TRY')} promo
          </p>
        )}
        <Button className="mt-4 w-full" asChild>
          <Link href="/wallet/topup">Top Up</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 6. BACKGROUND JOBS

### 6.1 Recurring Billing Job

```typescript
// jobs/billing.ts
import { billing } from '@/lib/billing';
import { Queue, Worker } from 'bullmq';

const billingQueue = new Queue('billing', { connection: redis });

// Her gün 00:00'da çalış
billingQueue.add('process-recurring', {}, {
  repeat: { pattern: '0 0 * * *' }
});

const billingWorker = new Worker('billing', async (job) => {
  switch (job.name) {
    case 'process-recurring':
      await billing.subscriptions.processRecurring();
      break;
      
    case 'send-reminders':
      await billing.invoices.sendReminders();
      break;
      
    case 'mark-overdue':
      await billing.invoices.markOverdue();
      break;
      
    case 'auto-suspend':
      await billing.services.autoSuspend({ daysOverdue: 7 });
      break;
  }
}, { connection: redis });
```

---

## 7. TESTING

### 7.1 Test Environment

```typescript
// test/setup.ts
import { BillingCore, MockGateway } from '@hyble/billing-core';
import { prisma } from './test-prisma';

export const testBilling = new BillingCore({
  prisma,
  gateways: [new MockGateway()],
  currency: { default: 'TRY', supported: ['TRY'] },
  tax: { defaultRate: 0, country: 'TR' },
});

// test/billing.test.ts
describe('Billing', () => {
  it('should create invoice', async () => {
    const customer = await testBilling.customers.create({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });
    
    const invoice = await testBilling.invoices.create({
      customerId: customer.id,
      items: [{ description: 'Test Item', unitPrice: 100 }],
    });
    
    expect(invoice.total).toBe(100);
    expect(invoice.status).toBe('DRAFT');
  });
});
```

---

## 8. CHECKLIST

### Initial Setup
- [ ] Package kurulumu
- [ ] Environment variables
- [ ] Database migration
- [ ] Seed data

### Core Integration
- [ ] BillingCore initialization
- [ ] tRPC router setup
- [ ] Webhook handlers

### User Flow
- [ ] Customer sync (Hyble ID)
- [ ] Invoice listing
- [ ] Payment processing
- [ ] Wallet management

### Background Jobs
- [ ] Recurring billing
- [ ] Payment reminders
- [ ] Auto-suspend

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

**Sonraki Adım:** Production deployment checklist ve monitoring setup.
