import { formatBahtInt } from "@/lib/utils";
import { cn } from "@/lib/utils";

type PriceWithDiscountProps = {
  regular: number;
  discounted: number;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function PriceWithDiscount({
  regular,
  discounted,
  className,
  size = "sm",
}: PriceWithDiscountProps) {
  const hasDiscount = regular > discounted;

  if (!hasDiscount) {
    return (
      <span
        className={cn(
          "font-semibold",
          size === "lg" && "text-lg font-bold",
          size === "md" && "font-medium",
          className,
        )}
      >
        {formatBahtInt(discounted)}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-2", className)}>
      <span
        className={cn(
          "text-muted-foreground line-through decoration-destructive/40",
          size === "lg" && "text-base",
        )}
      >
        {formatBahtInt(regular)}
      </span>
      <span
        className={cn(
          "font-bold text-destructive",
          size === "lg" && "text-lg",
          size === "md" && "text-base",
        )}
      >
        {formatBahtInt(discounted)}
      </span>
    </span>
  );
}
