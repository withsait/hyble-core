# 03 - Ürün ve Servis Yönetimi Spesifikasyonu

> **Modül:** @hyble/products
> **Öncelik:** P0 (MVP)
> **Tahmini Süre:** 2 hafta

---

## 1. GENEL BAKIŞ

Satılabilir ürünler, servisler ve bunların müşterilere atanan instance'ları.

### 1.1 Temel Kavramlar
- **Product**: Satılabilir ürün tanımı (template)
- **Service**: Müşteriye atanmış ürün instance'ı
- **ProductGroup**: Ürün kategorileri
- **ConfigOption**: Özelleştirilebilir seçenekler
- **Addon**: Ek hizmetler

---

## 2. DATABASE SCHEMA

### 2.1 Product Groups (Ürün Grupları)

```prisma
model ProductGroup {
  id            String    @id @default(cuid())
  
  name          String
  slug          String    @unique
  description   String?
  
  // Görünürlük
  isHidden      Boolean   @default(false)
  
  // Sıralama
  sortOrder     Int       @default(0)
  
  // Parent (nested categories)
  parentId      String?
  parent        ProductGroup?  @relation("GroupHierarchy", fields: [parentId], references: [id])
  children      ProductGroup[] @relation("GroupHierarchy")
  
  products      Product[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([slug])
}
```

### 2.2 Products (Ürünler)

```prisma
model Product {
  id            String        @id @default(cuid())
  
  // Temel Bilgiler
  name          String
  slug          String        @unique
  description   String?
  
  // Kategori
  groupId       String
  group         ProductGroup  @relation(fields: [groupId], references: [id])
  
  // Tip
  type          ProductType   @default(HOSTING)
  
  // Modül (provisioning)
  moduleId      String?
  module        ServerModule? @relation(fields: [moduleId], references: [id])
  moduleSettings Json?        // Module-specific config
  
  // Fiyatlandırma
  pricing       ProductPricing[]
  
  // Setup Fee
  setupFee      Decimal?      @db.Decimal(10, 2)
  
  // Stok
  stockEnabled  Boolean       @default(false)
  stockQuantity Int?
  
  // Durum
  status        ProductStatus @default(ACTIVE)
  isHidden      Boolean       @default(false)
  isFeatured    Boolean       @default(false)
  
  // Sıralama
  sortOrder     Int           @default(0)
  
  // Auto Setup
  autoSetup     AutoSetupType @default(ON_PAYMENT)
  
  // Welcome Email
  welcomeEmailId String?
  
  // Upgrade/Downgrade
  allowUpgrade  Boolean       @default(true)
  upgradeProducts String[]    @default([]) // Allowed upgrade product IDs
  
  // İlişkiler
  configOptions ProductConfigOption[]
  addons        ProductAddon[]
  services      Service[]
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([groupId])
  @@index([status])
}

enum ProductType {
  HOSTING       // Web hosting
  RESELLER      // Reseller hosting
  VPS           // Virtual server
  DEDICATED     // Dedicated server
  GAME_SERVER   // Game server (Minecraft, etc.)
  DOMAIN        // Domain registration
  SSL           // SSL certificate
  LICENSE       // Software license
  OTHER         // Generic product
}

enum ProductStatus {
  ACTIVE
  HIDDEN        // Mevcut müşteriler görebilir, yeni satış yok
  DISABLED      // Tamamen devre dışı
}

enum AutoSetupType {
  DISABLED      // Manuel setup
  ON_ORDER      // Sipariş anında
  ON_PAYMENT    // Ödeme alındığında
  ON_FIRST_PAYMENT // İlk ödeme alındığında (recurring)
}
```

### 2.3 Product Pricing

```prisma
model ProductPricing {
  id            String       @id @default(cuid())
  
  productId     String
  product       Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  // Para Birimi
  currencyCode  String
  
  // Billing Cycle
  billingCycle  BillingCycle
  
  // Fiyat
  price         Decimal      @db.Decimal(10, 2)
  
  // Setup Fee (cycle bazlı override)
  setupFee      Decimal?     @db.Decimal(10, 2)
  
  createdAt     DateTime     @default(now())
  
  @@unique([productId, currencyCode, billingCycle])
}
```

### 2.4 Configurable Options

