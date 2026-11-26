import { shippingFor, store } from "@/lib/config";
import type { Order } from "@/lib/orders";

/** A realistic fake order used to preview email templates without touching the database. */
export function sampleOrder(): Order {
  const created = new Date(Date.now() - 2 * 3600_000);
  const items = [
    { id: 1, productId: 1, productName: "Heavyweight tee · Bone", productSlug: "heavyweight-tee-bone", image: "https://cdn.21st.dev/assets/mirror/14/1485bf44725b18fcdba71bfae54d67d648ab3bff4b24215a042c0cc4c895a2e6.webp", size: "M", unitPrice: 4800, quantity: 2, lineTotal: 9600 },
    { id: 2, productId: 4, productName: "Knit cardigan · Olive", productSlug: "knit-cardigan-olive", image: "https://cdn.21st.dev/assets/mirror/58/581b13c5ca241c653dc94d2c8048c92a60f022cfbaaf153261076d3a6655827e.webp", size: "S", unitPrice: 9600, quantity: 1, lineTotal: 9600 },
  ];
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const shippingFee = shippingFor(subtotal);
  return {
    id: 0,
    number: "RL-261126-4821",
    accessToken: "sample-token",
    status: "awaiting_payment",
    customerName: "Nimali Perera",
    email: "nimali@example.com",
    phone: "0771234567",
    addressLine1: "45/2 Lake Drive",
    addressLine2: "Near the temple",
    city: "Kandy",
    district: "Kandy",
    postalCode: "20000",
    notes: "Please call before delivery.",
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    paymentDueAt: new Date(created.getTime() + store.paymentWindowHours * 3600_000).toISOString(),
    paymentReference: "CDM 448812",
    paymentSlip: null,
    paymentSubmittedAt: null,
    paidAt: null,
    trackingCarrier: "Domex",
    trackingNumber: "DX12345678",
    shippedAt: null,
    deliveredAt: null,
    cancelledAt: null,
    cancelReason: null,
    createdAt: created.toISOString(),
    updatedAt: created.toISOString(),
    items,
  };
}
