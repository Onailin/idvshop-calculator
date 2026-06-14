"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { budgetCalculator } from "@/services/budgetCalculator";
import { buttonCalculator } from "@/services/buttonCalculator";
import { topupCalculator } from "@/services/topupCalculator";
import {
  calculateOptimalCouponAllocation,
  countRequiredCouponPackages,
  getCouponAllocationValidationError,
  getPackageTierPrices,
  getRegularPackagesForSelection,
  packageRequiresCoupon,
} from "@/services/discountCalculator";
import { PriceWithDiscount } from "@/features/calculator/price-with-discount";
import { CalculatorCombinationCard } from "@/features/calculator/calculator-combination-card";
import { QuantityStepper } from "@/features/calculator/quantity-stepper";
import { NoPackagesMessage, parseAmount } from "@/features/calculator/package-result-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonAmount } from "@/components/ui/button-amount";
import { cn, formatBahtInt, formatButtons } from "@/lib/utils";
import type {
  CouponAllocationResult,
  GlobalCouponInventory,
  SelectedPackageEntry,
} from "@/types/discount";
import type { PackageCombination, PackageInput } from "@/types/package";

type CalculatorMode = "budget" | "buttons" | "topup" | "coupon";

type PackageCalculatorPageProps = {
  packages: PackageInput[];
};

const TABS: Array<{
  id: CalculatorMode;
  icon: string;
  label: string;
}> = [
  { id: "budget", icon: "", label: "งบที่คุณมี" },
  { id: "buttons", icon: "", label: "จำนวนกระดุมที่ต้องการ" },
  { id: "topup", icon: "", label: "ยอดเติมสะสมที่ต้องการ" },
  { id: "coupon", icon: "", label: "คูปองส่วนลด" },
];

type AmountTabProps = {
  id: string;
  label: string;
  placeholder: string;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
  results: PackageCombination[];
  emphasis: "budget" | "buttons" | "topup";
  budget?: number;
  emptyMessage: string;
  isCalculating?: boolean;
};

