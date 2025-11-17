"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ConfirmedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get("orderId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          {/* simple check icon */}
          <svg className="h-10 w-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Order confirmed</h1>
        <p className="text-sm text-gray-600 mb-4">
          Thank you — your order has been placed successfully.
        </p>

        {orderId ? (
          <p className="text-sm text-gray-700 mb-4">
            Your order number: <span className="font-medium">{orderId}</span>
          </p>
        ) : null}

        <div className="flex gap-3 justify-center mt-6">
          <Button asChild>
            <Link href="/products" className="px-4 py-2">Continue shopping</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/orders" className="px-4 py-2">View my orders</Link>
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <button
            onClick={() => router.push("/")}
            className="underline"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}