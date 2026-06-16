import { TOP_CALCULATOR_RESULTS, clampCalculatorAmount } from "@/lib/calculator-constants";
import { getTopupRecommendations } from "@/services/recommendationEngine";
import {
  pickTopUniqueCombinations,
  sortByTopupRequirementPriority,
} from "@/services/packageOptimizer";
import { ALL_GROUPS_FILTER } from "@/types/package";
import type { PackageCombination, PackageGroupFilter, PackageInput } from "@/types/package";

export function topupCalculator(
  requiredTopup: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): PackageCombination[] {
  if (requiredTopup <= 0 || packages.length === 0) {
    return [];
  }

  const safeTopup = clampCalculatorAmount(requiredTopup);
  if (safeTopup <= 0) {
    return [];
  }

  const { combinations } = getTopupRecommendations(
    safeTopup,
    packages,
    groupFilter,
  );

  return pickTopUniqueCombinations(
    combinations,
    TOP_CALCULATOR_RESULTS,
    sortByTopupRequirementPriority,
  );
}
