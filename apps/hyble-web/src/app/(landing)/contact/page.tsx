import { Metadata } from "next";
import { ContactForm } from "@/components/landing/ContactForm";
import { Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "İletişim - Hyble",
  description: "Bizimle iletişime geçin. Sorularınızı yanıtlamaktan mutluluk duyarız.",
};

export default function ContactPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            İletişime Geçin
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email</h3>
                  <p className="text-slate-600 dark:text-slate-400">support@hyble.co</p>
                  <p className="text-slate-600 dark:text-slate-400">hello@hyble.co</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Konum</h3>
                  <p className="text-slate-600 dark:text-slate-400">London, United Kingdom</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Çalışma Saatleri</h3>
                  <p className="text-slate-600 dark:text-slate-400">Pazartesi - Cuma</p>
                  <p className="text-slate-600 dark:text-slate-400">09:00 - 18:00 (GMT)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
