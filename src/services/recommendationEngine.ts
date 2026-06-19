import { MAX_CALCULATOR_AMOUNT } from "@/lib/calculator-constants";
import {
  findOptimalRequirementCombination,
  findTopRequirementCombinations,
  findTopBudgetCombinations,
  findTopTopupCombinations,
  generateCombinations,
  groupPackagesByGroup,
  PACKAGE_OPTIMIZER_LIMITS,
  sortByBudgetPriority,
  sortByRequirementPriority,
  sortByTopupRequirementPriority,
  sortByValuePriority,
} from "@/services/packageOptimizer";
import { ALL_GROUPS_FILTER } from "@/types/package";
import type {
  BudgetCalculatorResult,
  PackageCombination,
  PackageGroupFilter,
  PackageInput,
  SkinBudgetCheckResult,
  SkinRequirementResult,
  TopupCalculatorResult,
} from "@/types/package";

type GroupedPackages = Map<
  string,
  { groupId: string; groupName: string; packages: PackageInput[] }
>;

function filterPackagesByGroup(
  packages: PackageInput[],
  groupFilter: PackageGroupFilter,
): PackageInput[] {
  if (groupFilter === ALL_GROUPS_FILTER) {
    return packages;
  }
  return packages.filter((pkg) => pkg.groupId === groupFilter);
}

function getGroupedPackages(
  packages: PackageInput[],
  groupFilter: PackageGroupFilter,
): GroupedPackages {
  const filtered = filterPackagesByGroup(packages, groupFilter);
  return groupPackagesByGroup(filtered);
}

