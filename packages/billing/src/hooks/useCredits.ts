"use client";

import { useState, useEffect } from "react";
import { CreditsBalance, formatCredits, canAfford } from "../credits";

interface UseCreditsResult {
  balance: CreditsBalance | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  canAfford: (amount: number) => boolean;
  formattedBalance: string;
}

export function useCredits(): UseCreditsResult {
  const [balance, setBalance] = useState<CreditsBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, this would call the API
      // const response = await fetch('/api/billing/credits');
      // const data = await response.json();
      // setBalance(data);

      // Mock data for now
      setBalance({
        available: 0,
        pending: 0,
        currency: "GBP",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return {
    balance,
    isLoading,
    error,
    refresh: fetchBalance,
    canAfford: (amount: number) =>
      balance ? canAfford(balance, amount) : false,
    formattedBalance: balance ? formatCredits(balance.available) : "£0.00",
  };
}
