import { getSkinRecommendations, getMultipleSkinRecommendations } from "@/services/recommendationEngine";
import { ALL_GROUPS_FILTER } from "@/types/package";
import type {
  PackageGroupFilter,
  PackageInput,
  SkinRequirementResult,
} from "@/types/package";

export function calculateSkinRequirement(
  requiredButtons: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): SkinRequirementResult {
  return getSkinRecommendations(requiredButtons, packages, groupFilter);
}

export function calculateMultipleSkinsRequirement(
  skinButtonCosts: number[],
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): SkinRequirementResult {
  return getMultipleSkinRecommendations(skinButtonCosts, packages, groupFilter);
}

export function findCheapestCombination(
  requiredButtons: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
) {
  return getSkinRecommendations(requiredButtons, packages, groupFilter).bestRecommendation;
}

export function findBestValueCombination(
  requiredButtons: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
) {
  return getSkinRecommendations(requiredButtons, packages, groupFilter).bestValueCombination;
}
