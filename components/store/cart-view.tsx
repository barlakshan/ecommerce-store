"use client";

import { Info, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Totals } from "@/components/store/order-summary";
import { useValidatedCart } from "@/components/store/use-validated-cart";
import { store } from "@/lib/config";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const cart = useValidatedCart();

  if (!cart.ready || (cart.checking && cart.items.length > 0)) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]" aria-busy="true" aria-label="Loading your bag">
        <div className="space-y-4">{[0, 1].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}</div>
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border px-6 py-20 text-center">
        {cart.notices.map((n) => <p key={n} className="mb-2 text-sm text-muted-foreground">{n}</p>)}
        <p className="font-display text-3xl">Your bag is empty</p>
        <p className="mt-2 text-sm text-muted-foreground">Find something you love on the rail.</p>
        <Link href="/shop" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-background">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        {cart.notices.length > 0 && (
          <div role="status" className="mb-6 space-y-1 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
            {cart.notices.map((n) => <p key={n} className="flex gap-2"><Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{n}</p>)}
          </div>
        )}
        <ul className="divide-y divide-border border-y border-border">
          {cart.items.map((item) => {
            const max = Math.min(store.maxQuantityPerLine, item.available ?? store.maxQuantityPerLine);
            return (
              <li key={`${item.productId}-${item.size}`} className="flex gap-4 py-5">
                <Link href={`/products/${item.slug}`} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-lilac to-blush sm:w-28">
                  {item.image && <Image src={item.image} alt={item.name} fill sizes="112px" className="object-contain p-2" />}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link href={`/products/${item.slug}`} className="font-medium hover:underline">{item.name}</Link>
                      <p className="mt-1 text-sm text-muted-foreground">Size {item.size} · {formatPrice(item.price)}</p>
                    </div>
                    <p className="font-medium tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex h-10 items-center rounded-full border border-border" role="group" aria-label={`Quantity of ${item.name}`}>
                      <button type="button" aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => cart.setQuantity(item.productId, item.size, item.quantity - 1)} className="inline-flex size-10 items-center justify-center rounded-full disabled:opacity-40">
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                      <button type="button" aria-label="Increase quantity" disabled={item.quantity >= max} onClick={() => cart.setQuantity(item.productId, item.size, item.quantity + 1)} className="inline-flex size-10 items-center justify-center rounded-full disabled:opacity-40">
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button type="button" onClick={() => cart.remove(item.productId, item.size)} className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                      <Trash2 className="size-4" aria-hidden="true" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="space-y-5 rounded-3xl border-t-[6px] border-coral bg-white p-6 shadow-lg shadow-coral/10 lg:sticky lg:top-24" aria-label="Order summary">
        <h2 className="text-lg font-semibold">Summary</h2>
        <Totals subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total} showFreeShippingHint />
        <Link href="/checkout" className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          Checkout
        </Link>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">Payment by bank deposit. You&apos;ll get our account details after placing the order.</p>
      </aside>
    </div>
  );
}
