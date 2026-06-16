import type {
  PackageCombination,
  PackageInput,
  PackageLineItem,
} from "@/types/package";

const MAX_COMBINATIONS = 50;
const REQUIREMENT_CANDIDATE_LIMIT = 30;
const FULL_ENUMERATION_MAX_BUTTONS = 2000;
const FULL_ENUMERATION_MAX_BUDGET = 2000;
const MAX_TOPUP_DP_TARGET = 100_000;

type GenerateOptions = {
  minButtons?: number;
  minTopup?: number;
  maxButtons?: number;
  maxPrice?: number;
  includeEmpty?: boolean;
  maxResults?: number;
  groupId: string;
  groupName: string;
};

type DpEntry = {
  cost: number;
  counts: number[];
};

export function getPackageTopup(pkg: {
  buttons: number;
  topupAmount: number | null;
}): number {
  return pkg.topupAmount ?? pkg.buttons;
}

export function getCombinationTopupTotal(combination: PackageCombination): number {
  return combination.items.reduce(
    (sum, item) => sum + getPackageTopup(item) * item.quantity,
    0,
  );
}

export function calculateValuePerButton(price: number, buttons: number): number {
  if (buttons <= 0) {
    return 0;
  }
  return price / buttons;
}

function getMaxButtons(packages: PackageInput[], requiredButtons: number): number {
  if (packages.length === 0) {
    return requiredButtons;
  }
  const maxPackageButtons = Math.max(...packages.map((pkg) => pkg.buttons));
  return requiredButtons + maxPackageButtons;
}

function getMaxButtonsForTopup(
  packages: PackageInput[],
  requiredTopup: number,
): number {
  if (packages.length === 0) {
    return requiredTopup;
  }

  const maxPackageButtons = Math.max(...packages.map((pkg) => pkg.buttons));
  const positiveTopups = packages.map(getPackageTopup).filter((topup) => topup > 0);
  if (positiveTopups.length === 0) {
    return FULL_ENUMERATION_MAX_BUTTONS;
  }

  const smallestTopup = Math.min(...positiveTopups);
  const packsNeeded = Math.ceil(requiredTopup / smallestTopup);

  return packsNeeded * maxPackageButtons + maxPackageButtons;
}

function getMaxPriceForTopup(
  packages: PackageInput[],
  requiredTopup: number,
): number {
  if (packages.length === 0) {
    return 0;
  }

  const cheapest = [...packages].sort((a, b) => a.price - b.price)[0];
  const positiveTopups = packages.map(getPackageTopup).filter((topup) => topup > 0);
  if (positiveTopups.length === 0) {
    return cheapest.price * 24;
  }

  const smallestTopup = Math.min(...positiveTopups);
  const packsNeeded = Math.ceil(requiredTopup / smallestTopup);

  return packsNeeded * cheapest.price * 2 + 2_000;
}

function buildCombination(
  items: PackageLineItem[],
  requiredButtons: number,
  groupId: string,
  groupName: string,
  maxPrice?: number,
): PackageCombination {
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalButtons = items.reduce(
    (sum, item) => sum + item.buttons * item.quantity,
    0,
  );
  const packageCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    groupId,
    groupName,
    items,
    totalPrice,
    totalButtons,
    remainingButtons: totalButtons - requiredButtons,
    remainingBudget: maxPrice !== undefined ? maxPrice - totalPrice : 0,
    packageCount,
    valuePerButton: calculateValuePerButton(totalPrice, totalButtons),
  };
}

function buildCombinationFromCounts(
  packages: PackageInput[],
  counts: number[],
  requiredButtons: number,
  groupId: string,
  groupName: string,
  maxPrice?: number,
): PackageCombination {
  const items: PackageLineItem[] = [];

  for (let index = 0; index < packages.length; index++) {
    const quantity = counts[index];
    if (quantity <= 0) {
      continue;
    }

    const pkg = packages[index];
    items.push({
      packageId: pkg.id,
      buttons: pkg.buttons,
      price: pkg.price,
      topupAmount: pkg.topupAmount,
      quantity,
      groupId: pkg.groupId,
      groupName: pkg.groupName,
    });
  }

  return buildCombination(items, requiredButtons, groupId, groupName, maxPrice);
}

