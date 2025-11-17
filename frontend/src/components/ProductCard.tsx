"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

type ProductShort = {
  id: number;
  slug: string;
  name: string;
  price: number;
  primary_image?: string | null;
  is_in_stock?: boolean;
  stock_quantity?: number;
};

export default function ProductCard({ product }: { product: ProductShort }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    setError(null);
    setAdding(true);
    try {
      await addToCart(product.id, 1);

      alert(`Added "${product.name}" to cart.`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="card p-4 border rounded">
      {product.primary_image && (
        <div className="w-full h-40 relative mb-2">
          <Image src={product.primary_image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" />
        </div>
      )}
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-sm">¥{product.price}</p>
      <div className="mt-3">
        <Button
          onClick={handleAdd}
          disabled={adding || !product.is_in_stock || (product.stock_quantity !== undefined && product.stock_quantity <= 0)}
        >
          {adding ? "Adding..." : product.is_in_stock ? "Add to cart" : "Out of stock"}
        </Button>
        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}