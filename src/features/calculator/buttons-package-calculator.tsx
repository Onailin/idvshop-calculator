"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ButtonAmount } from "@/components/ui/button-amount";
import { findRegularPackageGroupId } from "@/lib/package-group-default";
import { calculateSkinRequirement } from "@/services/skinRequirementCalculator";
import { PackageGroupSelect } from "@/features/calculator/package-group-select";
import {
  NoPackagesMessage,
  PackageResultList,
} from "@/features/calculator/package-result-list";
import {
  ALL_GROUPS_FILTER,
  type PackageGroupFilter,
  type PackageGroupOption,
  type PackageInput,
} from "@/types/package";

type SelectedItemSummary = {
  id: string;
  name: string;
  buttonCost: number;
  quantity: number;
};

type ButtonsPackageCalculatorProps = {
  packages: PackageInput[];
  packageGroups: PackageGroupOption[];
  totalButtons: number;
  selectedItems: SelectedItemSummary[];
};

export function ButtonsPackageCalculator({
  packages,
  packageGroups,
  totalButtons,
  selectedItems,
}: ButtonsPackageCalculatorProps) {
  const [groupFilter, setGroupFilter] = useState<PackageGroupFilter>(() =>
    findRegularPackageGroupId(packageGroups) ?? ALL_GROUPS_FILTER,
  );

  const requiredFromItems = useDeferredValue(totalButtons);
  const isCalculating = requiredFromItems !== totalButtons;

  const itemResults = useMemo(() => {
    if (requiredFromItems <= 0) return [];
    return calculateSkinRequirement(
      requiredFromItems,
      packages,
      groupFilter,
    ).combinations;
  }, [requiredFromItems, packages, groupFilter]);

  if (packages.length === 0) {
    return <NoPackagesMessage />;
  }

  return (
    <div className="space-y-5 rounded-2xl border border-brand-blush/50 bg-white/70 p-5 shadow-sm">
      {selectedItems.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">
            แพ็คเก็จที่ท่านเลือก
          </h3>
          <ul className="divide-y divide-brand-blush/30 overflow-hidden rounded-lg border border-brand-blush/40 bg-white">
            {selectedItems.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 px-3 py-2.5 sm:px-4"
              >
                <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="text-muted-foreground"> ×{item.quantity}</span>
                  )}
                </span>
                <ButtonAmount
                  value={item.buttonCost * item.quantity}
                  size="sm"
                  highlight
                />
              </li>
            ))}
          </ul>
          {(selectedItems.length > 1 ||
            selectedItems.some((item) => item.quantity > 1)) && (
            <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
              <span>รวม</span>
              <ButtonAmount
                value={requiredFromItems}
                size="sm"
                highlight
              />
              {isCalculating && (
                <span className="text-muted-foreground"> · กำลังคำนวณ...</span>
              )}
            </p>
          )}
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          เลือกไอเทมเพื่อดูแพ็กเกจและราคาที่ต้องจ่าย
        </p>
      )}

      {requiredFromItems > 0 && (
        <>
          <PackageGroupSelect
            packageGroups={packageGroups}
            value={groupFilter}
            onChange={setGroupFilter}
            hideLabel
          />

          <PackageResultList
            title="แพ็กเกจที่คุ้มที่สุด"
            combinations={itemResults}
            emptyMessage="ไม่พบชุดแพ็กเกจที่เพียงพอ"
          />
        </>
      )}
    </div>
  );
}
