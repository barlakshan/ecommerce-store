import { formatPrice } from "@/lib/format";

export function Price({ amount, compareAt, className = "" }: { amount: number; compareAt?: number | null; className?: string }) {
  const onSale = compareAt != null && compareAt > amount;
  return (
    <span className={`inline-flex flex-wrap items-baseline justify-end gap-x-2 tabular-nums ${className}`}>
      <span className={onSale ? "font-medium" : undefined}>{formatPrice(amount)}</span>
      {onSale && (
        <s className="text-muted-foreground">
          <span className="sr-only">was </span>
          {formatPrice(compareAt)}
        </s>
      )}
    </span>
  );
}
