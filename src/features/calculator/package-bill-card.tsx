"use client";

import { Separator } from "@/components/ui/separator";
import { ButtonAmount, ButtonBreakdown } from "@/components/ui/button-amount";
import { formatBahtInt } from "@/lib/utils";
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

function PackageLine({ item }: { item: PackageLineItem }) {
  const topup = getTopupPerUnit(item);
  const bonus = getBonus(item.buttons, topup);
  const lineTotal = item.price * item.quantity;

  return (
    <li className="flex items-start justify-between gap-3 text-sm">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="flex flex-wrap items-center gap-x-2 font-medium">
          <ButtonAmount value={item.buttons} size="sm" highlight />
          <span className="font-normal text-foreground">
            · {formatBahtInt(item.price)}
            {item.quantity > 1 && (
              <span className="text-muted-foreground">
                {" "}
                (รวม {formatBahtInt(lineTotal)})
              </span>
            )}
          </span>
        </p>
        {bonus > 0 && (
          <p className="text-muted-foreground">
            <ButtonBreakdown topup={topup} buttons={item.buttons} />
          </p>
        )}
      </div>
      {item.quantity > 1 && (
        <span className="shrink-0 font-medium text-destructive">
          × {item.quantity} ครั้ง
        </span>
      )}
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
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{combination.groupName}</p>
        {rank !== undefined && (
          <span className="shrink-0 text-xs text-muted-foreground">#{rank}</span>
        )}
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
