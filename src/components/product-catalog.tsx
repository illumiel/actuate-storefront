"use client";

import * as React from "react";
import { ProductCard } from "@/components/product-card";
import { useProductModal } from "@/components/product-modal-provider";
import { cn } from "@/lib/utils";
import type { ProductWithPrice } from "@/types";

const CATEGORIES = [
  { label: "All", value: null },
  { label: "Keyboards", value: "KEYBOARD" },
  { label: "Mice", value: "MOUSE" },
  { label: "Headsets", value: "HEADSET" },
  { label: "Monitors", value: "MONITOR" },
  { label: "Controllers", value: "CONTROLLER" },
  { label: "Mousepads", value: "MOUSEPAD" },
];

interface ProductCatalogProps {
  products: ProductWithPrice[];
  initialCategory?: string;
}

export function ProductCatalog({ products, initialCategory }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    initialCategory ?? null
  );
  const { openProduct } = useProductModal();

  const filtered = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <div className="space-y-6">
      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "cursor-pointer rounded-keycap border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-accent-violet/50 bg-accent-violet/10 text-accent-violet"
                  : "border-base-border bg-base-panel text-ink-muted hover:border-accent-violet/40 hover:bg-base-raised hover:text-ink"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-keycap border border-dashed border-base-border py-20 text-center text-ink-faint">
          No products match your search or filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => openProduct(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
