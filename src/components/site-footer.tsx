import Link from "next/link";
import { BadgeCheck, Headset, MapPin, RotateCcw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsletterForm } from "@/components/newsletter-form";
import { BackToTop } from "@/components/back-to-top";
import { getProductsWithPrices } from "@/lib/api";
import { CATEGORY_ORDER, categoryLabel, slugifyCategory } from "@/lib/categories";

const PROMISES = [
  {
    icon: BadgeCheck,
    title: "Authentic gear",
    line: "Real products from real gaming brands.",
  },
  {
    icon: Truck,
    title: "Fast delivery",
    line: "Cash on delivery, GCash or card at checkout.",
  },
  {
    icon: Headset,
    title: "Real support",
    line: "Questions about specs? Ask before you buy.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    line: "Changed your mind? Return it unused.",
  },
];

const SERVICE_LINKS = [
  { label: "About us", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping and payment", href: "/faq#shipping" },
  { label: "Contact", href: "/contact" },
];

const INFORMATION_LINKS = [
  { label: "Return and refund policy", href: "/legal#returns" },
  { label: "Terms of use", href: "/legal#terms" },
  { label: "Privacy", href: "/legal#privacy" },
];

/** Abstract "map" backdrop: faint violet grid lines over the base colour plus a glow. */
const MAP_BACKGROUND = [
  "radial-gradient(circle at 32% 22%, rgba(124,92,252,0.18) 0%, transparent 55%)",
  "radial-gradient(circle at 74% 76%, rgba(61,242,196,0.14) 0%, transparent 55%)",
  "repeating-linear-gradient(0deg, rgba(124,92,252,0.10) 0px, rgba(124,92,252,0.10) 1px, transparent 1px, transparent 40px)",
  "repeating-linear-gradient(90deg, rgba(124,92,252,0.10) 0px, rgba(124,92,252,0.10) 1px, transparent 1px, transparent 40px)",
].join(", ");

export async function SiteFooter() {
  const products = await getProductsWithPrices();
  const categories = CATEGORY_ORDER.filter((category) =>
    products.some((p) => p.category === category)
  );
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20">
      <div className="border-y border-base-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, line }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <Icon className="h-8 w-8 text-ink-muted" aria-hidden="true" />
              <h2 className="font-display text-sm font-semibold text-ink">{title}</h2>
              <p className="text-sm text-ink-muted">{line}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div
          className="relative h-[360px] overflow-hidden rounded-keycap border border-base-border bg-base"
          style={{ backgroundImage: MAP_BACKGROUND }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <span
              aria-hidden="true"
              className="animate-pin-pulse absolute h-10 w-10 rounded-full bg-accent-violet/40"
            />
            <MapPin className="relative h-6 w-6 text-accent-violet" aria-hidden="true" />
          </div>

          <div className="absolute bottom-6 left-6 max-w-xs rounded-keycap border border-base-border bg-base/60 p-5 backdrop-blur-md">
            <h2 className="font-display text-sm font-semibold text-ink">Actuate Store</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Demo address, Metro Manila, Philippines
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Online only. Orders ship nationwide.
            </p>
            <Link href="/contact" className="mt-4 inline-block">
              <Button variant="secondary" size="sm">
                Contact us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-base-border bg-base-panel">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h2 className="font-display text-sm font-semibold text-ink">
                Shop by category
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                {categories.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/collections/${slugifyCategory(category)}`}
                      className="text-ink-muted transition-colors hover:text-ink"
                    >
                      {categoryLabel(category)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/collections/sale"
                    className="text-ink-muted transition-colors hover:text-ink"
                  >
                    Sale
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collections/all"
                    className="text-ink-muted transition-colors hover:text-ink"
                  >
                    All gear
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-sm font-semibold text-ink">Service</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {SERVICE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-sm font-semibold text-ink">Information</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {INFORMATION_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-sm font-semibold text-ink">
                Sign up to our newsletter
              </h2>
              <p className="mt-4 text-sm text-ink-muted">
                Get notified about restocks and sales. No spam.
              </p>
              <div className="mt-3">
                <NewsletterForm />
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-base-border pt-6 text-xs text-ink-faint sm:flex-row">
            <p>Demo project. Not affiliated with any brand shown.</p>
            <p>© {year} Actuate</p>
          </div>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
