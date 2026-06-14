import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Percent, Sparkles } from "lucide-react";
import { HOME_CALCULATOR_SKINS_IMAGE } from "@/lib/home-banners";
import { cn } from "@/lib/utils";

const CALCULATOR_LINKS = [
  {
    href: "/skins",
    label: "คำนวณแพ็คสกิน",
    description: "เลือกไอเทมหลายรายการ ดูยอดรวมและแพ็กที่คุ้มที่สุด",
    imageSrc: HOME_CALCULATOR_SKINS_IMAGE.imageSrc,
    alt: HOME_CALCULATOR_SKINS_IMAGE.alt,
    icon: Sparkles,
    accent: "from-primary/20 via-white to-brand-blush/40",
  },
  {
    href: "/budget",
    label: "คำนวณคูปอง",
    description: "จัดสรรคูปอง 3% / 10% ตามแพ็กเกจให้คุ้มงบที่สุด",
    imageSrc: undefined,
    alt: "คำนวณคูปอง",
    icon: Percent,
    accent: "from-brand-rose/15 via-white to-brand-cream",
  },
] as const;

export function HomeCalculatorHubSection() {
  return (
    <section aria-labelledby="calculator-hub-heading" className="space-y-6">
      <div className="px-1 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          เครื่องมือ
        </p>
        <h2
          id="calculator-hub-heading"
          className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          เลือกวิธีคำนวณ
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {CALCULATOR_LINKS.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group ios-glass relative overflow-hidden rounded-[1.75rem] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_rgba(214,146,164,0.35)]"
            >
              <div
                className={cn(
                  "relative aspect-[16/10] overflow-hidden bg-gradient-to-br sm:aspect-[5/3]",
                  item.accent,
                )}
              >
                {item.imageSrc ? (
                  <Image
                    src={item.imageSrc}
                    alt={item.alt}
                    fill
                    className="object-cover opacity-95 transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/80 shadow-lg backdrop-blur-md">
                      <Icon className="h-9 w-9 text-primary" aria-hidden />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
              </div>

              <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                <div className="min-w-0 text-left">
                  <p className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {item.label}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 text-foreground shadow-sm transition group-hover:bg-primary group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
