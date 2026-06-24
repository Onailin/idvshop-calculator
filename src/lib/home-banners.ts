export type HomeBannerSlide = {
  id: string;
  /** วางไฟล์ใน public/banners/ แล้วอ้าง path เช่น /banners/hero.jpg */
  imageSrc?: string;
  alt: string;
  title?: string;
  subtitle?: string;
  href?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** ใช้เมื่อยังไม่มีรูป — class gradient ของ Tailwind */
  gradient?: string;
};

/** แบนเนอร์หลักหน้าแรก — รูปเดียว วางที่ public/banners/hero.jpg */
export const HOME_HERO_BANNER: HomeBannerSlide = {
  id: "hero",
  alt: "Harmony TopUp บริการเติมเกมออนไลน์",
  imageSrc: "/banners/harmonybanner.png",
  gradient: "from-primary/45 via-brand-rose/30 to-brand-blush/90",
};

/** รูปอัญมณีตกแต่งหัวข้อ — วางที่ public/home/gems.png */
export const HOME_GEM_DECORATION = {
  imageSrc: "/home/gems.png",
  width: 1200,
  height: 1200,
} as const;

/** รูปการ์ดคำนวณแพ็คสกิน — วางที่ public/home/calculator-skins.png */
export const HOME_CALCULATOR_SKINS_IMAGE = {
  alt: "คำนวณแพ็กเกจสกิน/ไอเท็ม",
  imageSrc: "/home/calculator-skins.png",
  width: 1792,
  height: 1792,
} as const;

/** รูปการ์ดคำนวณแพ็กเกจกระดุม — วางที่ public/home/calculato-butons.png */
export const HOME_CALCULATOR_BUTTONS_IMAGE = {
  alt: "คำนวณแพ็กเกจกระดุม",
  imageSrc: "/home/calculato-butons.png",
  width: 1792,
  height: 1792,
} as const;

/** แก้รายการนี้เมื่อมีอีเว้นต์ใหม่ — สำรองไว้ใช้ภายหลัง */
export const HOME_EVENT_SLIDES: HomeBannerSlide[] = [
  {
    id: "event-1",
    alt: "อีเว้นต์และโปรโมชัน",
    title: "อีเว้นต์ & โปรโมชัน",
    subtitle: "ใส่ภาพที่ public/banners/event-1.jpg",
    gradient: "from-primary/35 via-brand-blush/80 to-white",
  },
  {
    id: "event-2",
    alt: "แพ็กเกจคุ้ม",
    title: "หาแพ็กเกจที่คุ้มที่สุด",
    subtitle: "ใส่ภาพที่ public/banners/event-2.jpg",
    gradient: "from-brand-rose/25 via-primary/20 to-brand-cream",
  },
  {
    id: "event-3",
    alt: "คำนวณกระดุมสกิน",
    title: "คำนวณกระดุมสกิน",
    subtitle: "ใส่ภาพที่ public/banners/event-3.jpg",
    gradient: "from-brand-blush via-white to-primary/15",
  },
];

/** ระยะห่างระหว่างสไลด์ (ms) */
export const HOME_EVENT_INTERVAL_MS = 6000;

/** ความเร็ว animation เลื่อนซ้าย (ms) */
export const HOME_BANNER_SLIDE_DURATION_MS = 1200;
