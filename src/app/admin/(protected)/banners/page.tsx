export const dynamic = "force-dynamic";

import { getBannersForAdmin } from "@/actions/banner";
import { BannerManager } from "@/features/admin/banner-manager";
import { BANNER_PLACEMENT_LABELS } from "@/lib/banner-placements";

export default async function AdminBannersPage() {
  const banners = await getBannersForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แบนเนอร์</h1>
        <p className="mt-2 text-muted-foreground">
          จัดการรูปแบนเนอร์หน้าแรก — อัปโหลด เปิด/ปิด และจัดลำดับได้
        </p>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {Object.entries(BANNER_PLACEMENT_LABELS).map(([key, label]) => (
            <li key={key}>
              <span className="font-medium text-foreground">{label}</span>
              {key === "home_hero" && " — แสดงรูปแรกที่เปิดใช้งาน"}
              {key === "home_event" && " — รองรับหลายสไลด์ (เรียงตามลำดับ)"}
              {key === "home_calculator" && " — แสดงรูปแรกที่เปิดใช้งาน"}
            </li>
          ))}
        </ul>
      </div>

      <BannerManager banners={banners} />
    </div>
  );
}
