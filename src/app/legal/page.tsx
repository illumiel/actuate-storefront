export const metadata = { title: "Legal — Actuate" };

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold text-ink">Legal</h1>
        <p className="text-ink-muted">
          Actuate is a portfolio demo, not a business. Nothing on this site is a real offer
          to sell, and no goods, payments or deliveries are involved.
        </p>
      </div>

      <section id="returns" className="scroll-mt-24 space-y-2">
        <h2 className="font-display text-lg font-semibold text-ink">
          Return and refund policy
        </h2>
        <p className="text-ink-muted">
          There are no returns or refunds, because no order is fulfilled. Orders placed in
          the demo only exist as records you can review in the confirmation screen.
        </p>
        <p className="text-ink-muted">
          Any prices shown are sample values and are not charged to anyone.
        </p>
      </section>

      <section id="terms" className="scroll-mt-24 space-y-2">
        <h2 className="font-display text-lg font-semibold text-ink">Terms of use</h2>
        <p className="text-ink-muted">
          Use this site to look around. It is provided as-is, with no warranty and no
          service level of any kind.
        </p>
        <p className="text-ink-muted">
          Product names, brands and logos belong to their respective owners and are shown
          here only to illustrate the demo.
        </p>
      </section>

      <section id="privacy" className="scroll-mt-24 space-y-2">
        <h2 className="font-display text-lg font-semibold text-ink">Privacy</h2>
        <p className="text-ink-muted">
          Checkout details are sent to the demo Order Service so an order can be created.
          Nothing is sold, shared or used for marketing.
        </p>
        <p className="text-ink-muted">
          The newsletter sign-up stores the address in your own browser only. Clearing site
          data removes it.
        </p>
      </section>
    </div>
  );
}
