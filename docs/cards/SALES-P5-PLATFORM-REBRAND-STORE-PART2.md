# SALES-P5: Platform Rebrand & Template Store - PART 2

## BÖLÜM 3: DEPLOYMENT WIZARD

### 3.1 Deploy Flow Sayfası

**Dosya:** `apps/hyble-web/src/app/(landing)/store/[slug]/deploy/page.tsx`

```tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { DeployWizard } from "@/components/store/deploy/DeployWizard";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

interface DeployPageProps {
  params: { slug: string };
}

export const metadata: Metadata = {
  title: "Şablonu Kur | Hyble",
};

export default async function DeployPage({ params }: DeployPageProps) {
  // Auth check
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   redirect(`/auth/login?callbackUrl=/store/${params.slug}/deploy`);
  // }

  // Get template
  // const template = await api.template.getBySlug.query({ slug: params.slug });
  // if (!template) notFound();

  // Placeholder
  const template = {
    id: "1",
    slug: params.slug,
    nameTr: "StartupX - Modern Startup Landing",
    price: 49,
    thumbnail: "/templates/startupx-thumb.jpg",
    framework: "Next.js",
    deployTime: 60,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <DeployWizard template={template} />
    </div>
  );
}
```

### 3.2 Deploy Wizard Component

**Dosya:** `apps/hyble-web/src/components/store/deploy/DeployWizard.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, CreditCard, Palette, Globe, 
  Rocket, Check, ArrowLeft, ArrowRight, Loader2,
  Image as ImageIcon, Type, Layout
} from "lucide-react";

// Steps
import { StepPayment } from "./steps/StepPayment";
import { StepBranding } from "./steps/StepBranding";
import { StepContent } from "./steps/StepContent";
import { StepDomain } from "./steps/StepDomain";
import { StepDeploy } from "./steps/StepDeploy";

interface DeployWizardProps {
  template: {
    id: string;
    slug: string;
    nameTr: string;
    price: number;
    thumbnail: string;
    framework: string;
    deployTime: number;
  };
}

const steps = [
  { id: "payment", title: "Ödeme", icon: CreditCard, description: "Güvenli ödeme" },
  { id: "branding", title: "Marka", icon: Palette, description: "Logo & renkler" },
  { id: "content", title: "İçerik", icon: Type, description: "Metin & görseller" },
  { id: "domain", title: "Domain", icon: Globe, description: "Adres seçimi" },
  { id: "deploy", title: "Yayınla", icon: Rocket, description: "Tek tıkla kur" },
];

export interface WizardData {
  // Payment
  paymentMethod: "wallet" | "card" | null;
  paymentComplete: boolean;
  
  // Branding
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  
  // Content
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  
  // Domain
  domainType: "subdomain" | "custom";
  subdomain: string;
  customDomain: string;
  
  // Deploy
  deploymentId: string | null;
  deploymentStatus: "pending" | "deploying" | "success" | "error";
}

const initialData: WizardData = {
  paymentMethod: null,
  paymentComplete: false,
  logo: null,
  primaryColor: "#3B82F6",
  secondaryColor: "#10B981",
  fontFamily: "Inter",
  siteName: "",
  siteDescription: "",
  heroTitle: "",
  heroSubtitle: "",
  contactEmail: "",
  contactPhone: "",
  domainType: "subdomain",
  subdomain: "",
  customDomain: "",
  deploymentId: null,
  deploymentStatus: "pending",
};

export function DeployWizard({ template }: DeployWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>(initialData);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (steps[currentStep].id) {
      case "payment":
        return wizardData.paymentComplete;
      case "branding":
        return true; // Optional step
      case "content":
        return wizardData.siteName.length > 0;
      case "domain":
        return wizardData.domainType === "subdomain" 
          ? wizardData.subdomain.length >= 3
          : wizardData.customDomain.length > 0;
      case "deploy":
        return wizardData.deploymentStatus === "success";
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Wizard complete
      router.push(`/panel/websites/${wizardData.deploymentId}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case "payment":
        return <StepPayment template={template} data={wizardData} updateData={updateData} />;
      case "branding":
        return <StepBranding data={wizardData} updateData={updateData} />;
      case "content":
        return <StepContent data={wizardData} updateData={updateData} />;
      case "domain":
        return <StepDomain data={wizardData} updateData={updateData} />;
      case "deploy":
        return <StepDeploy template={template} data={wizardData} updateData={updateData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {template.nameTr}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Şablonunuzu kişiselleştirin ve hemen yayınlayın
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all
                    ${isComplete 
                      ? "bg-green-500 text-white" 
                      : isCurrent 
                      ? "bg-amber-500 text-white ring-4 ring-amber-500/20" 
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    }
                  `}>
                    {isComplete ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      isCurrent ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-400"
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-slate-400 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 sm:w-24 h-1 mx-2 rounded transition-colors
                    ${isComplete ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-8"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isProcessing}
            className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:dark:bg-slate-600 text-white font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                İşleniyor...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Panele Git
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Devam
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.3 Step: Payment

**Dosya:** `apps/hyble-web/src/components/store/deploy/steps/StepPayment.tsx`

```tsx
"use client";

import { useState } from "react";
import { CreditCard, Wallet, Check, Shield, Lock } from "lucide-react";
import Image from "next/image";
import type { WizardData } from "../DeployWizard";

interface StepPaymentProps {
  template: {
    id: string;
    nameTr: string;
    price: number;
    thumbnail: string;
  };
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function StepPayment({ template, data, updateData }: StepPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance] = useState(150); // TODO: Fetch from API

  const handlePayment = async (method: "wallet" | "card") => {
    setIsProcessing(true);
    updateData({ paymentMethod: method });

    try {
      // TODO: Actual payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateData({ paymentComplete: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (data.paymentComplete) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Ödeme Başarılı!
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Şablonunuzu kişiselleştirmeye başlayabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Ödeme Yöntemi Seçin
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Güvenli ödeme altyapısı ile satın alın
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-600 relative">
            <Image
              src={template.thumbnail}
              alt={template.nameTr}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-slate-900 dark:text-white">
              {template.nameTr}
            </h3>
            <p className="text-sm text-slate-500">Lifetime license</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              €{template.price}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Wallet */}
        <button
          onClick={() => handlePayment("wallet")}
          disabled={isProcessing || walletBalance < template.price}
          className={`
            relative p-6 rounded-xl border-2 text-left transition-all
            ${data.paymentMethod === "wallet"
              ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
              : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
            }
            ${walletBalance < template.price ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Hyble Wallet
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Bakiyenizden ödeyin
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Bakiye: €{walletBalance}
                </span>
                {walletBalance < template.price && (
                  <span className="text-xs text-red-500">Yetersiz bakiye</span>
                )}
              </div>
            </div>
          </div>
          {data.paymentMethod === "wallet" && (
            <div className="absolute top-4 right-4">
              <Check className="w-5 h-5 text-amber-500" />
            </div>
          )}
        </button>

        {/* Card */}
        <button
          onClick={() => handlePayment("card")}
          disabled={isProcessing}
          className={`
            relative p-6 rounded-xl border-2 text-left transition-all
            ${data.paymentMethod === "card"
              ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
              : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Kredi/Banka Kartı
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Stripe ile güvenli ödeme
              </p>
              <div className="flex items-center gap-2">
                <Image src="/icons/visa.svg" alt="Visa" width={32} height={20} />
                <Image src="/icons/mastercard.svg" alt="Mastercard" width={32} height={20} />
              </div>
            </div>
          </div>
          {data.paymentMethod === "card" && (
            <div className="absolute top-4 right-4">
              <Check className="w-5 h-5 text-amber-500" />
            </div>
          )}
        </button>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Shield className="w-4 h-4" />
          Güvenli Ödeme
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Lock className="w-4 h-4" />
          256-bit SSL
        </div>
      </div>
    </div>
  );
}
```

### 3.4 Step: Branding

**Dosya:** `apps/hyble-web/src/components/store/deploy/steps/StepBranding.tsx`

```tsx
"use client";

import { useState, useCallback } from "react";
import { Upload, Palette, Type, X } from "lucide-react";
import Image from "next/image";
import type { WizardData } from "../DeployWizard";

interface StepBrandingProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

const colorPresets = [
  { name: "Mavi", primary: "#3B82F6", secondary: "#10B981" },
  { name: "Mor", primary: "#8B5CF6", secondary: "#EC4899" },
  { name: "Turuncu", primary: "#F59E0B", secondary: "#EF4444" },
  { name: "Yeşil", primary: "#10B981", secondary: "#3B82F6" },
  { name: "Kırmızı", primary: "#EF4444", secondary: "#F59E0B" },
  { name: "Lacivert", primary: "#1E3A5F", secondary: "#3B82F6" },
];

const fontPresets = [
  { name: "Inter", value: "Inter" },
  { name: "Poppins", value: "Poppins" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Playfair", value: "Playfair Display" },
  { name: "Montserrat", value: "Montserrat" },
];

export function StepBranding({ data, updateData }: StepBrandingProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      updateData({ logo: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Marka Kimliği
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Logo, renkler ve font ayarlarını yapın (opsiyonel)
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Logo
        </label>
        
        {data.logo ? (
          <div className="relative w-40 h-40 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden">
            <Image
              src={data.logo}
              alt="Logo"
              fill
              className="object-contain p-4"
            />
            <button
              onClick={() => updateData({ logo: null })}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-colors
              ${dragActive 
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" 
                : "border-slate-300 dark:border-slate-600"
              }
            `}
          >
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Logo dosyasını sürükleyin veya
            </p>
            <label className="cursor-pointer">
              <span className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
                dosya seçin
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-2">
              PNG, JPG, SVG - Max 2MB
            </p>
          </div>
        )}
      </div>

      {/* Color Presets */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          <Palette className="w-4 h-4 inline mr-2" />
          Renk Şeması
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => updateData({ 
                primaryColor: preset.primary, 
                secondaryColor: preset.secondary 
              })}
              className={`
                p-3 rounded-xl border-2 transition-all
                ${data.primaryColor === preset.primary
                  ? "border-amber-500 ring-2 ring-amber-500/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                }
              `}
            >
              <div className="flex gap-1 mb-2">
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: preset.primary }} 
                />
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: preset.secondary }} 
                />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {preset.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Colors */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Ana Renk</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.primaryColor}
                onChange={(e) => updateData({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
              <input
                type="text"
                value={data.primaryColor}
                onChange={(e) => updateData({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">İkincil Renk</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.secondaryColor}
                onChange={(e) => updateData({ secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
              <input
                type="text"
                value={data.secondaryColor}
                onChange={(e) => updateData({ secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          <Type className="w-4 h-4 inline mr-2" />
          Font Ailesi
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {fontPresets.map((font) => (
            <button
              key={font.value}
              onClick={() => updateData({ fontFamily: font.value })}
              className={`
                p-3 rounded-xl border-2 transition-all
                ${data.fontFamily === font.value
                  ? "border-amber-500 ring-2 ring-amber-500/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                }
              `}
              style={{ fontFamily: font.value }}
            >
              <span className="text-lg font-medium text-slate-900 dark:text-white block mb-1">
                Aa
              </span>
              <span className="text-xs text-slate-500">{font.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 3.5 Step: Content

**Dosya:** `apps/hyble-web/src/components/store/deploy/steps/StepContent.tsx`

```tsx
"use client";

import { Building2, Mail, Phone, FileText } from "lucide-react";
import type { WizardData } from "../DeployWizard";

interface StepContentProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function StepContent({ data, updateData }: StepContentProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          İçerik Bilgileri
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Sitenizde görünecek temel bilgileri girin
        </p>
      </div>

      {/* Site Info */}
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Site Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Building2 className="w-4 h-4" />
              Site / Şirket Adı *
            </label>
            <input
              type="text"
              value={data.siteName}
              onChange={(e) => updateData({ siteName: e.target.value })}
              placeholder="Örn: Acme Teknoloji"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Site Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <FileText className="w-4 h-4" />
              Kısa Açıklama
            </label>
            <input
              type="text"
              value={data.siteDescription}
              onChange={(e) => updateData({ siteDescription: e.target.value })}
              placeholder="Örn: Yazılım çözümleri"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <h3 className="font-medium text-slate-900 dark:text-white mb-4">
            Ana Sayfa Hero Bölümü
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                Başlık
              </label>
              <input
                type="text"
                value={data.heroTitle}
                onChange={(e) => updateData({ heroTitle: e.target.value })}
                placeholder="Örn: Geleceği Bugün İnşa Edin"
                className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">
                Alt Başlık
              </label>
              <textarea
                value={data.heroSubtitle}
                onChange={(e) => updateData({ heroSubtitle: e.target.value })}
                placeholder="Örn: İnovatif çözümlerimizle işinizi bir sonraki seviyeye taşıyın."
                rows={2}
                className="w-full px-4 py-3 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Mail className="w-4 h-4" />
              E-posta Adresi
            </label>
            <input
              type="email"
              value={data.contactEmail}
              onChange={(e) => updateData({ contactEmail: e.target.value })}
              placeholder="info@sirketiniz.com"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Phone className="w-4 h-4" />
              Telefon Numarası
            </label>
            <input
              type="tel"
              value={data.contactPhone}
              onChange={(e) => updateData({ contactPhone: e.target.value })}
              placeholder="+90 212 123 45 67"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Info */}
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
        Bu bilgileri daha sonra panel üzerinden düzenleyebilirsiniz.
      </p>
    </div>
  );
}
```

### 3.6 Step: Domain

**Dosya:** `apps/hyble-web/src/components/store/deploy/steps/StepDomain.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { Globe, Check, X, Loader2, ExternalLink } from "lucide-react";
import type { WizardData } from "../DeployWizard";

interface StepDomainProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

export function StepDomain({ data, updateData }: StepDomainProps) {
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  // Check subdomain availability with debounce
  useEffect(() => {
    if (data.subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSubdomain(true);
      try {
        // TODO: API call to check availability
        await new Promise(resolve => setTimeout(resolve, 500));
        // Simulate availability check
        const isAvailable = !["admin", "panel", "api", "www", "mail"].includes(data.subdomain.toLowerCase());
        setSubdomainAvailable(isAvailable);
      } finally {
        setIsCheckingSubdomain(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [data.subdomain]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Domain Seçimi
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Siteniz için bir adres belirleyin
        </p>
      </div>

      {/* Domain Type Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Subdomain */}
        <button
          onClick={() => updateData({ domainType: "subdomain" })}
          className={`
            p-6 rounded-xl border-2 text-left transition-all
            ${data.domainType === "subdomain"
              ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
              : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
            }
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-slate-900 dark:text-white">
              Hyble Subdomain
            </span>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
              Ücretsiz
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            siteniz.hyble.co adresini kullanın
          </p>
        </button>

        {/* Custom Domain */}
        <button
          onClick={() => updateData({ domainType: "custom" })}
          className={`
            p-6 rounded-xl border-2 text-left transition-all
            ${data.domainType === "custom"
              ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
              : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
            }
          `}
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-slate-900 dark:text-white">
              Özel Domain
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kendi domaininizi bağlayın
          </p>
        </button>
      </div>

      {/* Subdomain Input */}
      {data.domainType === "subdomain" && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Subdomain Seçin
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={data.subdomain}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                  updateData({ subdomain: value });
                }}
                placeholder="siteniz"
                className={`
                  w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border rounded-xl pr-10
                  focus:ring-2 focus:ring-amber-500 focus:border-transparent
                  ${subdomainAvailable === false 
                    ? "border-red-500" 
                    : subdomainAvailable === true 
                    ? "border-green-500" 
                    : "border-slate-200 dark:border-slate-600"
                  }
                `}
              />
              {/* Status Icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingSubdomain ? (
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                ) : subdomainAvailable === true ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : subdomainAvailable === false ? (
                  <X className="w-5 h-5 text-red-500" />
                ) : null}
              </div>
            </div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              .hyble.co
            </span>
          </div>
          
          {/* Availability Message */}
          {subdomainAvailable === false && (
            <p className="text-sm text-red-500">
              Bu subdomain zaten kullanımda. Başka bir isim deneyin.
            </p>
          )}
          {subdomainAvailable === true && (
            <p className="text-sm text-green-500">
              Bu subdomain kullanılabilir!
            </p>
          )}

          {/* Preview */}
          {data.subdomain.length >= 3 && subdomainAvailable && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-sm text-green-700 dark:text-green-400">
                Siteniz şu adreste yayınlanacak:
              </p>
              <p className="font-mono font-medium text-green-800 dark:text-green-300">
                https://{data.subdomain}.hyble.co
              </p>
            </div>
          )}
        </div>
      )}

      {/* Custom Domain Input */}
      {data.domainType === "custom" && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Domain Adresiniz
          </label>
          <input
            type="text"
            value={data.customDomain}
            onChange={(e) => updateData({ customDomain: e.target.value.toLowerCase() })}
            placeholder="ornek.com"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          
          {/* DNS Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              DNS Ayarları
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
              Domaininizi bağlamak için aşağıdaki DNS kaydını ekleyin:
            </p>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="text-slate-900 dark:text-white">CNAME</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="text-slate-900 dark:text-white">@</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Value:</span>
                <span className="text-slate-900 dark:text-white">cname.hyble.co</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3.7 Step: Deploy

**Dosya:** `apps/hyble-web/src/components/store/deploy/steps/StepDeploy.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Rocket, Check, Loader2, Server, Database, 
  Globe, Shield, ExternalLink, AlertCircle
} from "lucide-react";
import type { WizardData } from "../DeployWizard";

interface StepDeployProps {
  template: {
    id: string;
    nameTr: string;
    framework: string;
    deployTime: number;
  };
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

const deploySteps = [
  { id: "init", label: "Proje oluşturuluyor", icon: Server },
  { id: "config", label: "Ayarlar uygulanıyor", icon: Database },
  { id: "deploy", label: "Sunucuya yükleniyor", icon: Rocket },
  { id: "ssl", label: "SSL sertifikası", icon: Shield },
  { id: "dns", label: "DNS yapılandırması", icon: Globe },
];

export function StepDeploy({ template, data, updateData }: StepDeployProps) {
  const [currentDeployStep, setCurrentDeployStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    updateData({ deploymentStatus: "deploying" });

    try {
      // Simulate deployment process
      for (let i = 0; i < deploySteps.length; i++) {
        setCurrentDeployStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      }

      // Generate deployment ID
      const deploymentId = `dep_${Date.now()}`;
      updateData({ 
        deploymentId,
        deploymentStatus: "success" 
      });
    } catch (err) {
      setError("Deployment sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      updateData({ deploymentStatus: "error" });
    } finally {
      setIsDeploying(false);
    }
  };

  // Auto-start deploy on mount
  useEffect(() => {
    if (data.deploymentStatus === "pending") {
      startDeploy();
    }
  }, []);

  const siteUrl = data.domainType === "subdomain" 
    ? `https://${data.subdomain}.hyble.co`
    : `https://${data.customDomain}`;

  if (data.deploymentStatus === "success") {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Check className="w-12 h-12 text-green-500" />
        </motion.div>

        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Siteniz Yayında! 🎉
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Tebrikler! Siteniz başarıyla kuruldu ve yayına alındı.
        </p>

        {/* Site URL */}
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-slate-100 dark:bg-slate-700 rounded-xl mb-8">
          <Globe className="w-5 h-5 text-slate-500" />
          <a 
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400"
          >
            {siteUrl}
          </a>
          <ExternalLink className="w-4 h-4 text-slate-400" />
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Siteyi Görüntüle
          </a>
          <button
            onClick={() => {/* Navigate to panel */}}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-900 dark:text-white font-medium rounded-xl transition-colors"
          >
            Panele Git
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Bir Hata Oluştu
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {error}
        </p>
        <button
          onClick={startDeploy}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Siteniz Kuruluyor
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Bu işlem yaklaşık {template.deployTime} saniye sürecek
        </p>
      </div>

      {/* Progress */}
      <div className="max-w-md mx-auto space-y-4">
        {deploySteps.map((step, index) => {
          const isComplete = index < currentDeployStep;
          const isCurrent = index === currentDeployStep && isDeploying;
          const isPending = index > currentDeployStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-4 p-4 rounded-xl transition-colors
                ${isComplete 
                  ? "bg-green-50 dark:bg-green-900/20" 
                  : isCurrent 
                  ? "bg-amber-50 dark:bg-amber-900/20" 
                  : "bg-slate-50 dark:bg-slate-700/50"
                }
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isComplete 
                  ? "bg-green-500 text-white" 
                  : isCurrent 
                  ? "bg-amber-500 text-white" 
                  : "bg-slate-200 dark:bg-slate-600 text-slate-500"
                }
              `}>
                {isComplete ? (
                  <Check className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`
                font-medium
                ${isComplete 
                  ? "text-green-700 dark:text-green-400" 
                  : isCurrent 
                  ? "text-amber-700 dark:text-amber-400" 
                  : "text-slate-500"
                }
              `}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <div className="text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Lütfen bu sayfadan ayrılmayın...
        </p>
      </div>
    </div>
  );
}
```

---

## BÖLÜM 4: API ROUTER'LAR

### 4.1 Template Router

**Dosya:** `apps/hyble-panel/src/server/routers/template.ts`

```typescript
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc/trpc";
import { prisma } from "@hyble/db";
import { TRPCError } from "@trpc/server";

export const templateRouter = router({
  // List templates with filters
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      framework: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      search: z.string().optional(),
      sort: z.enum(["newest", "popular", "price-asc", "price-desc", "rating"]).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(12),
    }))
    .query(async ({ input }) => {
      const { category, framework, minPrice, maxPrice, search, sort, page, limit } = input;
      
      const where: any = { status: "ACTIVE" };
      
      if (category) where.category = category;
      if (framework) where.framework = framework;
      if (minPrice !== undefined) where.price = { ...where.price, gte: minPrice };
      if (maxPrice !== undefined) where.price = { ...where.price, lte: maxPrice };
      if (search) {
        where.OR = [
          { nameTr: { contains: search, mode: "insensitive" } },
          { nameEn: { contains: search, mode: "insensitive" } },
          { tags: { hasSome: [search.toLowerCase()] } },
        ];
      }

      const orderBy: any = {};
      switch (sort) {
        case "newest": orderBy.createdAt = "desc"; break;
        case "popular": orderBy.salesCount = "desc"; break;
        case "price-asc": orderBy.price = "asc"; break;
        case "price-desc": orderBy.price = "desc"; break;
        case "rating": orderBy.rating = "desc"; break;
        default: orderBy.featuredOrder = "asc";
      }

      const [templates, total] = await Promise.all([
        prisma.template.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            slug: true,
            nameTr: true,
            shortDescTr: true,
            category: true,
            price: true,
            comparePrice: true,
            thumbnail: true,
            previewUrl: true,
            framework: true,
            features: true,
            rating: true,
            reviewCount: true,
            salesCount: true,
            isNew: true,
            isFeatured: true,
          },
        }),
        prisma.template.count({ where }),
      ]);

      return {
        templates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single template by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const template = await prisma.template.findUnique({
        where: { slug: input.slug, status: "ACTIVE" },
        include: {
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Increment view count
      await prisma.template.update({
        where: { id: template.id },
        data: { viewCount: { increment: 1 } },
      });

      return template;
    }),

  // Featured templates
  featured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(6) }))
    .query(async ({ input }) => {
      return prisma.template.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        orderBy: { featuredOrder: "asc" },
        take: input.limit,
        select: {
          id: true,
          slug: true,
          nameTr: true,
          shortDescTr: true,
          category: true,
          price: true,
          comparePrice: true,
          thumbnail: true,
          rating: true,
          salesCount: true,
        },
      });
    }),

  // Purchase template
  purchase: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      paymentMethod: z.enum(["wallet", "card"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const template = await prisma.template.findUnique({
        where: { id: input.templateId },
      });

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check if already purchased
      const existingPurchase = await prisma.templatePurchase.findUnique({
        where: {
          templateId_userId: {
            templateId: input.templateId,
            userId: ctx.user.id,
          },
        },
      });

      if (existingPurchase) {
        throw new TRPCError({ 
          code: "CONFLICT", 
          message: "Bu şablonu zaten satın aldınız" 
        });
      }

      // Process payment based on method
      if (input.paymentMethod === "wallet") {
        // Deduct from wallet
        const wallet = await prisma.wallet.findFirst({
          where: { userId: ctx.user.id, currency: template.currency },
        });

        if (!wallet || Number(wallet.balance) < Number(template.price)) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Yetersiz bakiye" 
          });
        }

        // Create transaction and purchase
        await prisma.$transaction([
          prisma.wallet.update({
            where: { id: wallet.id },
            data: { 
              balance: { decrement: template.price },
              mainBalance: { decrement: template.price },
            },
          }),
          prisma.transaction.create({
            data: {
              walletId: wallet.id,
              type: "CHARGE",
              status: "COMPLETED",
              amount: template.price,
              balanceBefore: wallet.balance,
              balanceAfter: Number(wallet.balance) - Number(template.price),
              currency: template.currency,
              description: `Şablon satın alma: ${template.nameTr}`,
              paymentMethod: "WALLET",
            },
          }),
        ]);
      }

      // Create purchase record
      const purchase = await prisma.templatePurchase.create({
        data: {
          templateId: input.templateId,
          userId: ctx.user.id,
          amount: template.price,
          currency: template.currency,
          licenseType: "standard",
        },
      });

      // Increment sales count
      await prisma.template.update({
        where: { id: input.templateId },
        data: { salesCount: { increment: 1 } },
      });

      return { success: true, purchaseId: purchase.id, licenseKey: purchase.licenseKey };
    }),

  // Deploy template
  deploy: protectedProcedure
    .input(z.object({
      purchaseId: z.string(),
      subdomain: z.string().optional(),
      customDomain: z.string().optional(),
      config: z.object({
        logo: z.string().nullable(),
        primaryColor: z.string(),
        secondaryColor: z.string(),
        fontFamily: z.string(),
        siteName: z.string(),
        siteDescription: z.string().optional(),
        heroTitle: z.string().optional(),
        heroSubtitle: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const purchase = await prisma.templatePurchase.findUnique({
        where: { id: input.purchaseId },
        include: { template: true },
      });

      if (!purchase || purchase.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Create deployment
      const deployment = await prisma.templateDeployment.create({
        data: {
          templateId: purchase.templateId,
          purchaseId: purchase.id,
          userId: ctx.user.id,
          projectName: input.config.siteName,
          subdomain: input.subdomain || "",
          customDomain: input.customDomain,
          config: input.config,
          status: "deploying",
        },
      });

      // TODO: Trigger actual deployment job
      // await deploymentQueue.add({ deploymentId: deployment.id });

      return { deploymentId: deployment.id };
    }),

  // Check subdomain availability
  checkSubdomain: publicProcedure
    .input(z.object({ subdomain: z.string().min(3).max(50) }))
    .query(async ({ input }) => {
      const reserved = ["admin", "panel", "api", "www", "mail", "app", "dashboard", "gaming", "cloud"];
      
      if (reserved.includes(input.subdomain.toLowerCase())) {
        return { available: false, reason: "reserved" };
      }

      const existing = await prisma.templateDeployment.findUnique({
        where: { subdomain: input.subdomain },
      });

      return { available: !existing };
    }),
});
```

---

## BÖLÜM 5: KONTROL LİSTESİ

### Homepage Rebrand
- [ ] HeroSection 5 segmentli yapıya güncellendi
- [ ] Value proposition "Dijital Altyapınız İçin Tek Platform" olarak değiştirildi
- [ ] AudienceSelector 5 segment (Web, Cloud, API, Gaming, Kurumsal)
- [ ] Tüm `game.hyble.co` referansları `gaming.hyble.co` olarak güncellendi

### Template Store
- [ ] Prisma schema güncellemesi (Template, TemplatePurchase, TemplateDeployment)
- [ ] Store ana sayfası (/store)
- [ ] StoreHero komponenti
- [ ] TemplateCard komponenti
- [ ] StoreFilters komponenti
- [ ] StoreSidebar komponenti
- [ ] Template detay sayfası (/store/[slug])
- [ ] TemplatePurchaseCard komponenti
- [ ] TemplateGallery komponenti
- [ ] TemplateReviews komponenti
- [ ] RelatedTemplates komponenti

### Deploy Wizard
- [ ] Deploy sayfası (/store/[slug]/deploy)
- [ ] DeployWizard ana komponenti
- [ ] StepPayment (Wallet/Card seçimi)
- [ ] StepBranding (Logo, renk, font)
- [ ] StepContent (Site adı, açıklama, hero)
- [ ] StepDomain (Subdomain/Custom domain)
- [ ] StepDeploy (Deployment progress)

### API
- [ ] templateRouter oluşturuldu
- [ ] Template list/filter query
- [ ] Template getBySlug query
- [ ] Template purchase mutation
- [ ] Template deploy mutation
- [ ] Subdomain availability check

### Test
- [ ] Store sayfası responsive
- [ ] Dark mode uyumlu
- [ ] Wizard flow test edildi
- [ ] Payment flow test edildi
- [ ] Deployment flow test edildi

---

## DEPLOYMENT NOTU

Bu card tamamlandıktan sonra canlıya almak için:

```bash
# Database migration
cd packages/db && pnpm db:push

# Build
pnpm build

# Deploy
# SSH ve deployment scriptleri ile
```
