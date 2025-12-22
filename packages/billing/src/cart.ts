// Cart types and logic

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  vertical: "studios" | "digital" | "cloud";
  metadata?: Record<string, any>;
}

export interface Cart {
  items: CartItem[];
  currency: "GBP" | "USD" | "EUR";
}

export function createEmptyCart(): Cart {
  return {
    items: [],
    currency: "GBP",
  };
}

export function addItemToCart(cart: Cart, item: Omit<CartItem, "id">): Cart {
  const existingIndex = cart.items.findIndex(
    (i) => i.productId === item.productId
  );

  if (existingIndex !== -1) {
    // Update quantity
    const newItems = [...cart.items];
    newItems[existingIndex] = {
      ...newItems[existingIndex],
      quantity: newItems[existingIndex].quantity + item.quantity,
    };
    return { ...cart, items: newItems };
  }

  // Add new item
  return {
    ...cart,
    items: [
      ...cart.items,
      { ...item, id: `cart_${Date.now()}_${Math.random().toString(36).slice(2)}` },
    ],
  };
}

export function removeItemFromCart(cart: Cart, itemId: string): Cart {
  return {
    ...cart,
    items: cart.items.filter((item) => item.id !== itemId),
  };
}

export function updateItemQuantity(
  cart: Cart,
  itemId: string,
  quantity: number
): Cart {
  if (quantity <= 0) {
    return removeItemFromCart(cart, itemId);
  }

  return {
    ...cart,
    items: cart.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    ),
  };
}

export function calculateCartTotal(cart: Cart): number {
  return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}

export function clearCart(): Cart {
  return createEmptyCart();
}
