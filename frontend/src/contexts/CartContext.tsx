"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: string;
  image?: string | null;
  quantity: number;
  pending?: boolean;
}

interface CartState {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

interface CartContextValue {
  cart: CartState;
  itemCount: number;
  isLoading: boolean;
  addToCartOptimistic: (payload: {
    product_id: number;
    name?: string;
    price?: string;
    image?: string | null;
    quantity?: number;
  }) => Promise<void>;
  removeOptimisticItem: (tempId: number) => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

let tempIdCounter = -1;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartState>({
    items: [],
    total_items: 0,
    total_price: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const computeTotals = (items: CartItem[]) => {
    const total_items = items.reduce((s, it) => s + it.quantity, 0);
    const total_price = items.reduce((s, it) => s + parseFloat(it.price || "0") * it.quantity, 0);
    return { total_items, total_price };
  };

  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/cart/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load cart");
      const data = await res.json();
      const items: CartItem[] = data.items.map((it: any) => ({
        id: it.id,
        product_id: it.product.id,
        name: it.product.name,
        price: String(it.product.price),
        image: it.product.primary_image ?? null,
        quantity: it.quantity,
        pending: false,
      }));
      const totals = computeTotals(items);
      setCart({ items, ...totals });
    } catch (err) {
      console.error("refreshCart failed", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCartOptimistic = useCallback(async ({ product_id, name, price, image, quantity = 1 }: {
    product_id: number;
    name?: string;
    price?: string;
    image?: string | null;
    quantity?: number;
  }) => {
    const tempId = tempIdCounter--;
    const optimisticItem: CartItem = {
      id: tempId,
      product_id,
      name: name ?? "Sản phẩm",
      price: price ?? "0",
      image: image ?? null,
      quantity,
      pending: true,
    };
    setCart(prev => {
      const newItems = [...prev.items, optimisticItem];
      const totals = computeTotals(newItems);
      return { items: newItems, ...totals };
    });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/cart/add/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id, quantity }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || errBody?.detail || `Add to cart failed (${res.status})`);
      }
      const data = await res.json();
      const items: CartItem[] = data.items.map((it: any) => ({
        id: it.id,
        product_id: it.product.id,
        name: it.product.name,
        price: String(it.product.price),
        image: it.product.primary_image ?? null,
        quantity: it.quantity,
        pending: false,
      }));
      const totals = computeTotals(items);
      setCart({ items, ...totals });
    } catch (err) {
      console.error("addToCartOptimistic failed", err);
      setCart(prev => {
        const newItems = prev.items.filter(i => i.id !== tempId);
        const totals = computeTotals(newItems);
        return { items: newItems, ...totals };
      });
      throw err;
    }
  }, []);

  const removeOptimisticItem = useCallback((tempId: number) => {
    setCart(prev => {
      const newItems = prev.items.filter(i => i.id !== tempId);
      const totals = computeTotals(newItems);
      return { items: newItems, ...totals };
    });
  }, []);

  const value: CartContextValue = {
    cart,
    itemCount: cart.total_items,
    isLoading,
    addToCartOptimistic,
    removeOptimisticItem,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
