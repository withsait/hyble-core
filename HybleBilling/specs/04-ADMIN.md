# 04 - Admin Panel Spesifikasyonu

> **Modül:** apps/admin
> **Öncelik:** P0 (MVP)
> **Tahmini Süre:** 3 hafta

---

## 1. GENEL BAKIŞ

HybleCore Admin Panel - tüm sistemi yöneten merkezi kontrol paneli.

### 1.1 Temel Özellikler
- Dashboard & Analytics
- Customer Management
- Service Management
- Billing & Invoices
- Support Tickets
- System Configuration
- Staff Management
- Reports

---

## 2. DATABASE SCHEMA

### 2.1 Admin Users (Staff)

```prisma
model AdminUser {
  id            String      @id @default(cuid())
  
  email         String      @unique
  passwordHash  String
  
  firstName     String
  lastName      String
  
  // Role
  roleId        String
  role          AdminRole   @relation(fields: [roleId], references: [id])
  
  // 2FA
  twoFactorEnabled Boolean  @default(false)
  twoFactorSecret  String?
  
  // Status
  isActive      Boolean     @default(true)
  
  // Preferences
  preferences   Json?       // UI preferences
  
  // Security
  lastLoginAt   DateTime?
  lastLoginIp   String?
  
  // Relations
  sessions      AdminSession[]
  activityLogs  AdminActivityLog[]
  tickets       Ticket[]    @relation("AssignedTickets")
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  @@index([email])
}

model AdminRole {
  id            String      @id @default(cuid())
  
  name          String      @unique
  description   String?
  
  // Permissions
  permissions   String[]    // ["customers.view", "customers.edit", ...]
  
  // Flags
  isSystemRole  Boolean     @default(false) // Cannot be deleted
  
  users         AdminUser[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model AdminSession {
  id            String    @id @default(cuid())
  
  adminUserId   String
  adminUser     AdminUser @relation(fields: [adminUserId], references: [id], onDelete: Cascade)
  
  token         String    @unique
  
  userAgent     String?
  ipAddress     String?
  
  expiresAt     DateTime
  
  createdAt     DateTime  @default(now())
  lastActiveAt  DateTime  @default(now())
  
  @@index([adminUserId])
  @@index([token])
}

model AdminActivityLog {
  id            String    @id @default(cuid())
  
  adminUserId   String
  adminUser     AdminUser @relation(fields: [adminUserId], references: [id])
  
  action        String    // customer.create, invoice.send, etc.
  description   String?
  
  // Target
  resourceType  String?
  resourceId    String?
  
  // Changes (for audit)
  previousData  Json?
  newData       Json?
  
  ipAddress     String?
  userAgent     String?
  
  createdAt     DateTime  @default(now())
  
  @@index([adminUserId])
  @@index([action])
  @@index([createdAt])
}
```

### 2.2 System Settings

```prisma
model SystemSetting {
  id            String    @id @default(cuid())
  
  key           String    @unique
  value         Json
  
  // Kategorileme
  category      String    @default("general")
  
  // Açıklama
  description   String?
  
  // Type hint
  valueType     String    @default("string") // string, number, boolean, json
  
  updatedAt     DateTime  @updatedAt
}
```

---

## 3. PERMISSION SYSTEM

### 3.1 Permission Categories

```typescript
const permissions = {
  // Dashboard
  dashboard: ['view'],
  
  // Customers
  customers: ['view', 'create', 'edit', 'delete', 'impersonate', 'merge'],
  
  // Services
  services: ['view', 'create', 'edit', 'delete', 'suspend', 'terminate', 'module_actions'],
  
  // Products
  products: ['view', 'create', 'edit', 'delete'],
  
  // Invoices
  invoices: ['view', 'create', 'edit', 'delete', 'send', 'mark_paid', 'refund'],
  
  // Payments
  payments: ['view', 'capture', 'refund'],
  
  // Tickets
  tickets: ['view', 'reply', 'assign', 'close', 'delete'],
  
  // Domains
  domains: ['view', 'manage'],
  
  // Servers
  servers: ['view', 'create', 'edit', 'delete'],
  
  // Reports
  reports: ['view', 'export'],
  
  // Settings
  settings: ['view', 'edit'],
  
  // Staff
  staff: ['view', 'create', 'edit', 'delete'],
  
  // Logs
  logs: ['view'],
};

// Full permission: "customers.create", "invoices.refund"
```

### 3.2 Default Roles

```typescript
const defaultRoles = {
  superAdmin: {
    name: 'Super Admin',
    permissions: ['*'], // All permissions
    isSystemRole: true
  },
  admin: {
    name: 'Administrator',
    permissions: [
      'dashboard.view',
      'customers.*', 'services.*', 'products.*',
      'invoices.*', 'payments.*', 'tickets.*',
      'domains.*', 'reports.*', 'settings.view'
    ]
  },
  support: {
    name: 'Support Staff',
    permissions: [
      'dashboard.view',
      'customers.view', 'customers.edit',
      'services.view',
      'tickets.*',
      'invoices.view'
    ]
  },
  billing: {
    name: 'Billing Staff',
    permissions: [
      'dashboard.view',
      'customers.view',
      'invoices.*', 'payments.*',
      'reports.view'
    ]
  }
};
```