export function compareRequirementPriority(
  a: PackageCombination,
  b: PackageCombination,
): number {
  // 1) จ่ายน้อยที่สุด
  if (a.totalPrice !== b.totalPrice) {
    return a.totalPrice - b.totalPrice;
  }
  // 2) ราคาเท่ากัน → ได้กระดุมมากกว่า (แพ็กเล็กหลายใบก็ได้)
  if (a.totalButtons !== b.totalButtons) {
    return b.totalButtons - a.totalButtons;
  }
  // 3) ราคาและกระดุมเท่ากัน → บาท/กระดุมต่ำกว่า
  if (a.valuePerButton !== b.valuePerButton) {
    return a.valuePerButton - b.valuePerButton;
  }
  // 4) สุดท้าย → ซื้อน้อยครั้งกว่า
  return a.packageCount - b.packageCount;
}

function shouldReplaceRequirementDpEntry(
  sortedPackages: PackageInput[],
  candidate: DpEntry,
  existing: DpEntry,
  requiredButtons: number,
  groupId: string,
  groupName: string,
): boolean {
  if (candidate.cost < existing.cost) {
    return true;
  }
  if (candidate.cost > existing.cost) {
    return false;
  }

  const candidateCombo = buildCombinationFromCounts(
    sortedPackages,
    candidate.counts,
    requiredButtons,
    groupId,
    groupName,
  );
  const existingCombo = buildCombinationFromCounts(
    sortedPackages,
    existing.counts,
    requiredButtons,
    groupId,
    groupName,
  );

  return compareRequirementPriority(candidateCombo, existingCombo) < 0;
}

function getCombinationTopupFromItems(items: PackageLineItem[]): number {
  return items.reduce(
    (sum, item) => sum + getPackageTopup(item) * item.quantity,
    0,
  );
}

function compareTopupRequirementPriority(
  a: PackageCombination,
  b: PackageCombination,
): number {
  if (a.totalPrice !== b.totalPrice) {
    return a.totalPrice - b.totalPrice;
  }
  const topupA = getCombinationTopupTotal(a);
  const topupB = getCombinationTopupTotal(b);
  if (topupA !== topupB) {
    return topupB - topupA;
  }
  if (a.valuePerButton !== b.valuePerButton) {
    return a.valuePerButton - b.valuePerButton;
  }
  return a.packageCount - b.packageCount;
}

function shouldReplaceTopupDpEntry(
  sortedPackages: PackageInput[],
  candidate: DpEntry,
  existing: DpEntry,
  groupId: string,
  groupName: string,
): boolean {
  if (candidate.cost < existing.cost) {
    return true;
  }
  if (candidate.cost > existing.cost) {
    return false;
  }

  const candidateCombo = buildCombinationFromCounts(
    sortedPackages,
    candidate.counts,
    0,
    groupId,
    groupName,
  );
  const existingCombo = buildCombinationFromCounts(
    sortedPackages,
    existing.counts,
    0,
    groupId,
    groupName,
  );

  return compareTopupRequirementPriority(candidateCombo, existingCombo) < 0;
}

export function findOptimalTopupCombination(
  packages: PackageInput[],
  requiredTopup: number,
  groupId: string,
  groupName: string,
): PackageCombination | null {
  if (packages.length === 0 || requiredTopup <= 0) {
    return null;
  }

  const sortedPackages = [...packages].sort(
    (a, b) => getPackageTopup(a) - getPackageTopup(b),
  );
  const maxPackageTopup = Math.max(...sortedPackages.map(getPackageTopup));
  const maxTopup = requiredTopup + maxPackageTopup;
  const dp: (DpEntry | null)[] = Array.from({ length: maxTopup + 1 }, () => null);
  dp[0] = { cost: 0, counts: Array(sortedPackages.length).fill(0) };

  for (let topup = 1; topup <= maxTopup; topup++) {
    for (let index = 0; index < sortedPackages.length; index++) {
      const pkg = sortedPackages[index];
      const pkgTopup = getPackageTopup(pkg);
      if (topup < pkgTopup) {
        continue;
      }

      const previous = dp[topup - pkgTopup];
      if (!previous) {
        continue;
      }

      const candidate: DpEntry = {
        cost: previous.cost + pkg.price,
        counts: [...previous.counts],
      };
      candidate.counts[index]++;

      const existing = dp[topup];
      if (!existing || candidate.cost < existing.cost) {
        dp[topup] = candidate;
        continue;
      }

      if (
        candidate.cost === existing.cost &&
        shouldReplaceTopupDpEntry(sortedPackages, candidate, existing, groupId, groupName)
      ) {
        dp[topup] = candidate;
      }
    }
  }

  let best: PackageCombination | null = null;
  for (let topup = requiredTopup; topup <= maxTopup; topup++) {
    const entry = dp[topup];
    if (!entry) {
      continue;
    }

    const combination = buildCombinationFromCounts(
      sortedPackages,
      entry.counts,
      0,
      groupId,
      groupName,
    );

    if (!best || compareTopupRequirementPriority(combination, best) < 0) {
      best = combination;
    }
  }

  return best;
}

