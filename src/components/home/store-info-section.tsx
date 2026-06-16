import { cn } from "@/lib/utils";

const STORE_CHIBI_IMAGE = "/home/chibi.png";

const STORE_FACEBOOK_URL =
  "https://www.facebook.com/harmonytopup?locale=th_TH";

const STORE_LINE_URL = "https://line.me/R/ti/p/@164cuhjp";

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
      className="relative mx-auto flex min-h-[240px] w-full max-w-sm items-center justify-center sm:min-h-[280px] lg:max-w-md"
      aria-hidden
    >
      <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-rose/25 blur-[70px] sm:h-64 sm:w-64" />

      {/* eslint-disable-next-line @next/next/no-img-element -- local asset */}
      <img
        src={STORE_CHIBI_IMAGE}
        alt=""
        className="relative z-10 h-auto w-44 object-contain drop-shadow-[0_10px_28px_rgba(214,146,164,0.35)] sm:w-52 lg:w-60"
      />
    </div>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

const SOCIAL_BUTTON_CLASS =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-base font-semibold text-white shadow-md transition hover:brightness-110 hover:shadow-lg sm:px-8";

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
            <span className="text-primary">Harmony TopUp</span>
            <br />
            บริการเติมเกมออนไลน์
            
            
          </h2>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
            บริการเติมเกมออนไลน์ Identity V บริการรวดเร็ว ปลอดภัย ราคาคุ้ม
            — เปิดร้านทุกวัน{" "}   
            <span className="font-semibold text-foreground">10:00 – 22:00 น.</span>
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            รับชำระเงินผ่านทุกธนาคาร และ TrueMoney Wallet สำหรับทรูมันนี่  <br />
            สำหรับทรูมันนี่ วอลเลท ฟรีค่าธรรมเนียมเฉพาะบัญชีที่ยืนยันตัวตนแล้ว (บัญชีขั้นสูง) <br />
            ลูกค้าสามารถสอบถาม/สั่งซื้อ ได้ทาง Facebook หรือ Line ร้าน      
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
            <a
              href={STORE_FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(SOCIAL_BUTTON_CLASS, "bg-[#1877F2]")}
            >
              <FacebookIcon className="h-5 w-5 shrink-0" />
              Facebook
            </a>
            <a
              href={STORE_LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(SOCIAL_BUTTON_CLASS, "bg-[#06C755]")}
            >
              <LineIcon className="h-5 w-5 shrink-0" />
              Line
            </a>
          </div>
        </div>

        <StoreVisual />
      </div>
    </section>
  );
}
