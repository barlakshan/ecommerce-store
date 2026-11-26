import { store } from "@/lib/config";
import { env } from "@/lib/env";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/orders";

export type Email = { subject: string; html: string; text: string };

/* ---------- helpers ---------- */

const C = {
  ink: "#171717",
  muted: "#6b6b6b",
  line: "#e7e5e1",
  paper: "#fff6ea",
  card: "#ffffff",
  accent: "#5b2bd9",
  coral: "#ff6b4a",
  sun: "#ffc93c",
  teal: "#12b5a5",
  warn: "#8a5a00",
  warnBg: "#fff6e0",
  ok: "#0d6b3f",
  okBg: "#e7f6ee",
  bad: "#9b1c1c",
  badBg: "#fdecec",
};
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

function esc(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function orderUrl(order: Order) {
  return `${env.siteUrl}/orders/${encodeURIComponent(order.number)}?t=${order.accessToken}`;
}

export function adminOrderUrl(order: Order) {
  return `${env.siteUrl}/admin/orders/${encodeURIComponent(order.number)}`;
}

function button(href: string, label: string) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px">
    <tr><td bgcolor="${C.accent}" style="border-radius:999px">
      <a href="${esc(href)}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px">${esc(label)}</a>
    </td></tr>
  </table>`;
}

function heading(text: string) {
  return `<h1 style="margin:0 0 12px;font-family:${SERIF};font-size:28px;line-height:1.2;font-weight:normal;color:${C.ink}">${esc(text)}</h1>`;
}

function paragraph(html: string) {
  return `<p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.ink}">${html}</p>`;
}

function notice(html: string, tone: "warn" | "ok" | "bad") {
  const [fg, bg] = tone === "warn" ? [C.warn, C.warnBg] : tone === "ok" ? [C.ok, C.okBg] : [C.bad, C.badBg];
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0">
    <tr><td style="background:${bg};border-radius:10px;padding:14px 16px;font-family:${FONT};font-size:14px;line-height:1.55;color:${fg}">${html}</td></tr>
  </table>`;
}

function sectionTitle(text: string) {
  return `<p style="margin:28px 0 10px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.muted}">${esc(text)}</p>`;
}

function itemsTable(order: Order) {
  const rows = order.items
    .map(
      (item) => `
    <tr>
      <td width="64" style="padding:10px 0;border-bottom:1px solid ${C.line};vertical-align:top">
        ${item.image ? `<img src="${esc(item.image)}" width="52" height="68" alt="" style="display:block;width:52px;height:68px;object-fit:contain;background:${C.paper};border-radius:6px">` : ""}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid ${C.line};vertical-align:top;font-family:${FONT};font-size:14px;line-height:1.45;color:${C.ink}">
        <strong style="font-weight:600">${esc(item.productName)}</strong><br>
        <span style="color:${C.muted}">Size ${esc(item.size)} · Qty ${item.quantity} · ${esc(formatPrice(item.unitPrice))}</span>
      </td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid ${C.line};vertical-align:top;font-family:${FONT};font-size:14px;color:${C.ink};white-space:nowrap">${esc(formatPrice(item.lineTotal))}</td>
    </tr>`,
    )
    .join("");

  const totalRow = (label: string, value: string, strong = false) => `
    <tr>
      <td colspan="2" style="padding:6px 0;font-family:${FONT};font-size:${strong ? 16 : 14}px;color:${strong ? C.ink : C.muted};${strong ? "font-weight:700" : ""}">${label}</td>
      <td align="right" style="padding:6px 0;font-family:${FONT};font-size:${strong ? 16 : 14}px;color:${C.ink};${strong ? "font-weight:700" : ""};white-space:nowrap">${value}</td>
    </tr>`;

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    ${rows}
    <tr><td colspan="3" style="height:8px"></td></tr>
    ${totalRow("Subtotal", esc(formatPrice(order.subtotal)))}
    ${totalRow("Delivery", order.shippingFee === 0 ? "Free" : esc(formatPrice(order.shippingFee)))}
    ${totalRow("Total", esc(formatPrice(order.total)), true)}
  </table>`;
}

