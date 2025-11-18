"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createCoupon } from "@/app/agrihcmAdmin/coupons/actions";

interface CreateCouponModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCouponModal: React.FC<CreateCouponModalProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    code: "",
    discount_percent: "",
    max_discount_amount: "",
    min_purchase_amount: "",
    time_used: "",
    expires_at: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Thêm state cho popup thông báo
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  // Tự ẩn popup sau 3 giây
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    const result = await createCoupon(null, formData);
    setLoading(false);

    if (result.ok) {
      setIsSuccess(true);
      setMessage("Coupon created successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setIsSuccess(false);
      setMessage(`Failed to create coupon: ${result.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative transition-all duration-300 scale-100">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-xl font-semibold mb-4">Create New Coupon</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              name="code"
              type="text"
              value={form.code}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
            <input
              name="discount_percent"
              type="number"
              min="0"
              step="0.01"
              value={form.discount_percent}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Max Discount & Min Purchase */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Discount</label>
              <input
                name="max_discount_amount"
                type="number"
                min="0"
                value={form.max_discount_amount}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Min Purchase</label>
              <input
                name="min_purchase_amount"
                type="number"
                min="1"
                value={form.min_purchase_amount}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Time Used */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Used</label>
            <input
              name="time_used"
              type="number"
              min="0"
              value={form.time_used}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
              placeholder="Enter number of allowed uses"
            />
          </div>

          {/* Expires At */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Expires At</label>
            <input
              name="expires_at"
              type="datetime-local"
              value={form.expires_at}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg py-2 mt-2 cursor-pointer"
          >
            {loading ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      </div>

      {/* Popup thông báo */}
      {message && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm text-white shadow-lg transition-opacity duration-300 ${isSuccess ? "bg-emerald-600" : "bg-red-600"
            } animate-fade-in`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default CreateCouponModal;
