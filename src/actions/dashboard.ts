"use server";

import type { ItemType, Rarity } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatItemType } from "@/lib/item-type";
import { formatRarity, RARITIES } from "@/lib/rarity";
import {
  CHART_PALETTE,
  IMAGE_COVERAGE_COLORS,
  ITEM_TYPE_CHART_COLORS,
  RARITY_CHART_COLORS,
} from "@/lib/dashboard-chart-colors";
import type {
  DashboardChartPoint,
  DashboardCharts,
  DashboardMonthlyPoint,
  DashboardStats,
} from "@/types";

const MONTHS_TO_SHOW = 6;

function buildMonthBuckets(): { key: string; label: string }[] {
  const buckets: { key: string; label: string }[] = [];
  const now = new Date();

  for (let offset = MONTHS_TO_SHOW - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("th-TH", {
      month: "short",
      year: "2-digit",
    });
    buckets.push({ key, label });
  }

  return buckets;
}

function mapWithPalette(
  entries: { name: string; value: number }[],
): DashboardChartPoint[] {
  return entries.map((entry, index) => ({
    ...entry,
    fill: CHART_PALETTE[index % CHART_PALETTE.length],
  }));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const monthBuckets = buildMonthBuckets();
  const monthStart = new Date();
  monthStart.setMonth(monthStart.getMonth() - (MONTHS_TO_SHOW - 1));
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    totalItems,
    totalCategories,
    totalPackages,
    totalPackageGroups,
    itemsByTypeRaw,
    itemsByCategoryRaw,
    itemsByRarityRaw,
    packagesByGroupRaw,
    itemsWithImage,
    recentItems,
    categories,
    packageGroups,
  ] = await Promise.all([
    prisma.item.count(),
    prisma.category.count(),
    prisma.package.count(),
    prisma.packageGroup.count(),
    prisma.item.groupBy({
      by: ["type"],
      _count: { id: true },
    }),
    prisma.item.groupBy({
      by: ["categoryId"],
      _count: { id: true },
    }),
    prisma.item.groupBy({
      by: ["rarity"],
      _count: { id: true },
    }),
    prisma.package.groupBy({
      by: ["packageGroupId"],
      _count: { id: true },
    }),
    prisma.item.count({
      where: {
        AND: [{ imageUrl: { not: null } }, { NOT: { imageUrl: "" } }],
      },
    }),
    prisma.item.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { createdAt: true },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
    }),
    prisma.packageGroup.findMany({
      select: { id: true, name: true },
    }),
  ]);

  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  const groupNameById = new Map(
    packageGroups.map((group) => [group.id, group.name]),
  );

  const itemsByType: DashboardChartPoint[] = itemsByTypeRaw
    .map((row) => ({
      name: formatItemType(row.type as ItemType),
      value: row._count.id,
      fill: ITEM_TYPE_CHART_COLORS[row.type as ItemType],
    }))
    .sort((a, b) => b.value - a.value);

  const itemsByCategory = mapWithPalette(
    itemsByCategoryRaw
      .map((row) => ({
        name: categoryNameById.get(row.categoryId) ?? "ไม่ทราบหมวด",
        value: row._count.id,
      }))
      .sort((a, b) => b.value - a.value),
  );

  const rarityCountByKey = new Map(
    itemsByRarityRaw.map((row) => [row.rarity as Rarity, row._count.id]),
  );
  const itemsByRarity: DashboardChartPoint[] = RARITIES.map((rarity) => ({
    name: formatRarity(rarity),
    value: rarityCountByKey.get(rarity) ?? 0,
    fill: RARITY_CHART_COLORS[rarity],
  })).filter((point) => point.value > 0);

  const packagesByGroup = mapWithPalette(
    packagesByGroupRaw
      .map((row) => ({
        name: groupNameById.get(row.packageGroupId) ?? "ไม่ทราบกลุ่ม",
        value: row._count.id,
      }))
      .sort((a, b) => b.value - a.value),
  );

  const itemsWithoutImage = Math.max(0, totalItems - itemsWithImage);
  const imageCoverage: DashboardChartPoint[] = [
    {
      name: "มีรูป",
      value: itemsWithImage,
      fill: IMAGE_COVERAGE_COLORS.withImage,
    },
    {
      name: "ไม่มีรูป",
      value: itemsWithoutImage,
      fill: IMAGE_COVERAGE_COLORS.withoutImage,
    },
  ].filter((point) => point.value > 0);

  const monthCountMap = new Map<string, number>();
  for (const bucket of monthBuckets) {
    monthCountMap.set(bucket.key, 0);
  }
  for (const item of recentItems) {
    const key = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (monthCountMap.has(key)) {
      monthCountMap.set(key, (monthCountMap.get(key) ?? 0) + 1);
    }
  }
  const itemsByMonth: DashboardMonthlyPoint[] = monthBuckets.map((bucket) => ({
    month: bucket.label,
    count: monthCountMap.get(bucket.key) ?? 0,
  }));

  const charts: DashboardCharts = {
    itemsByType,
    itemsByCategory,
    itemsByRarity,
    packagesByGroup,
    imageCoverage,
    itemsByMonth,
  };

  return {
    totalItems,
    totalCategories,
    totalPackages,
    totalPackageGroups,
    charts,
  };
}