```prisma
model ConfigOptionGroup {
  id            String         @id @default(cuid())
  
  name          String
  description   String?
  
  options       ConfigOption[]
  
  createdAt     DateTime       @default(now())
}

model ConfigOption {
  id            String         @id @default(cuid())
  
  groupId       String
  group         ConfigOptionGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  
  name          String
  
  // Tip
  type          ConfigOptionType
  
  // Değerler (dropdown, radio için)
  values        ConfigOptionValue[]
  
  // Zorunluluk
  isRequired    Boolean        @default(false)
  
  // Sıralama
  sortOrder     Int            @default(0)
  
  createdAt     DateTime       @default(now())
}

enum ConfigOptionType {
  DROPDOWN      // Tek seçim dropdown
  RADIO         // Tek seçim radio
  CHECKBOX      // Çoklu seçim
  QUANTITY      // Miktar (slider/input)
  TEXT          // Text input
}

model ConfigOptionValue {
  id            String       @id @default(cuid())
  
  optionId      String
  option        ConfigOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  
  name          String
  
  // Fiyatlandırma
  pricing       ConfigOptionPricing[]
  
  // Sıralama
  sortOrder     Int          @default(0)
  
  isDefault     Boolean      @default(false)
}

model ConfigOptionPricing {
  id            String           @id @default(cuid())
  
  valueId       String
  value         ConfigOptionValue @relation(fields: [valueId], references: [id], onDelete: Cascade)
  
  currencyCode  String
  billingCycle  BillingCycle
  
  // Fiyat tipi
  priceType     PriceType        @default(FIXED)
  price         Decimal          @db.Decimal(10, 2)
  
  // Setup fee (opsiyonel)
  setupFee      Decimal?         @db.Decimal(10, 2)
}

enum PriceType {
  FIXED         // Sabit fiyat
  PERCENTAGE    // Ana ürünün yüzdesi
}

// Product ↔ ConfigOptionGroup ilişkisi
model ProductConfigOption {
  productId     String
  product       Product          @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  groupId       String
  group         ConfigOptionGroup @relation(fields: [groupId], references: [id])
  
  sortOrder     Int              @default(0)
  
  @@id([productId, groupId])
}
```

### 2.5 Product Addons

```prisma
model ProductAddon {
  id            String    @id @default(cuid())
  
  name          String
  description   String?
  
  // Bağlı ürünler
  products      Product[]
  
  // Fiyatlandırma
  pricing       AddonPricing[]
  
  // Setup fee
  setupFee      Decimal?  @db.Decimal(10, 2)
  
  // Billing
  billingMode   AddonBillingMode @default(SAME_AS_PRODUCT)
  
  // Miktar
  allowQuantity Boolean   @default(false)
  minQuantity   Int       @default(1)
  maxQuantity   Int?
  
  // Durum
  isHidden      Boolean   @default(false)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum AddonBillingMode {
  SAME_AS_PRODUCT  // Ürün ile aynı cycle
  ONCE             // Tek seferlik
  RECURRING        // Kendi cycle'ı
}

model AddonPricing {
  id            String       @id @default(cuid())
  
  addonId       String
  addon         ProductAddon @relation(fields: [addonId], references: [id], onDelete: Cascade)
  
  currencyCode  String
  billingCycle  BillingCycle
  price         Decimal      @db.Decimal(10, 2)
}
```

### 2.6 Services (Müşteri Servisleri)

