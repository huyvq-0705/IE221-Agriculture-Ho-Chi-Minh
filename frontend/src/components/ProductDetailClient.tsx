"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Package, TrendingUp } from "lucide-react";
import Link from "next/link";
import ProductCarousel from "@/components/product_carousel";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/AddToCartButton";
import ProductQuestions from "@/components/ProductQuestions"; // Added Q&A

type RelatedProduct = {
  id: number;
  slug: string;
  name: string;
  price: string;
  primary_image?: string | null;
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

export default function ProductDetailClient({
  product,
  categoryProducts,
  featuredProducts,
}: {
  product: Product;
  categoryProducts: RelatedProduct[];
  featuredProducts: RelatedProduct[];
}) {
  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return num > 0 ? `${num.toLocaleString("vi-VN")}₫` : "Liên hệ";
  };

  const mainImage =
    product.primary_image || (product.images && product.images.length > 0 ? product.images[0].image_url : null);

  return (
    <>
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                {mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {product.discount_percent && product.discount_percent > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 text-lg px-3 py-1">-{product.discount_percent}%</Badge>
                )}

                {(!product.is_in_stock || product.stock_quantity === 0) && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <Badge variant="secondary" className="text-lg px-4 py-2">Hết hàng</Badge>
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(0, 4).map((img) => (
                    <div key={img.id} className="aspect-square rounded border hover:border-emerald-700 cursor-pointer overflow-hidden">
                      <img src={img.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {product.category && <Badge variant="outline" className="text-sm">{product.category.name}</Badge>}
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-semibold">{product.average_rating?.toFixed(1) ?? "0"}</span>
                  </div>
                  <span className="text-gray-500">({product.review_count ?? 0} đánh giá)</span>
                </div>

                <Separator orientation="vertical" className="h-4" />

                <div className="flex items-center gap-1 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Đã bán: {product.sold_count ?? 0}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-bold text-emerald-700">{formatPrice(product.price)}</p>
                  {product.discount_percent && product.discount_percent > 0 && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(parseFloat(product.price) / (1 - product.discount_percent / 100))}
                    </span>
                  )}
                </div>

                {product.stock_quantity !== undefined && (
                  <div className="flex items-center gap-2">
                    {product.stock_quantity > 0 ? (
                      <>
                        <Badge variant="outline" className="text-green-700 border-green-700">Còn hàng</Badge>
                        <span className="text-sm text-gray-600">{product.stock_quantity} sản phẩm có sẵn</span>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-red-700 border-red-700">Hết hàng</Badge>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Mô tả sản phẩm</h3>
                <p className="text-gray-700 leading-relaxed">{product.description || "Chưa có mô tả chi tiết."}</p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-4 pt-4">
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    primary_image: product.primary_image ?? null,
                  }}
                  isInStock={product.is_in_stock ?? true}
                  stockQuantity={product.stock_quantity ?? 0}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Product Questions (Replaced Ratings) --- */}
      <ProductQuestions productSlug={product.slug} />

      {/* Related by category */}
      {categoryProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Thêm từ danh mục {product.category?.name}</h2>
            <Button variant="ghost" asChild>
              <Link href={`/products?category=${product.category?.slug}`}>Xem tất cả →</Link>
            </Button>
          </div>
          <ProductCarousel products={categoryProducts} />
        </section>
      )}

      {/* Featured */}
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
    </>
  );
}