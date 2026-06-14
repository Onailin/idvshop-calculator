"use client";

import { useMemo, useState } from "react";
import { getItemCalculationPrice } from "@/lib/item-pricing";
import { sortCalculatorItems } from "@/lib/item-sort";
import type { CalculatorItem } from "@/types";

export type SelectedItemLine = CalculatorItem & { quantity: number };

export function useCalculator(items: CalculatorItem[]) {
  const [quantities, setQuantities] = useState<Map<string, number>>(new Map());
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch =
        !query || item.name.toLowerCase().includes(query);
      const matchesCategory =
        categoryId === "all" || item.categoryId === categoryId;
      return matchesSearch && matchesCategory;
    });

    return sortCalculatorItems(filtered);
  }, [items, search, categoryId]);

  const selectedIds = useMemo(
    () => new Set(quantities.keys()),
    [quantities],
  );

  const selectedLines = useMemo(() => {
    const lines: SelectedItemLine[] = [];

    for (const [id, quantity] of quantities) {
      if (quantity <= 0) {
        continue;
      }

      const item = items.find((entry) => entry.id === id);
      if (item) {
        lines.push({ ...item, quantity });
      }
    }

    return lines;
  }, [items, quantities]);

  const totalButtons = useMemo(
    () =>
      selectedLines.reduce(
        (sum, line) => sum + line.buttonCost * line.quantity,
        0,
      ),
    [selectedLines],
  );

  const totalSendPrice = useMemo(
    () =>
      selectedLines.reduce(
        (sum, line) =>
          sum + (getItemCalculationPrice(line) ?? 0) * line.quantity,
        0,
      ),
    [selectedLines],
  );

  const totalQuantity = useMemo(
    () => selectedLines.reduce((sum, line) => sum + line.quantity, 0),
    [selectedLines],
  );

  function toggleItem(id: string) {
    setQuantities((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, 1);
      }
      return next;
    });
  }

  function updateQuantity(id: string, quantity: number) {
    setQuantities((prev) => {
      const next = new Map(prev);
      if (quantity <= 0) {
        next.delete(id);
      } else {
        next.set(id, quantity);
      }
      return next;
    });
  }

  function clearSelection() {
    setQuantities(new Map());
  }

  return {
    search,
    setSearch,
    categoryId,
    setCategoryId,
    filteredItems,
    selectedLines,
    selectedIds,
    toggleItem,
    updateQuantity,
    clearSelection,
    totalButtons,
    totalSendPrice,
    totalQuantity,
  };
}
