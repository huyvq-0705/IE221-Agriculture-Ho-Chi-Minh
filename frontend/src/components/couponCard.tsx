"use client";
import React, { useState } from "react";
import { Clock, Percent, Edit2, Trash2 } from "lucide-react";
import { deleteCoupon } from "@/app/agrihcmAdmin/coupons/actions";

import AlertPopup from "@/components/ui/AlertPopup";
import ConfirmPopup from "@/components/ui/ConfirmPopup";
import UpdateCouponModal from "@/components/updateCouponModal";

interface CouponProps {
  id: number;
  code: string;
  discount_percent: number;
  max_discount_amount: number;
  min_purchase_amount: number;
  time_used: number;
  created_at: string;
  expires_at: string;
  remaining: string;
  status: boolean;
}

const CouponCard: React.FC<CouponProps> = ({
  id,
  code,
  discount_percent,
  max_discount_amount,
  min_purchase_amount,
  time_used,
  created_at,
  expires_at,
  remaining,
  status,
}) => {
  const [alertData, setAlertData] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [updateOpen, setUpdateOpen] = useState(false);

  const handleDelete = async () => {
    setConfirmOpen(false);

    const result = await deleteCoupon(id);

    if (result.ok) {
      setAlertData({ type: "success", message: "Deleted successfully!" });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setAlertData({
        type: "error",
        message: `Delete failed: ${result.message}`,
      });
    }
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200">
        {/* header */}
        <div className="flex justify-between items-start mb-2">
          <h2 className="font-semibold text-lg">{code}</h2>

          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
          >
            {status ? "ACTIVE" : "EXPIRED"}
          </span>
        </div>

        {/* info */}
        <div className="text-sm text-gray-600 space-y-1 mb-3">
          <p className="flex items-center gap-1">
            <Percent size={14} /> {discount_percent.toFixed(2)}%
          </p>
          <p className="flex items-center gap-1">
            <Clock size={14} /> Created at: {created_at}
          </p>
          <p className="flex items-center gap-1">
            <Clock size={14} /> Expires at: {expires_at}
          </p>
        </div>

        <div className="flex justify-between gap-2">
          {/* Update */}
          <button
            onClick={() => setUpdateOpen(true)}
            className="
              flex-1 flex items-center justify-center gap-1 
              py-2 rounded-lg font-medium 
              bg-blue-100 text-blue-700
              hover:bg-blue-200 hover:text-blue-800 
              cursor-pointer transition-all duration-150
              active:scale-[0.97]
            "
          >
            <Edit2 size={15} /> Edit
          </button>

          {/* Delete */}
          <button
            onClick={() => setConfirmOpen(true)}
            className="
              flex-1 flex items-center justify-center gap-1 
              py-2 rounded-lg font-medium
              bg-red-100 text-red-700
              hover:bg-red-200 hover:text-red-800 
              cursor-pointer transition-all duration-150
              active:scale-[0.97]
            "
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Popup Update Coupon */}
      {updateOpen && (
        <UpdateCouponModal
          coupon={{
            id,
            code,
            discount_percent,
            max_discount_amount,
            min_purchase_amount,
            time_used,
            expires_at,
          }}

          onClose={() => setUpdateOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

      {/* Popup Confirm */}
      {confirmOpen && (
        <ConfirmPopup
          title="Delete Coupon"
          message={`Are you sure you want to delete "${code}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      {/* Popup Alert */}
      {alertData && (
        <AlertPopup
          message={alertData.message}
          type={alertData.type}
          onClose={() => setAlertData(null)}
        />
      )}
    </>
  );
};

export default CouponCard;
