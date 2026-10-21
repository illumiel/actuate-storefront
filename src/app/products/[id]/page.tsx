import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProductWithPrice, getInventory } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/add-to-cart";
import { ProductImage } from "@/components/product-image";
import { formatPHP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = Number(params.id);
  const product = await getProductWithPrice(productId);

  if (!product) notFound();

  const inventory = await getInventory(productId);
  const inStock = (inventory?.availableQuantity ?? 0) > 0;

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to catalog
      </Link>

      <div className="grid gap-10 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-keycap border border-base-border bg-base-panel">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-accent-cyan">{product.brand}</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline">{product.category}</Badge>
            {inventory && (
              <Badge variant={inStock ? "cyan" : "danger"}>
                {inStock ? `${inventory.availableQuantity} in stock` : "Out of stock"}
              </Badge>
            )}
          </div>

          {product.price && (
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-ink">
                {formatPHP(product.price.finalPrice)}
              </span>
              {product.price.discountPercent > 0 && (
                <span className="text-sm text-ink-faint line-through">
                  {formatPHP(product.price.basePrice)}
                </span>
              )}
            </div>
          )}

          <p className="leading-relaxed text-ink-muted">{product.description}</p>

          {inStock ? (
            <AddToCart product={product} />
          ) : (
            <p className="text-sm text-ink-faint">This item is currently out of stock.</p>
          )}
        </div>
      </div>
    </div>
  );
}
