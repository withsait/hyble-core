"use client";

import { useState } from "react";
import { Button, Input } from "@hyble/ui";
import { Tag, Loader2, X, Percent } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export function CouponInput() {
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: cart } = trpc.cart.get.useQuery();
  const utils = trpc.useUtils();

  const applyMutation = trpc.cart.applyCoupon.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      setCode("");
      setErrorMessage("");
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const removeMutation = trpc.cart.removeCoupon.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  const appliedCoupon = cart?.coupon;
  const isApplying = applyMutation.isPending;
  const isRemoving = removeMutation.isPending;

  const handleApply = async () => {
    if (!code.trim()) return;
    setErrorMessage("");
    await applyMutation.mutateAsync({ code: code.trim() });
  };

  const handleRemove = async () => {
    await removeMutation.mutateAsync();
  };

  if (appliedCoupon) {
    const discountText = appliedCoupon.type === "PERCENTAGE"
      ? `%${appliedCoupon.value} indirim`
      : `€${appliedCoupon.value} indirim`;

    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-green-100 dark:bg-green-800">
            <Percent className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-green-800 dark:text-green-200 text-sm">
              {appliedCoupon.code}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              {discountText}
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
              if (errorMessage) {
                setErrorMessage("");
              }
            }}
            className="pl-9 uppercase"
            disabled={isApplying}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={!code.trim() || isApplying}
        >
          {isApplying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Uygula"
          )}
        </Button>
      </div>

      {errorMessage && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
