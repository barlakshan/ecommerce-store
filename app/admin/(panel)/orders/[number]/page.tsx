import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderActions } from "@/components/admin/order-actions";
import { AddressBlock, OrderItems, StatusBadge, Timeline } from "@/components/orders/order-parts";
import { formatDateTime, formatPrice } from "@/lib/format";
import { getEmailLog, getOrderByNumber, getOrderEvents } from "@/lib/orders";

export default async function AdminOrderPage({ params }: { params: Promise<{ number: string }> }) {
  const order = getOrderByNumber(decodeURIComponent((await params).number));
  if (!order) notFound();
  const events = getOrderEvents(order.id);
  const emails = getEmailLog(order.id);
  const slipUrl = order.paymentSlip ? `/admin/slips/${order.paymentSlip}` : null;
  const slipIsPdf = order.paymentSlip?.endsWith(".pdf");
  const overdue = order.status === "awaiting_payment" && new Date(order.paymentDueAt) < new Date();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> All orders
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-semibold">{order.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)} · {formatPrice(order.total)}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <Link href={`/orders/${order.number}?t=${order.accessToken}`} target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm hover:bg-muted">
            Customer view <ExternalLink className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section aria-labelledby="payment" className="rounded-2xl border border-border bg-background p-5">
            <h2 id="payment" className="font-semibold">Payment</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Expected amount</dt>
                <dd className="text-lg font-semibold tabular-nums">{formatPrice(order.total)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Customer reference</dt>
                <dd className="font-mono">{order.paymentReference || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{order.paidAt ? "Confirmed" : order.paymentSubmittedAt ? "Slip uploaded" : "Payment due"}</dt>
                <dd className={overdue ? "font-medium text-destructive" : undefined}>
                  {formatDateTime(order.paidAt ?? order.paymentSubmittedAt ?? order.paymentDueAt)}
                  {overdue && " (overdue)"}
                </dd>
              </div>
            </dl>

            {slipUrl ? (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Bank slip</p>
                  <a href={slipUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm hover:underline">
                    Open full size <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </div>
                {slipIsPdf ? (
                  <a href={slipUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-border p-4 text-sm hover:bg-muted">
                    <FileText className="size-6" aria-hidden="true" /> {order.paymentSlip}
                  </a>
                ) : (
                  <a href={slipUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-protected file */}
                    <img src={slipUrl} alt={`Bank slip for ${order.number}`} className="mx-auto max-h-[480px] w-auto object-contain" />
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">No slip uploaded yet.</p>
            )}
          </section>

          <section aria-labelledby="items" className="rounded-2xl border border-border bg-background p-5">
            <h2 id="items" className="mb-4 font-semibold">Items</h2>
            <OrderItems order={order} linkProducts={false} />
          </section>

          <section aria-labelledby="emails" className="rounded-2xl border border-border bg-background p-5">
            <h2 id="emails" className="mb-4 font-semibold">Emails</h2>
            {emails.length === 0 ? (
              <p className="text-sm text-muted-foreground">No emails yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {emails.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate">{m.subject}</p>
                      <p className="text-xs text-muted-foreground">To {m.recipient} · {formatDateTime(m.createdAt)}</p>
                      {m.error && <p className="text-xs text-destructive">{m.error}</p>}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${m.status === "sent" ? "bg-emerald-100 text-emerald-900" : m.status === "failed" ? "bg-red-100 text-red-900" : "bg-muted text-muted-foreground"}`}>
                      {m.status === "saved" ? "saved to outbox" : m.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <OrderActions number={order.number} status={order.status} hasSlip={Boolean(order.paymentSlip)} />

          <section aria-labelledby="customer" className="rounded-2xl border border-border bg-background p-5">
            <h2 id="customer" className="mb-3 font-semibold">Customer & delivery</h2>
            <AddressBlock order={order} />
            {order.notes && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">Customer note: {order.notes}</p>}
            {order.trackingCarrier && (
              <p className="mt-4 border-t border-border pt-4 text-sm">
                {order.trackingCarrier}
                {order.trackingNumber && <span className="font-mono"> · {order.trackingNumber}</span>}
              </p>
            )}
          </section>

          <section aria-labelledby="history" className="rounded-2xl border border-border bg-background p-5">
            <h2 id="history" className="mb-4 font-semibold">History</h2>
            <Timeline events={events} audience="admin" />
          </section>
        </div>
      </div>
    </div>
  );
}
