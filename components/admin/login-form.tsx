"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";

import { login, type LoginState } from "@/app/admin/actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = React.useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "password-error" : undefined}
          className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive sm:text-sm"
        />
        {state.error && <p id="password-error" className="mt-1.5 text-sm text-destructive">{state.error}</p>}
      </div>
      <button type="submit" disabled={pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Sign in
      </button>
    </form>
  );
}
