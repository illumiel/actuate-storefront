"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ParallaxLayer {
  /** Path under /public, e.g. "/images/peripherals/mouse.png" */
  src: string;
  alt: string;
  /** How far this layer moves relative to the mouse. Higher = moves more (feels "closer"). */
  depth: number;
  /** Tailwind classes for size + base position (absolute positioning). */
  className: string;
}

interface ParallaxHeroProps {
  children: React.ReactNode;
  layers: ParallaxLayer[];
  className?: string;
}

/**
 * Mouse-tracked parallax hero, inspired by Aceternity UI's "Parallax Hero Images".
 * Each layer drifts by an amount proportional to its `depth` as the cursor moves,
 * creating a sense of 3D space. Foreground content (children) stays still on top.
 *
 * No extra dependency (framer-motion) needed - plain mousemove + CSS transform
 * with a transition is enough for this effect and keeps the bundle lighter.
 */
export function ParallaxHero({ children, layers, className }: ParallaxHeroProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Normalize to -1..1 range relative to the container's center.
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setOffset({ x, y });
  }

  function handleMouseLeave() {
    setOffset({ x: 0, y: 0 });
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundImage:
          "radial-gradient(circle at 82% 25%, rgba(124, 92, 252, 0.14) 0%, rgba(124, 92, 252, 0.03) 50%, transparent 80%), radial-gradient(circle at 68% 75%, rgba(61, 242, 196, 0.12) 0%, rgba(61, 242, 196, 0.03) 50%, transparent 80%)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Parallax peripheral layers. Kept inside the centered content column
          (max-w-6xl) so the drifting shapes stay near the copy instead of
          hugging the full-bleed viewport edges. */}
      <div className="absolute inset-y-0 left-1/2 hidden w-full max-w-6xl -translate-x-1/2 px-6 sm:block">
        {layers.map((layer, i) => (
          <div
            key={i}
            className={cn("pointer-events-none absolute z-0 transition-transform duration-300 ease-out", layer.className)}
            style={{
              transform: `translate3d(${offset.x * layer.depth}px, ${offset.y * layer.depth}px, 0)`,
            }}
          >
            <Image
              src={layer.src}
              alt={layer.alt}
              fill
              className="object-contain drop-shadow-2xl"
              sizes="400px"
            />
          </div>
        ))}
      </div>

      {/* Foreground content, stays put */}
      <div className="relative">{children}</div>
    </div>
  );
}
