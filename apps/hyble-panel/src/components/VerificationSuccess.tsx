"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

export function VerificationSuccess() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000); // Hide after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-green-500/10 dark:bg-green-500/10 border border-green-500/30 dark:border-green-500/30 rounded-xl p-4 mb-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
        <p className="text-green-600 dark:text-green-400">
          Email adresiniz başarıyla doğrulandı!
        </p>
      </div>
    </div>
  );
}
