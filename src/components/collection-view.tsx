"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Minus, Plus, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";
import { useProductModal } from "@/components/product-modal-provider";
import { getAllInventory } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ProductWithPrice } from "@/types";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "discount", label: "Biggest discount" },
];

const PRICE_PRESETS = [
  { id: "under-5k", label: "Under 5,000", min: "", max: "5000" },
  { id: "5k-10k", label: "5,000 - 10,000", min: "5000", max: "10000" },
  { id: "10k-20k", label: "10,000 - 20,000", min: "10000", max: "20000" },
  { id: "over-20k", label: "Over 20,000", min: "20000", max: "" },
];

interface FilterState {
  brands: string[];
  min: string;
  max: string;
  stock: string[];
  sort: string;
}

/** Single source of truth for both the URL query and the filter UI. */
function parseSearch(search: string): FilterState {
  const params = new URLSearchParams(search);
  return {
    brands: (params.get("brand") ?? "")
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean),
    min: params.get("min") ?? "",
    max: params.get("max") ?? "",
    stock: (params.get("stock") ?? "").split(",").filter(Boolean),
    sort: params.get("sort") ?? "featured",
  };
}

function toSearch(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.brands.length > 0) params.set("brand", state.brands.join(","));
  if (state.min) params.set("min", state.min);
  if (state.max) params.set("max", state.max);
  if (state.stock.length > 0) params.set("stock", state.stock.join(","));
  if (state.sort && state.sort !== "featured") params.set("sort", state.sort);
  return params.toString();
}

interface CollectionViewProps {
  /** Pre-scoped products for this page (collection, brand, sale...). */
  products: ProductWithPrice[];
  /** Ids that get the "New" badge — derived from the full catalog. */
  newestIds?: number[];
  /** Brand pages hide the brand group because every product shares it. */
  showBrandFilter?: boolean;
  className?: string;
}

