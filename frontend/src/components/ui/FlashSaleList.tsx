import React from "react";
import FlashSaleCard from "./FlashSaleCard";

const FlashSaleList = () => {
  const sales = [
    {
      title: "3.10 Mega Sale",
      discount: 10,
      startDate: "10/3/2025, 12:00 AM",
      endDate: "10/10/2026, 12:00 AM",
      remaining: "8751:00:12",
      status: "ACTIVE" as const,
      productsCount: 5,
    },
    {
      title: "9.9",
      discount: 25,
      startDate: "9/9/2025, 12:00 AM",
      endDate: "9/10/2025, 12:00 PM",
      remaining: "00:00:00",
      status: "EXPIRED" as const,
      productsCount: 3,
    },
    {
      title: "Xiaomi Phone Mega Sale",
      discount: 25,
      startDate: "8/29/2025, 8:00 AM",
      endDate: "8/29/2025, 12:00 PM",
      remaining: "00:00:00",
      status: "EXPIRED" as const,
      productsCount: 4,
    },
    {
      title: "Mouse Mega Sale",
      discount: 10,
      startDate: "8/26/2025, 4:00 PM",
      endDate: "8/27/2025, 12:00 AM",
      remaining: "00:00:00",
      status: "EXPIRED" as const,
      productsCount: 5,
    },
    {
      title: "Flash Sale Mùa Hè",
      discount: 10,
      startDate: "8/27/2025, 5:00 PM",
      endDate: "8/28/2025, 5:00 PM",
      remaining: "00:00:00",
      status: "EXPIRED" as const,
      productsCount: 3,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">⚡ Flash Sales</h1>
          <p className="text-gray-600 text-sm">
            Create time-limited discounts with real-time countdowns.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
            Refresh
          </button>
          <button className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm">
            + New Flash Sale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sales.map((sale, index) => (
          <FlashSaleCard key={index} {...sale} />
        ))}
      </div>
    </div>
  );
};

export default FlashSaleList;