function dedupeCombinations(combinations: PackageCombination[]) {
  const seen = new Set<string>();
  return combinations.filter((combination) => {
    const key = `${combination.groupId}|${combination.items
      .map((item) => `${item.packageId}:${item.quantity}`)
      .sort()
      .join("|")}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function generateRequirementCombinations(
  grouped: GroupedPackages,
  requiredButtons: number,
) {
  const shouldEnumerate =
    requiredButtons <= PACKAGE_OPTIMIZER_LIMITS.fullEnumerationMaxButtons;
  const allCombinations: PackageCombination[] = [];
  const candidateLimit = Math.max(
    PACKAGE_OPTIMIZER_LIMITS.requirementCandidateLimit,
    PACKAGE_OPTIMIZER_LIMITS.maxCombinations,
  );

  for (const group of grouped.values()) {
    const topCombinations = findTopRequirementCombinations(
      group.packages,
      requiredButtons,
      group.groupId,
      group.groupName,
      candidateLimit,
    );
    allCombinations.push(...topCombinations);

    if (!shouldEnumerate) {
      continue;
    }

    const enumerated = generateCombinations(group.packages, {
      groupId: group.groupId,
      groupName: group.groupName,
      minButtons: requiredButtons,
      maxResults: PACKAGE_OPTIMIZER_LIMITS.maxCombinations,
    });
    allCombinations.push(...enumerated);
  }

  return dedupeCombinations(allCombinations);
}

function generateBudgetCombinations(grouped: GroupedPackages, budget: number) {
  const shouldEnumerate =
    budget <= PACKAGE_OPTIMIZER_LIMITS.fullEnumerationMaxBudget;
  const allCombinations: PackageCombination[] = [];
  const candidateLimit = PACKAGE_OPTIMIZER_LIMITS.requirementCandidateLimit;

  for (const group of grouped.values()) {
    const topCombinations = findTopBudgetCombinations(
      group.packages,
      budget,
      group.groupId,
      group.groupName,
      candidateLimit,
    );
    allCombinations.push(...topCombinations);

    if (!shouldEnumerate) {
      continue;
    }

    const combinations = generateCombinations(group.packages, {
      groupId: group.groupId,
      groupName: group.groupName,
      maxPrice: budget,
      maxResults: PACKAGE_OPTIMIZER_LIMITS.maxCombinations,
    });
    allCombinations.push(...combinations);
  }

  return dedupeCombinations(allCombinations);
}

function generateTopupCombinations(grouped: GroupedPackages, requiredTopup: number) {
  if (requiredTopup > MAX_CALCULATOR_AMOUNT) {
    return [];
  }

  const allCombinations: PackageCombination[] = [];
  const candidateLimit = PACKAGE_OPTIMIZER_LIMITS.requirementCandidateLimit;

  for (const group of grouped.values()) {
    const topCombinations = findTopTopupCombinations(
      group.packages,
      requiredTopup,
      group.groupId,
      group.groupName,
      candidateLimit,
    );
    allCombinations.push(...topCombinations);

    const enumerated = generateCombinations(group.packages, {
      groupId: group.groupId,
      groupName: group.groupName,
      minTopup: requiredTopup,
      maxResults: PACKAGE_OPTIMIZER_LIMITS.maxCombinations,
    });
    allCombinations.push(...enumerated);
  }

  return dedupeCombinations(allCombinations);
}

export function getTopupRecommendations(
  requiredTopup: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): TopupCalculatorResult {
  if (requiredTopup <= 0 || packages.length === 0) {
    return {
      requiredTopup,
      combinations: [],
    };
  }

  const grouped = getGroupedPackages(packages, groupFilter);
  const combinations = sortByTopupRequirementPriority(
    generateTopupCombinations(grouped, requiredTopup),
  );

  return {
    requiredTopup,
    combinations,
  };
}

export function getSkinRecommendations(
  requiredButtons: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): SkinRequirementResult {
  if (requiredButtons <= 0 || packages.length === 0) {
    return {
      requiredButtons,
      bestRecommendation: null,
      bestValueCombination: null,
      combinations: [],
    };
  }

  const grouped = getGroupedPackages(packages, groupFilter);
  const combinations = sortByRequirementPriority(
    generateRequirementCombinations(grouped, requiredButtons),
  );
  const valueSorted = sortByValuePriority(combinations);

  return {
    requiredButtons,
    bestRecommendation: combinations[0] ?? null,
    bestValueCombination: valueSorted[0] ?? null,
    combinations,
  };
}

export function getBudgetRecommendations(
  budget: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): BudgetCalculatorResult {
  if (budget <= 0 || packages.length === 0) {
    return {
      budget,
      bestValueCombination: null,
      highestButtonsCombination: null,
      combinations: [],
    };
  }

  const grouped = getGroupedPackages(packages, groupFilter);
  const combinations = sortByBudgetPriority(
    generateBudgetCombinations(grouped, budget),
  );
  const valueSorted = sortByValuePriority(combinations);

  return {
    budget,
    highestButtonsCombination: combinations[0] ?? null,
    bestValueCombination: valueSorted[0] ?? null,
    combinations,
  };
}

export function getAffordabilityCheck(
  requiredButtons: number,
  budget: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): SkinBudgetCheckResult {
  if (requiredButtons <= 0) {
    return {
      requiredButtons,
      budget,
      canAfford: true,
      recommendedCombination: null,
      remainingButtons: 0,
      remainingBudget: budget,
      additionalMoneyRequired: 0,
    };
  }

  const grouped = getGroupedPackages(packages, groupFilter);
  const recommendations: PackageCombination[] = [];

  for (const group of grouped.values()) {
    const optimal = findOptimalRequirementCombination(
      group.packages,
      requiredButtons,
      group.groupId,
      group.groupName,
    );
    if (optimal) {
      recommendations.push(optimal);
    }
  }

  const recommendedCombination =
    sortByRequirementPriority(recommendations)[0] ?? null;

  if (!recommendedCombination) {
    return {
      requiredButtons,
      budget,
      canAfford: false,
      recommendedCombination: null,
      remainingButtons: 0,
      remainingBudget: budget,
      additionalMoneyRequired: 0,
    };
  }

  const canAfford = recommendedCombination.totalPrice <= budget;

  return {
    requiredButtons,
    budget,
    canAfford,
    recommendedCombination,
    remainingButtons: recommendedCombination.remainingButtons,
    remainingBudget: canAfford ? budget - recommendedCombination.totalPrice : 0,
    additionalMoneyRequired: canAfford
      ? 0
      : Math.max(0, recommendedCombination.totalPrice - budget),
  };
}

export function getMultipleSkinRecommendations(
  skinButtonCosts: number[],
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): SkinRequirementResult {
  const requiredButtons = skinButtonCosts.reduce((sum, cost) => sum + cost, 0);
  return getSkinRecommendations(requiredButtons, packages, groupFilter);
}
