import { isAdmin } from "@/lib/auth";
import { readSlip } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!(await isAdmin())) return new Response("Not found", { status: 404 });
  const slip = await readSlip((await params).file);
  if (!slip) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(slip.data), {
    headers: {
      "Content-Type": slip.mime,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      // Sandboxing breaks the browser's built-in PDF viewer, so only apply it to images.
      ...(slip.mime === "application/pdf" ? {} : { "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox" }),
    },
  });
}
