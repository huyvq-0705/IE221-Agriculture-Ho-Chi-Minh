'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus, Trash2, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

interface Product {
  id: number;
  slug: string;
  name: string;
  price: string;
  primary_image?: string;
  is_in_stock: boolean;
  stock_quantity: number;
}

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('api/cart/', { method: 'GET' });
      setCart(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải giỏ hàng');
      if (err.message.includes('401')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(productId);
    try {
      const data = await fetchApi('api/cart/update/', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity: newQuantity }),
      });
      setCart(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật số lượng');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: number) => {
    setUpdating(productId);
    try {
      const data = await fetchApi('api/cart/remove/', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      });
      setCart(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Không thể xóa sản phẩm');
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) return;

    try {
      await fetchApi('api/cart/clear/', { method: 'POST' });
      await fetchCart();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Không thể xóa giỏ hàng');
    }
  };

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return `${num.toLocaleString('vi-VN')}₫`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
            {!isEmpty && (
              <p className="text-gray-600 mt-2">
                {cart.total_items} sản phẩm
              </p>
            )}
          </div>
          <Link href="/products">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isEmpty ? (
          <Card className="text-center py-16">
            <CardContent>
              <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Giỏ hàng trống
              </h2>
              <p className="text-gray-600 mb-6">
                Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
              </p>
              <Link href="/products">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Khám phá sản phẩm
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="flex-shrink-0"
                      >
                        {item.product.primary_image ? (
                          <img
                            src={item.product.primary_image}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-emerald-700 line-clamp-2">
                            {item.product.name}
                          </h3>
                        </Link>

                        <p className="text-emerald-700 font-bold mt-2">
                          {formatPrice(item.product.price)}
                        </p>

                        {!item.product.is_in_stock && (
                          <p className="text-red-600 text-sm mt-1">
                            Hết hàng
                          </p>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              disabled={
                                updating === item.product.id || item.quantity <= 1
                              }
                              className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span className="px-4 font-medium">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              disabled={
                                updating === item.product.id ||
                                item.quantity >= item.product.stock_quantity
                              }
                              className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            disabled={updating === item.product.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            {updating === item.product.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Clear Cart */}
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa toàn bộ giỏ hàng
              </Button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">Tổng quan đơn hàng</h2>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-medium">
                        {formatPrice(cart.total_price)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="font-medium text-emerald-600">
                        Miễn phí
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Tổng cộng</span>
                      <span className="text-2xl font-bold text-emerald-700">
                        {formatPrice(cart.total_price)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
                    onClick={() => router.push('/checkout')}
                  >
                    Thanh toán
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Miễn phí vận chuyển cho đơn hàng trên 500.000₫
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
