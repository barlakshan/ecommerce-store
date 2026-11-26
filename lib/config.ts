/**
 * Store-wide settings. Safe to import from client components (no secrets here).
 * Replace the bank accounts and contact details with your real ones before going live.
 */

export type BankAccount = {
  bank: string;
  branch: string;
  accountName: string;
  accountNumber: string;
};

export const store = {
  name: "Rail",
  legalName: "Rail Clothing (Pvt) Ltd",
  tagline: "Everyday clothing, hung with care.",
  currency: "LKR",
  locale: "en-LK",
  /** Flat delivery fee in whole rupees. */
  shippingFee: 450,
  /** Orders at or above this subtotal ship free. */
  freeShippingThreshold: 15000,
  /** Unpaid orders are cancelled automatically after this many hours. */
  paymentWindowHours: 48,
  maxQuantityPerLine: 10,
  supportEmail: "hello@rail.example",
  supportPhone: "+94 77 123 4567",
  address: "No. 12, Flower Road, Colombo 07",
  bankAccounts: [
    {
      bank: "Commercial Bank of Ceylon",
      branch: "Colombo 07",
      accountName: "Rail Clothing (Pvt) Ltd",
      accountNumber: "1000 2345 6789",
    },
    {
      bank: "Sampath Bank",
      branch: "Kollupitiya",
      accountName: "Rail Clothing (Pvt) Ltd",
      accountNumber: "0012 3456 7890",
    },
  ] satisfies BankAccount[],
} as const;

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const CATEGORIES = [
  { slug: "tees", name: "Tees & polos" },
  { slug: "shirts", name: "Shirts" },
  { slug: "knitwear", name: "Knitwear" },
  { slug: "sweats", name: "Sweats & hoodies" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa",
  "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
] as const;

export function shippingFor(subtotal: number) {
  return subtotal === 0 || subtotal >= store.freeShippingThreshold ? 0 : store.shippingFee;
}
