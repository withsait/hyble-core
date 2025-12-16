"use client";

import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@hyble/ui";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    variant?: string;
    price: number;
    quantity: number;
    image?: string;
    slug: string;
  };
}

export function CartItem({ item }: CartItemProps) {
  const utils = trpc.useUtils();

  const updateQuantity = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  const removeItem = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  const isUpdating = updateQuantity.isPending;
  const isRemoving = removeItem.isPending;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) {
      removeItem.mutate({ itemId: item.id });
    } else {
      updateQuantity.mutate({ itemId: item.id, quantity: newQuantity });
    }
  };

  return (
    <div className="flex gap-4 p-3 rounded-lg border bg-card">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.slug}`}
          className="font-medium text-sm hover:text-primary line-clamp-1"
        >
          {item.name}
        </Link>
        {item.variant && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.variant}</p>
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
              €{(item.price * item.quantity).toFixed(2)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                €{item.price.toFixed(2)} / adet
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
        onClick={() => removeItem.mutate({ itemId: item.id })}
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
