import Link from "next/link";

export const metadata = { title: "About — Actuate" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">About us</h1>
      <div className="space-y-4 text-ink-muted">
        <p>
          Actuate is a portfolio demo: a storefront built to show how a catalog, cart,
          checkout and order flow fit together across separate services.
        </p>
        <p>
          No one is actually selling anything here, and there is no warehouse, staff or
          shipping operation behind it.
        </p>
        <p>
          The products, prices and stock numbers are sample data used to exercise the
          interface, so treat everything you see as illustrative.
        </p>
        <p>
          The copy, layout and components are written by hand rather than generated from a
          template, because the point is the build itself.
        </p>
      </div>
      <Link
        href="/collections/all"
        className="inline-block text-sm font-medium text-accent-violet hover:underline"
      >
        Browse the catalog
      </Link>
    </div>
  );
}
