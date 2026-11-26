"use client";

import { ExternalLink, LayoutDashboard, LogOut, Mail, Package, Shirt } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/app/admin/actions";
import { store } from "@/lib/config";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products & stock", icon: Shirt },
  { href: "/admin/emails", label: "Email templates", icon: Mail },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <aside className="border-b border-border bg-background md:sticky md:top-0 md:flex md:h-svh md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-4 md:py-6">
        <Link href="/admin" className="text-sm font-semibold uppercase tracking-[0.32em]">{store.name}</Link>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Admin</span>
          <form action={logout} className="md:hidden">
            <button type="submit" aria-label="Sign out" className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
      <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 md:flex-1 md:pb-0">
        <ul className="flex gap-1 md:flex-col">
          {LINKS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <Icon className="size-4" aria-hidden="true" /> {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="hidden space-y-1 border-t border-border p-3 md:block">
        <Link href="/" target="_blank" className="flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
          <ExternalLink className="size-4" aria-hidden="true" /> View store
        </Link>
        <form action={logout}>
          <button type="submit" className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
