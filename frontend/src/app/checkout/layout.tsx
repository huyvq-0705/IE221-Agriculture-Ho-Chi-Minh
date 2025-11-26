import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Đặt hàng - AgriHCM",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full border-b border-emerald-100 bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-extrabold text-emerald-600 hover:text-emerald-700">
              AgriHCM
            </Link>
            <span className="text-sm text-gray-600">/</span>
            <span className="text-sm font-medium text-gray-800">Thanh toán</span>
          </div>
          <div className="text-sm text-gray-500">
            <Link href="/products" className="underline">Tiếp tục mua hàng</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}