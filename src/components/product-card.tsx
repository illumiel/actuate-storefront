"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
import { cn, formatPHP } from "@/lib/utils";
import type { ProductWithPrice } from "@/types";

interface ProductCardProps {
  product: ProductWithPrice;
  onSelect?: (product: ProductWithPrice) => void;
  /** Part of the newest ids in the catalog — shows the "New" badge. */
  isNew?: boolean;
  /**
   * Only pass this when inventory has already been fetched for the product.
   * Passing it opts the card into the "Low stock" badge.
   */
  availableQuantity?: number;
}

export function ProductCard({
  product,
  onSelect,
  isNew = false,
  availableQuantity,
}: ProductCardProps) {
  const discount = product.price?.discountPercent ?? 0;
  const hasDiscount = discount > 0;
  const showLowStock =
    typeof availableQuantity === "number" && availableQuantity <= 5;
  const showBadges = hasDiscount || isNew || showLowStock;

  return (
    <Link
      href={`/products/${product.id}`}
      onClick={(e) => {
        if (onSelect) {
          e.preventDefault();
          onSelect(product);
        }
      }}
      className="block h-full"
    >
      <Card className="group h-full cursor-pointer relative">
        <div className="relative aspect-square overflow-hidden rounded-t-keycap bg-base-panel">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 70vw, 25vw"
          />

          {showBadges && (
            <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
              {hasDiscount && <Badge variant="cyan">Sale</Badge>}
              {isNew && <Badge>New</Badge>}
              {showLowStock && <Badge variant="danger">Low stock</Badge>}
            </div>
          )}
        </div>

        <CardContent>
          <p className="text-xs uppercase tracking-wide text-ink-faint">{product.brand}</p>
          <h3 className="mt-1 line-clamp-1 font-display text-sm font-semibold text-ink">
            {product.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            {product.price ? (
              <>
                {hasDiscount && (
                  <span className="text-xs text-ink-faint line-through">
                    {formatPHP(product.price.basePrice)}
                  </span>
                )}
                <span
                  className={cn(
                    "font-display text-base font-bold",
                    hasDiscount ? "text-accent-cyan" : "text-ink"
                  )}
                >
                  {formatPHP(product.price.finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="rounded-full bg-accent-cyan/15 px-2 py-0.5 text-[11px] font-semibold text-accent-cyan">
                    -{discount}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-ink-faint">Price unavailable</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
