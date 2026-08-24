"use client";

import * as React from "react";
import { ParallaxHero, type ParallaxLayer } from "@/components/parallax-hero";
import { ProductCatalog } from "@/components/product-catalog";
import { useStore } from "@/context/store-context";
import type { ProductWithPrice } from "@/types";

const heroLayers: ParallaxLayer[] = [
  {
    src: "/images/peripherals/controller.png",
    alt: "Gaming controller",
    depth: 30,
    className: "right-[6%] top-[6%] sm:right-[8%] sm:top-[8%] h-40 w-40 sm:h-44 sm:w-44 rotate-[8deg]",
  },
  {
    src: "/images/peripherals/peripherals.png",
    alt: "Gaming peripherals",
    depth: 22,
    className: "right-[26%] top-[20%] sm:right-[28%] sm:top-[18%] h-32 w-32 sm:h-36 sm:w-36 rotate-[-6deg] opacity-90",
  },
  {
    src: "/images/peripherals/keyboard.png",
    alt: "Mechanical keyboard",
    depth: 16,
    className: "right-[4%] bottom-[4%] sm:right-[6%] sm:bottom-[6%] h-40 w-64 sm:h-48 sm:w-80 rotate-[-4deg]",
  },
];

interface StorefrontProps {
  products: ProductWithPrice[];
  initialCategory?: string;
}

export function Storefront({ products, initialCategory }: StorefrontProps) {
  const { searchQuery } = useStore();
  const query = searchQuery.trim().toLowerCase();

  // Check if search query matches any product brand (case-insensitive exact or substring match)
  const matchedBrandObj = query
    ? products.find((p) => p.brand.toLowerCase() === query || p.brand.toLowerCase().includes(query))
    : null;

  const matchedBrand = matchedBrandObj ? matchedBrandObj.brand : null;

  return (
    <div className="space-y-12">
      <ParallaxHero layers={heroLayers} className="py-14 sm:py-20 min-h-[440px]">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative z-10 max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-cyan">
              {matchedBrand ? `Brand Spotlight • ${matchedBrand}` : "Gear built for actuation"}
            </p>
            {matchedBrand ? (
              <>
                <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl uppercase">
                  <span className="glow-text">{matchedBrand}</span>
                </h1>
                <p className="mt-4 text-ink-muted">
                  Gear from {matchedBrand}, sourced for players who don&apos;t compromise.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
                  Precision peripherals for players who{" "}
                  <span className="glow-text">notice the difference</span>.
                </h1>
                <p className="mt-4 text-ink-muted">
                  Every switch, sensor, and driver here is chosen for one thing: the moment
                  between input and response. That&apos;s where games are won.
                </p>
              </>
            )}
            <p className="mt-6 text-xs text-ink-faint">Move your mouse to see the gear come alive.</p>
          </div>
          <div className="hidden h-72 lg:block" aria-hidden="true" />
        </div>
      </ParallaxHero>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            {matchedBrand ? `${matchedBrand} Catalog` : "Shop the catalog"}
          </h2>
        </div>
        <ProductCatalog products={products} initialCategory={initialCategory} />
      </section>
    </div>
  );
}