export function findTopTopupCombinations(
  packages: PackageInput[],
  requiredTopup: number,
  groupId: string,
  groupName: string,
  limit: number = 3,
): PackageCombination[] {
  if (
    packages.length === 0 ||
    requiredTopup <= 0 ||
    limit <= 0 ||
    requiredTopup > MAX_TOPUP_DP_TARGET
  ) {
    return [];
  }

  const sortedPackages = [...packages].sort(
    (a, b) => getPackageTopup(a) - getPackageTopup(b),
  );
  const maxPackageTopup = Math.max(...sortedPackages.map(getPackageTopup));
  const maxTopup = requiredTopup + maxPackageTopup;
  const dp: (DpEntry | null)[] = Array.from({ length: maxTopup + 1 }, () => null);
  dp[0] = { cost: 0, counts: Array(sortedPackages.length).fill(0) };

  for (let topup = 1; topup <= maxTopup; topup++) {
    for (let index = 0; index < sortedPackages.length; index++) {
      const pkg = sortedPackages[index];
      const pkgTopup = getPackageTopup(pkg);
      if (topup < pkgTopup) {
        continue;
      }

      const previous = dp[topup - pkgTopup];
      if (!previous) {
        continue;
      }

      const candidate: DpEntry = {
        cost: previous.cost + pkg.price,
        counts: [...previous.counts],
      };
      candidate.counts[index]++;

      const existing = dp[topup];
      if (!existing || candidate.cost < existing.cost) {
        dp[topup] = candidate;
        continue;
      }

      if (
        candidate.cost === existing.cost &&
        shouldReplaceTopupDpEntry(sortedPackages, candidate, existing, groupId, groupName)
      ) {
        dp[topup] = candidate;
      }
    }
  }

  const candidates: PackageCombination[] = [];
  const seen = new Set<string>();

  for (let topup = requiredTopup; topup <= maxTopup; topup++) {
    const entry = dp[topup];
    if (!entry) {
      continue;
    }

    const combination = buildCombinationFromCounts(
      sortedPackages,
      entry.counts,
      0,
      groupId,
      groupName,
    );

    const key = combinationKey(combination);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    candidates.push(combination);
  }

  candidates.sort(compareTopupRequirementPriority);
  return candidates.slice(0, limit);
}

export function findTopRequirementCombinations(
  packages: PackageInput[],
  requiredButtons: number,
  groupId: string,
  groupName: string,
  limit: number = 3,
): PackageCombination[] {
  if (packages.length === 0 || requiredButtons <= 0 || limit <= 0) {
    return [];
  }

  const sortedPackages = [...packages].sort((a, b) => a.buttons - b.buttons);
  const maxPackageButtons = Math.max(...sortedPackages.map((pkg) => pkg.buttons));
  const maxButtons = requiredButtons + maxPackageButtons;
  const dp: (DpEntry | null)[] = Array.from({ length: maxButtons + 1 }, () => null);
  dp[0] = { cost: 0, counts: Array(sortedPackages.length).fill(0) };

  for (let buttons = 1; buttons <= maxButtons; buttons++) {
    for (let index = 0; index < sortedPackages.length; index++) {
      const pkg = sortedPackages[index];
      if (buttons < pkg.buttons) {
        continue;
      }

      const previous = dp[buttons - pkg.buttons];
      if (!previous) {
        continue;
      }

      const candidate: DpEntry = {
        cost: previous.cost + pkg.price,
        counts: [...previous.counts],
      };
      candidate.counts[index]++;

      const existing = dp[buttons];
      if (!existing || candidate.cost < existing.cost) {
        dp[buttons] = candidate;
        continue;
      }

      if (
        candidate.cost === existing.cost &&
        shouldReplaceRequirementDpEntry(
          sortedPackages,
          candidate,
          existing,
          requiredButtons,
          groupId,
          groupName,
        )
      ) {
        dp[buttons] = candidate;
      }
    }
  }

  const candidates: PackageCombination[] = [];
  const seen = new Set<string>();

  for (let buttons = requiredButtons; buttons <= maxButtons; buttons++) {
    const entry = dp[buttons];
    if (!entry) {
      continue;
    }

    const combination = buildCombinationFromCounts(
      sortedPackages,
      entry.counts,
      requiredButtons,
      groupId,
      groupName,
    );

    const key = combinationKey(combination);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    candidates.push(combination);
  }

  candidates.sort(compareRequirementPriority);
  return candidates.slice(0, limit);
}

