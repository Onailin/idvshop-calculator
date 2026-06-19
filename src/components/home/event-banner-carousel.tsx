"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BannerCarouselArrows } from "@/components/home/banner-carousel-arrows";
import { BannerCarouselDots } from "@/components/home/banner-carousel-dots";
import {
  HOME_BANNER_SLIDE_DURATION_MS,
  HOME_EVENT_INTERVAL_MS,
  type HomeBannerSlide,
} from "@/lib/home-banners";
import { toDisplayImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/utils";

type EventBannerCarouselProps = {
  slides: HomeBannerSlide[];
  intervalMs?: number;
  className?: string;
  variant?: "default" | "feature";
};

export function EventBannerCarousel({
  slides,
  intervalMs = HOME_EVENT_INTERVAL_MS,
  className,
  variant = "default",
}: EventBannerCarouselProps) {
  const isFeature = variant === "feature";
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) {
        return;
      }
      setActiveIndex((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  const goToPrevious = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const goToNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [slides.length, intervalMs, isPaused]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("relative", className)}
      aria-label="แบนเนอร์อีเว้นต์"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          isFeature
            ? "aspect-[4/3] rounded-2xl border border-brand-blush bg-brand-cream shadow-sm sm:aspect-[5/4]"
            : "aspect-[2.4/1] rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] sm:aspect-[2.8/1]",
        )}
      >
        <div
          className="flex h-full transition-transform ease-in-out"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
            transitionDuration: `${HOME_BANNER_SLIDE_DURATION_MS}ms`,
          }}
        >
          {slides.map((slide, index) => {
            const displaySrc = slide.imageSrc
              ? (toDisplayImageSrc(slide.imageSrc) ?? slide.imageSrc)
              : null;
            const isRemote =
              displaySrc?.startsWith("http://") ||
              displaySrc?.startsWith("https://") ||
              displaySrc?.startsWith("/api/images/");
            const isActive = index === activeIndex;

            const slideBody = (
              <>
                {displaySrc ? (
                  <Image
                    src={displaySrc}
                    alt={slide.alt}
                    fill
                    unoptimized={isRemote}
                    className="object-cover"
                    sizes="(max-width: 1152px) 100vw, 1152px"
                    priority={index === 0}
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-full flex-col justify-end bg-gradient-to-br p-5 sm:p-8",
                      slide.gradient ?? "from-primary/25 via-brand-blush to-white",
                    )}
                  >
                    {slide.title && (
                      <p className="text-lg font-semibold tracking-tight text-foreground sm:text-2xl">
                        {slide.title}
                      </p>
                    )}
                    {slide.subtitle && (
                      <p className="mt-1 max-w-md text-sm text-muted-foreground">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                )}
                {displaySrc && slide.title && !isFeature && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 pb-10 sm:p-6 sm:pb-12">
                    <p className="text-base font-semibold text-white sm:text-lg">
                      {slide.title}
                    </p>
                    {slide.subtitle && (
                      <p className="mt-0.5 text-sm text-white/85">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </>
            );

            const slideClass = "relative h-full w-full shrink-0";

            if (slide.href) {
              return (
                <Link
                  key={slide.id}
                  href={slide.href}
                  className={slideClass}
                  tabIndex={isActive ? 0 : -1}
                  aria-hidden={!isActive}
                >
                  {slideBody}
                </Link>
              );
            }

            return (
              <div
                key={slide.id}
                className={slideClass}
                aria-hidden={!isActive}
              >
                {slideBody}
              </div>
            );
          })}
        </div>

        {slides.length > 1 && (
          <>
            <BannerCarouselArrows
              onPrevious={goToPrevious}
              onNext={goToNext}
            />
            <BannerCarouselDots
              slides={slides}
              activeIndex={activeIndex}
              onSelect={goTo}
              overlay
            />
          </>
        )}
      </div>
    </section>
  );
}
