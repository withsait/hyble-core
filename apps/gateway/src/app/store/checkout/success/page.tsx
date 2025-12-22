"use client";

import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  CheckCircle,
  Download,
  Home,
  Package,
  Mail,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function CheckoutSuccessPage() {
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <Card className="p-8 text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Ödeme Başarılı!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Siparişiniz başarıyla oluşturuldu. Teşekkür ederiz!
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Sipariş No: <span className="font-mono font-medium text-slate-600 dark:text-slate-300">{orderNumber}</span>
          </p>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Sonraki Adımlar
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">E-posta Onayı</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Sipariş detayları ve fatura e-posta adresinize gönderildi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">İndirmeler</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Dijital ürünleriniz &quot;İndirmelerim&quot; sayfasından indirilebilir.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Fatura</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Faturanız &quot;Faturalama&quot; bölümünden PDF olarak indirilebilir.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard/downloads"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            İndirmelerime Git
          </Link>
          <Link
            href="/store"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors"
          >
            Alışverişe Devam Et
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sorularınız için{" "}
            <Link href="/support" className="text-blue-600 hover:underline">
              destek sayfamızı
            </Link>{" "}
            ziyaret edebilir veya{" "}
            <a href="mailto:support@hyble.co" className="text-blue-600 hover:underline">
              support@hyble.co
            </a>{" "}
            adresine yazabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}
