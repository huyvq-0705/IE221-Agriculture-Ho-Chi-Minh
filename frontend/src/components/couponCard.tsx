"use client";
import React, { useState } from "react";
import { Clock, Percent, Edit2, Trash2, X } from "lucide-react";
import { deleteCoupon, updateCoupon } from "@/app/agrihcmAdmin/coupons/actions";

interface CouponProps {
  id: number;
  code: string;
  discount: number;
  created_at: string;
  expires_at: string;
  remaining: string;
  status: boolean;
}

const CouponCard: React.FC<CouponProps> = ({
  id,
  code,
  discount,
  created_at,
  expires_at,
  remaining,
  status,
}) => {
  // popup thông báo
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  // popup xác nhận xóa
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteConfirm = async () => {
    setShowConfirm(false);

    const result = await deleteCoupon(id);
    if (result.ok) {
      setAlertMessage("Deleted successfully!");
      setAlertType("success");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        window.location.reload();
      }, 3000);
    } else {
      setAlertMessage(`Delete failed: ${result.message}`);
      setAlertType("error");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3500);
    }
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-200 transition hover:shadow-md relative">
        <div className="flex justify-between items-start mb-2">
          <h2 className="font-semibold text-lg">{code}</h2>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
            <Clock size={14} /> Created at: {created_at}
          </p>
          <p className="flex items-center gap-1">
            <Clock size={14} /> Expires at: {expires_at}
          </p>
        </div>

        <p className="text-xs text-gray-500 mb-2">
          Remaining: <span className="font-mono text-gray-700">{remaining}</span>
        </p>

        <div className="flex justify-between gap-2">
          <button className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 rounded-lg transition cursor-pointer">
            <Edit2 size={15} /> Edit
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex-1 flex items-center justify-center gap-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 rounded-lg transition cursor-pointer"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Popup thông báo */}
      {showAlert && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg text-white shadow-lg transition-all ${alertType === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
        >
          {alertMessage}
        </div>
      )}

      {/* Popup xác nhận */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg relative">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Delete Coupon
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete <b>{code}</b>? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CouponCard;
