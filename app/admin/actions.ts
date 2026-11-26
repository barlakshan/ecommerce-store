"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { checkPassword, endAdminSession, requireAdmin, startAdminSession } from "@/lib/auth";
import { SIZES } from "@/lib/config";
import { notify } from "@/lib/notifications";
import {
  addNote,
  cancelOrder,
  confirmPayment,
  getOrderByNumber,
  markDelivered,
  markProcessing,
  markShipped,
  OrderError,
  rejectPayment,
} from "@/lib/orders";
import { updateProduct } from "@/lib/products";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    // Slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { error: "That password isn't right." };
  }
  await startAdminSession();
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

export type OrderActionState = { error?: string; message?: string };

const text = (formData: FormData, key: string, max = 300) => String(formData.get(key) ?? "").trim().slice(0, max);

export async function orderAction(_prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  await requireAdmin();
  const order = getOrderByNumber(text(formData, "number", 40));
  if (!order) return { error: "Order not found." };
  const intent = text(formData, "intent", 40);

  try {
    let message: string;
    switch (intent) {
      case "confirm_payment": {
        const updated = confirmPayment(order, text(formData, "note") || undefined);
        await notify.paymentConfirmed(updated);
        message = "Payment confirmed. The customer has been emailed.";
        break;
      }
      case "reject_payment": {
        const reason = text(formData, "reason");
        if (reason.length < 5) return { error: "Tell the customer why the payment couldn't be verified." };
        const updated = rejectPayment(order, reason);
        await notify.paymentRejected(updated, reason);
        message = "Payment rejected. The customer has been asked to upload a new slip.";
        break;
      }
      case "start_processing":
        markProcessing(order);
        message = "Marked as packing.";
        break;
      case "mark_shipped": {
        const carrier = text(formData, "carrier", 60);
        if (!carrier) return { error: "Enter the courier name." };
        const updated = markShipped(order, { carrier, trackingNumber: text(formData, "tracking", 60) });
        await notify.shipped(updated);
        message = "Marked as shipped. The customer has been emailed the tracking details.";
        break;
      }
      case "mark_delivered": {
        const updated = markDelivered(order);
        await notify.delivered(updated);
        message = "Marked as delivered.";
        break;
      }
      case "cancel": {
        const reason = text(formData, "reason");
        if (reason.length < 5) return { error: "Add a reason for the customer." };
        const updated = cancelOrder(order, reason, "admin");
        await notify.cancelled(updated, reason);
        message = "Order cancelled, stock returned, and the customer emailed.";
        break;
      }
      case "send_reminder":
        if (order.status !== "awaiting_payment") return { error: "Reminders are only for orders awaiting payment." };
        await notify.paymentReminder(order);
        message = "Payment reminder sent.";
        break;
      case "resend_confirmation":
        await notify.orderPlaced(order);
        message = "Order confirmation email re-sent.";
        break;
      case "add_note": {
        const note = text(formData, "note", 1000);
        if (!note) return { error: "Write a note first." };
        addNote(order, note);
        message = "Note added.";
        break;
      }
      default:
        return { error: "Unknown action." };
    }
    revalidatePath(`/admin/orders/${order.number}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { message };
  } catch (error) {
    if (error instanceof OrderError) return { error: error.message };
    console.error("[admin] order action failed", error);
    return { error: "Something went wrong. Please try again." };
  }
}

const productSchema = z.object({
  id: z.coerce.number().int().positive(),
  price: z.coerce.number().int().min(1).max(10_000_000),
  compareAtPrice: z
    .string()
    .transform((v) => (v.trim() === "" ? null : Number(v)))
    .pipe(z.number().int().min(1).max(10_000_000).nullable()),
  active: z.boolean(),
  featured: z.boolean(),
  stock: z.record(z.string(), z.coerce.number().int().min(0).max(100_000)),
});

export type ProductActionState = { error?: string; message?: string };

export async function saveProduct(_prev: ProductActionState, formData: FormData): Promise<ProductActionState> {
  await requireAdmin();
  const parsed = productSchema.safeParse({
    id: formData.get("id"),
    price: formData.get("price"),
    compareAtPrice: String(formData.get("compareAtPrice") ?? ""),
    active: formData.get("active") === "on",
    featured: formData.get("featured") === "on",
    stock: Object.fromEntries(SIZES.map((s) => [s, formData.get(`stock_${s}`) ?? 0])),
  });
  if (!parsed.success) return { error: "Check the price and stock values (whole numbers only)." };
  if (parsed.data.compareAtPrice !== null && parsed.data.compareAtPrice <= parsed.data.price) {
    return { error: "“Was” price must be higher than the price, or left empty." };
  }
  updateProduct(parsed.data.id, parsed.data);
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { message: "Saved" };
}
