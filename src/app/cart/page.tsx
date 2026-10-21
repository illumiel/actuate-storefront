"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product-image";
import { Separator } from "@/components/ui/separator";
import { formatPHP } from "@/lib/utils";

export default function CartPage() {
  const { lines, updateQuantity, removeItem, totalItems, totalAmount } = useCart();

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-keycap border border-dashed border-base-border py-24 text-center">
        <p className="text-ink-muted">Your cart is empty.</p>
        <Link href="/">
          <Button variant="secondary">Browse the catalog</Button>
        </Link>
      </div>
    );
  }

  // Old localStorage entries have no originalPrice, so they simply show no savings.
  const savings = lines.reduce(
    (sum, line) =>
      sum + Math.max(0, (line.originalPrice ?? line.unitPrice) - line.unitPrice) * line.quantity,
    0
  );
  const subtotal = lines.reduce(
    (sum, line) => sum + (line.originalPrice ?? line.unitPrice) * line.quantity,
    0
  );

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="font-display text-2xl font-bold text-ink">Your Cart</h1>
        {lines.map((line) => {
          const hasDiscount =
            typeof line.originalPrice === "number" && line.originalPrice > line.unitPrice;

          return (
            <div key={line.productId} className="keycap p-4">
              <div className="flex gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-keycap bg-base-panel">
                  <ProductImage
                    src={line.imageUrl}
                    alt={line.name}
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold text-ink">
                    {line.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="text-ink-muted">{formatPHP(line.unitPrice)}</span>
                    {hasDiscount && (
                      <span className="text-xs text-ink-faint line-through">
                        {formatPHP(line.originalPrice!)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeItem(line.productId)}
                  className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-keycap text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
                  aria-label={`Remove ${line.name} from cart`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 border-t border-base-border pt-4">
                <div className="flex items-center rounded-keycap border border-base-border bg-base-panel">
                  <button
                    onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-ink"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-7 text-center text-sm text-ink">{line.quantity}</span>
                  <button
                    onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-ink"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="font-display text-sm font-semibold text-ink">
                  {formatPHP(line.unitPrice * line.quantity)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="keycap h-fit space-y-4 p-6 lg:sticky lg:top-24">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Order summary</h2>
          <p className="mt-1 text-xs text-ink-faint">
            {lines.length} {lines.length === 1 ? "product" : "products"} · {totalItems}{" "}
            {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-ink-muted">
            <span>Subtotal</span>
            <span className="text-ink">{formatPHP(subtotal)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-ink-muted">
              <span>You save</span>
              <span className="text-accent-cyan">−{formatPHP(savings)}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink">Total</span>
          <span className="font-display text-xl font-bold text-ink">
            {formatPHP(totalAmount)}
          </span>
        </div>

        <Link href="/checkout" className="mt-6 block">
          <Button className="w-full" size="lg">
            Checkout <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
