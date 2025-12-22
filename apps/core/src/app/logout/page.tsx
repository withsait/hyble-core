"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    // Automatically sign out and redirect to login
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">H</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400">Oturumunuz kapatılıyor...</p>
      </div>
    </div>
  );
}
