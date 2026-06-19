export const dynamic = "force-dynamic";

import { getSitePopupForAdmin } from "@/actions/site-popup";
import { SitePopupManager } from "@/features/admin/site-popup-manager";

export default async function AdminPopupsPage() {
  const popup = await getSitePopupForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ป๊อปอัพหน้าเว็บ</h1>
        <p className="mt-2 text-muted-foreground">
          ตั้งค่าหน้าต่างแจ้งเตือนที่แสดงเมื่อผู้ใช้เข้าเว็บ — อัปโหลดได้หลายรูป
          แก้ไขข้อความ และเปิด/ปิดได้
        </p>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li>มีป๊อปอัพได้เพียง 1 รายการ แต่ใส่รูปได้หลายรูป (แสดงเป็นสไลด์)</li>
          <li>ผู้ใช้กดปิดแล้วจะไม่เห็นซ้ำในเซสชันเดียวกัน</li>
          <li>ไม่แสดงในหน้าแอดมินและหน้าเข้าสู่ระบบ</li>
        </ul>
      </div>

      <SitePopupManager popup={popup} />
    </div>
  );
}
