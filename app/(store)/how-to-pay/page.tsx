import type { Metadata } from "next";
import Link from "next/link";

import { store } from "@/lib/config";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "How to pay by bank deposit" };

const FAQ = [
  {
    q: "Why bank deposit only?",
    a: "It keeps our prices low: no card fees and no payment gateway charges. You can pay at a branch, a cash deposit machine, or with online banking.",
  },
  {
    q: "How long do I have to pay?",
    a: `${store.paymentWindowHours} hours from placing your order. We hold your items for you until then. After that the order is cancelled automatically and the items go back on the rail.`,
  },
  {
    q: "What should I write as the reference?",
    a: "Your order number, e.g. RL-261126-1234. It helps us match your deposit quickly.",
  },
  {
    q: "How long does confirmation take?",
    a: "Usually a few business hours after you upload the slip. Online transfers between different banks can take up to one business day to show on our statement.",
  },
  {
    q: "I paid the wrong amount.",
    a: `Upload the slip anyway and reply to your order email. If you underpaid we'll ask for the difference; if you overpaid we'll refund it. You can also call us on ${store.supportPhone}.`,
  },
  {
    q: "What if my order is cancelled after I've paid?",
    a: "We refund the full amount to your bank account within 3 business days.",
  },
];

export default function HowToPayPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Payment guide</p>
      <h1 className="mt-2 font-display text-5xl leading-tight">How to pay by bank deposit</h1>

      <ol className="mt-10 space-y-6">
        {[
          "Add your pieces to the bag and check out. We reserve the stock and email you the bank details.",
          "Deposit the exact order total into one of the accounts below. Use your order number as the reference.",
          "Take a clear photo of the slip (or a screenshot of the online transfer) and upload it from your order page.",
          `We confirm the payment and ship your order. Delivery is ${formatPrice(store.shippingFee)}, free over ${formatPrice(store.freeShippingThreshold)}.`,
        ].map((step, i) => (
          <li key={step} className="flex gap-4">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">{i + 1}</span>
            <p className="pt-1.5 text-[15px] leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-lg font-semibold">Our bank accounts</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {store.bankAccounts.map((a) => (
          <li key={a.accountNumber} className="rounded-2xl border border-border p-5 text-sm">
            <p className="font-medium">{a.bank}</p>
            <p className="text-muted-foreground">{a.branch} branch</p>
            <p className="mt-3 text-muted-foreground">Account name</p>
            <p>{a.accountName}</p>
            <p className="mt-2 text-muted-foreground">Account number</p>
            <p className="font-mono text-base tracking-wide">{a.accountNumber}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-lg font-semibold">Questions</h2>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {FAQ.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex list-none items-center justify-between gap-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden="true" className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/shop" className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-background">Start shopping</Link>
        <Link href="/track" className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm hover:bg-muted">Upload a slip for an order</Link>
      </div>
    </div>
  );
}
