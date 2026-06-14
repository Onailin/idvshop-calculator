import { cn } from "@/lib/utils";

export const PAGE_CONTAINER_CLASS =
  "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

/** หน้า Home — กว้างขึ้น ใช้พื้นที่จอได้มากขึ้น */
export const HOME_CONTAINER_CLASS =
  "mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12 xl:px-16";

/** หน้าคำนวณ — กว้างกว่าหน้าทั่วไป ใช้พื้นที่จอได้มากขึ้น */
export const CALCULATOR_CONTAINER_CLASS =
  "mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12 xl:px-16";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main" | "section";
  variant?: "default" | "home" | "calculator";
};

export function PageContainer({
  children,
  className,
  as: Component = "div",
  variant = "default",
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        variant === "home"
          ? HOME_CONTAINER_CLASS
          : variant === "calculator"
            ? CALCULATOR_CONTAINER_CLASS
            : PAGE_CONTAINER_CLASS,
        className,
      )}
    >
      {children}
    </Component>
  );
}
