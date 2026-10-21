"use client";

import * as React from "react";
import Image from "next/image";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Renders a product image, falling back to a neutral placeholder (no text)
 * when the source is missing or fails to load.
 * Expects a positioned parent (uses next/image `fill`).
 */
export function ProductImage({
  src,
  alt,
  className,
  sizes,
  priority,
}: ProductImageProps) {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-base-raised to-base-panel"
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-1/3 w-1/3 max-h-10 max-w-10 text-ink-faint/40"
        >
          <rect
            x="7"
            y="7"
            width="34"
            height="34"
            rx="9"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M24 16v16M16 24h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
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
