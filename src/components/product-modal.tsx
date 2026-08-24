"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/add-to-cart";
import { formatPHP } from "@/lib/utils";
import { getInventory } from "@/lib/api";
import type { ProductWithPrice, InventoryItem } from "@/types";

interface ProductModalProps {
  product: ProductWithPrice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [inventory, setInventory] = React.useState<InventoryItem | null>(null);
  const [isRendered, setIsRendered] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && product) {
      setIsRendered(true);
      requestAnimationFrame(() => setIsAnimating(true));
      getInventory(product.id).then(setInventory);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsRendered(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, product]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isRendered || !product) return null;

  const inStock = (inventory?.availableQuantity ?? 0) > 0;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-200 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-base/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog (True 50/50 split, bigger overall) */}
      <div
        className={`relative w-full max-w-4xl sm:max-w-5xl min-h-[520px] max-h-[92vh] overflow-hidden rounded-keycap border border-base-border bg-base shadow-2xl transition-all duration-200 grid sm:grid-cols-2 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-keycap bg-base/80 backdrop-blur-md border border-base-border text-ink-muted transition-colors hover:text-ink hover:bg-base-raised"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Column: Edge-to-edge product image */}
        <div className="relative w-full h-72 sm:h-full min-h-[300px] bg-base-panel">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-faint text-sm">
              No image available
            </div>
          )}
        </div>

        {/* Right Column: Product details with normal padding */}
        <div className="p-6 sm:p-10 flex flex-col justify-center space-y-6 overflow-y-auto max-h-[92vh]">
          <div className="space-y-1 pr-10">
            <p className="text-xs uppercase tracking-wide text-accent-cyan">{product.brand}</p>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              {product.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline">{product.category}</Badge>
            {inventory && (
              <Badge variant={inStock ? "cyan" : "danger"}>
                {inStock ? `${inventory.availableQuantity} in stock` : "Out of stock"}
              </Badge>
            )}
          </div>

          {product.price && (
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-ink">
                {formatPHP(product.price.finalPrice)}
              </span>
              {product.price.discountPercent > 0 && (
                <span className="text-sm text-ink-faint line-through">
                  {formatPHP(product.price.basePrice)}
                </span>
              )}
            </div>
          )}

          <p className="leading-relaxed text-ink-muted text-sm">{product.description}</p>

          <div className="pt-2">
            {inStock ? (
              <AddToCart product={product} />
            ) : (
              <p className="text-sm text-ink-faint">This item is currently out of stock.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
