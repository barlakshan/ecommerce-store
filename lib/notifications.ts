import { store } from "@/lib/config";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/mail/send";
import {
  adminNewOrderEmail,
  adminPaymentSubmittedEmail,
  orderCancelledEmail,
  orderDeliveredEmail,
  orderPlacedEmail,
  orderShippedEmail,
  paymentConfirmedEmail,
  paymentRejectedEmail,
  paymentReminderEmail,
  paymentSubmittedEmail,
} from "@/lib/mail/templates";
import { cancelOrder, getOverdueOrders, OrderError, type Order } from "@/lib/orders";

const toCustomer = (order: Order, template: string, email: ReturnType<typeof orderPlacedEmail>) =>
  sendEmail({ to: order.email, email, template, orderId: order.id, replyTo: store.supportEmail });

const toAdmin = (order: Order, template: string, email: ReturnType<typeof orderPlacedEmail>) =>
  sendEmail({ to: env.adminEmail, email, template, orderId: order.id, replyTo: order.email });

export const notify = {
  orderPlaced: (o: Order) => Promise.all([toCustomer(o, "order-placed", orderPlacedEmail(o)), toAdmin(o, "admin-new-order", adminNewOrderEmail(o))]),
  paymentSubmitted: (o: Order) =>
    Promise.all([toCustomer(o, "payment-submitted", paymentSubmittedEmail(o)), toAdmin(o, "admin-payment-submitted", adminPaymentSubmittedEmail(o))]),
  paymentConfirmed: (o: Order) => toCustomer(o, "payment-confirmed", paymentConfirmedEmail(o)),
  paymentRejected: (o: Order, reason: string) => toCustomer(o, "payment-rejected", paymentRejectedEmail(o, reason)),
  paymentReminder: (o: Order) => toCustomer(o, "payment-reminder", paymentReminderEmail(o)),
  shipped: (o: Order) => toCustomer(o, "order-shipped", orderShippedEmail(o)),
  delivered: (o: Order) => toCustomer(o, "order-delivered", orderDeliveredEmail(o)),
  cancelled: (o: Order, reason: string) => toCustomer(o, "order-cancelled", orderCancelledEmail(o, reason)),
};

/**
 * Cancels unpaid orders whose payment window has passed and returns their stock.
 * Runs whenever the admin panel or an order page loads; schedule a request to /admin if you want it on a timer.
 */
export async function expireOverdueOrders() {
  const overdue = getOverdueOrders();
  for (const order of overdue) {
    const reason = `Payment wasn't received within ${store.paymentWindowHours} hours, so the reserved items were released.`;
    try {
      const cancelled = cancelOrder(order, reason, "system");
      await notify.cancelled(cancelled, reason);
    } catch (error) {
      // Another request already changed this order (e.g. the slip arrived just now).
      if (!(error instanceof OrderError)) throw error;
    }
  }
  return overdue.length;
}
