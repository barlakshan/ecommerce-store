import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/store/product-card";
import { ShopToolbar } from "@/components/store/shop-toolbar";
import { CATEGORIES } from "@/lib/config";
import { getProducts, type ProductSort } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop" };

const BANNER: Record<string, string> = {
  all: "bg-gradient-to-br from-lilac via-blush to-butter",
  tees: "bg-gradient-to-br from-butter to-sun/60",
  shirts: "bg-gradient-to-br from-sky to-lilac",
  knitwear: "bg-gradient-to-br from-mint to-teal/40",
  sweats: "bg-gradient-to-br from-blush to-coral/40",
};

const SORTS: ProductSort[] = ["featured", "newest", "price-asc", "price-desc"];

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const category = CATEGORIES.find((c) => c.slug === params.category);
  const sort = SORTS.includes(params.sort as ProductSort) ? (params.sort as ProductSort) : "featured";
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 60) : "";
  const products = getProducts({ category: category?.slug, sort, query: query || undefined });

  const href = (next: Record<string, string | undefined>) => {
    const merged = { category: category?.slug, sort: sort === "featured" ? undefined : sort, q: query || undefined, ...next };
    const qs = new URLSearchParams(Object.entries(merged).filter((e): e is [string, string] => Boolean(e[1]))).toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10">
      <header className={`relative mb-8 overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 ${BANNER[category?.slug ?? "all"]}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/40 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-24 size-24 rounded-full bg-white/30" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">Shop</p>
        <h1 className="relative mt-2 font-display text-5xl font-semibold leading-tight sm:text-6xl">{category?.name ?? "All clothing"}</h1>
        <p className="relative mt-2 max-w-md text-sm text-ink/70">{products.length} {products.length === 1 ? "piece" : "pieces"} in bright, breathable fabrics made for island weather.</p>
      </header>

      <nav aria-label="Categories" className="-mx-4 mb-6 overflow-x-auto px-4">
        <ul className="flex w-max gap-2">
          {[{ slug: undefined, name: "All" }, ...CATEGORIES].map((c) => {
            const active = c.slug === category?.slug;
            return (
              <li key={c.name}>
                <Link
                  href={href({ category: c.slug })}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-10 items-center rounded-full border px-4 text-sm transition-colors duration-200 ${active ? "border-primary bg-primary text-primary-foreground shadow-md shadow-plum/20" : "border-border bg-white hover:border-plum/40 hover:bg-lilac"}`}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <ShopToolbar count={products.length} sort={sort} query={query} />

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-20 text-center">
          <p className="font-display text-3xl">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Try another category or search term.</p>
          <Link href="/shop" className="mt-6 inline-flex h-10 items-center rounded-full border border-border px-5 text-sm hover:bg-muted">Clear filters</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
      )}
    </div>
  );
}
