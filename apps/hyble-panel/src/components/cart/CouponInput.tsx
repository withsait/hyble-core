"use client";

import { useState } from "react";
import { Button, Input } from "@hyble/ui";
import { Tag, Loader2, Check, X, Percent } from "lucide-react";

// Mock data - will be replaced with tRPC when cart router is ready
const mockCart = { coupon: null };

export function CouponInput() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "applying" | "applied" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  // TODO: Replace with tRPC query when cart router is ready
  const appliedCoupon = mockCart.coupon;

  const handleApply = async () => {
    if (!code.trim()) return;
    setStatus("applying");
    setErrorMessage("");
    await new Promise(resolve => setTimeout(resolve, 500));
    setStatus("applied");
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setCode("");
    setStatus("idle");
    setIsRemoving(false);
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-green-100 dark:bg-green-800">
            <Percent className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-green-800 dark:text-green-200 text-sm">
              DEMO10
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              %10 indirim
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-green-700 hover:text-red-600 hover:bg-red-50"
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kupon kodu"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (status === "error") {
                setStatus("idle");
                setErrorMessage("");
              }
            }}
            className="pl-9 uppercase"
            disabled={status === "applying"}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={!code.trim() || status === "applying"}
        >
          {status === "applying" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Uygula"
          )}
        </Button>
      </div>

      {status === "error" && errorMessage && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
