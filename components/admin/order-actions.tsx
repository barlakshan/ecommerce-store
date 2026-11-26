"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";

import { orderAction, type OrderActionState } from "@/app/admin/actions";
import type { OrderStatus } from "@/lib/order-status";

const inputClass =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

function Submit({ intent, children, tone = "primary", pending, confirm }: { intent: string; children: React.ReactNode; tone?: "primary" | "outline" | "danger"; pending: boolean; confirm?: string }) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    outline: "border border-border bg-background hover:bg-muted",
    danger: "border border-red-200 bg-background text-red-700 hover:bg-red-50",
  }[tone];
  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-opacity disabled:opacity-60 ${styles}`}
    >
      {children}
    </button>
  );
}

export function OrderActions({ number, status, hasSlip }: { number: string; status: OrderStatus; hasSlip: boolean }) {
  const [state, action, pending] = React.useActionState<OrderActionState, FormData>(orderAction, {});
  const [panel, setPanel] = React.useState<"reject" | "cancel" | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.message) {
      setPanel(null);
      formRef.current?.reset();
    }
  }, [state]);

  const canCancel = ["awaiting_payment", "payment_submitted", "paid", "processing"].includes(status);

  return (
    <section aria-labelledby="actions" className="rounded-2xl border border-border bg-background p-5">
      <h2 id="actions" className="mb-4 flex items-center gap-2 font-semibold">
        Next step {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Working" />}
      </h2>

      <div aria-live="polite">
        {state.error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-900">{state.error}</p>}
        {state.message && <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{state.message}</p>}
      </div>

      <form ref={formRef} action={action} className="space-y-3">
        <input type="hidden" name="number" value={number} />

        {(status === "payment_submitted" || status === "awaiting_payment") && (
          <>
            {status === "awaiting_payment" && !hasSlip && (
              <p className="text-sm text-muted-foreground">Waiting for the customer&apos;s slip. If the deposit already shows on your bank statement you can confirm it directly.</p>
            )}
            {status === "payment_submitted" && <p className="text-sm text-muted-foreground">Check the slip against your bank statement before confirming.</p>}
            <Submit intent="confirm_payment" pending={pending} confirm="Confirm that this payment is in your bank account?">Confirm payment received</Submit>
            {status === "payment_submitted" && (
              <button type="button" onClick={() => setPanel(panel === "reject" ? null : "reject")} className="h-10 w-full rounded-full border border-border text-sm hover:bg-muted">
                Payment not found / wrong amount
              </button>
            )}
            {panel === "reject" && (
              <div className="space-y-2 rounded-xl bg-muted p-3">
                <label htmlFor="reason-reject" className="text-sm font-medium">Message to customer</label>
                <textarea id="reason-reject" name="reason" rows={3} className={`${inputClass} h-auto py-2`} defaultValue="We couldn't find this deposit in our bank statement. Please check the slip and upload it again." />
                <Submit intent="reject_payment" tone="danger" pending={pending}>Send back to customer</Submit>
              </div>
            )}
            {status === "awaiting_payment" && <Submit intent="send_reminder" tone="outline" pending={pending}>Email a payment reminder</Submit>}
          </>
        )}

        {status === "paid" && (
          <>
            <Submit intent="start_processing" tone="outline" pending={pending}>Mark as packing</Submit>
          </>
        )}

        {(status === "paid" || status === "processing") && (
          <div className="space-y-2 rounded-xl bg-muted p-3">
            <p className="text-sm font-medium">Ship the order</p>
            <label htmlFor="carrier" className="sr-only">Courier</label>
            <input id="carrier" name="carrier" list="carriers" placeholder="Courier (e.g. Domex)" className={inputClass} />
            <datalist id="carriers">
              {["Domex", "Pronto", "Koombiyo", "Citypak", "Sri Lanka Post", "Own delivery"].map((c) => <option key={c} value={c} />)}
            </datalist>
            <label htmlFor="tracking" className="sr-only">Tracking number</label>
            <input id="tracking" name="tracking" placeholder="Tracking number (optional)" className={`${inputClass} font-mono`} />
            <Submit intent="mark_shipped" pending={pending}>Mark as shipped & email customer</Submit>
          </div>
        )}

        {status === "shipped" && <Submit intent="mark_delivered" pending={pending}>Mark as delivered</Submit>}

        {(status === "delivered" || status === "cancelled") && <p className="text-sm text-muted-foreground">This order is closed.</p>}

        {canCancel && (
          <>
            <button type="button" onClick={() => setPanel(panel === "cancel" ? null : "cancel")} className="h-10 w-full rounded-full text-sm text-red-700 hover:bg-red-50">
              Cancel order…
            </button>
            {panel === "cancel" && (
              <div className="space-y-2 rounded-xl border border-red-200 p-3">
                <label htmlFor="reason-cancel" className="text-sm font-medium">Reason (sent to the customer)</label>
                <textarea id="reason-cancel" name="reason" rows={3} className={`${inputClass} h-auto py-2`} placeholder="e.g. Cancelled at your request." />
                <p className="text-xs text-muted-foreground">Stock is returned automatically. If the customer already paid, refund them manually.</p>
                <Submit intent="cancel" tone="danger" pending={pending} confirm="Cancel this order and return the stock?">Cancel order</Submit>
              </div>
            )}
          </>
        )}
      </form>

      <form action={action} className="mt-5 space-y-2 border-t border-border pt-5">
        <input type="hidden" name="number" value={number} />
        <label htmlFor="note" className="text-sm font-medium">Internal note</label>
        <textarea id="note" name="note" rows={2} placeholder="Only visible to admins" className={`${inputClass} h-auto py-2`} />
        <div className="grid grid-cols-2 gap-2">
          <Submit intent="add_note" tone="outline" pending={pending}>Add note</Submit>
          <Submit intent="resend_confirmation" tone="outline" pending={pending}>Resend order email</Submit>
        </div>
      </form>
    </section>
  );
}
