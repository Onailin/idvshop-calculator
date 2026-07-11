"use client";

import { ButtonAmount } from "@/components/ui/button-amount";
import { CalculatorOrderButton } from "@/features/calculator/calculator-order-button";
import { getCombinationTopupTotal } from "@/services/packageOptimizer";
import { formatBahtInt } from "@/lib/utils";
import type { PackageCombination } from "@/types/package";
import type { OrderSelectedItem } from "@/types/order";

type PackageBillCardProps = {
  combination: PackageCombination;
  rank?: number;
  selectedItems?: OrderSelectedItem[];
};

export function PackageBillCard({
  combination,
  rank,
  selectedItems,
}: PackageBillCardProps) {
  const totalTopup = getCombinationTopupTotal(combination);
  const orderPayload = {
    kind: "combination" as const,
    groupId: combination.groupId,
    items: combination.items.map((item) => ({
      packageId: item.packageId,
      quantity: item.quantity,
    })),
    selectedItems,
  };

  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{combination.groupName}</p>
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

      <p className="mt-3 text-3xl font-bold tracking-tight">
        {formatBahtInt(combination.totalPrice)}
      </p>

      <p className="mt-2 flex flex-wrap items-center gap-2 text-base">
        <span>กระดุมทั้งหมด</span>
        <ButtonAmount
          value={combination.totalButtons}
          size="lg"
          highlight
        />
      </p>

      <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">ยอดเติมสะสมรวม</span>
        <ButtonAmount value={totalTopup} suffix={false} size="sm" />
      </p>
    </article>
  );
}
