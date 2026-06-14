"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FolderOpen,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Shield,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { isSuperAdmin } from "@/lib/admin-roles";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const baseNavItems = [
  { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/admin/categories", label: "หมวดหมู่", icon: FolderOpen },
  { href: "/admin/items", label: "รายการไอเทม", icon: Package },
  { href: "/admin/packages", label: "แพ็กเกจ", icon: Boxes },
  { href: "/admin/banners", label: "แบนเนอร์", icon: ImageIcon },
  { href: "/admin/settings", label: "การตั้งค่า", icon: Settings },
];

type AdminSidebarProps = {
  role: string;
  username: string;
};

export function AdminSidebar({ role, username }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = isSuperAdmin(role)
    ? [
        ...baseNavItems.slice(0, 4),
        { href: "/admin/admins", label: "จัดการแอดมิน", icon: Shield },
        ...baseNavItems.slice(4),
      ]
    : baseNavItems;

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-brand-blush/50 bg-white md:sticky md:top-0 md:h-svh md:w-64 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="border-b border-brand-blush/40 p-5">
        <div className="flex items-center gap-3">
          <BrandLogo variant="header" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">
              {BRAND_NAME}
            </p>
            <p className="text-xs text-muted-foreground">แผงแอดมิน</p>
          </div>
        </div>
        <p className="mt-3 truncate rounded-lg bg-brand-cream/70 px-3 py-2 text-xs text-muted-foreground">
          เข้าสู่ระบบ: <span className="font-medium text-foreground">{username}</span>
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-brand-cream/80 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-blush/40 p-3">
        <Button
          variant="outline"
          className="w-full justify-start border-brand-blush/60 bg-white hover:bg-brand-cream/60"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </Button>
      </div>
    </aside>
  );
}
