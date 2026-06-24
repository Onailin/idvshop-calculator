import { EventBannerCarousel } from "@/components/home/event-banner-carousel";
import { HomeCalculatorHubSection } from "@/components/home/home-calculator-hub-section";
import { HomeHeroBanner } from "@/components/home/home-hero-banner";
import { StoreInfoSection } from "@/components/home/store-info-section";
import { PageContainer } from "@/components/layout/page-container";
import type { HomePageBanners } from "@/lib/home-banner-mapper";

type HomeContentProps = {
  banners: HomePageBanners;
};

export function HomeContent({ banners }: HomeContentProps) {
  return (
    <main className="relative flex-1 pb-8 sm:pb-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-brand-blush/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-rose/15 blur-3xl" />
      </div>

      <PageContainer
        variant="home"
        className="relative space-y-10 pt-6 sm:space-y-12 sm:pt-8 lg:space-y-14 lg:pt-10"
      >
        <div className="overflow-hidden rounded-2xl">
          <HomeHeroBanner slides={banners.heroSlides} embedded />
        </div>

        <HomeCalculatorHubSection />

        {banners.eventSlides.length > 0 && (
          <EventBannerCarousel slides={banners.eventSlides} />
        )}

        <StoreInfoSection />
      </PageContainer>
    </main>
  );
}
