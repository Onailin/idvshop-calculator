"use client";

import { ButtonAmount } from "@/components/ui/button-amount";
import { CalculatorOrderButton } from "@/features/calculator/calculator-order-button";
import { getCombinationTopupTotal } from "@/services/packageOptimizer";
import { formatBahtInt } from "@/lib/utils";
import type { PackageCombination } from "@/types/package";
import type { ReactNode } from "react";

export type CalculatorEmphasis = "budget" | "buttons" | "topup";

type CalculatorCombinationCardProps = {
  combination: PackageCombination;
  rank?: number;
  emphasis?: CalculatorEmphasis;
};

function StatRow({
  label,
  value,
  highlight = false,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  highlight?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          valueClassName ??
          (highlight ? "text-lg font-bold" : "font-medium")
        }
      >
        {value}
      </span>
    </div>
  );
}

export function CalculatorCombinationCard({
  combination,
  rank,
  emphasis = "budget",
}: CalculatorCombinationCardProps) {
  const totalTopup = getCombinationTopupTotal(combination);
  const orderPayload = {
    kind: "combination" as const,
    groupId: combination.groupId,
    items: combination.items.map((item) => ({
      packageId: item.packageId,
      quantity: item.quantity,
    })),
  };

  const stats = {
    price: {
      label: "ราคารวม",
      value: formatBahtInt(combination.totalPrice),
    },
    buttons: {
      label: "กระดุมรวม",
      value: (
        <ButtonAmount
          value={combination.totalButtons}
          size="md"
          highlight
        />
      ),
    },
    topup: {
      label: "ยอดเติมสะสมรวม",
      value: (
        <ButtonAmount value={totalTopup} suffix={false} size="sm" />
      ),
    },
  };

  const order: Array<keyof typeof stats> =
    emphasis === "buttons"
      ? ["buttons", "price", "topup"]
      : emphasis === "topup"
        ? ["topup", "buttons", "price"]
        : ["price", "buttons", "topup"];

  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {combination.groupName}
          </p>
          {rank !== undefined && (
            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
              #{rank}
            </p>
          )}
        </div>
        <CalculatorOrderButton
          orderPayload={orderPayload}
          previewTotals={{
            totalButtons: combination.totalButtons,
            totalPrice: combination.totalPrice,
          }}
        />
      </div>

      <div className="mt-3 space-y-2">
        {order.map((key, index) => (
          <StatRow
            key={key}
            label={stats[key].label}
            value={stats[key].value}
            highlight={index === 0 && key !== "buttons" && key !== "topup"}
            valueClassName={
              key === "buttons" || key === "topup"
                ? undefined
                : index === 0
                  ? "text-lg font-bold"
                  : undefined
            }
          />
        ))}
      </div>
    </article>
  );
}
