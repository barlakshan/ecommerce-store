import type { Metadata } from "next";

import { CartView } from "@/components/store/cart-view";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="mb-8 font-display text-5xl font-semibold">Your <span className="text-coral-deep">bag</span></h1>
      <CartView />
    </div>
  );
}
