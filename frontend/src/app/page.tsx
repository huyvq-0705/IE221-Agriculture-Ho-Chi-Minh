import type { Metadata } from "next"
import Link from "next/link"
import { HeroSlider } from "@/components/hero-slider"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://agrihcm.shop"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AgriHCM – Hướng dẫn thực hành cho nông nghiệp hiện đại",
  description:
    "AgriHCM chia sẻ các hướng dẫn thực hành, dễ hiểu về tưới tiêu, sức khỏe đất và quản lý cây trồng – dành cho người làm nông tại Việt Nam.",
  alternates: { canonical: "/" },
  keywords: [
    "AgriHCM",
    "nông nghiệp hiện đại",
    "tưới tiêu",
    "sức khỏe đất",
    "quản lý cây trồng",
    "hướng dẫn nông nghiệp",
    "blog AgriHCM",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    title: "AgriHCM – Hướng dẫn thực hành cho nông nghiệp hiện đại",
    description:
      "Mẹo hay và hướng dẫn dễ hiểu về tưới tiêu, đất và cây trồng – được biên soạn bởi AgriHCM.",
    url: "/",
    siteName: "AgriHCM",
    images: [{ url: "/og-home.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgriHCM – Hướng dẫn thực hành cho nông nghiệp hiện đại",
    description:
      "Hướng dẫn và mẹo nông nghiệp dễ hiểu do AgriHCM biên soạn: tưới tiêu, đất, cây trồng.",
  },
}

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000"

type BlogItem = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  created_at: string
  updated_at: string
}

type BlogListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: BlogItem[]
}

async function getBlogs(): Promise<BlogItem[]> {
  const res = await fetch(`${API_BASE}/api/blogs/?ordering=-updated_at&page_size=6`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return []
  const data = (await res.json()) as BlogListResponse
  return data.results ?? []
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return ""
  }
}

export default async function HomePage() {
  const posts = await getBlogs()

  const slides = [
    {
      src: "https://plus.unsplash.com/premium_photo-1664297279674-e096752abf47?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Cánh đồng xanh được tưới lúc bình minh – AgriHCM",
    },
    {
      src: "https://images.unsplash.com/photo-1617985562309-2aa7781f1608?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Đôi tay nâng cây non và đất khỏe – AgriHCM",
    },
    {
      src: "https://images.unsplash.com/photo-1650449339582-ffc4451ab53c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Cảnh quan trang trại với hệ thống tưới – AgriHCM",
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-5 pb-14 pt-4 md:pt-6">
      {/* Hero slider */}
      <HeroSlider slides={slides} />

      {/* Blog previews */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-emerald-900">
            Hướng dẫn mới nhất từ AgriHCM
          </h2>
          <Link
            href="/blog"
            className="text-sm font-medium text-emerald-700 hover:underline"
            aria-label="Xem tất cả bài viết trên blog AgriHCM"
          >
            Xem tất cả bài viết →
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-gray-600">
            Hiện chưa có bài viết trên AgriHCM.
          </p>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:shadow-md"
                  aria-label={`Đọc bài: ${post.title} – Blog AgriHCM`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image (left) with date badge */}
                    <div className="relative w-full sm:w-[22rem] shrink-0">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={post.cover_image_alt || `${post.title} – AgriHCM`}
                          className="h-56 w-full object-cover sm:h-full"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-56 w-full items-center justify-center bg-emerald-50 text-emerald-700 sm:h-full">
                          Chưa có ảnh
                        </div>
                      )}

                      <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700 shadow backdrop-blur">
                        {formatDate(post.updated_at || post.created_at)}
                      </span>
                    </div>

                    {/* Text (right) */}
                    <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                      <h3 className="text-xl font-semibold text-emerald-900 transition group-hover:text-emerald-700">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2 text-sm leading-6 text-gray-700 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-4 text-sm font-medium text-emerald-700">
                        Đọc tiếp →
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
