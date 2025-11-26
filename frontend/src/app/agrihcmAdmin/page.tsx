"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const CURRENCY = "₫";

// --- HELPER: Get Headers ---
const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

type Order = {
  id: number;
  status: string;
  final_amount?: string | number | null;
  created_at?: string | null;
  customer_name?: string;
};

type Product = { id: number; name?: string };
type Blog = { id: number; title?: string };

function statusColor(status?: string) {
  switch (status) {
    case "REJECTED":
    case "CANCELLED": return "#ef4444"; 
    case "PENDING": return "#d97706"; 
    case "CONFIRMED":
    case "SHIPPED": return "#d97706"; 
    case "DELIVERED": return "#16a34a"; 
    default: return "#64748b"; 
  }
}

function computePieSlices(counts: Record<string, number>) {
  const items = Object.entries(counts).map(([status, value]) => ({ status, value }));
  const total = items.reduce((s, it) => s + it.value, 0) || 1;
  let start = 0;
  return items.map(({ status, value }) => {
    const portion = value / total;
    const end = start + portion;
    const slice = {
      status,
      value,
      color: statusColor(status),
      startAngle: start * Math.PI * 2,
      endAngle: end * Math.PI * 2,
      percent: +((portion * 100).toFixed(1)),
    };
    start = end;
    return slice;
  });
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number) {
  if (endAngle === startAngle) return "";
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  const x1 = cx + rOuter * Math.cos(startAngle);
  const y1 = cy + rOuter * Math.sin(startAngle);
  const x2 = cx + rOuter * Math.cos(endAngle);
  const y2 = cy + rOuter * Math.sin(endAngle);
  const x3 = cx + rInner * Math.cos(endAngle);
  const y3 = cy + rInner * Math.sin(endAngle);
  const x4 = cx + rInner * Math.cos(startAngle);
  const y4 = cy + rInner * Math.sin(startAngle);
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`;
}

export default function AdminDashboardPageClient() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [blogs, setBlogs] = useState<Blog[] | null | "NO_ACCESS">(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [globalRefreshing, setGlobalRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshAll();
  }, []);

  async function fetchOrders() {
    setOrdersLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/?ordering=-created_at`, {
        headers: getAuthHeaders(), // HYBRID: Use Header
        credentials: "include",    // HYBRID: AND use Cookie
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Orders fetch failed (${res.status})`);
      const data = await res.json();
      const list: Order[] = Array.isArray(data) ? data : data.results ?? [];
      setOrders(list);
    } catch (e: any) {
      console.error("fetchOrders:", e);
      setError((prev) => prev || "Failed to load orders");
      setOrders(null);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function fetchProducts() {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/`, {
        headers: getAuthHeaders(), 
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Products fetch failed (${res.status})`);
      const data = await res.json();
      const list: Product[] = Array.isArray(data) ? data : data.results ?? [];
      setProducts(list);
    } catch (e) {
      console.warn("fetchProducts:", e);
      setProducts(null);
    } finally {
      setProductsLoading(false);
    }
  }

  async function fetchBlogs() {
    setBlogsLoading(true);
    try {
      const adminRes = await fetch(`${API_BASE}/api/admin/blogs/?ordering=-created_at`, {
        headers: getAuthHeaders(),
        credentials: "include",
        cache: "no-store",
      });

      if (adminRes.status === 401) {
        const publicRes = await fetch(`${API_BASE}/api/blogs/?ordering=-created_at`, {
           headers: getAuthHeaders(),
           credentials: "include",
           cache: "no-store",
        });
        if (!publicRes.ok) {
          setBlogs(null);
          return;
        }
        const pubData = await publicRes.json();
        const list: Blog[] = Array.isArray(pubData) ? pubData : pubData.results ?? [];
        setBlogs(list);
        return;
      }

      if (!adminRes.ok) throw new Error(`Blogs fetch failed (${adminRes.status})`);

      const adminData = await adminRes.json();
      const list: Blog[] = Array.isArray(adminData) ? adminData : adminData.results ?? [];
      setBlogs(list);
    } catch (e) {
      console.warn("fetchBlogs:", e);
      setBlogs(null);
    } finally {
      setBlogsLoading(false);
    }
  }

  async function refreshAll() {
    setGlobalRefreshing(true);
    setError(null);
    try {
      await Promise.all([fetchOrders(), fetchProducts(), fetchBlogs()]);
    } finally {
      setTimeout(() => setGlobalRefreshing(false), 200);
    }
  }

  const orderStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!orders) return counts;
    for (const o of orders) {
      const s = o.status ?? "UNKNOWN";
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [orders]);

  const slices = useMemo(() => computePieSlices(orderStatusCounts), [orderStatusCounts]);

  const totalRevenue = useMemo(() => {
    if (!orders) return 0;
    return orders.reduce((sum, o) => {
      const v = o.final_amount ?? 0;
      const n = typeof v === "string" ? parseFloat((v as string) || "0") : Number(v || 0);
      return sum + (isNaN(n) ? 0 : n);
    }, 0);
  }, [orders]);

  const recentOrders = useMemo(() => {
    if (!orders) return [];
    return orders.slice(0, 8);
  }, [orders]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button onClick={refreshAll} variant="outline" size="sm" disabled={globalRefreshing}>
            {globalRefreshing ? "Refreshing..." : "Refresh all"}
          </Button>
        </div>
      </div>

      {error && <div className="mb-4 rounded bg-red-50 text-red-700 p-3">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Orders</CardTitle>
            <Button size="sm" variant="ghost" onClick={fetchOrders} disabled={ordersLoading}>
              {ordersLoading ? "..." : "Refresh"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {orders ? Object.values(orderStatusCounts).reduce((a, b) => a + b, 0) : "—"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total orders</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Products</CardTitle>
            <Button size="sm" variant="ghost" onClick={fetchProducts} disabled={productsLoading}>
              {productsLoading ? "..." : "Refresh"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{products ? products.length : "—"}</div>
            <div className="text-sm text-muted-foreground mt-1">Total products</div>
             <div className="mt-2">
              <Link href="/agrihcmAdmin/products" className="text-sm text-emerald-600 hover:underline">
                Manage products →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Blogs</CardTitle>
            <Button size="sm" variant="ghost" onClick={fetchBlogs} disabled={blogsLoading}>
              {blogsLoading ? "..." : "Refresh"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {blogsLoading ? "…" : blogs === null ? "—" : Array.isArray(blogs) ? blogs.length : "—"}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total posts</div>
             <div className="mt-2">
              <Link href="/agrihcmAdmin/blogs" className="text-sm text-emerald-600 hover:underline">
                Manage posts →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2">
                <div className="mx-auto w-64 h-64">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <g transform="translate(100,100)">
                      {slices.map((s, i) => {
                        const d = arcPath(0, 0, 80, 48, s.startAngle, s.endAngle);
                        return (
                          <path key={s.status + i} d={d} fill={s.color} stroke="white" strokeWidth={0.5} />
                        );
                      })}
                      <circle r="36" fill="#fff" stroke="#f1f5f9" strokeWidth="1" />
                      <text x="0" y="-4" textAnchor="middle" style={{ fontSize: 12, fontWeight: 600, fill: "#0f172a" }}>
                        {orders ? Object.values(orderStatusCounts).reduce((a, b) => a + b, 0) : 0}
                      </text>
                      <text x="0" y="12" textAnchor="middle" style={{ fontSize: 11, fill: "#6b7280" }}>
                        Orders
                      </text>
                    </g>
                  </svg>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <div className="space-y-2">
                  {slices.map((s) => (
                    <div key={s.status} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span style={{ width: 12, height: 12, background: s.color, display: "inline-block", borderRadius: 4 }} />
                        <div className="text-sm font-medium">{s.status}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{s.value} ({s.percent}%)</div>
                    </div>
                  ))}
                  {Object.keys(orderStatusCounts).length === 0 && <div className="text-sm text-muted-foreground">No orders yet.</div>}
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Revenue:{" "}
              <span className="font-semibold">
                {CURRENCY}
                {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Orders</div>
                <div className="font-medium">{orders ? Object.values(orderStatusCounts).reduce((a, b) => a + b, 0) : "—"}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Products</div>
                <div className="font-medium">{products ? products.length : "—"}</div>
              </div>
              <div className="pt-2 border-t mt-2">
                <div className="text-sm text-muted-foreground">Revenue</div>
                <div className="text-lg font-semibold">
                  {CURRENCY}
                  {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((o) => (
                <TableRow key={o.id} className="hover:bg-muted/40">
                  <TableCell>#{o.id}</TableCell>
                  <TableCell>{o.customer_name ?? "-"}</TableCell>
                  <TableCell>
                    <span style={{ color: statusColor(o.status), fontWeight: 600 }}>{o.status}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {o.final_amount != null ? `${CURRENCY}${Number(o.final_amount).toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/agrihcmAdmin/orders`}>
                        <Button size="sm" variant="outline">View</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
               {!recentOrders.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No recent orders.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}