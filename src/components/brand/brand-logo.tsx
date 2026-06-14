import Image from "next/image";
import { BRAND_LOGO_SRC, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "header" | "login";
  className?: string;
  imageClassName?: string;
};

const VARIANTS = {
  header: {
    width: 44,
    height: 44,
    imageClassName: "h-10 w-10 rounded-2xl object-cover sm:h-11 sm:w-11",
  },
  login: {
    width: 112,
    height: 112,
    imageClassName:
      "h-28 w-28 rounded-2xl object-cover shadow-sm ring-1 ring-brand-blush/60",
  },
} as const;

export function BrandLogo({
  variant = "header",
  className,
  imageClassName,
}: BrandLogoProps) {
  const config = VARIANTS[variant];

  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <Image
        src={BRAND_LOGO_SRC}
        alt={BRAND_NAME}
        width={config.width}
        height={config.height}
        priority={variant === "login"}
        className={cn(config.imageClassName, imageClassName)}
      />
    </span>
  );
}
