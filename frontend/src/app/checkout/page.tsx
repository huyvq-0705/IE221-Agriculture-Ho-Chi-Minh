"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { X, Tag, Loader2 } from "lucide-react"; // Added icons

type FormState = {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  payment_method: "COD";
};

type CouponData = {
  code: string;
  discount_percent: number;
  max_discount_amount: number | null;
  min_purchase_amount: number;
  is_active: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  
  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [form, setForm] = useState<FormState>({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    payment_method: "COD",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---- Auth & Redirect Logic (Same as before) ----
  useEffect(() => {
    if (!user) {
      toast?.({ title: "Yêu cầu đăng nhập", description: "Bạn cần đăng nhập trước khi đặt hàng." });
      router.push("/auth/login");
    }
  }, [user, router, toast]);

  useEffect(() => {
    if (user) {
      const fullName = (user as any)?.full_name || (user as any)?.name || (user as any)?.username || "";
      setForm((f) => ({
        ...f,
        customer_name: fullName || f.customer_name,
        customer_email: (user as any)?.email || f.customer_email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if ((!cart || !cart.items?.length) && !isOrdering) {
      toast?.({
        title: "Giỏ hàng rỗng",
        description: "Không có sản phẩm trong giỏ, hãy thêm sản phẩm trước khi đặt hàng.",
      });
      router.push("/products");
    }
  }, [cart, router, toast, isOrdering]);

  // ---- Calculations ----
  const itemCount = cart?.items?.reduce((s, it) => s + it.quantity, 0) ?? 0;
  const subtotal = cart?.total_price ?? 0;

  // Calculate Discount Logic
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    // Check Min Purchase
    if (subtotal < appliedCoupon.min_purchase_amount) return 0;

    // Calculate Percent Discount
    let discount = (subtotal * appliedCoupon.discount_percent) / 100;

    // Cap at Max Discount (if exists)
    if (appliedCoupon.max_discount_amount !== null && appliedCoupon.max_discount_amount > 0) {
      discount = Math.min(discount, appliedCoupon.max_discount_amount);
    }

    return Math.floor(discount); // Round down
  }, [appliedCoupon, subtotal]);

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // ---- Handlers ----
  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((s) => ({ ...s, [key]: e.target.value }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.customer_name.trim()) e.customer_name = "Yêu cầu tên người nhận.";
    if (!form.customer_phone.trim()) e.customer_phone = "Yêu cầu số điện thoại.";
    if (!form.customer_address.trim()) e.customer_address = "Yêu cầu địa chỉ giao hàng.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---- Coupon Logic ----
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setAppliedCoupon(null); // Reset previous

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/coupons/${couponCode.trim()}/`);

      if (!res.ok) {
        if (res.status === 404) throw new Error("Mã giảm giá không tồn tại");
        throw new Error("Lỗi kiểm tra mã giảm giá");
      }

      const data: CouponData = await res.json();

      if (!data.is_active) {
        throw new Error("Mã giảm giá đã hết hạn hoặc bị khóa");
      }

      if (subtotal < data.min_purchase_amount) {
        throw new Error(`Đơn hàng tối thiểu phải từ ${data.min_purchase_amount.toLocaleString("vi-VN")}₫`);
      }

      setAppliedCoupon(data);
      toast?.({ title: "Áp dụng mã thành công!", className: "text-emerald-600" });
    } catch (err: any) {
      toast?.({
        variant: "destructive",
        title: "Không thể áp dụng mã",
        description: err.message,
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // ---- Submit Order ----
  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) {
      toast?.({ title: "Form chưa hoàn thành", description: "Vui lòng kiểm tra các trường bắt buộc." });
      return;
    }

    if (!cart || !cart.items?.length) return;

    setLoading(true);
    setIsOrdering(true);

    const payload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email || "",
      customer_address: form.customer_address,
      payment_method: form.payment_method,
      coupon_code: appliedCoupon ? appliedCoupon.code : null, // Send coupon code to backend
    };

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/orders/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let body: any = {};
        try { body = await res.json(); } catch { body = { detail: await res.text() }; }
        throw new Error(body?.detail || body?.error || "Lỗi server");
      }

      toast?.({ title: "Đặt hàng thành công" });
      await refreshCart();
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("close-cart-sheet"));
      router.push(`/about/confirmed`);

    } catch (err: any) {
      console.error("Order create failed", err);
      toast?.({ title: "Không thể đặt hàng", description: err?.message || "Có lỗi xảy ra.", variant: "destructive" });
      setIsOrdering(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Xác nhận đơn hàng</h1>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{itemCount}</span> sản phẩm •{" "}
          <span className="font-semibold text-emerald-700">
             {finalTotal?.toLocaleString?.("vi-VN") ?? 0}₫
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Customer Info */}
        <Card className="col-span-1 md:col-span-1 h-fit">
          <CardContent>
            <div className="space-y-4 pt-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <Input value={form.customer_name} onChange={handleChange("customer_name")} />
                {errors.customer_name && <p className="text-sm text-red-600 mt-1">{errors.customer_name}</p>}
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <Input value={form.customer_phone} onChange={handleChange("customer_phone")} />
                {errors.customer_phone && <p className="text-sm text-red-600 mt-1">{errors.customer_phone}</p>}
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email (tùy chọn)</label>
                <Input value={form.customer_email} onChange={handleChange("customer_email")} />
              </div>
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <textarea
                  value={form.customer_address}
                  onChange={handleChange("customer_address")}
                  className="w-full rounded-md border px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  rows={4}
                />
                {errors.customer_address && <p className="text-sm text-red-600 mt-1">{errors.customer_address}</p>}
              </div>
              {/* Payment */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, payment_method: "COD" }))}
                    className={`px-3 py-2 rounded-md border text-sm font-medium ${
                      form.payment_method === "COD" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700"
                    }`}
                  >
                    COD (Thanh toán khi nhận hàng)
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Order Summary */}
        <Card className="col-span-1 md:col-span-1 h-fit">
          <CardContent>
            <div className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tóm tắt đơn hàng</h3>
                <Badge className="text-sm" variant="secondary">{itemCount} sản phẩm</Badge>
              </div>

              {/* Product List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {cart.items.map((it: any) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 line-clamp-1">{it.name}</div>
                      <div className="text-xs text-gray-500">x{it.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold">
                      {(parseFloat(it.price || "0") * it.quantity).toLocaleString?.("vi-VN") ?? ""}₫
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Coupon Input Section */}
              <div className="flex gap-2">
                 <Input 
                   placeholder="Mã giảm giá" 
                   value={couponCode} 
                   onChange={(e) => setCouponCode(e.target.value)}
                   disabled={!!appliedCoupon}
                   className="uppercase"
                 />
                 {appliedCoupon ? (
                   <Button type="button" variant="destructive" onClick={handleRemoveCoupon} size="icon">
                     <X size={18} />
                   </Button>
                 ) : (
                   <Button 
                     type="button" 
                     onClick={handleApplyCoupon} 
                     disabled={couponLoading || !couponCode}
                     className="bg-gray-800 hover:bg-gray-700"
                   >
                     {couponLoading ? <Loader2 className="animate-spin" size={18}/> : "Áp dụng"}
                   </Button>
                 )}
              </div>

              {/* Active Coupon Badge */}
              {appliedCoupon && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-md text-sm">
                  <Tag size={16} />
                  <span>
                    Mã <b>{appliedCoupon.code}</b>: Giảm {appliedCoupon.discount_percent}% 
                    {appliedCoupon.max_discount_amount ? ` (tối đa ${appliedCoupon.max_discount_amount.toLocaleString("vi-VN")}₫)` : ""}
                  </span>
                </div>
              )}
              
               {/* Min Purchase Warning (if subtotal changed after applying) */}
               {appliedCoupon && subtotal < appliedCoupon.min_purchase_amount && (
                  <div className="text-red-500 text-xs mt-1">
                    Đơn hàng chưa đạt tối thiểu {appliedCoupon.min_purchase_amount.toLocaleString("vi-VN")}₫ để dùng mã này.
                  </div>
              )}

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>Tạm tính</div>
                    <div>{subtotal?.toLocaleString?.("vi-VN") ?? 0}₫</div>
                </div>

                <div className="flex items-center justify-between text-sm text-emerald-600">
                    <div>Giảm giá</div>
                    <div>-{discountAmount.toLocaleString("vi-VN")}₫</div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">Tổng cộng</div>
                    <div className="text-xl font-bold text-emerald-700">
                    {finalTotal.toLocaleString("vi-VN")}₫
                    </div>
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-md"
                >
                  {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}