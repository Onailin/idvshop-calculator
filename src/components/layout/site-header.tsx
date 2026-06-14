"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Shield, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  CALCULATOR_CONTAINER_CLASS,
  HOME_CONTAINER_CLASS,
  PAGE_CONTAINER_CLASS,
} from "@/components/layout/page-container";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const HEADER_CLASS =
  "border-b border-white/60 bg-white/72 shadow-[0_4px_24px_-10px_rgba(214,146,164,0.35)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/60";

const NAV_LINK_CLASS =
  "rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-colors sm:px-5 sm:text-[15px]";

function navLinkClass(isActive: boolean) {
  return cn(
    NAV_LINK_CLASS,
    isActive
      ? "bg-primary/20 text-foreground"
      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
  );
}

function mobileNavLinkClass(isActive: boolean) {
  return cn(
    "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-medium transition-colors",
    isActive
      ? "bg-primary/20 text-foreground"
      : "text-foreground/80 hover:bg-primary/10 hover:text-foreground",
  );
}

function NavLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={className ?? navLinkClass(isActive)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";
  const isCalculator =
    pathname === "/skins" ||
    pathname.startsWith("/skins/") ||
    pathname === "/budget" ||
    pathname.startsWith("/budget/");
  const containerClass = isHome
    ? HOME_CONTAINER_CLASS
    : isCalculator
      ? CALCULATOR_CONTAINER_CLASS
      : PAGE_CONTAINER_CLASS;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={cn("sticky top-0 z-50 w-full", HEADER_CLASS)}>
      <div
        className={cn(
          containerClass,
          "relative flex h-16 items-center justify-between sm:h-[4.75rem]",
        )}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90"
        >
          <BrandLogo variant="header" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
              {BRAND_NAME}
            </span>
            <span className="mt-0.5 block truncate text-xs font-medium text-primary sm:text-sm">
              {BRAND_TAGLINE}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/55 p-1 shadow-sm backdrop-blur-md sm:flex sm:gap-1.5">
          <NavLink href="/skins">คำนวณแพ็คสกิน</NavLink>
          <NavLink href="/budget">คำนวณคูปอง</NavLink>
          <Link
            href="/admin/login"
            className={cn("flex items-center gap-2", navLinkClass(isAdmin))}
          >
            <Shield className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem]" />
            แอดมิน
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-foreground shadow-sm backdrop-blur-md transition hover:bg-white/80 sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 top-16 z-40 bg-black/20 sm:hidden"
          aria-label="ปิดเมนู"
          onClick={closeMenu}
        />
      )}

      <nav
        id="mobile-nav"
        className={cn(
          "absolute left-0 right-0 top-full z-50 overflow-hidden border-b border-white/60 bg-white/90 shadow-lg backdrop-blur-2xl transition-all duration-200 sm:hidden",
          menuOpen
            ? "visible max-h-80 opacity-100"
            : "invisible max-h-0 opacity-0",
        )}
      >
        <div className={cn(containerClass, "flex flex-col gap-1 py-3")}>
          <NavLink
            href="/skins"
            className={mobileNavLinkClass(
              pathname === "/skins" || pathname.startsWith("/skins/"),
            )}
            onClick={closeMenu}
          >
            คำนวณกระดุม
          </NavLink>
          <NavLink
            href="/budget"
            className={mobileNavLinkClass(
              pathname === "/budget" || pathname.startsWith("/budget/"),
            )}
            onClick={closeMenu}
          >
            คำนวณแพ็กเกจ
          </NavLink>
          <Link
            href="/admin/login"
            className={mobileNavLinkClass(isAdmin)}
            onClick={closeMenu}
          >
            <Shield className="h-5 w-5" aria-hidden />
            แอดมิน
          </Link>
        </div>
      </nav>
    </header>
  );
}
