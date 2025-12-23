# HybleBilling Core - API Reference

> **API Style:** tRPC (Type-safe)
> **Alternative:** REST endpoints available via adapter
> **Auth:** API Key + JWT

---

## 1. API YAPISI

### 1.1 Router Organizasyonu

```typescript
// Main Router
const billingRouter = router({
  customers: customerRouter,
  products: productRouter,
  services: serviceRouter,
  invoices: invoiceRouter,
  payments: paymentRouter,
  subscriptions: subscriptionRouter,
  wallet: walletRouter,
  coupons: couponRouter,
  webhooks: webhookRouter,
});
```

### 1.2 Authentication

```typescript
// API Key for server-to-server
headers: {
  'X-API-Key': 'hbl_live_xxxxx'
}

// JWT for client-side
headers: {
  'Authorization': 'Bearer eyJhbGc...'
}
```

---

## 2. CUSTOMERS API

### 2.1 List Customers

```typescript
billing.customers.list({
  page?: number,
  limit?: number,
  status?: CustomerStatus,
  search?: string,
  vertical?: string,
})
// Returns: { customers: Customer[], total: number, page: number }
```

### 2.2 Get Customer

```typescript
billing.customers.get({ id: string })
billing.customers.getByExternalId({ externalId: string })
// Returns: Customer (with addresses, wallet)
```

### 2.3 Create Customer

```typescript
billing.customers.create({
  email: string,
  firstName: string,
  lastName: string,
  companyName?: string,
  externalId?: string,        // Hyble ID
  taxId?: string,
  currencyCode?: string,      // Default: TRY
  country?: string,
  metadata?: Record<string, any>,
})
// Returns: Customer
```

### 2.4 Update Customer

```typescript
billing.customers.update({
  id: string,
  ...partialFields
})
// Returns: Customer
```

### 2.5 Delete Customer

```typescript
billing.customers.delete({ id: string })
// Returns: { success: boolean }
```

### 2.6 Customer Addresses

```typescript
billing.customers.addresses.list({ customerId: string })
billing.customers.addresses.add({ customerId: string, ...addressData })
billing.customers.addresses.update({ id: string, ...partialFields })
billing.customers.addresses.delete({ id: string })
billing.customers.addresses.setDefault({ id: string })
```

---

## 3. PRODUCTS API

### 3.1 List Products

```typescript
billing.products.list({
  groupId?: string,
  vertical?: string,
  isActive?: boolean,
  page?: number,
  limit?: number,
})
// Returns: { products: Product[], total: number }
```

### 3.2 Get Product

```typescript
billing.products.get({ id: string })
billing.products.getBySlug({ slug: string })
// Returns: Product (with pricing, configOptions)
```

### 3.3 Create Product

```typescript
billing.products.create({
  name: string,
  slug: string,
  description?: string,
  groupId: string,
  type?: 'service' | 'addon' | 'one-time',
  vertical?: string,
  pricing: Array<{
    currencyCode: string,
    billingCycle: BillingCycle,
    price: number,
    setupFee?: number,
  }>,
  setupFee?: number,
  configOptions?: Array<{
    name: string,
    key: string,
    type: string,
    options?: any[],
    isRequired?: boolean,
  }>,
  metadata?: Record<string, any>,
})
// Returns: Product
```

### 3.4 Calculate Price

```typescript
billing.products.calculatePrice({
  productId: string,
  billingCycle: BillingCycle,
  currencyCode: string,
  configOptions?: Record<string, any>,
  couponCode?: string,
})
// Returns: {
//   basePrice: number,
//   setupFee: number,
//   configOptionsTotal: number,
//   discount: number,
//   tax: number,
//   total: number,
// }
```

---

## 4. SERVICES API

### 4.1 List Services

```typescript
billing.services.list({
  customerId?: string,
  productId?: string,
  status?: ServiceStatus,
  vertical?: string,
  page?: number,
  limit?: number,
})
// Returns: { services: Service[], total: number }
```

### 4.2 Get Service

```typescript
billing.services.get({ id: string })
// Returns: Service (with product, subscription)
```

### 4.3 Create Service

```typescript
billing.services.create({
  customerId: string,
  productId: string,
  billingCycle: BillingCycle,
  currencyCode?: string,
  identifier?: string,
  configOptions?: Record<string, any>,
  startDate?: Date,
  createInvoice?: boolean,      // Default: true
  provisioningData?: any,
})
// Returns: { service: Service, invoice?: Invoice }
```

### 4.4 Upgrade/Downgrade

```typescript
billing.services.changePlan({
  serviceId: string,
  newProductId: string,
  prorate?: boolean,            // Default: true
})
// Returns: { service: Service, invoice?: Invoice, credit?: number }
```

### 4.5 Suspend/Unsuspend

