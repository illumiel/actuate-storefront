"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { mosaicTiles, type MosaicTile } from "@/lib/home-content";
import { cn } from "@/lib/utils";

const FALLBACK_GRADIENT =
  "bg-[linear-gradient(135deg,#2A1F52_0%,#171C24_55%,#10302B_100%)]";

export function ImageMosaic({ className }: { className?: string }) {
  const [lead, ...rest] = mosaicTiles;

  return (
    <section
      className={cn("grid gap-4 sm:grid-cols-3", className)}
      aria-label="Featured collections"
    >
      {lead && (
        <Tile tile={lead} className="min-h-[280px] sm:col-span-2 sm:row-span-2 sm:min-h-[440px]" />
      )}
      {rest.map((tile) => (
        <Tile key={tile.id} tile={tile} className="min-h-[220px] sm:min-h-[210px]" />
      ))}
    </section>
  );
}

function Tile({ tile, className }: { tile: MosaicTile; className?: string }) {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => setFailed(false), [tile.imageSrc]);

  return (
    <Link
      href={tile.linkHref}
      className={cn(
        "group relative block overflow-hidden rounded-keycap",
        className
      )}
    >
      {!failed ? (
        <Image
          src={tile.imageSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08] motion-reduce:transition-none"
          onError={() => setFailed(true)}
        />
      ) : (
        <div aria-hidden="true" className={cn("absolute inset-0", FALLBACK_GRADIENT)} />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-base/95 via-base/50 to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col justify-end gap-3 p-6 sm:p-7">
        <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">
          {tile.headline}
        </h3>
        <span className="relative inline-block w-fit text-sm font-medium text-ink">
          {tile.linkLabel}
          <span
            aria-hidden="true"
            className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-accent-cyan transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
          />
        </span>
      </div>
    </Link>
  );
}
