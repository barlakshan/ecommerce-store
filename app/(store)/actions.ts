"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import type { CartItem } from "@/components/store/cart-provider";
import { DISTRICTS, SIZES, store } from "@/lib/config";
import { notify } from "@/lib/notifications";
import { createOrder, findOrderForTracking, getOrderForCustomer, OrderError, submitPayment } from "@/lib/orders";
import { getProductsByIds } from "@/lib/products";
import { saveSlip, UploadError } from "@/lib/storage";

const lineSchema = z.object({
  productId: z.number().int().positive(),
  size: z.enum(SIZES),
  quantity: z.number().int().min(1).max(store.maxQuantityPerLine),
});
const linesSchema = z.array(lineSchema).max(50);

/** Re-checks the bag against current prices and stock. */
export async function validateCart(lines: { productId: number; size: string; quantity: number }[]) {
  const parsed = linesSchema.safeParse(lines);
  if (!parsed.success) return { items: [] as CartItem[], notices: ["Your bag was reset because it contained invalid items."] };

  const products = new Map(getProductsByIds([...new Set(parsed.data.map((l) => l.productId))]).map((p) => [p.id, p]));
  const notices: string[] = [];
  const items: CartItem[] = [];

  for (const line of parsed.data) {
    const product = products.get(line.productId);
    if (!product || !product.active) {
      notices.push("An item in your bag is no longer available and was removed.");
      continue;
    }
    const available = product.stock[line.size] ?? 0;
    if (available === 0) {
      notices.push(`${product.name} (${line.size}) sold out and was removed.`);
      continue;
    }
    let quantity = line.quantity;
    if (quantity > available) {
      quantity = available;
      notices.push(`Only ${available} of ${product.name} (${line.size}) left, so we updated the quantity.`);
    }
    items.push({ productId: product.id, slug: product.slug, name: product.name, image: product.image, size: line.size, price: product.price, quantity, available });
  }
  return { items, notices };
}

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(120),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^\+?\d{9,15}$/, "Enter a valid phone number, e.g. 077 123 4567.")),
  addressLine1: z.string().trim().min(4, "Enter your street address.").max(120),
  addressLine2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2, "Enter your city or town.").max(60),
  district: z.enum(DISTRICTS, { message: "Choose your district." }),
  postalCode: z.string().trim().max(10).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CheckoutState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof checkoutSchema>, string>>;
  values?: Record<string, string>;
  redirectTo?: string;
};

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values = Object.fromEntries(
    ["customerName", "email", "phone", "addressLine1", "addressLine2", "city", "district", "postalCode", "notes"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: CheckoutState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof typeof fieldErrors;
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Please check the highlighted fields.", fieldErrors, values };
  }

  let lines: unknown;
  try {
    lines = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    lines = null;
  }
  const cart = linesSchema.safeParse(lines);
  if (!cart.success || cart.data.length === 0) return { error: "Your bag is empty.", values };

  try {
    const order = createOrder(parsed.data, cart.data);
    await notify.orderPlaced(order);
    return { redirectTo: `/orders/${order.number}?t=${order.accessToken}&placed=1` };
  } catch (error) {
    if (error instanceof OrderError) return { error: error.message, values };
    console.error("[checkout] failed to create order", error);
    return { error: "Something went wrong while placing your order. Please try again.", values };
  }
}

export type SlipState = { error?: string; ok?: boolean };

export async function uploadSlip(_prev: SlipState, formData: FormData): Promise<SlipState> {
  const number = String(formData.get("number") ?? "");
  const token = String(formData.get("token") ?? "");
  const reference = String(formData.get("reference") ?? "").trim().slice(0, 60);
  const file = formData.get("slip");

  const order = getOrderForCustomer(number, token);
  if (!order) return { error: "We couldn't find this order. Please use the link from your email." };
  if (!["awaiting_payment", "payment_submitted"].includes(order.status)) return { error: "This order no longer needs a payment slip." };
  if (!(file instanceof File)) return { error: "Choose a photo or PDF of your bank slip." };

  try {
    const slip = await saveSlip(order.number, file);
    const updated = submitPayment(order, { reference, slip });
    await notify.paymentSubmitted(updated);
    return { ok: true };
  } catch (error) {
    if (error instanceof UploadError || error instanceof OrderError) return { error: error.message };
    console.error("[slip] upload failed", error);
    return { error: "Upload failed. Please try again." };
  }
}

export type TrackState = { error?: string; values?: { number: string; email: string } };

export async function trackOrder(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const number = String(formData.get("number") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "").trim();
  const order = number && email ? findOrderForTracking(number, email) : null;
  if (!order) return { error: "We couldn't find an order with that number and email.", values: { number, email } };
  redirect(`/orders/${order.number}?t=${order.accessToken}`);
}
