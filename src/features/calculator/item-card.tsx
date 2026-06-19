"use client";

import { ItemThumbnail } from "@/components/ui/item-thumbnail";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isGachaMarbleItem } from "@/lib/gacha-marble-item";
import { formatRarity, RARITY_COLORS } from "@/lib/rarity";
import { cn, formatBahtInt } from "@/lib/utils";
import { ButtonAmount } from "@/components/ui/button-amount";
import type { CalculatorItem } from "@/types";

type ItemCardProps = {
  item: CalculatorItem;
  selected: boolean;
  onToggle: (id: string) => void;
};

export function ItemCard({ item, selected, onToggle }: ItemCardProps) {
  const compactImage = isGachaMarbleItem(item);
  const toggleLabel = selected
    ? `เอา ${item.name} ออกจากรายการคำนวณ`
    : `เพิ่ม ${item.name} ในรายการคำนวณ`;

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={toggleLabel}
      onClick={() => onToggle(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle(item.id);
        }
      }}
      className={cn(
        "min-w-0 cursor-pointer overflow-hidden transition-all hover:shadow-md",
        selected
          ? "ring-2 ring-primary border-brand-rose/40 bg-brand-blush/20"
          : "border-brand-blush/50",
      )}
    >
      <CardContent className="p-0">
        <div
          className={
            compactImage
              ? "flex min-h-[9rem] items-stretch sm:min-h-[9.5rem] lg:min-h-[10rem]"
              : "flex min-h-[10.5rem] items-stretch sm:min-h-[11rem] lg:min-h-[12rem]"
          }
        >
          {compactImage ? (
            <div className="flex w-28 shrink-0 items-center justify-start sm:w-32 lg:w-36">
              <ItemThumbnail
                src={item.imageUrl}
                alt={item.name}
                variant="card-compact"
              />
            </div>
          ) : (
            <div className="relative w-36 shrink-0 sm:w-40 lg:w-44">
              <ItemThumbnail
                src={item.imageUrl}
                alt={item.name}
                variant="card"
                className="absolute inset-0"
              />
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2.5">
            <div className="min-w-0 space-y-1">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
                {item.name}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                {item.categoryName}
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Badge
                  className={`shrink-0 ${RARITY_COLORS[item.rarity] ?? "bg-slate-500 text-white"}`}
                >
                  {formatRarity(item.rarity)}
                </Badge>
                <ButtonAmount
                  value={item.buttonCost}
                  size="sm"
                  highlight
                />
              </div>
              {item.sendPrice !== null && (
                <p className="text-xs text-muted-foreground">
                  แบบส่ง {formatBahtInt(item.sendPrice)}
                </p>
              )}
            </div>

            <div className="mt-1.5 flex justify-end">
              <span
                aria-hidden="true"
                className={cn(
                  buttonVariants({
                    size: "sm",
                    variant: selected ? "default" : "outline",
                  }),
                  "pointer-events-none h-7 rounded-full px-3 text-[11px] font-medium leading-none",
                )}
              >
                คำนวณ
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
