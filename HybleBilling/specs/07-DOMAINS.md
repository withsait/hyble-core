# 07 - Domain Yönetimi Spesifikasyonu

> **Modül:** @hyble/domains
> **Öncelik:** P3
> **Tahmini Süre:** 2-3 hafta

---

## 1. DATABASE SCHEMA

```prisma
model DomainRegistrar {
  id            String    @id @default(cuid())
  name          String    // Enom, ResellerClub
  slug          String    @unique
  
  // Credentials (encrypted)
  credentials   Json
  
  // Settings
  defaultNameservers String[]
  
  isActive      Boolean   @default(false)
  isDefault     Boolean   @default(false)
  
  domains       Domain[]
  tlds          DomainTLD[]
}

model DomainTLD {
  id            String          @id @default(cuid())
  
  extension     String          @unique // .com, .net, .io
  
  registrarId   String
  registrar     DomainRegistrar @relation(fields: [registrarId], references: [id])
  
  // Pricing
  pricing       DomainPricing[]
  
  // Features
  supportsIdProtection  Boolean @default(true)
  supportsDnssec       Boolean @default(false)
  
  // Grace periods (days)
  gracePeriod         Int @default(30)
  redemptionPeriod    Int @default(30)
  
  // Min/Max years
  minYears      Int       @default(1)
  maxYears      Int       @default(10)
  
  isActive      Boolean   @default(true)
  
  @@index([extension])
}

model DomainPricing {
  id            String    @id @default(cuid())
  
  tldId         String
  tld           DomainTLD @relation(fields: [tldId], references: [id])
  
  currencyCode  String
  
  // Prices
  registerPrice Decimal   @db.Decimal(10, 2)
  renewPrice    Decimal   @db.Decimal(10, 2)
  transferPrice Decimal   @db.Decimal(10, 2)
  
  // ID Protection (addon)
  idProtectionPrice Decimal? @db.Decimal(10, 2)
  
  @@unique([tldId, currencyCode])
}

model Domain {
  id            String         @id @default(cuid())
  
  customerId    String
  customer      Customer       @relation(fields: [customerId], references: [id])
  
  registrarId   String
  registrar     DomainRegistrar @relation(fields: [registrarId], references: [id])
  
  // Domain info
  domain        String         @unique
  
  // Status
  status        DomainStatus   @default(PENDING)
  
  // Dates
  registrationDate DateTime?
  expiryDate       DateTime?
  nextDueDate      DateTime
  
  // Nameservers
  nameservers   String[]
  
  // WHOIS Contact IDs (at registrar)
  registrantContactId String?
  adminContactId      String?
  techContactId       String?
  billingContactId    String?
  
  // Features
  idProtection  Boolean        @default(false)
  autoRenew     Boolean        @default(true)
  
  // Transfer
  eppCode       String?        // Encrypted
  
  // DNS Records (if managed)
  dnsRecords    DnsRecord[]
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  @@index([customerId])
  @@index([domain])
}

enum DomainStatus {
  PENDING
  ACTIVE
  EXPIRED
  REDEMPTION
  PENDING_TRANSFER
  TRANSFERRED_AWAY
  CANCELLED
}

model DnsRecord {
  id          String   @id @default(cuid())
  domainId    String
  domain      Domain   @relation(fields: [domainId], references: [id], onDelete: Cascade)
  
  type        String   // A, AAAA, CNAME, MX, TXT, etc.
  name        String   // @ or subdomain
  content     String
  ttl         Int      @default(3600)
  priority    Int?     // MX, SRV
  
  @@index([domainId])
}
```

---

## 2. REGISTRAR INTERFACE

```typescript
interface DomainRegistrarInterface {
  // Availability
  checkAvailability(domain: string): Promise<AvailabilityResult>;
  checkBulkAvailability(domains: string[]): Promise<AvailabilityResult[]>;
  
  // Registration
  register(domain: string, years: number, contacts: DomainContacts): Promise<RegistrationResult>;
  
  // Renewal
  renew(domain: string, years: number): Promise<boolean>;
  
  // Transfer
  initiateTransfer(domain: string, eppCode: string): Promise<TransferResult>;
  getTransferStatus(domain: string): Promise<TransferStatus>;
  
  // Management
  getNameservers(domain: string): Promise<string[]>;
  setNameservers(domain: string, nameservers: string[]): Promise<boolean>;
  getWhoisInfo(domain: string): Promise<WhoisInfo>;
  updateWhoisInfo(domain: string, contacts: DomainContacts): Promise<boolean>;
  
  // EPP Code
  getEppCode(domain: string): Promise<string>;
  
  // ID Protection
  enableIdProtection(domain: string): Promise<boolean>;
  disableIdProtection(domain: string): Promise<boolean>;
  
  // DNS (if supported)
  getDnsRecords?(domain: string): Promise<DnsRecord[]>;
  setDnsRecords?(domain: string, records: DnsRecord[]): Promise<boolean>;
}
```

---

## 3. API ENDPOINTS

```typescript
// Public
domains.checkAvailability    // Single check
domains.checkBulk           // Bulk check
domains.getSuggestions      // Domain namespinning

// Client
domains.list
domains.get
domains.getNameservers
domains.setNameservers
domains.getEppCode
domains.enableIdProtection
domains.disableIdProtection
domains.getDnsRecords
domains.setDnsRecords
domains.setAutoRenew

// Admin
admin.domains.list
admin.domains.register
admin.domains.renew
admin.domains.transfer
admin.domains.sync         // Registrar'dan sync
```

---

## 4. TASKS

- [ ] DomainRegistrar model
- [ ] DomainTLD & pricing
- [ ] Domain model
- [ ] Registrar interface
- [ ] Generic API registrar (REST-based)
- [ ] Domain check & suggestions
- [ ] Registration flow
- [ ] Transfer flow
- [ ] DNS management
- [ ] Auto-renewal job
- [ ] Expiry notifications