---

## 4. DASHBOARD

### 4.1 Summary Widgets

```typescript
interface DashboardData {
  // Özet İstatistikler
  summary: {
    totalCustomers: number;
    activeServices: number;
    pendingTickets: number;
    unpaidInvoices: number;
  };
  
  // Gelir (bu ay)
  revenue: {
    current: Decimal;
    previous: Decimal;
    change: number; // percentage
  };
  
  // Grafikler
  charts: {
    // Son 12 ay gelir
    monthlyRevenue: Array<{ month: string; amount: Decimal }>;
    
    // Ürün dağılımı
    productDistribution: Array<{ product: string; count: number }>;
    
    // Ticket durumları
    ticketStatus: Array<{ status: string; count: number }>;
  };
  
  // Son Aktiviteler
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
    resourceType?: string;
    resourceId?: string;
  }>;
  
  // Bekleyen İşlemler
  pendingActions: {
    pendingOrders: number;
    fraudReview: number;
    pendingTickets: number;
    expiringSoon: number;
  };
  
  // To-Do List
  todos: TodoItem[];
}
```

### 4.2 To-Do System

```prisma
model AdminTodo {
  id            String       @id @default(cuid())
  
  adminUserId   String?      // null = global
  adminUser     AdminUser?   @relation(fields: [adminUserId], references: [id])
  
  title         String
  description   String?
  
  // Link
  resourceType  String?
  resourceId    String?
  
  // Priority
  priority      TodoPriority @default(MEDIUM)
  
  // Durum
  isCompleted   Boolean      @default(false)
  completedAt   DateTime?
  
  // Due date
  dueDate       DateTime?
  
  createdAt     DateTime     @default(now())
  
  @@index([adminUserId])
}

enum TodoPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

---

## 5. ADMIN PAGES

### 5.1 Page Structure

```
apps/admin/src/app/
├── (auth)/
│   ├── login/
│   └── forgot-password/
├── (dashboard)/
│   ├── layout.tsx              # Sidebar + Header
│   ├── page.tsx                # Dashboard
│   │
│   ├── customers/
│   │   ├── page.tsx            # List
│   │   ├── [id]/
│   │   │   ├── page.tsx        # View
│   │   │   ├── edit/
│   │   │   ├── services/
│   │   │   ├── invoices/
│   │   │   └── tickets/
│   │   └── create/
│   │
│   ├── services/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   └── create/
│   │
│   ├── products/
│   │   ├── page.tsx
│   │   ├── groups/
│   │   ├── [id]/
│   │   └── create/
│   │
│   ├── billing/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── transactions/
│   │   └── gateways/
│   │
│   ├── support/
│   │   ├── tickets/
│   │   ├── knowledgebase/
│   │   └── announcements/
│   │
│   ├── domains/
│   │   ├── page.tsx
│   │   └── registrars/
│   │
│   ├── servers/
│   │   ├── page.tsx
│   │   └── modules/
│   │
│   ├── reports/
│   │   ├── income/
│   │   ├── customers/
│   │   ├── tickets/
│   │   └── custom/
│   │
│   ├── settings/
│   │   ├── general/
│   │   ├── billing/
│   │   ├── support/
│   │   ├── email/
│   │   ├── security/
│   │   └── automation/
│   │
│   ├── staff/
│   │   ├── page.tsx
│   │   ├── roles/
│   │   └── activity/
│   │
│   └── system/
│       ├── logs/
│       ├── cron/
│       └── health/
```

---

## 6. UI COMPONENTS

### 6.1 Layout Components

```typescript
// Sidebar Navigation
interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  permission?: string;
  children?: NavItem[];
  badge?: number | 'dot';
}

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { 
    label: 'Customers', 
    icon: Users, 
    href: '/customers',
    permission: 'customers.view'
  },
  { 
    label: 'Services', 
    icon: Server, 
    href: '/services',
    permission: 'services.view' 
  },
  {
    label: 'Products',
    icon: Package,
    permission: 'products.view',
    children: [
      { label: 'All Products', href: '/products' },
      { label: 'Groups', href: '/products/groups' },
      { label: 'Config Options', href: '/products/config-options' },
      { label: 'Addons', href: '/products/addons' },
    ]
  },
  {
    label: 'Billing',
    icon: CreditCard,
    permission: 'invoices.view',
    children: [
      { label: 'Invoices', href: '/billing/invoices', badge: 5 },
      { label: 'Payments', href: '/billing/payments' },
      { label: 'Transactions', href: '/billing/transactions' },
      { label: 'Gateways', href: '/billing/gateways' },
    ]
  },
  // ... more items
];
```

### 6.2 Data Table Component

```typescript
// Generic DataTable with search, filter, sort, pagination
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  total: number;
  
  // Pagination
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  
  // Search
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  
  // Filters
  filters?: FilterConfig[];
  
  // Sorting
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  
  // Row actions
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => DropdownMenuItem[];
  
  // Bulk actions
  selectable?: boolean;
  bulkActions?: BulkAction[];
  
  // Loading
  loading?: boolean;
}
```

### 6.3 Form Components

```typescript
// Customer Form
<CustomerForm
  mode="create" | "edit"
  initialData?={customer}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>

