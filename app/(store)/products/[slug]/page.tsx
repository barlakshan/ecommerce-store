import { ChevronRight, Landmark, RotateCcw, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/store/add-to-cart";
import { Price } from "@/components/store/price";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { CATEGORIES, store } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  if (!product) return { title: "Not found" };
  return { title: product.name, description: product.description, openGraph: { images: product.image ? [product.image] : [] } };
}

export default async function ProductPage({ params }: Props) {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = getRelatedProducts(product, 4);
  const category = CATEGORIES.find((c) => c.slug === product.category);
  const images = [
    { src: product.image, label: "Front" },
    { src: product.backImage, label: "Back" },
    { src: product.sideImage, label: "Side" },
  ].filter((i): i is { src: string; label: string } => Boolean(i.src));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/shop" className="hover:text-foreground">Shop</Link></li>
          {category && (
            <>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <li><Link href={`/shop?category=${category.slug}`} className="hover:text-foreground">{category.name}</Link></li>
            </>
          )}
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li aria-current="page" className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <ProductGallery images={images} name={product.name} color={product.color} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Price amount={product.price} compareAt={product.compareAtPrice} className="!justify-start text-2xl font-semibold text-plum" />
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="rounded-full bg-coral px-2.5 py-1 text-xs font-semibold text-white">
                Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              </span>
            )}
          </div>
          {product.color && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow-sm">
              <span className="size-4 rounded-full ring-2 ring-white" style={{ background: product.color, boxShadow: `0 0 0 1px ${product.color}` }} aria-hidden="true" />
              Colour shown
            </p>
          )}
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">{product.description}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {product.details.map((d, i) => (
              <li key={d} className={`rounded-full px-3 py-1 text-xs font-medium text-ink ${["bg-butter", "bg-mint", "bg-sky", "bg-blush"][i % 4]}`}>{d}</li>
            ))}
          </ul>

          <div className="mt-8">
            <AddToCart
              product={{ id: product.id, slug: product.slug, name: product.name, image: product.image, price: product.price }}
              stock={product.stock}
            />
          </div>

          <div className="mt-8 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-white">
            <details className="group px-5 py-4" open>
              <summary className="flex list-none items-center gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-lilac"><Landmark className="size-4 text-plum" aria-hidden="true" /></span> Bank deposit payment
                <ChevronRight className="ml-auto size-4 transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Place your order and we&apos;ll email our bank details. Deposit within {store.paymentWindowHours} hours and upload the slip. Your pieces are reserved meanwhile.
              </p>
            </details>
            <details className="group px-5 py-4">
              <summary className="flex list-none items-center gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-mint"><Truck className="size-4 text-teal" aria-hidden="true" /></span> Delivery
                <ChevronRight className="ml-auto size-4 transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Island-wide delivery in 1–3 business days after payment is confirmed. {formatPrice(store.shippingFee)} per order, free over {formatPrice(store.freeShippingThreshold)}.
              </p>
            </details>
            <details className="group px-5 py-4">
              <summary className="flex list-none items-center gap-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-blush"><RotateCcw className="size-4 text-coral" aria-hidden="true" /></span> Exchanges
                <ChevronRight className="ml-auto size-4 transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Wrong size? Contact us within 7 days of delivery for an exchange. Items must be unworn with tags attached.
              </p>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="pt-24">
          <h2 id="related" className="mb-8 font-display text-4xl">You may also <span className="text-coral-deep">love</span></h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
