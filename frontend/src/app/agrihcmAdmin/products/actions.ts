'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { fetchApi } from '@/lib/api';
import { z } from 'zod';
import { redirect } from 'next/navigation';

// Định nghĩa kiểu dữ liệu
export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  description: string;
  category: { id: number; name: string; slug: string;};
  primary_image?: string;
  is_in_stock: boolean;
  stock_quantity: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ✅ Hàm helper async để lấy token
async function getAuthToken(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  if (!accessToken) {
    throw new Error('Unauthorized: No access token found');
  }
  return accessToken;
}

// ✅ FIX: Lấy danh sách sản phẩm với search và pagination
export async function getProducts(
    token: string, 
    page: string, 
    search: string
): Promise<PaginatedResponse<Product>> {
    
    const params = new URLSearchParams();
    params.set('page', page);
    if (search) {
        params.set('search', search);
    }

    const endpoint = `api/admin/products/?${params.toString()}`;
    console.log('🔍 Fetching products from:', endpoint);
    console.log('🔍 Search query:', search);

    const response = await fetchApi(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });

    console.log('📦 Response type:', typeof response, 'Is array:', Array.isArray(response));

    // 🔥 FIX: API trả về array, cần filter theo search và convert sang paginated format
    if (Array.isArray(response)) {
        console.log('✅ Full array length:', response.length);
        
        // 🔥 CLIENT-SIDE SEARCH: Filter products theo search query
        let filteredProducts = response;
        
        if (search && search.trim()) {
            const searchLower = search.toLowerCase().trim();
            filteredProducts = response.filter(product => 
                product.name.toLowerCase().includes(searchLower) ||
                product.description?.toLowerCase().includes(searchLower) ||
                product.category?.name?.toLowerCase().includes(searchLower) ||
                product.slug.toLowerCase().includes(searchLower)
            );
            console.log('🔍 Filtered results:', filteredProducts.length, 'from', response.length);
        }
        
        // Tính toán pagination từ filtered array
        const itemsPerPage = 12;
        const currentPage = parseInt(page) || 1;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filteredProducts.slice(startIndex, endIndex);
        
        console.log('📄 Page', currentPage, ':', paginatedItems.length, 'items');
        
        return {
            count: filteredProducts.length,
            next: endIndex < filteredProducts.length ? `?page=${currentPage + 1}&search=${search}` : null,
            previous: currentPage > 1 ? `?page=${currentPage - 1}&search=${search}` : null,
            results: paginatedItems
        };
    }

    // Nếu API đã trả về paginated format (trường hợp ideal - backend đã xử lý search)
    if (response && typeof response === 'object' && 'results' in response) {
        console.log('✅ API returned paginated format with', response.count, 'total items');
        return response as PaginatedResponse<Product>;
    }

    // Fallback: Trả về empty
    console.error('❌ Unexpected response format:', response);
    return {
        count: 0,
        next: null,
        previous: null,
        results: []
    };
}