export function CollectionView({
  products,
  newestIds = [],
  showBrandFilter = true,
  className,
}: CollectionViewProps) {
  const searchParams = useSearchParams();
  const { openProduct } = useProductModal();

  // Seed from the URL once (shareable links keep working). After that we own
  // the state and mirror it back with history.replaceState so filtering stays
  // instant and never triggers a router navigation / scroll reset.
  const [filters, setFilters] = React.useState<FilterState>(() =>
    parseSearch(searchParams.toString())
  );
  const isFirstRender = React.useRef(true);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const pendingScrollToResults = React.useRef(false);

  const selectedBrands = filters.brands;
  const stockSelection = React.useMemo(() => new Set(filters.stock), [filters.stock]);

  const newestIdSet = React.useMemo(() => new Set(newestIds), [newestIds]);

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [inventory, setInventory] = React.useState<Record<number, number> | null>(null);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const query = toSearch(filters);
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [filters]);

  // Back/forward should re-read whatever query the history entry carries.
  React.useEffect(() => {
    function onPopState() {
      setFilters(parseSearch(window.location.search));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // One inventory request for the whole page. Failure -> availability group hidden.
  React.useEffect(() => {
    let cancelled = false;
    getAllInventory().then((records) => {
      if (cancelled || !records) return;
      const map: Record<number, number> = {};
      for (const item of records) map[item.productId] = item.availableQuantity;
      setInventory(map);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const brandCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const filtered = React.useMemo(() => {
    const min = filters.min ? Number(filters.min) : null;
    const max = filters.max ? Number(filters.max) : null;
    const applyStock = inventory !== null && stockSelection.size > 0;

    const list = products.filter((product) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      const price = product.price?.finalPrice ?? null;
      if (min !== null && (price === null || price < min)) return false;
      if (max !== null && (price === null || price > max)) return false;

      if (applyStock) {
        const available = inventory![product.id];
        const inStock = available === undefined ? true : available > 0;
        const wantsIn = stockSelection.has("in") && inStock;
        const wantsOut = stockSelection.has("out") && !inStock;
        if (!wantsIn && !wantsOut) return false;
      }

      return true;
    });

    const sorted = [...list];
    switch (filters.sort) {
      case "price-asc":
        sorted.sort(
          (a, b) => (a.price?.finalPrice ?? Infinity) - (b.price?.finalPrice ?? Infinity)
        );
        break;
      case "price-desc":
        sorted.sort(
          (a, b) => (b.price?.finalPrice ?? -Infinity) - (a.price?.finalPrice ?? -Infinity)
        );
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "discount":
        sorted.sort(
          (a, b) => (b.price?.discountPercent ?? 0) - (a.price?.discountPercent ?? 0)
        );
        break;
      default:
        break;
    }

    return sorted;
  }, [products, selectedBrands, filters.min, filters.max, filters.sort, stockSelection, inventory]);

  // After a USER filter/sort change, bring the first result into view. This runs
  // after the DOM has the new list, so the target is measured against the new
  // (possibly shorter) layout instead of the old scroll position.
  React.useLayoutEffect(() => {
    if (!pendingScrollToResults.current) return;
    // Keep waiting while the mobile filter drawer is open; the drawer close
    // re-runs this effect.
    if (drawerOpen) return;
    pendingScrollToResults.current = false;

    const target = resultsRef.current;
    if (!target) return;

    const navbar = document.querySelector<HTMLElement>("header");
    const offset = (navbar?.offsetHeight ?? 72) + 16;
    const rect = target.getBoundingClientRect();
    // Already sitting below the navbar - leave the page where it is.
    if (rect.top >= offset) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: window.scrollY + rect.top - offset,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [filtered, drawerOpen]);

  /** Mark the next list change as user-driven so it scrolls to the results. */
  function requestResultsScroll() {
    pendingScrollToResults.current = true;
  }

  function toggleBrand(brand: string) {
    requestResultsScroll();
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  }

  function toggleStock(value: "in" | "out") {
    requestResultsScroll();
    setFilters((prev) => ({
      ...prev,
      stock: prev.stock.includes(value)
        ? prev.stock.filter((s) => s !== value)
        : [...prev.stock, value],
    }));
  }

  function setPrice(min: string, max: string) {
    requestResultsScroll();
    setFilters((prev) => ({
      ...prev,
      min: min.replace(/[^\d]/g, ""),
      max: max.replace(/[^\d]/g, ""),
    }));
  }

  function setSort(sort: string) {
    requestResultsScroll();
    setFilters((prev) => ({ ...prev, sort }));
  }

  function clearFilters() {
    requestResultsScroll();
    setFilters((prev) => ({ ...prev, brands: [], min: "", max: "", stock: [] }));
  }

  const isFilterActive =
    selectedBrands.length > 0 ||
    Boolean(filters.min) ||
    Boolean(filters.max) ||
    stockSelection.size > 0;

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  for (const brand of selectedBrands) {
    chips.push({ key: `brand-${brand}`, label: brand, onRemove: () => toggleBrand(brand) });
  }

  if (filters.min && filters.max) {
    chips.push({
      key: "price-range",
      label: `₱${Number(filters.min).toLocaleString()} – ₱${Number(filters.max).toLocaleString()}`,
      onRemove: () => setPrice("", ""),
    });
  } else if (filters.min) {
    chips.push({
      key: "price-min",
      label: `From ₱${Number(filters.min).toLocaleString()}`,
      onRemove: () => setPrice("", filters.max),
    });
  } else if (filters.max) {
    chips.push({
      key: "price-max",
      label: `Up to ₱${Number(filters.max).toLocaleString()}`,
      onRemove: () => setPrice(filters.min, ""),
    });
  }

  if (stockSelection.has("in")) {
    chips.push({ key: "stock-in", label: "In stock", onRemove: () => toggleStock("in") });
  }
  if (stockSelection.has("out")) {
    chips.push({ key: "stock-out", label: "Out of stock", onRemove: () => toggleStock("out") });
  }

  const filterPanel = (
    <div>
      {showBrandFilter && brandCounts.length > 0 && (
        <FilterGroup title="Brand">
          {brandCounts.map(([brand, count]) => (
            <CheckRow
              key={brand}
              label={`${brand} (${count})`}
              checked={selectedBrands.includes(brand)}
              onChange={() => toggleBrand(brand)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        <div className="flex items-center gap-2">
          <PriceInput
            placeholder="Min"
            value={filters.min}
            onChange={(value) => setPrice(value, filters.max)}
          />
          <span className="text-xs text-ink-faint">–</span>
          <PriceInput
            placeholder="Max"
            value={filters.max}
            onChange={(value) => setPrice(filters.min, value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {PRICE_PRESETS.map((preset) => {
            const active = filters.min === preset.min && filters.max === preset.max;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setPrice(preset.min, preset.max)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  active
                    ? "border-accent-violet/50 bg-accent-violet/10 text-accent-violet"
                    : "border-base-border text-ink-muted hover:border-accent-violet/40 hover:text-ink"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {inventory !== null && (
        <FilterGroup title="Availability">
          <CheckRow
            label="In stock"
            checked={stockSelection.has("in")}
            onChange={() => toggleStock("in")}
          />
          <CheckRow
            label="Out of stock"
            checked={stockSelection.has("out")}
            onChange={() => toggleStock("out")}
          />
        </FilterGroup>
      )}
    </div>
  );

  return (
    <div className={cn("grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10", className)}>
      <aside className="thin-scrollbar hidden lg:sticky lg:top-[88px] lg:block lg:max-h-[calc(100vh-104px)] lg:self-start lg:overflow-y-auto">
        <div className="rounded-keycap border border-base-border bg-base-panel p-5">
          <div className="flex items-center justify-between pb-2">
            <h2 className="font-display text-sm font-semibold text-ink">Filters</h2>
            {isFilterActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-accent-violet hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          {filterPanel}
        </div>
      </aside>

      <div className="space-y-4">
        <div ref={resultsRef} className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 rounded-keycap border border-base-border bg-base-panel px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-accent-violet/40 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>

            <SortSelect value={filters.sort} onChange={setSort} options={SORT_OPTIONS} />
          </div>
        </div>

        {isFilterActive && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="flex items-center gap-1.5 rounded-full border border-base-border bg-base-panel px-3 py-1 text-xs text-ink-muted transition-colors hover:text-ink"
              >
                {chip.label}
                <X className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">Remove filter</span>
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-accent-violet hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div
          className="min-h-[420px]"
          style={{ overflowAnchor: "none" }}
        >
          {filtered.length === 0 ? (
            <div className="space-y-4 rounded-keycap border border-dashed border-base-border py-20 text-center">
              <p className="text-ink-muted">No gear matches these filters.</p>
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="animate-fade-in grid grid-cols-2 gap-5 sm:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isNew={newestIdSet.has(product.id)}
                  availableQuantity={inventory ? inventory[product.id] : undefined}
                  onSelect={(p) => openProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div
            className="absolute inset-0 bg-base/70 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto border-r border-base-border bg-base-panel p-6"
          >
            <div className="flex items-center justify-between pb-4">
              <h2 className="font-display text-base font-semibold text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="flex h-8 w-8 items-center justify-center rounded-keycap text-ink-muted transition-colors hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {filterPanel}
            {isFilterActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 self-start text-xs font-medium text-accent-violet hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="border-b border-base-border py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-sm font-medium text-ink"
      >
        {title}
        {open ? (
          <Minus className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        ) : (
          <Plus className="h-4 w-4 text-ink-muted" aria-hidden="true" />
        )}
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-muted transition-colors hover:text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-accent-violet"
      />
      <span>{label}</span>
    </label>
  );
}

function PriceInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint">
        ₱
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        className="h-10 w-full rounded-keycap border border-base-border bg-base-panel pl-7 pr-2 text-sm text-ink placeholder:text-ink-faint transition-colors focus-visible:outline-none focus-visible:border-accent-violet/60"
      />
    </div>
  );
}
