import AdminAuthCheck from '@/components/admin/AdminAuthCheck';
import { Package, FolderTree } from 'lucide-react';
import { fetchAdminApi } from '@/lib/api';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getDashboardStats() {
  try {
    const [products, categories] = await Promise.all([
      fetchAdminApi('api/products/?page_size=1').catch(() => ({ count: 0 })),
      fetchAdminApi('api/categories/').catch(() => []),
    ]);

    return {
      totalProducts: products.count || 0,
      totalCategories: Array.isArray(categories) ? categories.length : 0,
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return {
      totalProducts: 0,
      totalCategories: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <AdminAuthCheck>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Chào mừng đến với trang quản trị AgriHCM
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 hover:border-emerald-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tổng sản phẩm
              </CardTitle>
              <Package className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalProducts}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Danh mục
              </CardTitle>
              <FolderTree className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalCategories}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/agrihcmAdmin/products/create"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-transparent hover:border-emerald-200"
            >
              <Package className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Thêm sản phẩm</h3>
              <p className="text-sm text-gray-600">
                Tạo sản phẩm mới trong hệ thống
              </p>
            </Link>

            <Link
              href="/agrihcmAdmin/products"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-200"
            >
              <FolderTree className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Quản lý sản phẩm</h3>
              <p className="text-sm text-gray-600">
                Xem và chỉnh sửa sản phẩm
              </p>
            </Link>
          </div>
        </div>
      </div>
    </AdminAuthCheck>
  );
}
