"use client";

import { Separator } from "@/components/ui/separator";
import { ButtonAmount, ButtonBreakdown } from "@/components/ui/button-amount";
import { CalculatorOrderButton } from "@/features/calculator/calculator-order-button";
import { cn, formatBahtInt } from "@/lib/utils";
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

const PACKAGE_LINE_GRID =
  "grid grid-cols-[minmax(0,1fr)_2.75rem_4.5rem] items-start gap-x-2 sm:grid-cols-[minmax(0,1fr)_3rem_5rem] sm:gap-x-3";

function PackageLineHeader() {
  return (
    <div
      className={cn(
        PACKAGE_LINE_GRID,
        "mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
      )}
    >
      <span>แพ็ก</span>
      <span className="text-right">จำนวน</span>
      <span className="text-right">ราคา</span>
    </div>
  );
}

function PackageLine({ item }: { item: PackageLineItem }) {
  const topup = getTopupPerUnit(item);
  const lineTotal = item.price * item.quantity;

  return (
    <li className={cn(PACKAGE_LINE_GRID, "text-sm")}>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 font-medium">
          <ButtonAmount value={item.buttons} size="sm" highlight />
          <span className="text-foreground">· {formatBahtInt(item.price)}</span>
        </p>
        <p className="text-muted-foreground">
          <ButtonBreakdown topup={topup} buttons={item.buttons} />
        </p>
      </div>
      <span className="pt-0.5 text-right tabular-nums text-muted-foreground">
        ×{item.quantity}
      </span>
      <span className="pt-0.5 text-right tabular-nums font-medium text-foreground">
        {formatBahtInt(lineTotal)}
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
        <CalculatorOrderButton />
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
      <PackageLineHeader />
      <ul className="space-y-2">
        {combination.items.map((item) => (
          <PackageLine key={`${item.packageId}-${item.quantity}`} item={item} />
        ))}
      </ul>
    </article>
  );
}
