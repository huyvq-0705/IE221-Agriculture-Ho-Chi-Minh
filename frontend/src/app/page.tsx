import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlider } from "@/components/hero-slider";
import { FeaturedProducts, Product } from "@/components/featured-products"; // Import the updated component
import { USPSection } from "@/components/usp-section";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://agrihcm.shop";
const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AgriHCM – Hướng dẫn thực hành cho nông nghiệp hiện đại",
  description:
    "AgriHCM chia sẻ các hướng dẫn thực hành, dễ hiểu về tưới tiêu, sức khỏe đất và quản lý cây trồng.",
};

// --- TYPES ---
type BlogItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  created_at: string;
  updated_at: string;
};

type BlogListResponse = {
  results: BlogItem[];
};

type ProductListResponse = {
  results: Product[];
};

// --- DATA FETCHING ---

// 1. Fetch Blogs
async function getBlogs(): Promise<BlogItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/blogs/?ordering=-updated_at&page_size=6`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as BlogListResponse;
    return data.results ?? [];
  } catch (error) {
    return [];
  }
}

// 2. Fetch Featured Products (Fetching page 1 for now)
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    // You can adjust page_size to get more items for the carousel
    const url = `${API_BASE}/api/products/?page=1&page_size=8`; 
    
    const res = await fetch(url, {
      cache: "no-store", // Ensure fresh data, or use 'next: { revalidate: ... }'
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return [];
    const data = (await res.json()) as ProductListResponse;
    return data.results || [];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function HomePage() {
  // Fetch data in parallel
  const [posts, products] = await Promise.all([
    getBlogs(),
    getFeaturedProducts(),
  ]);

  const slides = [
    {
      src: "https://plus.unsplash.com/premium_photo-1664297279674-e096752abf47?q=80&w=1170&auto=format&fit=crop",
      alt: "Cánh đồng xanh được tưới lúc bình minh – AgriHCM",
    },
    {
      src: "https://images.unsplash.com/photo-1617985562309-2aa7781f1608?q=80&w=1170&auto=format&fit=crop",
      alt: "Đôi tay nâng cây non và đất khỏe – AgriHCM",
    },
    {
      src: "https://images.unsplash.com/photo-1650449339582-ffc4451ab53c?q=80&w=2070&auto=format&fit=crop",
      alt: "Cảnh quan trang trại với hệ thống tưới – AgriHCM",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 pb-14 pt-4 md:pt-6">
      <HeroSlider slides={slides} />

      {/* Pass fetched products to the client component */}
      <FeaturedProducts products={products} />

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-emerald-900">
            Hướng dẫn mới nhất
          </h2>
          <Link
            href="/blog"
            className="text-sm font-medium text-emerald-700 hover:underline flex items-center gap-1"
          >
            Xem blog <ArrowRight size={16} />
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
            Hiện chưa có bài viết trên AgriHCM.
          </p>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-[22rem] shrink-0 h-56 md:h-auto">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={post.cover_image_alt || post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-700">
                          Chưa có ảnh
                        </div>
                      )}
                      <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700 shadow backdrop-blur">
                        {formatDate(post.updated_at || post.created_at)}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                      <h3 className="text-xl font-bold text-emerald-900 group-hover:text-emerald-700">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-2 md:line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-4 flex items-center text-sm font-bold text-emerald-600 group-hover:gap-2 transition-all">
                        Đọc tiếp <ArrowRight size={16} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <USPSection />
    </main>
  );
}