import React from "react";
import CouponCard from "./couponCard";

const CouponList = () => {
  const sales = [
    {
      code: "NAMMOI",
      discount: 10,
      startDate: "10/3/2025, 12:00 AM",
      endDate: "10/10/2026, 12:00 AM",
      remaining: "08:00:12",
      status: true,
      productsCount: 5,
    },
    {
      code: "Hello",
      discount: 25,
      startDate: "9/9/2025, 12:00 AM",
      endDate: "9/10/2025, 12:00 PM",
      remaining: "00:00:00",
      status: false,
      productsCount: 3,
    },
    {
      code: "PHANBON",
      discount: 25,
      startDate: "8/29/2025, 8:00 AM",
      endDate: "8/29/2025, 12:00 PM",
      remaining: "00:00:00",
      status: true,
      productsCount: 4,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Coupons</h1>
          <p className="text-gray-600 text-sm">
            Create time-limited discounts with real-time countdowns.
          </p>
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
