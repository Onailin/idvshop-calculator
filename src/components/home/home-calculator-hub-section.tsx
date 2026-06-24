import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  HOME_CALCULATOR_BUTTONS_IMAGE,
  HOME_CALCULATOR_SKINS_IMAGE,
  HOME_GEM_DECORATION,
} from "@/lib/home-banners";
import { cn } from "@/lib/utils";

const CALCULATOR_LINKS = [
  {
    href: "/skins",
    label: "คำนวณแพ็กเกจสกิน/ไอเท็ม และอีเว้นท์ต่างๆ",
    description: "เลือกไอเท็มได้หลายรายการ เพื่อดูยอดรวมและในราคาจึ้งๆ",
    image: HOME_CALCULATOR_SKINS_IMAGE,
  },
  {
    href: "/budget",
    label: "คำนวณแพ็กเกจกระดุม",
    description: "คำนวณตามงบ / จำนวนกระดุม / จำนวนยอดเติม และคูปองส่วนลด",
    image: HOME_CALCULATOR_BUTTONS_IMAGE,
  },
] as const;

const GEM_DECORATIONS = [
  {
    className:
      "left-0 top-1 h-14 w-14 -rotate-12 sm:left-2 sm:top-0 sm:h-[4.5rem] sm:w-[4.5rem] lg:h-20 lg:w-20",
    rotate: "-12deg",
    delay: false,
  },
  {
    className:
      "right-0 top-2 h-12 w-12 rotate-12 scale-x-[-1] sm:right-2 sm:top-1 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]",
    rotate: "12deg",
    delay: true,
  },
  {
    className:
      "bottom-0 left-8 hidden h-10 w-10 -rotate-6 opacity-85 sm:block lg:left-12 lg:h-11 lg:w-11",
    rotate: "-6deg",
    delay: true,
  },
  {
    className:
      "bottom-1 right-10 hidden h-9 w-9 rotate-6 scale-x-[-1] opacity-80 sm:block lg:right-14 lg:h-10 lg:w-10",
    rotate: "6deg",
    delay: false,
  },
] as const;

function GemDecoration({
  className,
  rotate,
  delay = false,
}: {
  className: string;
  rotate: string;
  delay?: boolean;
}) {
  return (
    <Image
      src={HOME_GEM_DECORATION.imageSrc}
      alt=""
      width={HOME_GEM_DECORATION.width}
      height={HOME_GEM_DECORATION.height}
      aria-hidden
      className={cn(
        "calculator-hub-gem pointer-events-none absolute object-contain mix-blend-lighten saturate-[1.85] contrast-[1.18] hue-rotate-[10deg] drop-shadow-[0_14px_32px_rgba(76,29,149,0.72)]",
        delay && "calculator-hub-gem-delay",
        className,
      )}
      style={{ "--gem-rotate": rotate } as CSSProperties}
    />
  );
}

export function HomeCalculatorHubSection() {
  return (
    <section
      id="calculator-hub"
      aria-labelledby="calculator-hub-heading"
      className="scroll-mt-24 space-y-5 sm:space-y-6"
    >
      <div className="relative mx-auto max-w-2xl px-10 py-2 sm:px-16 lg:px-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-1/2 h-32 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/15 via-brand-rose/22 to-primary/15 blur-3xl"
        />

        {GEM_DECORATIONS.map((gem, index) => (
          <GemDecoration
            key={index}
            className={gem.className}
            rotate={gem.rotate}
            delay={gem.delay}
          />
        ))}

        <div className="relative flex flex-col items-center gap-4 text-center">
          <h2
            id="calculator-hub-heading"
            className="text-2xl font-semibold tracking-[0.04em] sm:text-3xl lg:text-[2rem]"
          >
            <span className="bg-gradient-to-r from-primary via-brand-rose to-[#c97d92] bg-clip-text text-transparent">
              เลือกวิธีคำนวณ
            </span>
          </h2>
          <span
            aria-hidden
            className="h-px w-20 bg-gradient-to-r from-transparent via-primary/45 to-transparent sm:w-24"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {CALCULATOR_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="calculator-hub-card group ios-glass relative overflow-hidden rounded-[1.75rem] ring-1 ring-transparent"
          >
            <div className="relative overflow-hidden">
              <Image
                src={item.image.imageSrc}
                alt={item.image.alt}
                width={item.image.width}
                height={item.image.height}
                className="calculator-hub-card-image block h-auto w-full transition-[filter] duration-500"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div
                aria-hidden
                className="calculator-hub-card-shine pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              />
            </div>

            <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
              <div className="min-w-0 text-left">
                <p className="text-lg font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                  {item.label}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <span className="calculator-hub-card-arrow flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-foreground shadow-sm transition duration-300">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
