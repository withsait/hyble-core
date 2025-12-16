"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        const errData = await res.json();
        setError(errData.error || "Bir hata oluştu.");
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-center">
        <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Mesajınız Alındı!</h3>
        <p className="text-green-600 dark:text-green-300">En kısa sürede size dönüş yapacağız.</p>
        <button onClick={() => setSuccess(false)} className="mt-6 text-green-700 font-medium hover:underline">Yeni mesaj gönder</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Ad Soyad</label>
          <input required name="name" id="name" type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Adınız" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input required name="email" id="email" type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="ornek@sirket.com" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-300">Konu</label>
        <input required name="subject" id="subject" type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Mesajınızın konusu" />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">Mesaj</label>
        <textarea required name="message" id="message" rows={5} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="Size nasıl yardımcı olabiliriz?" />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Gönderiliyor...</>
        ) : (
          <><Send className="w-5 h-5" /> Mesajı Gönder</>
        )}
      </button>
    </form>
  );
}
