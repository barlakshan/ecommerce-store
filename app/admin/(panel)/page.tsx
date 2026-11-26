import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/orders/order-parts";
import { env } from "@/lib/env";
import { formatDateTime, formatPrice } from "@/lib/format";
import { STATUS_LABEL, type OrderStatus } from "@/lib/order-status";
import { getOrderStats, listOrders } from "@/lib/orders";

export const metadata = { title: "Dashboard" };

const TODO: { status: OrderStatus; hint: string; tone: string }[] = [
  { status: "payment_submitted", hint: "Slips to check against the bank statement", tone: "bg-sky" },
  { status: "paid", hint: "Paid orders ready to pack", tone: "bg-mint" },
  { status: "processing", hint: "Packed orders waiting for courier", tone: "bg-lilac" },
  { status: "awaiting_payment", hint: "Waiting for the customer's deposit", tone: "bg-butter" },
];

export default function AdminDashboard() {
  const stats = getOrderStats();
  const recent = listOrders({ limit: 8 });
  const mailConfigured = Boolean(env.smtp.host);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {(!mailConfigured || !env.adminEmail) && (
        <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            {!mailConfigured && <p><strong>Emails aren&apos;t being sent yet.</strong> Without SMTP settings they&apos;re saved to <code className="font-mono">data/outbox/</code>. Add <code className="font-mono">SMTP_HOST</code>, <code className="font-mono">SMTP_USER</code> and <code className="font-mono">SMTP_PASS</code> to <code className="font-mono">.env.local</code>.</p>}
            {!env.adminEmail && <p className="mt-1">Set <code className="font-mono">ADMIN_EMAIL</code> to get new-order and slip notifications.</p>}
          </div>
        </div>
      )}

      <section aria-labelledby="todo" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <h2 id="todo" className="sr-only">To do</h2>
        {TODO.map(({ status, hint, tone }) => (
          <Link key={status} href={`/admin/orders?status=${status}`} className={`group rounded-2xl p-5 text-ink transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md ${tone}`}>
            <p className="text-sm font-medium text-ink/70">{STATUS_LABEL[status]}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{stats.byStatus[status] ?? 0}</p>
            <p className="mt-2 text-xs text-ink/65">{hint}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">Confirmed revenue</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{formatPrice(stats.revenue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{stats.paidOrders} paid orders, excluding cancelled</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">Orders in the last 24 hours</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.last24h}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-muted-foreground">Low stock (2 or fewer)</p>
          {stats.lowStock.length === 0 ? (
            <p className="mt-2 text-sm">All sizes well stocked.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {stats.lowStock.map((s) => (
                <li key={`${s.name}-${s.size}`} className="flex justify-between gap-2">
                  <span className="truncate">{s.name} · {s.size}</span>
                  <span className={`tabular-nums ${s.quantity === 0 ? "text-destructive" : ""}`}>{s.quantity}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/products" className="mt-3 inline-flex items-center gap-1 text-xs font-medium hover:underline">Manage stock <ArrowRight className="size-3" /></Link>
        </div>
      </section>

      <section aria-labelledby="recent" className="rounded-2xl border border-border bg-background">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 id="recent" className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="border-t border-border px-5 py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.number}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm hover:bg-muted/50">
                  <span className="font-mono font-medium">{o.number}</span>
                  <span className="flex-1 truncate text-muted-foreground">{o.customerName}</span>
                  <span className="tabular-nums">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                  <span className="w-full text-xs text-muted-foreground sm:w-36 sm:text-right">{formatDateTime(o.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
