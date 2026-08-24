"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPHP } from "@/lib/utils";
import type { ProductWithPrice } from "@/types";

interface ProductCardProps {
  product: ProductWithPrice;
  onSelect?: (product: ProductWithPrice) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const hasDiscount = (product.price?.discountPercent ?? 0) > 0;

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
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-faint text-xs">
              No image
            </div>
          )}
          {hasDiscount && (
            <Badge variant="cyan" className="absolute left-3 top-3">
              -{product.price!.discountPercent}%
            </Badge>
          )}
        </div>
        <CardContent>
          <p className="text-xs uppercase tracking-wide text-ink-faint">{product.brand}</p>
          <h3 className="mt-1 line-clamp-1 font-display text-sm font-semibold text-ink">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            {product.price ? (
              <span className="font-display text-base font-bold text-ink">
                {formatPHP(product.price.finalPrice)}
              </span>
            ) : (
              <span className="text-xs text-ink-faint">Price unavailable</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
