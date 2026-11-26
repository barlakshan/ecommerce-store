import Image from "next/image";
import Link from "next/link";

import { ProductRowForm } from "@/components/admin/product-row-form";
import { CATEGORIES } from "@/lib/config";
import { getProducts } from "@/lib/products";

export const metadata = { title: "Products & stock" };

export default function AdminProductsPage() {
  const products = getProducts({ includeInactive: true });
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Products & stock</h1>
        <p className="mt-1 text-sm text-muted-foreground">Edit prices and stock per size. Stock is reserved when an order is placed and returned if it&apos;s cancelled.</p>
      </div>
      <ul className="space-y-3">
        {products.map((p) => (
          <li key={p.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="mb-4 flex items-center gap-4">
              <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {p.image && <Image src={p.image} alt="" fill sizes="48px" className="object-contain p-1" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${p.slug}`} target="_blank" className="font-medium hover:underline">{p.name}</Link>
                <p className="text-xs text-muted-foreground">{CATEGORIES.find((c) => c.slug === p.category)?.name ?? p.category} · {p.totalStock} in stock</p>
              </div>
            </div>
            <ProductRowForm product={{ id: p.id, price: p.price, compareAtPrice: p.compareAtPrice, active: p.active, featured: p.featured, stock: p.stock }} />
          </li>
        ))}
      </ul>
    </div>
  );
}
