import Link from "next/link";

export const metadata = { title: "Contact — Actuate" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-ink">Contact</h1>
      <div className="space-y-4 text-ink-muted">
        <p>
          Questions about a product, a spec, or how this storefront was built? Send a note
          and it will be read.
        </p>
        <p>
          This is a read-only demo page. There is no contact form, and no message sent
          here reaches anyone automatically.
        </p>
        <p>
          Placeholder address:{" "}
          <a
            href="mailto:hello@example.com"
            className="font-medium text-accent-violet hover:underline"
          >
            hello@example.com
          </a>
        </p>
        <p>
          For shipping, payment and order questions, the{" "}
          <Link href="/faq" className="font-medium text-accent-violet hover:underline">
            FAQ
          </Link>{" "}
          covers what the demo does and does not do.
        </p>
      </div>
    </div>
  );
}
