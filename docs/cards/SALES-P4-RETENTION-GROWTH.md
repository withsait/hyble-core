# SALES-P4: Retention & Growth Features

## Özet
Referral programı, email drip campaigns, usage alerts ve NPS survey sistemi. Müşteri kaybını azalt, LTV artır.

## Öncelik: P4
## Tahmini Süre: 24-32 saat
## Etkilenen Alanlar: hyble-panel, packages/email, packages/db
## Bağımlılık: SALES-P2 tamamlanmış olmalı

---

## Görevler

### 1. Referral Program Sistemi

#### 1.1 Prisma Schema

**Dosya:** `packages/db/prisma/schema.prisma`

```prisma
// ==================== REFERRAL PROGRAM ====================

model ReferralCode {
  id          String   @id @default(cuid())
  userId      String   @unique
  code        String   @unique // AHMET20, custom code
  commission  Int      @default(20) // %20 komisyon
  discount    Int      @default(20) // %20 indirim
  totalEarned Decimal  @default(0) @db.Decimal(18, 2)
  totalPaid   Decimal  @default(0) @db.Decimal(18, 2)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  referrals Referral[]

  @@index([code])
  @@index([userId])
}

model Referral {
  id              String    @id @default(cuid())
  referralCodeId  String
  referredUserId  String    @unique // Davet edilen
  status          String    @default("pending") // pending, converted, paid
  conversionValue Decimal?  @db.Decimal(18, 2) // İlk ödeme tutarı
  commission      Decimal?  @db.Decimal(18, 2) // Kazanılan komisyon
  paidAt          DateTime?
  createdAt       DateTime  @default(now())
  convertedAt     DateTime?

  referralCode ReferralCode @relation(fields: [referralCodeId], references: [id], onDelete: Cascade)

  @@index([referralCodeId])
  @@index([referredUserId])
  @@index([status])
}
```

#### 1.2 Referral API Router

**Dosya:** `apps/hyble-panel/src/server/routers/referral.ts`

```typescript
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";
import { TRPCError } from "@trpc/server";

export const referralRouter = router({
  // Referral kodunu getir veya oluştur
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    let referralCode = await prisma.referralCode.findUnique({
      where: { userId: ctx.user.id },
      include: {
        referrals: {
          select: {
            id: true,
            status: true,
            commission: true,
            createdAt: true,
            convertedAt: true,
          },
        },
      },
    });

    if (!referralCode) {
      // Otomatik kod oluştur
      const code = await generateUniqueCode(ctx.user.name || ctx.user.email);
      referralCode = await prisma.referralCode.create({
        data: {
          userId: ctx.user.id,
          code,
        },
        include: { referrals: true },
      });
    }

    return {
      code: referralCode.code,
      link: `https://hyble.co/ref/${referralCode.code}`,
      commission: referralCode.commission,
      discount: referralCode.discount,
      stats: {
        totalReferrals: referralCode.referrals.length,
        converted: referralCode.referrals.filter(r => r.status === "converted").length,
        pending: referralCode.referrals.filter(r => r.status === "pending").length,
        totalEarned: referralCode.totalEarned,
        totalPaid: referralCode.totalPaid,
        pendingPayout: Number(referralCode.totalEarned) - Number(referralCode.totalPaid),
      },
      referrals: referralCode.referrals,
    };
  }),

  // Özel kod iste
  requestCustomCode: protectedProcedure
    .input(z.object({ code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.referralCode.findUnique({
        where: { code: input.code },
      });

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Bu kod zaten kullanımda" });
      }

      await prisma.referralCode.update({
        where: { userId: ctx.user.id },
        data: { code: input.code },
      });

      return { success: true, code: input.code };
    }),

  // Referral kodu doğrula (kayıt sırasında)
  validateCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const referralCode = await prisma.referralCode.findUnique({
        where: { code: input.code.toUpperCase(), isActive: true },
        include: { user: { select: { name: true } } },
      });

      if (!referralCode) {
        return { valid: false };
      }

      return {
        valid: true,
        discount: referralCode.discount,
        referrerName: referralCode.user.name?.split(" ")[0] || "Bir arkadaşın",
      };
    }),

  // Referral kaydet (kayıt sonrası)
  trackReferral: publicProcedure
    .input(z.object({ code: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      const referralCode = await prisma.referralCode.findUnique({
        where: { code: input.code.toUpperCase() },
      });

      if (!referralCode) return { success: false };

      // Kendini referans edemez
      if (referralCode.userId === input.userId) return { success: false };

      await prisma.referral.create({
        data: {
          referralCodeId: referralCode.id,
          referredUserId: input.userId,
          status: "pending",
        },
      });

      return { success: true };
    }),

  // Payout talep et
  requestPayout: protectedProcedure.mutation(async ({ ctx }) => {
    const referralCode = await prisma.referralCode.findUnique({
      where: { userId: ctx.user.id },
    });

    if (!referralCode) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const pendingAmount = Number(referralCode.totalEarned) - Number(referralCode.totalPaid);
    
    if (pendingAmount < 50) {
      throw new TRPCError({ 
        code: "BAD_REQUEST", 
        message: "Minimum payout tutarı €50" 
      });
    }

    // PayoutRequest oluştur (manuel onay için)
    await prisma.payoutRequest.create({
      data: {
        userId: ctx.user.id,
        amount: pendingAmount,
        status: "pending",
      },
    });

    return { success: true, amount: pendingAmount };
  }),
});

