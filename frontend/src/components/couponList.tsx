"use client";
import React from "react";
import CouponCard from "./couponCard";
import { createCoupon } from "@/app/agrihcmAdmin/coupons/actions";

interface Coupon {
  id: number;
  code: string;
  discount: number;
  created_at: string;
  expires_at: string;
  remaining: string;
  status: boolean;
}

interface CouponListProps {
  sales: Coupon[];
}

const CouponList: React.FC<CouponListProps> = ({ sales }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">Coupons</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer">
            Refresh
          </button>
          <button className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm cursor-pointer">
            + New Coupon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sales.map((sale, index) => (
          <CouponCard key={index} {...sale} />
        ))}
      </div>
    </div>
  );
};

export default CouponList;

