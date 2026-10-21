"use client";

import * as React from "react";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import type { ProductWithPrice } from "@/types";

interface AddToCartProps {
  product: ProductWithPrice;
  /** Called after the "Added to cart" confirmation. Used by the modal to close and toast. */
  onAdded?: () => void;
}

export function AddToCart({ product, onAdded }: AddToCartProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  if (!product.price) {
    return <p className="text-sm text-ink-faint">Price not available for this item yet.</p>;
  }

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        unitPrice: product.price!.finalPrice,
        originalPrice: product.price!.basePrice,
      },
      quantity
    );
    setAdded(true);
    // In the modal, close shortly after the confirmation; on a page, just reset.
    const delay = onAdded ? 500 : 1500;
    window.setTimeout(() => {
      setAdded(false);
      onAdded?.();
    }, delay);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-keycap border border-base-border bg-base-panel">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-11 w-10 items-center justify-center text-ink-muted transition-colors hover:text-ink"
          aria-label="Decrease quantity"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-medium text-ink">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="flex h-11 w-10 items-center justify-center text-ink-muted transition-colors hover:text-ink"
          aria-label="Increase quantity"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <Button onClick={handleAdd} size="lg" className="flex-1">
        {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
        {added ? "Added to cart" : "Add to cart"}
      </Button>
    </div>
  );
}
