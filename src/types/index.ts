import type {
  Banner,
  Category,
  Item,
  ItemType,
  Package,
  PackageGroup,
  Rarity,
  Role,
} from "@prisma/client";

export type {
  Banner,
  Category,
  Item,
  ItemType,
  Package,
  PackageGroup,
  Rarity,
  Role,
};

export type ItemWithCategory = Item & {
  category: Category;
};

export type ActionResult<T = void> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export type CalculatorItem = {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  buttonCost: number;
  sendPrice: number | null;
  topupPrice: number | null;
  preorderPrice: number | null;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
};

export type DashboardStats = {
  totalItems: number;
  totalCategories: number;
  totalPackages: number;
  totalPackageGroups: number;
  charts: DashboardCharts;
};

export type DashboardChartPoint = {
  name: string;
  value: number;
  fill?: string;
};

export type DashboardMonthlyPoint = {
  month: string;
  count: number;
};

export type DashboardCharts = {
  itemsByType: DashboardChartPoint[];
  itemsByCategory: DashboardChartPoint[];
  itemsByRarity: DashboardChartPoint[];
  packagesByGroup: DashboardChartPoint[];
  imageCoverage: DashboardChartPoint[];
  itemsByMonth: DashboardMonthlyPoint[];
};
