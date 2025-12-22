"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CompareProduct {
  id: string;
  slug: string;
  nameTr: string;
  nameEn: string;
  shortDescTr: string | null;
  shortDescEn: string | null;
  type: string;
  category: {
    nameTr: string;
    nameEn: string;
    slug: string;
  } | null;
  primaryImage: string | null;
  lowestPrice: number | null;
  basePrice: number | null;
  tags: string[];
  isFeatured: boolean;
  demoUrl: string | null;
  variantCount: number;
}

interface CompareContextType {
  items: CompareProduct[];
  itemCount: number;
  addItem: (item: CompareProduct) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  isInCompare: (id: string) => boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const COMPARE_STORAGE_KEY = "hyble_compare";
const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load compare list from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse compare list from storage:", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save compare list to localStorage when items change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = (newItem: CompareProduct) => {
    setItems((prev) => {
      // Check if already in compare
      if (prev.some((item) => item.id === newItem.id)) {
        return prev;
      }
      // Check max limit
      if (prev.length >= MAX_COMPARE_ITEMS) {
        return prev;
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
    setIsOpen(false);
  };

  const isInCompare = (id: string) => {
    return items.some((item) => item.id === id);
  };

  return (
    <CompareContext.Provider
      value={{
        items,
        itemCount: items.length,
        addItem,
        removeItem,
        clearAll,
        isInCompare,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}

export { MAX_COMPARE_ITEMS };
