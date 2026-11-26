"use client";

import * as React from "react";

import { shippingFor, store } from "@/lib/config";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  price: number;
  quantity: number;
  /** Stock left for this size, when known. */
  available?: number;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: number, size: string, quantity: number) => void;
  remove: (productId: number, size: string) => void;
  replace: (items: CartItem[]) => void;
  clear: () => void;
};

const STORAGE_KEY = "rail-cart-v1";
const CartContext = React.createContext<CartContextValue | null>(null);

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]).filter((i) => i && typeof i.productId === "number" && i.quantity > 0) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode or storage disabled: the cart still works for this visit.
  }
}

const clampQty = (n: number, available?: number) =>
  Math.max(1, Math.min(store.maxQuantityPerLine, available ?? store.maxQuantityPerLine, Math.floor(n)));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setItems(read());
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setItems(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = React.useCallback((fn: (items: CartItem[]) => CartItem[]) => {
    setItems((current) => {
      const next = fn(current);
      write(next);
      return next;
    });
  }, []);

  const value = React.useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = shippingFor(subtotal);
    return {
      items,
      ready,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      add: (item, quantity = 1) =>
        update((current) => {
          const existing = current.find((i) => i.productId === item.productId && i.size === item.size);
          if (existing) {
            return current.map((i) => (i === existing ? { ...i, ...item, quantity: clampQty(i.quantity + quantity, item.available) } : i));
          }
          return [...current, { ...item, quantity: clampQty(quantity, item.available) }];
        }),
      setQuantity: (productId, size, quantity) =>
        update((current) => current.map((i) => (i.productId === productId && i.size === size ? { ...i, quantity: clampQty(quantity, i.available) } : i))),
      remove: (productId, size) => update((current) => current.filter((i) => !(i.productId === productId && i.size === size))),
      replace: (next) => update(() => next),
      clear: () => update(() => []),
    };
  }, [items, ready, update]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
