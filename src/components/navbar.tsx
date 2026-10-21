"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Search, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/product-image";
import { getAllProducts, getPrice } from "@/lib/api";
import { useProductModal } from "@/components/product-modal-provider";
import type { ProductWithPrice } from "@/types";

export function Navbar() {
  const { totalItems } = useCart();
  const { openProduct } = useProductModal();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");
  const [products, setProducts] = React.useState<ProductWithPrice[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const [badgeBump, setBadgeBump] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previousTotal = React.useRef(totalItems);

  React.useEffect(() => {
    getAllProducts()
      .then(async (rawProducts) => {
        const withPrices = await Promise.all(
          rawProducts.map(async (p) => ({
            ...p,
            price: await getPrice(p.id),
          }))
        );
        setProducts(withPrices);
      })
      .catch(() => {});
  }, []);

  // Clear the search text whenever the route changes.
  React.useEffect(() => {
    setQuery("");
    setIsFocused(false);
  }, [pathname]);

  // Bump the cart badge when the item count increases.
  React.useEffect(() => {
    if (totalItems > previousTotal.current) {
      setBadgeBump(true);
      const timer = setTimeout(() => setBadgeBump(false), 350);
      previousTotal.current = totalItems;
      return () => clearTimeout(timer);
    }
    previousTotal.current = totalItems;
  }, [totalItems]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmedQuery = query.trim().toLowerCase();

  const matchingProducts = trimmedQuery
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(trimmedQuery) ||
            p.brand.toLowerCase().includes(trimmedQuery)
        )
        .slice(0, 8)
    : [];

  const handleSelect = (product: ProductWithPrice) => {
    setIsFocused(false);
    setQuery("");
    inputRef.current?.blur();
    openProduct(product);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "Enter") {
      if (!trimmedQuery) return;
      const matched = products.find(
        (p) =>
          p.brand.toLowerCase() === trimmedQuery ||
          p.brand.toLowerCase().replace(/\s+/g, "") === trimmedQuery.replace(/\s+/g, "")
      );

      if (matched) {
        setIsFocused(false);
        router.push(`/brands/${encodeURIComponent(matched.brand.toLowerCase())}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-base-border bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        {/* Logo Mark + Wordmark */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-200 group-hover:scale-105"
          >
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C5CFC" />
                <stop offset="100%" stopColor="#3DF2C4" />
              </linearGradient>
            </defs>
            <rect
              x="3"
              y="3"
              width="26"
              height="26"
              rx="7"
              fill="url(#logo-grad)"
              fillOpacity="0.15"
              stroke="url(#logo-grad)"
              strokeWidth="2"
            />
            <path
              d="M16 10V22M10 16H22"
              stroke="url(#logo-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-display text-xl font-bold lowercase tracking-tight text-ink">
            actuate
          </span>
        </Link>

        {/* Search & Cart */}
        <div className="flex max-w-md flex-1 items-center justify-end gap-3">
          <div
            ref={searchRef}
            className="relative flex w-full max-w-xs items-center sm:max-w-sm"
            onBlur={(e) => {
              if (!searchRef.current?.contains(e.relatedTarget as Node)) {
                setIsFocused(false);
              }
            }}
          >
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-faint" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search gear or brand (Press Enter)..."
              className="h-10 w-full rounded-keycap border border-base-border bg-base-panel pl-9 pr-8 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-accent-violet/50 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 text-ink-faint hover:text-ink"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {isFocused && trimmedQuery.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-keycap border border-base-border bg-base-raised shadow-xl">
                {matchingProducts.length > 0 ? (
                  <div className="divide-y divide-base-border">
                    {matchingProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(p)}
                        className="flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors hover:bg-base-panel/80"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-keycap border border-base-border bg-base-panel">
                          <ProductImage src={p.imageUrl} alt={p.name} sizes="40px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-sm font-semibold text-ink">
                            {p.name}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-ink-faint">
                            {p.brand}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-ink-faint">
                    No matching gear found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Icon Link */}
          <Link
            href="/cart"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-keycap border border-base-border bg-base-panel transition-colors hover:border-accent-violet/50"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4 text-ink" />
            {totalItems > 0 && (
              <Badge
                className={`absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1 ${
                  badgeBump ? "animate-badge-bump" : ""
                }`}
              >
                {totalItems}
              </Badge>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
