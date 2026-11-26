/**
 * End-to-end check of the order lifecycle against a throwaway database.
 * Run from an empty folder so data/ is created there, e.g.:
 *   mkdir -p /tmp/rail-test && cd /tmp/rail-test && npx tsx --tsconfig ~/ecommerce-store/tsconfig.json ~/ecommerce-store/scripts/test-order-flow.ts
 */
import assert from "node:assert/strict";
import fs from "node:fs";

import { getDb } from "@/lib/db";
import { expireOverdueOrders, notify } from "@/lib/notifications";
import {
  cancelOrder,
  confirmPayment,
  createOrder,
  getEmailLog,
  getOrderByNumber,
  getOrderForCustomer,
  markDelivered,
  markProcessing,
  markShipped,
  OrderError,
  rejectPayment,
  submitPayment,
} from "@/lib/orders";
import { getProductBySlug } from "@/lib/products";
import { saveSlip, UploadError } from "@/lib/storage";

assert.ok(!process.cwd().includes("ecommerce-store"), "Run this from a scratch folder, not the project.");

const customer = {
  customerName: "Test Customer",
  email: "Test@Example.com",
  phone: "0771234567",
  addressLine1: "1 Test Road",
  city: "Kandy",
  district: "Kandy",
};

async function main() {
  const hoodie = getProductBySlug("hoodie-maestiq")!;
  const startM = hoodie.stock.M!;

  // 1. Place an order: price comes from the DB, stock is reserved, shipping applied.
  const order = createOrder(customer, [{ productId: hoodie.id, size: "M", quantity: 2 }]);
  assert.equal(order.status, "awaiting_payment");
  assert.equal(order.subtotal, hoodie.price * 2);
  assert.equal(order.shippingFee, 0, "17,600 is over the free-delivery threshold");
  assert.equal(order.email, "test@example.com");
  assert.equal(getProductBySlug("hoodie-maestiq")!.stock.M, startM - 2);
  await notify.orderPlaced(order);
  console.log("✓ order placed", order.number, order.total);

  // 2. Customer link needs the right token.
  assert.ok(getOrderForCustomer(order.number, order.accessToken));
  assert.equal(getOrderForCustomer(order.number, "wrong"), null);
  console.log("✓ order link is token-protected");

  // 3. Can't oversell.
  assert.throws(() => createOrder(customer, [{ productId: hoodie.id, size: "M", quantity: 999 }]), OrderError);
  console.log("✓ overselling is refused");

  // 4. Slip upload: rejects non-images, accepts a PNG.
  await assert.rejects(saveSlip(order.number, new File(["hello"], "x.png")), UploadError);
  const png = Buffer.from("89504e470d0a1a0a0000000d4948445200000001000000010806000000", "hex");
  const slip = await saveSlip(order.number, new File([png], "slip.png", { type: "image/png" }));
  let o = submitPayment(order, { reference: "CDM 1234", slip });
  assert.equal(o.status, "payment_submitted");
  await notify.paymentSubmitted(o);
  console.log("✓ slip uploaded");

  // 5. Reject, re-upload, confirm.
  o = rejectPayment(o, "Amount doesn't match.");
  assert.equal(o.status, "awaiting_payment");
  await notify.paymentRejected(o, "Amount doesn't match.");
  o = submitPayment(o, { reference: "CDM 5678", slip });
  o = confirmPayment(o);
  assert.equal(o.status, "paid");
  await notify.paymentConfirmed(o);
  assert.throws(() => confirmPayment(o), OrderError, "can't confirm twice");
  console.log("✓ reject → re-upload → confirm");

  // 6. Pack, ship, deliver.
  o = markProcessing(o);
  o = markShipped(o, { carrier: "Domex", trackingNumber: "DX1" });
  await notify.shipped(o);
  o = markDelivered(o);
  await notify.delivered(o);
  assert.equal(o.status, "delivered");
  assert.throws(() => cancelOrder(o, "too late", "admin"), OrderError);
  console.log("✓ shipped and delivered");

  // 7. Cancelling returns stock (and only once).
  const before = getProductBySlug("hoodie-maestiq")!.stock.S!;
  const second = createOrder(customer, [{ productId: hoodie.id, size: "S", quantity: 1 }]);
  assert.equal(getProductBySlug("hoodie-maestiq")!.stock.S, before - 1);
  const cancelled = cancelOrder(second, "Customer asked", "admin");
  assert.equal(cancelled.status, "cancelled");
  assert.equal(getProductBySlug("hoodie-maestiq")!.stock.S, before);
  assert.throws(() => cancelOrder(second, "again", "admin"), OrderError, "stale object can't double-restock");
  assert.equal(getProductBySlug("hoodie-maestiq")!.stock.S, before);
  console.log("✓ cancel restocks exactly once");

  // 8. Overdue unpaid orders expire automatically.
  const third = createOrder(customer, [{ productId: hoodie.id, size: "L", quantity: 1 }]);
  getDb().prepare("UPDATE orders SET payment_due_at = ? WHERE id = ?").run(new Date(Date.now() - 1000).toISOString(), third.id);
  const expired = await expireOverdueOrders();
  assert.equal(expired, 1);
  assert.equal(getOrderByNumber(third.number)!.status, "cancelled");
  console.log("✓ overdue order auto-cancelled");

  // 9. Emails were produced for every step.
  const templates = getEmailLog(order.id).map((m) => m.template).reverse();
  console.log("  emails for", order.number + ":", templates.join(", "));
  for (const t of ["order-placed", "admin-new-order", "payment-submitted", "admin-payment-submitted", "payment-rejected", "payment-confirmed", "order-shipped", "order-delivered"]) {
    assert.ok(templates.includes(t), `missing ${t}`);
  }
  assert.ok(getEmailLog(third.id).some((m) => m.template === "order-cancelled"));
  console.log("✓ all emails written to", fs.readdirSync("data/outbox").length, "files in data/outbox");
  console.log("\nAll checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
