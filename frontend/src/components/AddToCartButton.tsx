'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { isLoggedIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: number;
  isInStock: boolean;
  stockQuantity: number;
}

export function AddToCartButton({ productId, isInStock, stockQuantity }: AddToCartButtonProps) {
  const { addToCart, isLoading: cartLoading } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    // Check login status
    if (!isLoggedIn()) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      });
      
      // Store current path for redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      
      router.push('/login');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(productId);
      
      toast({
        title: "Thành công",
        description: "Đã thêm sản phẩm vào giỏ hàng",
      });
    } catch (error: any) {
      console.error('Add to cart error:', error);
      
      if (error.message === 'Unauthorized') {
        toast({
          title: "Phiên đăng nhập hết hạn",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        });
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        }
        
        router.push('/login');
        return;
      }
      
      toast({
        title: "Thất bại",
        description: error.message || "Không thể thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const disabled = !isInStock || stockQuantity === 0 || isAdding || cartLoading;

  return (
    <Button
      variant="outline"
      size="lg"
      className="flex-1 border-emerald-700 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
      disabled={disabled}
      onClick={handleAddToCart}
    >
      {isAdding ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang thêm...
        </div>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Thêm vào giỏ
        </>
      )}
    </Button>
  );
}

