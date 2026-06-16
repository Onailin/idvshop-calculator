import { TOP_CALCULATOR_RESULTS, clampCalculatorAmount } from "@/lib/calculator-constants";
import {
  getAffordabilityCheck,
  getBudgetRecommendations,
} from "@/services/recommendationEngine";
import { sortByBudgetPriority } from "@/services/packageOptimizer";
import { ALL_GROUPS_FILTER } from "@/types/package";
import type {
  BudgetCalculatorResult,
  PackageCombination,
  PackageGroupFilter,
  PackageInput,
  SkinBudgetCheckResult,
} from "@/types/package";

export function budgetCalculator(
  budget: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): PackageCombination[] {
  if (budget <= 0 || packages.length === 0) {
    return [];
  }

  const safeBudget = clampCalculatorAmount(budget);
  if (safeBudget <= 0) {
    return [];
  }

  const { combinations } = getBudgetRecommendations(safeBudget, packages, groupFilter);

  return sortByBudgetPriority(combinations).slice(0, TOP_CALCULATOR_RESULTS);
}

export function calculateBudgetCombinations(
  budget: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): BudgetCalculatorResult {
  return getBudgetRecommendations(budget, packages, groupFilter);
}

export function checkSkinAndBudget(
  requiredButtons: number,
  budget: number,
  packages: PackageInput[],
  groupFilter: PackageGroupFilter = ALL_GROUPS_FILTER,
): SkinBudgetCheckResult {
  return getAffordabilityCheck(requiredButtons, budget, packages, groupFilter);
}
