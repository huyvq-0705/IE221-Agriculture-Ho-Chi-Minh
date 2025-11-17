const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function jsonRequest(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  const text = await res.text();
  let payload: any = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }

  if (!res.ok) {
    const errMsg = (payload && (payload.error || payload.message)) || res.statusText;
    const err = new Error(String(errMsg));
    err.payload = payload;
    throw err;
  }

  return payload;
}

export type Cart = {
  id: number;
  items: Array<{
    id: number;
    product: {
      id: number;
      slug: string;
      name: string;
      price: number | string;
      primary_image?: string | null;
    };
    quantity: number;
    subtotal: number;
  }>;
  total_items: number;
  total_price: number;
  updated_at?: string;
};

export async function addToCart(product_id: number, quantity = 1) {
  return jsonRequest("/api/cart/add/", {
    method: "POST",
    body: JSON.stringify({ product_id, quantity }),
  }) as Promise<Cart>;
}

export async function getCart() {
  return jsonRequest("/api/cart/") as Promise<Cart>;
}

export async function getCartSummary() {
  return jsonRequest("/api/cart/summary/") as Promise<{ total_items: number; total_price: number }>;
}

export async function updateCartItem(product_id: number, quantity: number) {
  return jsonRequest("/api/cart/update/", {
    method: "POST",
    body: JSON.stringify({ product_id, quantity }),
  }) as Promise<Cart>;
}

export async function removeFromCart(product_id: number) {
  return jsonRequest("/api/cart/remove/", {
    method: "POST",
    body: JSON.stringify({ product_id }),
  }) as Promise<Cart>;
}

export async function clearCart() {
  return jsonRequest("/api/cart/clear/", { method: "POST" });
}