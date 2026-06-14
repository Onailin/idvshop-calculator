import { getTopupRecommendations } from "@/services/recommendationEngine";
import { ALL_GROUPS_FILTER } from "@/types/package";
import type { PackageCombination, PackageGroupFilter, PackageInput } from "@/types/package";

const TOP_RESULTS = 3;

export function topupCalculator(
  requiredTopup: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): PackageCombination[] {
  if (requiredTopup <= 0 || packages.length === 0) {
    return [];
  }

  const { combinations } = getTopupRecommendations(
    requiredTopup,
    packages,
    groupFilter,
  );

  return combinations.slice(0, TOP_RESULTS);
}
