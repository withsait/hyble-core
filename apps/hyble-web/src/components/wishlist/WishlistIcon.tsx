"use client";

import { useWishlist } from "@/lib/wishlist-context";
import { Heart } from "lucide-react";

export function WishlistIcon() {
  const { itemCount, setIsOpen } = useWishlist();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      aria-label="Favoriler"
    >
      <Heart className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </button>
  );
}
