"use client";

import Image from "next/image";
import * as React from "react";

import { tintBackground } from "@/lib/tint";

export function ProductGallery({ images, name, color }: { images: { src: string; label: string }[]; name: string; color?: string | null }) {
  const background = tintBackground(color);
  const [index, setIndex] = React.useState(0);
  const current = images[index];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div role="tablist" aria-label="Product views" className="flex gap-2 sm:flex-col">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${img.label} view`}
              onClick={() => setIndex(i)}
              style={{ background }}
              className={`relative aspect-[4/5] w-16 overflow-hidden rounded-2xl transition-shadow duration-200 sm:w-20 ${i === index ? "ring-[3px] ring-plum" : "hover:ring-2 hover:ring-coral/60"}`}
            >
              <Image src={img.src} alt="" fill sizes="80px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[2rem]" style={{ background }} role="tabpanel">
        {current ? (
          <Image key={current.src} src={current.src} alt={`${name}, ${current.label.toLowerCase()} view`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="animate-in fade-in object-contain p-8 drop-shadow-[0_18px_20px_rgba(30,27,46,0.2)] duration-300" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No photo yet</div>
        )}
      </div>
    </div>
  );
}
