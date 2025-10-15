import Link from 'next/link';
import { Package, FolderTree, LayoutDashboard } from 'lucide-react';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is logged in
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get('accessToken')?.value;

  // Nếu chưa login và không phải trang login → middleware sẽ xử lý
  // Chỉ render layout khi đã login
  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/agrihcmAdmin" className="text-xl font-bold text-emerald-700">
                🌱 AgriHCM Admin
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/agrihcmAdmin"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/agrihcmAdmin/products"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Sản phẩm
                </Link>
                <Link
                  href="/agrihcmAdmin/categories"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  <FolderTree className="w-4 h-4" />
                  Danh mục
                </Link>
              </nav>
            </div>

            <AdminLogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </div>
  );
}
