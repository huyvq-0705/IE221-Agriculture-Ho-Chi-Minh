'use client';

import { useTransition } from 'react';
import { adminLogout } from '@/app/agrihcmAdmin/actions';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminLogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

export default function AdminLogoutButton({ 
  variant = 'outline', 
  size = 'default',
  showIcon = true,
  className = ''
}: AdminLogoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        console.log('🔐 Client: Calling logout...');
        await adminLogout();
        // redirect() sẽ tự động chuyển hướng, không cần làm gì thêm
      } catch (error) {
        // Chỉ show error nếu KHÔNG phải NEXT_REDIRECT
        if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
          console.error('❌ Logout failed:', error);
          toast({
            title: 'Lỗi',
            description: 'Không thể đăng xuất. Vui lòng thử lại.',
            variant: 'destructive'
          });
        }
        // NEXT_REDIRECT error là bình thường, bỏ qua
      }
    });
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      variant={variant}
      size={size}
      className={className}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Đang đăng xuất...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="w-4 h-4 mr-2" />}
          Đăng xuất
        </>
      )}
    </Button>
  );
}
