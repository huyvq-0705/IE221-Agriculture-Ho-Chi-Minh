'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { deleteProduct, updateProduct, type Product, type PaginatedResponse } from '@/app/agrihcmAdmin/products/actions';

// Import các component
import AdminSearchBar from './AdminSearchBar';
import AdminProductCardGrid from './AdminProductCardGrid';
import AdminPagination from './AdminPagination';
import AdminDeleteModal from './AdminDeleteModal';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ProductClientPageProps {
    initialData: PaginatedResponse<Product>;
}

export default function ProductClientPage({ initialData }: ProductClientPageProps) {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, slug: '', name: '' });
    
    const currentSearch = searchParams.get('search') || '';

    const handleSearch = (query: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (query) {
            params.set('search', query);
        } else {
            params.delete('search');
        }
        router.replace(`${pathname}?${params.toString()}`);
    };
    
    const clearSearch = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('search');
        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    };

    // Hàm toggle recommendation status (hiển thị/ẩn trong đề xuất)
    const handleToggleStock = async (slug: string, currentStatus: boolean) => {
        const formData = new FormData();
        // Toggle: true -> false (ẩn), false -> true (hiển thị)
        formData.append('is_in_stock', (!currentStatus).toString());
        
        const result = await updateProduct(slug, null, formData);
        
        if (result.success) {
            router.refresh(); // Refresh để cập nhật UI
        } else {
            throw new Error(result.message);
        }
    };
    
    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteProduct(deleteModal.slug);
            if (result.success) {
                toast({ title: "Thành công", description: result.message });
                router.refresh();
            } else {
                toast({ title: "Lỗi", description: result.message, variant: 'destructive' });
            }
            setDeleteModal({ isOpen: false, slug: '', name: '' });
        });
    };

    return (
        <div className="space-y-6">
            <AdminSearchBar 
                onSearch={handleSearch} 
                placeholder="Tìm kiếm sản phẩm..."
                defaultValue={currentSearch}
            />
            
            {/* Search Result Info */}
            {currentSearch && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                        Tìm thấy <strong>{initialData.count}</strong> kết quả cho:
                    </span>
                    <Badge variant="secondary" className="gap-2">
                        {currentSearch}
                        <button
                            onClick={clearSearch}
                            className="hover:bg-gray-300 rounded-full p-0.5"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                </div>
            )}
            
            <AdminProductCardGrid
                products={initialData.results}
                onDelete={(slug: string, name: string) => setDeleteModal({ isOpen: true, slug, name })}
                onToggleStock={handleToggleStock}
            />

            {initialData.count > 12 && (
                <AdminPagination
                    currentPage={parseInt(searchParams.get('page') || '1')}
                    totalPages={Math.max(1, Math.ceil((initialData.count || 0) / 12))}
                    totalCount={initialData.count || 0}
                />
            )}

            <AdminDeleteModal
                isOpen={deleteModal.isOpen}
                onConfirm={handleDelete}
                onCancel={() => setDeleteModal({ isOpen: false, slug: '', name: '' })}
                title="Xác nhận xóa sản phẩm"
                description={`Bạn có chắc muốn xóa "${deleteModal.name}"? Hành động này không thể hoàn tác.`}
                loading={isPending}
            />
        </div>
    );
}
