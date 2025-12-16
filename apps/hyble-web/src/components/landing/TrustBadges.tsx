"use client";

import { Shield, Server, Lock } from "lucide-react";

const badges = [
  { icon: Server, text: "Powered by Hetzner" },
  { icon: Shield, text: "GDPR Compliant" },
  { icon: Lock, text: "256-bit SSL Secured" },
];

export function TrustBadges() {
  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {badges.map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium"
            >
              <badge.icon className="w-5 h-5" />
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