// Product Form
<ProductForm
  mode="create" | "edit"
  initialData?={product}
  groups={productGroups}
  modules={serverModules}
  onSubmit={handleSubmit}
/>

// Invoice Form
<InvoiceForm
  customer={customer}
  services?={services}
  onSubmit={handleSubmit}
/>
```

---

## 7. API ENDPOINTS

### 7.1 Admin Auth

```typescript
// tRPC Router: adminAuthRouter

adminAuth.login
  Input: { email, password }
  Output: { session, user, requiresTwoFactor? }

adminAuth.verify2FA
  Input: { tempToken, code }
  Output: { session, user }

adminAuth.logout
  Input: {}
  Output: { success }

adminAuth.me
  Input: {}
  Output: AdminUser (with role & permissions)
```

### 7.2 Dashboard API

```typescript
// tRPC Router: dashboardRouter

dashboard.getSummary
  Input: {}
  Output: DashboardData

dashboard.getRevenueChart
  Input: { period: '7d' | '30d' | '12m' }
  Output: ChartData[]

dashboard.getRecentActivity
  Input: { limit?: number }
  Output: ActivityItem[]

dashboard.getTodos
  Input: {}
  Output: TodoItem[]

dashboard.createTodo
  Input: { title, description?, priority?, dueDate? }
  Output: TodoItem

dashboard.completeTodo
  Input: { id }
  Output: TodoItem
```

### 7.3 Staff Management API

```typescript
// tRPC Router: staffRouter

staff.list
  Input: { page?, limit?, search? }
  Output: { users: AdminUser[], total }

staff.get
  Input: { id }
  Output: AdminUser

staff.create
  Input: { email, firstName, lastName, password, roleId }
  Output: AdminUser

staff.update
  Input: { id, ...partial }
  Output: AdminUser

staff.delete
  Input: { id }
  Output: { success }

staff.resetPassword
  Input: { id }
  Output: { tempPassword }

// Roles
staff.roles.list
staff.roles.create
staff.roles.update
staff.roles.delete
```

---

## 8. SYSTEM SETTINGS

### 8.1 Setting Categories

```typescript
const settingCategories = {
  general: {
    companyName: string,
    logoUrl: string,
    systemUrl: string,
    timezone: string,
    dateFormat: string,
    defaultLanguage: string
  },
  
  billing: {
    defaultCurrency: string,
    invoicePrefix: string,
    invoiceDueDays: number,
    enableTax: boolean,
    taxIncludedPricing: boolean,
    lateFeeEnabled: boolean,
    lateFeeAmount: number,
    lateFeeType: 'fixed' | 'percentage'
  },
  
  support: {
    ticketDepartments: string[],
    defaultPriority: string,
    autoCloseInactiveDays: number,
    requireLogin: boolean
  },
  
  security: {
    require2FA: boolean,
    sessionTimeout: number,
    maxLoginAttempts: number,
    passwordMinLength: number,
    passwordRequireSpecial: boolean
  },
  
  email: {
    fromName: string,
    fromEmail: string,
    smtpHost: string,
    smtpPort: number,
    smtpUser: string,
    smtpPassword: string, // encrypted
    smtpEncryption: 'none' | 'tls' | 'ssl'
  },
  
  automation: {
    enableAutoSuspend: boolean,
    suspendAfterDays: number,
    enableAutoTerminate: boolean,
    terminateAfterDays: number,
    sendReminders: boolean,
    reminderDays: number[]
  }
};
```

---

## 9. TASKS / CHECKLIST

### Phase 1: Core Admin (1. Hafta)
- [ ] Admin auth (login, 2FA)
- [ ] Layout (sidebar, header)
- [ ] Dashboard widgets
- [ ] Basic navigation

### Phase 2: Entity Management (2. Hafta)
- [ ] Customer pages (list, view, create, edit)
- [ ] Service pages
- [ ] Invoice pages
- [ ] DataTable component

### Phase 3: Configuration (3. Hafta)
- [ ] Product management pages
- [ ] Settings pages
- [ ] Staff & roles
- [ ] Activity logs

### Phase 4: Polish
- [ ] Keyboard shortcuts
- [ ] Bulk actions
- [ ] Export functionality
- [ ] Dark mode

---

## 10. DEPENDENCIES

```json
{
  "next": "^14.x",
  "@tanstack/react-table": "^8.x",
  "recharts": "^2.x",
  "lucide-react": "^0.x",
  "@radix-ui/react-*": "^1.x",
  "tailwindcss": "^3.x",
  "class-variance-authority": "^0.x",
  "date-fns": "^3.x"
}
```

---

**İlgili Dosyalar:**
- `apps/admin/`
- `packages/ui/` (shared components)
- `packages/auth/src/admin/`
