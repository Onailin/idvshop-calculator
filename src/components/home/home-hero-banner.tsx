"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BannerCarouselDots } from "@/components/home/banner-carousel-dots";
import {
  HOME_BANNER_SLIDE_DURATION_MS,
  HOME_EVENT_INTERVAL_MS,
  type HomeBannerSlide,
} from "@/lib/home-banners";
import { toDisplayImageSrc } from "@/lib/image-url";
import { cn } from "@/lib/utils";

const HERO_IMAGE_WIDTH = 1920;
const HERO_IMAGE_HEIGHT = 640;

type HomeHeroBannerProps = {
  slides: HomeBannerSlide[];
  intervalMs?: number;
  embedded?: boolean;
};

function HeroSlideImage({ slide }: { slide: HomeBannerSlide }) {
  const displaySrc = slide.imageSrc
    ? (toDisplayImageSrc(slide.imageSrc) ?? slide.imageSrc)
    : null;
  const isRemote =
    displaySrc?.startsWith("http://") ||
    displaySrc?.startsWith("https://") ||
    displaySrc?.startsWith("/api/images/");

  if (displaySrc) {
    return (
      <Image
        src={displaySrc}
        alt={slide.alt}
        width={HERO_IMAGE_WIDTH}
        height={HERO_IMAGE_HEIGHT}
        unoptimized={isRemote}
        sizes="(max-width: 1440px) 100vw, 1440px"
        className="block h-auto w-full"
      />
    );
  }

  return (
    <div
      className={cn(
        "aspect-[2.4/1] w-full bg-gradient-to-br sm:aspect-[2.8/1]",
        slide.gradient ?? "from-primary/40 via-brand-blush to-white",
      )}
    />
  );
}

function HeroSlideContent({
  slide,
  isActive,
  embedded = false,
}: {
  slide: HomeBannerSlide;
  isActive: boolean;
  embedded?: boolean;
}) {
  const content = <HeroSlideImage slide={slide} />;
  const shellClass = cn(
    "relative w-full overflow-hidden",
    embedded ? "bg-[#faf4f6]" : "bg-neutral-900",
  );

  if (slide.href) {
    return (
      <Link
        href={slide.href}
        className={cn("relative block", shellClass)}
        tabIndex={isActive ? 0 : -1}
        aria-hidden={!isActive}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={shellClass} aria-hidden={!isActive}>
      {content}
    </div>
  );
}

export function HomeHeroBanner({
  slides,
  intervalMs = HOME_EVENT_INTERVAL_MS,
  embedded = false,
}: HomeHeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  const hasMultipleSlides = slides.length > 1;

  return (
    <section
      aria-label="แบนเนอร์ร้าน"
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          !embedded && "rounded-2xl shadow-sm ring-1 ring-black/[0.04]",
        )}
      >
        {hasMultipleSlides ? (
          <div
            className="flex transition-transform ease-in-out"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
              transitionDuration: `${HOME_BANNER_SLIDE_DURATION_MS}ms`,
            }}
          >
            {slides.map((slide, index) => (
              <div key={slide.id} className="w-full shrink-0">
                <HeroSlideContent
                  slide={slide}
                  isActive={index === activeIndex}
                  embedded={embedded}
                />
              </div>
            ))}
          </div>
        ) : (
          <HeroSlideContent slide={slides[0]} isActive embedded={embedded} />
        )}

        {embedded && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-b from-transparent to-[#faf4f6] sm:h-12"
          />
        )}

        {hasMultipleSlides && (
          <BannerCarouselDots
            slides={slides}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            overlay
          />
        )}
      </div>
    </section>
  );
}
