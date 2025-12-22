"use client";

import { useCredits } from "../hooks/useCredits";

interface CreditsBadgeProps {
  className?: string;
}

export function CreditsBadge({ className = "" }: CreditsBadgeProps) {
  const { formattedBalance, isLoading } = useCredits();

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 ${className}`}
    >
      {isLoading ? (
        <span className="h-4 w-12 animate-pulse rounded bg-gray-200" />
      ) : (
        <span className="text-sm font-medium text-gray-900">
          {formattedBalance}
        </span>
      )}
    </div>
  );
}
