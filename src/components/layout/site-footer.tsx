import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const STORE_FACEBOOK_URL =
  "https://www.facebook.com/harmonytopup?locale=th_TH";

const FOOTER_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/skins", label: "คำนวณแพ็คสกิน" },
  { href: "/budget", label: "คำนวณคูปอง" },
  { href: "/admin/login", label: "แอดมิน" },
] as const;

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "relative mt-auto border-t border-white/60 bg-white/55 backdrop-blur-2xl",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-brand-blush/10 to-brand-cream/30"
      />

      <div className="relative mx-auto w-full max-w-[90rem] px-5 py-5 sm:px-8 sm:py-6 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8 lg:gap-12">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandLogo variant="header" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                {BRAND_NAME}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {BRAND_TAGLINE}
              </p>
            </div>
          </div>

          <nav aria-label="ลิงก์ท้ายหน้า">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-medium text-foreground/75 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-xs text-muted-foreground sm:text-right">
            <p>เปิดบริการ 10:00 – 22:00 น.</p>
            <a
              href={STORE_FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-medium text-foreground/75 transition-colors hover:text-primary"
            >
              Facebook — Harmony TopUp
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-white/60 pt-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {BRAND_NAME}</p>
          <p>Identity V เป็นเครื่องหมายการค้าของ NetEase Games</p>
        </div>
      </div>
    </footer>
  );
}
