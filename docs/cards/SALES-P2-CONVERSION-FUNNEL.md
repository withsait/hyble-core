# SALES-P2: Conversion Funnel & Lead Capture

## Özet
Exit-intent popup, live chat entegrasyonu, email drip campaign ve onboarding wizard ekle. Ziyaretçileri müşteriye çevir.

## Öncelik: P2
## Tahmini Süre: 16-20 saat
## Etkilenen Alanlar: hyble-web, hyble-panel, packages/email
## Bağımlılık: SALES-P1 tamamlanmış olmalı

---

## Görevler

### 1. Exit Intent Popup Komponenti

**Dosya:** `apps/hyble-web/src/components/conversion/ExitIntentPopup.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { X, Gift, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Daha önce gösterildi mi kontrol et
    const shown = localStorage.getItem("exitPopupShown");
    if (shown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        localStorage.setItem("exitPopupShown", "true");
      }
    };

    // 5 saniye sonra event listener ekle
    const timeout = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          source: "exit_intent",
          couponCode: "WELCOME20" 
        }),
      });
      
      // Success state göster
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Gift className="w-8 h-8 text-amber-500" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Bekle! %20 İndirim Kazan
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                İlk alışverişinde geçerli indirim kodunu almak için e-postanı bırak.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? "Gönderiliyor..." : (
                    <>
                      İndirim Kodunu Al
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-slate-400 mt-4">
                Spam göndermiyoruz. İstediğin zaman çıkabilirsin.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 2. Lead Capture API Endpoint

**Dosya:** `apps/hyble-panel/src/server/routers/lead.ts`

```typescript
import { z } from "zod";
import { router, publicProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";
import { sendEmail } from "@hyble/email";

export const leadRouter = router({
  capture: publicProcedure
    .input(z.object({
      email: z.string().email(),
      source: z.enum(["exit_intent", "newsletter", "waitlist", "demo_request"]),
      couponCode: z.string().optional(),
      metadata: z.record(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      // Lead kaydet
      const lead = await prisma.lead.upsert({
        where: { email: input.email },
        update: { 
          lastSource: input.source,
          updatedAt: new Date(),
        },
        create: {
          email: input.email,
          source: input.source,
          couponCode: input.couponCode,
          metadata: input.metadata,
        },
      });

      // Welcome email gönder
      if (input.couponCode) {
        await sendEmail({
          to: input.email,
          template: "welcome_coupon",
          data: {
            couponCode: input.couponCode,
            discount: "20%",
          },
        });
      }

      // Drip campaign'e ekle
      await prisma.emailSequence.create({
        data: {
          leadId: lead.id,
          sequenceName: "onboarding_7day",
          currentStep: 0,
          nextSendAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 gün sonra
        },
      });

      return { success: true };
    }),

  // A/B test tracking
  trackVariant: publicProcedure
    .input(z.object({
      testId: z.string(),
      variant: z.string(),
      converted: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      await prisma.abTestEvent.create({
        data: {
          testId: input.testId,
          variant: input.variant,
          converted: input.converted ?? false,
        },
      });
      return { success: true };
    }),
});
```

### 3. Prisma Schema Güncellemesi

**Dosya:** `packages/db/prisma/schema.prisma`

Eklenecek modeller:

```prisma
// ==================== LEAD MANAGEMENT ====================

model Lead {
  id          String    @id @default(cuid())
  email       String    @unique
  source      String    // exit_intent, newsletter, waitlist, demo_request
  lastSource  String?
  couponCode  String?
  couponUsed  Boolean   @default(false)
  convertedAt DateTime?
  userId      String?   // Kayıt olursa bağla
  metadata    Json?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  emailSequences EmailSequence[]

  @@index([email])
  @@index([source])
  @@index([createdAt])
}

model EmailSequence {
  id           String   @id @default(cuid())
  leadId       String
  sequenceName String   // onboarding_7day, abandoned_cart, etc.
  currentStep  Int      @default(0)
  completed    Boolean  @default(false)
  nextSendAt   DateTime?
  pausedAt     DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  lead Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId])
  @@index([nextSendAt])
  @@index([sequenceName])
}

model ABTestEvent {
  id        String   @id @default(cuid())
  testId    String
  variant   String
  converted Boolean  @default(false)
  sessionId String?
  createdAt DateTime @default(now())

  @@index([testId])
  @@index([testId, variant])
}
```

### 4. Email Templates

**Dosya:** `packages/email/src/templates/welcome-coupon.tsx`

```tsx
import {
  Body, Container, Head, Heading, Html, 
  Preview, Section, Text, Button, Hr
} from "@react-email/components";

interface WelcomeCouponEmailProps {
  couponCode: string;
  discount: string;
}

export function WelcomeCouponEmail({ couponCode, discount }: WelcomeCouponEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Hyble'a Hoş Geldin! {discount} İndirim Kodun İçeride 🎁</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Hoş Geldin! 🎉</Heading>
          
          <Text style={text}>
            Hyble ailesine katıldığın için teşekkürler! Söz verdiğimiz gibi, 
            ilk alışverişinde kullanabileceğin {discount} indirim kodun:
          </Text>

          <Section style={codeSection}>
            <Text style={code}>{couponCode}</Text>
          </Section>

          <Text style={text}>
            Bu kod ilk 30 gün içinde tüm ürünlerde geçerli.
          </Text>

          <Button style={button} href="https://hyble.co/store">
            Şablonlara Göz At
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            Bu e-postayı Hyble.co üzerinden almayı kabul ettiğiniz için aldınız.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "40px 20px", maxWidth: "560px" };
const h1 = { color: "#1a1a1a", fontSize: "24px", fontWeight: "bold" };
const text = { color: "#4a4a4a", fontSize: "16px", lineHeight: "24px" };
const codeSection = { 
  backgroundColor: "#fff7ed", 
  borderRadius: "8px", 
  padding: "20px", 
  textAlign: "center" as const,
  margin: "24px 0",
};
const code = { 
  fontSize: "28px", 
  fontWeight: "bold", 
  color: "#f59e0b",
  letterSpacing: "4px",
};
const button = {
  backgroundColor: "#f59e0b",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};
const hr = { borderColor: "#e6e6e6", margin: "32px 0" };
const footer = { color: "#8898aa", fontSize: "12px" };
```

### 5. Onboarding Wizard

**Dosya:** `apps/hyble-panel/src/app/(panel)/onboarding/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Building2, Target, CreditCard, 
  ArrowRight, ArrowLeft, Check, Loader2 
} from "lucide-react";

const steps = [
  {
    id: "profile",
    title: "Profil Bilgileri",
    description: "Sizi biraz tanıyalım",
    icon: User,
  },
  {
    id: "business",
    title: "İşletme Türü",
    description: "Ne için kullanacaksınız?",
    icon: Building2,
  },
  {
    id: "goals",
    title: "Hedefleriniz",
    description: "Size nasıl yardımcı olabiliriz?",
    icon: Target,
  },
  {
    id: "billing",
    title: "Fatura Bilgileri",
    description: "Opsiyonel - sonra da ekleyebilirsiniz",
    icon: CreditCard,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/trpc/user.completeOnboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${index < currentStep 
                  ? "bg-amber-500 text-white" 
                  : index === currentStep
                  ? "bg-amber-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                }
              `}>
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${index < currentStep ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-slate-500 mb-8">
                {steps[currentStep].description}
              </p>

              {/* Step-specific content buraya */}
              <div className="min-h-[200px]">
                {/* Form fields for each step */}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </button>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentStep === steps.length - 1 ? (
                "Tamamla"
              ) : (
                <>
                  Devam
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Şimdilik atla
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Kontrol Listesi

- [x] Exit intent popup komponenti oluşturuldu
- [ ] Lead capture API endpoint eklendi
- [ ] Prisma schema güncellendi (Lead, EmailSequence, ABTestEvent)
- [ ] Welcome coupon email template oluşturuldu
- [ ] Onboarding wizard sayfası oluşturuldu
- [x] Landing page'e ExitIntentPopup eklendi
- [ ] Email drip campaign cron job hazırlandı
- [x] LocalStorage ile popup tekrar gösterme engeli

## Test

```bash
# Schema push
cd packages/db && pnpm db:push

# Dev
pnpm dev

# Exit intent test: Mouse'u viewport dışına çıkar
# Email test: Resend dev mode
```
