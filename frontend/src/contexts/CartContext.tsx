"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

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

type AddToCartPayload = {
  product_id: number;
  name?: string;
  price?: string;
  image?: string | null;
  quantity?: number;
};

interface CartContextValue {
  cart: CartState;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productIdOrPayload: number | AddToCartPayload, quantity?: number) => Promise<void>;
  addToCartOptimistic: (payload: AddToCartPayload) => Promise<void>;
  updateCartItemOptimistic: (product_id: number, newQuantity: number) => Promise<void>;
  removeFromCartOptimistic: (product_id: number) => Promise<void>;
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

// Use environment variable or fallback
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- HELPER: Get Headers with Token ---
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // Read token from LocalStorage (Header-Based Auth)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

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
      const res = await fetch(`${API_BASE}/api/cart/`, {
        method: "GET",
        headers: getAuthHeaders(), // <--- UPDATED
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setCart({ items: [], total_items: 0, total_price: 0 });
          return;
        }
        throw new Error(`Failed to load cart (${res.status})`);
      }

      const data = await res.json();
      const items: CartItem[] = (data.items || []).map((it: any) => ({
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

  const addToCartOptimistic = useCallback(async ({ product_id, name, price, image, quantity = 1 }: AddToCartPayload) => {
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
      const existingIndex = prev.items.findIndex(i => i.product_id === product_id && i.id > 0);
      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = prev.items.map(i => i.product_id === product_id ? { ...i, quantity: i.quantity + quantity, pending: true } : i);
      } else {
        newItems = [...prev.items, optimisticItem];
      }
      const totals = computeTotals(newItems);
      return { items: newItems, ...totals };
    });

    try {
      const res = await fetch(`${API_BASE}/api/cart/add/`, {
        method: "POST",
        headers: getAuthHeaders(), // <--- UPDATED
        body: JSON.stringify({ product_id, quantity }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || errBody?.detail || `Add to cart failed (${res.status})`);
      }

      const data = await res.json();
      const items: CartItem[] = (data.items || []).map((it: any) => ({
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
        const newItems = prev.items.filter(i => i.id !== tempId && !(i.product_id === product_id && i.id > tempIdCounter));
        const totals = computeTotals(newItems);
        return { items: newItems, ...totals };
      });
      throw err;
    }
  }, []);

  const updateCartItemOptimistic = useCallback(async (product_id: number, newQuantity: number) => {
    const prevSnapshot = (cart.items || []).map(i => ({ ...i }));

    setCart(prevCart => {
      let newItems = prevCart.items.map(i => i.product_id === product_id ? { ...i, quantity: newQuantity, pending: true } : i);
      newItems = newItems.filter(i => i.quantity > 0);
      const totals = computeTotals(newItems);
      return { items: newItems, ...totals };
    });

    try {
      const res = await fetch(`${API_BASE}/api/cart/update/`, {
        method: "POST",
        headers: getAuthHeaders(), // <--- UPDATED
        body: JSON.stringify({ product_id, quantity: newQuantity }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || errBody?.detail || `Update cart failed (${res.status})`);
      }

      const data = await res.json();
      const items: CartItem[] = (data.items || []).map((it: any) => ({
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
      console.error("updateCartItemOptimistic failed", err);
      const totals = computeTotals(prevSnapshot);
      setCart({ items: prevSnapshot, ...totals });
      throw err;
    }
  }, [cart.items]);

  const removeFromCartOptimistic = useCallback(async (product_id: number) => {
    const prevSnapshot = (cart.items || []).map(i => ({ ...i }));
    setCart(prevCart => {
      const newItems = prevCart.items.filter(i => i.product_id !== product_id);
      const totals = computeTotals(newItems);
      return { items: newItems, ...totals };
    });

    try {
      const res = await fetch(`${API_BASE}/api/cart/remove/`, {
        method: "POST",
        headers: getAuthHeaders(), // <--- UPDATED
        body: JSON.stringify({ product_id }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || errBody?.detail || `Remove from cart failed (${res.status})`);
      }

      const data = await res.json();
      const items: CartItem[] = (data.items || []).map((it: any) => ({
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
      console.error("removeFromCartOptimistic failed", err);
      const totals = computeTotals(prevSnapshot);
      setCart({ items: prevSnapshot, ...totals });
      throw err;
    }
  }, [cart.items]);

  const removeOptimisticItem = useCallback((tempId: number) => {
    setCart(prev => {
      const newItems = prev.items.filter(i => i.id !== tempId);
      const totals = computeTotals(newItems);
      return { items: newItems, ...totals };
    });
  }, []);

  const addToCart = useCallback(async (productIdOrPayload: number | AddToCartPayload, quantity?: number) => {
    if (typeof productIdOrPayload === "object" && productIdOrPayload !== null) {
      return addToCartOptimistic(productIdOrPayload);
    }
    const product_id = Number(productIdOrPayload);
    const qty = typeof quantity === "number" ? quantity : 1;
    return addToCartOptimistic({ product_id, quantity: qty });
  }, [addToCartOptimistic]);

  // --- auto-load behavior ---
  useEffect(() => {
    let mounted = true;

    const checkAuthAndRefresh = async () => {
      try {
        // Also check "me" using headers
        const res = await fetch(`${API_BASE}/api/users/me/`, {
          method: "GET",
          headers: getAuthHeaders(), // <--- UPDATED
        });

        if (!mounted) return;

        if (res.ok) {
          await refreshCart();
        } else {
          setCart({ items: [], total_items: 0, total_price: 0 });
        }
      } catch (err) {
        console.error("checkAuthAndRefresh failed", err);
      }
    };

    checkAuthAndRefresh();

    const handler = () => {
      refreshCart().catch(() => {});
    };

    window.addEventListener("user-logged-in", handler);
    return () => {
      mounted = false;
      window.removeEventListener("user-logged-in", handler);
    };
  }, [refreshCart]);

  const value: CartContextValue = {
    cart,
    itemCount: cart.total_items,
    isLoading,
    addToCart,
    addToCartOptimistic,
    updateCartItemOptimistic,
    removeFromCartOptimistic,
    removeOptimisticItem,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};