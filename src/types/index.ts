import type {
  Banner,
  Category,
  Item,
  ItemType,
  Package,
  PackageGroup,
  Rarity,
  Role,
  SitePopup,
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
  SitePopup,
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
  totalCompletedRevenue: number;
  completedOrderCount: number;
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

export type DashboardSalesMonthlyPoint = {
  month: string;
  revenue: number;
  orderCount: number;
};

export type DashboardCharts = {
  salesByMonth: DashboardSalesMonthlyPoint[];
  topSoldItems: DashboardChartPoint[];
  topSoldPackages: DashboardChartPoint[];
  itemsByType: DashboardChartPoint[];
  itemsByCategory: DashboardChartPoint[];
  itemsByRarity: DashboardChartPoint[];
  packagesByGroup: DashboardChartPoint[];
  imageCoverage: DashboardChartPoint[];
  itemsByMonth: DashboardMonthlyPoint[];
};
