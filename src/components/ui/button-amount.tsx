"use client";

import { useState } from "react";
import { BUTTON_ICON_ALT, BUTTON_ICON_SRC } from "@/lib/button-icon";
import { cn, formatButtons } from "@/lib/utils";

const BUTTON_ICON_FALLBACK_SRC = "/icons/button.svg";

type ButtonAmountSize = "xs" | "sm" | "md" | "lg";

type ButtonAmountProps = {
  value: number;
  /** ค่าเริ่มต้น "กระดุม" — ส่ง false ถ้าไม่ต้องการคำต่อท้าย */
  suffix?: string | false;
  className?: string;
  iconClassName?: string;
  size?: ButtonAmountSize;
  highlight?: boolean;
};

/** จำกัดขนาดสูงสุดของไอคอน (em) — ย่อลงในช่อง ไม่บังคับเต็มกรอบ */
const SIZE_CONFIG: Record<
  ButtonAmountSize,
  { text: string; iconMax: string }
> = {
  xs: { text: "text-xs", iconMax: "max-h-[0.85em] max-w-[0.85em]" },
  sm: { text: "text-sm", iconMax: "max-h-[0.9em] max-w-[0.9em]" },
  md: { text: "text-base", iconMax: "max-h-[0.95em] max-w-[0.95em]" },
  lg: { text: "text-lg", iconMax: "max-h-[1em] max-w-[1em]" },
};

export function ButtonAmount({
  value,
  suffix = "กระดุม",
  className,
  iconClassName,
  size = "sm",
  highlight = false,
}: ButtonAmountProps) {
  const config = SIZE_CONFIG[size];
  const [iconSrc, setIconSrc] = useState(BUTTON_ICON_SRC);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 leading-none",
        config.text,
        className,
      )}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local icon scales with text */}
        <img
          src={iconSrc}
          alt={BUTTON_ICON_ALT}
          className={cn(
            "block h-auto w-auto object-contain object-center",
            config.iconMax,
            iconClassName,
          )}
          onError={() => setIconSrc(BUTTON_ICON_FALLBACK_SRC)}
        />
      </span>
      <span
        className={cn(
          "tabular-nums leading-none",
          highlight && "font-bold text-destructive",
        )}
      >
        {formatButtons(value)}
        {suffix ? ` ${suffix}` : ""}
      </span>
    </span>
  );
}

type ButtonBreakdownProps = {
  topup: number;
  buttons: number;
  className?: string;
};

/** ยอดเติม + โบนัส (ถ้ามี) — ไม่ใส่ไอคอน เพื่อไม่ให้รก */
export function ButtonBreakdown({
  topup,
  buttons,
  className,
}: ButtonBreakdownProps) {
  const bonus = Math.max(0, buttons - topup);

  if (bonus > 0) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {formatButtons(topup)} + โบนัส {formatButtons(bonus)}
      </span>
    );
  }

  return (
    <span className={cn("text-muted-foreground", className)}>
      {formatButtons(topup)} ยอดเติมสะสม
    </span>
  );
}