async function generateUniqueCode(name: string): Promise<string> {
  const base = name.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6);
  let code = base + Math.floor(Math.random() * 100);
  
  while (await prisma.referralCode.findUnique({ where: { code } })) {
    code = base + Math.floor(Math.random() * 1000);
  }
  
  return code;
}
```

#### 1.3 Referral Dashboard UI

**Dosya:** `apps/hyble-panel/src/app/(panel)/referrals/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { 
  Users, DollarSign, Link2, Copy, Check, 
  TrendingUp, Clock, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";

export default function ReferralsPage() {
  const { data, isLoading } = trpc.referral.getMyCode.useQuery();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (data?.link) {
      navigator.clipboard.writeText(data.link);
      setCopied(true);
      toast.success("Link kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) return <div>Yükleniyor...</div>;
  if (!data) return <div>Hata</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">Referral Programı</h1>
      <p className="text-slate-500 mb-8">
        Arkadaşlarını davet et, %{data.commission} komisyon kazan.
      </p>

      {/* Referral Link */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-slate-500 mb-1 block">
              Referral Linkin
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={data.link}
                readOnly
                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
              <button
                onClick={copyLink}
                className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-6 text-sm text-slate-500">
          <span>Kod: <strong className="text-slate-900 dark:text-white">{data.code}</strong></span>
          <span>Arkadaşın %{data.discount} indirim kazanır</span>
          <span>Sen %{data.commission} komisyon kazanırsın</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Toplam Referral"
          value={data.stats.totalReferrals}
        />
        <StatCard
          icon={TrendingUp}
          label="Dönüşen"
          value={data.stats.converted}
        />
        <StatCard
          icon={DollarSign}
          label="Toplam Kazanç"
          value={`€${data.stats.totalEarned}`}
        />
        <StatCard
          icon={Clock}
          label="Bekleyen Ödeme"
          value={`€${data.stats.pendingPayout}`}
        />
      </div>

      {/* Referral List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold">Referral Geçmişi</h2>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {data.referrals.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Henüz referral yok. Linkini paylaşmaya başla!
            </div>
          ) : (
            data.referrals.map((referral) => (
              <div key={referral.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {new Date(referral.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                  <div className="text-xs text-slate-500">
                    {referral.status === "pending" ? "Beklemede" : 
                     referral.status === "converted" ? "Dönüştü" : "Ödendi"}
                  </div>
                </div>
                <div className="text-right">
                  {referral.commission && (
                    <div className="text-sm font-medium text-emerald-600">
                      +€{referral.commission}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );
}
```

### 2. Usage Alerts Sistemi

**Dosya:** `apps/hyble-panel/src/server/jobs/usage-alerts.ts`

```typescript
import { prisma } from "@hyble/db";
import { sendEmail } from "@hyble/email";

interface UsageThreshold {
  resource: string;
  thresholds: number[]; // [50, 80, 90, 100]
}

const THRESHOLDS: UsageThreshold[] = [
  { resource: "api_calls", thresholds: [50, 80, 90, 100] },
  { resource: "storage", thresholds: [50, 80, 90, 100] },
  { resource: "bandwidth", thresholds: [50, 80, 90, 100] },
];

export async function checkUsageAlerts() {
  const subscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { id: true, email: true, name: true } },
      plan: true,
    },
  });

  for (const sub of subscriptions) {
    const usage = await getUsageForSubscription(sub.id);

    for (const { resource, thresholds } of THRESHOLDS) {
      const currentUsage = usage[resource];
      const limit = sub.plan.limits[resource];
      const percentage = (currentUsage / limit) * 100;

      // Geçilen threshold'u bul
      const crossedThreshold = thresholds
        .reverse()
        .find(t => percentage >= t);

      if (crossedThreshold) {
        // Daha önce bu threshold için alert gönderilmiş mi?
        const existingAlert = await prisma.usageAlert.findFirst({
          where: {
            subscriptionId: sub.id,
            resource,
            threshold: crossedThreshold,
            billingPeriod: getCurrentBillingPeriod(),
          },
        });

        if (!existingAlert) {
          // Alert kaydet
          await prisma.usageAlert.create({
            data: {
              subscriptionId: sub.id,
              userId: sub.user.id,
              resource,
              threshold: crossedThreshold,
              currentUsage,
              limit,
              billingPeriod: getCurrentBillingPeriod(),
            },
          });

          // Email gönder
          await sendEmail({
            to: sub.user.email,
            template: "usage_alert",
            data: {
              name: sub.user.name,
              resource: getResourceDisplayName(resource),
              percentage: crossedThreshold,
              currentUsage: formatUsage(currentUsage, resource),
              limit: formatUsage(limit, resource),
              upgradeLink: `https://panel.hyble.co/subscription/upgrade`,
            },
          });

          // 100% ise panel notification da göster
          if (crossedThreshold === 100) {
            await prisma.notification.create({
              data: {
                userId: sub.user.id,
                type: "usage_limit",
                title: `${getResourceDisplayName(resource)} limitine ulaştın`,
                message: "Hizmet kesintisi yaşamamak için planını yükselt.",
                actionUrl: "/subscription/upgrade",
                priority: "high",
              },
            });
          }
        }
      }
    }
  }
}

function getResourceDisplayName(resource: string): string {
  const names: Record<string, string> = {
    api_calls: "API Çağrısı",
    storage: "Depolama",
    bandwidth: "Bant Genişliği",
  };
  return names[resource] || resource;
}

function formatUsage(value: number, resource: string): string {
  if (resource === "storage" || resource === "bandwidth") {
    return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }
  return value.toLocaleString();
}

function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

async function getUsageForSubscription(subscriptionId: string) {
  // Gerçek usage hesaplama logic'i
  // API logs, storage metrics, bandwidth metrics'den toplanacak
  return {
    api_calls: 0,
    storage: 0,
    bandwidth: 0,
  };
}
```

### 3. NPS Survey Sistemi

**Dosya:** `apps/hyble-panel/src/components/NpsSurvey.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function NpsSurvey() {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [step, setStep] = useState<"score" | "feedback" | "thanks">("score");

  const { data: shouldShow } = trpc.nps.shouldShowSurvey.useQuery();
  const submitMutation = trpc.nps.submit.useMutation();

  useEffect(() => {
    if (shouldShow) {
      // 30 saniye sonra göster
      const timer = setTimeout(() => setIsOpen(true), 30000);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  const handleScoreSelect = (value: number) => {
    setScore(value);
    setStep("feedback");
  };

  const handleSubmit = async () => {
    if (score === null) return;

    await submitMutation.mutateAsync({
      score,
      feedback: feedback.trim() || undefined,
    });

    setStep("thanks");
    setTimeout(() => setIsOpen(false), 3000);
  };

  const handleSkip = () => {
    submitMutation.mutate({ score: -1, skipped: true });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50 w-96"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <span className="font-medium">Görüşleriniz</span>
            </div>
            <button onClick={handleSkip} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {step === "score" && (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Hyble'ı bir arkadaşınıza önerir misiniz?
                </p>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleScoreSelect(value)}
                      className={`
                        w-8 h-8 rounded text-sm font-medium transition-colors
                        ${value <= 6 
                          ? "hover:bg-red-100 hover:text-red-600" 
                          : value <= 8 
                          ? "hover:bg-yellow-100 hover:text-yellow-600"
                          : "hover:bg-green-100 hover:text-green-600"
                        }
                        bg-slate-100 dark:bg-slate-700
                      `}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Hiç önermem</span>
                  <span>Kesinlikle öneririm</span>
                </div>
              </>
            )}

            {step === "feedback" && (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {score! <= 6 
                    ? "Neyi daha iyi yapabiliriz?" 
                    : score! <= 8
                    ? "Deneyiminizi nasıl iyileştirebiliriz?"
                    : "Bizi bu kadar sevmenizin sebebi nedir?"
                  }
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Görüşlerinizi paylaşın (opsiyonel)"
                  className="w-full h-24 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setStep("score")}
                    className="flex-1 py-2 text-sm text-slate-500 hover:text-slate-700"
                  >
                    Geri
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
                  >
                    Gönder
                  </button>
                </div>
              </>
            )}

            {step === "thanks" && (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">🙏</div>
                <p className="font-medium">Teşekkürler!</p>
                <p className="text-sm text-slate-500">Geri bildiriminiz bizim için çok değerli.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Kontrol Listesi

- [x] ReferralCode, Referral modelleri eklendi
- [x] Referral API router oluşturuldu
- [ ] Referral dashboard sayfası oluşturuldu (UI only - needs implementation)
- [ ] Kayıt formuna referral code input eklendi
- [ ] Usage alerts cron job oluşturuldu
- [x] Usage alert email template oluşturuldu
- [ ] NPS survey komponenti oluşturuldu (template provided, needs implementation)
- [x] NPS API router oluşturuldu
- [ ] Panel layout'a NpsSurvey eklendi
- [x] Payout request sistemi hazırlandı

## Cron Jobs

```typescript
// Her saat usage kontrolü
cron.schedule("0 * * * *", checkUsageAlerts);

// Her gün NPS survey gösterilecek kullanıcıları belirle
cron.schedule("0 9 * * *", determineNpsSurveyRecipients);

// Her gün email drip campaign gönder
cron.schedule("0 10 * * *", processEmailSequences);
```

## Test

```bash
pnpm db:push
pnpm dev --filter hyble-panel

# Test referral
# 1. /referrals sayfasına git
# 2. Link kopyala
# 3. Incognito'da kayıt ol
# 4. Komisyon kaydedildi mi kontrol et
```
