export const dynamic = "force-dynamic";

import ProductDetailClient from "@/components/ProductDetailClient";
import ProductCarousel from "@/components/product_carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type RelatedProduct = {
  id: number;
  slug: string;
  name: string;
  price: string;
  primary_image?: string;
  is_in_stock?: boolean;
  stock_quantity?: number;
};

type Product = {
  id: number;
  slug: string;
  name: string;
  price: string;
  description?: string;
  primary_image?: string | null;
  images?: { id: number; image_url: string }[];
  discount_percent?: number;
  average_rating?: number;
  review_count?: number;
  sold_count?: number;
  stock_quantity?: number;
  is_in_stock?: boolean;
  category?: { id: number; name: string; slug: string } | null;
  related_products?: RelatedProduct[];
};

async function getProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${slug}/`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch product ${slug}: ${res.status}`);
  return res.json();
}

async function getProductsByCategory(categoryId: number): Promise<RelatedProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products/?category=${categoryId}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

async function getFeaturedProducts(): Promise<RelatedProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products/?page=1`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results?.slice(0, 8) || [];
  } catch {
    return [];
  }
}

type Props = {
  params: { slug: string };
};

export default async function Page({ params }: Props) {
  const { slug } = params;
  try {
    const product = await getProduct(slug);
    const [categoryProducts, featuredProducts] = await Promise.all([
      product.category ? getProductsByCategory(product.category.id) : Promise.resolve([]),
      getFeaturedProducts(),
    ]);

    return (
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-emerald-700">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-emerald-700">Sản phẩm</Link>
          {product.category && (
            <>
              <span>/</span>
              <span className="text-gray-900">{product.category.name}</span>
            </>
          )}
        </nav>

        {/* Client interactive part */}
        <ProductDetailClient
          product={product}
          categoryProducts={categoryProducts}
          featuredProducts={featuredProducts}
        />
      </main>
    );
  } catch (err: any) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center space-y-4">
            <Package className="w-12 h-12 text-red-600 mx-auto" />
            <h2 className="text-xl font-semibold text-red-800">Không tìm thấy sản phẩm</h2>
            <p className="text-red-600">{err?.message ?? String(err)}</p>
            <Link href="/products" className="inline-block mt-2 text-emerald-700 underline">← Quay lại danh sách sản phẩm</Link>
          </CardContent>
        </Card>
      </div>
    );
  }
}