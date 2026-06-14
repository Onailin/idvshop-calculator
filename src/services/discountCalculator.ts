import type {
  CouponAllocationLine,
  CouponAllocationResult,
  CouponAllocationValidationError,
  CouponType,
  GlobalCouponInventory,
  PackageTierPrices,
  SelectedPackageEntry,
} from "@/types/discount";
import type { PackageInput } from "@/types/package";

type DiscountGroupNames = {
  regular: string;
  discount3: string;
  discount10: string;
};

/** แพ็กที่ใช้ราคาปกติจากฐานข้อมูลเมื่อไม่ใช้คูปอง (335, 759) */
export const OPTIONAL_COUPON_BUTTONS = new Set([335, 759]);

type PackageInstance = {
  id: string;
  packageId: string;
  buttons: number;
  regularPrice: number;
  hasCouponTiers: boolean;
  requiresCoupon: boolean;
  baselinePrice: number;
  discount3Price: number | null;
  discount10Price: number | null;
  topupAmount: number | null;
};

export function hasCouponTierPrices(tierPrices: PackageTierPrices): boolean {
  return tierPrices.discount3 !== null || tierPrices.discount10 !== null;
}

export function canUseRegularWithoutCoupon(buttons: number): boolean {
  return OPTIONAL_COUPON_BUTTONS.has(buttons);
}

export function packageRequiresCoupon(
  buttons: number,
  tierPrices: PackageTierPrices,
): boolean {
  return hasCouponTierPrices(tierPrices) && !canUseRegularWithoutCoupon(buttons);
}

export function countRequiredCouponPackages(
  selections: SelectedPackageEntry[],
  packages: PackageInput[],
): number {
  return expandSelections(selections, packages).filter(
    (instance) => instance.requiresCoupon,
  ).length;
}

export function selectionRequiresCoupons(
  selections: SelectedPackageEntry[],
  packages: PackageInput[],
): boolean {
  return countRequiredCouponPackages(selections, packages) > 0;
}

export function getCouponAllocationValidationError(
  selections: SelectedPackageEntry[],
  inventory: GlobalCouponInventory,
  packages: PackageInput[],
): CouponAllocationValidationError | null {
  const requiredCouponCount = countRequiredCouponPackages(selections, packages);
  if (requiredCouponCount === 0) {
    return null;
  }

  const totalCoupons = inventory.discount10 + inventory.discount3;
  if (totalCoupons === 0) {
    return "NO_COUPONS";
  }

  if (totalCoupons < requiredCouponCount) {
    return "INSUFFICIENT_COUPONS";
  }

  return null;
}

type CouponChoice = {
  coupon: Exclude<CouponType, null>;
  price: number;
  savings: number;
};

type CouponAssignment = {
  coupon: Exclude<CouponType, null>;
  price: number;
  referencePrice: number;
  savings: number;
};

function isPreorderGroupName(name: string): boolean {
  return /pre-?order/i.test(name) || /พรีออเดอร์/i.test(name);
}

function isDiscount10GroupName(name: string): boolean {
  return name.includes("10%");
}

function isDiscount3GroupName(name: string): boolean {
  return name.includes("3%") && !name.includes("10%");
}

function isRegularGroupName(name: string): boolean {
  return /regular/i.test(name) || /ธรรมดา/.test(name);
}

export function discoverDiscountGroups(
  packages: PackageInput[],
): DiscountGroupNames | null {
  const groupNames = [...new Set(packages.map((pkg) => pkg.groupName))];
  const discount10 = groupNames.find(isDiscount10GroupName);
  const discount3 = groupNames.find(isDiscount3GroupName);
  const preorder = groupNames.find(isPreorderGroupName);

  const regular =
    groupNames.find(isRegularGroupName) ??
    groupNames.find(
      (name) =>
        name !== discount3 &&
        name !== discount10 &&
        name !== preorder &&
        !isDiscount3GroupName(name) &&
        !isDiscount10GroupName(name) &&
        !isPreorderGroupName(name),
    );

  if (!regular) {
    return null;
  }

  return {
    regular,
    discount3: discount3 ?? regular,
    discount10: discount10 ?? regular,
  };
}

function getTopupValue(pkg: PackageInput): number {
  return pkg.topupAmount ?? pkg.buttons;
}

function findTierPackage(
  packages: PackageInput[],
  groupName: string,
  reference: PackageInput,
): PackageInput | undefined {
  const inGroup = packages.filter((pkg) => pkg.groupName === groupName);
  const referenceTopup = getTopupValue(reference);

  const byTopup = inGroup.find((pkg) => getTopupValue(pkg) === referenceTopup);
  if (byTopup) {
    return byTopup;
  }

  return inGroup.find((pkg) => pkg.buttons === reference.buttons);
}

