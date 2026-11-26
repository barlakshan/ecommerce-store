"use client";

import { Check, Loader2 } from "lucide-react";
import * as React from "react";

import { type ProductActionState, saveProduct } from "@/app/admin/actions";
import { SIZES } from "@/lib/config";

const inputClass =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

type Props = {
  product: { id: number; price: number; compareAtPrice: number | null; active: boolean; featured: boolean; stock: Record<string, number> };
};

export function ProductRowForm({ product }: Props) {
  const [state, action, pending] = React.useActionState<ProductActionState, FormData>(saveProduct, {});
  const id = (name: string) => `p${product.id}-${name}`;

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={product.id} />
      <div className="w-28">
        <label htmlFor={id("price")} className="mb-1 block text-xs text-muted-foreground">Price (LKR)</label>
        <input id={id("price")} name="price" type="number" min={1} step={1} defaultValue={product.price} className={inputClass} required />
      </div>
      <div className="w-28">
        <label htmlFor={id("compare")} className="mb-1 block text-xs text-muted-foreground">Was (optional)</label>
        <input id={id("compare")} name="compareAtPrice" type="number" min={1} step={1} defaultValue={product.compareAtPrice ?? ""} className={inputClass} />
      </div>
      <fieldset className="flex gap-1.5">
        <legend className="mb-1 text-xs text-muted-foreground">Stock by size</legend>
        {SIZES.map((s) => (
          <div key={s} className="w-14">
            <label htmlFor={id(`stock-${s}`)} className="sr-only">Stock {s}</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2 top-1 text-[9px] font-semibold text-muted-foreground" aria-hidden="true">{s}</span>
              <input id={id(`stock-${s}`)} name={`stock_${s}`} type="number" min={0} step={1} defaultValue={product.stock[s] ?? 0} className={`${inputClass} pt-3 text-center ${(product.stock[s] ?? 0) === 0 ? "text-destructive" : ""}`} />
            </div>
          </div>
        ))}
      </fieldset>
      <label className="flex h-10 items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={product.active} className="size-4 accent-foreground" /> On sale
      </label>
      <label className="flex h-10 items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={product.featured} className="size-4 accent-foreground" /> On home rail
      </label>
      <div className="ml-auto flex items-center gap-3">
        <span aria-live="polite" className="text-sm">
          {state.error && <span className="text-destructive">{state.error}</span>}
          {state.message && !pending && <span className="inline-flex items-center gap-1 text-emerald-700"><Check className="size-4" aria-hidden="true" />{state.message}</span>}
        </span>
        <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-background disabled:opacity-60">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Save
        </button>
      </div>
    </form>
  );
}
