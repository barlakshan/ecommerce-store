"use client";

import { Menu, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { useCart } from "@/components/store/cart-provider";
import { CATEGORIES, store } from "@/lib/config";
import { formatPrice } from "@/lib/format";

const NAV = [{ href: "/shop", label: "Shop all" }, ...CATEGORIES.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.name }))];

const ANNOUNCEMENTS = [
  `Free island-wide delivery over ${formatPrice(store.freeShippingThreshold)}`,
  "New season just landed",
  "Pay easily by bank deposit",
  "Exchanges within 7 days",
];

/** Colourful wordmark: each letter gets a brand colour. */
export function Logo({ className = "" }: { className?: string }) {
  // Yellow is kept for the dot only: it's too light to read as a letter on cream.
  const colors = ["text-plum", "text-coral", "text-teal"];
  return (
    <span className={`font-display text-[26px] font-semibold leading-none tracking-tight ${className}`}>
      <span className="sr-only">{store.name}</span>
      {store.name.split("").map((ch, i) => (
        <span key={i} aria-hidden="true" className={colors[i % colors.length]}>{ch}</span>
      ))}
      <span aria-hidden="true" className="text-sun">.</span>
    </span>
  );
}

function AnnouncementBar() {
  const items = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];
  return (
    <div className="overflow-hidden bg-gradient-to-r from-plum via-coral to-sun text-white">
      <p className="sr-only">{ANNOUNCEMENTS.join(". ")}</p>
      <div aria-hidden="true" className="flex w-max animate-marquee gap-10 py-2 text-[13px] font-medium">
        {items.map((text, i) => (
          <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
            <Sparkles className="size-3.5" /> {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { count, ready } = useCart();
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
              className="-ml-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-muted md:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link href="/" className="rounded-lg">
              <Logo />
            </Link>
          </div>

          <nav aria-label="Main" className="hidden items-center gap-1 text-sm md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 font-medium text-foreground/75 transition-colors duration-200 hover:bg-butter hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link href="/shop" aria-label="Search the shop" className="inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-sky">
              <Search className="size-[18px]" />
            </Link>
            <Link href="/track" className="hidden h-11 items-center rounded-full px-3 text-sm font-medium text-foreground/75 transition-colors hover:bg-mint hover:text-foreground sm:inline-flex">
              Track order
            </Link>
            <Link
              href="/cart"
              aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
              className="relative inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:scale-105 motion-reduce:transition-none"
            >
              <ShoppingBag className="size-[18px]" />
              {ready && count > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold leading-[20px] text-white ring-2 ring-background">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border/70 px-4 pb-4 pt-2 md:hidden">
            <ul className="flex flex-col">
              {[...NAV, { href: "/track", label: "Track order" }].map((item, i) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex h-12 items-center gap-3 border-b border-border/50 text-base">
                    <span aria-hidden="true" className={`size-2.5 rounded-full ${["bg-plum", "bg-coral", "bg-teal", "bg-sun", "bg-blush", "bg-sky"][i % 6]}`} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
