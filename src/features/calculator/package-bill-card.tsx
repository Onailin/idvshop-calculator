"use client";

import { Separator } from "@/components/ui/separator";
import { ButtonAmount, ButtonBreakdown } from "@/components/ui/button-amount";
import { CalculatorOrderButton } from "@/features/calculator/calculator-order-button";
import { cn, formatBahtInt } from "@/lib/utils";
import type { PackageCombination, PackageLineItem } from "@/types/package";

function getTopupPerUnit(item: PackageLineItem): number {
  return item.topupAmount ?? item.buttons;
}

function getBonus(buttons: number, topup: number): number {
  return Math.max(0, buttons - topup);
}

function getCombinationTopupTotal(combination: PackageCombination): number {
  return combination.items.reduce(
    (sum, item) => sum + getTopupPerUnit(item) * item.quantity,
    0,
  );
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
  const bonus = getBonus(item.buttons, topup);
  const lineTotal = item.price * item.quantity;

  return (
    <li className={cn(PACKAGE_LINE_GRID, "text-sm")}>
      <div className="min-w-0 space-y-0.5">
        <p className="flex flex-wrap items-center gap-x-2 font-medium">
          <ButtonAmount value={item.buttons} size="sm" highlight />
          <span className="font-normal text-foreground">
            · {formatBahtInt(item.price)}
          </span>
        </p>
        {bonus > 0 && (
          <p className="text-muted-foreground">
            <ButtonBreakdown topup={topup} buttons={item.buttons} />
          </p>
        )}
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

type PackageBillCardProps = {
  combination: PackageCombination;
  rank?: number;
  requiredButtons?: number;
  showRemainingBudget?: boolean;
  footerNote?: string;
};

export function PackageBillCard({
  combination,
  rank,
  requiredButtons,
  showRemainingBudget = false,
  footerNote,
}: PackageBillCardProps) {
  const totalTopup = getCombinationTopupTotal(combination);
  const extraNote =
    requiredButtons !== undefined && combination.remainingButtons > 0
      ? (
          <>
            เหลือ +<ButtonAmount value={combination.remainingButtons} suffix={false} size="xs" />
          </>
        )
      : showRemainingBudget
        ? `งบเหลือ ${formatBahtInt(combination.remainingBudget)}`
        : null;

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
        <CalculatorOrderButton />
      </div>

      <p className="mt-2 text-3xl font-bold tracking-tight">
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
      {getBonus(combination.totalButtons, totalTopup) > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">
          <ButtonBreakdown
            topup={totalTopup}
            buttons={combination.totalButtons}
          />
        </p>
      )}

      <Separator className="my-3" />

      <p className="mb-2 text-sm font-semibold">แพ็กเกจที่ต้องซื้อ</p>

      <PackageLineHeader />

      <ul className="space-y-2">
        {combination.items.map((item) => (
          <PackageLine
            key={`${item.packageId}-${item.quantity}`}
            item={item}
          />
        ))}
      </ul>

      {(extraNote || footerNote) && (
        <p className="mt-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {extraNote}
          {extraNote && footerNote && " · "}
          {footerNote}
        </p>
      )}
    </article>
  );
}
