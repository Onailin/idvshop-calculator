import { getSkinRecommendations } from "@/services/recommendationEngine";
import { pickTopSkinRecommendations } from "@/services/packageOptimizer";
import { ALL_GROUPS_FILTER } from "@/types/package";
import type { PackageCombination, PackageGroupFilter, PackageInput } from "@/types/package";

const TOP_RESULTS = 3;

export function buttonCalculator(
  requiredButtons: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): PackageCombination[] {
  if (requiredButtons <= 0 || packages.length === 0) {
    return [];
  }

  const { combinations } = getSkinRecommendations(
    requiredButtons,
    packages,
    groupFilter,
  );

  return pickTopSkinRecommendations(combinations, TOP_RESULTS);
}
