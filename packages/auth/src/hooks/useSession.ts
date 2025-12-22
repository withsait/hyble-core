"use client";

import { useSession as useNextAuthSession } from "next-auth/react";
import type { HybleSession } from "../session";

export function useSession() {
  const { data, status, update } = useNextAuthSession();

  return {
    session: data as HybleSession | null,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    update,
  };
}
