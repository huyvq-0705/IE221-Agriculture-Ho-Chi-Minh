import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";
import CouponList from "@/components/couponList";

type HeaderMap = Record<string, string>;
async function authHeaders(): Promise<HeaderMap> {
  const token = (await cookies()).get("accessToken")?.value;
  const h: HeaderMap = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

type CouponListItem = {
  id: number;
  code: string;
  discount_percent: number;
  max_discount_amount: number | null;
  min_purchase_amount: number;
  is_active: boolean;
  expires_at: string;
  usage_limit: number | null;
  times_used: number;
  created_at: string;
  updated_at: string;
};

type DRFPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

async function getCoupon(search = "", page = 1) {
  try {
    const q = new URLSearchParams({ search, page: String(page), ordering: "-created_at" });
    const headers = new Headers(await authHeaders());
    const data = (await fetchApi(`api/admin/coupons/?${q.toString()}`, {
      headers,
      cache: "no-store",
    })) as DRFPaginated<CouponListItem>;
    return data;
  } catch {
    redirect("/agrihcmAdmin/login");
  }
}

// const data = [
//     {
//       code: "NAMMOI",
//       discount: 10,
//       expires_at: "10/3/2025, 12:00 AM",
//       remaining: "08:00:12",
//       status: true,
//       productsCount: 5,
//     },
//     {
//       code: "Hello",
//       discount: 25,
//       expires_at: "9/9/2025, 12:00 AM",
//       remaining: "00:00:00",
//       status: false,
//       productsCount: 3,
//     },
//     {
//       code: "PHANBON",
//       discount: 25,
//       expires_at: "8/29/2025, 8:00 AM",
//       remaining: "00:00:00",
//       status: true,
//       productsCount: 4,
//     },
//   ];

export default async function CouponPage() {
  const couponData = await getCoupon();
  const coupons = couponData?.results || [];

  // Chuyển dữ liệu API thành format phù hợp với CouponList
  const formattedCoupons = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    discount: Number(c.discount_percent),
    created_at: new Date(c.created_at).toLocaleString("vi-VN"),
    expires_at: new Date(c.expires_at).toLocaleString("vi-VN"),
    remaining: "—", // Có thể tính thời gian còn lại ở đây nếu muốn
    status: c.is_active,
  }));

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <CouponList sales={formattedCoupons} />
      </div>
    </div>
  );
}
