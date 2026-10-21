"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const FALLBACK_GRADIENT =
  "bg-[linear-gradient(135deg,#2A1F52_0%,#171C24_55%,#10302B_100%)]";

interface FallbackImageProps {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackClassName?: string;
}

/**
 * next/image with a themed gradient fallback when the file is missing or
 * fails to load. Expects a positioned parent (uses `fill`).
 */
export function FallbackImage({
  src,
  alt = "",
  className,
  sizes,
  priority,
  fallbackClassName,
}: FallbackImageProps) {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => setFailed(false), [src]);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className={cn("absolute inset-0", FALLBACK_GRADIENT, fallbackClassName)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
