import type { ProductCategory } from "@/types";

/**
 * Canonical category order for the storefront: departments row, filters, and
 * any collection listings derived from the catalog.
 */
export const CATEGORY_ORDER: ProductCategory[] = [
  "MOUSE",
  "KEYBOARD",
  "HEADSET",
  "MONITOR",
  "CONTROLLER",
  "MOUSEPAD",
  "MICROPHONE",
  "WEBCAM",
  "CHAIR",
];

/** Human-readable labels, plural because they read as collections. */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  MOUSE: "Mice",
  KEYBOARD: "Keyboards",
  HEADSET: "Headsets",
  MONITOR: "Monitors",
  CONTROLLER: "Controllers",
  MOUSEPAD: "Mousepads",
  MICROPHONE: "Microphones",
  WEBCAM: "Webcams",
  CHAIR: "Chairs",
  OTHER: "Other",
};

/** URL slugs used by /collections/{slug} and /images/categories/{slug}.png. */
export const CATEGORY_SLUGS: Record<ProductCategory, CategorySlug> = {
  MOUSE: "mouse",
  KEYBOARD: "keyboard",
  HEADSET: "headset",
  MONITOR: "monitor",
  CONTROLLER: "controller",
  MOUSEPAD: "mousepad",
  MICROPHONE: "microphone",
  WEBCAM: "webcam",
  CHAIR: "chair",
  OTHER: "other",
};

export type CategorySlug =
  | "mouse"
  | "keyboard"
  | "headset"
  | "monitor"
  | "controller"
  | "mousepad"
  | "microphone"
  | "webcam"
  | "chair"
  | "other";

export function slugifyCategory(category: ProductCategory): CategorySlug {
  return CATEGORY_SLUGS[category] ?? "other";
}

export function categoryFromSlug(slug: string): ProductCategory | null {
  const normalized = slug.trim().toLowerCase();
  const match = (Object.keys(CATEGORY_SLUGS) as ProductCategory[]).find(
    (category) => CATEGORY_SLUGS[category] === normalized
  );
  return match ?? null;
}

export function categoryLabel(category: ProductCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}
