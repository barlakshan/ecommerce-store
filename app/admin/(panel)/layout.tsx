import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { expireOverdueOrders } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  await expireOverdueOrders();
  return (
    <div className="min-h-svh bg-muted/40 md:flex">
      <AdminNav />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-10">{children}</main>
    </div>
  );
}
