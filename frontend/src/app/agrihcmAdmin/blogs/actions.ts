"use server";

import { cookies } from "next/headers";
import { fetchApi } from "@/lib/api";

type ActionResult = { ok: true; message?: string } | { ok: false; message: string };
type HeaderMap = Record<string, string>;

async function authHeaders(): Promise<HeaderMap> {
  const token = (await cookies()).get("accessToken")?.value;
  const h: HeaderMap = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function parseProductId(value: any): number | null {
  if (!value || value === "" || value === "0") return null;
  return Number(value);
}

export async function createBlog(_prev: any, formData: FormData): Promise<ActionResult> {
  try {
    const payload: any = Object.fromEntries(formData);
    
    payload.related_product_id = parseProductId(payload.related_product_id);

    await fetchApi("api/admin/blogs/", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    return { ok: true, message: "Created" };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Create failed" };
  }
}

export async function updateBlog(_prev: any, formData: FormData): Promise<ActionResult> {
  try {
    const payload: any = Object.fromEntries(formData);
    const slug = String(payload.slug);
    delete payload.slug;

    payload.related_product_id = parseProductId(payload.related_product_id);

    await fetchApi(`api/admin/blogs/${encodeURIComponent(slug)}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    return { ok: true, message: "Updated" };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Update failed" };
  }
}

export async function deleteBlog(slug: string): Promise<ActionResult> {
  try {
    await fetchApi(`api/admin/blogs/${encodeURIComponent(slug)}/`, {
      method: "DELETE",
      headers: await authHeaders(),
      cache: "no-store",
    });
    return { ok: true, message: "Deleted" };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Delete failed" };
  }
}