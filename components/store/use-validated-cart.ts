"use client";

import * as React from "react";

import { validateCart } from "@/app/(store)/actions";
import { useCart } from "@/components/store/cart-provider";

/** Refreshes prices and stock in the bag once it has loaded from storage. */
export function useValidatedCart() {
  const cart = useCart();
  const [checking, setChecking] = React.useState(true);
  const [notices, setNotices] = React.useState<string[]>([]);
  const checked = React.useRef(false);

  React.useEffect(() => {
    if (!cart.ready || checked.current) return;
    checked.current = true;
    if (cart.items.length === 0) {
      setChecking(false);
      return;
    }
    validateCart(cart.items.map(({ productId, size, quantity }) => ({ productId, size, quantity })))
      .then((result) => {
        cart.replace(result.items);
        setNotices([...new Set(result.notices)]);
      })
      .catch(() => setNotices(["We couldn't refresh your bag. Prices will be checked again at checkout."]))
      .finally(() => setChecking(false));
  }, [cart]);

  return { ...cart, checking, notices };
}
