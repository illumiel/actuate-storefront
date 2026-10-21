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
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatPHP } from "@/lib/utils";
import { placeOrder, type PlaceOrderPayload } from "@/lib/api";
import type { OrderResponse, PaymentMethod } from "@/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(09|\+639)\d{9}$/;
const POSTAL_PATTERN = /^\d{4}$/;

type FieldKey =
  | "name"
  | "phone"
  | "email"
  | "addressLine"
  | "barangay"
  | "city"
  | "province"
  | "postalCode"
  | "deliveryNotes";

type FieldErrors = Partial<Record<FieldKey, string>>;

/** Validation order — also the order we focus fields in. */
const FIELD_ORDER: FieldKey[] = [
  "name",
  "phone",
  "email",
  "addressLine",
  "barangay",
  "city",
  "province",
  "postalCode",
  "deliveryNotes",
];

/** Order Service field names (validationErrors keys) mapped onto our fields. */
const SERVER_FIELD_MAP: Record<string, FieldKey> = {
  customerName: "name",
  customerPhone: "phone",
  customerEmail: "email",
  addressLine: "addressLine",
  barangay: "barangay",
  city: "city",
  province: "province",
  postalCode: "postalCode",
  deliveryNotes: "deliveryNotes",
};

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "COD", label: "Cash on Delivery" },
  { value: "GCASH", label: "GCash" },
  { value: "CARD", label: "Card" },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  COD: "Cash on Delivery",
  GCASH: "GCash",
  CARD: "Card",
};

const errorInputClass =
  "border-red-500/60 focus-visible:border-red-500/70 focus-visible:ring-red-500/30";

function stripPhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your full name.";
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  if (trimmed.length > 150) return "Name must be 150 characters or fewer.";
  return null;
}

function validatePhone(value: string): string | null {
  const stripped = stripPhone(value.trim());
  if (!stripped) return "Please enter your mobile number.";
  if (!PHONE_PATTERN.test(stripped)) {
    return "Enter a valid PH mobile number, e.g. 09171234567";
  }
  return null;
}

function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
  return null;
}

function validateRequired(value: string, message: string): string | null {
  return value.trim() ? null : message;
}

function validatePostalCode(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!POSTAL_PATTERN.test(trimmed)) return "Enter a 4-digit postal code.";
  return null;
}

function validateNotes(value: string): string | null {
  if (value.trim().length > 500) {
    return "Delivery notes must be 500 characters or fewer.";
  }
  return null;
}

