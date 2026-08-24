"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPHP } from "@/lib/utils";
import { placeOrder } from "@/lib/api";
import type { OrderResponse } from "@/types";

export default function CheckoutPage() {
  const { lines, totalAmount, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = React.useState<OrderResponse | null>(null);

  if (lines.length === 0 && !completedOrder) {
    router.push("/cart");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await placeOrder({
      customerName: name,
      customerEmail: email,
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Something went wrong placing your order.");
      return;
    }

    setCompletedOrder(result.order!);
    clearCart();
  }

  if (completedOrder) {
    return (
      <div className="mx-auto max-w-lg space-y-6 rounded-keycap border border-base-border bg-base-panel p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent-cyan" />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Order placed!</h1>
          <p className="mt-2 text-ink-muted">
            Reference number: <span className="text-ink">{completedOrder.orderNumber}</span>
          </p>
        </div>
        <p className="text-sm text-ink-faint">
          Total: {formatPHP(completedOrder.totalAmount)} · Status: {completedOrder.status}
        </p>
        <Link href="/">
          <Button variant="secondary">Continue shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <h1 className="font-display text-2xl font-bold text-ink">Checkout</h1>

          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Dela Cruz"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@example.com"
            />
          </div>

          {error && (
            <p className="rounded-keycap border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Placing order..." : `Place order · ${formatPHP(totalAmount)}`}
          </Button>
        </form>
      </div>

      <div className="keycap h-fit space-y-3 p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Order Summary</h2>
        <Separator />
        {lines.map((line) => (
          <div key={line.productId} className="flex justify-between text-sm">
            <span className="text-ink-muted">{line.name} × {line.quantity}</span>
            <span className="text-ink">{formatPHP(line.unitPrice * line.quantity)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-display font-semibold text-ink">
          <span>Total</span>
          <span>{formatPHP(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
