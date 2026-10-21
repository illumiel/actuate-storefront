import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProductsWithPrices } from "@/lib/api";
import { CollectionView } from "@/components/collection-view";
import { FallbackImage } from "@/components/fallback-image";
import { Button } from "@/components/ui/button";
import { categoryFromSlug, type CategorySlug } from "@/lib/categories";
import { collectionCopy } from "@/lib/home-content";
import type { ProductWithPrice } from "@/types";

export const dynamic = "force-dynamic";

const NEW_BADGE_COUNT = 6;

export default async function CollectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = decodeURIComponent(params.slug).toLowerCase();

  const isAll = slug === "all";
  const isSale = slug === "sale";
  const category = categoryFromSlug(slug);

  if (!isAll && !isSale && !category) {
    return (
      <div className="space-y-8 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <div className="space-y-4 rounded-keycap border border-dashed border-base-border py-24 text-center">
          <p className="text-lg text-ink-muted">Collection not found.</p>
          <Link href="/">
            <Button variant="secondary">Return home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const products = await getProductsWithPrices();

  const newestIds = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, NEW_BADGE_COUNT)
    .map((p) => p.id);

  const scoped = isSale
    ? products.filter((p) => (p.price?.discountPercent ?? 0) > 0)
    : category
      ? products.filter((p) => p.category === category)
      : products;

  const copy = collectionCopy[slug as CategorySlug | "all" | "sale"];

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{copy.title}</span>
      </nav>

      <section className="overflow-hidden rounded-keycap border border-base-border lg:grid lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-3 bg-[#182420] p-8 lg:min-h-[340px] lg:p-10">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            {copy.title}
          </h1>
          <p className="max-w-md text-ink-muted">{copy.description}</p>
        </div>
        <div className="relative min-h-[200px] lg:min-h-[340px]">
          <FallbackImage
            src={`/images/collections/${slug}.jpg`}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <CollectionView products={scoped} newestIds={newestIds} />
    </div>
  );
}
