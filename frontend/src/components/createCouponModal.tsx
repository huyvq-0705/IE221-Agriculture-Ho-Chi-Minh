"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { createCoupon } from "@/app/agrihcmAdmin/coupons/actions";
import AlertPopup from "./ui/AlertPopup";

interface CreateCouponModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    code: "",
    discount_percent: "",
    max_discount_amount: "",
    min_purchase_amount: "",
    usage_limit: "",
    time_used: "",
    expires_at: "",
  });

  const [loading, setLoading] = useState(false);

  // sử dụng AlertPopup
  const [alertData, setAlertData] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    const result = await createCoupon(null, formData);
    setLoading(false);

    if (result.ok) {
      // hiện popup
      setAlertData({
        type: "success",
        message: "Coupon created successfully!",
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      // hiện popup lỗi
      setAlertData({
        type: "error",
        message: `Create failed: ${result.message}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* FORM UI */}
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Create New Coupon</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CODE */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              name="code"
              type="text"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* DISCOUNT */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount (%)
            </label>
            <input
              name="discount_percent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.discount_percent}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* GROUP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Discount
              </label>
              <input
                name="max_discount_amount"
                type="number"
                min="0"
                value={form.max_discount_amount}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Min Purchase
              </label>
              <input
                name="min_purchase_amount"
                type="number"
                min="1"
                value={form.min_purchase_amount}
                required
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* USAGE LIMIT */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Usage Limit
            </label>
            <input
              name="usage_limit"
              type="number"
              min="0"
              value={form.usage_limit}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* EXPIRES */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expires At
            </label>
            <input
              name="expires_at"
              type="datetime-local"
              value={form.expires_at}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg py-2 mt-2 cursor-pointer"
          >
            {loading ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      </div>

      {/* Popup Alert */}
      {alertData && (
        <AlertPopup
          type={alertData.type}
          message={alertData.message}
          onClose={() => setAlertData(null)}
        />
      )}
    </div>
  );
};

export default CreateCouponModal;
