import { Coins, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STORE_FACEBOOK_URL =
  "https://www.facebook.com/harmonytopup?locale=th_TH";

const STORE_BG = {
  baseFrom: "#faf4f6",
  baseVia: "#faf4f6",
  baseTo: "#f0e4e8",
  glowRight: "rgba(214, 146, 164, 0.28)",
  glowLeft: "rgba(214, 146, 164, 0.18)",
};

function StoreVisual() {
  return (
    <div
      className="relative mx-auto flex min-h-[260px] w-full max-w-lg items-center justify-center sm:min-h-[300px] lg:min-h-[340px] lg:max-w-none"
      aria-hidden
    >
      <div className="absolute right-1/4 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-brand-rose/25 blur-[70px] sm:h-64 sm:w-64" />

      <div className="relative rotate-[-8deg] transition-transform duration-500 hover:rotate-[-5deg]">
        <div className="relative z-10 w-[11.5rem] overflow-hidden rounded-[2rem] border-2 border-brand-blush bg-white p-2 shadow-lg shadow-brand-rose/15 sm:w-[13rem]">
          <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-brand-blush/40 via-white to-brand-cream">
            <div className="flex items-center justify-between px-3 pt-3">
              <span className="text-[10px] font-semibold text-foreground/80">
                Harmony TopUp
              </span>
              <Gamepad2 className="h-3.5 w-3.5 text-primary/80" />
            </div>
            <div className="grid grid-cols-3 gap-2 p-3 pt-2">
              {["IDV", "GI", "VL"].map((label) => (
                <div
                  key={label}
                  className="flex aspect-square items-center justify-center rounded-xl bg-primary/10 text-[10px] font-bold text-primary ring-1 ring-brand-blush/80"
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="mx-3 mb-3 rounded-xl bg-white/80 px-3 py-2 text-center text-[10px] font-medium text-muted-foreground ring-1 ring-brand-blush/50">
              เติมเกม · ปลอดภัย · รวดเร็ว
            </div>
          </div>
        </div>

        <div className="absolute -right-6 top-8 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-rose to-primary text-white shadow-md ring-2 ring-white sm:-right-8 sm:h-16 sm:w-16">
          <span className="text-xs font-bold sm:text-sm">IDV</span>
        </div>

        <div className="absolute -left-5 bottom-16 z-20 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-brand-blush/60">
          <Coins className="h-5 w-5 text-amber-500" />
        </div>
      </div>
    </div>
  );
}

export function StoreInfoSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section
      aria-labelledby="store-info-heading"
      className={cn(
        "relative w-full overflow-hidden",
        embedded ? undefined : "ios-glass rounded-[1.75rem] sm:rounded-[2rem]",
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, ${STORE_BG.baseFrom}, ${STORE_BG.baseVia}, ${STORE_BG.baseTo})`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 85% 50%, ${STORE_BG.glowRight}, transparent 55%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 15% 80%, ${STORE_BG.glowLeft}, transparent 50%)`,
        }}
      />

      <div className="relative grid w-full items-center gap-10 px-4 py-10 sm:gap-12 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-14 xl:py-16">
        <div className="relative min-w-0 pl-2 text-left sm:pl-4 lg:pl-6">
          <div
            className="pointer-events-none absolute -left-4 top-1/2 -z-10 h-48 w-48 -translate-y-1/2 rounded-full bg-brand-rose/20 blur-2xl sm:h-56 sm:w-56"
            aria-hidden
          />

          <h2
            id="store-info-heading"
            className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
          >
            เติมเกมออนไลน์
            <br />
            <span className="text-primary">Harmony TopUp</span>
          </h2>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            บริการเติมเกมออนไลน์ Identity V บริการรวดเร็ว ปลอดภัย ราคาคุ้ม
            — เปิดร้านทุกวัน{" "}
            <span className="font-semibold text-foreground">10:00 – 22:00 น.</span>
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            รับชำระผ่านทุกธนาคาร และ TrueMoney Wallet
            สำหรับทรูมันนี่ วอลเลทฟรีค่าธรรมเนียมสำหรับบัญชีที่ยืนยันตัวตนแล้ว
            สั่งซื้อและสอบถามได้ทาง Facebook
          </p>

          <a
            href={STORE_FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full border-2 border-brand-rose bg-white px-8 text-base font-semibold text-foreground shadow-[0_0_18px_rgba(214,146,164,0.35)] transition hover:border-primary hover:shadow-[0_0_24px_rgba(214,146,164,0.5)] sm:mt-10"
          >
            อ่านเพิ่มเติม
          </a>
        </div>

        <StoreVisual />
      </div>
    </section>
  );
}
