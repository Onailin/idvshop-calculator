import Image from "next/image";
import Link from "next/link";
import { STORE_FACEBOOK_URL, STORE_LINE_URL } from "@/lib/store-links";
import { cn } from "@/lib/utils";

const STORE_CHIBI_IMAGE = "/home/chibi.png";

const HIGHLIGHTS = ["เติมไว", "ปลอดภัย", "ราคาคุ้ม"] as const;

const DETAILS = [
  { label: "เวลาเปิดร้าน", value: "10:00 – 22:00 น." },
  { label: "ช่องทางชำระเงิน", value: "ทุกธนาคาร · TrueMoney Wallet" },
] as const;

function StoreMascot({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <div className="relative flex h-[9.5rem] w-[9.5rem] items-center justify-center sm:h-40 sm:w-40 lg:h-[13.5rem] lg:w-[13.5rem]">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 via-brand-blush/35 to-white/60 blur-[2px]" />
        <div className="absolute inset-[6%] rounded-full bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]" />
        <div className="absolute inset-0 rounded-full border border-dashed border-primary/20" />
        <div className="absolute inset-[14%] rounded-full border border-primary/10" />

        <Image
          src={STORE_CHIBI_IMAGE}
          alt=""
          width={184}
          height={184}
          priority
          className="relative z-10 h-auto w-[78%] max-w-[10.5rem] object-contain drop-shadow-[0_12px_28px_rgba(214,146,164,0.38)] lg:max-w-[11.5rem]"
        />

        <span className="absolute -bottom-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/85 px-3 py-0.5 text-[10px] font-semibold text-primary shadow-sm sm:text-[11px]">
          Harmony Shop
        </span>
      </div>
    </div>
  );
}

const SOCIAL_LINK_CLASS =
  "inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 sm:h-11 sm:px-6 sm:text-[15px]";

export function StoreInfoSection() {
  return (
    <section
      aria-labelledby="store-info-heading"
      className="ios-glass relative w-full overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-[#fff9fb] via-white/80 to-[#f5eaee]"
      />

      <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
        <div className="flex flex-col items-center gap-6 sm:gap-7 lg:flex-row lg:items-center lg:gap-10 xl:gap-12">
          <StoreMascot className="lg:shrink-0" />

          <div className="min-w-0 flex-1 space-y-4 sm:space-y-5">
            <div className="space-y-2 sm:space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/90 sm:text-xs">
                Identity V Top Up
              </p>
              <h2
                id="store-info-heading"
                className="text-[1.65rem] font-extrabold leading-[1.15] tracking-tight sm:text-3xl lg:text-[2rem] xl:text-4xl"
              >
                <span className="bg-gradient-to-r from-primary via-brand-rose to-[#c97d92] bg-clip-text text-transparent">
                  Harmony TopUp
                </span>
              </h2>
              <p className="text-base font-semibold text-foreground/90 sm:text-lg">
                บริการเติมเกมออนไลน์
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-7">
                บริการเติมเกม Identity V รวดเร็ว ปลอดภัย ราคาคุ้ม
                พร้อมทีมงานดูแลตลอดเวลาเปิดร้าน
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {HIGHLIGHTS.map((label) => (
                <span
                  key={label}
                  className="rounded-lg border border-primary/15 bg-primary/[0.08] px-3 py-1 text-sm font-bold text-primary"
                >
                  {label}
                </span>
              ))}
            </div>

            <dl className="grid gap-3 border-y border-primary/10 py-4 text-sm sm:grid-cols-2 sm:gap-x-8 sm:text-[15px]">
              {DETAILS.map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
                    {label}
                  </dt>
                  <dd className="font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              ทรูมันนี่วอลเลทฟรีค่าธรรมเนียมสำหรับบัญชีที่ยืนยันตัวตนแล้ว (บัญชีขั้นสูง)
              — สอบถามหรือสั่งซื้อได้ทาง Facebook หรือ Line ร้าน
            </p>

            <div className="flex flex-wrap gap-2.5 pt-0.5">
              <Link
                href={STORE_FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(SOCIAL_LINK_CLASS, "bg-[#1877F2]")}
              >
                Facebook
              </Link>
              <Link
                href={STORE_LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(SOCIAL_LINK_CLASS, "bg-[#06C755]")}
              >
                Line
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
