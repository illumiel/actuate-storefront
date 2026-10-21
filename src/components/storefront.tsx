"use client";

import type { ParallaxLayer } from "@/components/parallax-hero";
import { HeroCarousel } from "@/components/hero-carousel";
import { DepartmentRow } from "@/components/department-row";
import { ImageMosaic } from "@/components/image-mosaic";
import { ProductCatalog } from "@/components/product-catalog";
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
  const parallaxContent = (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="relative z-10 max-w-xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-cyan">
          Gear built for actuation
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Precision peripherals for players who{" "}
          <span className="glow-text">notice the difference</span>.
        </h1>
        <p className="mt-4 text-ink-muted">
          Switch feel, sensor accuracy, click latency, polling rate. Browse by brand or
          filter by category to compare specs, then check out in a few clicks.
        </p>
      </div>
      <div className="hidden h-72 lg:block" aria-hidden="true" />
    </div>
  );

  return (
    <div className="space-y-16">
      <HeroCarousel layers={heroLayers} parallaxContent={parallaxContent} />

      <DepartmentRow products={products} />

      <ImageMosaic />

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Shop the catalog</h2>
        </div>
        <ProductCatalog products={products} initialCategory={initialCategory} />
      </section>
    </div>
  );
}
