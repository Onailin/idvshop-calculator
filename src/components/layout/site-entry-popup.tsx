"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BannerCarouselArrows } from "@/components/home/banner-carousel-arrows";
import { BannerCarouselDots } from "@/components/home/banner-carousel-dots";
import { SitePopupHeadline } from "@/components/layout/site-popup-headline";
import { RemoteImage } from "@/components/ui/remote-image";
import { STORE_FACEBOOK_URL } from "@/lib/store-links";
import { cn } from "@/lib/utils";

export type SiteEntryPopupImage = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  linkUrl: string | null;
};

export type SiteEntryPopupData = {
  id: string;
  headline: string | null;
  headlineIcon: string | null;
  headlineStyle: string | null;
  body: string | null;
  images: SiteEntryPopupImage[];
};

type SiteEntryPopupProps = {
  popup: SiteEntryPopupData | null;
};

const EXCLUDED_PREFIXES = ["/admin", "/login"];
const SLIDE_DURATION_MS = 500;
const DISMISS_ANIMATION_MS = 180;

const POPUP_CTA_BUTTON_CLASS =
  "inline-flex h-10 w-full items-center justify-center rounded-xl border border-white/80 bg-white px-5 text-sm font-bold text-primary shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition hover:bg-white/95 sm:h-11 sm:text-[15px]";

function getDismissKey(popupId: string) {
  return `site-popup-dismissed:${popupId}`;
}

function readDismissed(popupId: string) {
  try {
    return sessionStorage.getItem(getDismissKey(popupId)) === "1";
  } catch {
    return false;
  }
}

function usePopupDismissed(popupId: string | undefined, enabled: boolean) {
  return useSyncExternalStore(
    () => () => {},
    () => (enabled && popupId ? readDismissed(popupId) : true),
    () => true,
  );
}

function PopupDecorations() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[8] overflow-hidden">
      <div className="popup-glow-pulse absolute -left-8 top-10 h-24 w-24 rounded-full bg-primary/40 blur-2xl" />
      <div className="popup-glow-pulse absolute -right-6 bottom-28 h-20 w-20 rounded-full bg-brand-rose/50 blur-2xl [animation-delay:1.2s]" />
      <span className="absolute left-5 top-8 h-1 w-1 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.95)]" />
      <span className="absolute right-10 top-14 h-1.5 w-1.5 rotate-45 bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
      <span className="absolute bottom-40 left-8 h-1 w-1 rounded-full bg-white/70" />
      <div className="popup-shine-sweep absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}

