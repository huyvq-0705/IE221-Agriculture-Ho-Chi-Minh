import React from "react";
import { Clock, Percent, Eye, Edit2, Trash2 } from "lucide-react";

interface FlashSaleCardProps {
  title: string;
  discount: number;
  startDate: string;
  endDate: string;
  remaining: string;
  status: "ACTIVE" | "EXPIRED";
  productsCount: number;
}

const FlashSaleCard: React.FC<FlashSaleCardProps> = ({
  title,
  discount,
  startDate,
  endDate,
  remaining, 
  status,
  productsCount,
}) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-5 border border-gray-200 w-full max-w-md">
      <div className="flex justify-between items-start mb-2">
        <h2 className="font-semibold text-lg">{title}</h2>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-3">
        <p className="flex items-center gap-1">
          <Percent size={14} /> {discount.toFixed(2)}%
        </p>
        <p className="flex items-center gap-1">
          <Clock size={14} /> {startDate} → {endDate}
        </p>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Remaining: <span className="font-mono text-gray-700">{remaining}</span>
      </p>

      <p className="text-xs text-gray-500 mb-4">
        🛒 {productsCount} products
      </p>

      <div className="flex justify-between">
        <button className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded">
          <Eye size={14} /> View Products
        </button>
        <button className="flex items-center gap-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded">
          <Edit2 size={14} /> Edit
        </button>
        <button className="flex items-center gap-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded">
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
};

export default FlashSaleCard;
