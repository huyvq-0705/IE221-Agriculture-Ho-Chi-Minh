import ProductList from "@/components/productList";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface paginateResult{
  id: number;
  slug: string;
  name: string;
  price: string;
  description?: string;
  primary_image?: string;
  is_in_stock?: boolean;
  stock_quantity?: number;
  average_rating?: number | null;
  review_count?: number;
  category?: Category;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: paginateResult[];
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

    return await res.json();
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

async function getCategories(): Promise<Category[]> {
  try {
    const url = `${API_BASE}/api/categories/`;
    
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const [initialData, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Sản phẩm</h1>
      <ProductList initialData={initialData} categories={categories} />
    </div>
  );
}