```typescript
billing.services.suspend({ id: string, reason?: string })
billing.services.unsuspend({ id: string })
// Returns: Service
```

### 4.6 Terminate

```typescript
billing.services.terminate({
  id: string,
  immediate?: boolean,          // Default: false (end of period)
  reason?: string,
})
// Returns: Service
```

---

## 5. INVOICES API

### 5.1 List Invoices

```typescript
billing.invoices.list({
  customerId?: string,
  status?: InvoiceStatus,
  dateFrom?: Date,
  dateTo?: Date,
  page?: number,
  limit?: number,
})
// Returns: { invoices: Invoice[], total: number }
```

### 5.2 Get Invoice

```typescript
billing.invoices.get({ id: string })
billing.invoices.getByNumber({ invoiceNumber: string })
// Returns: Invoice (with items, payments)
```

### 5.3 Create Invoice

```typescript
billing.invoices.create({
  customerId: string,
  items: Array<{
    description: string,
    quantity?: number,
    unitPrice: number,
    serviceId?: string,
    taxable?: boolean,
    periodStart?: Date,
    periodEnd?: Date,
  }>,
  dueDate?: Date,
  currencyCode?: string,
  notes?: string,
  couponCode?: string,
  sendEmail?: boolean,          // Default: false
})
// Returns: Invoice
```

### 5.4 Add Item

```typescript
billing.invoices.addItem({
  invoiceId: string,
  description: string,
  quantity?: number,
  unitPrice: number,
  taxable?: boolean,
})
// Returns: Invoice
```

### 5.5 Remove Item

```typescript
billing.invoices.removeItem({ itemId: string })
// Returns: Invoice
```

### 5.6 Send Invoice

```typescript
billing.invoices.send({ id: string })
// Returns: { success: boolean }
```

### 5.7 Mark as Paid (Manual)

```typescript
billing.invoices.markPaid({
  id: string,
  paymentMethod?: string,
  reference?: string,
  paidDate?: Date,
})
// Returns: Invoice
```

### 5.8 Cancel Invoice

```typescript
billing.invoices.cancel({ id: string, reason?: string })
// Returns: Invoice
```

### 5.9 Generate PDF

```typescript
billing.invoices.generatePdf({ id: string })
// Returns: { url: string } or { buffer: Buffer }
```

---

## 6. PAYMENTS API

### 6.1 List Payments

```typescript
billing.payments.list({
  customerId?: string,
  invoiceId?: string,
  status?: PaymentStatus,
  dateFrom?: Date,
  dateTo?: Date,
  page?: number,
  limit?: number,
})
// Returns: { payments: Payment[], total: number }
```

### 6.2 Get Payment

```typescript
billing.payments.get({ id: string })
// Returns: Payment (with invoice, refunds)
```

### 6.3 Process Payment

```typescript
billing.payments.process({
  invoiceId: string,
  gatewaySlug: string,
  paymentTokenId?: string,      // For saved card
  cardDetails?: {               // For new card
    number: string,
    expMonth: number,
    expYear: number,
    cvv: string,
    saveCard?: boolean,
  },
  amount?: number,              // For partial payment
  returnUrl?: string,           // For redirect gateways
})
// Returns: {
//   success: boolean,
//   payment?: Payment,
//   redirectUrl?: string,       // For 3DS, PayPal, etc.
//   error?: string,
// }
```

### 6.4 Capture (Pre-authorized)

```typescript
billing.payments.capture({
  paymentId: string,
  amount?: number,
})
// Returns: Payment
```

### 6.5 Refund

```typescript
billing.payments.refund({
  paymentId: string,
  amount?: number,              // Partial refund
  reason?: string,
})
// Returns: Refund
```

### 6.6 Payment Tokens (Saved Cards)

```typescript
billing.payments.tokens.list({ customerId: string })
billing.payments.tokens.add({
  customerId: string,
  gatewaySlug: string,
  cardDetails: { ... },
  setDefault?: boolean,
})
billing.payments.tokens.delete({ id: string })
billing.payments.tokens.setDefault({ id: string })
```

---

## 7. SUBSCRIPTIONS API

### 7.1 List Subscriptions

```typescript
billing.subscriptions.list({
  customerId?: string,
  status?: SubscriptionStatus,
  page?: number,
  limit?: number,
})
// Returns: { subscriptions: Subscription[], total: number }
```

### 7.2 Get Subscription

```typescript
billing.subscriptions.get({ id: string })
// Returns: Subscription (with service)
```

### 7.3 Create Subscription

```typescript
billing.subscriptions.create({
  customerId: string,
  productId: string,
  billingCycle: BillingCycle,
  paymentTokenId?: string,
  startDate?: Date,
  trialDays?: number,
  couponCode?: string,
})
// Returns: { subscription: Subscription, service: Service, invoice?: Invoice }
```

