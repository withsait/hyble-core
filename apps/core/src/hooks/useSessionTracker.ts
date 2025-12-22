"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export function useSessionTracker() {
  const { data: session, status } = useSession();
  const hasRegistered = useRef(false);

  useEffect(() => {
    // Only register session once when authenticated
    if (status === "authenticated" && session?.user && !hasRegistered.current) {
      hasRegistered.current = true;

      // Register the session
      fetch("/api/sessions", {
        method: "POST",
      }).catch((err) => {
        console.error("Failed to register session:", err);
      });
    }
  }, [status, session]);

  return { session, status };
}
