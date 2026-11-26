import { store } from "@/lib/config";

const money = new Intl.NumberFormat(store.locale, {
  style: "currency",
  currency: store.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number) {
  return money.format(amount);
}

const dateTime = new Intl.DateTimeFormat(store.locale, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Colombo",
});

const dateOnly = new Intl.DateTimeFormat(store.locale, {
  dateStyle: "medium",
  timeZone: "Asia/Colombo",
});

export function formatDateTime(iso: string | null | undefined) {
  return iso ? dateTime.format(new Date(iso)) : "—";
}

export function formatDate(iso: string | null | undefined) {
  return iso ? dateOnly.format(new Date(iso)) : "—";
}