function bankDetails(order: Order) {
  const accounts = store.bankAccounts
    .map(
      (a) => `
    <tr><td style="padding:12px 16px;border-top:1px solid ${C.line};font-family:${FONT};font-size:14px;line-height:1.6;color:${C.ink}">
      <strong style="font-weight:600">${esc(a.bank)}</strong> · ${esc(a.branch)}<br>
      <span style="color:${C.muted}">Account name</span> ${esc(a.accountName)}<br>
      <span style="color:${C.muted}">Account no.</span> <strong style="font-family:Menlo,Consolas,monospace;font-size:15px;letter-spacing:.04em">${esc(a.accountNumber)}</strong>
    </td></tr>`,
    )
    .join("");
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.line};border-radius:12px;background:${C.paper}">
    <tr><td style="padding:14px 16px;font-family:${FONT};font-size:14px;line-height:1.6;color:${C.ink}">
      Amount to deposit: <strong style="font-size:18px">${esc(formatPrice(order.total))}</strong><br>
      Reference / remark: <strong style="font-family:Menlo,Consolas,monospace;font-size:15px">${esc(order.number)}</strong>
    </td></tr>
    ${accounts}
  </table>`;
}

function address(order: Order) {
  const lines = [order.customerName, order.addressLine1, order.addressLine2, `${order.city}${order.postalCode ? ` ${order.postalCode}` : ""}`, `${order.district} District`, order.phone]
    .filter(Boolean)
    .map((l) => esc(l))
    .join("<br>");
  return `<p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.6;color:${C.ink}">${lines}</p>`;
}

function logo() {
  const colors = [C.accent, C.coral, C.teal];
  return store.name.split("").map((ch, i) => `<span style="color:${colors[i % colors.length]}">${esc(ch)}</span>`).join("") + `<span style="color:${C.sun}">.</span>`;
}

function layout({ preheader, body }: { preheader: string; body: string }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${esc(store.name)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper}">
  <tr><td align="center" style="padding:28px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px">
      <tr><td style="padding:0 8px 18px;font-family:${SERIF};font-size:30px;font-weight:bold;line-height:1">${logo()}</td></tr>
      <tr><td style="background:${C.card};border-radius:16px;overflow:hidden">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td height="6" style="background:${C.accent};font-size:0;line-height:0">&nbsp;</td>
          <td height="6" style="background:${C.coral};font-size:0;line-height:0">&nbsp;</td>
          <td height="6" style="background:${C.sun};font-size:0;line-height:0">&nbsp;</td>
          <td height="6" style="background:${C.teal};font-size:0;line-height:0">&nbsp;</td>
        </tr></table>
        <div style="padding:32px 28px">${body}</div>
      </td></tr>
      <tr><td style="padding:22px 8px;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted}">
        Questions? Reply to this email, write to <a href="mailto:${esc(store.supportEmail)}" style="color:${C.muted}">${esc(store.supportEmail)}</a> or call ${esc(store.supportPhone)}.<br>
        ${esc(store.legalName)} · ${esc(store.address)}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function textBlock(lines: (string | null | false | undefined)[]) {
  return lines.filter((l) => l !== null && l !== false && l !== undefined).join("\n");
}

function textItems(order: Order) {
  return [
    ...order.items.map((i) => `- ${i.productName} (size ${i.size}) x${i.quantity}  ${formatPrice(i.lineTotal)}`),
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Delivery: ${order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}`,
    `Total: ${formatPrice(order.total)}`,
  ].join("\n");
}

function textBank(order: Order) {
  return [
    `Deposit ${formatPrice(order.total)} and use ${order.number} as the reference:`,
    ...store.bankAccounts.map((a) => `- ${a.bank} (${a.branch}) · ${a.accountName} · ${a.accountNumber}`),
  ].join("\n");
}

/* ---------- customer emails ---------- */

export function orderPlacedEmail(order: Order): Email {
  const first = order.customerName.split(" ")[0];
  return {
    subject: `Order ${order.number} received: please complete your bank deposit`,
    html: layout({
      preheader: `Deposit ${formatPrice(order.total)} within ${store.paymentWindowHours} hours to confirm your order.`,
      body: [
        heading(`Thank you, ${first}.`),
        paragraph(`We've reserved your pieces under order <strong>${esc(order.number)}</strong>. To confirm it, deposit the total into one of our bank accounts and upload a photo of the slip.`),
        notice(`Please pay by <strong>${esc(formatDateTime(order.paymentDueAt))}</strong>. Unpaid orders are released after ${store.paymentWindowHours} hours.`, "warn"),
        sectionTitle("Bank deposit details"),
        bankDetails(order),
        button(orderUrl(order), "Upload bank slip"),
        paragraph(`<span style="color:${C.muted};font-size:13px">Keep this email. The button above is your private link to view and track this order.</span>`),
        sectionTitle("Your order"),
        itemsTable(order),
        sectionTitle("Delivering to"),
        address(order),
      ].join(""),
    }),
    text: textBlock([
      `Thank you, ${first}. We've received order ${order.number}.`,
      "",
      textBank(order),
      `Please pay by ${formatDateTime(order.paymentDueAt)}.`,
      "",
      `Upload your bank slip: ${orderUrl(order)}`,
      "",
      textItems(order),
    ]),
  };
}

