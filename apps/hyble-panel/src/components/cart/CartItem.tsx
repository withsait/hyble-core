"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@hyble/ui";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    variantId?: string | null;
    productName: string;
    variantName?: string | null;
    unitPrice: string;
    quantity: number;
    productSlug: string;
    total: string;
  };
}

export function CartItem({ item }: CartItemProps) {
  const utils = trpc.useUtils();

  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  const removeMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  const isUpdating = updateQuantityMutation.isPending;
  const isRemoving = removeMutation.isPending;

  const handleQuantityChange = async (delta: number) => {
    const newQuantity = item.quantity + delta;
    await updateQuantityMutation.mutateAsync({
      itemId: item.id,
      quantity: newQuantity,
    });
  };

  const handleRemove = async () => {
    await removeMutation.mutateAsync({ itemId: item.id });
  };

  const unitPrice = parseFloat(item.unitPrice);
  const total = parseFloat(item.total);

  return (
    <div className="flex gap-4 p-3 rounded-lg border bg-card">
      {/* Image Placeholder */}
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
          {item.productName.slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.productSlug}`}
          className="font-medium text-sm hover:text-primary line-clamp-1"
        >
          {item.productName}
        </Link>
        {item.variantName && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleQuantityChange(-1)}
              disabled={isUpdating || isRemoving}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin mx-auto" />
              ) : (
                item.quantity
              )}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleQuantityChange(1)}
              disabled={isUpdating || isRemoving}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-sm">
              €{total.toFixed(2)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                €{unitPrice.toFixed(2)} / adet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
