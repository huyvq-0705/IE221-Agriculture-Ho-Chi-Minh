"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateCoupon } from "@/app/agrihcmAdmin/coupons/actions";
import AlertPopup from "./ui/AlertPopup";

interface UpdateCouponModalProps {
    coupon: {
        id: number;
        code: string;
        discount_percent: number;
        max_discount_amount: number;
        min_purchase_amount: number;
        usage_limit: number;
        times_used: number;
        expires_at: string;
        is_active: boolean;
    };
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateCouponModal: React.FC<UpdateCouponModalProps> = ({
    coupon,
    onClose,
    onSuccess,
}) => {
    const [form, setForm] = useState({
        code: "",
        discount_percent: "",
        max_discount_amount: "",
        min_purchase_amount: "",
        usage_limit: "",
        times_used: "",
        expires_at: "",
        is_active: coupon?.is_active ?? true
    });

    const [loading, setLoading] = useState(false);
    const [alertData, setAlertData] = useState<any>(null);

    // Load dữ liệu của coupon khi popup mở
    useEffect(() => {
        setForm({
            code: coupon.code,
            discount_percent: String(coupon.discount_percent),
            max_discount_amount: String(coupon.max_discount_amount),
            min_purchase_amount: String(coupon.min_purchase_amount),
            usage_limit: String(coupon.usage_limit),
            times_used: String(coupon.times_used),
            expires_at: coupon.expires_at.slice(0, 16), // để hiển thị trong input datetime-local
            is_active: coupon.is_active
        });
    }, [coupon]);


    // Update state khi nhập liệu
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };


    // Submit cập nhật
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));

        // (required by API)
        formData.append("pk", String(coupon.id));

        const result = await updateCoupon(null, formData);

        setLoading(false);

        if (result.ok) {
            setAlertData({ type: "success", message: "Coupon updated successfully!" });
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } else {
            setAlertData({ type: "error", message: `Update failed: ${result.message}` });
        }
    };


    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative animate-fadeIn">

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="text-xl font-semibold mb-4">Update Coupon</h2>

                    {/* FORM */}
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
                                step="0.01"
                                min="0"
                                max="100"
                                value={form.discount_percent}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Max & Min */}
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
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
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
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                                />
                            </div>
                        </div>

                        {/* Time Used */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Time Used
                            </label>
                            <input
                                name="time_used"
                                type="number"
                                min="0"
                                value={form.times_used}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Expiration Date */}
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
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                            />
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <label className="text-sm font-medium text-gray-700">
                                Active Status
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    name="is_active"
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-700 cursor-pointer hover:bg-emerald-800 text-white rounded-lg py-2 mt-2"
                        >
                            {loading ? "Updating..." : "Update Coupon"}
                        </button>
                    </form>
                </div>
            </div>

            {/* ALERT POPUP */}
            {alertData && (
                <AlertPopup
                    type={alertData.type}
                    message={alertData.message}
                    onClose={() => setAlertData(null)}
                />
            )}
        </>
    );
};

export default UpdateCouponModal;