export function paymentSubmittedEmail(order: Order): Email {
  return {
    subject: `We received your bank slip for ${order.number}`,
    html: layout({
      preheader: "We're checking your deposit against our bank statement.",
      body: [
        heading("Slip received"),
        paragraph(`Thanks for uploading your bank slip${order.paymentReference ? ` (reference <strong>${esc(order.paymentReference)}</strong>)` : ""}. We're matching it with our bank statement, which usually takes a few business hours.`),
        paragraph("You'll get another email as soon as your payment is confirmed."),
        button(orderUrl(order), "View order"),
        sectionTitle("Order summary"),
        itemsTable(order),
      ].join(""),
    }),
    text: textBlock([`We received your bank slip for order ${order.number}. We'll email you once it's confirmed.`, "", `View order: ${orderUrl(order)}`, "", textItems(order)]),
  };
}

export function paymentConfirmedEmail(order: Order): Email {
  return {
    subject: `Payment confirmed for ${order.number}`,
    html: layout({
      preheader: "Your payment is confirmed and your order is being prepared.",
      body: [
        heading("Payment confirmed"),
        notice(`We've received <strong>${esc(formatPrice(order.total))}</strong> for order <strong>${esc(order.number)}</strong>.`, "ok"),
        paragraph("We'll pack your order next and email you the tracking details once it's on its way."),
        button(orderUrl(order), "Track your order"),
        sectionTitle("Order summary"),
        itemsTable(order),
        sectionTitle("Delivering to"),
        address(order),
      ].join(""),
    }),
    text: textBlock([`Payment confirmed for order ${order.number} (${formatPrice(order.total)}).`, "We'll email tracking details once it ships.", "", `Track your order: ${orderUrl(order)}`, "", textItems(order)]),
  };
}

export function paymentRejectedEmail(order: Order, reason: string): Email {
  return {
    subject: `Action needed: we couldn't verify the payment for ${order.number}`,
    html: layout({
      preheader: "Please check your deposit and upload the slip again.",
      body: [
        heading("We couldn't verify your payment"),
        notice(esc(reason), "bad"),
        paragraph(`Your items are still reserved. Please check the deposit and upload a clear slip by <strong>${esc(formatDateTime(order.paymentDueAt))}</strong>, or reply to this email if you think this is a mistake.`),
        sectionTitle("Bank deposit details"),
        bankDetails(order),
        button(orderUrl(order), "Upload slip again"),
      ].join(""),
    }),
    text: textBlock([`We couldn't verify the payment for order ${order.number}.`, `Reason: ${reason}`, "", textBank(order), `Please upload a new slip by ${formatDateTime(order.paymentDueAt)}: ${orderUrl(order)}`]),
  };
}

