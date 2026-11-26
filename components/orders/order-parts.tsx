import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Totals } from "@/components/store/order-summary";
import { formatDateTime, formatPrice } from "@/lib/format";
import { PROGRESS_STEPS, STATUS_LABEL, STATUS_TONE, type OrderStatus } from "@/lib/order-status";
import type { Order, OrderEvent } from "@/lib/orders";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}

export function ProgressTracker({ status }: { status: OrderStatus }) {
  if (status === "cancelled") return null;
  const current = PROGRESS_STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-6 gap-1.5" aria-label="Order progress">
      {PROGRESS_STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className="space-y-2" aria-current={active ? "step" : undefined}>
            <div className={`h-1.5 rounded-full ${done || active ? "bg-gradient-to-r from-plum to-coral" : "bg-muted"}`} />
            <p className={`hidden text-[11px] leading-tight sm:block ${active ? "font-semibold" : done ? "text-foreground" : "text-muted-foreground"}`}>
              {done && <Check className="-mt-0.5 mr-0.5 inline size-3" aria-hidden="true" />}
              {STATUS_LABEL[step]}
            </p>
            <span className="sr-only sm:hidden">{STATUS_LABEL[step]}{done ? " (done)" : active ? " (current)" : ""}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderItems({ order, linkProducts = true }: { order: Order; linkProducts?: boolean }) {
  return (
    <div className="space-y-5">
      <ul className="divide-y divide-border">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-4 py-4 first:pt-0">
            <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg bg-muted/70">
              {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-contain p-1" />}
            </div>
            <div className="flex-1 text-sm">
              {linkProducts ? (
                <Link href={`/products/${item.productSlug}`} className="font-medium hover:underline">{item.productName}</Link>
              ) : (
                <p className="font-medium">{item.productName}</p>
              )}
              <p className="mt-0.5 text-muted-foreground">Size {item.size} · Qty {item.quantity} · {formatPrice(item.unitPrice)}</p>
            </div>
            <p className="text-sm tabular-nums">{formatPrice(item.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <Totals subtotal={order.subtotal} shipping={order.shippingFee} total={order.total} />
    </div>
  );
}

export function AddressBlock({ order }: { order: Order }) {
  return (
    <address className="text-sm not-italic leading-relaxed">
      {order.customerName}
      <br />
      {order.addressLine1}
      {order.addressLine2 && (
        <>
          <br />
          {order.addressLine2}
        </>
      )}
      <br />
      {order.city}
      {order.postalCode ? ` ${order.postalCode}` : ""}
      <br />
      {order.district} District
      <br />
      <span className="text-muted-foreground">{order.phone} · {order.email}</span>
    </address>
  );
}

const ACTOR_LABEL: Record<OrderEvent["actor"], string> = { customer: "You", admin: "Store", system: "System" };

export function Timeline({ events, audience }: { events: OrderEvent[]; audience: "customer" | "admin" }) {
  const visible = audience === "customer" ? events.filter((e) => e.status !== "note") : events;
  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {[...visible].reverse().map((event) => (
        <li key={event.id} className="relative">
          <span className={`absolute -left-[25px] top-1.5 size-2.5 rounded-full ring-4 ring-background ${event.status === "note" ? "bg-amber-500" : "bg-foreground"}`} aria-hidden="true" />
          <p className="text-sm font-medium">
            {event.status === "note" ? "Internal note" : STATUS_LABEL[event.status]}
            {audience === "admin" && <span className="ml-2 text-xs font-normal text-muted-foreground">by {event.actor === "customer" ? "customer" : ACTOR_LABEL[event.actor].toLowerCase()}</span>}
          </p>
          {event.note && <p className="mt-0.5 text-sm text-muted-foreground">{event.note}</p>}
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</p>
        </li>
      ))}
    </ol>
  );
}
