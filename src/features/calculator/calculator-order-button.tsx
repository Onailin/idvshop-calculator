import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE_FACEBOOK_URL } from "@/lib/store-links";
import { cn } from "@/lib/utils";

type CalculatorOrderButtonProps = {
  className?: string;
};

export function CalculatorOrderButton({ className }: CalculatorOrderButtonProps) {
  return (
    <Button
      asChild
      size="sm"
      className={cn(
        "shrink-0 gap-1.5 bg-primary hover:bg-primary/90",
        className,
      )}
    >
      <Link
        href={STORE_FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ShoppingCart className="h-4 w-4" aria-hidden />
        สั่งซื้อ
      </Link>
    </Button>
  );
}
