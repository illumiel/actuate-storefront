export const metadata = { title: "FAQ — Actuate" };

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "shipping",
    question: "Shipping and payment",
    answer:
      "This is a demo store, so nothing ships. The checkout still lets you pick cash on delivery, GCash or card, and it records the choice with the order.",
  },
  {
    id: "orders",
    question: "What happens when I place an order?",
    answer:
      "You get an order reference number and the cart clears. The order is stored by the demo Order Service, and you can place as many as you like.",
  },
  {
    id: "account",
    question: "Do I need an account?",
    answer:
      "No. There are no accounts or passwords here. Checkout only asks for a name, a mobile number and the delivery details.",
  },
  {
    id: "email",
    question: "Will you email me?",
    answer:
      "No. The email field is optional and nothing is sent. If you sign up to the newsletter, the address only goes into your own browser storage.",
  },
  {
    id: "stock",
    question: "Are the stock numbers real?",
    answer:
      "They come from a sample inventory service. If an item runs out during the demo, checkout will tell you instead of accepting the order.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-display text-3xl font-bold text-ink">
        Frequently asked questions
      </h1>
      <div className="space-y-8">
        {FAQS.map((item) => (
          <section key={item.id} id={item.id} className="scroll-mt-24 space-y-2">
            <h2 className="font-display text-lg font-semibold text-ink">
              {item.question}
            </h2>
            <p className="text-ink-muted">{item.answer}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
