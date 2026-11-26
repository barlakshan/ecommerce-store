/** Order lifecycle shared by the store, admin and emails. Safe for client components. */

export const ORDER_STATUSES = [
  "awaiting_payment",
  "payment_submitted",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting payment",
  payment_submitted: "Verifying payment",
  paid: "Payment confirmed",
  processing: "Packing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Customer-facing explanation of each status. */
export const STATUS_HELP: Record<OrderStatus, string> = {
  awaiting_payment: "Make a bank deposit and upload your slip so we can confirm your order.",
  payment_submitted: "We have your slip and are matching it with our bank statement. This usually takes a few business hours.",
  paid: "Your payment is confirmed. We will start packing your order shortly.",
  processing: "Your order is being packed.",
  shipped: "Your order is on its way.",
  delivered: "Your order has been delivered. Enjoy!",
  cancelled: "This order was cancelled.",
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  awaiting_payment: "bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200",
  payment_submitted: "bg-sky-100 text-sky-900 dark:bg-sky-400/15 dark:text-sky-200",
  paid: "bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200",
  processing: "bg-violet-100 text-violet-900 dark:bg-violet-400/15 dark:text-violet-200",
  shipped: "bg-indigo-100 text-indigo-900 dark:bg-indigo-400/15 dark:text-indigo-200",
  delivered: "bg-neutral-200 text-neutral-900 dark:bg-white/10 dark:text-neutral-100",
  cancelled: "bg-red-100 text-red-900 dark:bg-red-400/15 dark:text-red-200",
};

/** Steps shown in the progress tracker (cancelled is shown separately). */
export const PROGRESS_STEPS: OrderStatus[] = ["awaiting_payment", "payment_submitted", "paid", "processing", "shipped", "delivered"];

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}
