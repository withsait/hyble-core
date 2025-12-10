"use client";

import { useEffect, useRef } from "react";

export function SessionTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (tracked.current) return;
    tracked.current = true;

    // Create/update session record
    fetch("/api/sessions", { method: "POST" }).catch(() => {
      // Ignore errors
    });
  }, []);

  return null;
}