export function findOptimalRequirementCombination(
  packages: PackageInput[],
  requiredButtons: number,
  groupId: string,
  groupName: string,
): PackageCombination | null {
  return (
    findTopRequirementCombinations(
      packages,
      requiredButtons,
      groupId,
      groupName,
      1,
    )[0] ?? null
  );
}

export function findOptimalBudgetCombination(
  packages: PackageInput[],
  budget: number,
  groupId: string,
  groupName: string,
): PackageCombination | null {
  if (packages.length === 0 || budget <= 0) {
    return null;
  }

  const sortedPackages = [...packages].sort((a, b) => a.buttons - b.buttons);
  const dp: (DpEntry | null)[] = Array.from({ length: budget + 1 }, () => null);
  dp[0] = { cost: 0, counts: Array(sortedPackages.length).fill(0) };

  for (let price = 1; price <= budget; price++) {
    for (let index = 0; index < sortedPackages.length; index++) {
      const pkg = sortedPackages[index];
      if (price < pkg.price) {
        continue;
      }

      const previous = dp[price - pkg.price];
      if (!previous) {
        continue;
      }

      const candidate: DpEntry = {
        cost: price,
        counts: [...previous.counts],
      };
      candidate.counts[index]++;

      const existing = dp[price];
      if (!existing) {
        dp[price] = candidate;
        continue;
      }

      const candidateButtons = buildCombinationFromCounts(
        sortedPackages,
        candidate.counts,
        0,
        groupId,
        groupName,
        budget,
      ).totalButtons;
      const existingButtons = buildCombinationFromCounts(
        sortedPackages,
        existing.counts,
        0,
        groupId,
        groupName,
        budget,
      ).totalButtons;

      if (
        candidateButtons > existingButtons ||
        (candidateButtons === existingButtons && price < existing.cost)
      ) {
        dp[price] = candidate;
      }
    }
  }

  let best: PackageCombination | null = null;
  for (let price = 1; price <= budget; price++) {
    const entry = dp[price];
    if (!entry) {
      continue;
    }

    const combination = buildCombinationFromCounts(
      sortedPackages,
      entry.counts,
      0,
      groupId,
      groupName,
      budget,
    );

    if (
      !best ||
      combination.totalButtons > best.totalButtons ||
      (combination.totalButtons === best.totalButtons &&
        combination.totalPrice < best.totalPrice)
    ) {
      best = combination;
    }
  }

  return best;
}

export function findTopBudgetCombinations(
  packages: PackageInput[],
  budget: number,
  groupId: string,
  groupName: string,
  limit: number = 3,
): PackageCombination[] {
  if (packages.length === 0 || budget <= 0 || limit <= 0) {
    return [];
  }

  const sortedPackages = [...packages].sort((a, b) => a.buttons - b.buttons);
  const dp: (DpEntry | null)[] = Array.from({ length: budget + 1 }, () => null);
  dp[0] = { cost: 0, counts: Array(sortedPackages.length).fill(0) };

  for (let price = 1; price <= budget; price++) {
    for (let index = 0; index < sortedPackages.length; index++) {
      const pkg = sortedPackages[index];
      if (price < pkg.price) {
        continue;
      }

      const previous = dp[price - pkg.price];
      if (!previous) {
        continue;
      }

      const candidate: DpEntry = {
        cost: price,
        counts: [...previous.counts],
      };
      candidate.counts[index]++;

      const existing = dp[price];
      if (!existing) {
        dp[price] = candidate;
        continue;
      }

      const candidateButtons = buildCombinationFromCounts(
        sortedPackages,
        candidate.counts,
        0,
        groupId,
        groupName,
        budget,
      ).totalButtons;
      const existingButtons = buildCombinationFromCounts(
        sortedPackages,
        existing.counts,
        0,
        groupId,
        groupName,
        budget,
      ).totalButtons;

      if (
        candidateButtons > existingButtons ||
        (candidateButtons === existingButtons && price < existing.cost)
      ) {
        dp[price] = candidate;
      }
    }
  }

  const candidates: PackageCombination[] = [];
  const seen = new Set<string>();

  for (let price = 1; price <= budget; price++) {
    const entry = dp[price];
    if (!entry) {
      continue;
    }

    const combination = buildCombinationFromCounts(
      sortedPackages,
      entry.counts,
      0,
      groupId,
      groupName,
      budget,
    );

    const key = combinationKey(combination);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    candidates.push(combination);
  }

  return sortByBudgetPriority(candidates).slice(0, limit);
}