function fieldA11y(id: string, message?: string) {
  return {
    "aria-invalid": message ? (true as const) : undefined,
    "aria-describedby": message ? `${id}-error` : undefined,
    className: message ? errorInputClass : undefined,
  };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={`${id}-error`}
      className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function CheckoutPage() {
  const { lines, totalAmount, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [addressLine, setAddressLine] = React.useState("");
  const [barangay, setBarangay] = React.useState("");
  const [city, setCity] = React.useState("");
  const [province, setProvince] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [deliveryNotes, setDeliveryNotes] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("COD");

  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = React.useState<OrderResponse | null>(null);
  const [copied, setCopied] = React.useState(false);

  const nameRef = React.useRef<HTMLInputElement>(null);
  const phoneRef = React.useRef<HTMLInputElement>(null);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const addressLineRef = React.useRef<HTMLInputElement>(null);
  const barangayRef = React.useRef<HTMLInputElement>(null);
  const cityRef = React.useRef<HTMLInputElement>(null);
  const provinceRef = React.useRef<HTMLInputElement>(null);
  const postalCodeRef = React.useRef<HTMLInputElement>(null);
  const notesRef = React.useRef<HTMLTextAreaElement>(null);

  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fieldRefs: Record<
    FieldKey,
    React.RefObject<HTMLInputElement | HTMLTextAreaElement>
  > = {
    name: nameRef,
    phone: phoneRef,
    email: emailRef,
    addressLine: addressLineRef,
    barangay: barangayRef,
    city: cityRef,
    province: provinceRef,
    postalCode: postalCodeRef,
    deliveryNotes: notesRef,
  };

  React.useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  if (lines.length === 0 && !completedOrder) {
    router.push("/cart");
    return null;
  }

  function clearFieldError(key: FieldKey) {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function focusFirstInvalid(source: FieldErrors) {
    const first = FIELD_ORDER.find((key) => source[key]);
    if (!first) return;
    const target = fieldRefs[first].current;
    target?.focus();
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const candidates: [FieldKey, string | null][] = [
      ["name", validateName(name)],
      ["phone", validatePhone(phone)],
      ["email", validateEmail(email)],
      ["addressLine", validateRequired(addressLine, "Please enter your address.")],
      ["barangay", validateRequired(barangay, "Please enter your barangay.")],
      ["city", validateRequired(city, "Please enter your city or municipality.")],
      ["province", validateRequired(province, "Please enter your province.")],
      ["postalCode", validatePostalCode(postalCode)],
      ["deliveryNotes", validateNotes(deliveryNotes)],
    ];

    const nextErrors: FieldErrors = {};
    for (const [key, message] of candidates) {
      if (message) nextErrors[key] = message;
    }
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPostal = postalCode.trim();
    const trimmedNotes = deliveryNotes.trim();

    const payload: PlaceOrderPayload = {
      customerName: name.trim(),
      customerPhone: stripPhone(phone),
      addressLine: addressLine.trim(),
      barangay: barangay.trim(),
      city: city.trim(),
      province: province.trim(),
      paymentMethod,
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    };
    if (trimmedEmail) payload.customerEmail = trimmedEmail;
    if (trimmedPostal) payload.postalCode = trimmedPostal;
    if (trimmedNotes) payload.deliveryNotes = trimmedNotes;

    setSubmitting(true);
    const result = await placeOrder(payload);
    setSubmitting(false);

    if (!result.ok) {
      const mapped: FieldErrors = {};
      for (const [serverKey, message] of Object.entries(result.fieldErrors ?? {})) {
        const key = SERVER_FIELD_MAP[serverKey];
        if (key) mapped[key] = message;
      }

      if (Object.keys(mapped).length > 0) {
        setErrors(mapped);
        focusFirstInvalid(mapped);
      } else {
        setError(result.error ?? "Something went wrong placing your order.");
      }
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

    const addressLocality = [
      completedOrder.barangay,
      completedOrder.city,
      completedOrder.province,
      completedOrder.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

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

        <div className="space-y-3 rounded-keycap border border-base-border bg-base-raised p-5 text-left text-sm">
          <h2 className="font-display text-sm font-semibold text-ink">
            Delivery details
          </h2>
          <div className="space-y-1 text-ink-muted">
            <p className="text-ink">{completedOrder.customerName}</p>
            <p>{completedOrder.customerPhone}</p>
            <p className="pt-1">{completedOrder.addressLine}</p>
            {addressLocality && <p>{addressLocality}</p>}
            {completedOrder.deliveryNotes && (
              <p className="pt-1 text-ink-faint">
                Notes: {completedOrder.deliveryNotes}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-base-border pt-3">
            <span className="text-ink-muted">Payment</span>
            <span className="text-ink">
              {PAYMENT_LABELS[completedOrder.paymentMethod]}
            </span>
          </div>
          {completedOrder.customerEmail && (
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Email</span>
              <span className="text-ink">{completedOrder.customerEmail}</span>
            </div>
          )}
        </div>

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

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
          <h1 className="font-display text-2xl font-bold text-ink">Checkout</h1>

          <section className="space-y-5 rounded-keycap border border-base-border bg-base-panel p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Contact</h2>

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
                  clearFieldError("name");
                }}
                onBlur={(e) => {
                  const message = validateName(e.currentTarget.value);
                  setErrors((prev) => ({ ...prev, name: message ?? undefined }));
                }}
                placeholder="Juan Dela Cruz"
                {...fieldA11y("name", errors.name)}
              />
              <FieldError id="name" message={errors.name} />
            </div>

            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <Input
                ref={phoneRef}
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError("phone");
                }}
                onBlur={(e) => {
                  const message = validatePhone(e.currentTarget.value);
                  setErrors((prev) => ({ ...prev, phone: message ?? undefined }));
                }}
                placeholder="09XX XXX XXXX"
                {...fieldA11y("phone", errors.phone)}
              />
              <FieldError id="phone" message={errors.phone} />
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
                  clearFieldError("email");
                }}
                onBlur={(e) => {
                  const message = validateEmail(e.currentTarget.value);
                  setErrors((prev) => ({ ...prev, email: message ?? undefined }));
                }}
                placeholder="juan@example.com"
                {...fieldA11y("email", errors.email)}
              />
              <FieldError id="email" message={errors.email} />
            </div>
          </section>

          <section className="space-y-5 rounded-keycap border border-base-border bg-base-panel p-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              Delivery address
            </h2>

            <div>
              <Label htmlFor="addressLine">Address line</Label>
              <Input
                ref={addressLineRef}
                id="addressLine"
                name="addressLine"
                autoComplete="street-address"
                value={addressLine}
                onChange={(e) => {
                  setAddressLine(e.target.value);
                  clearFieldError("addressLine");
                }}
                onBlur={(e) => {
                  const message = validateRequired(
                    e.currentTarget.value,
                    "Please enter your address."
                  );
                  setErrors((prev) => ({ ...prev, addressLine: message ?? undefined }));
                }}
                placeholder="House no., street, building"
                {...fieldA11y("addressLine", errors.addressLine)}
              />
              <FieldError id="addressLine" message={errors.addressLine} />
            </div>

            <div>
              <Label htmlFor="barangay">Barangay</Label>
              <Input
                ref={barangayRef}
                id="barangay"
                name="barangay"
                value={barangay}
                onChange={(e) => {
                  setBarangay(e.target.value);
                  clearFieldError("barangay");
                }}
                onBlur={(e) => {
                  const message = validateRequired(
                    e.currentTarget.value,
                    "Please enter your barangay."
                  );
                  setErrors((prev) => ({ ...prev, barangay: message ?? undefined }));
                }}
                placeholder="Barangay"
                {...fieldA11y("barangay", errors.barangay)}
              />
              <FieldError id="barangay" message={errors.barangay} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">City / municipality</Label>
                <Input
                  ref={cityRef}
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    clearFieldError("city");
                  }}
                  onBlur={(e) => {
                    const message = validateRequired(
                      e.currentTarget.value,
                      "Please enter your city or municipality."
                    );
                    setErrors((prev) => ({ ...prev, city: message ?? undefined }));
                  }}
                  placeholder="Quezon City"
                  {...fieldA11y("city", errors.city)}
                />
                <FieldError id="city" message={errors.city} />
              </div>

              <div>
                <Label htmlFor="province">Province</Label>
                <Input
                  ref={provinceRef}
                  id="province"
                  name="province"
                  autoComplete="address-level1"
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    clearFieldError("province");
                  }}
                  onBlur={(e) => {
                    const message = validateRequired(
                      e.currentTarget.value,
                      "Please enter your province."
                    );
                    setErrors((prev) => ({ ...prev, province: message ?? undefined }));
                  }}
                  placeholder="Metro Manila"
                  {...fieldA11y("province", errors.province)}
                />
                <FieldError id="province" message={errors.province} />
              </div>
            </div>

            <div className="sm:max-w-[12rem]">
              <Label htmlFor="postalCode">Postal code (optional)</Label>
              <Input
                ref={postalCodeRef}
                id="postalCode"
                name="postalCode"
                inputMode="numeric"
                autoComplete="postal-code"
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(e.target.value);
                  clearFieldError("postalCode");
                }}
                onBlur={(e) => {
                  const message = validatePostalCode(e.currentTarget.value);
                  setErrors((prev) => ({ ...prev, postalCode: message ?? undefined }));
                }}
                placeholder="1100"
                {...fieldA11y("postalCode", errors.postalCode)}
              />
              <FieldError id="postalCode" message={errors.postalCode} />
            </div>

            <div>
              <Label htmlFor="deliveryNotes">Delivery notes (optional)</Label>
              <Textarea
                ref={notesRef}
                id="deliveryNotes"
                name="deliveryNotes"
                rows={3}
                value={deliveryNotes}
                onChange={(e) => {
                  setDeliveryNotes(e.target.value);
                  clearFieldError("deliveryNotes");
                }}
                onBlur={(e) => {
                  const message = validateNotes(e.currentTarget.value);
                  setErrors((prev) => ({ ...prev, deliveryNotes: message ?? undefined }));
                }}
                placeholder="Landmark or rider instructions"
                {...fieldA11y("deliveryNotes", errors.deliveryNotes)}
              />
              <FieldError id="deliveryNotes" message={errors.deliveryNotes} />
            </div>
          </section>

          <section className="space-y-4 rounded-keycap border border-base-border bg-base-panel p-6">
            <h2 id="payment-heading" className="font-display text-lg font-semibold text-ink">
              Payment
            </h2>

            <div
              role="radiogroup"
              aria-labelledby="payment-heading"
              className="grid gap-3 sm:grid-cols-3"
            >
              {PAYMENT_OPTIONS.map((option) => {
                const selected = paymentMethod === option.value;
                return (
                  <label key={option.value} className="relative block cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={selected}
                      onChange={() => setPaymentMethod(option.value)}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "flex items-center gap-2.5 rounded-keycap border bg-base-raised px-4 py-3 text-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent-violet peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-base",
                        selected
                          ? "border-accent-violet/70 text-ink shadow-keycap-glow"
                          : "border-base-border text-ink-muted hover:border-accent-violet/40 hover:text-ink"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                          selected
                            ? "border-accent-violet bg-accent-violet text-white"
                            : "border-base-border"
                        )}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </span>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>

            <p className="text-xs text-ink-faint">
              Demo store. No payment is actually processed.
            </p>
          </section>

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
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Placing order...
              </>
            ) : (
              `Place order · ${formatPHP(totalAmount)}`
            )}
          </Button>
        </form>
      </div>

      <div className="keycap h-fit space-y-3 p-6 lg:sticky lg:top-24">
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
