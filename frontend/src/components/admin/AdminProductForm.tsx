'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createProduct, updateProduct } from '@/app/agrihcmAdmin/products/actions';
import type { Product, Category } from '@/app/agrihcmAdmin/products/actions';

interface ProductFormProps {
    product?: Product | null;
    categories: Category[];
    mode: 'create' | 'edit';
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
    const { pending } = useFormStatus();
    
    return (
        <Button type="submit" disabled={pending}>
            {pending 
                ? (mode === 'create' ? 'Đang tạo...' : 'Đang lưu...') 
                : (mode === 'create' ? 'Tạo sản phẩm' : 'Cập nhật sản phẩm')
            }
        </Button>
    );
}

export default function ProductForm({ product, categories, mode }: ProductFormProps) {
    const router = useRouter();
    
    // Tạo action wrapper cho updateProduct để bind slug
    const wrappedUpdateAction = mode === 'edit' && product?.slug
        ? updateProduct.bind(null, product.slug)
        : createProduct;
    
    const [state, formAction] = useActionState(wrappedUpdateAction, { 
        success: false,
        message: '', 
        errors: {}
    });

    // Redirect về trang danh sách nếu thành công (chỉ cho create mode)
    // Update mode sẽ redirect trong action
    useEffect(() => {
        if (state?.success && mode === 'create') {
            // createProduct đã có redirect, nhưng để đảm bảo
            router.push('/agrihcmAdmin/products');
            router.refresh();
        }
    }, [state?.success, mode, router]);

    return (
        <form action={formAction} className="space-y-6 bg-white p-6 rounded-lg shadow">
            {/* Tên sản phẩm */}
            <div>
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input 
                    id="name" 
                    name="name" 
                    defaultValue={product?.name} 
                    placeholder="Nhập tên sản phẩm"
                    required 
                />
                {state?.errors?.name && (
                    <p className="text-sm text-red-600 mt-1">{state.errors.name[0]}</p>
                )}
            </div>

            {/* Slug */}
            <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input 
                    id="slug" 
                    name="slug" 
                    defaultValue={product?.slug}
                    placeholder="ten-san-pham"
                    required 
                    disabled={mode === 'edit'}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {mode === 'edit' 
                        ? 'Slug không thể thay đổi sau khi tạo'
                        : 'URL thân thiện (vd: ca-chua-da-lat)'
                    }
                </p>
                {state?.errors?.slug && (
                    <p className="text-sm text-red-600 mt-1">{state.errors.slug[0]}</p>
                )}
            </div>

            {/* Mô tả */}
            <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea 
                    id="description" 
                    name="description" 
                    defaultValue={product?.description || ''}
                    placeholder="Nhập mô tả chi tiết về sản phẩm"
                    rows={4}
                />
                {state?.errors?.description && (
                    <p className="text-sm text-red-600 mt-1">{state.errors.description[0]}</p>
                )}
            </div>

            {/* Giá và Số lượng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="price">Giá (VNĐ) *</Label>
                    <Input 
                        id="price" 
                        name="price" 
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={product?.price}
                        placeholder="0.00"
                        required 
                    />
                    {state?.errors?.price && (
                        <p className="text-sm text-red-600 mt-1">{state.errors.price[0]}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="stock_quantity">Số lượng tồn kho *</Label>
                    <Input 
                        id="stock_quantity" 
                        name="stock_quantity" 
                        type="number"
                        min="0"
                        defaultValue={product?.stock_quantity}
                        placeholder="0"
                        required 
                    />
                    {state?.errors?.stock_quantity && (
                        <p className="text-sm text-red-600 mt-1">{state.errors.stock_quantity[0]}</p>
                    )}
                </div>
            </div>

            {/* Danh mục */}
            <div>
                <Label htmlFor="category_id">Danh mục *</Label>
                <Select 
                    name="category_id" 
                    defaultValue={product?.category?.id?.toString()}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {state?.errors?.category_id && (
                    <p className="text-sm text-red-600 mt-1">{state.errors.category_id[0]}</p>
                )}
            </div>

            {/* URL hình ảnh */}
            <div>
                <Label htmlFor="image_url">URL hình ảnh</Label>
                <Input 
                    id="image_url" 
                    name="image_url" 
                    type="url"
                    defaultValue={product?.primary_image || ''}
                    placeholder="https://example.com/image.jpg"
                />
                {product?.primary_image && (
                    <div className="mt-2">
                        <img 
                            src={product.primary_image} 
                            alt={product.name}
                            className="w-32 h-32 object-cover rounded border"
                        />
                    </div>
                )}
                {state?.errors?.image_url && (
                    <p className="text-sm text-red-600 mt-1">{state.errors.image_url[0]}</p>
                )}
            </div>

            {/* Trạng thái còn hàng */}
            <div className="flex items-center space-x-2">
                <Checkbox 
                    id="is_in_stock" 
                    name="is_in_stock" 
                    defaultChecked={product?.is_in_stock ?? true} 
                    value="true"
                />
                <Label htmlFor="is_in_stock" className="cursor-pointer">
                    Còn hàng
                </Label>
            </div>

            {/* Thông báo lỗi chung */}
            {state?.message && !state.success && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{state.message}</p>
                </div>
            )}

            {/* Thông báo thành công */}
            {state?.success && state?.message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">{state.message}</p>
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
                <SubmitButton mode={mode} />
                <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.back()}
                >
                    Hủy
                </Button>
            </div>
        </form>
    );
}
