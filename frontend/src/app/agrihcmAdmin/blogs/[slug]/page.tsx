import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";
import BlogForm from "@/components/blogForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteBlog, updateBlog } from "../actions";
import { Button } from "@/components/ui/button";

type HeaderMap = Record<string, string>;
async function authHeaders(): Promise<HeaderMap> {
  const token = (await cookies()).get("accessToken")?.value;
  const h: HeaderMap = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function getBlog(slug: string) {
  try {
    const headers = new Headers(await authHeaders());
    return await fetchApi(`api/admin/blogs/${encodeURIComponent(slug)}/`, {
      headers,
      cache: "no-store",
    });
  } catch {
    redirect("/agrihcmAdmin/login");
  }
}

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // 👈 await first
  const data = await getBlog(slug);

  async function handleDelete() {
    "use server";
    const res = await deleteBlog(slug);
    if (res.ok) redirect("/agrihcmAdmin/blogs");
  }

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle>Edit: {data?.title}</CardTitle>
        <form action={handleDelete}>
          <Button type="submit" variant="destructive">Delete</Button>
        </form>
      </CardHeader>
      <CardContent>
        <BlogForm initial={data} submitText="Save changes" onSubmit={updateBlog} />
      </CardContent>
    </Card>
  );
}
