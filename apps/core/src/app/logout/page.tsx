"use client";

import { useEffect, useState, useRef } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const logoutAttempted = useRef(false);

  useEffect(() => {
    // Prevent multiple logout attempts
    if (logoutAttempted.current) return;
    logoutAttempted.current = true;

    async function performLogout() {
      try {
        // Clear any local storage items related to auth first
        if (typeof window !== "undefined") {
          sessionStorage.clear();
          localStorage.removeItem("next-auth.session-token");
        }

        // Call our custom logout API to clear server-side cookies
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch (e) {
          console.warn("Custom logout API error:", e);
        }

        // Use NextAuth's signOut - this clears the session properly
        // The redirect: false prevents NextAuth from handling the redirect
        await signOut({
          redirect: false,
          callbackUrl: "/login?logout=success"
        });

        // Small delay to ensure everything is cleared
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Force redirect to login page
        window.location.href = "/login?logout=success";
      } catch (error) {
        console.error("Logout error:", error);
        setStatus("error");

        // Even on error, clear what we can and redirect
        try {
          document.cookie.split(";").forEach((c) => {
            const parts = c.split("=");
            const name = parts[0]?.trim();
            if (name && (name.includes("authjs") || name.includes("next-auth"))) {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            }
          });
        } catch (e) {
          // Ignore cookie clearing errors
        }

        setTimeout(() => {
          window.location.href = "/login?logout=success";
        }, 1000);
      }
    }

    performLogout();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">H</span>
        </div>
        {status === "loading" ? (
          <>
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Oturumunuz kapatiliyor...</p>
          </>
        ) : (
          <p className="text-red-600 dark:text-red-400">
            Bir hata olustu. Yonlendiriliyorsunuz...
          </p>
        )}
      </div>
    </div>
  );
}
