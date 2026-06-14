"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ItemCard } from "@/features/calculator/item-card";
import { Button } from "@/components/ui/button";
import { chunkItems } from "@/lib/item-sort";
import type { CalculatorItem } from "@/types";

const ITEMS_PER_PAGE = 6;

type PaginatedItemGridProps = {
  items: CalculatorItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function PaginatedItemGrid({
  items,
  selectedIds,
  onToggle,
}: PaginatedItemGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [mounted, setMounted] = useState(false);

  const pages = useMemo(
    () => chunkItems(items, ITEMS_PER_PAGE),
    [items],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
    setActivePage(0);
    setMounted(true);
  }, []);

  useEffect(() => {
    setActivePage(0);
    scrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [items]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || pages.length <= 1) {
      return;
    }

    function handleScroll() {
      if (!container) {
        return;
      }

      const width = container.clientWidth;
      if (width <= 0) {
        return;
      }

      const nextPage = Math.round(container.scrollLeft / width);
      setActivePage(Math.min(nextPage, pages.length - 1));
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [pages.length]);

  function scrollToPage(pageIndex: number) {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const clamped = Math.max(0, Math.min(pageIndex, pages.length - 1));
    container.scrollTo({
      left: clamped * container.clientWidth,
      behavior: "smooth",
    });
    setActivePage(clamped);
  }

  if (pages.length === 0) {
    return null;
  }

  const hasMultiplePages = pages.length > 1;

  return (
    <div className="min-w-0 w-full overflow-hidden rounded-xl border bg-card">
      <div
        ref={scrollRef}
        className="flex w-full min-w-0 snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((pageItems, pageIndex) => (
          <div
            key={pageIndex}
            className="box-border grid w-full min-w-full max-w-full shrink-0 snap-start grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 2xl:gap-4"
          >
            {pageItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        ))}
      </div>

      {hasMultiplePages && (
        <div className="space-y-3 px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-center gap-1.5">
            {pages.map((_, pageIndex) => (
              <button
                key={pageIndex}
                type="button"
                aria-label={`ไปหน้า ${pageIndex + 1}`}
                aria-current={pageIndex === activePage ? "page" : undefined}
                onClick={() => scrollToPage(pageIndex)}
                className={`rounded-full transition-all ${
                  pageIndex === activePage
                    ? "h-2 w-6 bg-primary"
                    : "h-2 w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            หน้า {activePage + 1} จาก {pages.length}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {mounted ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full min-w-0 px-2"
                  onClick={() => scrollToPage(activePage - 1)}
                  disabled={activePage === 0}
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span className="truncate">ก่อนหน้า</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  className="w-full min-w-0 px-2"
                  onClick={() => scrollToPage(activePage + 1)}
                  disabled={activePage >= pages.length - 1}
                >
                  <span className="truncate">ถัดไป</span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </Button>
              </>
            ) : (
              <>
                <div className="h-9 rounded-md border bg-muted/40" aria-hidden />
                <div className="h-9 rounded-md bg-muted/40" aria-hidden />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