function PopupSlideImage({
  image,
  onNavigate,
}: {
  image: SiteEntryPopupImage;
  onNavigate?: () => void;
}) {
  const imageNode = (
    <div className="relative h-full w-full">
      <RemoteImage
        src={image.imageUrl}
        alt={image.imageAlt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 92vw, 512px"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-brand-rose/25" />
      <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/25 to-transparent" />
    </div>
  );

  if (image.linkUrl) {
    return (
      <Link
        href={image.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full transition hover:brightness-105"
        onClick={onNavigate}
      >
        {imageNode}
      </Link>
    );
  }

  return imageNode;
}

function PopupTextOverlay({
  popup,
  headlineId,
  hasMultipleSlides,
  onFacebookClick,
}: {
  popup: SiteEntryPopupData;
  headlineId: string;
  hasMultipleSlides: boolean;
  onFacebookClick?: () => void;
}) {
  const hasBody = Boolean(popup.body?.trim());

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
      <div
        className={cn(
          "relative px-4 sm:px-5",
          hasMultipleSlides
            ? hasBody
              ? "pb-[4.75rem] pt-20 sm:pb-[5rem] sm:pt-24"
              : "pb-[4.25rem] pt-16 sm:pb-[4.5rem] sm:pt-20"
            : hasBody
              ? "pb-4 pt-20 sm:pt-24"
              : "pb-4 pt-16 sm:pt-20",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#7a3d52]/95 via-[#b86b82]/78 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative space-y-2 sm:space-y-2.5">
          <SitePopupHeadline
            headline={popup.headline}
            headlineIcon={popup.headlineIcon}
            headlineStyle={popup.headlineStyle ?? "rose"}
            headlineId={headlineId}
            variant="overlay"
          />

          {hasBody && (
            <p className="popup-overlay-body line-clamp-2 text-sm leading-relaxed text-white/92 sm:text-[15px]">
              {popup.body}
            </p>
          )}

          <Link
            href={STORE_FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onFacebookClick}
            className={cn(POPUP_CTA_BUTTON_CLASS, "pointer-events-auto")}
          >
            สอบถามเพิ่มเติม
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SiteEntryPopup({ popup }: SiteEntryPopupProps) {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dismissedLocally, setDismissedLocally] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const isExcluded = EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const images = popup?.images ?? [];
  const hasMultipleSlides = images.length > 1;
  const isEligible = Boolean(popup && !isExcluded && images.length > 0);
  const isStoredDismissed = usePopupDismissed(popup?.id, isEligible);
  const shouldShow = isEligible && !isStoredDismissed && !dismissedLocally;

  const dismissPopup = useCallback(() => {
    if (!popup || isExiting) {
      return;
    }

    setIsExiting(true);
    window.setTimeout(() => {
      try {
        sessionStorage.setItem(getDismissKey(popup.id), "1");
      } catch {
        // ignore storage errors
      }
      setDismissedLocally(true);
      setIsExiting(false);
    }, DISMISS_ANIMATION_MS);
  }, [popup, isExiting]);

  const goTo = useCallback(
    (index: number) => {
      if (images.length === 0) {
        return;
      }

      setActiveIndex((index + images.length) % images.length);
    },
    [images.length],
  );

  const goToPrevious = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const goToNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (!shouldShow) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismissPopup();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shouldShow, dismissPopup]);

  useEffect(() => {
    if (!hasMultipleSlides || isPaused || !shouldShow) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, isPaused, shouldShow, images.length]);

  if (!popup || !shouldShow || isExcluded || images.length === 0) {
    return null;
  }

  const headlineId = "site-popup-headline";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6",
        "transition-opacity duration-200",
        isExiting ? "opacity-0" : "opacity-100",
      )}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#d692a4]/45 backdrop-blur-[6px]"
        aria-label="ปิดป๊อปอัพ"
        onClick={dismissPopup}
      />

      <div
        className={cn(
          "relative z-[101] w-full max-w-[min(100%,26rem)] sm:max-w-[30rem] md:max-w-[32rem]",
          "transition-all duration-200 ease-out",
          isExiting ? "translate-y-3 scale-[0.97]" : "translate-y-0 scale-100",
        )}
      >
        <div
          aria-hidden
          className="popup-glow-pulse pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/50 via-brand-rose/40 to-brand-blush/50 blur-2xl"
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={headlineId}
          className={cn(
            "relative overflow-hidden rounded-[1.65rem] border border-primary/30",
            "bg-[#fff9fb] shadow-[0_28px_80px_-20px_rgba(214,146,164,0.65),0_0_56px_rgba(214,146,164,0.4)]",
            "ring-1 ring-primary/20",
          )}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 z-30 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          />

          <button
            type="button"
            onClick={dismissPopup}
            className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-primary text-white shadow-[0_4px_16px_rgba(214,146,164,0.55)] backdrop-blur-md transition hover:bg-primary/90"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative aspect-[4/5] w-full">
            <PopupDecorations />

            {hasMultipleSlides ? (
              <>
                <div className="relative h-full overflow-hidden">
                  <div
                    className="flex h-full transition-transform ease-in-out"
                    style={{
                      transform: `translateX(-${activeIndex * 100}%)`,
                      transitionDuration: `${SLIDE_DURATION_MS}ms`,
                    }}
                  >
                    {images.map((image) => (
                      <div key={image.id} className="h-full w-full shrink-0">
                        <PopupSlideImage image={image} onNavigate={dismissPopup} />
                      </div>
                    ))}
                  </div>
                </div>
                <BannerCarouselArrows
                  onPrevious={goToPrevious}
                  onNext={goToNext}
                />
                <BannerCarouselDots
                  slides={images.map((image) => ({
                    id: image.id,
                    alt: image.imageAlt,
                  }))}
                  activeIndex={activeIndex}
                  onSelect={goTo}
                  overlay
                  className="z-30 gap-2.5 pb-3"
                />
              </>
            ) : (
              <PopupSlideImage image={images[0]} onNavigate={dismissPopup} />
            )}

            <PopupTextOverlay
              popup={popup}
              headlineId={headlineId}
              hasMultipleSlides={hasMultipleSlides}
              onFacebookClick={dismissPopup}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
