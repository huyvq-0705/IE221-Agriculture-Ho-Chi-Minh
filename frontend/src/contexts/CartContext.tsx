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
