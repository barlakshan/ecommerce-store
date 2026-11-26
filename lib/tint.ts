/** Soft background built from a garment's colour, so every card has its own hue. */
export function tintBackground(color: string | null | undefined) {
  const c = color ?? "#e6dcff";
  return `radial-gradient(120% 90% at 50% 15%, color-mix(in oklab, ${c} 22%, white) 0%, color-mix(in oklab, ${c} 38%, #fff6ea) 100%)`;
}
