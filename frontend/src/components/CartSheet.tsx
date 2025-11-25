"use client";

import React, { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CartSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void; }) {
  const { cart, refreshCart, isLoading, updateCartItemOptimistic, removeFromCartOptimistic } = useCart();

  useEffect(() => {
    const handler = () => {
      try {
        onOpenChange(false);
      } catch (e) {
        console.error("Failed to close cart sheet", e);
      }
    };
    window.addEventListener("close-cart-sheet", handler as EventListener);
    return () => window.removeEventListener("close-cart-sheet", handler as EventListener);
  }, [onOpenChange]);

  // helper for changing quantity
  const changeQuantity = async (item: any, delta: number) => {
    const newQty = item.quantity + delta;
    try {
      if (newQty <= 0) {
        await removeFromCartOptimistic(item.product_id);
      } else {
        await updateCartItemOptimistic(item.product_id, newQty);
      }
    } catch (err) {
      console.error("Failed to change quantity", err);
      // best-effort: refresh to sync server state
      try { await refreshCart(); } catch (_) {}
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle>Giỏ hàng ({cart.total_items})</SheetTitle>
        </SheetHeader>

        <div className="p-4">
          {cart.items.length === 0 && <p className="text-sm text-gray-500">Giỏ hàng trống.</p>}
          <ul className="space-y-3">
            {cart.items.map(it => (
              <li key={it.id} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {it.image ? <img src={it.image} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm">{it.name}</div>
                      <div className="text-xs text-gray-500">{it.quantity} × {parseFloat(it.price).toLocaleString("vi-VN")}₫</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        aria-label={`Decrease ${it.name}`}
                        onClick={() => changeQuantity(it, -1)}
                        className="h-8 w-8 rounded border flex items-center justify-center text-sm disabled:opacity-60"
                        disabled={isLoading || it.pending}
                      >
                        −
                      </button>

                      <div className="px-2 text-sm">{it.quantity}</div>

                      <button
                        aria-label={`Increase ${it.name}`}
                        onClick={() => changeQuantity(it, +1)}
                        className="h-8 w-8 rounded border flex items-center justify-center text-sm disabled:opacity-60"
                        disabled={isLoading || it.pending}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {it.pending && <div className="mt-1"><Badge className="text-xs">Đang xử lý</Badge></div>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <SheetFooter>
          <div className="w-full flex gap-2">
            <Button asChild className="w-full">
              <Link href="/checkout">Thanh toán →</Link>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
