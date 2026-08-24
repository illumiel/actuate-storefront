"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  maxDistance?: number;
}

export function Magnetic({ children, className, maxDistance = 6 }: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = Math.max(-maxDistance, Math.min(maxDistance, (e.clientX - centerX) * 0.35));
    const y = Math.max(-maxDistance, Math.min(maxDistance, (e.clientY - centerY) * 0.35));
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <div
        className="w-full h-full inline-flex items-center justify-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition:
            position.x === 0 && position.y === 0
              ? "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
              : "transform 0.05s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
