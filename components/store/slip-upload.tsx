"use client";

import { CheckCircle2, FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { type SlipState, uploadSlip } from "@/app/(store)/actions";

export function SlipUpload({ number, token, replacing = false }: { number: string; token: string; replacing?: boolean }) {
  const [state, action, pending] = React.useActionState<SlipState, FormData>(uploadSlip, {});
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  React.useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  if (state.ok) {
    return (
      <p role="status" className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-200">
        <CheckCircle2 className="size-4" aria-hidden="true" /> Slip uploaded. We&apos;ll email you once the payment is confirmed.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="number" value={number} />
      <input type="hidden" name="token" value={token} />

      <label
        htmlFor="slip"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-8 text-center transition-colors hover:border-foreground/40 hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={preview} alt="Selected slip preview" className="max-h-48 rounded-lg object-contain" />
        ) : (
          <FileUp className="size-7 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="text-sm font-medium">{fileName ?? (replacing ? "Choose a new slip" : "Choose a photo or PDF of your slip")}</span>
        <span className="text-xs text-muted-foreground">JPG, PNG, WEBP or PDF · up to 5 MB</span>
        <input
          id="slip"
          name="slip"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFileName(file?.name ?? null);
            setPreview(file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
          }}
        />
      </label>

      <div>
        <label htmlFor="reference" className="mb-1.5 block text-sm font-medium">
          Transaction reference <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          id="reference"
          name="reference"
          maxLength={60}
          placeholder="e.g. the number printed on your slip"
          className="h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:text-sm"
        />
      </div>

      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Uploading…" : replacing ? "Upload new slip" : "Upload slip"}
      </button>
    </form>
  );
}
