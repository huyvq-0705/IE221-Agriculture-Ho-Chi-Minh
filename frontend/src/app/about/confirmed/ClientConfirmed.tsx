"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClientConfirmed() {
  const params = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setOrderId(params.get("orderId"));
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <svg aria-hidden="true" className="h-10 w-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Đơn hàng đã xác nhận</h1>
        <p className="text-sm text-gray-600 mb-4">Cảm ơn bạn — đơn hàng của bạn đã được đặt thành công.</p>

        {orderId ? (
          <p className="text-sm text-gray-700 mb-4">
            Số điện thoại của bạn: <span className="font-medium">{orderId}</span>
          </p>
        ) : null}

        <div className="flex gap-3 justify-center mt-6">
          <Button asChild>
            <Link href="/products" aria-label="Continue shopping" className="px-4 py-2">
              Tiếp tục mua sắm
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/orders" aria-label="View my orders" className="px-4 py-2">
              Xem đơn hàng của tôi
            </Link>
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <button
            onClick={() => router.push("/")}
            className="underline"
            aria-label="Back to home"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
