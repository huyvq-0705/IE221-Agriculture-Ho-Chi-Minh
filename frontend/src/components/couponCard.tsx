import React from "react";
import { Clock, Percent, Eye, Edit2, Trash2, ShoppingCart } from "lucide-react";

interface CouponProps {
  code: string;
  discount: number;
  expires_at: string;
  remaining: string;
  status: boolean;
  productsCount: number;
}

const CouponCard: React.FC<CouponProps> = ({
  code,
  discount,
  expires_at,
  remaining,
  status,
  productsCount,
}) => {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200 transition hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h2 className="font-semibold text-lg">{code}</h2>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            status
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status ? "ACTIVE" : "EXPIRED"}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-3">
        <p className="flex items-center gap-1">
          <Percent size={14} /> {discount.toFixed(2)}%
        </p>
        <p className="flex items-center gap-1">
          <Clock size={14} /> Expires at: {expires_at}
        </p>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        Remaining: <span className="font-mono text-gray-700">{remaining}</span>
      </p>

      <p className="text-xs text-gray-500 mb-5 flex items-center gap-1">
        <ShoppingCart size={13} /> {productsCount} products
      </p>

      <div className="flex justify-between gap-2">
        <button className="flex-1 flex items-center justify-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition cursor-pointer">
          <Eye size={15} /> View
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-lg transition cursor-pointer">
          <Edit2 size={15} /> Edit
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 rounded-lg transition cursor-pointer">
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </div>
  );
};

export default CouponCard;
