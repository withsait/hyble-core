"use client";

import { useState } from "react";
import { Button } from "@hyble/ui";
import { ShoppingCart } from "lucide-react";
import { CartDrawer } from "./CartDrawer";

export function CartIcon() {
  const [isOpen, setIsOpen] = useState(false);

  // TODO: Replace with tRPC query when cart router is ready
  // const { data: cart } = trpc.cart.get.useQuery(undefined, { refetchInterval: 30000 });
  const itemCount = 0;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </Button>

      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
