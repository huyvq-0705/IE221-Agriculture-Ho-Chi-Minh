import ProductForm from '@/components/admin/AdminProductForm';
import { getProductBySlug, getCategories } from '../actions';
import { notFound } from 'next/navigation';

// Force dynamic để luôn fetch data mới
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>; // ✅ FIX: params là Promise trong Next.js 15
}

export default async function EditProductPage({ params }: PageProps) {
    // ✅ FIX: Await params trước khi sử dụng
    const { slug } = await params;
    
    // Lấy dữ liệu sản phẩm và categories song song
    const [product, categories] = await Promise.all([
        getProductBySlug(slug),
        getCategories(),
    ]);

    // Nếu không tìm thấy sản phẩm, hiển thị 404
    if (!product) {
        notFound();
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
                <p className="text-gray-600 mt-1">Cập nhật thông tin sản phẩm: {product.name}</p>
            </div>
            
            <ProductForm 
                product={product} 
                categories={categories}
                mode="edit"
            />
        </div>
    );
}