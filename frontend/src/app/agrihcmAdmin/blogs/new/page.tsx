"use client";

import React, { useEffect, useState } from "react";
import BlogForm from "@/components/blogForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBlog } from "../actions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

type SimpleProduct = { id: number; name: string };

export default function NewBlogPage() {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/admin/products/?page_size=100`, {
           headers: getAuthHeaders(),
           credentials: "include",
           cache: "no-store",
        });
        
        if (!res.ok) {
           console.error("Failed to fetch products");
           return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        setProducts(list);
      } catch (e) {
        console.error("fetchProducts error:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <Card>
      <CardHeader><CardTitle>New Post</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
            <div className="text-sm text-muted-foreground">Loading products...</div>
        ) : (
            <BlogForm 
                submitText="Create" 
                onSubmit={createBlog} 
                products={products} 
            />
        )}
      </CardContent>
    </Card>
  );
}