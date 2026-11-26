import { ArrowRight, Landmark, RotateCcw, Sparkles, Truck, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/store/product-card";
import ClothingRailHero, { type GarmentKind, type RailGarment } from "@/components/ui/product-rail-gallery";
import { CATEGORIES, store } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { getFeaturedProducts, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const KINDS: GarmentKind[] = ["tee", "knit", "hoodie", "shirt", "jacket", "coat"];

const CATEGORY_STYLE: Record<string, { bg: string; dot: string }> = {
  tees: { bg: "bg-butter", dot: "bg-sun" },
  shirts: { bg: "bg-sky", dot: "bg-plum" },
  knitwear: { bg: "bg-mint", dot: "bg-teal" },
  sweats: { bg: "bg-blush", dot: "bg-coral" },
};

export default function HomePage() {
  const featured = getFeaturedProducts(10);
  const all = getProducts({ sort: "newest" });
  const newest = all.slice(0, 8);

  const garments: RailGarment[] = featured.map((p) => ({
    id: String(p.id),
    name: p.name,
    description: p.description,
    kind: KINDS.includes(p.kind as GarmentKind) ? (p.kind as GarmentKind) : "tee",
    color: p.color ?? undefined,
    tag: formatPrice(p.price),
    details: p.details,
    image: p.image ?? undefined,
    backImage: p.backImage ?? undefined,
    sideImage: p.sideImage ?? undefined,
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-butter via-blush/60 to-background">
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-16 -z-10 size-72 rounded-full bg-sun/40 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-0 -z-10 size-80 rounded-full bg-coral/30 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-10 left-1/3 -z-10 size-72 rounded-full bg-sky/70 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-1/4 -z-10 size-56 rounded-full bg-lilac blur-3xl" />

        <ClothingRailHero
          items={garments}
          hanger="none"
          autoplay
          className="bg-transparent!"
          eyebrow={`New season · ${garments.length} pieces on the rail`}
          heading="Everyday clothing, hung with colour."
          caption="Brush along the rail, slide a hanger, tap a piece to see the back."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-plum/25 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-plum/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                Shop the collection <ArrowRight className="size-4" />
              </Link>
              <Link href="/shop?sort=newest" className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-ink/80 bg-white/60 px-6 text-sm font-semibold backdrop-blur transition-colors hover:bg-white">
                <Sparkles className="size-4 text-coral" /> What&apos;s new
              </Link>
            </div>
          }
        />
      </section>

      {/* Perks */}
      <section aria-label="Why shop with us" className="mx-auto max-w-6xl px-4 pt-6">
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, text: `Free delivery over ${formatPrice(store.freeShippingThreshold)}`, tone: "bg-mint text-ink", iconTone: "text-teal" },
            { icon: Landmark, text: "Pay by simple bank deposit", tone: "bg-lilac text-ink", iconTone: "text-plum" },
            { icon: RotateCcw, text: "Easy size exchanges in 7 days", tone: "bg-blush text-ink", iconTone: "text-coral" },
          ].map(({ icon: Icon, text, tone, iconTone }) => (
            <li key={text} className={`flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-medium ${tone}`}>
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-white">
                <Icon className={`size-[18px] ${iconTone}`} aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <section aria-labelledby="categories" className="mx-auto max-w-6xl px-4 pt-16">
        <h2 id="categories" className="mb-6 font-display text-4xl leading-tight sm:text-5xl">
          Shop by <span className="relative isolate whitespace-nowrap text-plum">category<span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-3 -z-10 rounded-full bg-sun/60" /></span>
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => {
            const style = CATEGORY_STYLE[c.slug] ?? { bg: "bg-muted", dot: "bg-plum" };
            const sample = all.find((p) => p.category === c.slug && p.image);
            const count = all.filter((p) => p.category === c.slug).length;
            return (
              <li key={c.slug}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className={`group relative flex h-56 flex-col justify-between overflow-hidden rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none sm:h-64 ${style.bg}`}
                >
                  <span className="relative z-10 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium">
                    <span className={`size-2 rounded-full ${style.dot}`} aria-hidden="true" /> {count} {count === 1 ? "piece" : "pieces"}
                  </span>
                  {sample?.image && (
                    <Image
                      src={sample.image}
                      alt=""
                      width={200}
                      height={310}
                      className="absolute -bottom-6 -right-6 h-48 w-auto rotate-[8deg] object-contain transition-transform duration-300 group-hover:rotate-[2deg] group-hover:scale-105 motion-reduce:transition-none sm:h-56"
                    />
                  )}
                  <span className="relative z-10 flex items-end justify-between gap-2">
                    <span className="max-w-[9ch] font-display text-3xl font-semibold leading-none sm:text-4xl">{c.name}</span>
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* New arrivals */}
      <section aria-labelledby="new-in" className="mx-auto max-w-6xl px-4 pt-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-coral/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-coral-deep">
              <Sparkles className="size-3.5" aria-hidden="true" /> Just in
            </p>
            <h2 id="new-in" className="mt-3 font-display text-4xl leading-tight sm:text-5xl">New arrivals</h2>
          </div>
          <Link href="/shop?sort=newest" className="hidden items-center gap-1.5 rounded-full bg-lilac px-4 py-2 text-sm font-semibold text-plum transition-colors hover:bg-plum hover:text-white sm:inline-flex">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {newest.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
      </section>

      {/* Shop by colour */}
      <section aria-labelledby="by-colour" className="mx-auto max-w-6xl px-4 pt-20">
        <div className="rounded-[2rem] border-2 border-dashed border-border bg-white px-6 py-10 sm:px-10">
          <h2 id="by-colour" className="font-display text-4xl leading-tight">Pick a colour, any colour</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tap a swatch to jump straight to that piece.</p>
          <ul className="mt-8 flex flex-wrap gap-4">
            {all.filter((p) => p.color).map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`} className="group flex flex-col items-center gap-2 rounded-2xl p-1 text-center">
                  <span
                    className="block size-16 rounded-full shadow-inner ring-4 ring-white transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none sm:size-20"
                    style={{ background: `radial-gradient(circle at 30% 30%, color-mix(in oklab, ${p.color} 70%, white), ${p.color})`, boxShadow: `0 10px 24px -8px ${p.color}` }}
                    aria-hidden="true"
                  />
                  <span className="max-w-[10ch] text-xs font-medium leading-tight">{p.name.split("·")[0]?.trim()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How to pay */}
      <section aria-labelledby="how-to-pay" className="mx-auto max-w-6xl px-4 pt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-plum px-6 py-14 text-white sm:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-coral/40 blur-2xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-10 size-64 rounded-full bg-teal/40 blur-2xl" />
          <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-sun">Simple, secure checkout</p>
          <h2 id="how-to-pay" className="relative mt-2 max-w-xl font-display text-4xl leading-tight sm:text-5xl">Pay by bank deposit, in three easy steps</h2>
          <ol className="relative mt-10 grid gap-4 md:grid-cols-3">
            {[
              { icon: Landmark, title: "Place your order", body: "We reserve your pieces and email you our bank account details.", tone: "bg-sun" },
              { icon: Upload, title: "Deposit & upload the slip", body: `Pay at a branch, CDM or online banking within ${store.paymentWindowHours} hours, then upload a photo of the slip.`, tone: "bg-blush" },
              { icon: Truck, title: "We confirm & deliver", body: `Once the deposit is confirmed we ship island-wide. Free delivery over ${formatPrice(store.freeShippingThreshold)}.`, tone: "bg-mint" },
            ].map((step, i) => (
              <li key={step.title} className={`rounded-3xl p-6 text-ink ${step.tone}`}>
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-white">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-5xl font-semibold leading-none text-ink/20">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/75">{step.body}</p>
              </li>
            ))}
          </ol>
          <Link href="/how-to-pay" className="relative mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-plum transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
            Read the full guide <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