export function paymentReminderEmail(order: Order): Email {
  return {
    subject: `Reminder: complete your bank deposit for ${order.number}`,
    html: layout({
      preheader: `Your reserved items will be released on ${formatDateTime(order.paymentDueAt)}.`,
      body: [
        heading("Your pieces are still waiting"),
        paragraph(`We haven't received a bank slip for order <strong>${esc(order.number)}</strong> yet.`),
        notice(`Deposit <strong>${esc(formatPrice(order.total))}</strong> by <strong>${esc(formatDateTime(order.paymentDueAt))}</strong> to keep your order.`, "warn"),
        sectionTitle("Bank deposit details"),
        bankDetails(order),
        button(orderUrl(order), "Upload bank slip"),
        sectionTitle("Your order"),
        itemsTable(order),
      ].join(""),
    }),
    text: textBlock([`Reminder: we haven't received payment for order ${order.number}.`, "", textBank(order), `Pay by ${formatDateTime(order.paymentDueAt)} and upload your slip: ${orderUrl(order)}`]),
  };
}

export function orderShippedEmail(order: Order): Email {
  return {
    subject: `Your order ${order.number} is on its way`,
    html: layout({
      preheader: order.trackingNumber ? `Tracking number ${order.trackingNumber}` : "Your order has been handed to our courier.",
      body: [
        heading("It's on its way"),
        paragraph(`Order <strong>${esc(order.number)}</strong> has been handed to <strong>${esc(order.trackingCarrier ?? "our courier")}</strong>. Most deliveries arrive within 1–3 business days.`),
        order.trackingNumber ? notice(`Tracking number: <strong style="font-family:Menlo,Consolas,monospace">${esc(order.trackingNumber)}</strong>`, "ok") : "",
        button(orderUrl(order), "Track your order"),
        sectionTitle("Delivering to"),
        address(order),
        sectionTitle("In the parcel"),
        itemsTable(order),
      ].join(""),
    }),
    text: textBlock([
      `Order ${order.number} has been handed to ${order.trackingCarrier ?? "our courier"}.`,
      order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : null,
      "",
      `Track your order: ${orderUrl(order)}`,
    ]),
  };
}

export function orderDeliveredEmail(order: Order): Email {
  return {
    subject: `Delivered: order ${order.number}`,
    html: layout({
      preheader: "Your order has arrived. We hope you love it.",
      body: [
        heading("Delivered"),
        paragraph(`Order <strong>${esc(order.number)}</strong> has been delivered. We hope everything fits just right.`),
        paragraph(`If something isn't right, reply within 7 days and we'll sort out an exchange.`),
        button(`${env.siteUrl}/shop`, "Shop new arrivals"),
      ].join(""),
    }),
    text: textBlock([`Order ${order.number} has been delivered.`, "If something isn't right, reply within 7 days and we'll arrange an exchange."]),
  };
}

export function orderCancelledEmail(order: Order, reason: string): Email {
  const paid = Boolean(order.paidAt);
  return {
    subject: `Order ${order.number} has been cancelled`,
    html: layout({
      preheader: reason,
      body: [
        heading("Order cancelled"),
        paragraph(`Order <strong>${esc(order.number)}</strong> has been cancelled.`),
        notice(esc(reason), "bad"),
        paid
          ? paragraph(`Since you've already paid, we'll refund <strong>${esc(formatPrice(order.total))}</strong> to your bank account. Reply with your account details if we don't have them yet.`)
          : paragraph("No payment was received, so there's nothing more you need to do."),
        button(`${env.siteUrl}/shop`, "Continue shopping"),
        sectionTitle("Cancelled items"),
        itemsTable(order),
      ].join(""),
    }),
    text: textBlock([
      `Order ${order.number} has been cancelled.`,
      `Reason: ${reason}`,
      paid ? `We'll refund ${formatPrice(order.total)} to your bank account.` : "No payment was received.",
    ]),
  };
}

