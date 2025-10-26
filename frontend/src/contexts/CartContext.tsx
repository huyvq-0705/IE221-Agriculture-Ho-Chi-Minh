'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccessToken } from '@/lib/auth-client';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    primary_image?: string;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      refreshCart();
    }
  }, []);

  const refreshCart = async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/cart/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Unauthorized');
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cart/items/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to add to cart');
      }

      await refreshCart();
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    const token = getAccessToken();
    if (!token) throw new Error('Unauthorized');

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cart/items/${itemId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await refreshCart();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    const token = getAccessToken();
    if (!token) throw new Error('Unauthorized');

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cart/items/${itemId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await refreshCart();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('Unauthorized');

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cart/clear/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchApi } from '@/lib/api';

interface CartSummary {
  total_items: number;
  total_price: number;
}

interface CartContextType {
  cartSummary: CartSummary;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    total_items: 0,
    total_price: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    try {
      const data = await fetchApi('api/cart/summary/', { method: 'GET' });
      setCartSummary(data);
    } catch (err) {
      console.error('Failed to fetch cart summary:', err);
      // If not authenticated, reset cart
      if (err instanceof Error && err.message.includes('401')) {
        setCartSummary({ total_items: 0, total_price: 0 });
      }
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    setIsLoading(true);
    try {
      await fetchApi('api/cart/add/', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      await refreshCart();
    } catch (err) {
      console.error('Failed to add to cart:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartSummary, refreshCart, addToCart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
