"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/add-to-cart";
import { ProductImage } from "@/components/product-image";
import { formatPHP } from "@/lib/utils";
import { getInventory } from "@/lib/api";
import type { ProductWithPrice, InventoryItem } from "@/types";

interface ProductModalProps {
  product: ProductWithPrice | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

export function ProductModal({
  product,
  isOpen,
  isLoading = false,
  onClose,
  onAdded,
}: ProductModalProps) {
  const [inventory, setInventory] = React.useState<InventoryItem | null>(null);
  const [isRendered, setIsRendered] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const titleId = "product-modal-title";

  // Mount delay for the enter animation, and keep mounted briefly for the exit.
  React.useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const frame = requestAnimationFrame(() => setIsAnimating(true));
      return () => cancelAnimationFrame(frame);
    }
    setIsAnimating(false);
    const timer = setTimeout(() => setIsRendered(false), 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Load inventory for whatever product is being shown.
  React.useEffect(() => {
    if (!product) {
      setInventory(null);
      return;
    }
    let cancelled = false;
    getInventory(product.id).then((result) => {
      if (!cancelled) setInventory(result);
    });
    return () => {
      cancelled = true;
    };
  }, [product]);

  // Lock body scroll while open, restoring the previous value on close.
  React.useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Escape closes.
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Move focus into the dialog once it has animated in.
  React.useEffect(() => {
    if (isOpen && isAnimating) dialogRef.current?.focus();
  }, [isOpen, isAnimating]);

  if (!isRendered) return null;

  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const inStock = (inventory?.availableQuantity ?? 0) > 0;
  const showProduct = !!product;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop (pointer-events-none so the outer container handles clicks) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-base/80 backdrop-blur-sm transition-opacity duration-200 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={showProduct ? titleId : undefined}
        aria-label={showProduct ? undefined : "Product details"}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
        className={`relative z-10 grid w-full max-w-4xl sm:max-w-5xl max-h-[90vh] overflow-y-auto rounded-keycap border border-base-border bg-base shadow-2xl outline-none transition-all duration-200 sm:min-h-[540px] sm:overflow-hidden sm:grid-cols-2 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-keycap border border-base-border bg-base/80 text-ink-muted backdrop-blur-md transition-colors hover:bg-base-raised hover:text-ink"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading && !showProduct ? (
          <div className="col-span-full flex min-h-[320px] items-center justify-center text-sm text-ink-faint">
            Loading product&hellip;
          </div>
        ) : showProduct ? (
          <>
            {/* Left column: edge-to-edge product image */}
            <div className="relative h-64 w-full bg-base-panel sm:h-full sm:min-h-[300px]">
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Right column: details with normal padding */}
            <div className="flex flex-col justify-center space-y-6 p-6 sm:max-h-[90vh] sm:overflow-y-auto sm:p-10">
              <div className="space-y-1 pr-10">
                <p className="text-xs uppercase tracking-wide text-accent-cyan">{product.brand}</p>
                <h2 id={titleId} className="font-display text-2xl font-bold text-ink sm:text-3xl">
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

              <p className="text-sm leading-relaxed text-ink-muted">{product.description}</p>

              <div className="pt-2">
                {inStock ? (
                  <AddToCart product={product} onAdded={onAdded} />
                ) : (
                  <p className="text-sm text-ink-faint">This item is currently out of stock.</p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
