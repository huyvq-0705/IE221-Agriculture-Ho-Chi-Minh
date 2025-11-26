import Link from "next/link"
import { notFound } from "next/navigation"
import DOMPurify from "isomorphic-dompurify"
import { ArrowLeft, Facebook, Linkedin, Twitter, ShoppingBag } from "lucide-react"

type BlogPost = {
  id: number
  title: string
  slug: string
  meta_description: string | null
  excerpt: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  content: string | null
  created_at: string
  updated_at: string
  seo_title: string
  seo_description: string
  social_image_url: string | null
  social_image_alt: string | null
  absolute_url?: string
  // Added related product field
  related_product: {
    id: number
    name: string
    slug: string
    price: string | number
    is_in_stock: boolean
  } | null
}

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000"
const SITE_ORIGIN = process.env.SITE_URL || "http://localhost:3000"

// ---- Lấy dữ liệu bài viết (SSR) ----
async function getPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${API_BASE}/api/blogs/${slug}/`, { cache: "no-store" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Không thể tải bài viết.")
  return res.json()
}

// ---- SEO (Metadata API) ----
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Không tìm thấy bài viết" }

  const canonical = `${SITE_ORIGIN}/blog/${post.slug}`
  const title = post.seo_title || `${post.title} – Blog AgriHCM`
  const description =
    post.seo_description ||
    post.meta_description ||
    "Bài viết chia sẻ kiến thức nông nghiệp hiện đại từ AgriHCM."

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: "AgriHCM",
      images: post.social_image_url
        ? [{ url: post.social_image_url, alt: post.social_image_alt || title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.social_image_url ? [post.social_image_url] : undefined,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return notFound()

  // ---- Làm sạch nội dung HTML ----
  const SAFE_TAGS = [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "em",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "hr",
    "br",
    "img",
    "figure",
    "figcaption",
    "a",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "span",
    "div",
  ]
  const SAFE_ATTR = [
    "href",
    "title",
    "rel",
    "target",
    "src",
    "alt",
    "width",
    "height",
    "loading",
    "decoding",
    "class",
    "style",
    "id",
  ]
  const safeHtml = DOMPurify.sanitize(post.content || "", {
    ALLOWED_TAGS: SAFE_TAGS,
    ALLOWED_ATTR: SAFE_ATTR,
  })

  // ---- Xử lý ảnh và chú thích ----
  const FIGURE_CLASS =
    "my-6 [&>img]:rounded-2xl [&>img]:shadow-xl [&>img]:w-full"
  const CAPTION_CLASS = "mt-2 text-center text-sm text-gray-500"

  function escapeHtml(s: string) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  function enhanceImages(html: string) {
    const placeholders: string[] = []
    let tmp = html.replace(/<figure[\s\S]*?<\/figure>/gi, (m) => {
      const token = `__FIG_PLACEHOLDER_${placeholders.length}__`
      placeholders.push(m)
      return token
    })

    tmp = tmp.replace(/<img\b([^>]*)>/gi, (_m, attrs: string) => {
      const altMatch = attrs.match(/\balt\s*=\s*(['"])(.*?)\1/i)
      const alt = altMatch ? altMatch[2] : ""
      const imgTag = `<img ${attrs.trim()} />`
      const caption = alt
        ? `<figcaption class="${CAPTION_CLASS}">${escapeHtml(
            alt
          )}</figcaption>`
        : ""
      return `<figure class="${FIGURE_CLASS}">${imgTag}${caption}</figure>`
    })

    return tmp.replace(/__FIG_PLACEHOLDER_(\d+)__/g, (_m, i) => placeholders[Number(i)])
  }

  const enhancedHtml = enhanceImages(safeHtml)

  // ---- Thông tin meta UI ----
  const plain = enhancedHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  const words = plain ? plain.split(" ").length : 0
  const readingMinutes = Math.max(1, Math.ceil(words / 200))
  const publishedISO = post.updated_at || post.created_at
  const publishedHuman = new Date(publishedISO).toLocaleDateString("vi-VN")
  const canonicalUrl = `${SITE_ORIGIN}/blog/${post.slug}`

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:py-12">
      {/* Liên kết trở về */}
      <nav className="mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Blog AgriHCM
        </Link>
      </nav>

      {/* Hero của bài viết */}
      <section
        className="relative overflow-hidden rounded-2xl border border-emerald-100 shadow-xl"
        style={{
          backgroundImage: post.social_image_url
            ? `url(${post.social_image_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "18rem",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        {!post.social_image_url && (
          <div className="absolute inset-0 bg-emerald-600/20" />
        )}

        <div className="relative z-10 p-6 md:p-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur">
              {publishedHuman}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur">
              Khoảng {readingMinutes} phút đọc
            </span>
          </div>
          <h1 className="max-w-3xl text-balance text-3xl font-semibold leading-tight text-white md:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-3 max-w-2xl text-pretty text-sm text-white/90 md:text-base">
              {post.excerpt}
            </p>
          )}
        </div>
      </section>

      {/* Nội dung bài viết */}
      <article className="mt-8">
        <div
          className="
            [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-10 [&>h1]:mb-4
            [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:border-l-4 [&>h2]:border-emerald-400 [&>h2]:pl-3
            [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-2
            [&>p]:mb-4 [&>p]:text-base
            [&>ul]:list-disc [&>ul]:list-inside [&>ul]:space-y-2
            [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:space-y-2
            [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-500 [&>blockquote]:pl-4 [&>blockquote]:italic
            [&>a]:text-emerald-600 [&>a]:underline hover:[&>a]:text-emerald-700
            [&_figure]:my-6
            [&_figure>img]:rounded-2xl [&_figure>img]:shadow-xl [&_figure>img]:w-full
            [&_figure>figcaption]:mt-2 [&_figure>figcaption]:text-center [&_figure>figcaption]:text-sm [&_figure>figcaption]:text-gray-500
          "
          dangerouslySetInnerHTML={{ __html: enhancedHtml }}
        />
      </article>

      {/* --- PRODUCT CARD (Shadcn-like style) --- */}
      {post.related_product && (
        <div className="my-10 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-md">
          <div className="border-b border-emerald-100 bg-emerald-50/50 px-6 py-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-900">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              Sản phẩm liên quan
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {post.related_product.name}
                  </span>
                  {post.related_product.is_in_stock ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                      Còn hàng
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Hết hàng
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(post.related_product.price))}
                </p>
              </div>
              <Link
                href={`/products/${post.related_product.slug}`}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Chia sẻ bài viết */}
      <aside className="mt-10 flex flex-col items-start justify-between gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-900">
            Chia sẻ bài viết này
          </p>
          <p className="text-xs text-emerald-800/80">{canonicalUrl}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700 shadow hover:bg-emerald-50"
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              canonicalUrl
            )}&text=${encodeURIComponent(post.title + " – AgriHCM")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className="h-4 w-4" /> X/Twitter
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700 shadow hover:bg-emerald-50"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              canonicalUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Facebook className="h-4 w-4" /> Facebook
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700 shadow hover:bg-emerald-50"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              canonicalUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
        </div>
      </aside>

      {/* Tailwind safelist helper */}
      <div className="hidden">
        <span className="my-6 [&>img]:rounded-2xl [&>img]:shadow-xl [&>img]:w-full" />
        <span className="mt-2 text-center text-sm text-gray-500" />
      </div>
    </main>
  )
}