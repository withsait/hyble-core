"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import {
  Ticket,
  ArrowLeft,
  Loader2,
  CreditCard,
  Wrench,
  User,
  ShoppingBag,
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

type Category = "BILLING" | "TECHNICAL" | "ACCOUNT" | "SALES" | "FEEDBACK" | "BUG_REPORT" | "FEATURE_REQUEST" | "OTHER";
type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

const categories: { value: Category; label: string; icon: typeof CreditCard; description: string }[] = [
  { value: "BILLING", label: "Faturalama", icon: CreditCard, description: "Ödeme ve fatura sorunları" },
  { value: "TECHNICAL", label: "Teknik Destek", icon: Wrench, description: "Teknik sorunlar ve hatalar" },
  { value: "ACCOUNT", label: "Hesap", icon: User, description: "Hesap ayarları ve güvenlik" },
  { value: "SALES", label: "Satış", icon: ShoppingBag, description: "Satın alma ve ürün bilgisi" },
  { value: "BUG_REPORT", label: "Hata Bildirimi", icon: Bug, description: "Bug ve hata raporları" },
  { value: "FEATURE_REQUEST", label: "Özellik Talebi", icon: Lightbulb, description: "Yeni özellik önerileri" },
  { value: "FEEDBACK", label: "Geri Bildirim", icon: MessageSquare, description: "Genel geri bildirim" },
  { value: "OTHER", label: "Diğer", icon: HelpCircle, description: "Diğer konular" },
];

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "LOW", label: "Düşük", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "NORMAL", label: "Normal", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "HIGH", label: "Yüksek", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "URGENT", label: "Acil", color: "bg-red-100 text-red-700 border-red-200" },
];

export default function NewSupportPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const createTicket = trpc.support.create.useMutation({
    onSuccess: (data) => {
      router.push(`/support/${data.referenceNo}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subject || !message) return;

    createTicket.mutate({
      category,
      priority,
      subject,
      message,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Destek Taleplerine Dön
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Yeni Destek Talebi
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Size nasıl yardımcı olabiliriz?
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Kategori Seçin
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    category === cat.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-2 ${category === cat.value ? "text-blue-600" : "text-slate-400"}`} />
                  <p className={`font-medium text-sm ${category === cat.value ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>
                    {cat.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Öncelik
          </label>
          <div className="flex gap-2 flex-wrap">
            {priorities.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  priority === p.value
                    ? `${p.color} ring-2 ring-offset-2`
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                {p.value === "URGENT" && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Konu
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Talebinizi özetleyin..."
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            minLength={5}
            maxLength={200}
          />
          <p className="text-xs text-slate-500 mt-1">{subject.length}/200</p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Mesaj
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Sorununuzu veya talebinizi detaylı açıklayın..."
            rows={6}
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
            minLength={10}
            maxLength={10000}
          />
          <p className="text-xs text-slate-500 mt-1">{message.length}/10000</p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/support"
            className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={createTicket.isPending || !category || !subject || !message}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createTicket.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Ticket className="h-5 w-5" />
                Talep Oluştur
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
