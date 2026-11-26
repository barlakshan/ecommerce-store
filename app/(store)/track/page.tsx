import type { Metadata } from "next";

import { TrackForm } from "@/components/store/track-form";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-md px-4 pt-16">
      <h1 className="font-display text-5xl font-semibold">Track your <span className="text-teal-deep">order</span></h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Enter your order number (e.g. RL-261126-1234) and the email you used at checkout. From your order page you can upload a bank slip and follow delivery.
      </p>
      <TrackForm />
    </div>
  );
}
