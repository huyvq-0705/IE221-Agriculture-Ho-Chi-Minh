import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type HeaderMap = Record<string, string>;
async function authHeaders(): Promise<HeaderMap> {
  const token = (await cookies()).get("accessToken")?.value;
  const h: HeaderMap = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

type BlogListItem = {
  title: string;
  slug: string;
  created_at: string;
  updated_at: string;
  cover_image_url?: string | null;
  cover_image_alt?: string | null;
  social_image_url?: string | null; // from your serializer (fallback already handled server-side)
  social_image_alt?: string | null;
};

type DRFPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

async function getBlogs(search = "", page = 1) {
  try {
    const q = new URLSearchParams({ search, page: String(page), ordering: "-created_at" });
    const headers = new Headers(await authHeaders());
    const data = (await fetchApi(`api/admin/blogs/?${q.toString()}`, {
      headers,
      cache: "no-store",
    })) as DRFPaginated<BlogListItem>;
    return data;
  } catch {
    redirect("/agrihcmAdmin/login");
  }
}

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "-";

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = Array.isArray(sp?.q) ? sp.q[0] ?? "" : sp?.q ?? "";
  const page = Number(Array.isArray(sp?.page) ? sp.page[0] : sp?.page) || 1;

  const data = await getBlogs(q, page);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Blog Posts</h1>
        <Button asChild className="rounded-full">
          <Link href="/agrihcmAdmin/blogs/new">New Post</Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-muted">
                <TableHead className="w-[420px]">Post</TableHead>
                <TableHead className="min-w-[160px]">Created</TableHead>
                <TableHead className="min-w-[160px]">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.results?.map((b) => {
                const img =
                  b.cover_image_url || b.social_image_url || "/placeholder.svg";
                const alt =
                  b.cover_image_alt || b.social_image_alt || b.title || "Cover";
                return (
                  <TableRow key={b.slug} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-24 overflow-hidden rounded-md ring-1 ring-border bg-muted">
                          {/* using <img> so you don’t have to configure next/image remotePatterns */}
                          <img
                            src={img}
                            alt={alt}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/agrihcmAdmin/blogs/${b.slug}`}
                            className="font-medium hover:underline line-clamp-1"
                            title={b.title}
                          >
                            {b.title}
                          </Link>
                          <div
                            className="text-xs text-muted-foreground truncate"
                            title={b.slug}
                          >
                            {b.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {fmt(b.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmt(b.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href={`/agrihcmAdmin/blogs/${b.slug}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!data?.results?.length && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Simple prev/next */}
          <div className="mt-4 flex justify-between">
            <Button asChild variant="outline" className="rounded-full" disabled={!data?.previous}>
              <Link
                href={`/agrihcmAdmin/blogs?${new URLSearchParams({
                  q,
                  page: String(Math.max(1, page - 1)),
                })}`}
              >
                Previous
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full" disabled={!data?.next}>
              <Link
                href={`/agrihcmAdmin/blogs?${new URLSearchParams({
                  q,
                  page: String(page + 1),
                })}`}
              >
                Next
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
