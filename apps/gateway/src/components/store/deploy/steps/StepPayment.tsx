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
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 flex items-center justify-center">
              <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">ŞABLON</span>
            </div>
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
                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-600 rounded text-xs font-medium text-slate-600 dark:text-slate-300">VISA</div>
                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-600 rounded text-xs font-medium text-slate-600 dark:text-slate-300">MC</div>
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
