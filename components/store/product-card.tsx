import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/store/price";
import type { Product } from "@/lib/products";
import { tintBackground } from "@/lib/tint";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const soldOut = product.totalStock === 0;
  const lowStock = !soldOut && product.totalStock <= 8;
  const onSale = !soldOut && product.compareAtPrice != null && product.compareAtPrice > product.price;
  return (
    <Link href={`/products/${product.slug}`} className="group block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-3xl transition-[transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:shadow-xl motion-reduce:transition-none"
        style={{ background: tintBackground(product.color), boxShadow: undefined }}
      >
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-contain p-5 drop-shadow-[0_12px_14px_rgba(30,27,46,0.18)] transition-[opacity,transform] duration-300 motion-reduce:transition-none ${product.backImage ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"}`}
          />
        )}
        {product.backImage && (
          <Image
            src={product.backImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-5 opacity-0 drop-shadow-[0_12px_14px_rgba(30,27,46,0.18)] transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {soldOut && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white">Sold out</span>}
          {onSale && <span className="rounded-full bg-coral px-2.5 py-1 text-[11px] font-semibold text-white">Sale</span>}
          {lowStock && <span className="rounded-full bg-sun px-2.5 py-1 text-[11px] font-semibold text-ink">Almost gone</span>}
        </div>
        {product.color && (
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-3 size-5 rounded-full ring-2 ring-white"
            style={{ background: product.color }}
          />
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 px-1">
        <p className="text-sm font-semibold leading-snug">{product.name}</p>
        <Price amount={product.price} compareAt={product.compareAtPrice} className="shrink-0 text-sm font-semibold text-plum" />
      </div>
    </Link>
  );
}
