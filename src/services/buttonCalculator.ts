import { TOP_CALCULATOR_RESULTS, clampCalculatorAmount } from "@/lib/calculator-constants";
import { getSkinRecommendations } from "@/services/recommendationEngine";
import { pickTopUniqueCombinations } from "@/services/packageOptimizer";
import { ALL_GROUPS_FILTER } from "@/types/package";
import type { PackageCombination, PackageGroupFilter, PackageInput } from "@/types/package";

export function buttonCalculator(
  requiredButtons: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): PackageCombination[] {
  if (requiredButtons <= 0 || packages.length === 0) {
    return [];
  }

  const safeButtons = clampCalculatorAmount(requiredButtons);
  if (safeButtons <= 0) {
    return [];
  }

  const { combinations } = getSkinRecommendations(
    safeButtons,
    packages,
    groupFilter,
  );

  return pickTopUniqueCombinations(combinations, TOP_CALCULATOR_RESULTS);
}
