"use client";

import { Info, Landmark, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { type CheckoutState, placeOrder } from "@/app/(store)/actions";
import { Totals } from "@/components/store/order-summary";
import { useValidatedCart } from "@/components/store/use-validated-cart";
import { DISTRICTS, store } from "@/lib/config";
import { formatPrice } from "@/lib/format";

const inputClass =
  "h-12 w-full rounded-xl border border-input bg-white px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20 sm:text-sm";

function Field({
  name,
  label,
  error,
  optional,
  className = "",
  children,
}: {
  name: string;
  label: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
}) {
  const errorId = `${name}-error`;
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </label>
      {React.cloneElement(children, { id: name, name, "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined } as React.InputHTMLAttributes<HTMLInputElement>)}
      {error && <p id={errorId} className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function CheckoutForm() {
  const cart = useValidatedCart();
  const router = useRouter();
  const [state, action, pending] = React.useActionState<CheckoutState, FormData>(placeOrder, {});
  const errorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (state.redirectTo) {
      cart.clear();
      router.replace(state.redirectTo);
    } else if (state.error) {
      errorRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.redirectTo) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-muted px-5 py-6 text-sm" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Order placed. Taking you to your payment details…
      </div>
    );
  }

  if (!cart.ready || cart.checking) {
    return <div className="h-96 animate-pulse rounded-3xl bg-muted" aria-busy="true" aria-label="Loading checkout" />;
  }

  if (cart.items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border px-6 py-20 text-center">
        <p className="font-display text-3xl">Your bag is empty</p>
        <Link href="/shop" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-background">Start shopping</Link>
      </div>
    );
  }

  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  const cartJson = JSON.stringify(cart.items.map(({ productId, size, quantity }) => ({ productId, size, quantity })));

  return (
    <form action={action} noValidate className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
      <input type="hidden" name="cart" value={cartJson} />

      <div className="space-y-10">
        {(state.error || cart.notices.length > 0) && (
          <div ref={errorRef} tabIndex={-1} role="alert" className="space-y-1 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900 outline-none dark:bg-red-400/10 dark:text-red-200">
            {state.error && <p>{state.error}</p>}
            {cart.notices.map((n) => <p key={n} className="flex gap-2"><Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{n}</p>)}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="mb-4 flex items-center gap-2 text-lg font-semibold"><span className="inline-flex size-7 items-center justify-center rounded-full bg-coral text-sm text-white">1</span> Contact</legend>
          <Field name="customerName" label="Full name" error={e.customerName}>
            <input className={inputClass} autoComplete="name" defaultValue={v.customerName} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="email" label="Email" error={e.email}>
              <input type="email" inputMode="email" className={inputClass} autoComplete="email" defaultValue={v.email} required />
            </Field>
            <Field name="phone" label="Mobile number" error={e.phone}>
              <input type="tel" inputMode="tel" className={inputClass} autoComplete="tel" placeholder="077 123 4567" defaultValue={v.phone} required />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-4 flex items-center gap-2 text-lg font-semibold"><span className="inline-flex size-7 items-center justify-center rounded-full bg-teal text-sm text-white">2</span> Delivery address</legend>
          <Field name="addressLine1" label="Street address" error={e.addressLine1}>
            <input className={inputClass} autoComplete="address-line1" defaultValue={v.addressLine1} required />
          </Field>
          <Field name="addressLine2" label="Apartment, landmark" optional error={e.addressLine2}>
            <input className={inputClass} autoComplete="address-line2" defaultValue={v.addressLine2} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="city" label="City / town" error={e.city}>
              <input className={inputClass} autoComplete="address-level2" defaultValue={v.city} required />
            </Field>
            <Field name="district" label="District" error={e.district}>
              <select className={inputClass} defaultValue={v.district ?? ""} required>
                <option value="" disabled>Select</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field name="postalCode" label="Postal code" optional error={e.postalCode}>
              <input className={inputClass} autoComplete="postal-code" inputMode="numeric" defaultValue={v.postalCode} />
            </Field>
          </div>
          <Field name="notes" label="Order notes" optional error={e.notes}>
            <textarea className={`${inputClass} h-24 py-3`} placeholder="Delivery instructions, gift message…" defaultValue={v.notes} />
          </Field>
        </fieldset>

        <section aria-labelledby="payment-heading" className="rounded-3xl bg-lilac p-6">
          <h2 id="payment-heading" className="flex items-center gap-2 text-lg font-semibold"><span className="inline-flex size-9 items-center justify-center rounded-full bg-plum text-white"><Landmark className="size-[18px]" aria-hidden="true" /></span> Payment: bank deposit</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Place your order. Your items are reserved for {store.paymentWindowHours} hours.</li>
            <li>Deposit <strong className="text-foreground">{formatPrice(cart.total)}</strong> to one of the accounts below, using your order number as the reference.</li>
            <li>Upload a photo of the slip from your order page or the link in your email.</li>
          </ol>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {store.bankAccounts.map((a) => (
              <li key={a.accountNumber} className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">
                <p className="font-medium">{a.bank}</p>
                <p className="text-muted-foreground">{a.branch} · {a.accountName}</p>
                <p className="mt-1 font-mono tracking-wide">{a.accountNumber}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-5 rounded-3xl border border-border bg-white p-6 shadow-sm lg:sticky lg:top-24" aria-label="Order summary">
        <h2 className="text-lg font-semibold">Your order</h2>
        <ul className="space-y-4">
          {cart.items.map((item) => (
            <li key={`${item.productId}-${item.size}`} className="flex gap-3">
              <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden rounded-lg bg-muted/70">
                {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-contain p-1" />}
                <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-coral text-[10px] font-semibold text-background">{item.quantity}</span>
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium leading-snug">{item.name}</p>
                <p className="text-muted-foreground">Size {item.size}</p>
              </div>
              <p className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <Totals subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total} />
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {pending ? "Placing order…" : `Place order · ${formatPrice(cart.total)}`}
        </button>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By placing your order you agree to pay by bank deposit within {store.paymentWindowHours} hours.
        </p>
        <Link href="/cart" className="block text-center text-sm underline-offset-4 hover:underline">Back to bag</Link>
      </aside>
    </form>
  );
}
