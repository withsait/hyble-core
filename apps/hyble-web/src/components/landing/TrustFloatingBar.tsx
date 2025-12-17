"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Gift, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function TrustFloatingBar() {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(true);

  // Sayfa %15'ten fazla scroll edildiğinde görünür olsun
  const opacity = useTransform(scrollYProgress, [0.1, 0.15], [0, 1]);
  const y = useTransform(scrollYProgress, [0.1, 0.15], [20, 0]);

  if (!isVisible) return null;

  return (
    <motion.div
      style={{ opacity, y }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-2xl shadow-xl shadow-amber-500/20 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Content */}
          <div className="flex items-center gap-3 flex-1">
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-white/20 items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="text-white font-bold text-sm sm:text-base">
                2025 Kampanyası:
              </span>
              <span className="text-amber-100 text-sm">
                Yıllık planlarda <span className="font-bold text-white">%30 indirim!</span> 31 Ocak&apos;a kadar geçerli.
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="https://id.hyble.co/register?promo=newyear2025"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white text-amber-600 rounded-lg font-semibold text-sm hover:bg-amber-50 transition-colors"
          >
            <span className="hidden sm:inline">Kampanyayı Yakala</span>
            <span className="sm:hidden">Yakala</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
