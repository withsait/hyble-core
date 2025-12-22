"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface WishlistProduct {
  id: string;
  slug: string;
  nameTr: string;
  nameEn: string;
  shortDescTr: string | null;
  type: string;
  category: {
    nameTr: string;
    slug: string;
  } | null;
  primaryImage: string | null;
  lowestPrice: number | null;
  addedAt: number;
}

interface WishlistContextType {
  items: WishlistProduct[];
  itemCount: number;
  addItem: (item: Omit<WishlistProduct, "addedAt">) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  isInWishlist: (id: string) => boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "hyble_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse wishlist from storage:", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save wishlist to localStorage when items change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = (newItem: Omit<WishlistProduct, "addedAt">) => {
    setItems((prev) => {
      // Check if already in wishlist
      if (prev.some((item) => item.id === newItem.id)) {
        return prev;
      }
      return [...prev, { ...newItem, addedAt: Date.now() }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        addItem,
        removeItem,
        clearAll,
        isInWishlist,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