### 7.4 Update Subscription

```typescript
billing.subscriptions.update({
  id: string,
  paymentTokenId?: string,
  billingCycle?: BillingCycle,
})
// Returns: Subscription
```

### 7.5 Cancel Subscription

```typescript
billing.subscriptions.cancel({
  id: string,
  immediate?: boolean,
  reason?: string,
})
// Returns: Subscription
```

### 7.6 Pause/Resume

```typescript
billing.subscriptions.pause({
  id: string,
  resumeDate?: Date,
})
billing.subscriptions.resume({ id: string })
// Returns: Subscription
```

---

## 8. WALLET API (Hyble Credits)

### 8.1 Get Wallet

```typescript
billing.wallet.get({ customerId: string })
// Returns: Wallet (with recent transactions)
```

### 8.2 Get Balance

```typescript
billing.wallet.getBalance({ customerId: string })
// Returns: { balance: number, promoBalance: number, total: number }
```

### 8.3 Top Up

```typescript
billing.wallet.topUp({
  customerId: string,
  amount: number,
  currencyCode?: string,
  paymentMethod: {
    gatewaySlug: string,
    paymentTokenId?: string,
    cardDetails?: { ... },
  },
})
// Returns: { transaction: WalletTransaction, payment: Payment }
```

### 8.4 Purchase Credit Package

```typescript
billing.wallet.purchasePackage({
  customerId: string,
  packageId: string,
  paymentMethod: { ... },
})
// Returns: { transaction: WalletTransaction, payment: Payment }
```

### 8.5 Pay Invoice with Credits

```typescript
billing.wallet.payInvoice({
  customerId: string,
  invoiceId: string,
})
// Returns: { success: boolean, remainingBalance: number }
```

### 8.6 Transactions

```typescript
billing.wallet.transactions({
  customerId: string,
  type?: WalletTransactionType,
  dateFrom?: Date,
  dateTo?: Date,
  page?: number,
  limit?: number,
})
// Returns: { transactions: WalletTransaction[], total: number }
```

### 8.7 Auto Top-Up Settings

```typescript
billing.wallet.setAutoTopUp({
  customerId: string,
  enabled: boolean,
  amount?: number,
  threshold?: number,
  paymentTokenId?: string,
})
// Returns: Wallet
```

---

## 9. COUPONS API

### 9.1 Validate Coupon

```typescript
billing.coupons.validate({
  code: string,
  customerId?: string,
  productIds?: string[],
  vertical?: string,
})
// Returns: {
//   valid: boolean,
//   coupon?: Coupon,
//   error?: string,
// }
```

### 9.2 Apply Coupon

```typescript
billing.coupons.apply({
  code: string,
  invoiceId: string,
})
// Returns: Invoice
```

### 9.3 Admin: CRUD

```typescript
billing.coupons.create({ ...couponData })
billing.coupons.update({ id: string, ...partialData })
billing.coupons.delete({ id: string })
billing.coupons.list({ isActive?: boolean, page?, limit? })
```

---

## 10. WEBHOOKS API

### 10.1 Events

```typescript
// Available webhook events
type WebhookEvent =
  // Customer
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  // Service
  | 'service.created'
  | 'service.activated'
  | 'service.suspended'
  | 'service.terminated'
  // Invoice
  | 'invoice.created'
  | 'invoice.sent'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'invoice.cancelled'
  // Payment
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.refunded'
  // Subscription
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'subscription.renewed'
  // Wallet
  | 'wallet.credited'
  | 'wallet.debited';
```

### 10.2 Webhook Payload

```typescript
interface WebhookPayload {
  id: string,
  event: WebhookEvent,
  timestamp: string,
  data: Record<string, any>,
}

// Signature verification
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');
```

### 10.3 Manage Endpoints

```typescript
billing.webhooks.create({
  url: string,
  events: WebhookEvent[],
})
billing.webhooks.update({ id: string, ...partialData })
billing.webhooks.delete({ id: string })
billing.webhooks.list()
billing.webhooks.logs({ endpointId: string, page?, limit? })
```

---

## 11. ERROR HANDLING

### 11.1 Error Format

```typescript
interface BillingError {
  code: string,
  message: string,
  details?: Record<string, any>,
}

// Error codes
type ErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'INSUFFICIENT_FUNDS'
  | 'PAYMENT_FAILED'
  | 'GATEWAY_ERROR'
  | 'DUPLICATE_ENTRY'
  | 'RATE_LIMITED';
```

### 11.2 Example

```typescript
try {
  await billing.payments.process({ ... });
} catch (error) {
  if (error.code === 'PAYMENT_FAILED') {
    console.log('Payment failed:', error.details.gatewayMessage);
  }
}
```

---

**Toplam Endpoint Sayısı:** ~80+
