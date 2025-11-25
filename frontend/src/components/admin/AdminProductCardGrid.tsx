'use client';

import { useState, useTransition } from 'react';
import { type Product } from '@/app/agrihcmAdmin/products/actions';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface AdminProductCardGridProps {
  products: Product[];
  onDelete: (slug: string, name: string) => void;
  onToggleStock: (slug: string, currentStatus: boolean) => Promise<void>;
}

export default function AdminProductCardGrid({ 
  products = [], 
  onDelete,
  onToggleStock 
}: AdminProductCardGridProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleStockToggle = (slug: string, currentStatus: boolean) => {
    setLoadingStates(prev => ({ ...prev, [slug]: true }));
    
    startTransition(async () => {
      try {
        await onToggleStock(slug, currentStatus);
        toast({
          title: "Thành công",
          description: `Đã ${currentStatus ? 'ngừng' : 'mở'} bán sản phẩm`,
        });
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật trạng thái",
          variant: "destructive"
        });
      } finally {
        setLoadingStates(prev => ({ ...prev, [slug]: false }));
      }
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(parseFloat(price));
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Package className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">Chưa có sản phẩm nào</p>
        <p className="text-sm">Hãy thêm sản phẩm đầu tiên của bạn</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-0">
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              {product.primary_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.primary_image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-16 h-16 text-gray-300" />
                </div>
              )}
              
              {/* Stock Badge */}
              <div className="absolute top-2 right-2">
                <Badge variant={product.is_in_stock ? "default" : "secondary"}>
                  {product.is_in_stock ? "In stock" : "Out of stock"}
                </Badge>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-lg line-clamp-2 min-h-[3.5rem]">
                {product.name}
              </h3>
              
              <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                {product.description}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {product.category.name}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Kho: {product.stock_quantity}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex flex-col gap-3">
            {/* Stock Toggle */}
            <div className="flex items-center justify-between w-full p-2 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">
                {product.is_in_stock ? "Đang bán" : "Ngừng bán"}
              </span>
              <Switch
                checked={product.is_in_stock}
                onCheckedChange={() => handleStockToggle(product.slug, product.is_in_stock)}
                disabled={loadingStates[product.slug] || isPending}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
              <Link href={`/agrihcmAdmin/products/${product.slug}`} className="flex-1">
                <Button variant="outline" className="w-full" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Sửa
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(product.slug, product.name)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
