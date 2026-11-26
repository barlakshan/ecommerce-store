import { isAdmin } from "@/lib/auth";
import { sampleOrder } from "@/lib/mail/sample";
import { TEMPLATES, type TemplateKey } from "@/lib/mail/templates";

export const dynamic = "force-dynamic";

/** Renders an email template with sample data for the admin preview page. Add ?format=text for the plain-text version. */
export async function GET(request: Request, { params }: { params: Promise<{ template: string }> }) {
  if (!(await isAdmin())) return new Response("Not found", { status: 404 });
  const key = (await params).template as TemplateKey;
  const template = TEMPLATES[key];
  if (!template) return new Response("Not found", { status: 404 });
  const email = template.render(sampleOrder());
  const asText = new URL(request.url).searchParams.get("format") === "text";
  return new Response(asText ? email.text : email.html, {
    headers: { "Content-Type": `${asText ? "text/plain" : "text/html"}; charset=utf-8`, "Cache-Control": "no-store" },
  });
}