function combinationKey(combination: PackageCombination): string {
  return `${combination.groupId}|${combination.items
    .map((item) => `${item.packageId}:${item.quantity}`)
    .sort()
    .join("|")}`;
}

export function pickTopSkinRecommendations(
  combinations: PackageCombination[],
  limit: number = 3,
): PackageCombination[] {
  const sorted = sortByRequirementPriority(combinations);
  const picked: PackageCombination[] = [];
  const seenKeys = new Set<string>();
  const seenPrices = new Set<number>();

  for (const combination of sorted) {
    if (picked.length >= limit) {
      break;
    }
    const key = combinationKey(combination);
    if (seenKeys.has(key) || seenPrices.has(combination.totalPrice)) {
      continue;
    }
    seenKeys.add(key);
    seenPrices.add(combination.totalPrice);
    picked.push(combination);
  }

  for (const combination of sorted) {
    if (picked.length >= limit) {
      break;
    }
    const key = combinationKey(combination);
    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    picked.push(combination);
  }

  return picked;
}

export function pickTopUniqueCombinations(
  combinations: PackageCombination[],
  limit: number,
  sortFn: (
    combos: PackageCombination[],
  ) => PackageCombination[] = sortByRequirementPriority,
): PackageCombination[] {
  const sorted = sortFn(combinations);
  const picked: PackageCombination[] = [];
  const seenKeys = new Set<string>();

  for (const combination of sorted) {
    if (picked.length >= limit) {
      break;
    }

    const key = combinationKey(combination);
    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    picked.push(combination);
  }

  return picked;
}

export function generateCombinations(
  packages: PackageInput[],
  options: GenerateOptions,
): PackageCombination[] {
  if (packages.length === 0) {
    return [];
  }

  const sortedPackages = [...packages].sort((a, b) => a.buttons - b.buttons);
  const maxPackageButtons = Math.max(...sortedPackages.map((pkg) => pkg.buttons));
  const requiredButtons = options.minButtons ?? 0;
  const maxButtons =
    options.maxButtons ??
    (options.minButtons !== undefined
      ? getMaxButtons(sortedPackages, requiredButtons)
      : options.minTopup !== undefined
        ? getMaxButtonsForTopup(sortedPackages, options.minTopup)
        : FULL_ENUMERATION_MAX_BUTTONS);
  const maxPrice =
    options.maxPrice ??
    (options.minTopup !== undefined
      ? getMaxPriceForTopup(sortedPackages, options.minTopup)
      : Number.MAX_SAFE_INTEGER);
  const includeEmpty = options.includeEmpty ?? false;
  const maxResults = options.maxResults ?? MAX_COMBINATIONS;

  const results: PackageCombination[] = [];
  const seen = new Set<string>();
  let limitReached = false;

  function addCombination(items: PackageLineItem[]) {
    if (limitReached) {
      return;
    }
    const combination = buildCombination(
      items,
      requiredButtons,
      options.groupId,
      options.groupName,
      options.maxPrice,
    );

    if (!includeEmpty && combination.packageCount === 0) {
      return;
    }
    if (combination.totalButtons < requiredButtons) {
      return;
    }
    if (
      options.minTopup !== undefined &&
      getCombinationTopupFromItems(items) < options.minTopup
    ) {
      return;
    }
    if (combination.totalPrice > maxPrice) {
      return;
    }
    if (combination.totalButtons > maxButtons) {
      return;
    }

    const key = combinationKey(combination);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    results.push(combination);

    if (results.length >= maxResults) {
      limitReached = true;
    }
  }

  function dfs(
    packageIndex: number,
    currentItems: PackageLineItem[],
    totalButtons: number,
    totalPrice: number,
  ) {
    if (limitReached) {
      return;
    }
    if (totalButtons >= requiredButtons && totalButtons <= maxButtons && totalPrice <= maxPrice) {
      addCombination(currentItems);
    }

    if (limitReached || packageIndex >= sortedPackages.length) {
      return;
    }

    const pkg = sortedPackages[packageIndex];
    const maxQuantity = Math.min(
      Math.floor((maxButtons - totalButtons) / pkg.buttons),
      Math.floor((maxPrice - totalPrice) / pkg.price),
      requiredButtons > 0
        ? Math.ceil((requiredButtons + maxPackageButtons) / pkg.buttons)
        : options.minTopup !== undefined
          ? Math.ceil(getMaxButtonsForTopup(sortedPackages, options.minTopup) / pkg.buttons)
          : 24,
    );

    for (let quantity = maxQuantity; quantity >= 0; quantity -= 1) {
      const nextItems =
        quantity === 0
          ? currentItems
          : [
              ...currentItems,
              {
                packageId: pkg.id,
                buttons: pkg.buttons,
                price: pkg.price,
                topupAmount: pkg.topupAmount,
                quantity,
                groupId: pkg.groupId,
                groupName: pkg.groupName,
              },
            ];

      const nextButtons = totalButtons + pkg.buttons * quantity;
      const nextPrice = totalPrice + pkg.price * quantity;

      if (nextButtons > maxButtons || nextPrice > maxPrice) {
        continue;
      }

      dfs(packageIndex + 1, nextItems, nextButtons, nextPrice);
    }
  }

  dfs(0, [], 0, 0);

  return results;
}

