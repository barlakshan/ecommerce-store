import type { Metadata } from "next";

import { CheckoutForm } from "@/components/store/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="mb-2 font-display text-5xl font-semibold">Check<span className="text-plum">out</span></h1>
      <p className="mb-10 text-sm text-muted-foreground">Payment is by bank deposit. We&apos;ll reserve your items and email our account details.</p>
      <CheckoutForm />
    </div>
  );
}