/* ---------- store owner emails ---------- */

export function adminNewOrderEmail(order: Order): Email {
  return {
    subject: `New order ${order.number} · ${formatPrice(order.total)} · awaiting deposit`,
    html: layout({
      preheader: `${order.customerName} placed an order for ${formatPrice(order.total)}.`,
      body: [
        heading("New order"),
        paragraph(`<strong>${esc(order.customerName)}</strong> (${esc(order.email)}, ${esc(order.phone)}) placed order <strong>${esc(order.number)}</strong>. Stock is reserved until ${esc(formatDateTime(order.paymentDueAt))}.`),
        order.notes ? notice(`Customer note: ${esc(order.notes)}`, "warn") : "",
        button(adminOrderUrl(order), "Open in admin"),
        sectionTitle("Items"),
        itemsTable(order),
        sectionTitle("Ship to"),
        address(order),
      ].join(""),
    }),
    text: textBlock([`New order ${order.number} from ${order.customerName} (${order.email}, ${order.phone}).`, "", textItems(order), "", adminOrderUrl(order)]),
  };
}

export function adminPaymentSubmittedEmail(order: Order): Email {
  return {
    subject: `Slip uploaded for ${order.number} · verify ${formatPrice(order.total)}`,
    html: layout({
      preheader: `${order.customerName} uploaded a bank slip. Check it against the bank statement.`,
      body: [
        heading("Bank slip to verify"),
        paragraph(`<strong>${esc(order.customerName)}</strong> uploaded a slip for order <strong>${esc(order.number)}</strong>.`),
        notice(`Expected amount: <strong>${esc(formatPrice(order.total))}</strong>${order.paymentReference ? `<br>Customer's reference: <strong>${esc(order.paymentReference)}</strong>` : ""}`, "warn"),
        button(adminOrderUrl(order), "Review slip"),
      ].join(""),
    }),
    text: textBlock([`${order.customerName} uploaded a bank slip for order ${order.number}.`, `Expected amount: ${formatPrice(order.total)}`, order.paymentReference ? `Reference: ${order.paymentReference}` : null, "", adminOrderUrl(order)]),
  };
}

/* ---------- registry (used by the admin preview page) ---------- */

export const TEMPLATES = {
  "order-placed": { label: "Order placed (bank details)", audience: "Customer", render: (o: Order) => orderPlacedEmail(o) },
  "payment-submitted": { label: "Slip received", audience: "Customer", render: (o: Order) => paymentSubmittedEmail(o) },
  "payment-confirmed": { label: "Payment confirmed", audience: "Customer", render: (o: Order) => paymentConfirmedEmail(o) },
  "payment-rejected": { label: "Payment not verified", audience: "Customer", render: (o: Order) => paymentRejectedEmail(o, "The amount on the slip doesn't match the order total.") },
  "payment-reminder": { label: "Payment reminder", audience: "Customer", render: (o: Order) => paymentReminderEmail(o) },
  "order-shipped": { label: "Order shipped", audience: "Customer", render: (o: Order) => orderShippedEmail(o) },
  "order-delivered": { label: "Order delivered", audience: "Customer", render: (o: Order) => orderDeliveredEmail(o) },
  "order-cancelled": { label: "Order cancelled", audience: "Customer", render: (o: Order) => orderCancelledEmail(o, "Payment wasn't received within 48 hours.") },
  "admin-new-order": { label: "New order", audience: "Store owner", render: (o: Order) => adminNewOrderEmail(o) },
  "admin-payment-submitted": { label: "Slip to verify", audience: "Store owner", render: (o: Order) => adminPaymentSubmittedEmail(o) },
} as const;

export type TemplateKey = keyof typeof TEMPLATES;
