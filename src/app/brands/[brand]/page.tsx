import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProductsWithPrices } from "@/lib/api";
import { ParallaxHero, type ParallaxLayer } from "@/components/parallax-hero";
import { CollectionView } from "@/components/collection-view";
import { Button } from "@/components/ui/button";

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

export const dynamic = "force-dynamic";

const NEW_BADGE_COUNT = 6;

export default async function BrandPage({ params }: { params: { brand: string } }) {
  const brandSlug = decodeURIComponent(params.brand).toLowerCase();
  const products = await getProductsWithPrices();

  const newestIds = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, NEW_BADGE_COUNT)
    .map((p) => p.id);

  const brandProducts = products.filter(
    (p) =>
      p.brand.toLowerCase() === brandSlug ||
      p.brand.toLowerCase().replace(/\s+/g, "") === brandSlug.replace(/\s+/g, "")
  );

  if (brandProducts.length === 0) {
    return (
      <div className="space-y-8 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>
        <div className="rounded-keycap border border-dashed border-base-border py-24 text-center space-y-4">
          <p className="text-ink-muted text-lg">No products found for brand &ldquo;{params.brand}&rdquo;.</p>
          <Link href="/">
            <Button variant="secondary">Return home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const exactBrand = brandProducts[0].brand;
  const categoryCount = new Set(brandProducts.map((p) => p.category)).size;

  return (
    <div className="space-y-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <ParallaxHero layers={heroLayers} className="py-14 sm:py-20 min-h-[440px]">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative z-10 max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-cyan">
              Brand Spotlight • {exactBrand}
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl uppercase">
              <span className="glow-text">{exactBrand}</span>
            </h1>
            <p className="mt-4 text-ink-muted">
              {brandProducts.length} {brandProducts.length === 1 ? "product" : "products"} across{" "}
              {categoryCount} {categoryCount === 1 ? "category" : "categories"} — everything we
              carry from {exactBrand}.
            </p>
          </div>
          <div className="hidden h-72 lg:block" aria-hidden="true" />
        </div>
      </ParallaxHero>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">{exactBrand} Catalog</h2>
        </div>
        <CollectionView
          products={brandProducts}
          newestIds={newestIds}
          showBrandFilter={false}
        />
      </section>
    </div>
  );
}
