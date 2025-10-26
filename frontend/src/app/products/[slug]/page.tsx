export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, ShoppingCart, Package, TrendingUp, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import ProductCarousel from "@/components/product_carousel";
import { useCart } from '@/contexts/CartContext';
import { AddToCartButton } from "@/components/AddToCartButton"
// import { BuyNowButton } from "@/components/BuyNowButton" // Tạo component này nếu cần
import ProductRating from "@/components/ProductRating";

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";

interface Props {
  params: Promise<{ slug: string }>;
}

interface RelatedProduct {
  id: number;
  slug: string;
  name: string;
  price: string;
  primary_image?: string;
  images?: { id: number; image_url: string }[];
  discount_percent?: number;
  is_in_stock?: boolean;
  stock_quantity?: number;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  price: string;
  description?: string;
  primary_image?: string;
  images?: { id: number; image_url: string }[];
  discount_percent?: number;
  average_rating?: number;
  review_count?: number;
  sold_count?: number;
  stock_quantity?: number;
  is_in_stock?: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  related_products?: RelatedProduct[];
}

async function getProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${slug}/`, {
    cache: "no-store",
  });
  if (!res.ok)
    throw new Error(`Failed to fetch product ${slug}: ${res.status}`);
  return res.json();
}

async function getProductsByCategory(categoryId: number): Promise<RelatedProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products/?category=${categoryId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

async function getFeaturedProducts(): Promise<RelatedProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/api/products/?page=1`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results?.slice(0, 8) || [];
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: Props) {
  try {
    const { slug } = await params;
    const product = await getProduct(slug);
    
    const [categoryProducts, featuredProducts] = await Promise.all([
      product.category ? getProductsByCategory(product.category.id) : Promise.resolve([]),
      getFeaturedProducts(),
    ]);

    const formatPrice = (price: string | number) => {
      const num = typeof price === "string" ? parseFloat(price) : price;
      return num > 0 ? `${num.toLocaleString("vi-VN")}₫` : "Liên hệ";
    };
    
    const mainImage =
      product.primary_image ||
      (product.images && product.images.length > 0
        ? product.images[0].image_url
        : null);

    return (
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-emerald-700">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-emerald-700">
            Sản phẩm
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <span className="text-gray-900">{product.category.name}</span>
            </>
          )}
        </nav>

        {/* Chi tiết sản phẩm */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Ảnh sản phẩm */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.discount_percent && product.discount_percent > 0 && (
                    <Badge className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 text-lg px-3 py-1">
                      -{product.discount_percent}%
                    </Badge>
                  )}

                  {/* Stock Status */}
                  {(!product.is_in_stock || product.stock_quantity === 0) && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        Hết hàng
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(0, 4).map((img) => (
                      <div
                        key={img.id}
                        className="aspect-square rounded border hover:border-emerald-700 cursor-pointer overflow-hidden"
                      >
                        <img
                          src={img.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Thông tin sản phẩm */}
              <div className="space-y-6">
                {/* Category Badge */}
                {product.category && (
                  <Badge variant="outline" className="text-sm">
                    {product.category.name}
                  </Badge>
                )}

                {/* Product Name */}
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Sold */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-semibold">
                        {product.average_rating?.toFixed(1) ?? "0"}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      ({product.review_count ?? 0} đánh giá)
                    </span>
                  </div>

                  <Separator orientation="vertical" className="h-4" />

                  <div className="flex items-center gap-1 text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Đã bán: {product.sold_count ?? 0}</span>
                  </div>
                </div>

                <Separator />

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <p className="text-4xl font-bold text-emerald-700">
                      {formatPrice(product.price)}
                    </p>
                    {product.discount_percent && product.discount_percent > 0 && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(
                          parseFloat(product.price) /
                            (1 - product.discount_percent / 100)
                        )}
                      </span>
                    )}
                  </div>

                  {/* Stock Indicator */}
                  {product.stock_quantity !== undefined && (
                    <div className="flex items-center gap-2">
                      {product.stock_quantity > 0 ? (
                        <>
                          <Badge variant="outline" className="text-green-700 border-green-700">
                            Còn hàng
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {product.stock_quantity} sản phẩm có sẵn
                          </span>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-red-700 border-red-700">
                          Hết hàng
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Mô tả sản phẩm</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || "Chưa có mô tả chi tiết."}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <AddToCartButton 
                    productId={product.id}
                    isInStock={product.is_in_stock || false}
                    stockQuantity={product.stock_quantity || 0}
                  />

                  {/* <BuyNowButton 
                    product={product}
                    disabled={!product.is_in_stock || product.stock_quantity === 0}
                  /> */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Đánh giá sản phẩm */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
                <div className="flex items-center gap-1 text-gray-500">
                </div>
              </div>
              
              <Separator />
              
              <ProductRating productId={product.id} />
              
            </div>
          </CardContent>
        </Card>

        {/* Sản phẩm cùng danh mục */}
        {categoryProducts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Thêm từ danh mục {product.category?.name}
              </h2>
              <Button variant="ghost" asChild>
                <Link href={`/products?category=${product.category?.slug}`}>
                  Xem tất cả →
                </Link>
              </Button>
            </div>

            <ProductCarousel products={categoryProducts} />
          </section>
        )}

        

        {/* Sản phẩm nổi bật */}
        {featuredProducts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
              <Button variant="ghost" asChild>
                <Link href="/products">Xem tất cả →</Link>
              </Button>
            </div>

            <ProductCarousel products={featuredProducts} />
          </section>
        )}
      </main>
    );
  } catch (err: any) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center space-y-4">
            <Package className="w-12 h-12 text-red-600 mx-auto" />
            <h2 className="text-xl font-semibold text-red-800">
              Không tìm thấy sản phẩm
            </h2>
            <p className="text-red-600">{err.message}</p>
            <Button asChild variant="outline">
              <Link href="/products">← Quay lại danh sách sản phẩm</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
