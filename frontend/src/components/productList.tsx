"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Package, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  price: string;
  description?: string;
  primary_image?: string;
  is_in_stock?: boolean;
  stock_quantity?: number;
  average_rating?: number | null;
  review_count?: number;
  category?: Category;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

interface Props {
  initialData: PaginatedResponse;
}

// Component cho Featured Products Carousel
function FeaturedCarousel({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Auto scroll
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // Nếu đã scroll đến cuối, quay về đầu
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 3000); // Auto scroll mỗi 3 giây

    return () => clearInterval(interval);
  }, []);

  // Check scroll position
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    ref?.addEventListener("scroll", checkScroll);
    return () => ref?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num > 0 ? `${num.toLocaleString("vi-VN")}₫` : "Liên hệ";
  };

  return (
    <div className="relative group">
      {/* Scroll Buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="flex-shrink-0 w-64"
          >
            <Card className="h-full hover:shadow-lg transition-shadow border-emerald-200">
              <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-t-lg">
                {p.primary_image ? (
                  <img
                    src={p.primary_image}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                
                {/* Featured Badge */}
                <Badge className="absolute top-2 right-2 bg-emerald-600">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Nổi bật
                </Badge>
              </div>

              <CardContent className="p-3 space-y-1">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
                  {p.name}
                </h3>

                <p className="text-lg font-bold text-emerald-700">
                  {formatPrice(p.price)}
                </p>

                {p.average_rating && p.average_rating > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{p.average_rating.toFixed(1)}</span>
                    <span className="text-gray-500">({p.review_count || 0})</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ProductList({ initialData }: Props) {
  const [products, setProducts] = useState<Product[]>(
    initialData?.results || []
  );
  const [nextPage, setNextPage] = useState<string | null>(
    initialData?.next || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount] = useState<number>(initialData?.count || 0);

  // Lọc sản phẩm nổi bật (có hàng và stock > 20)
  const featuredProducts = products.filter(
    (p) => p.is_in_stock && p.stock_quantity && p.stock_quantity > 20
  ).slice(0, 10); // Lấy tối đa 10 sản phẩm

  const loadMore = async () => {
    if (!nextPage || loading) return;

    setLoading(true);
    setError(null);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      let fetchUrl = nextPage;
      
      if (nextPage.startsWith('http://') || nextPage.startsWith('https://')) {
        const url = new URL(nextPage);
        fetchUrl = `${API_BASE}${url.pathname}${url.search}`;
      } else if (nextPage.startsWith('/')) {
        fetchUrl = `${API_BASE}${nextPage}`;
      }

      const res = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Không thể tải dữ liệu (${res.status})`);
      }

      const data: PaginatedResponse = await res.json();

      if (data.results && Array.isArray(data.results)) {
        setProducts((prev) => [...prev, ...data.results]);
        setNextPage(data.next);
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (err: any) {
      console.error("Error loading more:", err);
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Không thể kết nối tới server. Vui lòng kiểm tra:\n• Server Django có đang chạy?\n• CORS đã được cấu hình?");
      } else {
        setError(err.message || "Không thể tải thêm sản phẩm");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num > 0 ? `${num.toLocaleString("vi-VN")}₫` : "Liên hệ";
  };

  if (!products || products.length === 0) {
    return (
      <Alert>
        <Package className="h-4 w-4" />
        <AlertDescription>
          Chưa có sản phẩm nào trong danh mục này
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Sản phẩm nổi bật
            </h2>
          </div>
          <FeaturedCarousel products={featuredProducts} />
        </section>
      )}

      {/* Thông tin tổng quan */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold">{products.length}</span> /{" "}
          <span className="font-semibold">{totalCount}</span> sản phẩm
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <Card
            key={p.id}
            className="group overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link href={`/products/${p.slug}`} className="block">
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {/* Out of Stock Overlay */}
                {(!p.is_in_stock || p.stock_quantity === 0) && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <Badge
                      variant="secondary"
                      className="bg-gray-800 text-white"
                    >
                      Hết hàng
                    </Badge>
                  </div>
                )}

                {/* Product Image */}
                {p.primary_image ? (
                  <img
                    src={p.primary_image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-2">
                {/* Category Badge */}
                {p.category && (
                  <Badge variant="outline" className="text-xs">
                    {p.category.name}
                  </Badge>
                )}

                {/* Product Name */}
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-emerald-700 transition-colors">
                  {p.name}
                </h3>

                {/* Price */}
                <p className="text-lg font-bold text-emerald-700">
                  {formatPrice(p.price)}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 text-sm">
                  {p.average_rating && p.average_rating > 0 ? (
                    <>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {p.average_rating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({p.review_count || 0})
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">
                      Chưa có đánh giá
                    </span>
                  )}
                </div>

                {/* Stock Info */}
                {typeof p.stock_quantity === "number" &&
                  p.stock_quantity > 0 && (
                    <p className="text-xs text-gray-500">
                      Còn {p.stock_quantity} sản phẩm
                    </p>
                  )}
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800"
                  disabled={!p.is_in_stock || p.stock_quantity === 0}
                  type="button"
                >
                  {!p.is_in_stock || p.stock_quantity === 0
                    ? "Hết hàng"
                    : "Mua ngay"}
                </Button>
              </CardFooter>
            </Link>
          </Card>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Load More Section */}
      {nextPage && (
        <div className="flex flex-col items-center gap-4 pt-6 pb-8">
          <Button
            onClick={loadMore}
            disabled={loading}
            size="lg"
            className="min-w-[240px] bg-emerald-700 hover:bg-emerald-800"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              "Xem thêm sản phẩm"
            )}
          </Button>
          <p className="text-xs text-gray-500">
            Còn {totalCount - products.length} sản phẩm
          </p>
        </div>
      )}

      {/* End of list */}
      {!nextPage && products.length > 0 && (
        <div className="text-center py-8 border-t">
          <Badge variant="secondary" className="text-sm py-2 px-4">
            ✓ Đã hiển thị tất cả {products.length} sản phẩm
          </Badge>
        </div>
      )}

      {/* CSS để ẩn scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