```prisma
model Service {
  id              String        @id @default(cuid())
  
  // Müşteri
  customerId      String
  customer        Customer      @relation(fields: [customerId], references: [id])
  
  // Ürün
  productId       String
  product         Product       @relation(fields: [productId], references: [id])
  
  // Server (provisioned)
  serverId        String?
  server          Server?       @relation(fields: [serverId], references: [id])
  
  // Domain (varsa)
  domain          String?
  
  // Durum
  status          ServiceStatus @default(PENDING)
  
  // Billing
  billingCycle    BillingCycle
  amount          Decimal       @db.Decimal(10, 2)
  currencyCode    String
  
  // Tarihler
  registrationDate DateTime     @default(now())
  nextDueDate     DateTime
  terminationDate DateTime?
  
  // Subscription (recurring için)
  subscriptionId  String?       @unique
  subscription    Subscription? @relation(fields: [subscriptionId], references: [id])
  
  // Config Options (seçilen değerler)
  configOptions   ServiceConfigOption[]
  
  // Addons
  addons          ServiceAddon[]
  
  // Dedicated IP (varsa)
  dedicatedIp     String?
  
  // Username/Password (provision)
  username        String?
  password        String?       // Encrypted
  
  // Notes
  adminNotes      String?
  
  // Suspend Reason
  suspendReason   String?
  
  // Override
  overrideAutoSuspend Boolean   @default(false)
  overrideAutoterminate Boolean @default(false)
  
  // Fatura kalemleri
  invoiceItems    InvoiceItem[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([customerId])
  @@index([productId])
  @@index([status])
  @@index([nextDueDate])
}

enum ServiceStatus {
  PENDING         // Kurulum bekliyor
  ACTIVE          // Aktif
  SUSPENDED       // Askıya alınmış (ödeme)
  TERMINATED      // Sonlandırılmış
  CANCELLED       // İptal edilmiş
  FRAUD           // Fraud tespit
}

model ServiceConfigOption {
  id            String    @id @default(cuid())
  
  serviceId     String
  service       Service   @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  
  optionId      String
  valueId       String?   // Selected value ID
  
  // Quantity type için
  quantity      Int?
  
  // Text type için
  textValue     String?
  
  // Fiyat (sipariş anındaki)
  price         Decimal   @db.Decimal(10, 2) @default(0)
  setupFee      Decimal   @db.Decimal(10, 2) @default(0)
  
  @@unique([serviceId, optionId])
}

model ServiceAddon {
  id            String    @id @default(cuid())
  
  serviceId     String
  service       Service   @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  
  addonId       String
  addon         ProductAddon @relation(fields: [addonId], references: [id])
  
  name          String    // Snapshot
  
  // Billing
  billingCycle  BillingCycle
  amount        Decimal   @db.Decimal(10, 2)
  
  quantity      Int       @default(1)
  
  // Tarihler
  nextDueDate   DateTime
  
  status        ServiceStatus @default(ACTIVE)
  
  createdAt     DateTime  @default(now())
  
  @@index([serviceId])
}
```

---

## 3. API ENDPOINTS

### 3.1 Product Endpoints (Admin)

```typescript
// tRPC Router: adminProductRouter

// List products
admin.products.list
  Input: { groupId?, status?, type?, search?, page?, limit? }
  Output: { products: Product[], total: number }

// Get product
admin.products.get
  Input: { id }
  Output: Product (with pricing, options, addons)

// Create product
admin.products.create
  Input: {
    name, slug, description?, groupId, type,
    moduleId?, moduleSettings?,
    pricing: [...], setupFee?,
    status?, isHidden?, isFeatured?
  }
  Output: Product

// Update product
admin.products.update
  Input: { id, ...partial fields }
  Output: Product

// Delete product
admin.products.delete
  Input: { id }
  Output: { success: boolean }

// Duplicate product
admin.products.duplicate
  Input: { id }
  Output: Product

// Update pricing
admin.products.updatePricing
  Input: { productId, pricing: [...] }
  Output: ProductPricing[]

// Attach config option group
admin.products.attachConfigOption
  Input: { productId, groupId }
  Output: { success: boolean }

// Detach config option group
admin.products.detachConfigOption
  Input: { productId, groupId }
  Output: { success: boolean }
```

### 3.2 Service Endpoints (Admin)

```typescript
// tRPC Router: adminServiceRouter

// List services
admin.services.list
  Input: { customerId?, productId?, status?, search?, page?, limit? }
  Output: { services: Service[], total: number }

// Get service
admin.services.get
  Input: { id }
  Output: Service (full details)

// Create service (manual)
admin.services.create
  Input: {
    customerId, productId, domain?,
    billingCycle, amount?, currencyCode?,
    configOptions?: [...], addons?: [...]
  }
  Output: Service

// Update service
admin.services.update
  Input: { id, ...partial fields }
  Output: Service

// Change product (upgrade/downgrade)
admin.services.changeProduct
  Input: { id, newProductId, prorate? }
  Output: Service

// Module Commands
admin.services.create
admin.services.suspend
admin.services.unsuspend
admin.services.terminate

// Suspend service
admin.services.suspend
  Input: { id, reason? }
  Output: Service

// Unsuspend service
admin.services.unsuspend
  Input: { id }
  Output: Service

// Terminate service
admin.services.terminate
  Input: { id, immediate?: boolean }
  Output: Service

// Change due date
admin.services.changeDueDate
  Input: { id, newDueDate }
  Output: Service

// Add addon
admin.services.addAddon
  Input: { serviceId, addonId, quantity? }
  Output: ServiceAddon

// Remove addon
admin.services.removeAddon
  Input: { addonId }
  Output: { success: boolean }
```

### 3.3 Service Endpoints (Client)

