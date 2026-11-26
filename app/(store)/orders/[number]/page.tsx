import { AlertTriangle, CheckCircle2, Clock, Landmark, Package, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AddressBlock, OrderItems, ProgressTracker, StatusBadge, Timeline } from "@/components/orders/order-parts";
import { CopyButton } from "@/components/store/copy-button";
import { SlipUpload } from "@/components/store/slip-upload";
import { store } from "@/lib/config";
import { formatDateTime, formatPrice } from "@/lib/format";
import { expireOverdueOrders } from "@/lib/notifications";
import { STATUS_HELP } from "@/lib/order-status";
import { getOrderEvents, getOrderForCustomer } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your order", robots: { index: false } };

type Props = {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ t?: string; placed?: string }>;
};

export default async function OrderPage({ params, searchParams }: Props) {
  const { number } = await params;
  const { t, placed } = await searchParams;
  await expireOverdueOrders();
  const order = getOrderForCustomer(decodeURIComponent(number), t);

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-20 text-center">
        <h1 className="font-display text-4xl">Order not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">This link is incomplete or has expired. Use the link in your order email, or look the order up with your email address.</p>
        <Link href="/track" className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-background">Track an order</Link>
      </div>
    );
  }

  const events = getOrderEvents(order.id);
  const needsPayment = order.status === "awaiting_payment";
  const verifying = order.status === "payment_submitted";
  const lastRejection = needsPayment ? [...events].reverse().find((e) => e.status === "awaiting_payment" && e.actor === "admin") : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10">
      {placed && needsPayment && (
        <div role="status" className="mb-8 flex gap-3 rounded-3xl bg-gradient-to-r from-mint via-sky to-lilac px-5 py-5 text-ink">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold">Thank you! Your order is placed and your items are reserved.</p>
            <p>We&apos;ve emailed the details to {order.email}. Complete the bank deposit below to confirm it.</p>
          </div>
        </div>
      )}

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Order</p>
          <h1 className="mt-1 font-mono text-3xl font-semibold tracking-tight sm:text-4xl">{order.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <div className="mb-10 space-y-3">
        <ProgressTracker status={order.status} />
        <p className="text-sm text-muted-foreground">{STATUS_HELP[order.status]}</p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {order.status === "cancelled" && (
            <div className="flex gap-3 rounded-3xl bg-red-50 px-5 py-4 text-sm text-red-950 dark:bg-red-400/10 dark:text-red-100">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">This order was cancelled on {formatDateTime(order.cancelledAt)}.</p>
                {order.cancelReason && <p className="mt-1">{order.cancelReason}</p>}
              </div>
            </div>
          )}

          {(needsPayment || verifying) && (
            <section aria-labelledby="pay" className="rounded-3xl border-2 border-plum/20 bg-white p-6 shadow-lg shadow-plum/10">
              <h2 id="pay" className="flex items-center gap-2 text-lg font-semibold">
                <Landmark className="size-5" aria-hidden="true" /> {needsPayment ? "Complete your bank deposit" : "Payment under review"}
              </h2>

              {lastRejection && (
                <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900 dark:bg-red-400/10 dark:text-red-200">{lastRejection.note}</p>
              )}

              {needsPayment && (
                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-400/10 dark:text-amber-100">
                  <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>Please pay by <strong>{formatDateTime(order.paymentDueAt)}</strong>. Unpaid orders are released after {store.paymentWindowHours} hours.</span>
                </p>
              )}
              {verifying && (
                <p className="mt-4 text-sm text-muted-foreground">
                  We received your slip on {formatDateTime(order.paymentSubmittedAt)}{order.paymentReference ? ` (ref ${order.paymentReference})` : ""}. Uploaded the wrong file? You can replace it below.
                </p>
              )}

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl bg-butter px-4 py-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Amount</dt>
                    <dd className="text-lg font-semibold tabular-nums">{formatPrice(order.total)}</dd>
                  </div>
                  <CopyButton value={String(order.total)} label="amount" />
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-butter px-4 py-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Reference / remark</dt>
                    <dd className="font-mono text-lg font-semibold">{order.number}</dd>
                  </div>
                  <CopyButton value={order.number} label="order number" />
                </div>
              </dl>

              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {store.bankAccounts.map((a) => (
                  <li key={a.accountNumber} className="flex items-start justify-between gap-2 rounded-2xl border border-border px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{a.bank}</p>
                      <p className="text-muted-foreground">{a.branch}</p>
                      <p className="text-muted-foreground">{a.accountName}</p>
                      <p className="mt-1 font-mono text-base tracking-wide">{a.accountNumber}</p>
                    </div>
                    <CopyButton value={a.accountNumber} label={`${a.bank} account number`} />
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-border pt-6">
                <h3 className="mb-4 text-sm font-semibold">{verifying ? "Replace your slip" : "Upload your bank slip"}</h3>
                <SlipUpload number={order.number} token={order.accessToken} replacing={verifying} />
              </div>
            </section>
          )}

          {(order.status === "shipped" || order.status === "delivered") && (
            <section className="flex gap-3 rounded-3xl border border-border bg-white p-6 shadow-sm">
              {order.status === "shipped" ? <Truck className="size-5 shrink-0" aria-hidden="true" /> : <Package className="size-5 shrink-0" aria-hidden="true" />}
              <div className="text-sm">
                <p className="font-semibold">{order.status === "shipped" ? `Shipped with ${order.trackingCarrier ?? "our courier"}` : `Delivered ${formatDateTime(order.deliveredAt)}`}</p>
                {order.trackingNumber && <p className="mt-1">Tracking number <span className="font-mono">{order.trackingNumber}</span></p>}
                {order.status === "shipped" && <p className="mt-1 text-muted-foreground">Shipped {formatDateTime(order.shippedAt)}</p>}
              </div>
            </section>
          )}

          <section aria-labelledby="items" className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 id="items" className="mb-5 text-lg font-semibold">Items</h2>
            <OrderItems order={order} />
          </section>
        </div>

        <aside className="space-y-6">
          <section aria-labelledby="ship-to" className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 id="ship-to" className="mb-3 text-sm font-semibold">Delivering to</h2>
            <AddressBlock order={order} />
            {order.notes && <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">Note: {order.notes}</p>}
          </section>
          <section aria-labelledby="history" className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 id="history" className="mb-5 text-sm font-semibold">History</h2>
            <Timeline events={events} audience="customer" />
          </section>
          <p className="px-2 text-xs leading-relaxed text-muted-foreground">
            Questions about this order? Email <a href={`mailto:${store.supportEmail}?subject=${encodeURIComponent(order.number)}`} className="underline">{store.supportEmail}</a> or call {store.supportPhone}.
          </p>
        </aside>
      </div>
    </div>
  );
}
