import type { Banner } from "@prisma/client";
import { toDisplayImageSrc } from "@/lib/image-url";
import {
  HOME_CALCULATOR_SKINS_IMAGE,
  HOME_HERO_BANNER,
  type HomeBannerSlide,
} from "@/lib/home-banners";
import type { BannerPlacement } from "@/lib/banner-placements";

export type HomePageBanners = {
  heroSlides: HomeBannerSlide[];
  eventSlides: HomeBannerSlide[];
  calculatorImage: {
    alt: string;
    imageSrc?: string;
  };
};

function toSlide(banner: Banner): HomeBannerSlide {
  return {
    id: banner.id,
    alt: banner.alt,
    title: banner.title ?? undefined,
    imageSrc: toDisplayImageSrc(banner.imageUrl) ?? banner.imageUrl,
  };
}

function toCalculatorImage(banner: Banner) {
  return {
    alt: banner.alt,
    imageSrc: toDisplayImageSrc(banner.imageUrl) ?? banner.imageUrl,
  };
}

export function resolveHomePageBanners(banners: Banner[]): HomePageBanners {
  const byPlacement = new Map<BannerPlacement, Banner[]>();

  for (const banner of banners) {
    if (!banner.isActive) {
      continue;
    }

    const placement = banner.placement as BannerPlacement | null;
    if (!placement) {
      continue;
    }

    const list = byPlacement.get(placement) ?? [];
    list.push(banner);
    byPlacement.set(placement, list);
  }

  for (const [placement, list] of byPlacement) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime());
    byPlacement.set(placement, list);
  }

  const heroBanners = byPlacement.get("home_hero") ?? [];
  const eventBanners = byPlacement.get("home_event") ?? [];
  const calculatorBanner = byPlacement.get("home_calculator")?.[0];

  return {
    heroSlides:
      heroBanners.length > 0
        ? heroBanners.map(toSlide)
        : [HOME_HERO_BANNER],
    eventSlides: eventBanners.map(toSlide),
    calculatorImage: calculatorBanner
      ? toCalculatorImage(calculatorBanner)
      : HOME_CALCULATOR_SKINS_IMAGE,
  };
}
