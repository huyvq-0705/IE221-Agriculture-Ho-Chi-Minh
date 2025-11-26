"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; 
import { useCart } from "@/contexts/CartContext";
import { Loader2, ShoppingCart } from "lucide-react";

type AddToCartButtonProps = {
  product: {
    id: number;
    name?: string;
    price?: string;
    primary_image?: string | null;
  };
  isInStock?: boolean;
  stockQuantity?: number;
  qty?: number;
  disabled?: boolean;
};

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  isInStock = true,
  stockQuantity = 0,
  qty = 1,
  disabled = false,
}) => {
  const { addToCartOptimistic } = useCart();

  const toastHook = useToast();

  const toast =
    (toastHook && (toastHook as any).toast) ||
    ((opts: any) => {
  
      console.info("[toast fallback]", opts);
    });

  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isInStock || stockQuantity <= 0 || disabled) {
      toast({ title: "Hết hàng", description: "Sản phẩm hiện không có sẵn." });
      return;
    }

    setLoading(true);
    try {
      await addToCartOptimistic({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.primary_image ?? null,
        quantity: qty,
      });

      toast({
        title: "Đã thêm vào giỏ",
        description: `${product.name ?? "Sản phẩm"} đã được thêm vào giỏ`,
      });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err?.message ?? "Không thể thêm vào giỏ",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-md"
      disabled={loading || disabled || !isInStock}
      variant="default"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      {loading ? "Đang thêm..." : "Thêm vào giỏ"}
    </Button>
  );
};

export default AddToCartButton;
