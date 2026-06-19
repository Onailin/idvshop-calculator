"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BannerCarouselArrows } from "@/components/home/banner-carousel-arrows";
import { BannerCarouselDots } from "@/components/home/banner-carousel-dots";
import { SitePopupHeadline } from "@/components/layout/site-popup-headline";
import { RemoteImage } from "@/components/ui/remote-image";
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

function PopupSlideImage({
  image,
  onNavigate,
}: {
  image: SiteEntryPopupImage;
  onNavigate?: () => void;
}) {
  const imageNode = (
    <RemoteImage
      src={image.imageUrl}
      alt={image.imageAlt}
      contain
      className="max-h-[min(44vh,360px)] w-full object-contain"
      sizes="(max-width: 640px) 92vw, 480px"
    />
  );

  if (image.linkUrl) {
    return (
      <Link
        href={image.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition hover:opacity-95"
        onClick={onNavigate}
      >
        {imageNode}
      </Link>
    );
  }

  return <div>{imageNode}</div>;
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
        className="absolute inset-0 bg-[#3a1f2a]/55 backdrop-blur-[4px]"
        aria-label="ปิดป๊อปอัพ"
        onClick={dismissPopup}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headlineId}
        className={cn(
          "relative z-[101] w-full max-w-[min(100%,32rem)] overflow-hidden",
          "rounded-2xl border border-primary/15 bg-white shadow-[0_24px_64px_-24px_rgba(58,31,42,0.45)]",
          "transition-all duration-200 ease-out",
          isExiting ? "translate-y-3 scale-[0.98]" : "translate-y-0 scale-100",
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <button
          type="button"
          onClick={dismissPopup}
          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md transition hover:bg-primary/90"
          aria-label="ปิด"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-3 pb-5 pt-4 sm:px-4 sm:pb-6 sm:pt-5">
          <div className="relative -mx-0.5 sm:-mx-1">
            {hasMultipleSlides ? (
              <>
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform ease-in-out"
                    style={{
                      transform: `translateX(-${activeIndex * 100}%)`,
                      transitionDuration: `${SLIDE_DURATION_MS}ms`,
                    }}
                  >
                    {images.map((image) => (
                      <div key={image.id} className="w-full shrink-0">
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
                  className="gap-2.5"
                />
              </>
            ) : (
              <PopupSlideImage image={images[0]} onNavigate={dismissPopup} />
            )}
          </div>

          <div className="mt-4 space-y-3 px-0.5 sm:px-1">
            <SitePopupHeadline
              headline={popup.headline}
              headlineIcon={popup.headlineIcon}
              headlineStyle={popup.headlineStyle}
              headlineId={headlineId}
              className="text-center"
            />

            {popup.body && (
              <p className="whitespace-pre-line text-left text-sm leading-relaxed text-foreground/80 sm:text-[15px]">
                {popup.body}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