function getBaselinePrice(
  tierPrices: PackageTierPrices,
  instance: Pick<PackageInstance, "discount3Price" | "discount10Price">,
): number {
  const tierPricesOnly = [instance.discount3Price, instance.discount10Price].filter(
    (price): price is number => price !== null,
  );

  if (tierPricesOnly.length === 0) {
    return tierPrices.regular;
  }

  return Math.max(tierPrices.regular, ...tierPricesOnly);
}

function getCouponChoices(instance: PackageInstance): CouponChoice[] {
  const choices: CouponChoice[] = [];

  if (instance.discount10Price !== null) {
    choices.push({
      coupon: "10%",
      price: instance.discount10Price,
      savings: instance.baselinePrice - instance.discount10Price,
    });
  }

  if (instance.discount3Price !== null) {
    choices.push({
      coupon: "3%",
      price: instance.discount3Price,
      savings: instance.baselinePrice - instance.discount3Price,
    });
  }

  return choices;
}

export function getPackageTierPrices(
  packages: PackageInput[],
  regularPackage: PackageInput,
): PackageTierPrices {
  const groups = discoverDiscountGroups(packages);
  if (!groups) {
    return {
      regular: regularPackage.price,
      discount3: null,
      discount10: null,
    };
  }

  const discount3Package = findTierPackage(
    packages,
    groups.discount3,
    regularPackage,
  );
  const discount10Package = findTierPackage(
    packages,
    groups.discount10,
    regularPackage,
  );

  return {
    regular: regularPackage.price,
    discount3: discount3Package?.price ?? null,
    discount10: discount10Package?.price ?? null,
  };
}

function expandSelections(
  selections: SelectedPackageEntry[],
  packages: PackageInput[],
): PackageInstance[] {
  const instances: PackageInstance[] = [];

  for (const selection of selections) {
    const pkg = packages.find((entry) => entry.id === selection.packageId);
    if (!pkg || selection.quantity <= 0) {
      continue;
    }

    const tierPrices = getPackageTierPrices(packages, pkg);

    for (let index = 0; index < selection.quantity; index++) {
      const discount3Price = tierPrices.discount3;
      const discount10Price = tierPrices.discount10;

      instances.push({
        id: `${pkg.id}-${instances.length}`,
        packageId: pkg.id,
        buttons: pkg.buttons,
        regularPrice: tierPrices.regular,
        hasCouponTiers: hasCouponTierPrices(tierPrices),
        requiresCoupon: packageRequiresCoupon(pkg.buttons, tierPrices),
        discount3Price,
        discount10Price,
        baselinePrice: getBaselinePrice(tierPrices, {
          discount3Price,
          discount10Price,
        }),
        topupAmount: pkg.topupAmount,
      });
    }
  }

  return instances;
}

function cloneInventory(
  inventory: GlobalCouponInventory,
): GlobalCouponInventory {
  return {
    discount10: inventory.discount10,
    discount3: inventory.discount3,
  };
}

function consumeCoupon(
  inventory: GlobalCouponInventory,
  coupon: Exclude<CouponType, null>,
): GlobalCouponInventory {
  return {
    discount10:
      coupon === "10%" ? inventory.discount10 - 1 : inventory.discount10,
    discount3:
      coupon === "3%" ? inventory.discount3 - 1 : inventory.discount3,
  };
}

function canUseCoupon(
  inventory: GlobalCouponInventory,
  coupon: Exclude<CouponType, null>,
): boolean {
  return coupon === "10%"
    ? inventory.discount10 > 0
    : inventory.discount3 > 0;
}

function satisfiesRequiredAssignments(
  current: Map<string, CouponAssignment>,
  requiredInstanceIds?: Set<string>,
): boolean {
  if (!requiredInstanceIds || requiredInstanceIds.size === 0) {
    return true;
  }

  return [...requiredInstanceIds].every((id) => current.has(id));
}

