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

/**
 * Demo value — edit by hand. The sale countdown targets this timestamp; if it
 * is in the past (or unparseable) the countdown hides itself entirely.
 */
export const SALE_ENDS_AT = "2026-12-31T23:59:59+08:00";

export interface CollectionCopy {
  title: string;
  /** One concrete sentence about what actually differs within the collection. */
  description: string;
}

/** Banner title + sentence for every /collections/{slug} page. */
export const collectionCopy: Record<CategorySlug | "all" | "sale", CollectionCopy> = {
  all: {
    title: "All gear",
    description:
      "Everything we carry, in one place. Sort by price or discount to start comparing.",
  },
  sale: {
    title: "Sale",
    description:
      "Marked down while stock lasts. Everything here is already reduced.",
  },
  mouse: {
    title: "Mice",
    description:
      "Weight, sensor and click latency are what separate these. Sorted so you can compare them.",
  },
  keyboard: {
    title: "Keyboards",
    description:
      "Switch type, layout and actuation force decide how a board feels. Start with the one you type on.",
  },
  headset: {
    title: "Headsets",
    description:
      "Drivers, clamp force and mic pickup matter more than the spec sheet suggests.",
  },
  monitor: {
    title: "Monitors",
    description:
      "Refresh rate, response time and panel type decide how motion reads on screen.",
  },
  controller: {
    title: "Controllers",
    description:
      "Stick tension, trigger travel and extra paddles change how your inputs land.",
  },
  mousepad: {
    title: "Mousepads",
    description:
      "Surface texture and thickness set your glide and your stopping power.",
  },
  microphone: {
    title: "Microphones",
    description:
      "Pickup pattern and mounting decide how clean you sound to everyone else.",
  },
  webcam: {
    title: "Webcams",
    description:
      "Sensor size, frame rate and field of view keep you sharp on call.",
  },
  chair: {
    title: "Chairs",
    description:
      "Lumbar support, seat depth and armrest travel carry you through a long day.",
  },
  other: {
    title: "Other gear",
    description: "The rest of the lineup, in one place.",
  },
};
