"use client";

import { Check, Copy } from "lucide-react";
import * as React from "react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value.replace(/\s/g, ""));
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // Clipboard blocked; the value is still visible to copy manually.
        }
      }}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}
