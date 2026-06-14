export type GlobalCouponInventory = {
  discount10: number;
  discount3: number;
};

export type SelectedPackageEntry = {
  packageId: string;
  quantity: number;
};

export type CouponType = "10%" | "3%" | null;

export type PackageTierPrices = {
  regular: number;
  discount3: number | null;
  discount10: number | null;
};

export type CouponAllocationLine = {
  packageId: string;
  buttons: number;
  /** null = แพ็กราคาปกติ (เช่น 335, 759) */
  coupon: CouponType;
  referencePrice: number;
  price: number;
  topupAmount: number | null;
};

export type CouponAllocationValidationError = "NO_COUPONS" | "INSUFFICIENT_COUPONS";

export type CouponAllocationResult = {
  /** เฉพาะแพ็กที่คำนวณราคาได้ */
  lines: CouponAllocationLine[];
  totalButtons: number;
  totalTopup: number;
  referenceTotal: number;
  discountedTotal: number;
  totalSavings: number;
  couponUsage: {
    discount10Used: number;
    discount3Used: number;
  };
};

// Legacy types kept for compatibility
export type CouponInventoryEntry = {
  discount3: number;
  discount10: number;
};

export type CouponInventory = Record<number, CouponInventoryEntry>;

export type DiscountPackageLine = {
  buttons: number;
  quantity: number;
};

export type CouponUsageEntry = {
  buttons: number;
  discount3Used: number;
  discount10Used: number;
};

export type DiscountCalculatorResult = {
  packages: DiscountPackageLine[];
  totalButtons: number;
  couponUsage: CouponUsageEntry[];
  couponsUsed: number;
  couponsRemaining: number;
  originalPrice: number;
  finalPrice: number;
  moneySaved: number;
};
