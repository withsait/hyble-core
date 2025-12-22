"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Cart,
  CartItem,
  createEmptyCart,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  calculateCartTotal,
  getCartItemCount,
} from "../cart";

interface CartStore {
  cart: Cart;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: createEmptyCart(),

      addItem: (item) => {
        set((state) => ({
          cart: addItemToCart(state.cart, item),
        }));
      },

      removeItem: (itemId) => {
        set((state) => ({
          cart: removeItemFromCart(state.cart, itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => ({
          cart: updateItemQuantity(state.cart, itemId, quantity),
        }));
      },

      clearCart: () => {
        set({ cart: createEmptyCart() });
      },

      getTotal: () => {
        return calculateCartTotal(get().cart);
      },

      getItemCount: () => {
        return getCartItemCount(get().cart);
      },
    }),
    {
      name: "hyble-cart",
    }
  )
);

// Convenience hook
export function useCart() {
  const store = useCartStore();

  return {
    items: store.cart.items,
    currency: store.cart.currency,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    total: store.getTotal(),
    itemCount: store.getItemCount(),
  };
}
