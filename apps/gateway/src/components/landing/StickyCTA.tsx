"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      if (window.scrollY > 500 && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY <= 500) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.25 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-slate-900 dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-900/30 dark:shadow-black/50 border border-white/10 p-4 pointer-events-auto">
              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Text */}
                <div className="text-center sm:text-left">
                  <p className="text-white font-semibold">
                    Projenize bugun baslayin
                  </p>
                  <p className="text-slate-400 text-sm">
                    7 gun ucretsiz • Kredi karti gerektirmez
                  </p>
                </div>

                {/* CTA */}
                <a
                  href="https://id.hyble.co/register"
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all whitespace-nowrap"
                >
                  <span>Ucretsiz Basla</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