function findBestCouponAssignment(
  instances: PackageInstance[],
  inventory: GlobalCouponInventory,
  options?: { requiredInstanceIds?: Set<string> },
): Map<string, CouponAssignment> | null {
  let best: Map<string, CouponAssignment> | null = null;
  let bestSavings = -1;
  let bestAssignedCount = 0;

  function search(
    index: number,
    remaining: GlobalCouponInventory,
    current: Map<string, CouponAssignment>,
  ) {
    if (index >= instances.length) {
      if (!satisfiesRequiredAssignments(current, options?.requiredInstanceIds)) {
        return;
      }

      const assignedCount = current.size;
      const totalSavings = [...current.values()].reduce(
        (sum, entry) => sum + entry.savings,
        0,
      );

      if (
        totalSavings > bestSavings ||
        (totalSavings === bestSavings && assignedCount > bestAssignedCount)
      ) {
        bestSavings = totalSavings;
        bestAssignedCount = assignedCount;
        best = new Map(current);
      }
      return;
    }

    const instance = instances[index];
    const choices = getCouponChoices(instance);

    search(index + 1, remaining, current);

    for (const choice of choices) {
      if (!canUseCoupon(remaining, choice.coupon)) {
        continue;
      }

      current.set(instance.id, {
        coupon: choice.coupon,
        price: choice.price,
        referencePrice: instance.baselinePrice,
        savings: choice.savings,
      });

      search(index + 1, consumeCoupon(remaining, choice.coupon), current);
      current.delete(instance.id);
    }
  }

  search(0, cloneInventory(inventory), new Map());

  if (best === null) {
    return null;
  }

  if (!satisfiesRequiredAssignments(best, options?.requiredInstanceIds)) {
    return null;
  }

  return best;
}

export function getRegularPackagesForSelection(
  packages: PackageInput[],
): PackageInput[] {
  const groups = discoverDiscountGroups(packages);
  if (!groups) {
    return [];
  }

  return packages
    .filter((pkg) => pkg.groupName === groups.regular)
    .filter((pkg) => {
      const tierPrices = getPackageTierPrices(packages, pkg);
      return tierPrices.discount3 !== null || tierPrices.discount10 !== null;
    })
    .sort((a, b) => b.buttons - a.buttons);
}

export function calculateOptimalCouponAllocation(
  selections: SelectedPackageEntry[],
  inventory: GlobalCouponInventory,
  packages: PackageInput[],
): CouponAllocationResult | null {
  const groups = discoverDiscountGroups(packages);
  if (!groups) {
    return null;
  }

  const instances = expandSelections(selections, packages);
  if (instances.length === 0) {
    return null;
  }

  if (getCouponAllocationValidationError(selections, inventory, packages)) {
    return null;
  }

  const couponInstances = instances.filter((instance) => instance.hasCouponTiers);
  const requiredCouponInstances = instances.filter(
    (instance) => instance.requiresCoupon,
  );
  let assignment = new Map<string, CouponAssignment>();

  if (couponInstances.length > 0) {
    const optimal = findBestCouponAssignment(couponInstances, inventory, {
      requiredInstanceIds: new Set(
        requiredCouponInstances.map((instance) => instance.id),
      ),
    });
    if (!optimal) {
      return null;
    }
    assignment = optimal;
  }

  const lines: CouponAllocationLine[] = [];

  for (const instance of instances) {
    const assigned = assignment.get(instance.id);

    if (assigned) {
      lines.push({
        packageId: instance.packageId,
        buttons: instance.buttons,
        coupon: assigned.coupon,
        referencePrice: assigned.referencePrice,
        price: assigned.price,
        topupAmount: instance.topupAmount,
      });
      continue;
    }

    if (instance.requiresCoupon) {
      continue;
    }

    lines.push({
      packageId: instance.packageId,
      buttons: instance.buttons,
      coupon: null,
      referencePrice: instance.regularPrice,
      price: instance.regularPrice,
      topupAmount: instance.topupAmount,
    });
  }

  if (lines.length === 0) {
    return null;
  }

  let discount10Used = 0;
  let discount3Used = 0;

  for (const line of lines) {
    if (line.coupon === "10%") {
      discount10Used++;
    } else if (line.coupon === "3%") {
      discount3Used++;
    }
  }

  const referenceTotal = lines.reduce(
    (sum, line) => sum + line.referencePrice,
    0,
  );
  const discountedTotal = lines.reduce((sum, line) => sum + line.price, 0);
  const totalButtons = lines.reduce((sum, line) => sum + line.buttons, 0);
  const totalTopup = lines.reduce(
    (sum, line) => sum + (line.topupAmount ?? line.buttons),
    0,
  );

  return {
    lines,
    totalButtons,
    totalTopup,
    referenceTotal,
    discountedTotal,
    totalSavings: referenceTotal - discountedTotal,
    couponUsage: {
      discount10Used,
      discount3Used,
    },
  };
}
