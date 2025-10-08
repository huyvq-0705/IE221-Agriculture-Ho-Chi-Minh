import type { Metadata } from "next"
import Link from "next/link"
import { HeroSlider } from "@/components/hero-slider"

export const metadata: Metadata = {
  title: "AgriHCM – Practical guides for modern agriculture",
  description:
    "AgriHCM shares practical, beginner-friendly guides on irrigation, soil health, and crop management—curated for Vietnamese growers.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "AgriHCM – Practical guides for modern agriculture",
    description:
      "Beginner-friendly tips on irrigation, soil, and crops—curated for Vietnamese growers.",
    url: "/",
    siteName: "AgriHCM",
    images: [{ url: "/og-home.png" }], 
  },
  twitter: {
    card: "summary_large_image",
    title: "AgriHCM – Practical guides for modern agriculture",
    description:
      "Beginner-friendly tips on irrigation, soil, and crops—curated for Vietnamese growers.",
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
    return new Date(iso).toLocaleDateString(undefined, {
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
      alt: "Irrigated green fields at sunrise",
    },
    {
      src: "https://images.unsplash.com/photo-1617985562309-2aa7781f1608?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Hands holding healthy soil and seedling",
    },
    {
      src: "https://images.unsplash.com/photo-1650449339582-ffc4451ab53c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Farm landscape with irrigation lines",
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-5 pb-14 pt-4 md:pt-6">
      {/* Hero slider */}
      <HeroSlider slides={slides} />

      {/* Blog previews */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-emerald-900">Latest Guides</h2>
          <Link
            href="/blog"
            className="text-sm font-medium text-emerald-700 hover:underline"
          >
            View all →
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-gray-600">No posts yet.</p>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image (left) with date badge */}
                    <div className="relative w-full sm:w-[22rem] shrink-0">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={post.cover_image_alt || post.title}
                          className="h-56 w-full object-cover sm:h-full"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-56 w-full items-center justify-center bg-emerald-50 text-emerald-700 sm:h-full">
                          No image
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
                        Read more →
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
