// src/app/checkout/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type FormState = {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  payment_method: "COD";
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false); // <-- guard flag
  const [form, setForm] = useState<FormState>({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    payment_method: "COD",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ---- Redirect if user not logged in ----
  useEffect(() => {
    if (!user) {
      toast?.({ title: "Yêu cầu đăng nhập", description: "Bạn cần đăng nhập trước khi đặt hàng." });
      router.push("/auth/login");
    }
  }, [user, router, toast]);

  // ---- Auto-fill user info ----
  useEffect(() => {
    if (user) {
      const fullName =
        (user as any)?.full_name || (user as any)?.name || (user as any)?.username || "";
      setForm((f) => ({
        ...f,
        customer_name: fullName || f.customer_name,
        customer_email: (user as any)?.email || f.customer_email,
      }));
    }
  }, [user]);

  // ---- Redirect if cart empty (guarded by isOrdering) ----
  useEffect(() => {
    // Only redirect to products when we are NOT currently placing an order.
    if ((!cart || !cart.items?.length) && !isOrdering) {
      toast?.({
        title: "Giỏ hàng rỗng",
        description: "Không có sản phẩm trong giỏ, hãy thêm sản phẩm trước khi đặt hàng.",
      });
      router.push("/products");
    }
  }, [cart, router, toast, isOrdering]);

  const handleChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) {
      toast?.({
        title: "Form chưa hoàn thành",
        description: "Vui lòng kiểm tra các trường bắt buộc.",
      });
      return;
    }

    if (!cart || !cart.items?.length) {
      toast?.({ title: "Giỏ hàng rỗng", description: "Không có sản phẩm để đặt." });
      router.push("/products");
      return;
    }

    setLoading(true);
    setIsOrdering(true); // <-- start ordering, prevent empty-cart redirect

    const payload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email || "",
      customer_address: form.customer_address,
      payment_method: form.payment_method,
    };

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_BASE}/api/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", // sends cookies for JWT auth
      });

      if (!res.ok) {
        let body: any = {};
        try {
          body = await res.json();
        } catch {
          body = { detail: await res.text().catch(() => "") };
        }
        const message = body?.detail || body?.error || `Server error (${res.status})`;
        throw new Error(message);
      }

      const data = await res.json();
      toast?.({ title: "Đặt hàng thành công", description: `Mã đơn: ${data.id}` });

      await refreshCart();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("close-cart-sheet"));
      }
      router.push(`/about/confirmed`);


    } catch (err: any) {
      console.error("Order create failed", err);
      toast?.({
        title: "Không thể đặt hàng",
        description: err?.message || "Có lỗi xảy ra.",
      });
      setIsOrdering(false); // allow redirects again since ordering failed
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart?.items?.reduce((s, it) => s + it.quantity, 0) ?? 0;
  const subtotal = cart?.total_price ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Xác nhận đơn hàng</h1>
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{itemCount}</span> sản phẩm •{" "}
          <span className="font-semibold">
            {subtotal?.toLocaleString?.("vi-VN") ?? subtotal}₫
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {/* left */}
        <Card className="col-span-1 md:col-span-1">
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <Input
                  value={form.customer_name}
                  onChange={handleChange("customer_name")}
                />
                {errors.customer_name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.customer_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <Input
                  value={form.customer_phone}
                  onChange={handleChange("customer_phone")}
                />
                {errors.customer_phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.customer_phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email (tùy chọn)
                </label>
                <Input
                  value={form.customer_email}
                  onChange={handleChange("customer_email")}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <textarea
                  value={form.customer_address}
                  onChange={handleChange("customer_address")}
                  className="w-full rounded-md border px-3 py-2 mt-1 text-sm"
                  rows={4}
                />
                {errors.customer_address && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.customer_address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phương thức thanh toán
                </label>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, payment_method: "COD" }))
                    }
                    className={`px-3 py-2 rounded-md border ${
                      form.payment_method === "COD"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    COD
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* right */}
        <Card className="col-span-1 md:col-span-1">
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tóm tắt đơn hàng</h3>
                <Badge className="text-sm">{itemCount} sản phẩm</Badge>
              </div>

              <div className="space-y-2">
                {cart.items.map((it: any) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 line-clamp-1">
                        {it.name}
                      </div>
                      <div className="text-xs text-gray-500">x{it.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold">
                      {(parseFloat(it.price || "0") * it.quantity)
                        .toLocaleString?.("vi-VN") ?? ""}
                      ₫
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Tạm tính</div>
                <div className="text-sm font-medium">
                  {subtotal?.toLocaleString?.("vi-VN") ?? subtotal}₫
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Giảm giá</div>
                <div className="text-sm font-medium">0₫</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">Tổng cộng</div>
                <div className="text-lg font-bold text-emerald-700">
                  {subtotal?.toLocaleString?.("vi-VN") ?? subtotal}₫
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Đang tạo đơn..." : "Đặt hàng (COD)"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
