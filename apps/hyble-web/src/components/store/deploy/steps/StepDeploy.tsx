"use client";

import { useState, useEffect } from "react";
import { Rocket, Check, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import type { WizardData } from "../DeployWizard";

interface StepDeployProps {
  template: {
    id: string;
    nameTr: string;
    deployTime: number;
  };
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

const deploySteps = [
  { id: "init", label: "Ortam hazırlanıyor", duration: 2 },
  { id: "template", label: "Şablon kuruluyor", duration: 3 },
  { id: "config", label: "Ayarlar uygulanıyor", duration: 2 },
  { id: "dns", label: "DNS yapılandırılıyor", duration: 2 },
  { id: "ssl", label: "SSL sertifikası alınıyor", duration: 3 },
  { id: "finish", label: "Son kontroller", duration: 1 },
];

export function StepDeploy({ template, data, updateData }: StepDeployProps) {
  const [currentDeployStep, setCurrentDeployStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDeployment = async () => {
    setIsDeploying(true);
    setError(null);
    updateData({ deploymentStatus: "deploying" });

    try {
      // Simulate deployment steps
      for (let i = 0; i < deploySteps.length; i++) {
        setCurrentDeployStep(i);
        await new Promise(resolve => setTimeout(resolve, deploySteps[i].duration * 1000));
      }

      // TODO: Actual API call to deploy
      // const result = await api.template.deploy.mutate({
      //   templateId: template.id,
      //   config: data,
      // });

      const deploymentId = `dep_${Math.random().toString(36).substr(2, 9)}`;
      updateData({
        deploymentId,
        deploymentStatus: "success",
      });
    } catch (err) {
      console.error(err);
      setError("Kurulum sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      updateData({ deploymentStatus: "error" });
    } finally {
      setIsDeploying(false);
    }
  };

  // Auto-start deployment when step is reached
  useEffect(() => {
    if (data.deploymentStatus === "pending") {
      startDeployment();
    }
  }, []);

  const siteUrl = data.domainType === "subdomain"
    ? `https://${data.subdomain}.hyble.co`
    : `https://${data.customDomain}`;

  if (data.deploymentStatus === "success") {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Siteniz Yayında!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Tebrikler! Siteniz başarıyla kuruldu ve şu anda yayında.
        </p>

        {/* Site URL */}
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-green-50 dark:bg-green-900/20 rounded-xl mb-8">
          <span className="text-green-700 dark:text-green-400 font-mono">
            {siteUrl}
          </span>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {template.deployTime}s
            </div>
            <div className="text-xs text-slate-500">Kurulum süresi</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="text-2xl font-bold text-green-500">A+</div>
            <div className="text-xs text-slate-500">SSL skoru</div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="text-2xl font-bold text-blue-500">95</div>
            <div className="text-xs text-slate-500">Lighthouse</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Kurulum Başarısız
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {error}
        </p>
        <button
          onClick={startDeployment}
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
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Rocket className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Siteniz Kuruluyor
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Lütfen bekleyin, bu işlem yaklaşık {template.deployTime} saniye sürecek
        </p>
      </div>

      {/* Deployment Steps */}
      <div className="space-y-4 max-w-md mx-auto">
        {deploySteps.map((step, index) => {
          const isComplete = index < currentDeployStep;
          const isCurrent = index === currentDeployStep && isDeploying;

          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-4 p-4 rounded-xl transition-all
                ${isComplete
                  ? "bg-green-50 dark:bg-green-900/20"
                  : isCurrent
                  ? "bg-amber-50 dark:bg-amber-900/20"
                  : "bg-slate-50 dark:bg-slate-700/30"
                }
              `}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${isComplete
                  ? "bg-green-500 text-white"
                  : isCurrent
                  ? "bg-amber-500 text-white"
                  : "bg-slate-200 dark:bg-slate-600 text-slate-500"
                }
              `}>
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              <span className={`
                flex-1 font-medium
                ${isComplete
                  ? "text-green-700 dark:text-green-400"
                  : isCurrent
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-slate-500 dark:text-slate-400"
                }
              `}>
                {step.label}
              </span>
              {isCurrent && (
                <span className="text-xs text-amber-500">
                  ~{step.duration}s
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-1000"
            style={{
              width: `${((currentDeployStep + 1) / deploySteps.length) * 100}%`,
            }}
          />
        </div>
        <p className="text-center text-sm text-slate-500 mt-2">
          {Math.round(((currentDeployStep + 1) / deploySteps.length) * 100)}% tamamlandı
        </p>
      </div>
    </div>
  );
}
