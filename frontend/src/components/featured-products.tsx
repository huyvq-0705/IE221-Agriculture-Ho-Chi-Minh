"use client"; 

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";

// 1. Define the Product interface matching your API response
export interface Product {
  id: number;
  slug: string;
  name: string;
  price: string;
  primary_image?: string;
}

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  // If no products are fetched, hide the section or return null
  if (!products || products.length === 0) {
    return null;
  }

  // 2. Duplicate the list 3 times to ensure the infinite scroll has enough content to loop smoothly
  // If you have very few products (< 4), you might want to duplicate more times (e.g. 6 times)
  const infiniteList = [...products, ...products, ...products];

  // Helper to format VND
  const formatPrice = (price: string) => {
    const amount = parseFloat(price);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <section className="mt-12 overflow-hidden">
      <div className="mb-6 flex items-end justify-between px-1">
        <h2 className="text-2xl font-bold text-emerald-900">
          Sản phẩm nổi bật
        </h2>
        <Link href="/products" className="text-sm font-medium text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
          Cửa hàng <ArrowRight size={16} />
        </Link>
      </div>
      
      <div className="relative w-full overflow-hidden py-4">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 z-10 h-full w-8 md:w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 z-10 h-full w-8 md:w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />

        <div className="flex w-full">
          <motion.div
            className="flex gap-6"
            initial={{ x: 0 }}
            animate={{ x: "-50%" }}
            transition={{ 
              repeat: Infinity, 
              ease: "linear", 
              duration: 40, // Slower duration for better readability
              repeatType: "loop" 
            }}
          >
            {infiniteList.map((item, idx) => (
              <div 
                // Use a combination of ID and Index for unique keys in the duplicated list
                key={`${item.id}-${idx}`} 
                className="group relative w-[200px] md:w-[240px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <Link href={`/products/${item.slug}`}>
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    {item.primary_image ? (
                      <img 
                        src={item.primary_image} 
                        alt={item.name} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400 bg-gray-100">
                        No Image
                      </div>
                    )}
                    
                    {/* Add to cart button (Visual only for now, or link to detail) */}
                    <button className="absolute bottom-2 right-2 rounded-full bg-emerald-600 p-2 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-base font-semibold text-gray-800 group-hover:text-emerald-700">
                      {item.name}
                    </h3>
                    <p className="mt-1 font-bold text-emerald-600">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}