"use client";

import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export function useLoginRequiredToast() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const showLoginToast = () => {
    const returnUrl = pathname || "/";
    toast({
      title: "Bạn cần phải đăng nhập",
      description: "Vui lòng đăng nhập để truy cập vào giỏ hàng.",
      variant: "destructive",
      duration: 2000, 
    });

    setTimeout(() => {
      router.push(`/auth/login`);
    }, 300);
  };

  return { showLoginToast };
}
