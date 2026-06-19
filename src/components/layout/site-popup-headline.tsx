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
};

export function SitePopupHeadline({
  headline,
  headlineStyle,
  headlineId,
  className,
}: SitePopupHeadlineProps) {
  const styleKey = resolveSitePopupHeadlineStyle(headlineStyle);
  const style = getSitePopupHeadlineStyle(styleKey);
  const title = headline?.trim() || "ยินดีต้อนรับ";
  const useCuteOutline = styleKey === "rose";

  return (
    <div className={cn(className)}>
      <h2
        id={headlineId}
        className={cn(
          "text-balance text-[1.25rem] font-bold leading-snug tracking-wide sm:text-[1.4rem]",
          useCuteOutline ? "text-primary popup-cute-outline" : style.title,
        )}
      >
        {title}
      </h2>
    </div>
  );
}

export type { SitePopupHeadlineIcon, SitePopupHeadlineStyle } from "@/lib/site-popup-headline";
