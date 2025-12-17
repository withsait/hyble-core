"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Server, Zap } from "lucide-react";

const trustIndicators = [
  { icon: Shield, text: "GDPR Uyumlu" },
  { icon: Server, text: "DE Datacenter" },
  { icon: Zap, text: "99.9% Uptime" },
];

export function TrustFloatingBar() {
  const { scrollYProgress } = useScroll();

  // Sayfa %15'ten fazla scroll edildiğinde görünür olsun
  const opacity = useTransform(scrollYProgress, [0.1, 0.15], [0, 1]);
  const y = useTransform(scrollYProgress, [0.1, 0.15], [20, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
    >
      <div className="max-w-7xl mx-auto px-4 pb-4 flex justify-center">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-700 shadow-lg px-6 py-3 inline-flex items-center gap-6 pointer-events-auto">
          {trustIndicators.map((item, index) => (
            <div
              key={item.text}
              className="flex items-center gap-2 text-sm"
            >
              <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {item.text}
              </span>
              {index < trustIndicators.length - 1 && (
                <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 ml-4 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
