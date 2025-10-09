'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Product {
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

interface ProductCarouselProps {
  products: Product[];
  autoScroll?: boolean;
  scrollInterval?: number;
}

export default function ProductCarousel({
  products,
  autoScroll = true,
  scrollInterval = 3000,
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(6);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  // Cập nhật số items hiển thị dựa trên kích thước màn hình
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(2);
      } else if (window.innerWidth < 768) {
        setItemsPerView(3);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(4);
      } else {
        setItemsPerView(6);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (!autoScroll || products.length <= itemsPerView) return;

    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = products.length - itemsPerView;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, scrollInterval);
    };

    startAutoScroll();

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [autoScroll, scrollInterval, products.length, itemsPerView]);

  const handlePrev = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    const maxIndex = Math.max(0, products.length - itemsPerView);
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num > 0 ? `${num.toLocaleString('vi-VN')}₫` : 'Liên hệ';
  };

  const maxIndex = Math.max(0, products.length - itemsPerView);
  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex >= maxIndex;

  return (
    <div className="relative group">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="overflow-hidden rounded-lg"
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {products.map((item) => (
            <div
              key={item.slug}
              className="flex-shrink-0"
              style={{
                width: `${100 / itemsPerView}%`,
                padding: '0.5rem',
              }}
            >
              <Card className="group/card hover:shadow-lg transition-shadow h-full">
                <Link href={`/products/${item.slug}`}>
                  <CardContent className="p-3 space-y-2 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-square rounded overflow-hidden bg-gray-100">
                      {item.primary_image || (item.images && item.images.length > 0) ? (
                        <img
                          src={
                            item.primary_image ||
                            item.images![0].image_url
                          }
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}

                      {/* Discount Badge */}
                      {item.discount_percent && item.discount_percent > 0 && (
                        <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-xs">
                          -{item.discount_percent}%
                        </Badge>
                      )}

                      {/* Stock Status */}
                      {(!item.is_in_stock || item.stock_quantity === 0) && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <Badge variant="secondary" className="text-xs">
                            Hết hàng
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2 flex-grow flex flex-col justify-between">
                      <h3 className="text-sm font-medium line-clamp-2 min-h-[40px] group-hover/card:text-emerald-700 transition-colors">
                        {item.name}
                      </h3>

                      <div className="space-y-2">
                        <p className="text-emerald-700 font-bold">
                          {formatPrice(item.price)}
                        </p>

                        {item.is_in_stock && item.stock_quantity! > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs text-green-700 border-green-700"
                          >
                            Còn hàng
                          </Badge>
                        )}

                        <Button
                          size="sm"
                          className="w-full bg-emerald-700 hover:bg-green-700"
                          disabled={!item.is_in_stock || item.stock_quantity === 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Thêm vào giỏ
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {products.length > itemsPerView && (
        <>
          {/* Left Button */}
          <button
            onClick={handlePrev}
            disabled={isAtStart}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          {/* Right Button */}
          <button
            onClick={handleNext}
            disabled={isAtEnd}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next products"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {products.length > itemsPerView && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-emerald-700' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
