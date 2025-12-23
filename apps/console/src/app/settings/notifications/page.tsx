"use client";

import { useEffect } from "react";

// Redirect to id.hyble.co/account?section=profile
export default function NotificationsSettingsPage() {
  useEffect(() => {
    const accountUrl = process.env.NODE_ENV === "production"
      ? "https://id.hyble.co/account?section=profile"
      : "http://localhost:3000/account?section=profile";
    window.location.href = accountUrl;
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">
          Hesap ayarlarina yonlendiriliyorsunuz...
        </p>
      </div>
    </div>
  );
}
