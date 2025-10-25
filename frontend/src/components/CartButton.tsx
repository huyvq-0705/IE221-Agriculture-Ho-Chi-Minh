'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function CartButton() {
  const { cartSummary } = useCart();

  return (
    <Link href="/cart">
      <Button variant="outline" size="icon" className="relative">
        <ShoppingCart className="w-5 h-5" />
        {cartSummary.total_items > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {cartSummary.total_items > 99 ? '99+' : cartSummary.total_items}
          </span>
        )}
      </Button>
    </Link>
  );
}
