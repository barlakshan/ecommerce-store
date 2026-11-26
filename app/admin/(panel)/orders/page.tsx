import { Search } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/orders/order-parts";
import { formatDateTime, formatPrice } from "@/lib/format";
import { isOrderStatus, ORDER_STATUSES, STATUS_LABEL } from "@/lib/order-status";
import { getOrderStats, listOrders } from "@/lib/orders";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const status = params.status && isOrderStatus(params.status) ? params.status : undefined;
  const query = params.q?.trim().slice(0, 80) ?? "";
  const orders = listOrders({ status, query: query || undefined });
  const counts = getOrderStats().byStatus;
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);

  const tabHref = (s?: string) => {
    const qs = new URLSearchParams();
    if (s) qs.set("status", s);
    if (query) qs.set("q", query);
    const str = qs.toString();
    return str ? `/admin/orders?${str}` : "/admin/orders";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <form role="search" className="relative w-full sm:w-80">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="q" className="sr-only">Search orders</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input id="q" name="q" type="search" defaultValue={query} placeholder="Order no., name, email, phone, ref" className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40" />
        </form>
      </div>

      <nav aria-label="Filter by status" className="-mx-4 overflow-x-auto px-4">
        <ul className="flex w-max gap-1.5">
          {[{ key: undefined, label: "All", count: total }, ...ORDER_STATUSES.map((s) => ({ key: s, label: STATUS_LABEL[s], count: counts[s] ?? 0 }))].map((tab) => {
            const active = tab.key === status;
            return (
              <li key={tab.label}>
                <Link
                  href={tabHref(tab.key)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
                >
                  {tab.label}
                  <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? "bg-background/20" : "bg-muted"}`}>{tab.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        {orders.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-muted-foreground">No orders match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Order</th>
                  <th scope="col" className="px-5 py-3 font-medium">Customer</th>
                  <th scope="col" className="px-5 py-3 font-medium">Items</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Total</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                  <th scope="col" className="px-5 py-3 font-medium">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.number}`} className="font-mono font-medium hover:underline">{o.number}</Link>
                    </td>
                    <td className="px-5 py-3">
                      <p>{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.district} · {o.phone}</p>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-muted-foreground">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
