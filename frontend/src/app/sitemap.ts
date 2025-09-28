
import type { MetadataRoute } from "next";

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";
const SITE = "https://agrihcm.id.vn";

type BlogItem = { slug: string; updated_at: string; created_at: string };
type BlogListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogItem[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  let url = `${API_BASE}/api/blogs/?ordering=-updated_at&page_size=50`;
  const seen = new Set<string>();

  for (let i = 0; i < 50; i++) { 
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) break;
    const data = (await res.json()) as BlogListResponse;

    for (const item of data.results) {
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);
      urls.push({
        url: `${SITE}/blog/${item.slug}`,
        lastModified: new Date(item.updated_at || item.created_at),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    if (!data.next) break;
    url = data.next; 
  }

  return urls;
}
