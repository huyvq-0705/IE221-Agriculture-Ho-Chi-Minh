import Link from "next/link";

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";

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
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogItem[];
};

async function getBlogs(): Promise<BlogListResponse> {
  const res = await fetch(`${API_BASE}/api/blogs/?ordering=-updated_at&page_size=20`, {
    next: { revalidate: 60 }, // cache for 60s; tweak as you like
  });
  if (!res.ok) throw new Error("Failed to load blogs");
  return res.json();
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function BlogIndexPage() {
  const data = await getBlogs();
  const posts = data.results;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-emerald-800">Blog</h1>

      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image (left) */}
                <div className="relative w-full sm:w-[22rem] shrink-0">
                  {/* Keep <img> to avoid Next Image domain config; switch to <Image> if you prefer */}
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

                  {/* Date badge on image */}
                  <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700 shadow backdrop-blur">
                    {formatDate(post.updated_at || post.created_at)}
                  </span>
                </div>

                {/* Text (right) */}
                <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                  <h2 className="text-xl font-semibold text-emerald-900 transition group-hover:text-emerald-700">
                    {post.title}
                  </h2>
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
    </main>
  );
}