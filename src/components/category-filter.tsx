"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "All", value: null },
  { label: "Keyboards", value: "KEYBOARD" },
  { label: "Mice", value: "MOUSE" },
  { label: "Headsets", value: "HEADSET" },
  { label: "Monitors", value: "MONITOR" },
  { label: "Controllers", value: "CONTROLLER" },
  { label: "Mousepads", value: "MOUSEPAD" },
];

export function CategoryFilter() {
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat.value || (!active && !cat.value);
        return (
          <Link
            key={cat.label}
            href={cat.value ? `/?category=${cat.value}` : "/"}
            className={cn(
              "rounded-keycap border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-accent-violet/50 bg-accent-violet/10 text-accent-violet"
                : "border-base-border bg-base-panel text-ink-muted hover:text-ink"
            )}
          >
            {cat.label}
          </Link>
        );
      })}
    </div>
  );
}
