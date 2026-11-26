"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";

import { trackOrder, type TrackState } from "@/app/(store)/actions";

const inputClass =
  "h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:text-sm";

export function TrackForm() {
  const [state, action, pending] = React.useActionState<TrackState, FormData>(trackOrder, {});
  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <label htmlFor="number" className="mb-1.5 block text-sm font-medium">Order number</label>
        <input id="number" name="number" required autoComplete="off" autoCapitalize="characters" placeholder="RL-261126-1234" defaultValue={state.values?.number} className={`${inputClass} font-mono uppercase`} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={state.values?.email} className={inputClass} />
      </div>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <button type="submit" disabled={pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Find my order
      </button>
    </form>
  );
}
