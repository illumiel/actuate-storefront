"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { useProductModal } from "@/components/product-modal-provider";
import { categoryLabel, slugifyCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { ProductCategory, ProductWithPrice } from "@/types";

const NEW_IN_COUNT = 12;
const NEW_BADGE_COUNT = 6;
const MAX_CATEGORY_TABS = 3;

interface GearTab {
  id: string;
  label: string;
  items: ProductWithPrice[];
}

interface GearEditProps {
  products: ProductWithPrice[];
  className?: string;
}

/**
 * "The Gear Edit" — tabbed, horizontally scrolling product carousel.
 * Everything is derived from the products already fetched by the page,
 * so switching tabs never triggers a request or a layout jump.
 */
export function GearEdit({ products, className }: GearEditProps) {
  const { openProduct } = useProductModal();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [thumbSize, setThumbSize] = React.useState(100);
  const [thumbOffset, setThumbOffset] = React.useState(0);

  const newestIds = React.useMemo(() => {
    const ids = [...products]
      .sort((a, b) => b.id - a.id)
      .slice(0, NEW_BADGE_COUNT)
      .map((p) => p.id);
    return new Set(ids);
  }, [products]);

  const tabs = React.useMemo<GearTab[]>(() => {
    const list: GearTab[] = [];

    if (products.length > 0) {
      list.push({
        id: "new-in",
        label: "New in",
        items: [...products].sort((a, b) => b.id - a.id).slice(0, NEW_IN_COUNT),
      });
    }

    const deals = products
      .filter((p) => (p.price?.discountPercent ?? 0) > 0)
      .sort((a, b) => b.price!.discountPercent - a.price!.discountPercent);
    if (deals.length > 0) {
      list.push({ id: "deals", label: "Deals", items: deals });
    }

    const counts = new Map<ProductCategory, number>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    const categoryTabs = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_CATEGORY_TABS)
      .map(([category]) => ({
        id: slugifyCategory(category),
        label: categoryLabel(category),
        items: products.filter((p) => p.category === category),
      }));

    return [...list, ...categoryTabs];
  }, [products]);

  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  const updateProgress = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const fraction = el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1;
    const size = Math.min(100, fraction * 100);
    const max = el.scrollWidth - el.clientWidth;
    const offset = max > 0 ? (el.scrollLeft / max) * (100 - size) : 0;
    setThumbSize(size);
    setThumbOffset(offset);
  }, []);

  React.useEffect(() => {
    window.addEventListener("resize", updateProgress);
    return () => window.removeEventListener("resize", updateProgress);
  }, [updateProgress]);

  // Re-measure after a tab switch remounts the scroller (scroll resets to 0).
  React.useEffect(() => {
    const frame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(frame);
  }, [activeTab?.id, updateProgress]);

  function scrollByPage(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.max(el.clientWidth * 0.8, 240),
      behavior: "smooth",
    });
  }

  if (tabs.length === 0 || !activeTab) return null;

  return (
    <section className={cn("space-y-6", className)}>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-cyan">
          Featured
        </p>
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          The Gear Edit
        </h2>

        <div role="tablist" aria-label="Featured gear" className="flex flex-wrap gap-6 border-b border-base-border">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "-mb-px border-b-2 pb-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-accent-violet text-ink"
                    : "border-transparent text-ink-muted hover:text-ink"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="group relative">
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Previous products"
          className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-base-border bg-base/80 text-ink opacity-0 backdrop-blur-sm transition-opacity hover:border-accent-violet/50 hover:text-accent-violet focus-visible:opacity-100 group-hover:opacity-100 lg:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          key={activeTab.id}
          ref={scrollRef}
          onScroll={updateProgress}
          className="animate-fade-in -mx-1 -mb-5 -mt-3 flex min-h-[340px] snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto px-1 pb-5 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:min-h-[420px]"
        >
          {activeTab.items.map((product) => (
            <div
              key={product.id}
              className="w-[70%] shrink-0 snap-start sm:w-[calc(25%-9px)]"
            >
              <ProductCard
                product={product}
                isNew={newestIds.has(product.id)}
                onSelect={(p) => openProduct(p)}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Next products"
          className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-base-border bg-base/80 text-ink opacity-0 backdrop-blur-sm transition-opacity hover:border-accent-violet/50 hover:text-accent-violet focus-visible:opacity-100 group-hover:opacity-100 lg:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="relative h-1 w-full overflow-hidden rounded-full bg-base-border">
        <div
          className="h-full rounded-full bg-ink"
          style={{ width: `${thumbSize}%`, marginLeft: `${thumbOffset}%` }}
        />
      </div>

      <div className="flex justify-center">
        <Link href="/collections/all">
          <Button variant="outline">Shop all gear</Button>
        </Link>
      </div>
    </section>
  );
}
