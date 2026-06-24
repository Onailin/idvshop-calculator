import type { PackageInput } from "@/types/package";
import {
  calculateOptimalCouponAllocation,
  getCouponAllocationValidationError,
} from "@/services/discountCalculator";
import type { GlobalCouponInventory, SelectedPackageEntry } from "@/types/discount";

export type OrderLineSnapshot = {
  packageId: string | null;
  packageGroupName: string;
  buttons: number;
  topupAmount: number | null;
  price: number;
  quantity: number;
  lineTotal: number;
  couponLabel: string | null;
};

export type BuiltOrderSnapshot = {
  totalButtons: number;
  totalPrice: number;
  lines: OrderLineSnapshot[];
};

type DbPackage = {
  id: string;
  buttons: number;
  topupAmount: number | null;
  price: number;
  packageGroupId: string;
  packageGroup: { name: string; isActive: boolean };
};

export function dbPackageToInput(pkg: DbPackage): PackageInput {
  return {
    id: pkg.id,
    buttons: pkg.buttons,
    topupAmount: pkg.topupAmount,
    price: pkg.price,
    groupId: pkg.packageGroupId,
    groupName: pkg.packageGroup.name,
  };
}

export function buildCombinationOrderSnapshot(
  groupId: string,
  items: Array<{ packageId: string; quantity: number }>,
  packages: DbPackage[],
): BuiltOrderSnapshot | { error: string } {
  const packageById = new Map(packages.map((pkg) => [pkg.id, pkg]));
  const lines: OrderLineSnapshot[] = [];

  for (const item of items) {
    const pkg = packageById.get(item.packageId);
    if (!pkg) {
      return { error: "ไม่พบแพ็กเกจในระบบ" };
    }
    if (pkg.packageGroupId !== groupId) {
      return { error: "แพ็กเกจไม่ตรงกับกลุ่มที่เลือก" };
    }
    if (!pkg.packageGroup.isActive) {
      return { error: "กลุ่มแพ็กเกจนี้ปิดใช้งานอยู่" };
    }

    lines.push({
      packageId: pkg.id,
      packageGroupName: pkg.packageGroup.name,
      buttons: pkg.buttons,
      topupAmount: pkg.topupAmount,
      price: pkg.price,
      quantity: item.quantity,
      lineTotal: pkg.price * item.quantity,
      couponLabel: null,
    });
  }

  const totalButtons = lines.reduce(
    (sum, line) => sum + line.buttons * line.quantity,
    0,
  );
  const totalPrice = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return { totalButtons, totalPrice, lines };
}

export function buildCouponOrderSnapshot(
  selections: SelectedPackageEntry[],
  inventory: GlobalCouponInventory,
  packages: DbPackage[],
): BuiltOrderSnapshot | { error: string } {
  const packageInputs = packages.map(dbPackageToInput);
  const validationError = getCouponAllocationValidationError(
    selections,
    inventory,
    packageInputs,
  );

  if (validationError === "NO_COUPONS") {
    return { error: "มีแพ็กที่ต้องใช้คูปอง — ไม่สามารถสร้างออเดอร์ได้" };
  }
  if (validationError === "INSUFFICIENT_COUPONS") {
    return { error: "คูปองไม่เพียงพอสำหรับแพ็กที่เลือก" };
  }

  const allocation = calculateOptimalCouponAllocation(
    selections,
    inventory,
    packageInputs,
  );

  if (!allocation || allocation.lines.length === 0) {
    return { error: "ไม่สามารถคำนวณออเดอร์ได้" };
  }

  const packageById = new Map(packages.map((pkg) => [pkg.id, pkg]));
  const lineMap = new Map<string, OrderLineSnapshot>();

  for (const line of allocation.lines) {
    const pkg = packageById.get(line.packageId);
    if (!pkg) {
      return { error: "ไม่พบแพ็กเกจในระบบ" };
    }

    const key = `${line.packageId}:${line.coupon ?? "regular"}:${line.price}`;
    const existing = lineMap.get(key);

    if (existing) {
      existing.quantity += 1;
      existing.lineTotal += line.price;
    } else {
      lineMap.set(key, {
        packageId: line.packageId,
        packageGroupName: pkg.packageGroup.name,
        buttons: line.buttons,
        topupAmount: line.topupAmount,
        price: line.price,
        quantity: 1,
        lineTotal: line.price,
        couponLabel: line.coupon,
      });
    }
  }

  const lines = Array.from(lineMap.values());

  return {
    totalButtons: allocation.totalButtons,
    totalPrice: allocation.discountedTotal,
    lines,
  };
}