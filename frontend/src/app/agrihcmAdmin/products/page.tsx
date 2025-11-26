import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getProducts, type PaginatedResponse, type Product } from './actions';
import ProductClientPage from '@/components/admin/AdminProductClientPage';

// Dòng này rất quan trọng, hãy giữ nó
export const dynamic = 'force-dynamic';

interface PageProps {
    // Từ Next.js 15, searchParams là một Promise
    searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
    let data: PaginatedResponse<Product>;
    let token: string | undefined;
    let page: string = '1';
    let search: string = '';

    try {
        // BƯỚC 1: Await searchParams trước
        const params = await searchParams;
        
        // BƯỚC 2: Đọc cookie
        const cookieStore = await cookies();
        token = cookieStore.get('accessToken')?.value;

        if (!token) {
            console.error("ADMIN_PRODUCTS_PAGE_ERROR: No token found.");
            data = { count: 0, next: null, previous: null, results: [] };
        } else {
            // BƯỚC 3: Sử dụng params đã await
            page = params.page || '1';
            search = params.search || '';

            // BƯỚC 4: Gọi hàm fetch
            data = await getProducts(token, page, search);
            
            // DEBUG: Log để kiểm tra
            console.log('✅ Products fetched:', {
                count: data.count,
                resultsLength: data.results?.length,
                firstProduct: data.results?.[0]?.name
            });
        }

    } catch (error) {
        console.error("ADMIN_PRODUCTS_PAGE_ERROR:", error);
        data = { count: 0, next: null, previous: null, results: [] };
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
                <Link href="/agrihcmAdmin/products/create">
                    <Button><Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm</Button>
                </Link>
            </div>
            
            <ProductClientPage initialData={data} />
        </div>
    );
}