// Lấy chi tiết một sản phẩm
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const token = await getAuthToken();
    return fetchApi(`api/admin/products/${slug}/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Failed to fetch product by slug:', error);
    return null;
  }
}

// Lấy danh sách category (để dùng trong form)
export async function getCategories(): Promise<Category[]> {
  try {
    const token = await getAuthToken();
    const response = await fetchApi('api/categories/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(response) ? response : (response.results || []);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

// 🔥 FIX: Schema validation - chỉ dùng primary_image
const productSchema = z.object({
  name: z.string().min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự'),
  slug: z.string().min(3, 'Slug phải có ít nhất 3 ký tự').optional(), // Optional vì có thể auto-generate từ name
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Giá sản phẩm không thể âm'),
  stock_quantity: z.coerce.number().int().min(0, 'Số lượng không thể âm'),
  category: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    },
    z.number().int().positive('Vui lòng chọn danh mục')
  ).optional(),
  category_id: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
      return val;
    },
    z.number().int().positive('Vui lòng chọn danh mục')
  ).optional(),
  primary_image: z.string().min(1, 'Vui lòng nhập URL hình ảnh').url('URL hình ảnh không hợp lệ'),
  is_in_stock: z.preprocess(
    (val: unknown) => val === 'on' || val === 'true' || val === true,
    z.boolean()
  ),
}).refine(
  (data) => data.category !== undefined || data.category_id !== undefined,
  {
    message: 'Phải có category hoặc category_id',
    path: ['category'],
  }
);

interface ActionState {
  message: string;
  success?: boolean;
  errors?: Record<string, string[]>;
}

// 🔥 Helper function để chuẩn hóa slug từ tiếng Việt
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
}

// 🔥 Helper function để chuẩn bị data gửi API
function prepareApiData(validatedData: Record<string, any>): Record<string, any> {
  const apiData: Record<string, any> = {
    name: validatedData.name,
    description: validatedData.description || '',
    price: validatedData.price,
    stock_quantity: validatedData.stock_quantity,
    is_in_stock: validatedData.is_in_stock,
    primary_image: validatedData.primary_image,
  };

  // 🔥 Xử lý category: ưu tiên category_id, fallback về category
  if (validatedData.category_id !== undefined) {
    apiData.category_id = validatedData.category_id;
  } else if (validatedData.category !== undefined) {
    apiData.category_id = validatedData.category;
  }

  // 🔥 Xử lý slug: ưu tiên slug có sẵn, không thì auto-generate
  if (validatedData.slug) {
    apiData.slug = validatedData.slug;
  } else {
    apiData.slug = generateSlug(validatedData.name);
  }

  console.log('📤 Prepared API data:', apiData);
  return apiData;
}

// Server Action để TẠO sản phẩm
export async function createProduct(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const token = await getAuthToken();
    
    const rawData = Object.fromEntries(formData.entries());
    console.log('📥 Raw form data:', rawData);
    
    // 🔥 Normalize category_id → category để validate
    const dataToValidate = { ...rawData };
    if (rawData.category_id && !rawData.category) {
      dataToValidate.category = rawData.category_id;
    }
    
    const validatedFields = productSchema.safeParse(dataToValidate);

    if (!validatedFields.success) {
      console.error('❌ Validation failed:', validatedFields.error.flatten().fieldErrors);
      console.error('❌ Raw data:', rawData);
      return {
        success: false,
        message: 'Dữ liệu không hợp lệ.',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // 🔥 Chuẩn bị data để gửi API
    const apiData = prepareApiData(validatedFields.data);

    await fetchApi('api/admin/products/', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    console.log('✅ Product created successfully');
    revalidatePath('/agrihcmAdmin/products');
    redirect('/agrihcmAdmin/products');

  } catch (error) {
    // 🔥 FIX: Không bắt NEXT_REDIRECT - đây là behavior bình thường của Next.js
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error; // Re-throw để Next.js xử lý redirect
    }
    
    console.error('Create product error:', error);
    if (error instanceof Error) {
      return { success: false, message: error.message, errors: {} };
    }
    return { success: false, message: 'Tạo sản phẩm thất bại.', errors: {} };
  }
}

// Server Action để CẬP NHẬT sản phẩm
export async function updateProduct(
  slug: string,
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    const token = await getAuthToken();
    
    const rawData = Object.fromEntries(formData.entries());
    
    console.log('📥 Raw data received:', rawData);
    
    // ✅ FIX: Cho phép partial update (chỉ cập nhật is_in_stock)
    if (Object.keys(rawData).length === 1 && 'is_in_stock' in rawData) {
      console.log('🔄 Updating stock status for:', slug);
      
      // Fetch product hiện tại
      const currentProduct = await fetchApi(`api/admin/products/${slug}/`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (!currentProduct) {
        return { success: false, message: 'Không tìm thấy sản phẩm.' };
      }

      // Merge với data hiện tại
      const updateData = {
        name: currentProduct.name,
        description: currentProduct.description || '',
        price: parseFloat(currentProduct.price),
        stock_quantity: currentProduct.stock_quantity,
        category_id: currentProduct.category?.id || currentProduct.category_id,
        primary_image: currentProduct.primary_image || '',
        is_in_stock: rawData.is_in_stock === 'true',
      };

      console.log('🔄 Merged update data:', updateData);
      
      await fetchApi(`api/admin/products/${slug}/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('✅ Stock status updated successfully');
      
      revalidatePath('/agrihcmAdmin/products');
      return { success: true, message: 'Cập nhật trạng thái thành công!' };
    }
    
    // 🔥 Full update: Normalize để validate
    const dataToValidate = { ...rawData };
    
    // Normalize category_id → category
    if (rawData.category_id && !rawData.category) {
      dataToValidate.category = rawData.category_id;
    }
    
    // 🔥 FIX: Normalize image_url → primary_image (form có thể gửi cả 2 tên)
    if (rawData.image_url && !rawData.primary_image) {
      dataToValidate.primary_image = rawData.image_url;
    }
    
    console.log('🔄 Data to validate:', dataToValidate);
    
    const validatedFields = productSchema.safeParse(dataToValidate);

    if (!validatedFields.success) {
      console.error('❌ Validation failed:', validatedFields.error.flatten().fieldErrors);
      console.error('❌ Raw data received:', rawData);
      return {
        success: false,
        message: 'Dữ liệu không hợp lệ.',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // 🔥 Chuẩn bị data để gửi API
    const apiData = prepareApiData(validatedFields.data);

    await fetchApi(`api/admin/products/${slug}/`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    console.log('✅ Product updated successfully');
    revalidatePath('/agrihcmAdmin/products');
    revalidatePath(`/agrihcmAdmin/products/${slug}`);
    
    return { success: true, message: 'Cập nhật sản phẩm thành công!' };

  } catch (error) {
    // 🔥 FIX: Không bắt NEXT_REDIRECT
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    
    console.error('Update product error:', error);
    
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      if (errorMessage.includes('name')) {
        return { success: false, message: 'Tên sản phẩm không hợp lệ.' };
      } else if (errorMessage.includes('category')) {
        return { success: false, message: 'Danh mục không hợp lệ.' };
      } else if (errorMessage.includes('price')) {
        return { success: false, message: 'Giá sản phẩm không hợp lệ.' };
      }
      
      return { 
        success: false, 
        message: `Lỗi: ${errorMessage}`,
        errors: {} 
      };
    }
    
    return { success: false, message: 'Cập nhật sản phẩm thất bại.', errors: {} };
  }
}

// Server Action để XÓA sản phẩm
export async function deleteProduct(slug: string): Promise<ActionState> {
  try {
    const token = await getAuthToken();
    
    await fetchApi(`api/admin/products/${slug}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    revalidatePath('/agrihcmAdmin/products');
    return { success: true, message: 'Xóa sản phẩm thành công' };

  } catch (error) {
    console.error('Delete product error:', error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Xóa sản phẩm thất bại' };
  }
}
