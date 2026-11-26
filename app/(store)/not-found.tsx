import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 pt-24 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 font-display text-5xl">Off the rail</h1>
      <p className="mt-3 text-sm text-muted-foreground">We couldn&apos;t find that page. It may have sold out or moved.</p>
      <Link href="/shop" className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-background">Back to the shop</Link>
    </div>
  );
}
