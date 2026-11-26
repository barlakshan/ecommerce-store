import crypto from "node:crypto";

import { shippingFor, store } from "@/lib/config";
import { getDb, now, transaction } from "@/lib/db";
import type { OrderStatus } from "@/lib/order-status";
import { getProductsByIds } from "@/lib/products";

export type OrderItem = {
  id: number;
  productId: number | null;
  productName: string;
  productSlug: string;
  image: string | null;
  size: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderEvent = {
  id: number;
  /** "note" events are internal admin notes, never shown to customers. */
  status: OrderStatus | "note";
  note: string | null;
  actor: "customer" | "admin" | "system";
  createdAt: string;
};

export type Order = {
  id: number;
  number: string;
  accessToken: string;
  status: OrderStatus;
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  postalCode: string | null;
  notes: string | null;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentDueAt: string;
  paymentReference: string | null;
  paymentSlip: string | null;
  paymentSubmittedAt: string | null;
  paidAt: string | null;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

type OrderRow = {
  id: number; number: string; access_token: string; status: OrderStatus; customer_name: string; email: string; phone: string;
  address_line1: string; address_line2: string | null; city: string; district: string; postal_code: string | null; notes: string | null;
  subtotal: number; shipping_fee: number; total: number; payment_due_at: string; payment_reference: string | null; payment_slip: string | null;
  payment_submitted_at: string | null; paid_at: string | null; tracking_carrier: string | null; tracking_number: string | null;
  shipped_at: string | null; delivered_at: string | null; cancelled_at: string | null; cancel_reason: string | null; created_at: string; updated_at: string;
};

type ItemRow = { id: number; order_id: number; product_id: number | null; product_name: string; product_slug: string; image: string | null; size: string; unit_price: number; quantity: number; line_total: number };

function itemsFor(orderIds: number[]) {
  const map = new Map<number, OrderItem[]>();
  if (orderIds.length === 0) return map;
  const rows = getDb()
    .prepare(`SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => "?").join(",")}) ORDER BY id`)
    .all(...orderIds) as ItemRow[];
  for (const r of rows) {
    const list = map.get(r.order_id) ?? [];
    list.push({ id: r.id, productId: r.product_id, productName: r.product_name, productSlug: r.product_slug, image: r.image, size: r.size, unitPrice: r.unit_price, quantity: r.quantity, lineTotal: r.line_total });
    map.set(r.order_id, list);
  }
  return map;
}

function toOrders(rows: OrderRow[]): Order[] {
  const items = itemsFor(rows.map((r) => r.id));
  return rows.map((r) => ({
    id: r.id, number: r.number, accessToken: r.access_token, status: r.status, customerName: r.customer_name, email: r.email, phone: r.phone,
    addressLine1: r.address_line1, addressLine2: r.address_line2, city: r.city, district: r.district, postalCode: r.postal_code, notes: r.notes,
    subtotal: r.subtotal, shippingFee: r.shipping_fee, total: r.total, paymentDueAt: r.payment_due_at, paymentReference: r.payment_reference,
    paymentSlip: r.payment_slip, paymentSubmittedAt: r.payment_submitted_at, paidAt: r.paid_at, trackingCarrier: r.tracking_carrier,
    trackingNumber: r.tracking_number, shippedAt: r.shipped_at, deliveredAt: r.delivered_at, cancelledAt: r.cancelled_at,
    cancelReason: r.cancel_reason, createdAt: r.created_at, updatedAt: r.updated_at, items: items.get(r.id) ?? [],
  }));
}

export class OrderError extends Error {}

export type CheckoutCustomer = {
  customerName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district: string;
  postalCode?: string | null;
  notes?: string | null;
};

export type CartLine = { productId: number; size: string; quantity: number };

function newOrderNumber() {
  const d = new Date();
  const date = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `RL-${date}-${crypto.randomInt(1000, 10000)}`;
}

/** Creates an order, reserving stock. Prices always come from the database, never the client. */
export function createOrder(customer: CheckoutCustomer, lines: CartLine[]): Order {
  if (lines.length === 0) throw new OrderError("Your bag is empty.");

  // Merge duplicate lines (same product + size).
  const merged = new Map<string, CartLine>();
  for (const line of lines) {
    const key = `${line.productId}:${line.size}`;
    const existing = merged.get(key);
    merged.set(key, { ...line, quantity: (existing?.quantity ?? 0) + line.quantity });
  }

  return transaction((db) => {
    const products = new Map(getProductsByIds([...new Set([...merged.values()].map((l) => l.productId))]).map((p) => [p.id, p]));
    const priced = [...merged.values()].map((line) => {
      const product = products.get(line.productId);
      if (!product || !product.active) throw new OrderError("An item in your bag is no longer available. Please remove it and try again.");
      if (line.quantity < 1 || line.quantity > store.maxQuantityPerLine) throw new OrderError(`You can order up to ${store.maxQuantityPerLine} of each item.`);
      const available = product.stock[line.size] ?? 0;
      if (available < line.quantity) {
        throw new OrderError(available === 0
          ? `${product.name} in size ${line.size} just sold out.`
          : `Only ${available} left of ${product.name} in size ${line.size}.`);
      }
      return { product, line, lineTotal: product.price * line.quantity };
    });

    const subtotal = priced.reduce((sum, p) => sum + p.lineTotal, 0);
    const shippingFee = shippingFor(subtotal);
    const createdAt = now();
    const dueAt = new Date(Date.now() + store.paymentWindowHours * 3600_000).toISOString();

    let number = newOrderNumber();
    const exists = db.prepare("SELECT 1 FROM orders WHERE number = ?");
    while (exists.get(number)) number = newOrderNumber();

    const { lastInsertRowid } = db.prepare(`
      INSERT INTO orders (number, access_token, status, customer_name, email, phone, address_line1, address_line2, city, district, postal_code, notes,
        subtotal, shipping_fee, total, payment_due_at, created_at, updated_at)
      VALUES (?, ?, 'awaiting_payment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      number, crypto.randomBytes(24).toString("hex"), customer.customerName, customer.email.toLowerCase(), customer.phone,
      customer.addressLine1, customer.addressLine2 || null, customer.city, customer.district, customer.postalCode || null, customer.notes || null,
      subtotal, shippingFee, subtotal + shippingFee, dueAt, createdAt, createdAt,
    );
    const orderId = Number(lastInsertRowid);

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_slug, image, size, unit_price, quantity, line_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const reserve = db.prepare("UPDATE product_stock SET quantity = quantity - ? WHERE product_id = ? AND size = ? AND quantity >= ?");
    for (const { product, line, lineTotal } of priced) {
      insertItem.run(orderId, product.id, product.name, product.slug, product.image, line.size, product.price, line.quantity, lineTotal);
      const { changes } = reserve.run(line.quantity, product.id, line.size, line.quantity);
      if (Number(changes) !== 1) throw new OrderError(`${product.name} in size ${line.size} just sold out.`);
    }

    addEvent(orderId, "awaiting_payment", "Order placed. Waiting for bank deposit.", "customer");
    return getOrderById(orderId)!;
  });
}

export function addEvent(orderId: number, status: OrderStatus | "note", note: string | null, actor: OrderEvent["actor"]) {
  getDb().prepare("INSERT INTO order_events (order_id, status, note, actor, created_at) VALUES (?, ?, ?, ?, ?)").run(orderId, status, note, actor, now());
}

export function getOrderById(id: number) {
  const row = getDb().prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return row ? toOrders([row])[0]! : null;
}

export function getOrderByNumber(number: string) {
  const row = getDb().prepare("SELECT * FROM orders WHERE number = ?").get(number.trim().toUpperCase()) as OrderRow | undefined;
  return row ? toOrders([row])[0]! : null;
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Returns the order only when the secret token from the customer's link matches. */
export function getOrderForCustomer(number: string, token: string | undefined) {
  if (!token) return null;
  const order = getOrderByNumber(number);
  return order && safeEqual(order.accessToken, token) ? order : null;
}

export function findOrderForTracking(number: string, email: string) {
  const order = getOrderByNumber(number);
  return order && order.email === email.trim().toLowerCase() ? order : null;
}

export function getOrderEvents(orderId: number): OrderEvent[] {
  const rows = getDb().prepare("SELECT * FROM order_events WHERE order_id = ? ORDER BY id ASC").all(orderId) as {
    id: number; status: OrderEvent["status"]; note: string | null; actor: OrderEvent["actor"]; created_at: string;
  }[];
  return rows.map((r) => ({ id: r.id, status: r.status, note: r.note, actor: r.actor, createdAt: r.created_at }));
}

export function getEmailLog(orderId: number) {
  return (getDb().prepare("SELECT * FROM email_log WHERE order_id = ? ORDER BY id DESC").all(orderId) as {
    id: number; template: string; recipient: string; subject: string; status: string; error: string | null; created_at: string;
  }[]).map((r) => ({ id: r.id, template: r.template, recipient: r.recipient, subject: r.subject, status: r.status, error: r.error, createdAt: r.created_at }));
}

export function listOrders(options: { status?: OrderStatus; query?: string; limit?: number } = {}) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (options.status) {
    where.push("status = ?");
    params.push(options.status);
  }
  if (options.query) {
    where.push("(number LIKE ? OR email LIKE ? OR customer_name LIKE ? OR phone LIKE ? OR payment_reference LIKE ?)");
    const q = `%${options.query.trim()}%`;
    params.push(q, q, q, q, q);
  }
  params.push(options.limit ?? 200);
  const rows = getDb()
    .prepare(`SELECT * FROM orders ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id DESC LIMIT ?`)
    .all(...params) as OrderRow[];
  return toOrders(rows);
}

export function getOrderStats() {
  const db = getDb();
  const counts = db.prepare("SELECT status, COUNT(*) AS count FROM orders GROUP BY status").all() as { status: OrderStatus; count: number }[];
  const revenue = db.prepare("SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS orders FROM orders WHERE paid_at IS NOT NULL AND status != 'cancelled'").get() as { total: number; orders: number };
  const today = db.prepare("SELECT COUNT(*) AS count FROM orders WHERE created_at >= ?").get(new Date(Date.now() - 86400_000).toISOString()) as { count: number };
  const lowStock = db.prepare(`
    SELECT p.name, s.size, s.quantity FROM product_stock s JOIN products p ON p.id = s.product_id
    WHERE p.active = 1 AND s.quantity <= 2 ORDER BY s.quantity ASC, p.name LIMIT 8
  `).all() as { name: string; size: string; quantity: number }[];
  return {
    byStatus: Object.fromEntries(counts.map((c) => [c.status, c.count])) as Partial<Record<OrderStatus, number>>,
    revenue: revenue.total,
    paidOrders: revenue.orders,
    last24h: today.count,
    lowStock,
  };
}

function setFields(orderId: number, fields: Record<string, string | number | null>) {
  const keys = Object.keys(fields);
  getDb()
    .prepare(`UPDATE orders SET ${keys.map((k) => `${k} = ?`).join(", ")}, updated_at = ? WHERE id = ?`)
    .run(...keys.map((k) => fields[k] ?? null), now(), orderId);
}

function assertStatus(order: Order, allowed: OrderStatus[], action: string) {
  if (!allowed.includes(order.status)) throw new OrderError(`Can't ${action} an order that is "${order.status.replace(/_/g, " ")}".`);
}

/**
 * Runs a status change inside a write transaction, re-reading the order first so that
 * two requests at once (e.g. auto-expiry and an admin click) can't both apply.
 */
function transition(orderId: number, allowed: OrderStatus[], action: string, apply: (fresh: Order) => void) {
  transaction(() => {
    const fresh = getOrderById(orderId);
    if (!fresh) throw new OrderError("Order not found.");
    assertStatus(fresh, allowed, action);
    apply(fresh);
  });
  return getOrderById(orderId)!;
}

export function submitPayment(order: Order, data: { reference: string; slip: string }) {
  return transition(order.id, ["awaiting_payment", "payment_submitted"], "upload a slip for", (o) => {
    setFields(o.id, { status: "payment_submitted", payment_reference: data.reference || null, payment_slip: data.slip, payment_submitted_at: now() });
    addEvent(o.id, "payment_submitted", `Bank slip uploaded${data.reference ? ` (ref ${data.reference})` : ""}.`, "customer");
  });
}

export function confirmPayment(order: Order, note?: string) {
  return transition(order.id, ["awaiting_payment", "payment_submitted"], "confirm payment for", (o) => {
    setFields(o.id, { status: "paid", paid_at: now() });
    addEvent(o.id, "paid", note || "Payment matched with bank statement.", "admin");
  });
}

export function rejectPayment(order: Order, reason: string) {
  return transition(order.id, ["payment_submitted"], "reject payment for", (o) => {
    // Give the customer a fresh window to re-upload.
    const dueAt = new Date(Date.now() + store.paymentWindowHours * 3600_000).toISOString();
    setFields(o.id, { status: "awaiting_payment", payment_due_at: dueAt });
    addEvent(o.id, "awaiting_payment", `Payment could not be verified: ${reason}`, "admin");
  });
}

export function markProcessing(order: Order) {
  return transition(order.id, ["paid"], "start packing", (o) => {
    setFields(o.id, { status: "processing" });
    addEvent(o.id, "processing", "Order is being packed.", "admin");
  });
}

export function markShipped(order: Order, data: { carrier: string; trackingNumber: string }) {
  return transition(order.id, ["paid", "processing"], "ship", (o) => {
    setFields(o.id, { status: "shipped", tracking_carrier: data.carrier, tracking_number: data.trackingNumber || null, shipped_at: now() });
    addEvent(o.id, "shipped", `Handed to ${data.carrier}${data.trackingNumber ? ` · tracking ${data.trackingNumber}` : ""}.`, "admin");
  });
}

export function markDelivered(order: Order) {
  return transition(order.id, ["shipped"], "mark delivered", (o) => {
    setFields(o.id, { status: "delivered", delivered_at: now() });
    addEvent(o.id, "delivered", "Delivered to customer.", "admin");
  });
}

/** Cancels the order and puts its items back into stock. */
export function cancelOrder(order: Order, reason: string, actor: OrderEvent["actor"]) {
  return transition(order.id, ["awaiting_payment", "payment_submitted", "paid", "processing"], "cancel", (o) => {
    const restock = getDb().prepare(
      "INSERT INTO product_stock (product_id, size, quantity) VALUES (?, ?, ?) ON CONFLICT(product_id, size) DO UPDATE SET quantity = quantity + excluded.quantity",
    );
    for (const item of o.items) if (item.productId) restock.run(item.productId, item.size, item.quantity);
    setFields(o.id, { status: "cancelled", cancelled_at: now(), cancel_reason: reason });
    addEvent(o.id, "cancelled", reason, actor);
  });
}

export function addNote(order: Order, note: string) {
  addEvent(order.id, "note", note, "admin");
}

/** Orders still unpaid after the payment window. Slips awaiting review are never auto-cancelled. */
export function getOverdueOrders() {
  const rows = getDb().prepare("SELECT * FROM orders WHERE status = 'awaiting_payment' AND payment_due_at < ?").all(now()) as OrderRow[];
  return toOrders(rows);
}