export function sortByRequirementPriority(
  combinations: PackageCombination[],
): PackageCombination[] {
  return [...combinations].sort(compareRequirementPriority);
}

export function sortByBudgetPriority(
  combinations: PackageCombination[],
): PackageCombination[] {
  return [...combinations].sort((a, b) => {
    if (a.totalButtons !== b.totalButtons) {
      return b.totalButtons - a.totalButtons;
    }
    return a.totalPrice - b.totalPrice;
  });
}

export function sortByClosestBudgetPriority(
  combinations: PackageCombination[],
  budget: number,
): PackageCombination[] {
  return [...combinations].sort((a, b) => {
    const remainingA = budget - a.totalPrice;
    const remainingB = budget - b.totalPrice;
    if (remainingA !== remainingB) {
      return remainingA - remainingB;
    }
    if (a.totalButtons !== b.totalButtons) {
      return b.totalButtons - a.totalButtons;
    }
    const topupA = getCombinationTopupTotal(a);
    const topupB = getCombinationTopupTotal(b);
    if (topupA !== topupB) {
      return topupB - topupA;
    }
    return a.totalPrice - b.totalPrice;
  });
}

export function sortByTopupRequirementPriority(
  combinations: PackageCombination[],
): PackageCombination[] {
  return [...combinations].sort(compareTopupRequirementPriority);
}

export function sortByValuePriority(
  combinations: PackageCombination[],
): PackageCombination[] {
  return [...combinations].sort((a, b) => {
    if (a.valuePerButton !== b.valuePerButton) {
      return a.valuePerButton - b.valuePerButton;
    }
    return a.totalPrice - b.totalPrice;
  });
}

export function formatCombinationLabel(combination: PackageCombination): string {
  return combination.items.map((item) => `${item.buttons} x${item.quantity}`).join(" + ");
}

export const PACKAGE_OPTIMIZER_LIMITS = {
  maxCombinations: MAX_COMBINATIONS,
  requirementCandidateLimit: REQUIREMENT_CANDIDATE_LIMIT,
  fullEnumerationMaxButtons: FULL_ENUMERATION_MAX_BUTTONS,
  fullEnumerationMaxBudget: FULL_ENUMERATION_MAX_BUDGET,
} as const;

export function groupPackagesByGroup(
  packages: PackageInput[],
): Map<string, { groupId: string; groupName: string; packages: PackageInput[] }> {
  const groups = new Map<
    string,
    { groupId: string; groupName: string; packages: PackageInput[] }
  >();

  for (const pkg of packages) {
    const existing = groups.get(pkg.groupId);
    if (existing) {
      existing.packages.push(pkg);
    } else {
      groups.set(pkg.groupId, {
        groupId: pkg.groupId,
        groupName: pkg.groupName,
        packages: [pkg],
      });
    }
  }

  return groups;
}
