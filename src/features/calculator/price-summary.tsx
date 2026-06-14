"use client";

import { ItemThumbnail } from "@/components/ui/item-thumbnail";
import { Badge } from "@/components/ui/badge";
import { isGachaMarbleItem } from "@/lib/gacha-marble-item";
import { formatBahtInt } from "@/lib/utils";
import { ButtonAmount } from "@/components/ui/button-amount";
import { formatRarity, RARITY_COLORS } from "@/lib/rarity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/features/calculator/quantity-stepper";
import type { Rarity } from "@prisma/client";

type BillLine = {
  id: string;
  name: string;
  rarity: Rarity;
  buttonCost: number;
  sendPrice: number | null;
  imageUrl: string | null;
  quantity: number;
};

type PriceSummaryProps = {
  lines: BillLine[];
  totalButtons: number;
  totalSendPrice: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClear: () => void;
};

export function PriceSummary({
  lines,
  totalButtons,
  totalSendPrice,
  onUpdateQuantity,
  onClear,
}: PriceSummaryProps) {
  const isEmpty = lines.length === 0;

  return (
    <Card className="sticky top-[3.75rem] border-0 bg-white shadow-sm ring-1 ring-black/[0.04]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">สรุปที่เลือก</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEmpty ? (
          <p className="text-sm text-muted-foreground">
            เลือกไอเทมจากรายการด้านซ้าย
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {lines.map((line) => {
                const lineButtons = line.buttonCost * line.quantity;
                const lineSendPrice =
                  line.sendPrice !== null ? line.sendPrice * line.quantity : null;

                const compactImage = isGachaMarbleItem({ name: line.name });

                return (
                  <li
                    key={line.id}
                    className="space-y-2 rounded-xl bg-brand-cream/40 p-3"
                  >
                    <div className="flex items-start gap-3 overflow-visible">
                      <div className="flex shrink-0 items-center justify-center">
                        <ItemThumbnail
                          src={line.imageUrl}
                          alt={line.name}
                          variant={
                            compactImage ? "summary-compact" : "summary"
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium leading-snug">
                              {line.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge
                                className={`shrink-0 text-[10px] ${RARITY_COLORS[line.rarity] ?? "bg-slate-500 text-white"}`}
                              >
                                {formatRarity(line.rarity)}
                              </Badge>
                              <ButtonAmount
                                value={line.buttonCost}
                                suffix="กระดุม/ชุด"
                                size="xs"
                                className="text-muted-foreground"
                              />
                              {line.sendPrice !== null && (
                                <span className="text-xs text-muted-foreground">
                                  · แบบส่ง {formatBahtInt(line.sendPrice)}/ชุด
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-semibold">
                            ×{line.quantity}
                          </span>
                        </div>

                        <QuantityStepper
                          value={line.quantity}
                          min={0}
                          onChange={(quantity) =>
                            onUpdateQuantity(line.id, quantity)
                          }
                        />

                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-1 text-sm">
                          <span className="text-muted-foreground">กระดุมรวม</span>
                          <span className="font-medium">
                            <ButtonAmount
                              value={lineButtons}
                              size="sm"
                              highlight
                            />
                            {lineSendPrice !== null && lineSendPrice > 0 && (
                              <span className="text-foreground">
                                {" "}
                                · {formatBahtInt(lineSendPrice)}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-2 rounded-xl bg-brand-blush/25 p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">รวมทั้งหมด</span>
                <ButtonAmount
                  value={totalButtons}
                  size="md"
                  highlight
                />
              </div>
              {totalSendPrice > 0 && (
                <div className="flex justify-between gap-3 pt-1 text-base font-bold">
                  <span>แบบส่งรวม</span>
                  <span>{formatBahtInt(totalSendPrice)}</span>
                </div>
              )}
            </div>
          </>
        )}

        <Button
          variant="outline"
          className="w-full border-brand-blush/60 bg-white hover:bg-brand-cream/50"
          onClick={onClear}
          disabled={isEmpty}
        >
          ล้างการเลือก
        </Button>
      </CardContent>
    </Card>
  );
}
