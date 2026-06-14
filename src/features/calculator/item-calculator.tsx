"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalculator } from "@/hooks/use-calculator";
import { PaginatedItemGrid } from "@/features/calculator/paginated-item-grid";
import { PriceSummary } from "@/features/calculator/price-summary";
import { ButtonsPackageCalculator } from "@/features/calculator/buttons-package-calculator";
import type { CalculatorItem } from "@/types";
import type { PackageGroupOption, PackageInput } from "@/types/package";

type CategoryOption = {
  id: string;
  name: string;
};

type ItemCalculatorProps = {
  items: CalculatorItem[];
  categories: CategoryOption[];
  packages: PackageInput[];
  packageGroups: PackageGroupOption[];
};

export function ItemCalculator({
  items,
  categories,
  packages,
  packageGroups,
}: ItemCalculatorProps) {
  const {
    search,
    setSearch,
    categoryId,
    setCategoryId,
    filteredItems,
    selectedIds,
    selectedLines,
    toggleItem,
    updateQuantity,
    clearSelection,
    totalButtons,
    totalSendPrice,
  } = useCalculator(items);

  return (
    <div className="space-y-6">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ค้นหาไอเทมตามชื่อ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="กรองตามหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              ไม่พบไอเทม ลองปรับคำค้นหาหรือตัวกรอง
            </div>
          ) : (
            <PaginatedItemGrid
              items={filteredItems}
              selectedIds={selectedIds}
              onToggle={toggleItem}
            />
          )}
        </div>

        <PriceSummary
          lines={selectedLines.map((line) => ({
            id: line.id,
            name: line.name,
            rarity: line.rarity,
            buttonCost: line.buttonCost,
            sendPrice: line.sendPrice,
            imageUrl: line.imageUrl,
            quantity: line.quantity,
          }))}
          totalButtons={totalButtons}
          totalSendPrice={totalSendPrice}
          onUpdateQuantity={updateQuantity}
          onClear={clearSelection}
        />
      </div>

      <ButtonsPackageCalculator
        packages={packages}
        packageGroups={packageGroups}
        totalButtons={totalButtons}
        selectedItems={selectedLines.map((line) => ({
          id: line.id,
          name: line.name,
          buttonCost: line.buttonCost,
          quantity: line.quantity,
        }))}
      />
    </div>
  );
}
