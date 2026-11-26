"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

const SORT_LABELS = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;

export function ShopToolbar({ count, sort, query }: { count: number; sort: string; query: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(query);

  const push = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && !(key === "sort" && value === "featured")) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          push("q", q.trim());
        }}
        className="relative w-full sm:max-w-xs"
      >
        <label htmlFor="shop-search" className="sr-only">Search products</label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id="shop-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tees, knits…"
          className="h-11 w-full rounded-full border border-input bg-transparent pl-10 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:text-sm"
        />
      </form>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <p className="text-sm text-muted-foreground" aria-live="polite">{count} {count === 1 ? "piece" : "pieces"}</p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort</span>
          <select
            value={sort}
            onChange={(e) => push("sort", e.target.value)}
            className="h-11 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
