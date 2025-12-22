"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle, Sparkles, X } from "lucide-react";

// Scroll bazlı mesajlar
const scrollMessages = [
  {
    threshold: 0.3,
    title: "En popüler: Hyble ID",
    description: "Kullanıcı kimlik doğrulama sistemi",
    cta: "Keşfet",
    href: "/products/id",
    icon: Sparkles,
  },
  {
    threshold: 0.6,
    title: "Hazır mısın?",
    description: "7 gün ücretsiz deneme",
    cta: "Başla",
    href: "https://id.hyble.co/register",
    icon: ArrowRight,
  },
  {
    threshold: 0.9,
    title: "Sorularınız mı var?",
    description: "Size yardımcı olalım",
    cta: "İletişime Geç",
    href: "/contact",
    icon: MessageCircle,
  },
];

export function ScrollCTA() {
  const [currentMessage, setCurrentMessage] = useState<typeof scrollMessages[0] | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [lastShownThreshold, setLastShownThreshold] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (dismissed) return;

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = window.scrollY / scrollHeight;

      // Find the appropriate message based on scroll progress
      const message = scrollMessages.find(
        (msg) => scrollProgress >= msg.threshold && msg.threshold > lastShownThreshold
      );

      if (message && message.threshold !== lastShownThreshold) {
        setCurrentMessage(message);
        setLastShownThreshold(message.threshold);

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setCurrentMessage(null);
        }, 5000);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed, lastShownThreshold]);

  const handleDismiss = () => {
    setCurrentMessage(null);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {currentMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 pr-10">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <currentMessage.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {currentMessage.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentMessage.description}
                </p>
                <a
                  href={currentMessage.href}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 transition-colors"
                >
                  {currentMessage.cta}
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
