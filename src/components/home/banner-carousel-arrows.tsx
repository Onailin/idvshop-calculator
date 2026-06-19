import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BannerCarouselArrowsProps = {
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

export function BannerCarouselArrows({
  onPrevious,
  onNext,
  className,
}: BannerCarouselArrowsProps) {
  const buttonClass = cn(
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/85 text-foreground shadow-md backdrop-blur-sm transition",
    "hover:bg-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "sm:h-10 sm:w-10",
  );

  return (
    <>
      <button
        type="button"
        aria-label="สไลด์ก่อนหน้า"
        onClick={onPrevious}
        className={cn(
          "absolute left-2 top-1/2 z-20 -translate-y-1/2 sm:left-3",
          buttonClass,
          className,
        )}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="สไลด์ถัดไป"
        onClick={onNext}
        className={cn(
          "absolute right-2 top-1/2 z-20 -translate-y-1/2 sm:right-3",
          buttonClass,
          className,
        )}
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </>
  );
}
