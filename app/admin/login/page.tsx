import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { store } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.32em]">{store.name}</p>
        <h1 className="mt-6 text-2xl font-semibold">Store admin</h1>
        {adminConfigured() ? (
          <LoginForm next={next} />
        ) : (
          <div className="mt-4 space-y-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">Admin isn&apos;t set up yet.</p>
            <p>
              Add <code className="font-mono">ADMIN_PASSWORD</code> (8+ characters) and <code className="font-mono">SESSION_SECRET</code> (32+ characters) to{" "}
              <code className="font-mono">.env.local</code>, then restart the server.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
