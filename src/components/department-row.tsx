"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Armchair,
  Gamepad2,
  Headphones,
  Keyboard,
  Mic,
  Monitor,
  Mouse,
  RectangleHorizontal,
  Webcam,
  type LucideIcon,
} from "lucide-react";
import { CATEGORY_ORDER, categoryLabel, slugifyCategory } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { ProductCategory, ProductWithPrice } from "@/types";

const CATEGORY_ICONS: Record<ProductCategory, LucideIcon> = {
  MOUSE: Mouse,
  KEYBOARD: Keyboard,
  HEADSET: Headphones,
  MONITOR: Monitor,
  CONTROLLER: Gamepad2,
  MOUSEPAD: RectangleHorizontal,
  MICROPHONE: Mic,
  WEBCAM: Webcam,
  CHAIR: Armchair,
  OTHER: RectangleHorizontal,
};

interface DepartmentRowProps {
  products: ProductWithPrice[];
  className?: string;
}

export function DepartmentRow({ products, className }: DepartmentRowProps) {
  const departments = CATEGORY_ORDER.filter((category) =>
    products.some((p) => p.category === category)
  );

  if (departments.length === 0) return null;

  return (
    <section className={cn("space-y-8", className)}>
      <h2 className="text-center font-display text-xl font-semibold text-ink sm:text-2xl">
        Shop by department
      </h2>

      {/* Mobile: horizontal scroll with snap. md+: wrapped and centered. lg: a
          single 9-up row so all departments line up under the hero. */}
      <div className="-mx-6 -mb-5 -mt-3 flex snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto px-6 pb-5 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0 lg:-mx-6 lg:grid lg:grid-cols-9 lg:gap-1 lg:px-0">
        {departments.map((category) => {
          const slug = slugifyCategory(category);
          const label = categoryLabel(category);
          const Icon = CATEGORY_ICONS[category];
          const withImage = products.find(
            (p) => p.category === category && p.imageUrl
          );

          return (
            <Link
              key={category}
              href={`/collections/${slug}`}
              className="group flex w-28 shrink-0 snap-start flex-col items-center text-center lg:justify-self-center"
            >
              <span className="relative flex h-28 w-28 items-center justify-center">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(124,92,252,0.55),transparent_62%),radial-gradient(circle_at_50%_50%,rgba(61,242,196,0.35),transparent_60%)] opacity-0 blur-2xl transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                />
                <span className="relative flex h-full w-full items-center justify-center transition-transform duration-200 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06] group-focus-visible:-translate-y-1.5 group-focus-visible:scale-[1.06]">
                  <CategoryVisual
                    slug={slug}
                    productImage={withImage?.imageUrl}
                    Icon={Icon}
                  />
                </span>
              </span>
              <span className="mt-3 text-sm font-medium text-ink-muted transition-colors duration-200 group-hover:text-accent-cyan group-focus-visible:text-accent-cyan">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Image source chain: the transparent cutout under /images/categories/{slug}.png,
 * then the first product image in that category, then a category icon.
 */
function CategoryVisual({
  slug,
  productImage,
  Icon,
}: {
  slug: string;
  productImage?: string;
  Icon: LucideIcon;
}) {
  const sources = React.useMemo(() => {
    const list = [`/images/categories/${slug}.png`];
    if (productImage) list.push(productImage);
    return list;
  }, [slug, productImage]);

  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => setAttempt(0), [slug, productImage]);

  const src = sources[attempt];

  if (!src) {
    return (
      <Icon
        aria-hidden="true"
        className="h-20 w-20 text-ink-faint transition-colors duration-200 group-hover:text-accent-violet sm:h-24 sm:w-24"
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="112px"
      className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
      onError={() => setAttempt((a) => a + 1)}
    />
  );
}
