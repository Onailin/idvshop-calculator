"use client";

import type { ReactNode } from "react";
import { PackageBillCard } from "@/features/calculator/package-bill-card";
import { pickTopSkinRecommendations } from "@/services/packageOptimizer";
import type { PackageCombination } from "@/types/package";

export const TOP_RESULTS = 3;

export function parseAmount(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

type PackageResultListProps = {
  title: string;
  combinations: PackageCombination[];
  emptyMessage: string;
  requiredButtons?: number;
  showRemainingBudget?: boolean;
};

export function PackageResultList({
  title,
  combinations,
  emptyMessage,
  requiredButtons,
  showRemainingBudget = false,
}: PackageResultListProps) {
  const top = pickTopSkinRecommendations(combinations, TOP_RESULTS);

  if (top.length === 0) {
    return (
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-muted-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-muted-foreground">{title}</h3>
      <div className="space-y-3">
        {top.map((combination, index) => (
          <PackageBillCard
            key={`${combination.groupId}-${index}`}
            combination={combination}
            rank={index + 1}
            requiredButtons={requiredButtons}
            showRemainingBudget={showRemainingBudget}
          />
        ))}
      </div>
      {combinations.length > TOP_RESULTS && (
        <p className="text-xs text-muted-foreground">
          แสดง {TOP_RESULTS} รายการแรกจากทั้งหมด {combinations.length} ชุด
        </p>
      )}
    </section>
  );
}

type PackageCalculatorShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PackageCalculatorShell({
  title,
  description,
  children,
}: PackageCalculatorShellProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-blush/50 bg-white/60">
      <header className="border-b border-brand-blush/40 bg-white/80 px-5 py-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="space-y-6 p-5">{children}</div>
    </div>
  );
}

export function NoPackagesMessage() {
  return (
    <div className="rounded-2xl border border-brand-blush/50 bg-white/50 p-6">
      <h2 className="text-lg font-bold">แพ็กเกจ</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        ยังไม่มีแพ็กเกจในระบบ กรุณาเพิ่มแพ็กเกจจากแผงแอดมิน
      </p>
    </div>
  );
}
