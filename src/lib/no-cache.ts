import { unstable_noStore as noStore } from "next/cache";

/** บังคับให้ดึงข้อมูลจาก DB ใหม่ทุกครั้ง (ไม่ใช้ cache ของ Next.js) */
export function disableRequestCache() {
  noStore();
}
