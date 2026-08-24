"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import { getAllProducts, getPrice } from "@/lib/api";
import { ProductModal } from "@/components/product-modal";
import type { ProductWithPrice } from "@/types";

export function Navbar() {
  const { totalItems } = useCart();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [products, setProducts] = React.useState<ProductWithPrice[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<ProductWithPrice | null>(null);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    getAllProducts().then(async (rawProducts) => {
      const withPrices = await Promise.all(
        rawProducts.map(async (p) => ({
          ...p,
          price: await getPrice(p.id),
        }))
      );
      setProducts(withPrices);
    }).catch(() => {});
  }, []);

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
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmedQuery) ||
          p.brand.toLowerCase().includes(trimmedQuery)
      ).slice(0, 8)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 gap-4">
        {/* Logo Mark + Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
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
          <span className="font-display text-xl font-bold tracking-tight text-ink lowercase">
            actuate
          </span>
        </Link>

        {/* Search & Cart */}
        <div className="flex items-center gap-3 flex-1 justify-end max-w-md">
          <div ref={searchRef} className="relative flex items-center w-full max-w-xs sm:max-w-sm">
            <Search className="absolute left-3 h-4 w-4 text-ink-faint pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search gear or brand (Press Enter)..."
              className="w-full h-10 pl-9 pr-8 rounded-keycap border border-base-border bg-base-panel text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent-violet/50 transition-colors"
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
              <div className="absolute left-0 right-0 top-full mt-2 rounded-keycap border border-base-border bg-base-raised shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                {matchingProducts.length > 0 ? (
                  <div className="divide-y divide-base-border">
                    {matchingProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsFocused(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-base-panel/80 cursor-pointer"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-keycap bg-base-panel border border-base-border">
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-sm font-semibold text-ink truncate">{p.name}</p>
                          <p className="text-xs text-ink-faint uppercase tracking-wide">{p.brand}</p>
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
              <Badge className="absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1">
                {totalItems}
              </Badge>
            )}
          </Link>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </header>
  );
}
