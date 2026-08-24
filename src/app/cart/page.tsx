"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPHP } from "@/lib/utils";

export default function CartPage() {
  const { lines, updateQuantity, removeItem, totalAmount } = useCart();

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

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="font-display text-2xl font-bold text-ink">Your Cart</h1>
        {lines.map((line) => (
          <div
            key={line.productId}
            className="keycap flex items-center gap-4 p-4"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-keycap bg-base-panel">
              {line.imageUrl && (
                <Image src={line.imageUrl} alt={line.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-display text-sm font-semibold text-ink">{line.name}</p>
              <p className="mt-1 text-sm text-ink-muted">{formatPHP(line.unitPrice)}</p>
            </div>
            <div className="flex items-center rounded-keycap border border-base-border bg-base-panel">
              <button
                onClick={() => updateQuantity(line.productId, line.quantity - 1)}
                className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-ink transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-7 text-center text-sm text-ink">{line.quantity}</span>
              <button
                onClick={() => updateQuantity(line.productId, line.quantity + 1)}
                className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-ink transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="w-24 text-right font-display text-sm font-semibold text-ink">
              {formatPHP(line.unitPrice * line.quantity)}
            </p>
            <button
              onClick={() => removeItem(line.productId)}
              className="text-ink-faint transition-colors hover:text-red-400 p-2"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="keycap h-fit space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Order Summary</h2>
        <Separator />
        <div className="flex justify-between text-sm text-ink-muted">
          <span>Subtotal</span>
          <span className="text-ink">{formatPHP(totalAmount)}</span>
        </div>
        <p className="text-xs text-ink-faint">
          Shipping and taxes calculated at checkout.
        </p>
        <Link href="/checkout">
          <Button className="w-full" size="lg">
            Checkout <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