```typescript
// tRPC Router: serviceRouter (client-facing)

// List my services
services.list
  Input: { status?, page?, limit? }
  Output: { services: Service[], total: number }

// Get service details
services.get
  Input: { id }
  Output: Service (with product info)

// Request upgrade
services.requestUpgrade
  Input: { id }
  Output: { availableProducts: Product[], currentService: Service }

// Preview upgrade
services.previewUpgrade
  Input: { serviceId, newProductId }
  Output: { proratedCredit, newCharge, netAmount }

// Confirm upgrade
services.confirmUpgrade
  Input: { serviceId, newProductId }
  Output: { invoice: Invoice, service: Service }

// Request cancellation
services.requestCancellation
  Input: { id, reason, immediate?: boolean }
  Output: { service: Service, effectiveDate: Date }

// Addon management
services.listAddons
services.addAddon
services.removeAddon
```

### 3.4 Product Catalog Endpoints (Public)

```typescript
// tRPC Router: catalogRouter

// Get product groups
catalog.getGroups
  Input: {}
  Output: ProductGroup[] (with product count)

// Get products in group
catalog.getProducts
  Input: { groupId?, groupSlug? }
  Output: Product[] (with pricing)

// Get product details
catalog.getProduct
  Input: { id?, slug? }
  Output: Product (with pricing, options, addons)

// Get config options for product
catalog.getConfigOptions
  Input: { productId }
  Output: ConfigOptionGroup[]

// Calculate price
catalog.calculatePrice
  Input: {
    productId,
    billingCycle,
    currencyCode,
    configOptions?: [...],
    addons?: [...],
    couponCode?
  }
  Output: {
    basePrice, setupFee,
    optionsTotal, addonsTotal,
    discount, subtotal, tax, total
  }
```

---

## 4. ORDER FLOW

### 4.1 Order Process

```typescript
// 1. Sipariş oluşturma
async function createOrder(input: OrderInput) {
  // Validate product & options
  const product = await validateProduct(input.productId);
  const pricing = await calculatePricing(input);
  
  // Create invoice
  const invoice = await createInvoice({
    customerId: input.customerId,
    items: buildInvoiceItems(product, pricing),
    dueDate: new Date()
  });
  
  // Create pending service
  const service = await db.service.create({
    data: {
      customerId: input.customerId,
      productId: input.productId,
      status: 'PENDING',
      billingCycle: input.billingCycle,
      amount: pricing.recurring,
      currencyCode: input.currencyCode,
      nextDueDate: calculateNextDueDate(input.billingCycle),
      configOptions: { create: input.configOptions },
      addons: { create: input.addons }
    }
  });
  
  return { invoice, service };
}

// 2. Ödeme sonrası provisioning
async function onPaymentComplete(invoiceId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { items: true }
  });
  
  for (const item of invoice.items) {
    if (item.serviceId) {
      const service = await db.service.findUnique({
        where: { id: item.serviceId },
        include: { product: true }
      });
      
      if (service.status === 'PENDING' && service.product.autoSetup !== 'DISABLED') {
        await provisionService(service);
      }
    }
  }
}

// 3. Provisioning
async function provisionService(service: Service) {
  const module = getModule(service.product.moduleId);
  
  try {
    const result = await module.create(service);
    
    await db.service.update({
      where: { id: service.id },
      data: {
        status: 'ACTIVE',
        username: result.username,
        password: encrypt(result.password),
        dedicatedIp: result.ip
      }
    });
    
    await sendWelcomeEmail(service);
    
  } catch (error) {
    await handleProvisioningError(service, error);
  }
}
```

---

## 5. TASKS / CHECKLIST

### Phase 1: Product Management
- [ ] ProductGroup model & CRUD
- [ ] Product model & CRUD
- [ ] ProductPricing
- [ ] Product catalog API

### Phase 2: Config Options
- [ ] ConfigOptionGroup
- [ ] ConfigOption & Values
- [ ] ConfigOptionPricing
- [ ] Product ↔ Option assignment

### Phase 3: Services
- [ ] Service model
- [ ] ServiceConfigOption
- [ ] Service CRUD
- [ ] Status management

### Phase 4: Order Flow
- [ ] Price calculation
- [ ] Order creation
- [ ] Payment → Provisioning trigger
- [ ] Welcome email

### Phase 5: Addons
- [ ] ProductAddon
- [ ] AddonPricing
- [ ] ServiceAddon
- [ ] Add/Remove addon flow

---

## 6. DEPENDENCIES

```json
{
  "@prisma/client": "^5.x",
  "decimal.js": "^10.x",
  "slugify": "^1.x",
  "zod": "^3.x"
}
```

---

**İlgili Dosyalar:**
- `packages/products/src/`
- `packages/services/src/`
- `apps/admin/src/app/products/`
- `apps/admin/src/app/services/`
- `apps/client/src/app/services/`
