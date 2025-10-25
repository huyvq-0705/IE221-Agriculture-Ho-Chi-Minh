import ProductForm from '@/components/admin/AdminProductForm';
import { getCategories } from '../actions';

export default async function CreateProductPage() {
  const categories = await getCategories();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tạo sản phẩm mới</h1>
      {/* Không truyền action, chỉ truyền mode='create' và categories */}
      <ProductForm 
        mode="create"
        categories={categories}
      />
    </div>
  );
}
