"use client";

import { Separator } from "@/components/ui/separator";
import { ButtonAmount, ButtonBreakdown } from "@/components/ui/button-amount";
import { formatBahtInt } from "@/lib/utils";
import { getCombinationTopupTotal } from "@/services/packageOptimizer";
import type { PackageCombination, PackageLineItem } from "@/types/package";
import type { ReactNode } from "react";

export type CalculatorEmphasis = "budget" | "buttons" | "topup";

type CalculatorCombinationCardProps = {
  combination: PackageCombination;
  rank?: number;
  emphasis?: CalculatorEmphasis;
  budget?: number;
};

function getTopupPerUnit(item: PackageLineItem): number {
  return item.topupAmount ?? item.buttons;
}

function PackageLine({ item }: { item: PackageLineItem }) {
  const topup = getTopupPerUnit(item);
  const lineTotal = item.price * item.quantity;

  return (
    <li className="flex items-start justify-between gap-4 text-sm">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 font-medium">
          <ButtonAmount value={item.buttons} size="sm" highlight />
          <span className="text-foreground">· {formatBahtInt(item.price)}</span>
        </p>
        <p className="text-muted-foreground">
          <ButtonBreakdown topup={topup} buttons={item.buttons} />
        </p>
      </div>
      <span className="shrink-0 text-muted-foreground">
        × {item.quantity}
        {item.quantity > 1 && (
          <span className="block text-right font-medium text-foreground">
            {formatBahtInt(lineTotal)}
          </span>
        )}
      </span>
    </li>
  );
}

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
  budget,
}: CalculatorCombinationCardProps) {
  const totalTopup = getCombinationTopupTotal(combination);
  const remainingBudget =
    budget !== undefined ? Math.max(0, budget - combination.totalPrice) : null;

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
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          {combination.groupName}
        </p>
        {rank !== undefined && (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            #{rank}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {order.map((key, index) => (
          <StatRow
            key={key}
            label={stats[key].label}
            value={stats[key].value}
            highlight={index === 0 && key !== "buttons"}
            valueClassName={
              key === "buttons"
                ? undefined
                : index === 0
                  ? "text-lg font-bold"
                  : undefined
            }
          />
        ))}
      </div>

      {remainingBudget !== null && (
        <p className="mt-2 text-xs text-muted-foreground">
          งบเหลือ {formatBahtInt(remainingBudget)}
        </p>
      )}

      <Separator className="my-4" />

      <p className="mb-2 text-sm font-semibold">รายละเอียดแพ็กเกจ</p>
      <ul className="space-y-2">
        {combination.items.map((item) => (
          <PackageLine key={`${item.packageId}-${item.quantity}`} item={item} />
        ))}
      </ul>
    </article>
  );
}
