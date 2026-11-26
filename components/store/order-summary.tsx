import { store } from "@/lib/config";
import { formatPrice } from "@/lib/format";

export function Totals({ subtotal, shipping, total, showFreeShippingHint = false }: { subtotal: number; shipping: number; total: number; showFreeShippingHint?: boolean }) {
  const remaining = store.freeShippingThreshold - subtotal;
  return (
    <div className="space-y-3 text-sm">
      {showFreeShippingHint && subtotal > 0 && (
        <div className="space-y-2 rounded-xl bg-muted px-4 py-3">
          <p>{remaining > 0 ? <>Add <strong>{formatPrice(remaining)}</strong> more for free delivery.</> : "You've unlocked free delivery."}</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-background" aria-hidden="true">
            <div className="h-full rounded-full bg-gradient-to-r from-teal via-sun to-coral transition-[width] duration-300" style={{ width: `${Math.min(100, (subtotal / store.freeShippingThreshold) * 100)}%` }} />
          </div>
        </div>
      )}
      <dl className="space-y-2">
        <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
      </dl>
    </div>
  );
}
