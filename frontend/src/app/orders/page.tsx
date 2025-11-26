"use client";

import React, { useEffect, useState } from "react";

type OrderItem = {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  price_at_order: string;
  line_total: string;
};

type Order = {
  id: number;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_address: string;
  payment_method: string;
  subtotal_amount: string;
  discount_amount: string;
  final_amount: string;
  pricing_snapshot?: any;
  cancel_reason?: string | null;
  reject_reason?: string | null;
  items: OrderItem[];
  created_at: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- HELPER: Get Headers ---
const getAuthHeaders = () => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isCancellable = (status?: string | null) => {
    if (!status) return false;
    return status === "PENDING";
  };

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/orders/`, { 
          headers: getAuthHeaders(), // HYBRID
          credentials: "include"     // HYBRID
      });
      if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
      const data = await res.json();
      setOrders(data);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusBadge = (status: string) => {
    const base = "px-2 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "PENDING": return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case "CONFIRMED": return <span className={`${base} bg-blue-100 text-blue-800`}>Confirmed</span>;
      case "SHIPPED": return <span className={`${base} bg-indigo-100 text-indigo-800`}>Shipped</span>;
      case "DELIVERED": return <span className={`${base} bg-green-100 text-green-800`}>Delivered</span>;
      case "CANCELLED": return <span className={`${base} bg-gray-100 text-gray-800`}>Cancelled</span>;
      case "REJECTED": return <span className={`${base} bg-red-100 text-red-800`}>Rejected</span>;
      default: return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  async function cancelOrder(orderId: number, reason = "CHANGED_MIND") {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/`, {
        method: "PATCH",
        headers: getAuthHeaders(), 
        credentials: "include",
        body: JSON.stringify({ cancel_reason: reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Failed to cancel (${res.status})`);
      }
      await fetchOrders();
      setSelected(null);
    } catch (e: any) {
      alert(e.message || "Cancel failed");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Đơn hàng của tôi</h1>

      {loading && <div className="py-8 text-center">Đang tải</div>}
      {error && <div className="bg-red-50 text-red-800 p-4 rounded mb-4">{error}</div>}
      {!loading && orders?.length === 0 && (
        <div className="py-8 text-center text-gray-600">You have no orders yet.</div>
      )}

      {!loading && orders && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border rounded-lg p-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">#{o.id}</div>
                  <div className="text-lg font-medium">{o.customer_name || "—"}</div>
                  <div className="text-sm text-gray-500">· {new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {o.items.length} item{o.items.length > 1 ? "s" : ""} • đ{o.final_amount}
                </div>
                <div className="mt-3">{statusBadge(o.status)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelected(o)} className="px-3 py-1 rounded border text-sm hover:bg-slate-50">
                  View
                </button>
                {isCancellable(o.status) && (
                  <button onClick={() => cancelOrder(o.id)} disabled={actionLoading} className="px-3 py-1 rounded border text-sm text-red-600 hover:bg-red-50">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full sm:max-w-2xl rounded-lg shadow-lg p-6 z-50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">Order #{selected.id}</h2>
                <div className="text-sm text-gray-500">{new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <div>{statusBadge(selected.status)}</div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Customer</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <div>{selected.customer_name}</div>
                  <div>{selected.customer_phone}</div>
                  {selected.customer_email && <div>{selected.customer_email}</div>}
                  <div className="mt-2 whitespace-pre-wrap">{selected.customer_address}</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Payment & Totals</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <div>Payment: {selected.payment_method}</div>
                  <div>Subtotal: đ{selected.subtotal_amount}</div>
                  <div>Discount: đ{selected.discount_amount}</div>
                  <div className="font-semibold mt-2">Total: đ{selected.final_amount}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700">Items</h3>
              <div className="mt-2 space-y-2">
                {selected.items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center border rounded p-2">
                    <div>
                      <div className="font-medium">{it.product_name}</div>
                      <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
                    </div>
                    <div className="text-sm">đ{it.line_total}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {isCancellable(selected.status) && (
                <button onClick={() => cancelOrder(selected.id)} disabled={actionLoading} className="px-4 py-2 rounded border text-sm text-red-600 hover:bg-red-50">
                  {actionLoading ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded border text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}