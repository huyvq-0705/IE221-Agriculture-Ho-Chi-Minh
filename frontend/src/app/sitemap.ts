import type { MetadataRoute } from "next";

export const revalidate = 3600; 

const SITE = process.env.SITE_URL || "http://localhost:3000";
const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";

type BlogItem = {
  slug: string;
  updated_at?: string;
  created_at?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now },
    { url: `${SITE}/about`, lastModified: now },
    { url: `${SITE}/blog`, lastModified: now },
    { url: `${SITE}/products`, lastModified: now },
  ];

  try {
    const res = await fetch(
      `${API_BASE}/api/blogs/?ordering=-updated_at&page_size=100`,

      { next: { revalidate: 3600 } }
    );

    if (res.ok) {
      const data = (await res.json()) as { results: BlogItem[] };

      for (const item of data.results || []) {
        if (!item.slug) continue;

        urls.push({
          url: `${SITE}/blog/${item.slug}`,
          lastModified: new Date(
            item.updated_at || item.created_at || now
          ),
        });
      }
    }
  } catch (err) {
    console.error("[sitemap] Blog API fetch failed:", err);
  }

  return urls;
}
