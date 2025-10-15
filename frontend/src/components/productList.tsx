"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Star, Package, Sparkles, ChevronLeft, ChevronRight, Filter, X, Search } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
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

interface SearchResponse {
  count: number;
  query: string;
  results: Product[];
}

interface Props {
  initialData: PaginatedResponse;
  categories: Category[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Component cho Featured Products Carousel
function FeaturedCarousel({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || products.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, products.length]);

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
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num > 0 ? `${num.toLocaleString("vi-VN")}₫` : "Liên hệ";
  };

  if (products.length === 0) return null;

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-xl rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}
      
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-xl rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((p) => (
          <Link
            key={`featured-${p.slug}`}
            href={`/products/${p.slug}`}
            className="flex-shrink-0 w-[280px]"
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-emerald-100 hover:border-emerald-300">
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                {p.primary_image ? (
                  <img
                    src={p.primary_image}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                
                <Badge className="absolute top-3 right-3 bg-emerald-600 hover:bg-emerald-700 shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Nổi bật
                </Badge>
              </div>

              <CardContent className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[42px] leading-tight">
                  {p.name}
                </h3>

                <p className="text-xl font-bold text-emerald-700">
                  {formatPrice(p.price)}
                </p>

                {p.average_rating && p.average_rating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{p.average_rating.toFixed(1)}</span>
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

export default function ProductList({ initialData, categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>(initialData?.results || []);
  const [nextPage, setNextPage] = useState<string | null>(initialData?.next || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(initialData?.count || 0);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<string, number>>({});
  
  // Search states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(!!searchParams.get('q'));
  const searchTimeoutRef = useRef<number | null>(null);

  // Featured products - chỉ hiển thị khi không search và không filter
  const featuredProducts = !isSearchMode && !selectedCategorySlug
    ? products.filter((p) => p.is_in_stock && p.stock_quantity && p.stock_quantity > 20).slice(0, 12)
    : [];

  // Load category counts
  useEffect(() => {
    loadCategoryCounts();
  }, [categories]);

  const loadCategoryCounts = async () => {
    const counts: Record<string, number> = {};
    
    try {
      const promises = categories.map(async (cat) => {
        try {
          const url = `${API_BASE}/api/products/?category=${cat.slug}&page_size=1`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            counts[cat.slug] = data.count || 0;
          }
        } catch (err) {
          console.error(`Error loading count for ${cat.slug}:`, err);
          counts[cat.slug] = 0;
        }
      });
      
      await Promise.all(promises);
      setCategoryProductCounts(counts);
    } catch (err) {
      console.error("Error loading category counts:", err);
    }
  };

  // Sync với URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const queryFromUrl = searchParams.get('q');
    
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
      setIsSearchMode(true);
      searchProducts(queryFromUrl);
    } else if (categoryFromUrl) {
      setSelectedCategorySlug(categoryFromUrl);
      setIsSearchMode(false);
      fetchProductsByCategory(categoryFromUrl);
    } else if (selectedCategorySlug || isSearchMode) {
      // Reset về initial data
      setSelectedCategorySlug(null);
      setIsSearchMode(false);
      setSearchQuery("");
      setProducts(initialData?.results || []);
      setNextPage(initialData?.next || null);
      setTotalCount(initialData?.count || 0);
    }
  }, [searchParams]);

  // Search với debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length === 0) {
      if (isSearchMode) {
        handleSearchClear();
      }
      return;
    }

    if (searchQuery.trim().length < 2) {
      return;
    }

    setSearching(true);
    setIsSearchMode(true);

    searchTimeoutRef.current = window.setTimeout(() => {
      // Update URL with search query
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`, { scroll: false });
      searchProducts(searchQuery.trim());
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const searchProducts = async (query: string) => {
    try {
      const url = `${API_BASE}/api/search/products/?q=${encodeURIComponent(query)}`;
      console.log("🔍 Searching:", url);
      
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Không thể tìm kiếm (${res.status})`);
      }

      const data: SearchResponse = await res.json();
      console.log("✅ Search results:", data.count, "products");
      
      setProducts(data.results || []);
      setTotalCount(data.count || 0);
      setNextPage(null); // Search không có pagination
      setError(null);
    } catch (err) {
      console.error("❌ Search error:", err);
      let errorMessage = "Không thể tìm kiếm sản phẩm";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setSearching(false);
    }
  };

  const fetchProductsByCategory = async (categorySlug: string | null) => {
    setLoading(true);
    setError(null);

    try {
      let url = `${API_BASE}/api/products/?page=1`;
      
      if (categorySlug) {
        url = `${API_BASE}/api/products/?category=${categorySlug}&page=1`;
      }

      console.log("🔍 Fetching products from:", url);

      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Không thể tải dữ liệu (${res.status})`);
      }

      const data: PaginatedResponse = await res.json();
      console.log("✅ Fetched data:", { count: data.count, results: data.results.length });

      if (data.results && Array.isArray(data.results)) {
        setProducts(data.results);
        setNextPage(data.next);
        setTotalCount(data.count);
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      let errorMessage = "Không thể tải sản phẩm";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setProducts([]);
      setNextPage(null);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextPage || loading || isSearchMode) return;

    setLoading(true);
    setError(null);

    try {
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
        const existingSlugs = new Set(products.map(p => p.slug));
        const newProducts = data.results.filter(p => !existingSlugs.has(p.slug));
        
        if (newProducts.length > 0) {
          setProducts((prev) => [...prev, ...newProducts]);
        }
        
        setNextPage(data.next);
        setTotalCount(data.count);
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      console.error("Error loading more:", err);
      let errorMessage = "Không thể tải thêm sản phẩm";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return num > 0 ? `${num.toLocaleString("vi-VN")}₫` : "Liên hệ";
  };

  const handleCategoryClick = (categorySlug: string | null) => {
    console.log("🎯 Category clicked:", categorySlug);
    
    setSelectedCategorySlug(categorySlug);
    setShowMobileFilter(false);
    setSearchQuery("");
    setIsSearchMode(false);
    
    // Update URL
    if (categorySlug) {
      router.push(`/products?category=${categorySlug}`, { scroll: false });
    } else {
      router.push('/products', { scroll: false });
    }
    
    fetchProductsByCategory(categorySlug);
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setSearching(false);
    router.push('/products', { scroll: false });
    
    // Reset về initial data hoặc category hiện tại
    if (selectedCategorySlug) {
      fetchProductsByCategory(selectedCategorySlug);
    } else {
      setProducts(initialData?.results || []);
      setNextPage(initialData?.next || null);
      setTotalCount(initialData?.count || 0);
    }
  };

  const getSelectedCategory = () => {
    return categories.find(c => c.slug === selectedCategorySlug);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
        <p className="text-gray-600">
          {isSearchMode ? "Đang tìm kiếm..." : "Đang tải sản phẩm..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-4 space-y-4">
          {/* Search Box */}
          <Card className="shadow-lg border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-xl text-gray-800">Tìm kiếm</h3>
              </div>
              
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                {searchQuery && !searching && (
                  <button
                    onClick={handleSearchClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  </div>
                )}
              </div>

              {isSearchMode && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">
                  ✓ Tìm thấy {totalCount} kết quả
                </p>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="shadow-lg border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-xl text-gray-800">Danh mục</h3>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryClick(null)}
                  disabled={loading || isSearchMode}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium disabled:opacity-50 ${
                    selectedCategorySlug === null && !isSearchMode
                      ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Tất cả sản phẩm
                  <span className={`text-xs ml-2 ${
                    selectedCategorySlug === null && !isSearchMode ? 'opacity-80' : 'opacity-60'
                  }`}>
                    ({initialData.count})
                  </span>
                </button>

                {categories.map((cat) => {
                  const count = categoryProductCounts[cat.slug];
                  const isSelected = selectedCategorySlug === cat.slug;
                  
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryClick(cat.slug)}
                      disabled={loading || isSearchMode}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all disabled:opacity-50 ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className="font-medium text-sm">{cat.name}</div>
                      <div className={`text-xs mt-1 line-clamp-2 ${
                        isSelected ? "text-emerald-50" : "text-gray-500"
                      }`}>
                        {cat.description}
                        {count !== undefined && (
                          <span className="ml-1 font-medium">• {count} SP</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="rounded-full w-16 h-16 shadow-2xl bg-emerald-600 hover:bg-emerald-700"
        >
          <Filter className="w-7 h-7" />
        </Button>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setShowMobileFilter(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 className="font-bold text-xl text-gray-800">Tìm kiếm & Lọc</h3>
              <button 
                onClick={() => setShowMobileFilter(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={handleSearchClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleCategoryClick(null)}
                disabled={loading || isSearchMode}
                className={`w-full text-left px-5 py-4 rounded-xl transition-all font-medium disabled:opacity-50 ${
                  selectedCategorySlug === null && !isSearchMode
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                Tất cả sản phẩm
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategorySlug === cat.slug;
                
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCategoryClick(cat.slug)}
                    disabled={loading || isSearchMode}
                    className={`w-full text-left px-5 py-4 rounded-xl transition-all disabled:opacity-50 ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="font-medium">{cat.name}</div>
                    <div className={`text-xs mt-1 ${
                      isSelected ? "text-emerald-50" : "text-gray-500"
                    }`}>
                      {cat.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* Mobile Search Bar */}
        <div className="lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 h-12 text-base"
            />
            {searchQuery && !searching && (
              <button
                onClick={handleSearchClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              </div>
            )}
          </div>
          {isSearchMode && (
            <p className="text-sm text-emerald-600 mt-2 font-medium">
              ✓ Tìm thấy {totalCount} kết quả
            </p>
          )}
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-8 shadow-lg border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-7 h-7 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Sản phẩm nổi bật
              </h2>
            </div>
            <FeaturedCarousel products={featuredProducts} />
          </section>
        )}

        {/* Search/Filter Badge */}
        {(selectedCategorySlug || isSearchMode) && (
          <div className="flex flex-wrap items-center gap-3 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            {isSearchMode && (
              <Badge className="text-base py-2 px-4 bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Tìm kiếm: "{searchQuery}"
              </Badge>
            )}
            {selectedCategorySlug && !isSearchMode && (
              <Badge className="text-base py-2 px-4 bg-emerald-600">
                {getSelectedCategory()?.name}
              </Badge>
            )}
            <button
              onClick={() => {
                if (isSearchMode) {
                  handleSearchClear();
                } else {
                  handleCategoryClick(null);
                }
              }}
              className="text-sm text-emerald-700 hover:text-emerald-900 font-medium underline underline-offset-2"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Thông tin tổng quan */}
        <div className="flex justify-between items-center px-1">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-bold text-gray-900">{products.length}</span>
            {totalCount > 0 && <span className="text-gray-400"> / {totalCount} sản phẩm</span>}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="shadow-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {products.length === 0 && !loading && !searching && (
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              {isSearchMode 
                ? `Không tìm thấy sản phẩm nào với từ khóa "${searchQuery}"`
                : selectedCategorySlug
                ? `Chưa có sản phẩm trong danh mục "${getSelectedCategory()?.name}"`
                : "Chưa có sản phẩm nào"}
            </AlertDescription>
          </Alert>
        )}

        {/* Product Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {products.map((p) => (
              <Card
                key={p.slug}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-200"
              >
                <Link href={`/products/${p.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    {(!p.is_in_stock || p.stock_quantity === 0) && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                        <Badge variant="secondary" className="bg-gray-800 text-white text-sm py-2 px-4">
                          Hết hàng
                        </Badge>
                      </div>
                    )}

                    {p.primary_image ? (
                      <img
                        src={p.primary_image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-2">
                    {p.category && (
                      <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                        {p.category.name}
                      </Badge>
                    )}

                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[42px] leading-tight group-hover:text-emerald-700 transition-colors">
                      {p.name}
                    </h3>

                    <p className="text-xl font-bold text-emerald-700">
                      {formatPrice(p.price)}
                    </p>

                    <div className="flex items-center gap-1 text-sm">
                      {p.average_rating && p.average_rating > 0 ? (
                        <>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-700">
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

                    {typeof p.stock_quantity === "number" && p.stock_quantity > 0 && (
                      <p className="text-xs text-gray-500">
                        Còn {p.stock_quantity} sản phẩm
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-md"
                      disabled={!p.is_in_stock || p.stock_quantity === 0}
                      type="button"
                    >
                      {!p.is_in_stock || p.stock_quantity === 0 ? "Hết hàng" : "Mua ngay"}
                    </Button>
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {nextPage && products.length > 0 && !isSearchMode && (
          <div className="flex flex-col items-center gap-4 pt-8 pb-12">
            <Button
              onClick={loadMore}
              disabled={loading}
              size="lg"
              className="min-w-[260px] bg-emerald-600 hover:bg-emerald-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang tải...
                </>
              ) : (
                "Xem thêm sản phẩm"
              )}
            </Button>
            <p className="text-sm text-gray-500">
              Còn {totalCount - products.length} sản phẩm
            </p>
          </div>
        )}

        {/* End of List */}
        {!nextPage && products.length > 0 && !isSearchMode && (
          <div className="text-center py-10 border-t-2 border-gray-100">
            <Badge variant="secondary" className="text-base py-3 px-6 bg-emerald-50 text-emerald-700 border-2 border-emerald-200">
              ✓ Đã hiển thị tất cả {products.length} sản phẩm
            </Badge>
          </div>
        )}

        {/* Search Mode - No Pagination */}
        {isSearchMode && products.length > 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">
              Kết quả tìm kiếm không hỗ trợ phân trang
            </p>
          </div>
        )}

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}
