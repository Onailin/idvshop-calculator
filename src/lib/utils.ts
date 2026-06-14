import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBaht(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatButtons(count: number): string {
  return new Intl.NumberFormat("th-TH").format(count);
}

export function formatValuePerButton(value: number): string {
  return `${value.toFixed(3)} บาท/กระดุม`;
}

export function formatBahtInt(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
