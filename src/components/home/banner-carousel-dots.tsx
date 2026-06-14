import { cn } from "@/lib/utils";

type BannerCarouselDotsProps = {
  slides: Array<{ id: string; alt: string }>;
  activeIndex: number;
  onSelect: (index: number) => void;
  overlay?: boolean;
  className?: string;
};

export function BannerCarouselDots({
  slides,
  activeIndex,
  onSelect,
  overlay = false,
  className,
}: BannerCarouselDotsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5",
        overlay
          ? "absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/45 via-black/20 to-transparent px-4 pb-3 pt-8"
          : "mt-3",
        className,
      )}
    >
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          type="button"
          aria-label={`ไปสไลด์ ${index + 1}: ${slide.alt}`}
          aria-current={index === activeIndex ? "true" : undefined}
          onClick={() => onSelect(index)}
          className={cn(
            "rounded-full transition-all",
            overlay
              ? index === activeIndex
                ? "h-2 w-6 bg-white"
                : "h-2 w-2 bg-white/45 hover:bg-white/70"
              : index === activeIndex
                ? "h-2 w-6 bg-primary"
                : "h-2 w-2 bg-foreground/20 hover:bg-foreground/35",
          )}
        />
      ))}
    </div>
  );
}
