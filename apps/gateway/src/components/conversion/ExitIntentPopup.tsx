"use client";

import { useState, useEffect } from "react";
import { X, Gift, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // SSR check
    if (typeof window === "undefined") return;

    // Daha önce gösterildi mi kontrol et
    const shown = localStorage.getItem("exitPopupShown");
    if (shown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        localStorage.setItem("exitPopupShown", Date.now().toString());
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
      // TODO: Backend API hazır olduğunda aktif et
      // await fetch("/api/leads/capture", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email,
      //     source: "exit_intent",
      //     couponCode: "WELCOME20"
      //   }),
      // });

      // Simüle et
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
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
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Teşekkürler!
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  İndirim kodun e-posta adresine gönderildi.
                </p>
                <p className="mt-4 text-2xl font-bold text-amber-500">
                  WELCOME20
                </p>
              </div>
            ) : (
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      "Gönderiliyor..."
                    ) : (
                      <>
                        İndirim Kodunu Al
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                  Spam göndermiyoruz. İstediğin zaman çıkabilirsin.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
