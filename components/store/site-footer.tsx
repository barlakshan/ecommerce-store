import { Landmark, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { CATEGORIES, store } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-plum/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 top-10 size-64 rounded-full bg-coral/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/3 size-56 rounded-full bg-teal/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <p className="font-display text-4xl font-semibold">
            <span className="text-sun">R</span><span className="text-blush">a</span><span className="text-mint">i</span><span className="text-sky">l</span><span className="text-coral">.</span>
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">{store.tagline}</p>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/85">
            <Landmark className="size-3.5 text-sun" aria-hidden="true" /> Bank deposit payments only
          </p>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-sun">Shop</p>
          <ul className="space-y-2.5 text-sm text-white/80">
            <li><Link href="/shop" className="hover:text-white hover:underline">Shop all</Link></li>
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link href={`/shop?category=${c.slug}`} className="hover:text-white hover:underline">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-mint">Orders</p>
          <ul className="space-y-2.5 text-sm text-white/80">
            <li><Link href="/track" className="hover:text-white hover:underline">Track an order</Link></li>
            <li><Link href="/how-to-pay" className="hover:text-white hover:underline">How to pay by bank deposit</Link></li>
            <li><Link href="/cart" className="hover:text-white hover:underline">Your bag</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-blush">Say hello</p>
          <ul className="space-y-2.5 text-sm text-white/80">
            <li><a href={`mailto:${store.supportEmail}`} className="inline-flex items-center gap-2 hover:text-white hover:underline"><Mail className="size-4 text-coral" aria-hidden="true" />{store.supportEmail}</a></li>
            <li><a href={`tel:${store.supportPhone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-white hover:underline"><Phone className="size-4 text-teal" aria-hidden="true" />{store.supportPhone}</a></li>
            <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-sun" aria-hidden="true" />{store.address}</li>
          </ul>
        </div>
      </div>
      <div className="relative h-1.5 bg-gradient-to-r from-plum via-coral via-50% to-sun" aria-hidden="true" />
      <div className="relative">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-white/60">
          © {new Date().getFullYear()} {store.legalName}. Made with colour in Sri Lanka.
        </p>
      </div>
    </footer>
  );
}
