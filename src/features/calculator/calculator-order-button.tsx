"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { OrderCheckoutDialog } from "@/features/calculator/order-checkout-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderPayload } from "@/types/order";

type CalculatorOrderButtonProps = {
  orderPayload: OrderPayload;
  previewTotals: {
    totalButtons: number;
    totalPrice: number;
  };
  className?: string;
};

export function CalculatorOrderButton({
  orderPayload,
  previewTotals,
  className,
}: CalculatorOrderButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="sm"
        aria-label="สั่งซื้อ"
        className={cn(
          "shrink-0 gap-1.5 bg-primary hover:bg-primary/90",
          className,
        )}
        onClick={() => setDialogOpen(true)}
      >
        <ShoppingCart className="h-4 w-4" aria-hidden />
        สั่งซื้อ
      </Button>

      <OrderCheckoutDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        orderPayload={orderPayload}
        previewTotals={previewTotals}
      />
    </>
  );
}
