"use client";

import {
  SITE_POPUP_HEADLINE_STYLE_LABELS,
  SITE_POPUP_HEADLINE_STYLES,
  SITE_POPUP_HEADLINE_STYLE_SWATCHES,
  resolveSitePopupHeadlineStyle,
  type SitePopupHeadlineStyle,
} from "@/lib/site-popup-headline";
import { cn } from "@/lib/utils";

type SitePopupHeadlineStyleFieldProps = {
  defaultValue?: string | null;
};

export function SitePopupHeadlineStyleField({
  defaultValue,
}: SitePopupHeadlineStyleFieldProps) {
  const resolvedDefault = resolveSitePopupHeadlineStyle(defaultValue);

  return (
    <div className="space-y-2 sm:col-span-2">
      <span className="text-sm font-medium leading-none">สีหัวข้อ</span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SITE_POPUP_HEADLINE_STYLES.map((style) => (
          <label
            key={style}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm transition",
              "has-[:checked]:border-primary has-[:checked]:bg-primary/5",
              "hover:bg-muted/40",
            )}
          >
            <input
              type="radio"
              name="headlineStyle"
              value={style}
              defaultChecked={style === resolvedDefault}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "h-5 w-5 shrink-0 rounded-full border border-black/10 shadow-sm",
                SITE_POPUP_HEADLINE_STYLE_SWATCHES[style as SitePopupHeadlineStyle],
              )}
            />
            <span>{SITE_POPUP_HEADLINE_STYLE_LABELS[style]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
