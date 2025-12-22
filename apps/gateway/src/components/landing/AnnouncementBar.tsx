"use client";

import { Gift, ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Countdown timer - 31 Ocak 2025'e kadar
  useEffect(() => {
    const targetDate = new Date("2025-01-31T23:59:59").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-2.5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 text-sm">
          {/* Content */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Gift className="w-4 h-4 text-amber-400 hidden sm:block" />
            <span className="font-medium">
              Net %50 İndirim + Tüm Paketlerde Altyapı Taşıma Desteği
            </span>

            {/* Countdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="bg-white/10 px-2 py-1 rounded">
                <span className="font-bold">{timeLeft.days}</span>
                <span className="text-white/60 ml-1">Gün</span>
              </div>
              <div className="bg-white/10 px-2 py-1 rounded">
                <span className="font-bold">{timeLeft.hours}</span>
                <span className="text-white/60 ml-1">Saat</span>
              </div>
              <div className="bg-white/10 px-2 py-1 rounded">
                <span className="font-bold">{timeLeft.minutes}</span>
                <span className="text-white/60 ml-1">Dakika</span>
              </div>
              <div className="bg-white/10 px-2 py-1 rounded hidden sm:block">
                <span className="font-bold">{timeLeft.seconds}</span>
                <span className="text-white/60 ml-1">Saniye</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="https://id.hyble.co/register?promo=newyear2025"
            className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-lg font-semibold text-xs transition-all"
          >
            Hemen Başla
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4 text-white/60 hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
