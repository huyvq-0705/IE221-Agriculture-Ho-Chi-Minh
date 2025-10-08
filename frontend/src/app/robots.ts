import type { MetadataRoute } from "next";

const SITE = process.env.SITE_URL || "http://localhost:3000";
const HOST = process.env.HOST || "localhost";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: [`${SITE}/sitemap.xml`],
    host: HOST,
  };
}
