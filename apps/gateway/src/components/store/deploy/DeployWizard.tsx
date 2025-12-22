"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Palette, Globe,
  Rocket, Check, ArrowLeft, ArrowRight, Loader2,
  Type
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
    const step = steps[currentStep];
    if (!step) return false;
    switch (step.id) {
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
    const step = steps[currentStep];
    if (!step) return null;
    switch (step.id) {
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
