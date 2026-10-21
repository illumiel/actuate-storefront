"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPHP } from "@/lib/utils";
import { placeOrder } from "@/lib/api";
import type { OrderResponse } from "@/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your full name.";
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  return null;
}

function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
  return null;
}

interface FieldErrors {
  name: string | null;
  email: string | null;
}

const NO_FIELD_ERRORS: FieldErrors = { name: null, email: null };

const errorInputClass =
  "border-red-500/60 focus-visible:border-red-500/70 focus-visible:ring-red-500/30";

export default function CheckoutPage() {
  const { lines, totalAmount, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<FieldErrors>(NO_FIELD_ERRORS);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = React.useState<OrderResponse | null>(null);
  const [copied, setCopied] = React.useState(false);

  const nameRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  if (lines.length === 0 && !completedOrder) {
    router.push("/cart");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const nextErrors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
    };
    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.email) {
      const target = nextErrors.name ? nameRef.current : emailRef.current;
      target?.focus();
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);

    const trimmedEmail = email.trim();
    const result = await placeOrder({
      customerName: name.trim(),
      ...(trimmedEmail ? { customerEmail: trimmedEmail } : {}),
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

  async function handleCopy() {
    if (!completedOrder) return;

    try {
      await navigator.clipboard.writeText(completedOrder.orderNumber);
    } catch {
      // Clipboard access can be unavailable (e.g. insecure context);
      // the reference number stays visible to copy manually.
    }

    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  }

  if (completedOrder) {
    const statusLabel =
      completedOrder.status.charAt(0) +
      completedOrder.status.slice(1).toLowerCase();

    return (
      <div className="mx-auto mt-10 max-w-xl space-y-6 rounded-keycap border border-base-border bg-base-panel p-8 text-center sm:p-10">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <span
            aria-hidden="true"
            className="animate-order-ring absolute inset-0 rounded-full bg-accent-cyan/25"
          />
          <span className="animate-order-check relative flex h-14 w-14 items-center justify-center rounded-full bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/30">
            <CheckCircle2 className="h-7 w-7" />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-ink">Order placed</h1>
          <p className="text-sm text-ink-muted">
            We&apos;ve received your order and reserved your items.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            Reference number
          </span>
          <div className="inline-flex items-center gap-2 rounded-keycap border border-base-border bg-base-raised py-1.5 pl-3 pr-1.5">
            <code className="font-mono text-sm text-ink">
              {completedOrder.orderNumber}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-keycap px-2 py-1 text-xs font-medium text-ink-muted transition-colors hover:bg-base-panel hover:text-ink"
              aria-label="Copy order reference number"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-accent-cyan" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <span aria-live="polite" className="sr-only">
            {copied ? "Reference number copied" : ""}
          </span>
        </div>

        <div className="space-y-2 text-left text-sm">
          {completedOrder.items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-4">
              <span className="text-ink-muted">
                {item.productName} × {item.quantity}
              </span>
              <span className="shrink-0 text-ink">{formatPHP(item.subtotal)}</span>
            </div>
          ))}
          <Separator className="my-3" />
          <div className="flex justify-between font-display font-semibold text-ink">
            <span>Total</span>
            <span>{formatPHP(completedOrder.totalAmount)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-muted">Status</span>
          <Badge>{statusLabel}</Badge>
        </div>

        {completedOrder.customerEmail && (
          <p className="text-sm text-ink-muted">
            Contact email:{" "}
            <span className="text-ink">{completedOrder.customerEmail}</span>
          </p>
        )}

        <div className="pt-2">
          <Link href="/">
            <Button size="lg">Continue shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <h1 className="font-display text-2xl font-bold text-ink">Checkout</h1>

          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              ref={nameRef}
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: null }));
                }
              }}
              onBlur={(e) => {
                const message = validateName(e.currentTarget.value);
                setErrors((prev) => ({ ...prev, name: message }));
              }}
              placeholder="Juan Dela Cruz"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={errors.name ? errorInputClass : undefined}
            />
            {errors.name && (
              <p
                id="name-error"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: null }));
                }
              }}
              onBlur={(e) => {
                const message = validateEmail(e.currentTarget.value);
                setErrors((prev) => ({ ...prev, email: message }));
              }}
              placeholder="juan@example.com"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={errors.email ? errorInputClass : undefined}
            />
            {errors.email && (
              <p
                id="email-error"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {errors.email}
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-keycap border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
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
