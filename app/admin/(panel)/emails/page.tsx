import Link from "next/link";

import { env } from "@/lib/env";
import { sampleOrder } from "@/lib/mail/sample";
import { TEMPLATES, type TemplateKey } from "@/lib/mail/templates";

export const metadata = { title: "Email templates" };

const WHEN: Record<TemplateKey, string> = {
  "order-placed": "Right after checkout",
  "payment-submitted": "When the customer uploads a slip",
  "payment-confirmed": "When you confirm the payment",
  "payment-rejected": "When you send a slip back",
  "payment-reminder": "When you click “Email a payment reminder”",
  "order-shipped": "When you mark the order shipped",
  "order-delivered": "When you mark it delivered",
  "order-cancelled": "When an order is cancelled (by you or after the payment window)",
  "admin-new-order": "To ADMIN_EMAIL after every new order",
  "admin-payment-submitted": "To ADMIN_EMAIL when a slip is uploaded",
};

export default async function EmailTemplatesPage({ searchParams }: { searchParams: Promise<{ t?: string; format?: string }> }) {
  const params = await searchParams;
  const keys = Object.keys(TEMPLATES) as TemplateKey[];
  const selected = keys.includes(params.t as TemplateKey) ? (params.t as TemplateKey) : keys[0]!;
  const text = params.format === "text";
  const subject = TEMPLATES[selected].render(sampleOrder()).subject;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Previews use a sample order. Edit the templates in <code className="font-mono">lib/mail/templates.ts</code>.{" "}
          {env.smtp.host ? `Sending through ${env.smtp.host}.` : "SMTP isn't configured, so emails are saved to data/outbox/ instead of being sent."}
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Templates">
          <ul className="space-y-1">
            {keys.map((key) => (
              <li key={key}>
                <Link
                  href={`/admin/emails?t=${key}`}
                  aria-current={key === selected ? "page" : undefined}
                  className={`block rounded-xl px-3 py-2.5 text-sm transition-colors ${key === selected ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}
                >
                  <span className="block font-medium">{TEMPLATES[key].label}</span>
                  <span className={`block text-xs ${key === selected ? "text-background/70" : "text-muted-foreground"}`}>{TEMPLATES[key].audience} · {WHEN[key]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="min-w-0 truncate text-sm"><span className="text-muted-foreground">Subject:</span> {subject}</p>
            <div className="flex gap-1 rounded-full bg-muted p-1 text-xs">
              <Link href={`/admin/emails?t=${selected}`} className={`rounded-full px-3 py-1 ${!text ? "bg-background shadow-sm" : ""}`}>HTML</Link>
              <Link href={`/admin/emails?t=${selected}&format=text`} className={`rounded-full px-3 py-1 ${text ? "bg-background shadow-sm" : ""}`}>Plain text</Link>
            </div>
          </div>
          <iframe key={`${selected}-${text}`} title={`${TEMPLATES[selected].label} preview`} src={`/admin/emails/${selected}${text ? "?format=text" : ""}`} sandbox="" className="h-[760px] w-full bg-white" />
        </div>
      </div>
    </div>
  );
}
