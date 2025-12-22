"use client";

import { signIn, signOut } from "next-auth/react";
import { useSession } from "./useSession";

export function useAuth() {
  const { session, isLoading, isAuthenticated } = useSession();

  const login = async (provider?: string, options?: { callbackUrl?: string }) => {
    if (provider) {
      return signIn(provider, {
        callbackUrl: options?.callbackUrl || "/dashboard",
      });
    }
    // Default: open auth modal or redirect to login
    return signIn(undefined, {
      callbackUrl: options?.callbackUrl || "/dashboard",
    });
  };

  const loginWithCredentials = async (email: string, password: string) => {
    return signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  };

  const logout = async (options?: { callbackUrl?: string }) => {
    return signOut({
      callbackUrl: options?.callbackUrl || "/",
    });
  };

  return {
    session,
    isLoading,
    isAuthenticated,
    login,
    loginWithCredentials,
    logout,
  };
}
