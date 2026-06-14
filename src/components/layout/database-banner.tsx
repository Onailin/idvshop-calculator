import { AlertTriangle } from "lucide-react";

import { PAGE_CONTAINER_CLASS } from "@/components/layout/page-container";

export function DatabaseBanner() {
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 py-3">
      <div className={`${PAGE_CONTAINER_CLASS} flex items-start gap-3 text-sm text-amber-900`}>
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-medium">ไม่ได้เชื่อมต่อฐานข้อมูล</p>
          <p className="mt-1 text-amber-800/80">
            ใส่ URL PostgreSQL ใน <code>.env</code> แล้วรัน{" "}
            <code>npm run db:push</code> และ <code>npm run db:seed</code>{" "}
            สมัครฐานข้อมูลฟรีได้ที่{" "}
            <a
              href="https://neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              neon.tech
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
