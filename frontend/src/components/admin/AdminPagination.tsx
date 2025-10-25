'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export default function AdminPagination({ currentPage, totalPages, totalCount }: AdminPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/agrihcmAdmin/products?${params.toString()}`);
  };

  // ✅ Nếu totalPages bị 0 hoặc NaN thì không hiển thị
  if (!totalPages || totalPages <= 1) return null;

  console.log({ currentPage, totalPages, totalCount });

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t">
      <div className="text-sm text-gray-700">
        Trang <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
        {' - '}
        Tổng <span className="font-medium">{totalCount}</span> sản phẩm
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Trước
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
