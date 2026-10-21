import type { CategorySlug } from "@/lib/categories";

/**
 * Hand-editable homepage content. Keep the original copy here rather than
 * scattered through components so it's easy to tweak without touching JSX.
 */

export interface HeroSlide {
  id: string;
  /**
   * "parallax" renders the mouse-tracked peripheral hero (slide 1),
   * "image" renders a full-bleed campaign slide with a dark overlay.
   */
  kind: "parallax" | "image";
  eyebrow?: string;
  headline?: string;
  linkLabel?: string;
  linkHref?: string;
  imageSrc?: string;
}

export const heroSlides: HeroSlide[] = [
  { id: "actuation", kind: "parallax" },
  {
    id: "sale",
    kind: "image",
    eyebrow: "On sale now",
    headline: "Marked down. Still the good stuff.",
    linkLabel: "Shop the sale",
    linkHref: "/collections/sale",
    imageSrc: "/images/hero/slide-2.jpg",
  },
  {
    id: "brands",
    kind: "image",
    eyebrow: "Browse by brand",
    headline: "Pick your brand, see the whole lineup.",
    linkLabel: "Browse all gear",
    linkHref: "/collections/all",
    imageSrc: "/images/hero/slide-3.jpg",
  },
];

export interface MosaicTile {
  id: string;
  imageSrc: string;
  headline: string;
  linkLabel: string;
  linkHref: string;
}

export const mosaicTiles: MosaicTile[] = [
  {
    id: "headsets",
    imageSrc: "/images/tiles/tile-1.jpg",
    headline: "Built for long sessions",
    linkLabel: "Shop headsets",
    linkHref: "/collections/headset",
  },
  {
    id: "mice",
    imageSrc: "/images/tiles/tile-2.jpg",
    headline: "Click latency, measured",
    linkLabel: "Shop mice",
    linkHref: "/collections/mouse",
  },
  {
    id: "keyboards",
    imageSrc: "/images/tiles/tile-3.jpg",
    headline: "Switch feel matters",
    linkLabel: "Shop keyboards",
    linkHref: "/collections/keyboard",
  },
];

/** ISO timestamp the sale countdown targets (used by later homepage parts). */
export const SALE_ENDS_AT = "2026-12-31T23:59:59+08:00";

export interface CollectionCopy {
  title: string;
  description: string;
}

export const collectionCopy: Record<CategorySlug | "all" | "sale", CollectionCopy> = {
  all: {
    title: "All gear",
    description: "Every peripheral we carry, in one place.",
  },
  sale: {
    title: "On sale",
    description: "Marked-down gear while stock lasts.",
  },
  mouse: {
    title: "Mice",
    description: "Sensors, shapes and weights for every grip.",
  },
  keyboard: {
    title: "Keyboards",
    description: "Switch feel, layout and build, compared side by side.",
  },
  headset: {
    title: "Headsets",
    description: "Comfort and clarity for long sessions.",
  },
  monitor: {
    title: "Monitors",
    description: "Refresh rate and response time that keep up.",
  },
  controller: {
    title: "Controllers",
    description: "Sticks, triggers and paddles for every input style.",
  },
  mousepad: {
    title: "Mousepads",
    description: "Surface and glide tuned to your sensor.",
  },
  microphone: {
    title: "Microphones",
    description: "Clean capture for comms and streaming.",
  },
  webcam: {
    title: "Webcams",
    description: "Sharp, stable video without the fuss.",
  },
  chair: {
    title: "Chairs",
    description: "Support that holds up over a full day.",
  },
  other: {
    title: "Other gear",
    description: "Everything else in the lineup.",
  },
};
