"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { SaleCountdown } from "@/components/sale-countdown";
import { cn } from "@/lib/utils";
import type { ProductWithPrice } from "@/types";

const FALLBACK_GRADIENT =
  "bg-[linear-gradient(135deg,#2A1F52_0%,#171C24_55%,#10302B_100%)]";

interface SaleBannerProps {
  products: ProductWithPrice[];
  className?: string;
}

export function SaleBanner({ products, className }: SaleBannerProps) {
  const [failed, setFailed] = React.useState(false);

  const discounted = products.filter((p) => (p.price?.discountPercent ?? 0) > 0);
  if (discounted.length === 0) return null;

  const count = discounted.length;
  const maxDiscount = discounted.reduce(
    (max, p) => Math.max(max, p.price!.discountPercent),
    0
  );

  return (
    <section
      className={cn(
        "overflow-hidden rounded-keycap border border-base-border lg:grid lg:grid-cols-5",
        className
      )}
      aria-label="Sale"
    >
      <div className="relative min-h-[240px] lg:col-span-3 lg:min-h-[360px]">
        {!failed ? (
          <Image
            src="/images/sale/sale.jpg"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div aria-hidden="true" className={cn("absolute inset-0", FALLBACK_GRADIENT)} />
        )}
      </div>

      <div className="flex flex-col justify-between gap-8 bg-[#170F2E] p-8 lg:col-span-2 lg:p-10">
        <div className="space-y-3">
          <h2 className="font-display text-3xl font-bold text-ink">Sale</h2>
          <p className="text-ink-muted">
            {count} {count === 1 ? "product" : "products"} marked down, up to{" "}
            {maxDiscount}% off.
          </p>
          <Link
            href="/collections/sale"
            className="inline-block text-sm font-medium text-ink underline decoration-accent-violet underline-offset-4 transition-colors hover:text-accent-cyan hover:decoration-accent-cyan"
          >
            Shop the sale
          </Link>
        </div>

        <SaleCountdown />
      </div>
    </section>
  );
}
