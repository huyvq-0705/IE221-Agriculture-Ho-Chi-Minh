'use server'

const API_BASE = process.env.BACKEND_URL || "http://localhost:8000";

export async function getProductData(slug: string) {
  const res = await fetch(`${API_BASE}/api/products/${slug}/`, {
    cache: "no-store",
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch product ${slug}: ${res.status}`);
  }
  
  return res.json();
}

export async function getRelatedProducts(categoryId: number) {
  const res = await fetch(`${API_BASE}/api/products/?category=${categoryId}`, {
    cache: "no-store",
  });
  
  if (!res.ok) {
    return [];
  }
  
  return res.json();
}
