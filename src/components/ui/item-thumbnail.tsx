import { RemoteImage } from "@/components/ui/remote-image";
import { cn } from "@/lib/utils";

type ItemThumbnailProps = {
  src: string | null | undefined;
  alt: string;
  variant?: "card" | "card-compact" | "summary" | "summary-compact" | "admin";
  className?: string;
};

const VARIANTS = {
  card: {
    slot: "h-full w-full",
    sizes: "(max-width: 640px) 144px, (max-width: 1024px) 160px, 176px",
  },
  "card-compact": {
    slot: "relative aspect-square w-[5rem] sm:w-[5.5rem] lg:w-[6rem]",
    sizes: "(max-width: 640px) 80px, (max-width: 1024px) 88px, 96px",
  },
  summary: {
    slot: "h-28 w-24",
    scale: "scale-[1.35]",
    sizes: "140px",
  },
  "summary-compact": {
    slot: "relative aspect-square h-20 w-20",
    sizes: "80px",
  },
  admin: {
    slot: "h-16 w-14 sm:h-[4.5rem] sm:w-20",
    scale: "scale-[1.25]",
    sizes: "80px",
  },
} as const;

export function ItemThumbnail({
  src,
  alt,
  variant = "card",
  className,
}: ItemThumbnailProps) {
  const config = VARIANTS[variant];
  const scale = "scale" in config ? config.scale : undefined;

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden", config.slot, className)}
    >
      {src ? (
        scale ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 origin-center",
              scale,
            )}
          >
            <RemoteImage src={src} alt={alt} contain fill sizes={config.sizes} />
          </div>
        ) : (
          <RemoteImage src={src} alt={alt} contain fill sizes={config.sizes} />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/40 text-[10px] text-muted-foreground sm:text-xs">
          ไม่มีรูป
        </div>
      )}
    </div>
  );
}
