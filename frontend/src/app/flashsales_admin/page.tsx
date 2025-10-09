import React from "react";
import FlashSaleList from "@/components/FlashSaleList";

const FlashSalesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-7xl mx-auto">
        <FlashSaleList />
      </div>
    </div>
  );
};

export default FlashSalesPage;
