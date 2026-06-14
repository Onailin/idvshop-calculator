export type PackageInput = {
  id: string;
  buttons: number;
  topupAmount: number | null;
  price: number;
  groupId: string;
  groupName: string;
};

export type PackageGroupOption = {
  id: string;
  name: string;
  isActive: boolean;
};

export type PackageLineItem = {
  packageId: string;
  buttons: number;
  price: number;
  topupAmount: number | null;
  quantity: number;
  groupId: string;
  groupName: string;
};

export type PackageCombination = {
  groupId: string;
  groupName: string;
  items: PackageLineItem[];
  totalPrice: number;
  totalButtons: number;
  remainingButtons: number;
  remainingBudget: number;
  packageCount: number;
  valuePerButton: number;
};

export type SkinRequirementResult = {
  requiredButtons: number;
  bestRecommendation: PackageCombination | null;
  bestValueCombination: PackageCombination | null;
  combinations: PackageCombination[];
};

export type BudgetCalculatorResult = {
  budget: number;
  bestValueCombination: PackageCombination | null;
  highestButtonsCombination: PackageCombination | null;
  combinations: PackageCombination[];
};

export type TopupCalculatorResult = {
  requiredTopup: number;
  combinations: PackageCombination[];
};

export type SkinBudgetCheckResult = {
  requiredButtons: number;
  budget: number;
  canAfford: boolean;
  recommendedCombination: PackageCombination | null;
  remainingButtons: number;
  remainingBudget: number;
  additionalMoneyRequired: number;
};

export const ALL_GROUPS_FILTER = "all" as const;
export type PackageGroupFilter = string | typeof ALL_GROUPS_FILTER;
