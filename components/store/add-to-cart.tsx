"use client";

import { Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { useCart } from "@/components/store/cart-provider";
import { SIZES, store } from "@/lib/config";

type Props = {
  product: { id: number; slug: string; name: string; image: string | null; price: number };
  stock: Record<string, number>;
};

export function AddToCart({ product, stock }: Props) {
  const cart = useCart();
  const [size, setSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);
  const [added, setAdded] = React.useState(false);

  const inBag = size ? (cart.items.find((i) => i.productId === product.id && i.size === size)?.quantity ?? 0) : 0;
  const available = size ? Math.max(0, (stock[size] ?? 0) - inBag) : 0;
  const maxQty = Math.min(store.maxQuantityPerLine, available);
  const soldOut = SIZES.every((s) => (stock[s] ?? 0) === 0);

  React.useEffect(() => setQuantity((q) => Math.max(1, Math.min(q, maxQty || 1))), [maxQty]);

  const add = () => {
    if (!size) {
      setError("Choose a size first.");
      return;
    }
    if (available < quantity) {
      setError(available === 0 ? "You already have all remaining stock in your bag." : `Only ${available} more available.`);
      return;
    }
    cart.add({ ...product, productId: product.id, size, available: stock[size] }, quantity);
    setError(null);
    setAdded(true);
  };

  return (
    <div>
      <fieldset>
        <legend className="mb-3 flex w-full items-center justify-between text-sm font-medium">
          Size
          {size && (stock[size] ?? 0) > 0 && (stock[size] ?? 0) <= 3 && (
            <span className="text-xs font-normal text-amber-700 dark:text-amber-300">Only {stock[size]} left</span>
          )}
        </legend>
        <div className="grid grid-cols-5 gap-2">
          {SIZES.map((s) => {
            const out = (stock[s] ?? 0) === 0;
            const selected = size === s;
            return (
              <label
                key={s}
                className={`relative flex h-12 items-center justify-center rounded-xl border text-sm transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${
                  out
                    ? "cursor-not-allowed border-border text-muted-foreground/60 line-through"
                    : selected
                      ? "cursor-pointer border-primary bg-primary text-primary-foreground"
                      : "cursor-pointer border-border hover:border-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="size"
                  value={s}
                  disabled={out}
                  checked={selected}
                  onChange={() => {
                    setSize(s);
                    setError(null);
                    setAdded(false);
                  }}
                  className="sr-only"
                />
                {s}
                {out && <span className="sr-only"> (sold out)</span>}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 flex gap-3">
        <div className="flex h-12 items-center rounded-full border border-border" role="group" aria-label="Quantity">
          <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)} className="inline-flex size-12 items-center justify-center rounded-full disabled:opacity-40">
            <Minus className="size-4" />
          </button>
          <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{quantity}</span>
          <button type="button" aria-label="Increase quantity" disabled={!size || quantity >= maxQty} onClick={() => setQuantity((q) => q + 1)} className="inline-flex size-12 items-center justify-center rounded-full disabled:opacity-40">
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={soldOut}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-background transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {soldOut ? "Sold out" : "Add to bag"}
        </button>
      </div>

      <div aria-live="polite" className="min-h-6">
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        {added && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2"><Check className="size-4" aria-hidden="true" /> Added to your bag</span>
            <span className="flex gap-4">
              <Link href="/cart" className="font-medium underline-offset-4 hover:underline">View bag</Link>
              <Link href="/checkout" className="font-medium underline-offset-4 hover:underline">Checkout</Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
