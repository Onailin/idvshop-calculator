import {
  getSitePopupHeadlineStyle,
  resolveSitePopupHeadlineStyle,
} from "@/lib/site-popup-headline";
import { cn } from "@/lib/utils";

type SitePopupHeadlineProps = {
  headline: string | null;
  headlineIcon?: string | null;
  headlineStyle?: string | null;
  headlineId?: string;
  className?: string;
  variant?: "default" | "overlay";
};

export function SitePopupHeadline({
  headline,
  headlineStyle,
  headlineId,
  className,
  variant = "default",
}: SitePopupHeadlineProps) {
  const styleKey = resolveSitePopupHeadlineStyle(headlineStyle);
  const style = getSitePopupHeadlineStyle(styleKey);
  const title = headline?.trim() || "ยินดีต้อนรับ";
  const useCuteOutline = styleKey === "rose" && variant === "default";
  const isOverlay = variant === "overlay";

  return (
    <div className={cn(className)}>
      {isOverlay && (
        <div
          aria-hidden
          className={cn(
            "mb-2.5 h-1 w-12 rounded-full bg-gradient-to-r shadow-[0_0_12px_rgba(255,255,255,0.35)]",
            style.overlayRibbon,
          )}
        />
      )}
      <h2
        id={headlineId}
        className={cn(
          "text-balance font-bold leading-snug tracking-wide",
          isOverlay
            ? cn(
                "text-[1.35rem] sm:text-[1.5rem]",
                style.overlayTitle,
              )
            : cn(
                "text-[1.25rem] sm:text-[1.4rem]",
                useCuteOutline ? "text-primary popup-cute-outline" : style.title,
              ),
        )}
      >
        {title}
      </h2>
    </div>
  );
}

export type { SitePopupHeadlineIcon, SitePopupHeadlineStyle } from "@/lib/site-popup-headline";
