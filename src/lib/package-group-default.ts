import type { PackageGroupOption } from "@/types/package";

export function isCouponPackageGroupName(name: string): boolean {
  return (
    (name.includes("3%") && !name.includes("10%")) || name.includes("10%")
  );
}

export function isPreorderPackageGroupName(name: string): boolean {
  return (
    /pre-?order/i.test(name) ||
    /พรีออเดอร์/.test(name) ||
    /เติมแบบพรี/.test(name)
  );
}

export function isRegularPackageGroupName(name: string): boolean {
  if (isCouponPackageGroupName(name) || isPreorderPackageGroupName(name)) {
    return false;
  }

  return (
    /regular/i.test(name) ||
    /ธรรมดา/.test(name) ||
    /เติมแบบปกติ/.test(name) ||
    (/ปกติ/.test(name) && !/พรี/.test(name))
  );
}

export function findRegularPackageGroupId(
  groups: PackageGroupOption[],
): string | null {
  const regular = groups.find((group) => isRegularPackageGroupName(group.name));
  return regular?.id ?? null;
}

export function findRegularPackageGroupName(
  packages: Array<{ groupName: string }>,
): string | null {
  const groupNames = [...new Set(packages.map((pkg) => pkg.groupName))];
  const regular = groupNames.find((name) => isRegularPackageGroupName(name));

  if (regular) {
    return regular;
  }

  return (
    groupNames.find(
      (name) =>
        !isCouponPackageGroupName(name) && !isPreorderPackageGroupName(name),
    ) ?? null
  );
}

export function findPreorderPackageGroupId(
  groups: PackageGroupOption[],
): string | null {
  const preorder = groups.find((group) =>
    isPreorderPackageGroupName(group.name),
  );
  return preorder?.id ?? null;
}

export function getCalculatorPricingGroups(
  groups: PackageGroupOption[],
): PackageGroupOption[] {
  return groups.filter(
    (group) =>
      isRegularPackageGroupName(group.name) ||
      isPreorderPackageGroupName(group.name),
  );
}

export type CalculatorPricingMode = "regular" | "preorder";

export function resolveCalculatorPricingGroupId(
  groups: PackageGroupOption[],
  mode: CalculatorPricingMode,
): string | null {
  if (mode === "preorder") {
    return findPreorderPackageGroupId(groups);
  }

  return findRegularPackageGroupId(groups);
}
