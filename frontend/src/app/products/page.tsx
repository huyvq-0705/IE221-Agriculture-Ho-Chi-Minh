// ===== src/app/products/page.tsx =====
import ProductList from "@/components/productList";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

async function getProducts(): Promise<PaginatedResponse> {
  try {
    const url = `${API_BASE}/api/products/?page=1`;
    
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
}

export default async function ProductsPage() {
  const initialData = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Sản phẩm</h1>
      <ProductList initialData={initialData} />
    </div>
  );
}
