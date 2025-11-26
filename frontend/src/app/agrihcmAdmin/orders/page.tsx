"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_address?: string | null;
  payment_method?: string | null;
  subtotal_amount?: string | null;
  discount_amount?: string | null;
  final_amount?: string | null;
  pricing_snapshot?: any;
  cancel_reason?: string | null;
  reject_reason?: string | null;
  items?: OrderItem[];
  created_at?: string | null;
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const [advancingId, setAdvancingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [showRejectSelect, setShowRejectSelect] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("OTHER");

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/?ordering=-created_at`, {
        headers: getAuthHeaders(),
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
      const data = await res.json();
      const list: Order[] = Array.isArray(data) ? data : data.results ?? [];
      setOrders(list);
    } catch (err) {
      console.error("fetchList error", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function openModal(id: number) {
    setOpenId(id);
    setDetail(null);
    setDetailLoading(true);
    setShowRejectSelect(false);
    setRejectReason("OTHER");
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${id}/`, {
        headers: getAuthHeaders(),
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Failed to load order (${res.status})`);
      const data = await res.json();
      setDetail(data);
    } catch (err) {
      console.error("openModal error", err);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeModal() {
    setOpenId(null);
    setDetail(null);
    setShowRejectSelect(false);
    setRejectReason("OTHER");
  }

  function getNextStatus(status?: string | null): string | null {
    switch (status) {
      case "PENDING": return "CONFIRMED";
      case "CONFIRMED": return "SHIPPED";
      case "SHIPPED": return "DELIVERED";
      default: return null;
    }
  }

  function statusColorClass(status?: string | null) {
    if (!status) return "text-gray-700";
    switch (status) {
      case "REJECTED":
      case "CANCELLED": return "text-red-600";
      case "PENDING":
      case "CONFIRMED":
      case "SHIPPED": return "text-yellow-600";
      case "DELIVERED": return "text-green-600";
      default: return "text-gray-700";
    }
  }

  async function advanceOrderRow(o: Order) {
    const next = getNextStatus(o.status);
    if (!next) return;
    if (!confirm(`Are you sure to advance order #${o.id} to ${next}?`)) return;
    setAdvancingId(o.id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${o.id}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Advance failed (${res.status})`);
      }
      await fetchList();
      if (openId === o.id) await openModal(o.id);
    } catch (err: any) {
      alert(err?.message || "Advance failed");
    } finally {
      setAdvancingId(null);
    }
  }

  async function advanceOrderInModal(id: number) {
    const next = getNextStatus(detail?.status ?? null);
    if (!next) return;
    if (!confirm(`Are you sure to advance order #${id} to ${next}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${id}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Advance failed (${res.status})`);
      }
      await fetchList();
      await openModal(id);
    } catch (err: any) {
      alert(err?.message || "Advance failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectOrder(id: number) {
    if (!confirm(`Are you sure to reject order #${id} with reason "${rejectReason}"?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${id}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ status: "REJECTED", reject_reason: rejectReason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Reject failed (${res.status})`);
      }
      await fetchList();
      closeModal();
    } catch (err: any) {
      alert(err?.message || "Reject failed");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Orders</h1>
        <Button onClick={fetchList} variant="outline" size="sm" disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {loading && (
        <div className="mb-3 h-1 w-full bg-amber-300 rounded-full overflow-hidden">
          <div className="h-1 bg-amber-500 animate-pulse w-full" />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id} className="hover:bg-muted/40">
              <TableCell>#{o.id}</TableCell>
              <TableCell>
                <div className="font-medium">{o.customer_name}</div>
                <div className="text-xs text-muted-foreground">{o.customer_phone ?? o.customer_email ?? "-"}</div>
              </TableCell>
              <TableCell>
                <span className={`text-sm font-medium ${statusColorClass(o.status)}`}>{o.status}</span>
              </TableCell>
              <TableCell>{o.payment_method ?? "-"}</TableCell>
              <TableCell className="text-right">{o.final_amount ?? "-"}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {o.created_at ? new Date(o.created_at).toLocaleString() : "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {o.status === "PENDING" && (
                    <Button size="sm" variant="ghost" className="rounded-full text-red-600" onClick={() => openModal(o.id)} title="Reject / View">
                      &lt;
                    </Button>
                  )}
                  {getNextStatus(o.status) && (
                    <Button size="sm" variant="outline" className="rounded-full text-blue-600" onClick={() => advanceOrderRow(o)} disabled={advancingId === o.id}>
                      {advancingId === o.id ? "..." : ">"}
                    </Button>
                  )}
                  <Button size="sm" className="rounded-full" onClick={() => openModal(o.id)}>
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
           {orders.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {openId !== null && detail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white w-full sm:max-w-3xl rounded-lg shadow-lg p-6 z-50 overflow-auto max-h-[90vh]">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">Order #{openId}</h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>Close</Button>
            </div>

            {detailLoading && <div className="py-8 text-center">Loading...</div>}

            {!detailLoading && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Customer</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <div>{detail.customer_name}</div>
                      <div>{detail.customer_phone ?? detail.customer_email}</div>
                      <div className="mt-2 whitespace-pre-wrap text-sm">{detail.customer_address}</div>
                    </div>
                  </div>
                  
                  {/* --- UPDATED SECTION: PAYMENT & TOTALS --- */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Payment & Totals</h3>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <div>Payment: {detail.payment_method}</div>
                      <div className="flex justify-between max-w-[200px]">
                        <span>Subtotal:</span> 
                        <span>đ{detail.subtotal_amount ?? "0"}</span>
                      </div>

                      {/* CONDITIONAL DISCOUNT DISPLAY */}
                      {Number(detail.discount_amount) > 0 && (
                        <div className="flex justify-between max-w-[200px] text-red-600 font-medium">
                           <span>Discount:</span>
                           <span>- đ{detail.discount_amount}</span>
                        </div>
                      )}

                      {/* Total with top border to simulate math line */}
                      <div className="flex justify-between max-w-[200px] font-bold mt-2 pt-2 border-t border-gray-300">
                         <span>Total:</span>
                         <span>đ{detail.final_amount ?? "-"}</span>
                      </div>

                      {detail.reject_reason && <div className="mt-2 text-sm text-red-600">Reject: {detail.reject_reason}</div>}
                    </div>
                  </div>
                  {/* --- END UPDATED SECTION --- */}
                
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Items</h3>
                  <div className="mt-2 space-y-2">
                    {detail.items?.map((it) => (
                      <div key={it.id} className="flex justify-between items-center border rounded p-2">
                        <div>
                          <div className="font-medium">{it.product_name}</div>
                          <div className="text-sm text-muted-foreground">Qty: {it.quantity}</div>
                        </div>
                        <div className="text-sm">đ{it.line_total}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  {getNextStatus(detail.status) && (
                    <Button variant="outline" onClick={() => advanceOrderInModal(detail.id)} disabled={actionLoading} className="text-blue-600">
                      {actionLoading ? "Working..." : `Advance to ${getNextStatus(detail.status)}`}
                    </Button>
                  )}

                  {detail.status === "PENDING" && (
                    <>
                      {!showRejectSelect ? (
                        <Button variant="destructive" onClick={() => setShowRejectSelect(true)} disabled={actionLoading} className="text-white">
                          Reject
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="rounded border px-2 py-1">
                            <option value="OUT_OF_STOCK">Out of stock</option>
                            <option value="INVALID_ADDRESS">Invalid address</option>
                            <option value="SUSPECTED_FRAUD">Suspected fraud</option>
                            <option value="OTHER">Other</option>
                          </select>
                          <Button variant="destructive" onClick={() => rejectOrder(detail.id)} disabled={actionLoading} className="text-white">
                             Confirm
                          </Button>
                          <Button variant="outline" onClick={() => { setShowRejectSelect(false); setRejectReason("OTHER"); }}>Cancel</Button>
                        </div>
                      )}
                    </>
                  )}
                  <Button onClick={closeModal} variant="ghost">Close</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}