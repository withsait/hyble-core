"use client";

import { useState, useEffect } from "react";
import { Globe, Check, X, Loader2 } from "lucide-react";
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
