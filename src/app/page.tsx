export const dynamic = "force-dynamic";

import { SiteHeader } from "@/components/layout/site-header";
import { DatabaseBanner } from "@/components/layout/database-banner";
import { HomeContent } from "@/components/home/home-content";
import { getHomePageBanners } from "@/actions/banner";
import { isDatabaseConnected } from "@/actions/db";

export default async function HomePage() {
  const [dbConnected, homeBanners] = await Promise.all([
    isDatabaseConnected(),
    getHomePageBanners(),
  ]);

  return (
    <div className="page-gradient flex min-h-screen flex-col">
      <SiteHeader />
      {!dbConnected && <DatabaseBanner />}
      <HomeContent banners={homeBanners} />
    </div>
  );
}
