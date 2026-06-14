import { Cat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ItemLoadProgress } from "@/lib/wait-for-item-images";

type PageLoadingOverlayProps = {
  progress: number;
  loadInfo?: Pick<ItemLoadProgress, "loaded" | "total" | "phase">;
  className?: string;
};

export function PageLoadingOverlay({
  progress,
  loadInfo,
  className,
}: PageLoadingOverlayProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  const detail =
    loadInfo?.phase === "images" && loadInfo.total > 0
      ? `โหลดรูป ${loadInfo.loaded}/${loadInfo.total}`
      : loadInfo?.phase === "page"
        ? "กำลังเตรียมหน้า..."
        : "รอแปปน้าา";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col bg-background/60 backdrop-blur-[2px]",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={`กำลังโหลดหน้า ${clamped} เปอร์เซ็นต์`}
      data-load-ignore
    >
      <div className="h-1.5 overflow-hidden bg-brand-blush/50" data-load-ignore>
        <div
          className="h-full bg-gradient-to-r from-brand-rose via-primary to-brand-blush transition-[width] duration-150 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <div
          className="w-full max-w-sm rounded-3xl border border-brand-blush/70 bg-white/92 px-6 py-7 shadow-xl shadow-brand-rose/15 sm:px-8"
          data-load-ignore
        >
          <div className="relative mx-auto mb-6 mt-2 h-3 w-full max-w-[240px] rounded-full bg-brand-blush/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-rose via-primary to-brand-blush transition-[width] duration-150 ease-out"
              style={{ width: `${clamped}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 text-primary transition-[left] duration-150 ease-out"
              style={{ left: `calc(${clamped}% - 14px)` }}
            >
              <Cat className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
          </div>

          <div className="text-center">
            <p className="text-base font-semibold text-foreground sm:text-lg">
              กำลังโหลดหน้า
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            <p className="mt-3 text-xs font-medium tabular-nums text-primary">
              {clamped}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
