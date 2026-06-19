import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Gift,
  Heart,
  Megaphone,
  PartyPopper,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";

export const SITE_POPUP_HEADLINE_ICONS = [
  "sparkles",
  "gift",
  "megaphone",
  "star",
  "heart",
  "bell",
  "party",
  "tag",
] as const;

export const SITE_POPUP_HEADLINE_STYLES = [
  "rose",
  "gold",
  "purple",
  "ocean",
  "emerald",
  "sunset",
] as const;

export type SitePopupHeadlineIcon = (typeof SITE_POPUP_HEADLINE_ICONS)[number];
export type SitePopupHeadlineStyle = (typeof SITE_POPUP_HEADLINE_STYLES)[number];

export const SITE_POPUP_HEADLINE_ICON_LABELS: Record<
  SitePopupHeadlineIcon,
  string
> = {
  sparkles: "ประกาย",
  gift: "ของขวัญ",
  megaphone: "ประกาศ",
  star: "ดาว",
  heart: "หัวใจ",
  bell: "แจ้งเตือน",
  party: "เฉลิมฉลอง",
  tag: "โปรโมชั่น",
};

export const SITE_POPUP_HEADLINE_STYLE_LABELS: Record<
  SitePopupHeadlineStyle,
  string
> = {
  rose: "ชมพู",
  gold: "ทอง",
  purple: "ม่วง",
  ocean: "ฟ้า",
  emerald: "เขียว",
  sunset: "ส้ม",
};

export const SITE_POPUP_HEADLINE_STYLE_SWATCHES: Record<
  SitePopupHeadlineStyle,
  string
> = {
  rose: "bg-primary",
  gold: "bg-gradient-to-br from-amber-400 to-yellow-500",
  purple: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
  ocean: "bg-gradient-to-br from-sky-500 to-cyan-400",
  emerald: "bg-gradient-to-br from-emerald-500 to-teal-400",
  sunset: "bg-gradient-to-br from-orange-500 to-rose-500",
};

const ICON_MAP: Record<SitePopupHeadlineIcon, LucideIcon> = {
  sparkles: Sparkles,
  gift: Gift,
  megaphone: Megaphone,
  star: Star,
  heart: Heart,
  bell: Bell,
  party: PartyPopper,
  tag: Tag,
};

type HeadlineStyleConfig = {
  badge: string;
  iconWrap: string;
  icon: string;
  title: string;
  header: string;
  accentDot: string;
};

const STYLE_MAP: Record<SitePopupHeadlineStyle, HeadlineStyleConfig> = {
  rose: {
    badge:
      "border-primary/25 bg-primary/10 text-primary",
    iconWrap:
      "border-primary/20 bg-gradient-to-br from-primary/20 via-white to-brand-blush/50 text-primary shadow-[0_8px_20px_-10px_rgba(214,146,164,0.8)]",
    icon: "text-primary",
    title: "bg-gradient-to-r from-primary via-brand-rose to-[#c97d92] bg-clip-text text-transparent",
    header:
      "border-brand-blush/40 bg-gradient-to-r from-brand-cream/90 via-white to-brand-cream/90",
    accentDot: "bg-primary/35",
  },
  gold: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    iconWrap:
      "border-amber-200/80 bg-gradient-to-br from-amber-100 via-white to-orange-50 text-amber-600 shadow-[0_8px_20px_-10px_rgba(245,158,11,0.55)]",
    icon: "text-amber-600",
    title: "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 bg-clip-text text-transparent",
    header:
      "border-amber-100 bg-gradient-to-r from-amber-50/90 via-white to-orange-50/80",
    accentDot: "bg-amber-300/70",
  },
  purple: {
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    iconWrap:
      "border-violet-200/80 bg-gradient-to-br from-violet-100 via-white to-fuchsia-50 text-violet-600 shadow-[0_8px_20px_-10px_rgba(139,92,246,0.5)]",
    icon: "text-violet-600",
    title: "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent",
    header:
      "border-violet-100 bg-gradient-to-r from-violet-50/90 via-white to-fuchsia-50/80",
    accentDot: "bg-violet-300/70",
  },
  ocean: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    iconWrap:
      "border-sky-200/80 bg-gradient-to-br from-sky-100 via-white to-cyan-50 text-sky-600 shadow-[0_8px_20px_-10px_rgba(14,165,233,0.5)]",
    icon: "text-sky-600",
    title: "bg-gradient-to-r from-sky-600 via-cyan-500 to-sky-500 bg-clip-text text-transparent",
    header:
      "border-sky-100 bg-gradient-to-r from-sky-50/90 via-white to-cyan-50/80",
    accentDot: "bg-sky-300/70",
  },
  emerald: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconWrap:
      "border-emerald-200/80 bg-gradient-to-br from-emerald-100 via-white to-teal-50 text-emerald-600 shadow-[0_8px_20px_-10px_rgba(16,185,129,0.5)]",
    icon: "text-emerald-600",
    title: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent",
    header:
      "border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/80",
    accentDot: "bg-emerald-300/70",
  },
  sunset: {
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    iconWrap:
      "border-orange-200/80 bg-gradient-to-br from-rose-100 via-orange-50 to-amber-50 text-orange-600 shadow-[0_8px_20px_-10px_rgba(249,115,22,0.5)]",
    icon: "text-orange-600",
    title: "bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent",
    header:
      "border-orange-100 bg-gradient-to-r from-rose-50/90 via-white to-amber-50/80",
    accentDot: "bg-orange-300/70",
  },
};

export function isSitePopupHeadlineIcon(
  value: string | null | undefined,
): value is SitePopupHeadlineIcon {
  return (
    value !== null &&
    value !== undefined &&
    (SITE_POPUP_HEADLINE_ICONS as readonly string[]).includes(value)
  );
}

export function isSitePopupHeadlineStyle(
  value: string | null | undefined,
): value is SitePopupHeadlineStyle {
  return (
    value !== null &&
    value !== undefined &&
    (SITE_POPUP_HEADLINE_STYLES as readonly string[]).includes(value)
  );
}

export function resolveSitePopupHeadlineIcon(
  value: string | null | undefined,
): SitePopupHeadlineIcon {
  return isSitePopupHeadlineIcon(value) ? value : "sparkles";
}

export function resolveSitePopupHeadlineStyle(
  value: string | null | undefined,
): SitePopupHeadlineStyle {
  return isSitePopupHeadlineStyle(value) ? value : "rose";
}

export function getSitePopupHeadlineIcon(
  icon: SitePopupHeadlineIcon,
): LucideIcon {
  return ICON_MAP[icon];
}

export function getSitePopupHeadlineStyle(
  style: SitePopupHeadlineStyle,
): HeadlineStyleConfig {
  return STYLE_MAP[style];
}
