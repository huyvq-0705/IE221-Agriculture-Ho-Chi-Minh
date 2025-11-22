"use client";
import React, { useState } from "react";
import CouponCard from "./couponCard";
import CreateCouponModal from "./createCouponModal";

interface Coupon {
  id: number;
  code: string;
  discount_percent: number;
  max_discount_amount: number;
  min_purchase_amount: number;
  usage_limit: number;
  times_used: number;
  created_at: string;
  expires_at: string;
  remaining: string;
  is_active: boolean;
}

interface CouponListProps {
  sales: Coupon[];
}

const CouponList: React.FC<CouponListProps> = ({ sales }) => {
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = () => {
    window.location.reload(); // hoặc dùng router.refresh()
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">Coupons</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer">
            Refresh
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm cursor-pointer"
          >
            + New Coupon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sales.map((sale, index) => (
          <CouponCard
            key={index}
            id={sale.id}
            code={sale.code}
            discount_percent={sale.discount_percent}
            created_at={sale.created_at}
            expires_at={sale.expires_at}
            remaining={sale.remaining}
            is_active={sale.is_active}
            max_discount_amount={sale.max_discount_amount}
            min_purchase_amount={sale.min_purchase_amount}
            times_used={sale.times_used}
            usage_limit={sale.usage_limit}
          />
        ))}
      </div>

      {showModal && (
        <CreateCouponModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />
      )}
    </div>
  );
};

export default CouponList;

