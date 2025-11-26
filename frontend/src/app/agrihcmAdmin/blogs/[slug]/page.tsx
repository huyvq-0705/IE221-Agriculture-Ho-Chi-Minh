"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BlogForm from "@/components/blogForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateBlog, deleteBlog } from "../actions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper to get headers from localStorage (Client-side)
const getAuthHeaders = () => {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

type SimpleProduct = { id: number; name: string };

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  
  // State
  const [slug, setSlug] = useState<string>("");
  const [blogPost, setBlogPost] = useState<any>(null);
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Unwrap params (Next.js 15+ params is a Promise)
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // 2. Fetch Data (Blog + Products)
  useEffect(() => {
    if (!slug) return;

    async function fetchData() {
      setLoading(true);
      try {
        const headers = getAuthHeaders();

        // A. Fetch Blog Detail
        const blogRes = await fetch(`${API_BASE}/api/admin/blogs/${slug}/`, {
          headers,
          cache: "no-store",
        });

        // B. Fetch Product List
        const prodRes = await fetch(`${API_BASE}/api/admin/products/?page_size=100`, {
          headers,
          cache: "no-store",
        });

        if (blogRes.ok) {
          setBlogPost(await blogRes.json());
        } else {
           // If blog not found, maybe redirect or show error
           console.error("Blog post not found");
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const list = Array.isArray(prodData) ? prodData : prodData.results || [];
          setProducts(list);
        } else {
          console.error("Failed to load products");
        }

      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  // 3. Handle Delete (Client-side wrapper for Server Action)
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    const res = await deleteBlog(slug);
    
    if (res.ok) {
      router.push("/agrihcmAdmin/blogs");
    } else {
      alert(res.message || "Failed to delete");
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
       <Card>
         <CardContent className="p-8 text-center text-muted-foreground">
            Loading editor...
         </CardContent>
       </Card>
    );
  }

  if (!blogPost) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-red-500">
           Blog post not found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Edit Post: {blogPost.title}</CardTitle>
        <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </CardHeader>
      <CardContent>
        <BlogForm
          initial={blogPost}
          products={products}
          submitText="Update Post"
          onSubmit={updateBlog}
        />
      </CardContent>
    </Card>
  );
}