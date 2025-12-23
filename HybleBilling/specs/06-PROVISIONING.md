# 06 - Server Provisioning Spesifikasyonu

> **Modül:** @hyble/provisioning
> **Öncelik:** P2
> **Tahmini Süre:** 3-4 hafta

---

## 1. DATABASE SCHEMA

### 1.1 Servers

```prisma
model Server {
  id            String       @id @default(cuid())
  
  name          String
  hostname      String
  ipAddress     String
  
  // Type
  type          ServerType
  
  // Module
  moduleId      String
  module        ServerModule @relation(fields: [moduleId], references: [id])
  
  // Credentials (encrypted)
  credentials   Json
  
  // Capacity
  maxAccounts   Int?
  
  // Status
  status        ServerStatus @default(ACTIVE)
  isDisabled    Boolean      @default(false)
  
  // Monitoring
  lastCheckedAt DateTime?
  
  // Group
  groupId       String?
  group         ServerGroup? @relation(fields: [groupId], references: [id])
  
  services      Service[]
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

enum ServerType {
  SHARED        // Shared hosting
  RESELLER      // Reseller hosting
  VPS           // VPS
  DEDICATED     // Dedicated
  GAME          // Game servers
}

enum ServerStatus {
  ACTIVE
  OFFLINE
  MAINTENANCE
}

model ServerGroup {
  id          String   @id @default(cuid())
  name        String
  fillType    String   @default("fill") // fill, round-robin
  servers     Server[]
}

model ServerModule {
  id            String    @id @default(cuid())
  
  name          String    // cPanel, Plesk, Pickaxe
  slug          String    @unique
  
  // Module type
  type          String    // hosting, vps, game, custom
  
  // Configuration schema
  configSchema  Json?
  
  // Features
  supportsSuspend    Boolean @default(true)
  supportsUnsuspend  Boolean @default(true)
  supportsTerminate  Boolean @default(true)
  supportsUsage      Boolean @default(false)
  supportsSSO        Boolean @default(false)
  
  isActive      Boolean   @default(true)
  
  servers       Server[]
  products      Product[]
}
```

---

## 2. MODULE INTERFACE

### 2.1 Base Module Interface

```typescript
interface ServerModuleInterface {
  // Metadata
  readonly name: string;
  readonly slug: string;
  readonly version: string;
  readonly configSchema: z.ZodSchema;
  
  // Connection test
  testConnection(server: Server): Promise<boolean>;
  
  // Account operations
  create(service: Service, server: Server): Promise<CreateResult>;
  suspend(service: Service, server: Server): Promise<boolean>;
  unsuspend(service: Service, server: Server): Promise<boolean>;
  terminate(service: Service, server: Server): Promise<boolean>;
  
  // Password
  changePassword(service: Service, server: Server, newPassword: string): Promise<boolean>;
  
  // Usage (optional)
  getUsage?(service: Service, server: Server): Promise<UsageData>;
  
  // SSO (optional)
  getSSOUrl?(service: Service, server: Server): Promise<string>;
  
  // Custom actions (optional)
  customActions?: CustomAction[];
}

interface CreateResult {
  success: boolean;
  username?: string;
  password?: string;
  domain?: string;
  ip?: string;
  nameservers?: string[];
  additionalData?: Record<string, any>;
  error?: string;
}

interface UsageData {
  diskUsed: number;      // bytes
  diskLimit: number;
  bandwidthUsed: number; // bytes
  bandwidthLimit: number;
  emailAccounts?: number;
  databases?: number;
}
```

---

## 3. BUILT-IN MODULES

### 3.1 Pickaxe (Game Server - Hyble Custom)

```typescript
// packages/provisioning/src/modules/pickaxe.ts

class PickaxeModule implements ServerModuleInterface {
  name = 'Pickaxe';
  slug = 'pickaxe';
  
  configSchema = z.object({
    apiUrl: z.string().url(),
    apiKey: z.string(),
    nodeId: z.string()
  });
  
  async create(service: Service, server: Server): Promise<CreateResult> {
    const config = this.getConfig(server);
    
    // Pickaxe API call
    const response = await fetch(`${config.apiUrl}/servers`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        name: service.domain || `server-${service.id}`,
        nodeId: config.nodeId,
        game: service.product.moduleSettings?.game || 'minecraft',
        ram: service.configOptions.find(o => o.optionId === 'ram')?.quantity || 2048,
        cpu: service.configOptions.find(o => o.optionId === 'cpu')?.quantity || 100,
        disk: service.configOptions.find(o => o.optionId === 'disk')?.quantity || 10240,
      })
    });
    
    const data = await response.json();
    
    return {
      success: true,
      username: data.serverId,
      ip: data.ip,
      additionalData: {
        port: data.port,
        ftpPort: data.ftpPort
      }
    };
  }
  
  // ... other methods
}
```

### 3.2 cPanel/WHM Module

```typescript
class CPanelModule implements ServerModuleInterface {
  name = 'cPanel/WHM';
  slug = 'cpanel';
  
  configSchema = z.object({
    hostname: z.string(),
    port: z.number().default(2087),
    username: z.string(),
    accessHash: z.string(), // WHM access hash
    useSsl: z.boolean().default(true)
  });
  
  async create(service: Service, server: Server): Promise<CreateResult> {
    const whm = this.getClient(server);
    
    const result = await whm.createacct({
      username: this.generateUsername(service),
      domain: service.domain,
      plan: service.product.moduleSettings?.plan,
      password: generatePassword()
    });
    
    return {
      success: result.result === 1,
      username: result.options?.user,
      password: result.options?.pass,
      ip: result.options?.ip,
      nameservers: [result.options?.nameserver, result.options?.nameserver2]
    };
  }
}
```

---

## 4. PROVISIONING FLOW

```typescript
// Provisioning job
async function provisionService(serviceId: string) {
  const service = await db.service.findUnique({
    where: { id: serviceId },
    include: { product: true, customer: true }
  });
  
  // 1. Server seç
  const server = await selectServer(service.product);
  
  // 2. Module al
  const module = getModule(service.product.moduleId);
  
  // 3. Create
  try {
    const result = await module.create(service, server);
    
    if (result.success) {
      await db.service.update({
        where: { id: service.id },
        data: {
          status: 'ACTIVE',
          serverId: server.id,
          username: result.username,
          password: encrypt(result.password),
          dedicatedIp: result.ip
        }
      });
      
      await sendWelcomeEmail(service, result);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    await handleProvisioningError(service, error);
  }
}

// Server selection
async function selectServer(product: Product): Promise<Server> {
  const group = await db.serverGroup.findFirst({
    where: { id: product.serverGroupId },
    include: { servers: { where: { status: 'ACTIVE' } } }
  });
  
  if (group.fillType === 'fill') {
    // En az account olan server
    return group.servers.sort((a, b) => a.accountCount - b.accountCount)[0];
  } else {
    // Round robin
    return group.servers[Math.floor(Math.random() * group.servers.length)];
  }
}
```

---

## 5. TASKS

- [ ] Server model & CRUD
- [ ] ServerModule model
- [ ] Module interface definition
- [ ] Pickaxe module (Minecraft)
- [ ] Generic module (API-based)
- [ ] Server selection logic
- [ ] Provisioning queue (BullMQ)
- [ ] Usage sync job
- [ ] SSO implementation