function sanitizeNumericInput(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function AmountCalculatorTab({
  id,
  label,
  placeholder,
  suffix = "บาท",
  value,
  onChange,
  results,
  emphasis,
  budget,
  emptyMessage,
  isCalculating = false,
}: AmountTabProps) {
  const amount = parseAmount(value);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center gap-3">
              <Input
                id={id}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                placeholder={placeholder}
                value={value}
                onChange={(event) =>
                  onChange(sanitizeNumericInput(event.target.value))
                }
                className="flex-1"
              />
              {suffix && (
                <span className="shrink-0 text-sm text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {amount > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">
            ผลลัพธ์ที่แนะนำ (Top 3)
            {isCalculating && (
              <span className="ml-2 font-normal text-muted-foreground">
                · กำลังคำนวณ...
              </span>
            )}
          </h3>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {results.map((combination, index) => (
                <CalculatorCombinationCard
                  key={`${combination.groupId}-${index}`}
                  combination={combination}
                  rank={index + 1}
                  emphasis={emphasis}
                  budget={budget}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function CouponCalculatorTab({ packages }: { packages: PackageInput[] }) {
  const regularPackages = useMemo(
    () => getRegularPackagesForSelection(packages),
    [packages],
  );
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<SelectedPackageEntry[]>([]);
  const [inventory, setInventory] = useState<GlobalCouponInventory>({
    discount10: 0,
    discount3: 0,
  });
  const [result, setResult] = useState<CouponAllocationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleAddPackage() {
    if (!selectedPackageId || quantity <= 0) {
      return;
    }

    setSelections((current) => {
      const existing = current.find((entry) => entry.packageId === selectedPackageId);
      if (existing) {
        return current.map((entry) =>
          entry.packageId === selectedPackageId
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry,
        );
      }
      return [...current, { packageId: selectedPackageId, quantity }];
    });
    setQuantity(1);
    setResult(null);
    setError(null);
  }

  function handleRemoveSelection(packageId: string) {
    setSelections((current) => current.filter((entry) => entry.packageId !== packageId));
    setResult(null);
  }

  function handleUpdateQuantity(packageId: string, nextQuantity: number) {
    if (nextQuantity <= 0) {
      handleRemoveSelection(packageId);
      return;
    }

    setSelections((current) =>
      current.map((entry) =>
        entry.packageId === packageId
          ? { ...entry, quantity: nextQuantity }
          : entry,
      ),
    );
    setResult(null);
  }

  const totalPackages = selections.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalCoupons = inventory.discount10 + inventory.discount3;
  const requiredCouponPackageCount = useMemo(
    () => countRequiredCouponPackages(selections, packages),
    [selections, packages],
  );
  const validationError = useMemo(
    () => getCouponAllocationValidationError(selections, inventory, packages),
    [selections, inventory, packages],
  );

  function handleCalculate() {
    if (selections.length === 0) {
      setResult(null);
      setError("กรุณาเพิ่มแพ็กเกจอย่างน้อย 1 รายการ");
      return;
    }

    const allocationError = getCouponAllocationValidationError(
      selections,
      inventory,
      packages,
    );

    if (allocationError === "NO_COUPONS") {
      setResult(null);
      setError("ไม่สามารถคำนวณได้ กรุณาเลือกคูปอง");
      return;
    }

    if (allocationError === "INSUFFICIENT_COUPONS") {
      setResult(null);
      setError("กรุณาเลือกคูปองให้ครบ");
      return;
    }

    const calculated = calculateOptimalCouponAllocation(
      selections,
      inventory,
      packages,
    );

    if (!calculated) {
      setResult(null);
      setError("ไม่สามารถคำนวณได้ กรุณาตรวจสอบแพ็กเกจและคูปอง");
      return;
    }

    setError(null);
    setResult(calculated);
  }

  if (regularPackages.length === 0) {
    return <NoPackagesMessage />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">วิธีใช้กับหลายแพ็กเกจ</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>เพิ่มแพ็กเกจได้หลายรายการ เช่น 759 × 3 และ 335 × 2</li>
          <li>กฎ: <strong>1 คูปองต่อ 1 แพ็กเกจ</strong> — แพ็กเกจหนึ่งใช้ได้แค่คูปองเดียว</li>
          <li>
            ระบบเลือกแพ็กที่<strong>ลดได้มากที่สุด</strong>ก่อน (มักเป็นแพ็กใหญ่)
            แล้วจัดสรรคูปอง 10% / 3% ให้คุ้มที่สุด
          </li>
          <li>
            แพ็กราคาปกติ (เช่น 335, 759) ใช้<strong>ราคาปกติจากฐานข้อมูล</strong> — ไม่ต้องใช้คูปอง
          </li>
          <li>
            แพ็กที่มีเฉพาะราคาคูปอง 3% / 10% ต้อง<strong>เลือกคูปองให้ครบทุกแพ็ก</strong>
          </li>
        </ul>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">แพ็กเกจที่เลือก</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <div className="space-y-2">
              <Label>เลือกแพ็กเกจ</Label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกแพ็กเกจ" />
                </SelectTrigger>
                <SelectContent>
                  {regularPackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      <span className="inline-flex items-center gap-1">
                        แพ็ค <ButtonAmount value={pkg.buttons} size="xs" />
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>จำนวน</Label>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
              />
            </div>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleAddPackage}
              disabled={!selectedPackageId}
            >
              <Plus className="h-4 w-4" />
              เพิ่มแพ็กเกจ
            </Button>
          </div>

          {selections.length > 0 && (
            <div className="space-y-3 border-t border-border/60 pt-4">
              <p className="text-xs text-muted-foreground">
                รวม {formatButtons(totalPackages)} แพ็กเกจ · คูปองที่มี{" "}
                {formatButtons(totalCoupons)} ใบ
              </p>
              <ul className="divide-y divide-border/60">
                {selections.map((selection) => {
                  const pkg = regularPackages.find(
                    (entry) => entry.id === selection.packageId,
                  );
                  if (!pkg) {
                    return null;
                  }

                  const tierPrices = getPackageTierPrices(packages, pkg);

                  return (
                    <li
                      key={selection.packageId}
                      className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-base">
                          <ButtonAmount
                            value={pkg.buttons}
                            size="md"
                            highlight
                          />
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[
                            tierPrices.discount3 !== null &&
                              `คูปอง 3% ${formatBahtInt(tierPrices.discount3)}`,
                            tierPrices.discount10 !== null &&
                              `คูปอง 10% ${formatBahtInt(tierPrices.discount10)}`,
                            validationError !== null &&
                              packageRequiresCoupon(pkg.buttons, tierPrices) &&
                              "· คูปอง: ไม่มี",
                          ]
                            .filter(Boolean)
                            .join(" · ") || "ไม่มีราคาคูปอง"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <QuantityStepper
                          value={selection.quantity}
                          onChange={(value) =>
                            handleUpdateQuantity(selection.packageId, value)
                          }
                          min={1}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveSelection(selection.packageId)}
                          aria-label="ลบแพ็กเกจ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">คูปองที่มี</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <QuantityStepper
            label="คูปอง 10%"
            value={inventory.discount10}
            onChange={(discount10) =>
              setInventory((current) => ({ ...current, discount10 }))
            }
          />
          <QuantityStepper
            label="คูปอง 3%"
            value={inventory.discount3}
            onChange={(discount3) =>
              setInventory((current) => ({ ...current, discount3 }))
            }
          />
          {validationError === "INSUFFICIENT_COUPONS" && (
            <p className="text-xs text-destructive">
              มีแพ็กที่ต้องใช้คูปอง {formatButtons(requiredCouponPackageCount)} ชิ้น แต่มีคูปอง{" "}
              {formatButtons(totalCoupons)} ใบ — กรุณาเลือกคูปองให้ครบ
            </p>
          )}
          {validationError === "NO_COUPONS" && (
            <p className="text-xs text-destructive">
              มีแพ็กที่ต้องใช้คูปองในรายการ — ไม่สามารถคำนวณได้ กรุณาเลือกคูปอง
            </p>
          )}
          <Button
            type="button"
            className="w-full"
            onClick={handleCalculate}
            disabled={selections.length === 0}
          >
            คำนวณการจัดสรรคูปอง
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">รายละเอียดการใช้คูปอง</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">แพ็กเกจ</th>
                    <th className="pb-2 pr-4 font-medium">คูปอง</th>
                    <th className="pb-2 font-medium">ราคา</th>
                  </tr>
                </thead>
                <tbody>
                  {result.lines.map((line, index) => (
                    <tr key={`${line.packageId}-${index}`} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <ButtonAmount
                          value={line.buttons}
                          size="sm"
                          highlight
                        />
                      </td>
                      <td className="py-2 pr-4">
                        {line.coupon ?? "ราคาปกติ"}
                      </td>
                      <td className="py-2">
                        <PriceWithDiscount
                          regular={line.referencePrice}
                          discounted={line.price}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">สรุปผล</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">กระดุมรวม</dt>
                  <dd>
                    <ButtonAmount
                      value={result.totalButtons}
                      size="sm"
                      highlight
                    />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">ยอดเติมสะสมรวม</dt>
                  <dd>
                    <ButtonAmount value={result.totalTopup} suffix={false} size="sm" />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">ราคารวม</dt>
                  <dd>
                    <PriceWithDiscount
                      regular={result.referenceTotal}
                      discounted={result.discountedTotal}
                      size="lg"
                    />
                  </dd>
                </div>
                {result.totalSavings > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">ประหยัดได้</dt>
                    <dd className="font-medium text-primary">
                      {formatBahtInt(result.totalSavings)}
                    </dd>
                  </div>
                )}
              </dl>

              <Separator />

              <div className="space-y-2 text-sm">
                <p className="font-semibold">การใช้คูปอง</p>
                <p className="text-muted-foreground">
                  10% ใช้: {result.couponUsage.discount10Used}
                </p>
                <p className="text-muted-foreground">
                  3% ใช้: {result.couponUsage.discount3Used}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export function PackageCalculatorPage({ packages }: PackageCalculatorPageProps) {
  const [activeTab, setActiveTab] = useState<CalculatorMode>("budget");
  const [budgetInput, setBudgetInput] = useState("");
  const [buttonsInput, setButtonsInput] = useState("");
  const [topupInput, setTopupInput] = useState("");

  const deferredBudgetInput = useDeferredValue(budgetInput);
  const deferredButtonsInput = useDeferredValue(buttonsInput);
  const deferredTopupInput = useDeferredValue(topupInput);

  const budgetAmount = parseAmount(deferredBudgetInput);
  const buttonsAmount = parseAmount(deferredButtonsInput);
  const topupAmount = parseAmount(deferredTopupInput);

  const isBudgetCalculating = deferredBudgetInput !== budgetInput;
  const isButtonsCalculating = deferredButtonsInput !== buttonsInput;
  const isTopupCalculating = deferredTopupInput !== topupInput;

  const budgetResults = useMemo(
    () => budgetCalculator(budgetAmount, packages),
    [budgetAmount, packages],
  );
  const buttonResults = useMemo(
    () => buttonCalculator(buttonsAmount, packages),
    [buttonsAmount, packages],
  );
  const topupResults = useMemo(
    () => topupCalculator(topupAmount, packages),
    [topupAmount, packages],
  );

  if (packages.length === 0) {
    return <NoPackagesMessage />;
  }

  return (
    <div className="space-y-6">
      <nav
        aria-label="โหมดคำนวณ"
        className="grid grid-cols-2 gap-2 md:grid-cols-4"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex min-h-14 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand-rose bg-primary text-primary-foreground shadow-sm"
                  : "border-brand-blush bg-card text-foreground hover:bg-brand-blush/40",
              )}
            >
              <span aria-hidden>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div>
        {activeTab === "budget" && (
          <AmountCalculatorTab
            id="budget-amount"
            label="งบประมาณ (THB)"
            placeholder="เช่น 1000"
            value={budgetInput}
            onChange={setBudgetInput}
            results={budgetResults}
            emphasis="budget"
            budget={budgetAmount}
            emptyMessage="ไม่พบชุดแพ็กเกจที่เหมาะกับงบนี้"
            isCalculating={isBudgetCalculating}
          />
        )}

        {activeTab === "buttons" && (
          <AmountCalculatorTab
            id="buttons-amount"
            label="จำนวนกระดุมที่ต้องการ"
            placeholder="เช่น 2500"
            suffix="กระดุม"
            value={buttonsInput}
            onChange={setButtonsInput}
            results={buttonResults}
            emphasis="buttons"
            emptyMessage="ไม่พบชุดแพ็กเกจที่เพียงพอสำหรับจำนวนกระดุมนี้"
            isCalculating={isButtonsCalculating}
          />
        )}

        {activeTab === "topup" && (
          <AmountCalculatorTab
            id="topup-amount"
            label="ยอดเติมสะสมที่ต้องการ"
            placeholder="เช่น 3000"
            suffix="ยอดเติมสะสม"
            value={topupInput}
            onChange={setTopupInput}
            results={topupResults}
            emphasis="topup"
            emptyMessage="ไม่พบชุดแพ็กเกจที่เพียงพอสำหรับยอดเติมสะสมนี้"
            isCalculating={isTopupCalculating}
          />
        )}

        {activeTab === "coupon" && <CouponCalculatorTab packages={packages} />}
      </div>
    </div>
  );
}
