import type { Metadata } from "next";
import { Cormorant, Geist, Geist_Mono } from "next/font/google";

import { CartProvider } from "@/components/store/cart-provider";
import { store } from "@/lib/config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: { default: `${store.name} · Clothing Store`, template: `%s · ${store.name}` },
  description: store.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}>
      <body className="antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
